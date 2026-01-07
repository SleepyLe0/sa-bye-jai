mod config;
mod database;
mod handlers;
mod middleware;
mod models;
mod services;
mod utils;

use axum::{
    routing::{get, post},
    Router,
};
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    // Load environment variables
    dotenv::dotenv().ok();

    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "sabyejai_backend=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Database connection pool
    let pool = database::connection::create_pool().await;

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build router
    let app = Router::new()
        .route("/health", get(health_check))
        // Auth routes
        .route("/api/auth/register", post(handlers::auth::register))
        .route("/api/auth/login", post(handlers::auth::login))
        .route("/api/auth/me", get(handlers::auth::me))
        // Mental box routes (protected)
        .route(
            "/api/mental-box",
            get(handlers::mental_box::list).post(handlers::mental_box::create),
        )
        .route(
            "/api/mental-box/:id",
            get(handlers::mental_box::get_by_id)
                .put(handlers::mental_box::update)
                .delete(handlers::mental_box::delete),
        )
        // Worry window routes (protected)
        .route(
            "/api/worry-window",
            get(handlers::worry_window::list).post(handlers::worry_window::create),
        )
        .route(
            "/api/worry-window/:id",
            get(handlers::worry_window::get_by_id)
                .put(handlers::worry_window::update)
                .delete(handlers::worry_window::delete),
        )
        .route("/api/worry-window/today", get(handlers::worry_window::get_today))
        .layer(cors)
        .with_state(pool);

    // Start server
    let host = std::env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = std::env::var("SERVER_PORT").unwrap_or_else(|_| "8000".to_string());
    let addr = format!("{}:{}", host, port);

    tracing::info!("Server running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> &'static str {
    "OK"
}
