use axum::{extract::{Path, State}, http::StatusCode, Json};
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::mental_box::{CreateMentalBoxRequest, MentalBoxEntry, UpdateMentalBoxRequest};

pub async fn create(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateMentalBoxRequest>,
) -> Result<Json<MentalBoxEntry>, StatusCode> {
    // Placeholder
    Err(StatusCode::NOT_IMPLEMENTED)
}

pub async fn list(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<MentalBoxEntry>>, StatusCode> {
    // Placeholder
    Ok(Json(vec![]))
}

pub async fn get_by_id(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<MentalBoxEntry>, StatusCode> {
    // Placeholder
    Err(StatusCode::NOT_IMPLEMENTED)
}

pub async fn update(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateMentalBoxRequest>,
) -> Result<Json<MentalBoxEntry>, StatusCode> {
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
