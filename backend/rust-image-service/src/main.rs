mod image_processing;
mod text_recognition;

use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpServer};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .wrap(Cors::permissive())
            .wrap(Logger::default())
            .service(
                web::resource("/api/process-image")
                    .route(web::post().to(image_processing::process_image)),
            )
            .service(
                web::resource("/api/recognize-text")
                    .route(web::post().to(text_recognition::recognize_text)),
            )
    })
    .bind("127.0.0.1:5000")?
    .run()
    .await
}
