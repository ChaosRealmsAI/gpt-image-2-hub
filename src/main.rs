use axum::{routing::get, Json, Router};
use serde_json::{json, Value};
use tokio::net::TcpListener;
use tower_http::services::ServeDir;

async fn health() -> Json<Value> {
    Json(json!({ "status": "ok", "version": "v0.1" }))
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/api/health", get(health))
        .fallback_service(ServeDir::new("frontend"));
    let listener = TcpListener::bind("127.0.0.1:3000").await.unwrap();

    println!("Prompt Atlas v0.1 · listening on http://127.0.0.1:3000");

    axum::serve(listener, app).await.unwrap();
}
