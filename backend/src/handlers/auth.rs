use axum::{extract::State, http::StatusCode, Json};
use sqlx::PgPool;

use crate::models::user::{AuthResponse, CreateUserRequest, LoginRequest};
use crate::services::auth_service;

pub async fn register(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<Json<AuthResponse>, StatusCode> {
    auth_service::register_user(&pool, payload)
        .await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

pub async fn login(
    State(pool): State<PgPool>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, StatusCode> {
    auth_service::login_user(&pool, payload)
        .await
        .map(Json)
        .map_err(|_| StatusCode::UNAUTHORIZED)
}

pub async fn me(
    State(pool): State<PgPool>,
) -> Result<Json<String>, StatusCode> {
    // This will be implemented with auth middleware
    Ok(Json("User info".to_string()))
}
