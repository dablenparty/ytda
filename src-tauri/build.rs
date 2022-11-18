use std::{io, process};

fn main() -> io::Result<()> {
    let this_dir = std::env::current_dir()?;
    let binaries_dir = this_dir.join("binaries");
    if binaries_dir.exists() {
        std::fs::remove_dir_all(&binaries_dir)?;
    }
    let parent = this_dir.parent().expect("no parent to src-tauri");

    let package_status = process::Command::new("yarn")
        .args(vec!["package"])
        .current_dir(parent)
        .status()?;
    if !package_status.success() {
        panic!("Failed to package binaries");
    }
    let target_triple = std::env::var("TARGET").expect("TARGET env var not set");
    // append target triple to each filename in the binaries dir
    for entry in std::fs::read_dir(binaries_dir)? {
        let entry = entry?;
        let path = entry.path();
        let extension = path
            .extension()
            .map(|e| format!(".{}", e.to_string_lossy()))
            .unwrap_or_default();
        let file_stem = path.file_stem().expect("no file stem");
        let new_path = path.with_file_name(format!(
            "{}-{}{}",
            file_stem.to_string_lossy(),
            target_triple,
            extension
        ));
        std::fs::rename(path, new_path)?;
    }
    tauri_build::build();
    Ok(())
}
