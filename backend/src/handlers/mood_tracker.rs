use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Extension,
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::mood_tracker::{
    CreateMoodEntryRequest, MoodEntry, UpdateMoodEntryRequest, MoodStats,
};
use crate::models::user::User;

#[derive(serde::Deserialize)]
pub struct RecentQuery {
    #[serde(default = "default_limit")]
    limit: i64,
}

fn default_limit() -> i64 {
    7
}

pub async fn create(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Json(payload): Json<CreateMoodEntryRequest>,
) -> Result<Json<MoodEntry>, StatusCode> {
    // Validate stress level
    if payload.stress_level < 1 || payload.stress_level > 10 {
        return Err(StatusCode::BAD_REQUEST);
    }

    let mood_str = payload.mood.to_string();

    let entry = sqlx::query_as::<_, MoodEntry>(
        r#"
        INSERT INTO mood_tracker (user_id, mood, stress_level, note, activities)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, mood, stress_level, note, activities, created_at, updated_at
        "#,
    )
    .bind(user.id)
    .bind(mood_str)
    .bind(payload.stress_level)
    .bind(payload.note)
    .bind(payload.activities)
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(entry))
}

pub async fn list(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
) -> Result<Json<Vec<MoodEntry>>, StatusCode> {
    let entries = sqlx::query_as::<_, MoodEntry>(
        r#"
        SELECT id, user_id, mood, stress_level, note, activities, created_at, updated_at
        FROM mood_tracker
        WHERE user_id = $1
        ORDER BY created_at DESC
        "#,
    )
    .bind(user.id)
    .fetch_all(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(entries))
}

pub async fn get_recent(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Query(params): Query<RecentQuery>,
) -> Result<Json<Vec<MoodEntry>>, StatusCode> {
    let entries = sqlx::query_as::<_, MoodEntry>(
        r#"
        SELECT id, user_id, mood, stress_level, note, activities, created_at, updated_at
        FROM mood_tracker
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
        "#,
    )
    .bind(user.id)
    .bind(params.limit)
    .fetch_all(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(entries))
}

pub async fn get_by_id(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Path(id): Path<Uuid>,
) -> Result<Json<MoodEntry>, StatusCode> {
    let entry = sqlx::query_as::<_, MoodEntry>(
        r#"
        SELECT id, user_id, mood, stress_level, note, activities, created_at, updated_at
        FROM mood_tracker
        WHERE id = $1 AND user_id = $2
        "#,
    )
    .bind(id)
    .bind(user.id)
    .fetch_one(&pool)
    .await
    .map_err(|e| match e {
        sqlx::Error::RowNotFound => StatusCode::NOT_FOUND,
        _ => StatusCode::INTERNAL_SERVER_ERROR,
    })?;

    Ok(Json(entry))
}

pub async fn get_stats(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
) -> Result<Json<MoodStats>, StatusCode> {
    let stats = sqlx::query_as::<_, MoodStats>(
        r#"
        WITH recent_week AS (
            SELECT *
            FROM mood_tracker
            WHERE user_id = $1
            AND created_at >= NOW() - INTERVAL '7 days'
        )
        SELECT
            COALESCE(AVG(stress_level), 0)::FLOAT8 as average_stress,
            COALESCE(
                (SELECT mood
                 FROM mood_tracker
                 WHERE user_id = $1
                 GROUP BY mood
                 ORDER BY COUNT(*) DESC
                 LIMIT 1),
                'okay'
            ) as most_common_mood,
            COUNT(*)::BIGINT as total_entries,
            (SELECT COUNT(*)::BIGINT FROM recent_week) as entries_this_week
        FROM mood_tracker
        WHERE user_id = $1
        "#,
    )
    .bind(user.id)
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(stats))
}

pub async fn update(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateMoodEntryRequest>,
) -> Result<Json<MoodEntry>, StatusCode> {
    // Validate stress level if provided
    if let Some(level) = payload.stress_level {
        if level < 1 || level > 10 {
            return Err(StatusCode::BAD_REQUEST);
        }
    }

    // Build dynamic update query
    let mut query = String::from("UPDATE mood_tracker SET updated_at = NOW()");
    let mut param_count = 3; // Start from $3 (id is $1, user_id is $2)

    if payload.mood.is_some() {
        query.push_str(&format!(", mood = ${}", param_count));
        param_count += 1;
    }
    if payload.stress_level.is_some() {
        query.push_str(&format!(", stress_level = ${}", param_count));
        param_count += 1;
    }
    if payload.note.is_some() {
        query.push_str(&format!(", note = ${}", param_count));
        param_count += 1;
    }
    if payload.activities.is_some() {
        query.push_str(&format!(", activities = ${}", param_count));
    }

    query.push_str(" WHERE id = $1 AND user_id = $2 RETURNING id, user_id, mood, stress_level, note, activities, created_at, updated_at");

    let mut query_builder = sqlx::query_as::<_, MoodEntry>(&query)
        .bind(id)
        .bind(user.id);

    if let Some(mood) = payload.mood {
        query_builder = query_builder.bind(mood.to_string());
    }
    if let Some(level) = payload.stress_level {
        query_builder = query_builder.bind(level);
    }
    if let Some(note) = payload.note {
        query_builder = query_builder.bind(note);
    }
    if let Some(activities) = payload.activities {
        query_builder = query_builder.bind(activities);
    }

    let entry = query_builder
        .fetch_one(&pool)
        .await
        .map_err(|e| match e {
            sqlx::Error::RowNotFound => StatusCode::NOT_FOUND,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        })?;

    Ok(Json(entry))
}

pub async fn delete(
    State(pool): State<PgPool>,
    Extension(user): Extension<User>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    let result = sqlx::query(
        r#"
        DELETE FROM mood_tracker
        WHERE id = $1 AND user_id = $2
        "#,
    )
    .bind(id)
    .bind(user.id)
    .execute(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(StatusCode::NO_CONTENT)
}
