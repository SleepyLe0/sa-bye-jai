mod config;
mod database;
mod handlers;
mod middleware;
mod models;
mod services;
mod utils;

use axum::{
    http::HeaderValue,
    routing::{get, post},
    Router,
};
use tower_http::cors::CorsLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use std::env;

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

    // Run migrations
    tracing::info!("Running database migrations...");
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");

    // Configure CORS - must specify exact origin when using credentials
    let frontend_url = env::var("FRONTEND_URL")
        .unwrap_or_else(|_| "http://localhost:3000".to_string());

    let cors = CorsLayer::new()
        .allow_origin(
            frontend_url
                .parse::<HeaderValue>()
                .expect("Invalid FRONTEND_URL"),
        )
        .allow_methods([
            axum::http::Method::GET,
            axum::http::Method::POST,
            axum::http::Method::PUT,
            axum::http::Method::DELETE,
            axum::http::Method::OPTIONS,
        ])
        .allow_headers([
            axum::http::header::CONTENT_TYPE,
            axum::http::header::AUTHORIZATION,
            axum::http::header::ACCEPT,
        ])
        .allow_credentials(true);

    // Build protected routes that require authentication
    let protected_routes = Router::new()
        .route("/api/auth/me", get(handlers::auth::me))
        // Mental box routes
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
        // Mood tracker routes
        .route(
            "/api/mood-tracker",
            get(handlers::mood_tracker::list).post(handlers::mood_tracker::create),
        )
        .route(
            "/api/mood-tracker/:id",
            get(handlers::mood_tracker::get_by_id)
                .put(handlers::mood_tracker::update)
                .delete(handlers::mood_tracker::delete),
        )
        .route("/api/mood-tracker/recent", get(handlers::mood_tracker::get_recent))
        .route("/api/mood-tracker/stats", get(handlers::mood_tracker::get_stats))
        // Stress reframe routes
        .route(
            "/api/stress-reframe",
            get(handlers::stress_reframe::list).post(handlers::stress_reframe::create),
        )
        .route_layer(axum::middleware::from_fn_with_state(
            pool.clone(),
            crate::middleware::auth::auth_middleware,
        ));

    // Build public routes
    let public_routes = Router::new()
        .route("/health", get(health_check))
        .route("/api/auth/register", post(handlers::auth::register))
        .route("/api/auth/login", post(handlers::auth::login))
        .route("/api/auth/refresh", post(handlers::auth::refresh))
        .route("/api/auth/logout", post(handlers::auth::logout));

    // Combine routes
    let app = public_routes
        .merge(protected_routes)
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
