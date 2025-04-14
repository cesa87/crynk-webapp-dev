use actix_cors::Cors;
use actix_web::{web, App, HttpServer};
use sqlx::MySqlPool;
use std::env;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load .env for local dev, fail loudly to catch mistakes
    dotenv::dotenv().expect("Failed to load .env file");
    println!("Environment variables loaded");

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    println!("Connecting to database: {}", database_url);

    // Create MySQL connection pool with error handling
    let pool = sqlx::PoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;
    println!("Successfully connected to the database");

    println!("Starting HTTP server on 127.0.0.1:8080");
    HttpServer::new(move || {
        // Minimal CORS for dev (needed for React on localhost:3000)
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST", "OPTIONS"])
            .allowed_headers(vec!["Content-Type"])
            .max_age(3600);

        App::new()
            .wrap(cors)
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
