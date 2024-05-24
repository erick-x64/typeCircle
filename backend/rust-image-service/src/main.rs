use actix_cors::Cors;
use actix_web::{error, middleware::Logger, web, App, HttpResponse, HttpServer, Result};

use serde::Deserialize;
use serde::Serialize;

use opencv::{
    core::{self, Mat, ToInputArray},
    dnn, imgcodecs,
    prelude::*,
};

use std::time::Instant;

#[derive(Debug, Serialize)]
struct ResponseData {
    boxes_list: Vec<Vec<i32>>,
    average_score: f32,
}

#[derive(Deserialize)]
struct ImageData {
    data_url: String,
}

async fn process_image(image_data: web::Json<ImageData>) -> Result<HttpResponse> {
    // Obter a URL de dados da imagem do corpo da solicitação
    let data_url = &image_data.data_url;

    // Extrair os bytes da URL de dados
    let base64_data = data_url
        .split(',')
        .nth(1)
        .ok_or_else(|| actix_web::error::ParseError::Incomplete)?;
    let bytes = match base64::decode(base64_data) {
        Ok(decoded_bytes) => decoded_bytes,
        Err(_) => return Err(error::ErrorBadRequest("Invalid base64 data")),
    };

    let bytes_slice = bytes.as_slice();
    let bytes_array = match bytes_slice.input_array() {
        Ok(array) => array,
        Err(_) => {
            return Err(error::ErrorInternalServerError(
                "Failed to convert bytes to input array",
            ))
        }
    };

    let frame = match imgcodecs::imdecode(&bytes_array, imgcodecs::IMREAD_COLOR) {
        Ok(frame) => frame,
        Err(_) => return Err(error::ErrorInternalServerError("Failed to decode image")),
    };

    let (boxes_list, average_score) = match process_image_cv(&frame) {
        Ok((boxes_list, average_score)) => (boxes_list, average_score),
        Err(_) => return Err(error::ErrorInternalServerError("Erro in process image")),
    };

    // Retornar uma resposta indicando o sucesso
    Ok(HttpResponse::Ok().json(ResponseData {
        boxes_list: boxes_list,
        average_score: average_score,
    }))
}

fn process_image_cv(frame: &Mat) -> opencv::Result<(Vec<Vec<i32>>, f32)> {
    let conf_threshold = 0.4;
    let nms_threshold = 0.4;

    // let class_names = std::fs::read_to_string("yolov4/obj.names")
    //     .map_err(|e| {
    //         opencv::Error::new(
    //             opencv::core::StsError,
    //             format!("Failed to read obj.names: {}", e),
    //         )
    //     })?
    //     .lines()
    //     .map(|line| line.trim().to_string())
    //     .collect::<Vec<_>>();

    let net = dnn::read_net_from_darknet(
        "yolov4/yolov4-custom.cfg",
        "yolov4/yolov4-custom_best.weights",
    )?;

    let mut model = dnn::DetectionModel::new_1(&net)?;

    model.set_input_params(
        1.0 / 255.0,
        core::Size::new(416, 416),
        core::Scalar::new(0.0, 0.0, 0.0, 0.0),
        true,
        false,
    )?;

    let mut classes = opencv::types::VectorOfi32::new();
    let mut scores = opencv::types::VectorOff32::new();
    let mut boxes = opencv::types::VectorOfRect::new();

    let start = Instant::now();

    model.detect(
        &frame,
        &mut classes,
        &mut scores,
        &mut boxes,
        conf_threshold,
        nms_threshold,
    )?;

    let duration = start.elapsed();
    println!("Detecção levou: {:?}", duration);

    let mut total_score = 0.0;
    let mut num_detections = 0;

    for score in &scores {
        total_score += score;
        num_detections += 1;
    }

    // average_score
    let average_score = if num_detections > 0 {
        total_score / num_detections as f32
    } else {
        0.0
    };

    let average_score_rounded = average_score * 100.0;

    // boxes_list
    let mut boxes_list = Vec::new();
    for bbox in boxes {
        boxes_list.push(vec![bbox.x, bbox.y, bbox.width, bbox.height]);
    }

    Ok((boxes_list, average_score_rounded))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            // Adiciona middleware para permitir CORS de forma muito permissiva
            .wrap(Cors::permissive())
            // Registra o logger para registrar solicitações HTTP
            .wrap(Logger::default())
            .service(web::resource("/api/process-image").route(web::post().to(process_image)))
    })
    .bind("0.0.0.0:5000")?
    .run()
    .await
}
