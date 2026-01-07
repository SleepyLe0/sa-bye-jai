use chrono::{DateTime, NaiveDate, NaiveTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct WorryWindow {
    pub id: Uuid,
    pub user_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub scheduled_date: NaiveDate,
    pub start_time: NaiveTime,
    pub end_time: NaiveTime,
    pub is_completed: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateWorryWindowRequest {
    pub title: String,
    pub description: Option<String>,
    pub scheduled_date: NaiveDate,
    pub start_time: NaiveTime,
    pub end_time: NaiveTime,
}

#[derive(Debug, Deserialize)]
pub struct UpdateWorryWindowRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub scheduled_date: Option<NaiveDate>,
    pub start_time: Option<NaiveTime>,
    pub end_time: Option<NaiveTime>,
    pub is_completed: Option<bool>,
}
