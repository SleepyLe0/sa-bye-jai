use sqlx::PgPool;

use crate::models::user::{AuthResponse, CreateUserRequest, LoginRequest, User};
use crate::utils::{jwt, password};

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

    // Generate JWT token
    let token = jwt::generate_token(user.id)?;

    Ok(AuthResponse { user, token })
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

    // Generate JWT token
    let token = jwt::generate_token(user.id)?;

    Ok(AuthResponse { user, token })
}
