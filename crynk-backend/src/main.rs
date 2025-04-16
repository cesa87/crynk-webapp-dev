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
use chrono;
use uuid::Uuid;

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

// New struct for payment quotes
#[derive(Deserialize)]
struct PaymentQuoteRequest {
    cart_total: f64,
    user_address: String,
    merchant_id: String,
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

// New payment quote endpoint
async fn payment_quote(
    pool: web::Data<MySqlPool>,
    req: web::Json<PaymentQuoteRequest>,
) -> impl Responder {
    println!("Received payment quote request for merchant: {}", req.merchant_id);

    // Get merchant details
    let merchant = sqlx::query!("SELECT business_name FROM merchants WHERE id = ?", req.merchant_id)
        .fetch_one(&**pool)
        .await;

    match merchant {
        Ok(merchant) => {
            // Mock ETH price calculation ($2000/ETH)
            let eth_amount = req.cart_total / 2000.0;
            let platform_fee = req.cart_total * 0.015; // 1.5% platform fee

            HttpResponse::Ok().json(json!({
                "success": true,
                "payment_id": Uuid::new_v4().to_string(),
                "cart_total_usd": req.cart_total,
                "eth_amount": eth_amount,
                "platform_fee": platform_fee,
                "merchant_name": merchant.business_name,
                "user_address": req.user_address,
                "timestamp": chrono::Utc::now().to_rfc3339()
            }))
        },
        Err(e) => {
            HttpResponse::BadRequest().json(json!({
                "success": false,
                "message": format!("Merchant error: {}", e)
            }))
        }
    }
}

// Placeholder functions remain unchanged
async fn check_wallet_risk(address: &str, _chain: &str) -> i32 { 10 }
async fn call_smart_contract(wallet: &str, _asset: &str, _amount: &str, _chain: &str) -> bool { true }
async fn send_to_off_ramp(amount: &str, bank_details: &str, swift_code: &str) -> bool { true }

// Existing utility endpoints remain unchanged
async fn eth_price() -> impl Responder { /* ... */ }
async fn eth_metrics() -> impl Responder { /* ... */ }
async fn gas_fees() -> impl Responder { /* ... */ }
async fn market_sentiment() -> impl Responder { /* ... */ }
async fn transaction_history(req: web::Query<TransactionHistoryRequest>) -> impl Responder { /* ... */ }

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
                    .allowed_methods(vec!["GET", "POST", "OPTIONS"])
                    .allowed_headers(vec!["Content-Type"])
                    .max_age(3600)
            )
            .app_data(web::Data::new(pool.clone()))
            // Existing endpoints
            .route("/api/login", web::post().to(login))
            .route("/api/register", web::post().to(register_user))
            .route("/api/merchant/onboard", web::post().to(onboard_merchant))
            .route("/api/payment/process", web::post().to(process_payment))
            .route("/api/eth-price", web::get().to(eth_price))
            .route("/api/eth-metrics", web::get().to(eth_metrics))
            .route("/api/gas-fees", web::get().to(gas_fees))
            .route("/api/market-sentiment", web::get().to(market_sentiment))
            .route("/api/transactions", web::get().to(transaction_history))
            // New endpoint
            .route("/api/payment-quote", web::post().to(payment_quote))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
