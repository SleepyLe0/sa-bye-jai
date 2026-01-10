use axum::Json;
use serde::Serialize;
use std::env;

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    config: ConfigSummary,
}

#[derive(Serialize)]
struct ConfigSummary {
    cors_configured: bool,
    cors_origin: String,
    port: String,
    env: String,
}

async fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        config: ConfigSummary {
            frontend_url: env::var("FRONTEND_URL").unwrap_or_else(|_| "NOT SET".to_string()),
        },
    })
}