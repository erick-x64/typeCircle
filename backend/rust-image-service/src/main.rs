// main.rs

mod image_processing;

use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpServer};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .wrap(Cors::permissive())
            .wrap(Logger::default())
            .service(web::resource("/api/process-image").route(web::post().to(image_processing::process_image)))
    })
    .bind("127.0.0.1:5000")?
    .run()
    .await
}