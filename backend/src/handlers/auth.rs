use axum::{
    extract::State,
    http::{header, HeaderMap, StatusCode},
    Extension, Json,
};
use sqlx::PgPool;

use crate::models::user::{AuthResponse, CreateUserRequest, LoginRequest, User};
use crate::services::auth_service;

fn create_refresh_token_cookie(refresh_token: &str) -> String {
    // Create HTTP-only secure cookie
    // Max-Age: 7 days in seconds
    format!(
        "refresh_token={}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800",
        refresh_token
    )
}

fn create_cookie_removal() -> String {
    "refresh_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0".to_string()
}

pub async fn register(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<(HeaderMap, Json<AuthResponse>), StatusCode> {
    let auth_response = auth_service::register_user(&pool, payload)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Set refresh token as HTTP-only cookie
    let mut headers = HeaderMap::new();
    headers.insert(
        header::SET_COOKIE,
        create_refresh_token_cookie(&auth_response.refresh_token)
            .parse()
            .unwrap(),
    );

    Ok((headers, Json(auth_response)))
}

pub async fn login(
    State(pool): State<PgPool>,
    Json(payload): Json<LoginRequest>,
) -> Result<(HeaderMap, Json<AuthResponse>), StatusCode> {
    let auth_response = auth_service::login_user(&pool, payload)
        .await
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    // Set refresh token as HTTP-only cookie
    let mut headers = HeaderMap::new();
    headers.insert(
        header::SET_COOKIE,
        create_refresh_token_cookie(&auth_response.refresh_token)
            .parse()
            .unwrap(),
    );

    Ok((headers, Json(auth_response)))
}

pub async fn refresh(
    State(pool): State<PgPool>,
    headers: HeaderMap,
) -> Result<(HeaderMap, Json<AuthResponse>), StatusCode> {
    // Extract refresh token from cookie
    let refresh_token = headers
        .get(header::COOKIE)
        .and_then(|value| value.to_str().ok())
        .and_then(|cookies| {
            cookies
                .split(';')
                .find(|cookie| cookie.trim().starts_with("refresh_token="))
                .map(|cookie| cookie.trim().strip_prefix("refresh_token=").unwrap_or(""))
        })
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let auth_response = auth_service::refresh_access_token(&pool, refresh_token)
        .await
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    // Set new refresh token as HTTP-only cookie
    let mut response_headers = HeaderMap::new();
    response_headers.insert(
        header::SET_COOKIE,
        create_refresh_token_cookie(&auth_response.refresh_token)
            .parse()
            .unwrap(),
    );

    Ok((response_headers, Json(auth_response)))
}

pub async fn logout(
    State(pool): State<PgPool>,
    headers: HeaderMap,
) -> Result<(HeaderMap, StatusCode), StatusCode> {
    // Extract refresh token from cookie
    let refresh_token = headers
        .get(header::COOKIE)
        .and_then(|value| value.to_str().ok())
        .and_then(|cookies| {
            cookies
                .split(';')
                .find(|cookie| cookie.trim().starts_with("refresh_token="))
                .map(|cookie| cookie.trim().strip_prefix("refresh_token=").unwrap_or(""))
        });

    if let Some(token) = refresh_token {
        auth_service::revoke_refresh_token(&pool, token)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    // Clear refresh token cookie
    let mut response_headers = HeaderMap::new();
    response_headers.insert(
        header::SET_COOKIE,
        create_cookie_removal().parse().unwrap(),
    );

    Ok((response_headers, StatusCode::NO_CONTENT))
}

pub async fn me(Extension(user): Extension<User>) -> Result<Json<User>, StatusCode> {
    Ok(Json(user))
}
