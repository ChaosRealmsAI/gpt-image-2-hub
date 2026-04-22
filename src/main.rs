use axum::{
    extract::Path,
    http::{header, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{fs, sync::OnceLock};
use tokio::net::TcpListener;
use tower_http::services::ServeDir;

static APIMART_KEY: OnceLock<String> = OnceLock::new();

const APIMART_BASE: &str = "https://api.apimart.ai/v1";

#[derive(Deserialize)]
struct RemixRequest {
    image_id: String,
    subject: String,
    aspect: Option<String>,
}

#[derive(Serialize)]
struct RemixResponse {
    task_id: Option<String>,
    error: Option<String>,
    friendly_message: Option<String>,
}

#[derive(Serialize)]
struct RemixPollResponse {
    status: String,
    image_url: Option<String>,
    error: Option<String>,
    friendly_message: Option<String>,
}

async fn health() -> Json<Value> {
    Json(json!({ "status": "ok", "version": "v0.1" }))
}

async fn images() -> impl IntoResponse {
    match fs::read_to_string("data/images.json") {
        Ok(body) => (
            StatusCode::OK,
            [(header::CONTENT_TYPE, "application/json; charset=utf-8")],
            body,
        )
            .into_response(),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            [(header::CONTENT_TYPE, "application/json; charset=utf-8")],
            json!({
                "error": "failed_to_read_images_json",
                "message": err.to_string()
            })
            .to_string(),
        )
            .into_response(),
    }
}

async fn remix_submit(Json(req): Json<RemixRequest>) -> (StatusCode, Json<RemixResponse>) {
    let subject = req.subject.trim();
    if subject.is_empty() {
        return remix_error(
            StatusCode::BAD_REQUEST,
            "empty_subject",
            "先输入你想生成的主题",
        );
    }
    if subject.chars().count() > 50 {
        return remix_error(
            StatusCode::BAD_REQUEST,
            "subject_too_long",
            "主题太长了 · 控制在 50 字以内",
        );
    }

    let images_raw = match fs::read_to_string("data/images.json") {
        Ok(raw) => raw,
        Err(err) => {
            return remix_error(
                StatusCode::INTERNAL_SERVER_ERROR,
                &format!("failed_to_read_images_json: {err}"),
                "图库数据读取失败 · 稍后再试",
            );
        }
    };
    let images_json: Value = match serde_json::from_str(&images_raw) {
        Ok(value) => value,
        Err(err) => {
            return remix_error(
                StatusCode::INTERNAL_SERVER_ERROR,
                &format!("failed_to_parse_images_json: {err}"),
                "图库数据格式异常 · 稍后再试",
            );
        }
    };
    let image = match images_json
        .get("images")
        .and_then(Value::as_array)
        .and_then(|images| {
            images.iter().find(|image| {
                image.get("id").and_then(Value::as_str) == Some(req.image_id.as_str())
            })
        }) {
        Some(image) => image,
        None => {
            return remix_error(
                StatusCode::NOT_FOUND,
                "image_not_found",
                "没找到这个参考风格 · 换一张试试",
            );
        }
    };

    let aspect = req
        .aspect
        .as_deref()
        .or_else(|| image.get("aspect").and_then(Value::as_str))
        .unwrap_or("1:1");
    let composed_prompt = compose_remix_prompt(image, subject);
    let body = json!({
        "model": "gpt-image-2",
        "prompt": composed_prompt,
        "n": 1,
        "size": aspect_to_size(aspect),
        "quality": "high"
    });

    let key = match APIMART_KEY.get().filter(|key| !key.is_empty()) {
        Some(key) => key,
        None => {
            return remix_error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "missing_apimart_key",
                "生成服务暂未配置 · 稍后再试",
            );
        }
    };

    let client = reqwest::Client::new();
    let response = match client
        .post(format!("{APIMART_BASE}/images/generations"))
        .bearer_auth(key)
        .json(&body)
        .send()
        .await
    {
        Ok(response) => response,
        Err(err) => {
            return remix_error(
                StatusCode::BAD_GATEWAY,
                &format!("apimart_submit_network_error: {err}"),
                "生成服务连接失败 · 稍后再试",
            );
        }
    };

    let status = response.status();
    let response_json: Value = match response.json().await {
        Ok(value) => value,
        Err(err) => {
            return remix_error(
                StatusCode::BAD_GATEWAY,
                &format!("apimart_submit_invalid_json: {err}"),
                "生成服务返回异常 · 稍后再试",
            );
        }
    };

    if !status.is_success() || response_json.get("error").is_some() {
        let message = api_error_message(&response_json);
        let friendly = friendly_api_message(&message);
        return (
            status,
            Json(RemixResponse {
                task_id: None,
                error: Some(message),
                friendly_message: Some(friendly),
            }),
        );
    }

    let task_id = response_json
        .pointer("/data/0/task_id")
        .and_then(Value::as_str)
        .or_else(|| response_json.get("task_id").and_then(Value::as_str));

    match task_id {
        Some(task_id) => (
            StatusCode::ACCEPTED,
            Json(RemixResponse {
                task_id: Some(task_id.to_string()),
                error: None,
                friendly_message: None,
            }),
        ),
        None => remix_error(
            StatusCode::BAD_GATEWAY,
            &format!("apimart_submit_missing_task_id: {response_json}"),
            "生成任务创建失败 · 再试一次",
        ),
    }
}

async fn remix_poll(Path(task_id): Path<String>) -> (StatusCode, Json<RemixPollResponse>) {
    let key = match APIMART_KEY.get().filter(|key| !key.is_empty()) {
        Some(key) => key,
        None => {
            return poll_error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "missing_apimart_key",
                "生成服务暂未配置 · 稍后再试",
            );
        }
    };

    let client = reqwest::Client::new();
    let response = match client
        .get(format!("{APIMART_BASE}/tasks/{task_id}"))
        .bearer_auth(key)
        .send()
        .await
    {
        Ok(response) => response,
        Err(err) => {
            return poll_error(
                StatusCode::BAD_GATEWAY,
                &format!("apimart_poll_network_error: {err}"),
                "生成服务连接失败 · 稍后再试",
            );
        }
    };

    let status_code = response.status();
    let response_json: Value = match response.json().await {
        Ok(value) => value,
        Err(err) => {
            return poll_error(
                StatusCode::BAD_GATEWAY,
                &format!("apimart_poll_invalid_json: {err}"),
                "生成服务返回异常 · 稍后再试",
            );
        }
    };

    if !status_code.is_success() || response_json.get("error").is_some() {
        let message = api_error_message(&response_json);
        let friendly = friendly_api_message(&message);
        return (
            status_code,
            Json(RemixPollResponse {
                status: "failed".to_string(),
                image_url: None,
                error: Some(message),
                friendly_message: Some(friendly),
            }),
        );
    }

    let data = response_json.get("data").unwrap_or(&response_json);
    let status = data
        .get("status")
        .and_then(Value::as_str)
        .unwrap_or("processing")
        .to_string();
    let image_url = extract_image_url(data);
    let failed = status.eq_ignore_ascii_case("failed");
    let friendly_message = if failed {
        Some(friendly_api_message(&api_error_message(data)))
    } else {
        None
    };

    (
        StatusCode::OK,
        Json(RemixPollResponse {
            status,
            image_url,
            error: if failed {
                Some(api_error_message(data))
            } else {
                None
            },
            friendly_message,
        }),
    )
}

fn remix_error(
    status: StatusCode,
    error: &str,
    friendly_message: &str,
) -> (StatusCode, Json<RemixResponse>) {
    (
        status,
        Json(RemixResponse {
            task_id: None,
            error: Some(error.to_string()),
            friendly_message: Some(friendly_message.to_string()),
        }),
    )
}

fn poll_error(
    status: StatusCode,
    error: &str,
    friendly_message: &str,
) -> (StatusCode, Json<RemixPollResponse>) {
    (
        status,
        Json(RemixPollResponse {
            status: "failed".to_string(),
            image_url: None,
            error: Some(error.to_string()),
            friendly_message: Some(friendly_message.to_string()),
        }),
    )
}

fn compose_remix_prompt(image: &Value, subject: &str) -> String {
    let atoms = image.get("atoms").unwrap_or(&Value::Null);
    let style_signatures = string_array(atoms.get("style_signatures"))
        .or_else(|| string_array(image.get("tags")))
        .unwrap_or_else(|| {
            vec![string_value(image.get("style")).unwrap_or_else(|| "cinematic".to_string())]
        })
        .join(", ");
    let original_scene = string_value(atoms.get("subject"))
        .or_else(|| first_prompt_paragraph(image.get("prompt").and_then(Value::as_str)))
        .unwrap_or_else(|| "a clean, coherent scene matching the reference image".to_string());
    let color_palette = string_array(atoms.get("color_palette"))
        .map(|items| items.join(", "))
        .unwrap_or_else(|| "use the original image color palette".to_string());
    let lighting = string_value(atoms.get("lighting"))
        .unwrap_or_else(|| "preserve the original lighting mood".to_string());
    let exclude = string_array(atoms.get("exclude"))
        .map(|items| items.join(", "))
        .unwrap_or_else(|| {
            "watermarks, extra text, brand logos, distorted anatomy, low quality".to_string()
        });

    format!(
        "A {subject} in the style of {style_signatures}.\n\
background: {original_scene}\n\
color_palette: {color_palette}\n\
lighting: {lighting}\n\
exclude: {exclude}\n\
Render one high-quality image. Keep the referenced visual style, atmosphere, composition discipline, and palette, but replace the original subject with the user's subject."
    )
}

fn aspect_to_size(aspect: &str) -> String {
    let normalized = aspect.trim().replace('/', ":");
    match normalized.as_str() {
        "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "3:2" | "2:3" | "5:4" | "4:5" | "2:1" | "1:2"
        | "21:9" | "9:21" => normalized,
        _ => "1:1".to_string(),
    }
}

fn string_value(value: Option<&Value>) -> Option<String> {
    value
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToOwned::to_owned)
}

fn string_array(value: Option<&Value>) -> Option<Vec<String>> {
    let values: Vec<String> = value?
        .as_array()?
        .iter()
        .filter_map(Value::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToOwned::to_owned)
        .collect();
    if values.is_empty() {
        None
    } else {
        Some(values)
    }
}

fn first_prompt_paragraph(prompt: Option<&str>) -> Option<String> {
    prompt?
        .split("\n\n")
        .map(str::trim)
        .find(|part| !part.is_empty())
        .map(|part| part.chars().take(700).collect())
}

fn api_error_message(value: &Value) -> String {
    value
        .pointer("/error/message")
        .and_then(Value::as_str)
        .or_else(|| value.get("message").and_then(Value::as_str))
        .or_else(|| value.pointer("/error/code").and_then(Value::as_str))
        .map(ToOwned::to_owned)
        .unwrap_or_else(|| value.to_string())
}

fn friendly_api_message(message: &str) -> String {
    let lower = message.to_ascii_lowercase();
    if lower.contains("content_policy")
        || lower.contains("moderation")
        || lower.contains("policy")
        || lower.contains("safety")
    {
        "主题可能触发安全策略 · 换个词试试".to_string()
    } else if lower.contains("auth")
        || lower.contains("unauthorized")
        || lower.contains("invalid api key")
    {
        "生成服务鉴权失败 · 检查 APIMART_KEY".to_string()
    } else {
        "生成失败 · 换个词试试".to_string()
    }
}

fn extract_image_url(data: &Value) -> Option<String> {
    data.pointer("/result/images/0/url/0")
        .and_then(Value::as_str)
        .or_else(|| data.pointer("/result/images/0/url").and_then(Value::as_str))
        .or_else(|| data.pointer("/images/0/url/0").and_then(Value::as_str))
        .or_else(|| data.pointer("/images/0/url").and_then(Value::as_str))
        .map(ToOwned::to_owned)
}

#[tokio::main]
async fn main() {
    dotenvy::from_path(".env").ok();
    APIMART_KEY
        .set(std::env::var("APIMART_KEY").unwrap_or_default())
        .ok();

    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/images", get(images))
        .route("/api/remix", post(remix_submit))
        .route("/api/remix/:task_id", get(remix_poll))
        .nest_service("/assets", ServeDir::new("assets"))
        .fallback_service(ServeDir::new("frontend"));
    let listener = TcpListener::bind("127.0.0.1:3000").await.unwrap();

    println!("Prompt Atlas v0.1 · listening on http://127.0.0.1:3000");

    axum::serve(listener, app).await.unwrap();
}
