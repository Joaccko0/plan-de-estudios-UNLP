#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![open_url])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn open_url(url: String) {
    println!("Attempting to open URL: {}", url);
    if let Err(e) = open::that(&url) {
        eprintln!("Failed to open URL {}: {}", url, e);
    }
}
