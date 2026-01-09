use axum::{extract::State, http::StatusCode, Extension, Json};
use sqlx::PgPool;

use crate::models::stress_reframe::{CreateReframeRequest, ReframeResponse, StressReframe};
use crate::models::user::User;
use crate::services::openrouter_service;

pub async fn create(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Json(payload): Json<CreateReframeRequest>,
) -> Result<Json<ReframeResponse>, StatusCode> {
    // Validate input
    if payload.original_thought.trim().is_empty() {
        return Err(StatusCode::BAD_REQUEST);
    }

    if payload.original_thought.len() > 1000 {
        return Err(StatusCode::BAD_REQUEST);
    }

    // Check if a reframe already exists for this mental_box_id (cache check)
    if let Some(mental_box_id) = payload.mental_box_id {
        let existing_reframe = sqlx::query_as::<_, StressReframe>(
            r#"
            SELECT id, user_id, mental_box_id, original_thought, stoic_reframe, optimist_reframe, realist_reframe, created_at
            FROM stress_reframes
            WHERE mental_box_id = $1 AND user_id = $2
            ORDER BY created_at DESC
            LIMIT 1
            "#,
        )
        .bind(mental_box_id)
        .bind(user.id)
        .fetch_optional(&pool)
        .await
        .map_err(|e| {
            eprintln!("Database error checking existing reframe: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

        // If a reframe exists for this mental_box_id, return the cached result
        if let Some(reframe) = existing_reframe {
            return Ok(Json(ReframeResponse {
                id: reframe.id,
                mental_box_id: reframe.mental_box_id,
                original_thought: reframe.original_thought,
                stoic_reframe: reframe.stoic_reframe,
                optimist_reframe: reframe.optimist_reframe,
                realist_reframe: reframe.realist_reframe,
                created_at: reframe.created_at,
            }));
        }
    }

    // Generate reframes using AI (only if no cached result)
    let reframes = openrouter_service::generate_reframes(&payload.original_thought)
        .await
        .map_err(|e| {
            eprintln!("AI reframing error: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    // Store in database
    let reframe = sqlx::query_as::<_, StressReframe>(
        r#"
        INSERT INTO stress_reframes (user_id, mental_box_id, original_thought, stoic_reframe, optimist_reframe, realist_reframe)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, user_id, mental_box_id, original_thought, stoic_reframe, optimist_reframe, realist_reframe, created_at
        "#,
    )
    .bind(user.id)
    .bind(payload.mental_box_id)
    .bind(&payload.original_thought)
    .bind(&reframes.stoic)
    .bind(&reframes.optimist)
    .bind(&reframes.realist)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        eprintln!("Database error creating stress reframe: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(ReframeResponse {
        id: reframe.id,
        mental_box_id: reframe.mental_box_id,
        original_thought: reframe.original_thought,
        stoic_reframe: reframe.stoic_reframe,
        optimist_reframe: reframe.optimist_reframe,
        realist_reframe: reframe.realist_reframe,
        created_at: reframe.created_at,
    }))
}

pub async fn list(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
) -> Result<Json<Vec<StressReframe>>, StatusCode> {
    let reframes = sqlx::query_as::<_, StressReframe>(
        r#"
        SELECT id, user_id, mental_box_id, original_thought, stoic_reframe, optimist_reframe, realist_reframe, created_at
        FROM stress_reframes
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50
        "#,
    )
    .bind(user.id)
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        eprintln!("Database error listing stress reframes: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(reframes))
}
