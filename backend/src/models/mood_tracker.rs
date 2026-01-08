use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Copy, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "text")]
pub enum MoodType {
    #[serde(rename = "great")]
    Great,
    #[serde(rename = "good")]
    Good,
    #[serde(rename = "okay")]
    Okay,
    #[serde(rename = "bad")]
    Bad,
    #[serde(rename = "terrible")]
    Terrible,
}

impl std::fmt::Display for MoodType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            MoodType::Great => write!(f, "great"),
            MoodType::Good => write!(f, "good"),
            MoodType::Okay => write!(f, "okay"),
            MoodType::Bad => write!(f, "bad"),
            MoodType::Terrible => write!(f, "terrible"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct MoodEntry {
    pub id: Uuid,
    pub user_id: Uuid,
    pub mood: String, // Will be converted to/from MoodType
    pub stress_level: i32,
    pub note: Option<String>,
    pub activities: Option<Vec<String>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateMoodEntryRequest {
    pub mood: MoodType,
    pub stress_level: i32,
    pub note: Option<String>,
    pub activities: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateMoodEntryRequest {
    pub mood: Option<MoodType>,
    pub stress_level: Option<i32>,
    pub note: Option<String>,
    pub activities: Option<Vec<String>>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct MoodStats {
    pub average_stress: f64,
    pub most_common_mood: String,
    pub total_entries: i64,
    pub entries_this_week: i64,
}
