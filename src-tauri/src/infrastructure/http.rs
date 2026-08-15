const BROWSER_USER_AGENT: &str =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

pub fn browser_client() -> reqwest::Client {
    reqwest::Client::builder().user_agent(BROWSER_USER_AGENT).build().unwrap_or_else(|e| {
        eprintln!("HTTP client build failed, falling back to one without a browser user agent: {e}");
        reqwest::Client::new()
    })
}
