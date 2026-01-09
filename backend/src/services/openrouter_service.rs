use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Serialize)]
struct OpenRouterRequest {
    model: String,
    messages: Vec<Message>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Message {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct OpenRouterResponse {
    choices: Vec<Choice>,
}

#[derive(Debug, Deserialize)]
struct Choice {
    message: Message,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ReframeResult {
    pub stoic: String,
    pub optimist: String,
    pub realist: String,
}

pub async fn generate_reframes(
    original_thought: &str,
) -> Result<ReframeResult, Box<dyn std::error::Error>> {
    let api_key = env::var("OPENROUTER_API_KEY")
        .map_err(|_| "OPENROUTER_API_KEY must be set in environment")?;

    let prompt = format!(
        r#"You are a cognitive reframing assistant helping people manage stress.
Given a stressful thought, provide exactly three different reframes in JSON format.

IMPORTANT: You MUST respond in the SAME LANGUAGE as the user's input. If the input is in Thai, respond in Thai. If the input is in English, respond in English. Match the language exactly.

Stressful thought: "{}"

Provide three reframes:
1. Stoic: Focus on what the person can control, accepting what they cannot
2. Optimist: Find the silver lining or opportunity in the situation
3. Realist: Provide a balanced, practical perspective that acknowledges reality

Respond ONLY with valid JSON in this exact format:
{{
  "stoic": "Your stoic reframe here",
  "optimist": "Your optimist reframe here",
  "realist": "Your realist reframe here"
}}

Make each reframe concise (1-2 sentences), supportive, and actionable.
Remember: Your response MUST be in the same language as the input text above."#,
        original_thought
    );

    let client = Client::new();
    let request_body = OpenRouterRequest {
        model: "google/gemini-2.5-flash".to_string(), // Fast and affordable model
        messages: vec![Message {
            role: "user".to_string(),
            content: prompt,
        }],
    };

    let response = client
        .post("https://openrouter.ai/api/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("HTTP-Referer", "https://sabyejai.com") // Optional: your site URL
        .header("X-Title", "SaByeJai Stress Management") // Optional: your app name
        .json(&request_body)
        .send()
        .await?;

    if !response.status().is_success() {
        let error_text = response.text().await?;
        return Err(format!("OpenRouter API error: {}", error_text).into());
    }

    let api_response: OpenRouterResponse = response.json().await?;

    let content = api_response
        .choices
        .first()
        .ok_or("No response from AI")?
        .message
        .content
        .clone();

    // Strip markdown code blocks if present (e.g., ```json ... ```)
    let cleaned_content = content
        .trim()
        .strip_prefix("```json")
        .or_else(|| content.trim().strip_prefix("```"))
        .unwrap_or(&content)
        .trim()
        .strip_suffix("```")
        .unwrap_or(&content)
        .trim();

    // Parse JSON response
    let reframe_result: ReframeResult = serde_json::from_str(cleaned_content)
        .map_err(|e| format!("Failed to parse AI response: {}. Response was: {}", e, cleaned_content))?;

    Ok(reframe_result)
}
