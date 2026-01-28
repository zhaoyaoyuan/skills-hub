# OpenSkills 集成可行性分析

## 📊 项目概述

本文档分析将 [OpenSkills](https://github.com/numman-ali/openskills) 集成到 Skills Hub 的可行性、架构设计和实施方案。

**分析日期**: 2026-01-28
**Skills Hub 版本**: 基于 main 分支
**OpenSkills 版本**: v1.5.0

---

## 🔍 OpenSkills 简介

### 核心特性

OpenSkills 是一个通用的 AI 编程代理技能加载器，特点：

- **统一格式**: 完全兼容 Anthropic 的 `SKILL.md` + `AGENTS.md` 规范
- **通用性**: 支持 Claude Code、Cursor、Windsurf、Aider、Codex 等所有能读取 `AGENTS.md` 的工具
- **渐进式加载**: 按需加载技能，保持上下文清洁
- **市场支持**: 从任何 GitHub 仓库、本地路径或私有 Git 仓库安装
- **CLI 工具**: 通过 `npx openskills` 命令行操作

### 工作原理

OpenSkills 生成符合 Anthropic 规范的 `AGENTS.md` 文件：

```xml
<skills_system priority="1">
<!-- SKILLS_TABLE_START -->
<available_skills>
<skill>
<name>pdf</name>
<description>Comprehensive PDF manipulation toolkit...</description>
<location>project</location>
</skill>
</available_skills>
<!-- SKILLS_TABLE_END -->
</skills_system>
```

**调用方式**: `npx openskills read <skill-name>`

---

## 📊 Skills Hub vs OpenSkills 对比

| 维度 | Skills Hub | OpenSkills |
|------|-----------|------------|
| **应用类型** | 桌面应用（Tauri） | CLI 工具 |
| **后端语言** | Rust | Node.js/TypeScript |
| **中央仓库** | `~/.skillshub/` | `~/.claude/skills/` 或 `~/.agent/skills/` |
| **技能发现** | 扫描工具目录 + Git | 生成 `AGENTS.md` |
| **分发方式** | 符号链接/复制/连接点 | 文件复制 |
| **技能调用** | 工具原生加载 | `npx openskills read <name>` |
| **兼容工具** | 14 种 AI 编程工具 | 任何能读 `AGENTS.md` 的工具 |
| **技能格式** | 自定义（SQLite + 文件） | Anthropic 标准（`SKILL.md` + `AGENTS.md`）|
| **UI 界面** | ✅ 完整的桌面 GUI | ❌ 纯 CLI |
| **元数据管理** | ✅ SQLite 数据库 | ❌ 仅文件系统 |
| **多工具同步** | ✅ 一键同步到所有工具 | ❌ 需手动配置 |

---

## ✅ 集成优势

### 1. **标准化兼容**
- OpenSkills 使用 Anthropic 官方的 `SKILL.md` 格式
- Skills Hub 可以采用相同格式，提升兼容性
- 两个生态可以无缝互通

### 2. **扩展现有能力**
- Skills Hub 提供 GUI 和多工具管理
- OpenSkills 提供标准化的技能格式和 `AGENTS.md` 生成
- 互补而非竞争

### 3. **技能市场生态**
- OpenSkills 技能可以直接在 Skills Hub 中使用
- Skills Hub 用户可以访问 OpenSkills 的 GitHub 仓库生态

### 4. **渐进式加载**
- OpenSkills 的按需加载机制可以减少上下文污染
- 提升大语言代理的性能

---

## ⚠️ 架构冲突

### 1. **存储模型差异** ⭐️ **已解决**

**Skills Hub（旧版）**:
```
~/.skillshub/
├── skill-1/
├── skill-2/
└── skills.db (SQLite)
```

**OpenSkills**:
```
优先级（从高到低）:
1. ./.agent/skills/
2. ~/.agent/skills/
3. ./.claude/skills/
4. ~/.claude/skills/
```

**💡 架构优化方案：统一使用 `~/.agent/skills/`**

通过将 Skills Hub 的默认存储路径改为 `~/.agent/skills/`，并使用 OpenSkills 的 `--universal` 参数，可以实现：

- ✅ **路径完全一致**: 两者使用相同的存储目录
- ✅ **技能自动共享**: Skills Hub 安装的技能，OpenSkills 可以直接使用
- ✅ **零配置集成**: 无需复杂的路径适配逻辑
- ✅ **符合标准**: 遵循 OpenSkills 的 universal 模式设计

**优化后的存储结构**:
```
~/.agent/skills/
├── skill-1/
│   └── SKILL.md
├── skill-2/
│   └── SKILL.md
└── (Skills Hub 元数据仍在 SQLite)
```

**实现代码**:
```rust
// src-tauri/src/core/central_repo.rs

const CENTRAL_DIR_NAME: &str = ".agent";
const SKILLS_SUBDIR: &str = "skills";

pub fn resolve_central_repo_path<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    store: &SkillStore,
) -> Result<PathBuf> {
    // 用户可以自定义路径
    if let Some(path) = store.get_setting("central_repo_path")? {
        return Ok(PathBuf::from(path));
    }

    // 默认使用 ~/.agent/skills/（与 OpenSkills --universal 一致）
    if let Some(home) = home_dir() {
        return Ok(home.join(CENTRAL_DIR_NAME).join(SKILLS_SUBDIR));
    }

    let base = app
        .path()
        .app_data_dir()
        .context("failed to resolve app data dir")?;
    Ok(base.join(CENTRAL_DIR_NAME).join(SKILLS_SUBDIR))
}
```

**OpenSkills 调用（始终使用 --universal）**:
```rust
impl OpenSkillsAdapter {
    /// 安装技能到统一路径
    pub fn install_skill_universal(source: &str) -> Result<()> {
        let mut cmd = Command::new("npx");
        cmd.args(&["openskills", "install", source]);

        // 使用 --universal 确保安装到 ~/.agent/skills/
        cmd.arg("--universal");

        let output = cmd.output()
            .context("Failed to run OpenSkills install")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            anyhow::bail!("OpenSkills install failed: {}", stderr);
        }

        Ok(())
    }
}
```

**优势对比**:

| 维度 | 之前（~/.skillshub/） | 现在（~/.agent/skills/） |
|------|---------------------|------------------------|
| **路径一致性** | ❌ 不同 | ✅ 完全一致 |
| **OpenSkills 集成** | 需要参数配置 | 使用 `--universal` |
| **多工具兼容性** | 需要适配 | ✅ 原生支持 |
| **技能迁移** | 需要手动复制 | ✅ 自动共享 |
| **用户学习成本** | 需要理解两套路径 | ✅ 统一概念 |
| **存储空间** | 重复存储 | ✅ 节省空间 |

**迁移策略**:

对于现有用户，提供自动迁移功能：

```rust
// src-tauri/src/core/migration.rs

pub fn migrate_to_agent_skills(old_path: &Path, new_path: &Path) -> Result<()> {
    if !old_path.exists() {
        return Ok(());
    }

    // 检查是否已迁移
    if new_path.exists() {
        log::info!("Target path already exists, skipping migration");
        return Ok(());
    }

    // 创建新目录
    std::fs::create_dir_all(new_path)?;

    // 移动技能目录
    for entry in std::fs::read_dir(old_path)? {
        let entry = entry?;
        let src = entry.path();
        let dest = new_path.join(entry.file_name());

        std::fs::rename(&src, &dest)
            .with_context(|| format!("Failed to move {:?} to {:?}", src, dest))?;
    }

    // 删除旧目录
    std::fs::remove_dir_all(old_path)?;

    log::info!("Migrated skills from {:?} to {:?}", old_path, new_path);
    Ok(())
}
```

**影响**:
- ✅ 存储策略统一，无需复杂的路径适配
- ⚠️ 需要处理现有用户的迁移（提供迁移工具）
- ⚠️ 需要向后兼容（支持旧路径配置）

### 2. **同步机制差异**

**Skills Hub**:
- 符号链接/复制文件到工具目录
- 适用于不支持 `AGENTS.md` 的工具（如 Cursor）

**OpenSkills**:
- 生成 `AGENTS.md` 文件
- 依赖工具读取该文件

**影响**:
- Skills Hub 的符号链接方式与 OpenSkills 的声明式方式不兼容
- 需要支持两种模式

### 3. **调用方式差异**

**Skills Hub**:
- 工具直接从文件系统读取技能
- 无需额外命令

**OpenSkills**:
- 通过 `npx openskills read <name>` 动态加载
- 需要工具支持 CLI 调用

**影响**:
- 不支持 CLI 调用的工具无法使用 OpenSkills
- Skills Hub 的符号链接方式对这些工具更友好

### 4. **依赖冲突**

**Skills Hub**: 纯 Rust，无外部依赖
**OpenSkills**: 需要 Node.js 20.6+

**影响**:
- 增加部署复杂度
- 需要确保用户环境中安装了 Node.js

---

## 🚀 推荐集成方案

### 方案 A: OpenSkills 作为后端引擎 ⭐⭐⭐⭐⭐

**核心思路**: Skills Hub 保留 UI 和管理功能，将技能安装/同步委托给 OpenSkills CLI

#### 架构设计

```
┌─────────────────────────────────────────┐
│     Skills Hub UI (React + Tauri)        │
│  - 统一管理界面                           │
│  - 多工具同步控制                         │
│  - 可视化技能状态                         │
└─────────────────┬───────────────────────┘
                  │ Tauri Commands
┌─────────────────▼───────────────────────┐
│         Skills Hub Backend (Rust)        │
│  - 调用 OpenSkills CLI                   │
│  - 管理工具适配器                         │
│  - 存储 SQLite 元数据                     │
└─────────────────┬───────────────────────┘
                  │ std::process::Command
┌─────────────────▼───────────────────────┐
│         OpenSkills CLI (Node.js)         │
│  - install / sync / update               │
│  - 生成 AGENTS.md                         │
└─────────────────┬───────────────────────┘
                  │ 文件操作
┌─────────────────▼───────────────────────┐
│    技能存储 + AGENTS.md 生成             │
└─────────────────────────────────────────┘
```

#### 实施要点

1. **Rust 适配器** (`src-tauri/src/core/openskills_adapter.rs`)
   - 封装 OpenSkills CLI 调用
   - 处理输出解析
   - 错误处理和日志记录

2. **Tauri Commands** (`src-tauri/src/commands/openskills.rs`)
   - `openskills_install`: 安装技能
   - `openskills_sync`: 同步 AGENTS.md
   - `openskills_list`: 列出已安装技能
   - `openskills_update`: 更新技能
   - `check_openskills_available`: 检查可用性

3. **前端 UI 增强**
   - 添加 OpenSkills 安装模态框
   - 设置页面添加 OpenSkills 开关
   - 显示 OpenSkills 技能状态

#### 优势

- ✅ 复用 OpenSkills 生态
- ✅ 符合 Anthropic 官方规范
- ✅ 支持 `AGENTS.md` 渐进式加载
- ✅ 统一管理界面
- ✅ 最小代码改动

#### 风险

- ⚠️ 依赖 Node.js 环境
- ⚠️ 需要维护两个系统的兼容性
- ⚠️ CLI 调用可能较慢

---

### 方案 B: 混合模式 ⭐⭐⭐⭐

**核心思路**: 对支持 `AGENTS.md` 的工具使用 OpenSkills，对不支持的工具继续使用 Skills Hub 的符号链接

#### 同步策略枚举

```rust
pub enum SyncStrategy {
    OpenSkills,    // 使用 OpenSkills + AGENTS.md
    Hybrid,        // 使用 Skills Hub 的符号链接/复制
}
```

#### 工具适配器扩展

```rust
pub struct ToolAdapter {
    pub key: String,
    pub display_name: String,
    pub skills_dir: PathBuf,
    pub supports_agents_md: bool,  // 新增：是否支持 AGENTS.md
    // ...
}
```

#### 优势

- ✅ 最大兼容性
- ✅ 灵活的同步策略
- ✅ 渐进式迁移

#### 风险

- ⚠️ 代码复杂度增加
- ⚠️ 需要维护两套同步逻辑

---

### 方案 C: 仅生成 AGENTS.md ⭐⭐⭐

**核心思路**: Skills Hub 继续使用符号链接，但额外生成 `AGENTS.md` 以兼容 OpenSkills 生态

#### 实施要点

1. 实现 `AGENTS.md` 生成器
2. 在技能更新时自动重新生成
3. 前端添加导出功能

#### 优势

- ✅ 无需依赖 OpenSkills
- ✅ 保持现有架构
- ✅ 最小风险

#### 风险

- ⚠️ 无法使用 OpenSkills 的安装和管理功能
- ⚠️ 需要手动维护 `AGENTS.md` 格式

---

## 📋 实施步骤

### 阶段 0: 路径统一优化（1 天）⭐ **新增 - 最高优先级**

**目标**: 将 Skills Hub 的默认存储路径改为 `~/.agent/skills/`

**任务**:
1. ✅ 修改 `central_repo.rs` 默认路径为 `.agent/skills/`
2. ✅ 添加旧用户迁移逻辑（`migration.rs`）
3. ✅ 更新 OpenSkills 适配器，始终使用 `--universal`
4. ✅ 前端添加迁移提示 UI
5. ✅ 测试路径兼容性

**验收**:
- 新用户默认使用 `~/.agent/skills/`
- 旧用户可以迁移到新路径
- 迁移过程安全可靠
- 向后兼容旧路径配置

**优先级**: 🔴 **最高** - 这是后续集成的基础

---

### 阶段 1: 基础集成（1-2 天）

**目标**: 实现 OpenSkills 作为后端引擎

**任务**:
1. ✅ 创建 `openskills_adapter.rs`
2. ✅ 添加 Tauri commands
3. ✅ 前端添加 OpenSkills 安装模态框
4. ✅ 测试基本功能

**验收**:
- 可以通过 Skills Hub UI 调用 OpenSkills 安装技能
- 成功生成 `AGENTS.md`
- 基础错误处理
- ✅ 技能自动存储到 `~/.agent/skills/`

### 阶段 2: 深度集成（2-3 天）

**目标**: 添加混合模式支持

**任务**:
1. ✅ 添加混合模式支持
2. ✅ 更新工具适配器，标记支持 `AGENTS.md` 的工具
3. ✅ UI 中显示同步策略
4. ✅ 测试多工具场景

**验收**:
- 支持两种同步策略切换
- 自动检测工具是否支持 `AGENTS.md`
- 混合场景下正常工作
- ✅ 技能在两个系统间无缝共享

### 阶段 3: 优化体验（1-2 天）

**目标**: 提升用户体验

**任务**:
1. ✅ 自动检测 OpenSkills 可用性
2. ✅ 提示用户安装 OpenSkills
3. ✅ 文档更新
4. ✅ 性能优化

**验收**:
- 自动引导用户安装 OpenSkills
- 完整的用户文档
- 响应时间 < 2s
- ✅ 清晰的迁移指导

---

## 🛠️ 技术实现示例

### Rust 适配器核心代码

```rust
// src-tauri/src/core/openskills_adapter.rs

use std::process::Command;
use anyhow::{Context, Result};

pub struct OpenSkillsAdapter;

impl OpenSkillsAdapter {
    /// 检查 OpenSkills 是否可用
    pub fn is_available() -> Result<bool> {
        let output = Command::new("npx")
            .args(&["openskills", "--version"])
            .output()
            .context("Failed to check OpenSkills availability")?;

        Ok(output.status.success())
    }

    /// 安装技能
    pub fn install_skill(
        source: &str,
        global: bool,
        universal: bool,
    ) -> Result<()> {
        let mut cmd = Command::new("npx");
        cmd.args(&["openskills", "install", source]);

        if global { cmd.arg("--global"); }
        if universal { cmd.arg("--universal"); }

        let output = cmd.output()
            .context("Failed to run OpenSkills install")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            anyhow::bail!("OpenSkills install failed: {}", stderr);
        }

        Ok(())
    }

    /// 同步 AGENTS.md
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
        Ok(stdout.trim().to_string())
    }

    /// 更新技能
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

        Ok(())
    }
}
```

### Tauri Commands

```rust
// src-tauri/src/commands/openskills.rs

use crate::core::openskills_adapter::OpenSkillsAdapter;

#[tauri::command]
pub async fn check_openskills_available() -> Result<bool, String> {
    OpenSkillsAdapter::is_available()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn openskills_install(
    source: String,
    global: bool,
    universal: bool,
) -> Result<(), String> {
    OpenSkillsAdapter::install_skill(&source, global, universal)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn openskills_sync(
    output_path: Option<String>,
) -> Result<String, String> {
    OpenSkillsAdapter::sync_agents_md(output_path.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn openskills_update(
    names: Option<Vec<String>>,
) -> Result<(), String> {
    OpenSkillsAdapter::update_skills(names)
        .map_err(|e| e.to_string())
}
```

---

## ✅ 总结与建议

### 可行性评估: ⭐⭐⭐⭐⭐ (5/5)

**强烈推荐实施**，理由：

1. **生态互补**: Skills Hub 的 UI 管理能力 + OpenSkills 的标准化格式
2. **技术可行**: Rust 可以轻松调用 CLI，实施风险低
3. **用户价值**: 统一管理 OpenSkills 生态技能，提升体验
4. **未来兼容**: 符合 Anthropic 官方规范，长期可维护

### 推荐方案

**阶段 0**（1 天）: 统一存储路径为 `~/.agent/skills/` ⭐ **最高优先级**
**短期** (1-2 周): 实施方案 A（OpenSkills 作为后端引擎）
**中期** (1 个月): 扩展为方案 B（混合模式）
**长期** (3 个月): 完善 UI 和文档，社区推广

### 关键风险

1. **依赖管理**: 需要确保用户环境中安装了 Node.js
2. **性能优化**: CLI 调用可能有延迟，需要缓存和异步处理
3. **版本兼容**: OpenSkills 版本更新时需要测试兼容性

### 下一步行动

1. 创建 `feature/openskills-integration` 分支 ✅
2. 保存本可行性分析文档 ✅
3. **优先实施阶段 0：路径统一优化** ⭐
4. 实施阶段 1 的基础集成
5. 定期同步到 main 分支

### 关键里程碑

- [x] 完成可行性分析
- [x] 创建功能分支
- [ ] **统一存储路径（阶段 0）** ⭐ 最高优先级
- [ ] 实现 OpenSkills 适配器
- [ ] 前端 UI 集成
- [ ] 用户迁移工具
- [ ] 完整测试
- [ ] 文档完善
- [ ] 发布 v1.0

---

**文档版本**: v1.1
**作者**: Skills Hub Team
**更新日期**: 2026-01-28
**更新内容**:
- ✨ 新增：路径统一优化方案（阶段 0）
- ✨ 新增：`~/.agent/skills/` 存储架构
- ✨ 新增：OpenSkills `--universal` 集成策略
- ✨ 新增：用户迁移工具设计
- 📝 更新：实施步骤优先级调整
