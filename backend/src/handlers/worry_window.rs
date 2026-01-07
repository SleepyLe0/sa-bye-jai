use axum::{extract::{Path, State}, http::StatusCode, Json};
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::worry_window::{CreateWorryWindowRequest, UpdateWorryWindowRequest, WorryWindow};

pub async fn create(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateWorryWindowRequest>,
) -> Result<Json<WorryWindow>, StatusCode> {
    // Placeholder
    Err(StatusCode::NOT_IMPLEMENTED)
}

pub async fn list(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<WorryWindow>>, StatusCode> {
    // Placeholder
    Ok(Json(vec![]))
}

pub async fn get_by_id(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<WorryWindow>, StatusCode> {
    // Placeholder
    Err(StatusCode::NOT_IMPLEMENTED)
}

pub async fn update(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateWorryWindowRequest>,
) -> Result<Json<WorryWindow>, StatusCode> {
    // Placeholder
    Err(StatusCode::NOT_IMPLEMENTED)
}

pub async fn delete(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    // Placeholder
    Err(StatusCode::NOT_IMPLEMENTED)
}

pub async fn get_today(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<WorryWindow>>, StatusCode> {
    // Placeholder
    Ok(Json(vec![]))
}
