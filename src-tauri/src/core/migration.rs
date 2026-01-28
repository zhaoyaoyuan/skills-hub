use std::path::Path;
use anyhow::{Context, Result};

/// 迁移旧版 Skills Hub 技能到新路径
///
/// # 参数
/// * `old_path` - 旧路径 (~/.skillshub/)
/// * `new_path` - 新路径 (~/.agent/skills/)
///
/// # 返回
/// * `Ok(())` - 迁移成功或无需迁移
/// * `Err(anyhow::Error)` - 迁移失败
pub fn migrate_to_agent_skills(old_path: &Path, new_path: &Path) -> Result<MigrationResult> {
    // 检查旧路径是否存在
    if !old_path.exists() {
        return Ok(MigrationResult {
            old_path_existed: false,
            new_path_existed: new_path.exists(),
            migrated_count: 0,
            skipped: true,
            message: "旧路径不存在，无需迁移".to_string(),
        });
    }

    // 检查新路径是否已存在
    if new_path.exists() {
        return Ok(MigrationResult {
            old_path_existed: true,
            new_path_existed: true,
            migrated_count: 0,
            skipped: true,
            message: "新路径已存在，为避免数据丢失跳过迁移".to_string(),
        });
    }

    // 创建新目录的父目录
    if let Some(parent) = new_path.parent() {
        std::fs::create_dir_all(parent)
            .with_context(|| format!("Failed to create parent directory {:?}", parent))?;
    }

    // 统计和移动技能目录
    let entries = std::fs::read_dir(old_path)
        .with_context(|| format!("Failed to read old path {:?}", old_path))?;

    let mut migrated_count = 0usize;

    for entry in entries {
        let entry = entry?;
        let src = entry.path();

        // 跳过文件（只移动目录）
        if !src.is_dir() {
            continue;
        }

        // 跳过隐藏目录（如 .git）
        if let Some(name) = src.file_name() {
            if name.to_string_lossy().starts_with('.') {
                continue;
            }
        }

        let dest = new_path.join(entry.file_name());

        // 移动目录
        std::fs::rename(&src, &dest)
            .with_context(|| format!("Failed to move {:?} to {:?}", src, dest))?;

        migrated_count += 1;
        log::info!("Migrated skill: {:?} -> {:?}", src, dest);
    }

    // 尝试删除旧目录（如果为空）
    if old_path.exists() {
        let _ = std::fs::remove_dir(old_path);
    }

    let message = if migrated_count > 0 {
        format!("成功迁移 {} 个技能从 {:?} 到 {:?}", migrated_count, old_path, new_path)
    } else {
        "未发现需要迁移的技能".to_string()
    };

    Ok(MigrationResult {
        old_path_existed: true,
        new_path_existed: false,
        migrated_count,
        skipped: false,
        message,
    })
}

/// 迁移结果
#[derive(Debug, Clone, serde::Serialize)]
pub struct MigrationResult {
    /// 旧路径是否存在
    pub old_path_existed: bool,
    /// 新路径是否已存在
    pub new_path_existed: bool,
    /// 迁移的技能数量
    pub migrated_count: usize,
    /// 是否跳过迁移
    pub skipped: bool,
    /// 迁移消息
    pub message: String,
}

/// 检查是否需要迁移
pub fn check_migration_needed() -> Option<MigrationCheck> {
    use dirs::home_dir;

    let home = home_dir()?;
    let old_path = home.join(".skillshub");
    let new_path = home.join(".agent").join("skills");

    if old_path.exists() && !new_path.exists() {
        // 旧路径存在，新路径不存在，需要迁移
        Some(MigrationCheck {
            needed: true,
            old_path: old_path.to_string_lossy().to_string(),
            new_path: new_path.to_string_lossy().to_string(),
            reason: MigrationReason::OldPathExists,
        })
    } else if old_path.exists() && new_path.exists() {
        // 两个路径都存在，需要用户确认
        Some(MigrationCheck {
            needed: true,
            old_path: old_path.to_string_lossy().to_string(),
            new_path: new_path.to_string_lossy().to_string(),
            reason: MigrationReason::BothPathsExist,
        })
    } else {
        None
    }
}

/// 迁移检查结果
#[derive(Debug, Clone, serde::Serialize)]
pub struct MigrationCheck {
    /// 是否需要迁移
    pub needed: bool,
    /// 旧路径
    pub old_path: String,
    /// 新路径
    pub new_path: String,
    /// 迁移原因
    pub reason: MigrationReason,
}

/// 迁移原因
#[derive(Debug, Clone, serde::Serialize)]
pub enum MigrationReason {
    /// 旧路径存在，新路径不存在
    OldPathExists,
    /// 两个路径都存在
    BothPathsExist,
}

#[cfg(test)]
#[path = "tests/migration.rs"]
mod tests;
