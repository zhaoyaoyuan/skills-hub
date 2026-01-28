use std::process::Command;
use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};

/// OpenSkills CLI 适配器
///
/// 封装对 OpenSkills CLI 的调用，使用 --universal 参数确保与 Skills Hub 路径一致
pub struct OpenSkillsAdapter;

/// OpenSkills 技能信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenSkillsSkill {
    pub name: String,
    pub description: Option<String>,
    pub location: String, // "project" | "global" | "universal"
}

/// OpenSkills 列表输出（解析后的）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenSkillsList {
    pub skills: Vec<OpenSkillsSkill>,
}

impl OpenSkillsAdapter {
    /// 检查 OpenSkills 是否可用
    pub fn is_available() -> Result<bool> {
        let output = Command::new("npx")
            .args(&["openskills", "--version"])
            .output()
            .context("Failed to check OpenSkills availability")?;

        Ok(output.status.success())
    }

    /// 安装技能（始终使用 --universal）
    ///
    /// # 参数
    /// * `source` - 技能来源（GitHub 仓库、本地路径等）
    ///
    /// # 示例
    /// ```ignore
    /// install_skill("anthropics/skills")?;
    /// install_skill("./local-skill")?;
    /// ```
    pub fn install_skill(source: &str) -> Result<()> {
        let mut cmd = Command::new("npx");
        cmd.args(&["openskills", "install", source]);

        // 始终使用 --universal 确保安装到 ~/.agent/skills/
        cmd.arg("--universal");

        let output = cmd.output()
            .context("Failed to run OpenSkills install")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            anyhow::bail!("OpenSkills install failed: {}", stderr);
        }

        log::info!("OpenSkills install succeeded: {}", source);
        Ok(())
    }

    /// 同步 AGENTS.md
    ///
    /// # 参数
    /// * `output_path` - 可选的输出文件路径（默认为 AGENTS.md）
    ///
    /// # 返回
    /// 生成的 AGENTS.md 文件路径
    pub fn sync_agents_md(output_path: Option<&str>) -> Result<String> {
        let mut cmd = Command::new("npx");
        cmd.args(&["openskills", "sync", "-y"]);

        if let Some(path) = output_path {
            cmd.args(&["-o", path]);
        }

        let output = cmd.output()
            .context("Failed to run OpenSkills sync")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            anyhow::bail!("OpenSkills sync failed: {}", stderr);
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        let path = stdout.trim().to_string();

        log::info!("OpenSkills sync succeeded: {}", path);
        Ok(path)
    }

    /// 列出已安装的技能
    pub fn list_skills() -> Result<Vec<OpenSkillsSkill>> {
        let output = Command::new("npx")
            .args(&["openskills", "list"])
            .output()
            .context("Failed to list OpenSkills")?;

        if !output.status.success() {
            anyhow::bail!("Failed to list skills");
        }

        // 解析输出（假设是 JSON 或结构化文本）
        let stdout = String::from_utf8_lossy(&output.stdout);

        // TODO: 根据实际输出格式解析
        // 目前返回空向量，实际实现需要解析 OpenSkills 的输出格式
        Ok(vec![])
    }

    /// 更新技能
    ///
    /// # 参数
    /// * `names` - 可选的技能名称列表（None 表示更新所有）
    pub fn update_skills(names: Option<Vec<String>>) -> Result<()> {
        let mut cmd = Command::new("npx");
        cmd.args(&["openskills", "update"]);

        if let Some(names) = names {
            let names_str = names.join(",");
            cmd.arg(&names_str);
        }

        let output = cmd.output()
            .context("Failed to update OpenSkills")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            anyhow::bail!("OpenSkills update failed: {}", stderr);
        }

        log::info!("OpenSkills update succeeded");
        Ok(())
    }

    /// 读取技能内容
    ///
    /// # 参数
    /// * `name` - 技能名称
    ///
    /// # 返回
    /// 技能的完整内容（SKILL.md）
    pub fn read_skill(name: &str) -> Result<String> {
        let output = Command::new("npx")
            .args(&["openskills", "read", name])
            .output()
            .context("Failed to read skill")?;

        if !output.status.success() {
            anyhow::bail!("Failed to read skill: {}", name);
        }

        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    }

    /// 移除技能
    ///
    /// # 参数
    /// * `name` - 技能名称
    pub fn remove_skill(name: &str) -> Result<()> {
        let output = Command::new("npx")
            .args(&["openskills", "remove", name])
            .output()
            .context("Failed to remove skill")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            anyhow::bail!("OpenSkills remove failed: {}", stderr);
        }

        log::info!("OpenSkills remove succeeded: {}", name);
        Ok(())
    }
}

#[cfg(test)]
#[path = "tests/openskills_adapter.rs"]
mod tests;
