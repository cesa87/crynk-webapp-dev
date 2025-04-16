// Import necessary Actix Web modules
use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::MySqlPool;
use sqlx::Row;
use dotenv::dotenv;
use std::env;
use bcrypt::{verify, hash, DEFAULT_COST};
use reqwest::Client;

// Struct to represent a user in the database
#[derive(Serialize)]
struct User {
    id: i32,
    username: String,
}

// Struct to deserialize login request data
#[derive(Deserialize)]
struct LoginRequest {
    username: String,
    password: String,
}

// Struct to deserialize registration request data
#[derive(Deserialize)]
struct RegisterRequest {
    first_name: String,
    last_name: String,
    email: String,
    mobile: String,
    username: String,
    password: String,
}

// Struct to deserialize merchant onboarding request data
#[derive(Deserialize)]
struct MerchantOnboardRequest {
    business_name: String,
    bank_details: String,
    swift_code: String,
}

// Struct to deserialize payment request data
#[derive(Deserialize)]
struct PaymentRequest {
    wallet_address: String,
    asset: String,
    amount: String,
    chain: String,
    merchant_id: String,
}

// Struct to deserialize transaction history request data
#[derive(Deserialize)]
struct TransactionHistoryRequest {
    wallet_address: String,
}

// Login endpoint
async fn login(
    pool: web::Data<MySqlPool>,
    credentials: web::Json<LoginRequest>,
) -> impl Responder {
    println!("Received login request for username: {}", credentials.username);

    let result = sqlx::query("SELECT id, username, password_hash FROM crynk_users WHERE username = ?")
        .bind(&credentials.username)
        .fetch_one(&**pool)
        .await;

    match result {
        Ok(row) => {
            let password_hash: String = row.get("password_hash");
            let id: i32 = row.get("id");
            let username: String = row.get("username");

            println!("User found in database: {}", username);

            if verify(&credentials.password, &password_hash).unwrap_or(false) {
                println!("Login successful for user: {}", username);
                HttpResponse::Ok().json(json!({
                    "success": true,
                    "message": "Login successful",
                    "user": {
                        "id": id,
                        "username": username,
                    }
                }))
            } else {
                println!("Invalid credentials for user: {}", username);
                HttpResponse::Unauthorized().json(json!({
                    "success": false,
                    "message": "Invalid credentials",
                }))
            }
        }
        Err(e) => {
            println!("Database error during login: {:?}", e);
            HttpResponse::Unauthorized().json(json!({
                "success": false,
                "message": "Invalid credentials",
            }))
        }
    }
}

// Register endpoint
async fn register_user(
    pool: web::Data<MySqlPool>,
    user: web::Json<RegisterRequest>,
) -> impl Responder {
    println!("Received registration request for username: {}", user.username);

    let hashed_password = match hash(&user.password, DEFAULT_COST) {
        Ok(hash) => hash,
        Err(e) => {
            println!("Failed to hash password: {:?}", e);
            return HttpResponse::InternalServerError().json(json!({
                "success": false,
                "message": "Failed to hash password",
            }));
        }
    };

    println!("Password hashed successfully");

    let result = sqlx::query("INSERT INTO crynk_users (first_name, last_name, email, mobile, username, password_hash) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(&user.first_name)
        .bind(&user.last_name)
        .bind(&user.email)
        .bind(&user.mobile)
        .bind(&user.username)
        .bind(&hashed_password)
        .execute(&**pool)
        .await;

    match result {
        Ok(_) => {
            println!("User created successfully: {}", user.username);
            HttpResponse::Ok().json(json!({
                "success": true,
                "message": "User created successfully",
            }))
        }
        Err(e) => {
            println!("Database error during registration: {:?}", e);
            HttpResponse::InternalServerError().json(json!({
                "success": false,
                "message": "Error creating user",
            }))
        }
    }
}

// Merchant onboarding endpoint
async fn onboard_merchant(
    pool: web::Data<MySqlPool>,
    req: web::Json<MerchantOnboardRequest>,
) -> impl Responder {
    println!("Received merchant onboarding request for: {}", req.business_name);

    let result = sqlx::query("INSERT INTO merchants (business_name, bank_details, swift_code) VALUES (?, ?, ?)")
        .bind(&req.business_name)
        .bind(&req.bank_details)
        .bind(&req.swift_code)
        .execute(&**pool)
        .await;

    match result {
        Ok(res) => {
            let merchant_id = res.last_insert_id();
            println!("Merchant onboarded with ID: {}", merchant_id);
            HttpResponse::Ok().json(json!({
                "success": true,
                "merchant_id": merchant_id,
                "message": "Merchant onboarded successfully"
            }))
        }
        Err(e) => {
            println!("Database error during onboarding: {:?}", e);
            HttpResponse::InternalServerError().json(json!({
                "success": false,
                "message": format!("Error: {:?}", e)
            }))
        }
    }
}

// Payment processing endpoint
async fn process_payment(
    pool: web::Data<MySqlPool>,
    req: web::Json<PaymentRequest>,
) -> impl Responder {
    println!("Processing payment from wallet: {}", req.wallet_address);

    // Wallet risk check (Chainalysis placeholder)
    let risk_score = check_wallet_risk(&req.wallet_address, &req.chain).await;
    if risk_score > 70 {
        println!("High-risk wallet detected: {}", req.wallet_address);
        return HttpResponse::Forbidden().json(json!({
            "success": false,
            "message": "High-risk wallet"
        }));
    }

    // Fetch merchant bank details
    let merchant = sqlx::query("SELECT bank_details, swift_code FROM merchants WHERE id = ?")
        .bind(&req.merchant_id)
        .fetch_one(&**pool)
        .await;

    let (bank_details, swift_code) = match merchant {
        Ok(row) => {
            let bank_details: String = row.get("bank_details");
            let swift_code: String = row.get("swift_code");
            (bank_details, swift_code)
        }
        Err(e) => {
            println!("Invalid merchant ID: {:?}", e);
            return HttpResponse::BadRequest().json(json!({
                "success": false,
                "message": "Invalid merchant ID"
            }));
        }
    };

    // Call smart contract (placeholder)
    let tx_result = call_smart_contract(&req.wallet_address, &req.asset, &req.amount, &req.chain).await;
    if !tx_result {
        println!("Smart contract execution failed");
        return HttpResponse::InternalServerError().json(json!({
            "success": false,
            "message": "Smart contract failed"
        }));
    }

    // Call off-ramp provider
    let off_ramp_result = send_to_off_ramp(&req.amount, &bank_details, &swift_code).await;
    if !off_ramp_result {
        println!("Off-ramp failed");
        return HttpResponse::InternalServerError().json(json!({
            "success": false,
            "message": "Off-ramp failed"
        }));
    }

    println!("Payment processed successfully");
    HttpResponse::Ok().json(json!({
        "success": true,
        "message": "Payment processed",
        "tx_hash": "placeholder-tx-hash" // Replace with actual hash
    }))
}

// Placeholder: Smart contract call
async fn call_smart_contract(wallet: &str, _asset: &str, _amount: &str, chain: &str) -> bool {
    println!("Calling smart contract on {} for wallet: {}", chain, wallet);
    true
}

// Placeholder: Off-ramp API call
async fn send_to_off_ramp(amount: &str, bank_details: &str, swift_code: &str) -> bool {
    println!("Sending to off-ramp: {} to bank: {}", amount, bank_details);
    let client = reqwest::Client::new();
    let res = client.post("https://offramp-api.com/settle")
        .json(&json!({
            "stablecoin": "USDC",
            "amount": amount,
            "bank_details": bank_details,
            "swift_code": swift_code
        }))
        .send()
        .await;
    res.is_ok()
}

// Placeholder: Wallet risk check
async fn check_wallet_risk(address: &str, _chain: &str) -> i32 {
    println!("Checking wallet risk for: {}", address);
    10 // Default low risk
}

// Endpoint to fetch the current ETH price from CoinGecko
async fn eth_price() -> impl Responder {
    let client = Client::new();
    let response = client
        .get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
        .send()
        .await;

    match response {
        Ok(res) => {
            let data: serde_json::Value = res.json().await.unwrap_or(serde_json::json!({}));
            let price = data["ethereum"]["usd"].as_f64().unwrap_or(0.0);
            HttpResponse::Ok().json(json!({ "price": price }))
        }
        Err(_) => HttpResponse::InternalServerError().json(json!({ "error": "Failed to fetch ETH price" })),
    }
}

// Endpoint to fetch historical ETH price data and calculate RSI and volatility
async fn eth_metrics() -> impl Responder {
    let client = Client::new();
    let response = client
        .get("https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=14")
        .send()
        .await;

    match response {
        Ok(res) => {
            let data: serde_json::Value = res.json().await.unwrap_or(serde_json::json!({}));
            let prices: Vec<f64> = data["prices"]
                .as_array()
                .map(|arr| arr.iter().map(|p| p[1].as_f64().unwrap_or(0.0)).collect())
                .unwrap_or(vec![]);

            let rsi = calculate_rsi(&prices);
            let volatility = calculate_volatility(&prices);

            HttpResponse::Ok().json(json!({
                "rsi": rsi,
                "volatility": volatility
            }))
        }
        Err(_) => HttpResponse::InternalServerError().json(json!({ "error": "Failed to fetch ETH metrics" })),
    }
}

// Function to calculate RSI (simplified 14-period RSI)
fn calculate_rsi(prices: &Vec<f64>) -> f64 {
    let mut gains = 0.0;
    let mut losses = 0.0;
    for i in 1..prices.len() {
        let diff = prices[i] - prices[i - 1];
        if diff > 0.0 {
            gains += diff;
        } else {
            losses += diff.abs();
        }
    }
    let avg_gain = gains / 14.0;
    let avg_loss = losses / 14.0;
    let rs = if avg_loss == 0.0 { 100.0 } else { avg_gain / avg_loss };
    100.0 - (100.0 / (1.0 + rs))
}

// Function to calculate volatility (standard deviation of daily returns over 14 days)
fn calculate_volatility(prices: &Vec<f64>) -> f64 {
    let returns: Vec<f64> = (1..prices.len())
        .map(|i| (prices[i] - prices[i - 1]) / prices[i - 1] * 100.0)
        .collect();
    let mean = returns.iter().sum::<f64>() / returns.len() as f64;
    let variance = returns.iter().map(|r| (r - mean).powi(2)).sum::<f64>() / returns.len() as f64;
    variance.sqrt()
}

// Endpoint to fetch gas fees from Etherscan
async fn gas_fees() -> impl Responder {
    let client = Client::new();
    let response = client
        .get("https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=YOUR_ETHERSCAN_API_KEY")
        .send()
        .await;

    match response {
        Ok(res) => {
            let data: serde_json::Value = res.json().await.unwrap_or(serde_json::json!({}));
            let gas_price = data["result"]["ProposeGasPrice"].as_str().unwrap_or("0").parse::<f64>().unwrap_or(0.0);
            let fees = gas_price * 0.000000001 * 21000.0;
            HttpResponse::Ok().json(json!({ "fees": fees }))
        }
        Err(_) => HttpResponse::InternalServerError().json(json!({ "error": "Failed to fetch gas fees" })),
    }
}

// Endpoint to fetch market sentiment from Twitter (X API)
async fn market_sentiment() -> impl Responder {
    let client = Client::new();
    let response = client
        .get("https://api.twitter.com/2/tweets/search/recent?query=ETH")
        .header("Authorization", "Bearer AAAAAAAAAAAAAAAAAAAAAORo0QEAAAAA1VD1fDGJtEItC9jybWnodUZh%2BbQ%3D7fNyGA1nhvKojeihWaEBwrpqoA6ZEQF0iFXeWawqZbj8jZPpXA")
        .send()
        .await;

    match response {
        Ok(res) => {
            let data: serde_json::Value = res.json().await.unwrap_or(serde_json::json!({}));
            let tweets: Vec<String> = data["data"]
                .as_array()
                .map(|arr| arr.iter().map(|t| t["text"].as_str().unwrap_or("").to_string()).collect())
                .unwrap_or(vec![]);
            let sentiment = analyze_sentiment(&tweets);
            HttpResponse::Ok().json(json!({ "sentiment": sentiment }))
        }
        Err(_) => HttpResponse::InternalServerError().json(json!({ "error": "Failed to fetch market sentiment" })),
    }
}

// Function to analyze sentiment from tweets (simplified)
fn analyze_sentiment(tweets: &Vec<String>) -> String {
    let mut positive = 0;
    let mut negative = 0;
    for tweet in tweets {
        let lower_tweet = tweet.to_lowercase();
        if lower_tweet.contains("good") || lower_tweet.contains("bullish") || lower_tweet.contains("up") {
            positive += 1;
        } else if lower_tweet.contains("bad") || lower_tweet.contains("bearish") || lower_tweet.contains("down") {
            negative += 1;
        }
    }
    if positive > negative {
        "Bullish".to_string()
    } else if negative > positive {
        "Bearish".to_string()
    } else {
        "Neutral".to_string()
    }
}

// Endpoint to fetch transaction history from Etherscan
async fn transaction_history(req: web::Query<TransactionHistoryRequest>) -> impl Responder {
    let client = Client::new();
    let response = client
        .get(format!(
            "https://api.etherscan.io/api?module=account&action=txlist&address={}&startblock=0&endblock=99999999&sort=desc&apikey=YOUR_ETHERSCAN_API_KEY",
            req.wallet_address
        ))
        .send()
        .await;

    match response {
        Ok(res) => {
            let data: serde_json::Value = res.json().await.unwrap_or(serde_json::json!({}));
            let txs: Vec<serde_json::Value> = data["result"]
                .as_array()
                .map(|arr| arr.iter().cloned().collect())
                .unwrap_or(vec![])
                .into_iter()
                .take(5)
                .collect();
            let formatted_txs: Vec<serde_json::Value> = txs.iter().map(|tx| {
                let amount = tx["value"].as_str().unwrap_or("0").parse::<f64>().unwrap_or(0.0) / 1e18;
                let timestamp = tx["timeStamp"].as_str().unwrap_or("0").parse::<i64>().unwrap_or(0);
                json!({
                    "amount": format!("{:.4} ETH", amount),
                    "to": tx["to"].as_str().unwrap_or(""),
                    "date": chrono::DateTime::<chrono::Utc>::from_timestamp(timestamp, 0)
                        .map(|dt| dt.format("%Y-%m-%d").to_string())
                        .unwrap_or("Unknown".to_string()),
                    "status": if tx["isError"].as_str().unwrap_or("0") == "0" { "Confirmed" } else { "Failed" }
                })
            }).collect();
            HttpResponse::Ok().json(json!({ "transactions": formatted_txs }))
        }
        Err(_) => HttpResponse::InternalServerError().json(json!({ "error": "Failed to fetch transaction history" })),
    }
}

// Main function to start the Actix Web server
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    println!("Environment variables loaded");

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    println!("Connecting to database: {}", database_url);

    let pool = MySqlPool::connect(&database_url).await.expect("Database connection failed");
    println!("Successfully connected to the database");

    println!("Starting HTTP server on 127.0.0.1:8080");
    HttpServer::new(move || {
        App::new()
            .wrap(
                Cors::permissive()
                    .allowed_origin("http://localhost:3000")
		    .allowed_origin("http://13.48.24.11")
		    .allowed_origin("http://51.21.249.38")
                    .allowed_methods(vec!["GET", "POST", "OPTIONS"]) // Include OPTIONS for preflight
                    .allowed_headers(vec!["Content-Type"])
                    .max_age(3600) // Cache preflight for 1 hour
            )
            .app_data(web::Data::new(pool.clone()))
            .route("/api/login", web::post().to(login))
            .route("/api/register", web::post().to(register_user))
            .route("/api/merchant/onboard", web::post().to(onboard_merchant))
            .route("/api/payment/process", web::post().to(process_payment))
            .route("/api/eth-price", web::get().to(eth_price))
            .route("/api/eth-metrics", web::get().to(eth_metrics))
            .route("/api/gas-fees", web::get().to(gas_fees))
            .route("/api/market-sentiment", web::get().to(market_sentiment))
            .route("/api/transactions", web::get().to(transaction_history))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
