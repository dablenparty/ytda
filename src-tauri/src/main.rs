#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{api::process::Command, Manager};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

async fn run_ytda_sidecar(url: &str) -> tauri::Result<()> {
    let (mut rx, _) = Command::new_sidecar("ytda")?.args(vec![url]).spawn()?;
    while let Some(event) = rx.recv().await {
        println!("{:?}", event);
    }
    Ok(())
}

#[tauri::command]
async fn download_video(url: &str) -> Result<(), String> {
    run_ytda_sidecar(url).await.map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_window("main").expect("main window not found");
                window.open_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, download_video])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
