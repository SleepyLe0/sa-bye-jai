use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct StressReframe {
    pub id: Uuid,
    pub user_id: Uuid,
    pub mental_box_id: Option<Uuid>,
    pub original_thought: String,
    pub stoic_reframe: String,
    pub optimist_reframe: String,
    pub realist_reframe: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateReframeRequest {
    pub mental_box_id: Option<Uuid>,
    pub original_thought: String,
}

#[derive(Debug, Serialize)]
pub struct ReframeResponse {
    pub id: Uuid,
    pub mental_box_id: Option<Uuid>,
    pub original_thought: String,
    pub stoic_reframe: String,
    pub optimist_reframe: String,
    pub realist_reframe: String,
    pub created_at: DateTime<Utc>,
}
