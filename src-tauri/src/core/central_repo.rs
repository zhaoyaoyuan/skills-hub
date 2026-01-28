use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use dirs::home_dir;
use tauri::Manager;

use super::skill_store::SkillStore;

const CENTRAL_DIR_NAME: &str = ".agent";
const SKILLS_SUBDIR: &str = "skills";

/// 旧的存储路径常量（用于迁移检测）
const OLD_CENTRAL_DIR_NAME: &str = ".skillshub";

pub fn resolve_central_repo_path<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    store: &SkillStore,
) -> Result<PathBuf> {
    // 用户可以自定义路径（保持向后兼容）
    if let Some(path) = store.get_setting("central_repo_path")? {
        return Ok(PathBuf::from(path));
    }

    if let Some(home) = home_dir() {
        // 默认使用 ~/.agent/skills/（与 OpenSkills --universal 一致）
        return Ok(home.join(CENTRAL_DIR_NAME).join(SKILLS_SUBDIR));
    }

    let base = app
        .path()
        .app_data_dir()
        .context("failed to resolve app data dir")?;
    Ok(base.join(CENTRAL_DIR_NAME).join(SKILLS_SUBDIR))
}

/// 检测是否存在旧版存储路径
pub fn detect_legacy_path() -> Option<PathBuf> {
    if let Some(home) = home_dir() {
        let legacy_path = home.join(OLD_CENTRAL_DIR_NAME);
        if legacy_path.exists() {
            return Some(legacy_path);
        }
    }
    None
}

pub fn ensure_central_repo(path: &Path) -> Result<()> {
    std::fs::create_dir_all(path).with_context(|| format!("create {:?}", path))?;
    Ok(())
}

#[cfg(test)]
#[path = "tests/central_repo.rs"]
mod tests;
