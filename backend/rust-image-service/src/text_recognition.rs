// text_recognition.rs

use actix_web::{error, web, HttpResponse, Result};
use image::io::Reader as ImageReader;
use regex::Regex;
use rusty_tesseract::{Args, Image};
use serde::{Deserialize, Serialize};
use std::str;

#[derive(Debug, Serialize)]
pub struct TextResponse {
    text: String,
}

#[derive(Deserialize)]
pub struct TextData {
    data_url: String,
    lang: String,
}

pub async fn recognize_text(text_data: web::Json<TextData>) -> Result<HttpResponse> {
    let data_url = &text_data.data_url;
    let lang = &text_data.lang;

    let base64_data = data_url
        .split(',')
        .nth(1)
        .ok_or_else(|| actix_web::error::ParseError::Incomplete)?;
    let bytes = match base64::decode(base64_data) {
        Ok(decoded_bytes) => decoded_bytes,
        Err(_) => return Err(error::ErrorBadRequest("Invalid base64 data")),
    };

    let dynamic_image = match ImageReader::new(std::io::Cursor::new(bytes)).with_guessed_format() {
        Ok(reader) => reader
            .decode()
            .map_err(|_| error::ErrorInternalServerError("Failed to decode image")),
        Err(_) => {
            return Err(error::ErrorInternalServerError(
                "Failed to read image format",
            ))
        }
    }?;

    let img = Image::from_dynamic_image(&dynamic_image)
        .map_err(|_| error::ErrorInternalServerError("Failed to convert to Tesseract image"))?;

    let my_args = if lang == "jpn_vert" {
        Args {
            lang: lang.into(),
            dpi: Some(150),
            psm: Some(5),
            oem: Some(3),
            ..Default::default()
        }
    } else {
        Args {
            lang: lang.into(),
            dpi: Some(150),
            psm: Some(6),
            oem: Some(3),
            ..Default::default()
        }
    };

    let output = rusty_tesseract::image_to_string(&img, &my_args)
        .map_err(|_| error::ErrorInternalServerError("Failed to perform OCR"))?;

    let formatted_output = if my_args.lang == "jpn_vert" {
        let re = Regex::new(r"[\p{Hiragana}\p{Katakana}\p{Han}]").unwrap();
        re.find_iter(&output)
            .map(|mat| mat.as_str())
            .collect::<String>()
    } else {
        let re = Regex::new(r"[a-zA-Z\s[:punct:]]").unwrap();
        let filtered_output = re.find_iter(&output)
            .map(|mat| mat.as_str())
            .collect::<String>();
        format_text(&filtered_output)
    };

    Ok(HttpResponse::Ok().json(TextResponse {
        text: formatted_output,
    }))
}


fn format_text(output: &str) -> String {
    let re_comma = Regex::new(r",(\S)").unwrap();
    let formatted = re_comma.replace_all(output, ", $1");

    let mut chars = formatted.chars();
    let formatted_sentence = chars
        .next()
        .map(|c| c.to_uppercase().collect::<String>())
        .unwrap_or_default() + chars.as_str().to_lowercase().as_str();

    formatted_sentence
}