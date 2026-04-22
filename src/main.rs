use axum::{
    http::{header, StatusCode},
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use serde_json::{json, Value};
use std::fs;
use tokio::net::TcpListener;
use tower_http::services::ServeDir;

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

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/images", get(images))
        .nest_service("/assets", ServeDir::new("assets"))
        .fallback_service(ServeDir::new("frontend"));
    let listener = TcpListener::bind("127.0.0.1:3000").await.unwrap();

    println!("Prompt Atlas v0.1 · listening on http://127.0.0.1:3000");

    axum::serve(listener, app).await.unwrap();
}
