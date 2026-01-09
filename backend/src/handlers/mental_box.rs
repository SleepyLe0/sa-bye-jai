use axum::{extract::{Path, State}, http::StatusCode, Extension, Json};
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::mental_box::{CreateMentalBoxRequest, MentalBoxEntry, UpdateMentalBoxRequest};
use crate::models::user::User;

pub async fn create(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Json(payload): Json<CreateMentalBoxRequest>,
) -> Result<Json<MentalBoxEntry>, StatusCode> {
    let entry = sqlx::query_as::<_, MentalBoxEntry>(
        r#"
        INSERT INTO mental_box_entries (user_id, title, content)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, title, content, created_at, updated_at
        "#,
    )
    .bind(user.id)
    .bind(&payload.title)
    .bind(&payload.content)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        eprintln!("Database error creating mental box entry: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(entry))
}

pub async fn list(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
) -> Result<Json<Vec<MentalBoxEntry>>, StatusCode> {
    let entries = sqlx::query_as::<_, MentalBoxEntry>(
        r#"
        SELECT id, user_id, title, content, created_at, updated_at
        FROM mental_box_entries
        WHERE user_id = $1
        ORDER BY created_at DESC
        "#,
    )
    .bind(user.id)
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        eprintln!("Database error listing mental box entries: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(entries))
}

pub async fn get_by_id(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Path(id): Path<Uuid>,
) -> Result<Json<MentalBoxEntry>, StatusCode> {
    let entry = sqlx::query_as::<_, MentalBoxEntry>(
        r#"
        SELECT id, user_id, title, content, created_at, updated_at
        FROM mental_box_entries
        WHERE id = $1 AND user_id = $2
        "#,
    )
    .bind(id)
    .bind(user.id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| {
        eprintln!("Database error getting mental box entry: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?
    .ok_or(StatusCode::NOT_FOUND)?;

    Ok(Json(entry))
}

pub async fn update(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateMentalBoxRequest>,
) -> Result<Json<MentalBoxEntry>, StatusCode> {
    // First verify the entry belongs to the user
    let existing = sqlx::query_as::<_, MentalBoxEntry>(
        r#"
        SELECT id, user_id, title, content, created_at, updated_at
        FROM mental_box_entries
        WHERE id = $1 AND user_id = $2
        "#,
    )
    .bind(id)
    .bind(user.id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| {
        eprintln!("Database error checking mental box entry: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?
    .ok_or(StatusCode::NOT_FOUND)?;

    // Build dynamic update query
    let mut query_parts = vec![];
    let mut bind_count = 1;

    let title = payload.title.unwrap_or(existing.title);
    let content = payload.content.unwrap_or(existing.content);

    query_parts.push(format!("title = ${}", bind_count));
    bind_count += 1;
    query_parts.push(format!("content = ${}", bind_count));
    bind_count += 1;

    let query = format!(
        r#"
        UPDATE mental_box_entries
        SET {}
        WHERE id = ${} AND user_id = ${}
        RETURNING id, user_id, title, content, created_at, updated_at
        "#,
        query_parts.join(", "),
        bind_count,
        bind_count + 1
    );

    let updated_entry = sqlx::query_as::<_, MentalBoxEntry>(&query)
        .bind(&title)
        .bind(&content)
        .bind(id)
        .bind(user.id)
        .fetch_one(&pool)
        .await
        .map_err(|e| {
            eprintln!("Database error updating mental box entry: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(Json(updated_entry))
}

pub async fn delete(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    let result = sqlx::query(
        r#"
        DELETE FROM mental_box_entries
        WHERE id = $1 AND user_id = $2
        "#,
    )
    .bind(id)
    .bind(user.id)
    .execute(&pool)
    .await
    .map_err(|e| {
        eprintln!("Database error deleting mental box entry: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(StatusCode::NO_CONTENT)
}
