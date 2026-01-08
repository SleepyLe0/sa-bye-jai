use axum::{
    extract::{Request, State},
    http::{HeaderMap, StatusCode},
    middleware::Next,
    response::Response,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::user::User;
use crate::utils::jwt;

pub async fn auth_middleware(
    State(pool): State<PgPool>,
    headers: HeaderMap,
    mut request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    // Extract token from Authorization header
    let token = headers
        .get("Authorization")
        .and_then(|value| value.to_str().ok())
        .and_then(|value| {
            if value.starts_with("Bearer ") {
                Some(&value[7..])
            } else {
                None
            }
        })
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // Verify token and extract claims
    let claims = jwt::verify_token(token).map_err(|_| StatusCode::UNAUTHORIZED)?;

    // Parse user_id from claims
    let user_id = Uuid::parse_str(&claims.sub).map_err(|_| StatusCode::UNAUTHORIZED)?;

    // Fetch user from database
    let user = sqlx::query_as::<_, User>(
        r#"
        SELECT id, email, password_hash, username, preferred_language, preferred_theme, created_at, updated_at
        FROM users
        WHERE id = $1
        "#,
    )
    .bind(user_id)
    .fetch_optional(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .ok_or(StatusCode::UNAUTHORIZED)?;

    // Insert user into request extensions
    request.extensions_mut().insert(user);

    // Continue to the handler
    Ok(next.run(request).await)
}
