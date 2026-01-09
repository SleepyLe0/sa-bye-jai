use sqlx::PgPool;
use chrono::{DateTime, Duration, Utc};
use uuid::Uuid;

use crate::models::user::{AuthResponse, CreateUserRequest, LoginRequest, User};
use crate::utils::{jwt, password};

async fn store_refresh_token(
    pool: &PgPool,
    user_id: Uuid,
    refresh_token: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    // Calculate expiration (7 days from now)
    let expires_at = Utc::now() + Duration::days(7);

    // Store refresh token in database
    sqlx::query(
        r#"
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
        "#,
    )
    .bind(user_id)
    .bind(refresh_token)
    .bind(expires_at)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn register_user(
    pool: &PgPool,
    payload: CreateUserRequest,
) -> Result<AuthResponse, Box<dyn std::error::Error>> {
    // Hash password
    let password_hash = password::hash_password(&payload.password)?;

    // Insert user into database
    let user = sqlx::query_as::<_, User>(
        r#"
        INSERT INTO users (email, password_hash, username, preferred_language, preferred_theme)
        VALUES ($1, $2, $3, 'en', 'light')
        RETURNING *
        "#,
    )
    .bind(&payload.email)
    .bind(&password_hash)
    .bind(&payload.username)
    .fetch_one(pool)
    .await?;

    // Generate JWT tokens
    let token = jwt::generate_token(user.id)?;
    let refresh_token = jwt::generate_refresh_token(user.id)?;

    // Store refresh token
    store_refresh_token(pool, user.id, &refresh_token).await?;

    Ok(AuthResponse { user, token, refresh_token })
}

pub async fn login_user(
    pool: &PgPool,
    payload: LoginRequest,
) -> Result<AuthResponse, Box<dyn std::error::Error>> {
    // Find user by email
    let user = sqlx::query_as::<_, User>(
        r#"
        SELECT * FROM users WHERE email = $1
        "#,
    )
    .bind(&payload.email)
    .fetch_optional(pool)
    .await?
    .ok_or("User not found")?;

    // Verify password
    let is_valid = password::verify_password(&payload.password, &user.password_hash)?;
    if !is_valid {
        return Err("Invalid password".into());
    }

    // Generate JWT tokens
    let token = jwt::generate_token(user.id)?;
    let refresh_token = jwt::generate_refresh_token(user.id)?;

    // Store refresh token
    store_refresh_token(pool, user.id, &refresh_token).await?;

    Ok(AuthResponse { user, token, refresh_token })
}

pub async fn refresh_access_token(
    pool: &PgPool,
    refresh_token: &str,
) -> Result<AuthResponse, Box<dyn std::error::Error>> {
    // Verify refresh token
    let claims = jwt::verify_refresh_token(refresh_token)?;
    let user_id = Uuid::parse_str(&claims.sub)?;

    // Check if refresh token exists and is not revoked
    let token_record: Option<(bool, DateTime<Utc>)> = sqlx::query_as(
        r#"
        SELECT revoked, expires_at FROM refresh_tokens
        WHERE token = $1 AND user_id = $2
        "#,
    )
    .bind(refresh_token)
    .bind(user_id)
    .fetch_optional(pool)
    .await?;

    match token_record {
        Some((revoked, expires_at)) => {
            if revoked {
                return Err("Refresh token has been revoked".into());
            }
            if expires_at < Utc::now() {
                return Err("Refresh token has expired".into());
            }
        }
        None => return Err("Invalid refresh token".into()),
    }

    // Get user from database
    let user = sqlx::query_as::<_, User>(
        r#"
        SELECT * FROM users WHERE id = $1
        "#,
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await?
    .ok_or("User not found")?;

    // Generate new tokens (token rotation)
    let new_token = jwt::generate_token(user.id)?;
    let new_refresh_token = jwt::generate_refresh_token(user.id)?;

    // Revoke old refresh token
    sqlx::query(
        r#"
        UPDATE refresh_tokens
        SET revoked = TRUE, revoked_at = NOW()
        WHERE token = $1
        "#,
    )
    .bind(refresh_token)
    .execute(pool)
    .await?;

    // Store new refresh token
    store_refresh_token(pool, user.id, &new_refresh_token).await?;

    Ok(AuthResponse {
        user,
        token: new_token,
        refresh_token: new_refresh_token,
    })
}

pub async fn revoke_refresh_token(
    pool: &PgPool,
    refresh_token: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    sqlx::query(
        r#"
        UPDATE refresh_tokens
        SET revoked = TRUE, revoked_at = NOW()
        WHERE token = $1
        "#,
    )
    .bind(refresh_token)
    .execute(pool)
    .await?;

    Ok(())
}
