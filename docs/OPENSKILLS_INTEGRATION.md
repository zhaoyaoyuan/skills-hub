# OpenSkills 集成功能说明

> **状态**: 后端完成 100%，前端待实现
> **分支**: `feature/openskills-integration`
> **版本**: v0.1.0-beta

---

## ✨ 已实现功能

### 1. 路径统一优化 ✅

**变更**: 默认存储路径从 `~/.skillshub/` 改为 `~/.agent/skills/`

**优势**:
- ✅ 与 OpenSkills `--universal` 模式完全一致
- ✅ 技能在两个系统间自动共享
- ✅ 零配置集成
- ✅ 符合行业标准

**向后兼容**: 保留用户自定义路径配置

---

### 2. 用户迁移系统 ✅

**功能**:
- 自动检测旧版路径 (`~/.skillshub/`)
- 安全迁移数据到新路径
- 冲突检测和错误处理
- 详细的迁移反馈

**Tauri Commands**:
```typescript
// 检查是否需要迁移
const check = await invoke<MigrationCheck | null>('check_migration_needed_cmd');

// 执行迁移
const result = await invoke<MigrationResult>('migrate_skills_cmd');

// 获取当前存储路径
const path = await invoke<string>('get_storage_path_cmd');
```

---

### 3. OpenSkills CLI 集成 ✅

**功能**:
- 完整封装 OpenSkills CLI
- ��终使用 `--universal` 参数
- 7 个核心命令

**Tauri Commands**:
```typescript
// 检查 OpenSkills 是否可用
const available = await invoke<boolean>('check_openskills_available_cmd');

// 安装技能
await invoke('openskills_install_cmd', { source: 'anthropics/skills' });

// 同步 AGENTS.md
const agentsPath = await invoke<string>('openskills_sync_cmd', {});

// 列出技能
const skills = await invoke<OpenSkillsSkill[]>('openskills_list_cmd');

// 更新技能
await invoke('openskills_update_cmd', { names: ['pdf', 'xlsx'] });

// 读取技能内容
const content = await invoke<string>('openskills_read_cmd', { name: 'pdf' });

// 移除技能
await invoke('openskills_remove_cmd', { name: 'pdf' });
```

---

## 📋 使用示例

### 场景 1: 检测并执行迁移

```typescript
import { invoke } from '@tauri-apps/api/core';

// 启动时检查
useEffect(() => {
  invoke<MigrationCheck | null>('check_migration_needed_cmd')
    .then((check) => {
      if (check) {
        console.log(`发现旧路径: ${check.old_path}`);
        console.log(`新路径: ${check.new_path}`);

        // 显示迁移提示对话框
        setShowMigrationModal(true);
      }
    });
}, []);
```

### 场景 2: 通过 OpenSkills 安装技能

```typescript
const installFromOpenSkills = async (source: string) => {
  try {
    // 1. 检查 OpenSkills 可用性
    const available = await invoke<boolean>('check_openskills_available_cmd');
    if (!available) {
      alert('未检测到 OpenSkills，请先安装: npm install -g openskills');
      return;
    }

    // 2. 安装技能
    await invoke('openskills_install_cmd', { source });

    // 3. 同步 AGENTS.md
    await invoke('openskills_sync_cmd', {});

    alert('技能安装成功！');
  } catch (err) {
    console.error('安装失败:', err);
  }
};

// 使用示例
installFromOpenSkills('anthropics/skills');  // 从 GitHub 安装
installFromOpenSkills('./local-skill');    // 从本地路径安装
```

---

## 🏗️ 技术架构

```
┌─────────────────────────────────────────┐
│         Skills Hub UI (React)            │
│  - 迁移提示模态框 (待实现)               │
│  - OpenSkills 安装界面 (待实现)         │
└─────────────────┬───────────────────────┘
                  │ Tauri Commands
┌─────────────────▼───────────────────────┐
│       Skills Hub Backend (Rust)          │
│  - 路径统一: ~/.agent/skills/            │
│  - 迁移逻辑                             │
│  - OpenSkills 适配器                     │
└─────────────────┬───────────────────────┘
                  │ CLI 调用
┌─────────────────▼───────────────────────┐
│         OpenSkills CLI (Node.js)         │
│  - npx openskills install --universal     │
│  - npx openskills sync                    │
└─────────────────┬───────────────────────┘
                  │ 文件操作
┌─────────────────▼───────────────────────┐
│    ~/.agent/skills/                      │
│  - skill-1/                              │
│  - skill-2/                              │
│  - AGENTS.md                             │
└─────────────────────────────────────────┘
```

---

## 📦 文件变更

### 新增文件

**Rust 后端**:
- `src-tauri/src/core/migration.rs` - 迁移逻辑
- `src-tauri/src/core/openskills_adapter.rs` - OpenSkills 适配器

**文档**:
- `docs/openskills-integration-analysis.md` - 可行性分析
- `docs/implementation-progress.md` - 实施进展
- `docs/OPENSKILLS_INTEGRATION.md` - 本文档

### 修改文件

- `src-tauri/src/core/central_repo.rs` - 修改默认路径
- `src-tauri/src/core/mod.rs` - 导入新模块
- `src-tauri/src/commands/mod.rs` - 添加新命令
- `src-tauri/src/lib.rs` - 注册 Tauri 命令

---

## 🚀 快速开始

### 1. 检查环境

```bash
# 检查 Node.js 版本（需要 20.6+）
node --version

# 检查 OpenSkills 是否已安装
npx openskills --version

# 如果未安装，全局安装（可选）
npm install -g openskills
```

### 2. 构建项目

```bash
# 安装依赖
npm install

# 开发模式运行
npm run tauri:dev

# 构建生产版本
npm run tauri:build
```

### 3. 使用功能

#### 从旧路径迁移

如果检测到迁移提示，点击"立即迁移"按钮即可。

#### 使用 OpenSkills 安装技能

在应用内打开"添加技能"界面，选择 OpenSkills 作为来源，输入技能仓库地址即可。

---

## ⚠️ 注意事项

### 1. Node.js 依赖

OpenSkills 需要 Node.js 20.6+ 环境。如果用户未安装：
- 应用会提示安装 OpenSkills
- 提供 `npm install -g openskills` 命令
- 或者使用 `npx openskills` 无需全局安装

### 2. 路径变更

- **新用户**: 自动使用 `~/.agent/skills/`
- **旧用户**: 提供迁移工具，可选择迁移或保持旧路径
- **自定义路径**: 支持用户在设置中自定义路径

### 3. 兼容性

- ✅ 与 Claude Code 完全兼容
- ✅ 与 Cursor、Windsurf 等工具兼容
- ✅ 符合 Anthropic 官方规范

---

## 🐛 故障排除

### 问题 1: OpenSkills 不可用

**错误**: "未检测到 OpenSkills"

**解决方案**:
```bash
# 方法 1: 全局安装
npm install -g openskills

# 方法 2: 使用 npx（无需安装）
# 应用会自动使用 npx 调用
```

### 问题 2: 迁移失败

**错误**: "迁移失败: xxx"

**可能原因**:
- 新路径已存在（手动删除后再试）
- 旧路径不存在（无需迁移）
- 权限不足（检查文件权限）

### 问题 3: 技能安装失败

**错误**: "OpenSkills install failed: xxx"

**可能原因**:
- GitHub 仓库不存在或无法访问
- 网络问题（检查代理设置）
- 路径格式不正确

---

## 📚 相关文档

- [OpenSkills 官方文档](https://github.com/numman-ali/openskills)
- [Anthropic Skills 规范](https://docs.anthropic.com/en/docs/build-with-claude/skills)
- [可行性分析](./openskills-integration-analysis.md)
- [实施进展](./implementation-progress.md)

---

## 🤝 贡献

如果您想贡献代码或报告问题，请：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 Apache 2.0 许可证 - 查看 [LICENSE](../LICENSE) 文件了解详情

---

**文档版本**: v1.0.0
**更新日期**: 2026-01-28
**维护者**: Skills Hub Team
