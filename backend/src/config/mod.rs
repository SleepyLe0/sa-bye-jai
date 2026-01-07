use std::env;

#[derive(Clone)]
pub struct Config {
    pub database_url: String,
    pub jwt_secret: String,
    pub jwt_expiration: i64,
    pub refresh_token_expiration: i64,
    pub server_host: String,
    pub server_port: String,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            database_url: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
            jwt_secret: env::var("JWT_SECRET").expect("JWT_SECRET must be set"),
            jwt_expiration: env::var("JWT_EXPIRATION")
                .unwrap_or_else(|_| "900".to_string())
                .parse()
                .expect("JWT_EXPIRATION must be a number"),
            refresh_token_expiration: env::var("REFRESH_TOKEN_EXPIRATION")
                .unwrap_or_else(|_| "604800".to_string())
                .parse()
                .expect("REFRESH_TOKEN_EXPIRATION must be a number"),
            server_host: env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string()),
            server_port: env::var("SERVER_PORT").unwrap_or_else(|_| "8000".to_string()),
        }
    }
}
