use crate::core::migration::{check_migration_needed, migrate_to_agent_skills, MigrationCheck};
use anyhow::Result;
use tauri::{AppHandle, Manager, State};

use crate::core::central_repo::resolve_central_repo_path;
use crate::core::skill_store::SkillStore;

/// 检查是否需要迁移
#[tauri::command]
pub async fn check_migration_needed_cmd() -> Result<Option<MigrationCheck>, String> {
    Ok(check_migration_needed())
}

/// 执行迁移
#[tauri::command]
pub async fn migrate_skills_cmd(
    app: AppHandle,
    state: State<'_, SkillStore>,
) -> Result<crate::core::migration::MigrationResult, String> {
    let store = state.inner();
    let new_path = resolve_central_repo_path(&app, store)
        .map_err(|e| e.to_string())?;

    // 构建旧路径
    let old_path = dirs::home_dir()
        .map(|h| h.join(".skillshub"))
        .ok_or_else(|| "Failed to determine home directory".to_string())?;

    migrate_to_agent_skills(&old_path, &new_path).map_err(|e| e.to_string())
}

/// 获取当前存储路径
#[tauri::command]
pub async fn get_storage_path_cmd(
    app: AppHandle,
    state: State<'_, SkillStore>,
) -> Result<String, String> {
    let store = state.inner();
    let path = resolve_central_repo_path(&app, store)
        .map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().to_string())
}
