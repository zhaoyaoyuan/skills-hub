# 前端 UI 集成指南

本文档说明如何将新创建的 UI 组件集成到 Skills Hub 主应用中。

**状态**: 待集成
**优先级**: 高

---

## 📦 已创建组件

### 1. MigrationModal.tsx ✅

**路径**: `src/components/skills/modals/MigrationModal.tsx`

**功能**:
- 显示迁移提示
- 说明迁移优势
- 提供立即迁移/稍后处理选项
- 显示迁移进度

**Props**:
```typescript
type MigrationModalProps = {
  open: boolean
  loading: boolean
  oldPath: string
  newPath: string
  onRequestClose: () => void
  onMigrate: () => void
  t: TFunction
}
```

---

### 2. OpenSkillsInstallModal.tsx ✅

**路径**: `src/components/skills/modals/OpenSkillsInstallModal.tsx`

**功能**:
- 输入技能来源（GitHub 仓库、本地路径）
- 快速选择建议
- 显示安装进度
- 错误处理

**Props**:
```typescript
type OpenSkillsInstallModalProps = {
  open: boolean
  loading: boolean
  onRequestClose: () => void
  onInstall: (source: string) => Promise<void>
  t: TFunction
}
```

---

### 3. 类型定义 ✅

**路径**: `src/components/skills/types.ts`

**新增类型**:
- `MigrationCheck`
- `MigrationResult`
- `OpenSkillsSkill`

---

## 🔧 集成步骤

### 步骤 1: 在 App.tsx 中导入组件

在 `src/App.tsx` 顶部添加导入：

```typescript
import MigrationModal from './components/skills/modals/MigrationModal'
import OpenSkillsInstallModal from './components/skills/modals/OpenSkillsInstallModal'
import type {
  MigrationCheck,
  MigrationResult,
  OpenSkillsSkill,
} from './components/skills/types'
```

---

### 步骤 2: 添加状态变量

在 App 组件中添加新的状态：

```typescript
const [showMigrationModal, setShowMigrationModal] = useState(false)
const [migrationCheck, setMigrationCheck] = useState<MigrationCheck | null>(null)
const [migrationLoading, setMigrationLoading] = useState(false)

const [showOpenSkillsModal, setShowOpenSkillsModal] = useState(false)
const [openskillsLoading, setOpenSkillsLoading] = useState(false)
```

---

### 步骤 3: 添加迁移检查逻辑

在 `useEffect` 中添加启动时检查：

```typescript
useEffect(() => {
  if (!isTauri) return

  // 检查是否需要迁移
  invoke<MigrationCheck | null>('check_migration_needed_cmd')
    .then((check) => {
      if (check) {
        setMigrationCheck(check)
        setShowMigrationModal(true)
      }
    })
    .catch((err) => {
      console.warn('Migration check failed:', err)
    })
}, [isTauri])
```

---

### 步骤 4: 添加迁移处理函数

```typescript
const handleMigrate = async () => {
  if (!migrationCheck) return

  setMigrationLoading(true)
  try {
    const result = await invoke<MigrationResult>('migrate_skills_cmd')

    // 显示成功消息
    setSuccessToastMessage(`迁移完成: ${result.message}`)
    setShowMigrationModal(false)

    // 重新加载技能列表
    await loadManagedSkills()
  } catch (err) {
    setError(err instanceof Error ? err.message : String(err))
  } finally {
    setMigrationLoading(false)
  }
}
```

---

### 步骤 5: 添加 OpenSkills 安装函数

```typescript
const handleOpenSkillsInstall = async (source: string) => {
  setOpenSkillsLoading(true)
  try {
    // 1. 检查 OpenSkills 可用性
    const available = await invoke<boolean>('check_openskills_available_cmd')
    if (!available) {
      setError('未检测到 OpenSkills。请安装: npm install -g openskills')
      return
    }

    // 2. 安装技能
    await invoke('openskills_install_cmd', { source })

    // 3. 同步 AGENTS.md
    await invoke('openskills_sync_cmd', {})

    // 4. 显示成功消息
    setSuccessToastMessage('技能安装成功！')
    setShowOpenSkillsModal(false)

    // 5. 重新加载技能列表
    await loadManagedSkills()
  } catch (err) {
    setError(err instanceof Error ? err.message : String(err))
  } finally {
    setOpenSkillsLoading(false)
  }
}
```

---

### 步骤 6: 在 AddSkillModal 中添加 OpenSkills 标签页

找到 `AddSkillModal` 组件，添加第三个标签页：

```typescript
// 在 AddSkillModal 的 tab 切换中添加 'openskills' 选项
const [addModalTab, setAddModalTab] = useState<'local' | 'git' | 'openskills'>('git')

// 在标签页内容中添加 OpenSkills 标签
```

在标签页内容区域添加：

```tsx
{addModalTab === 'openskills' && (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-2">
        从 OpenSkills 安装
      </label>
      <button
        onClick={() => setShowOpenSkillsModal(true)}
        className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center gap-2"
      >
        <ExternalLink size={16} />
        <span>打开 OpenSkills 安装界面</span>
      </button>
    </div>
  </div>
)}
```

---

### 步骤 7: 在主渲染中添加模态框

在 `return` 语句的模态框部分添加：

```tsx
<MigrationModal
  open={showMigrationModal}
  loading={migrationLoading}
  oldPath={migrationCheck?.old_path || ''}
  newPath={migrationCheck?.new_path || ''}
  onRequestClose={() => setShowMigrationModal(false)}
  onMigrate={handleMigrate}
  t={t}
/>

<OpenSkillsInstallModal
  open={showOpenSkillsModal}
  loading={openskillsLoading}
  onRequestClose={() => setShowOpenSkillsModal(false)}
  onInstall={handleOpenSkillsInstall}
  t={t}
/>
```

---

## 🎨 样式说明

新组件使用了与现有组件一致的样式类：

- `modal-backdrop`: 背景遮罩
- `modal`: 模态框容器
- `modal-body`: 模态框主体
- `modal-header`: 头部
- `modal-content`: 内容区域
- `modal-footer`: 底部操作区

其他样式使用 Tailwind CSS 类名，与项目风格保持一致。

---

## ✅ 验证清单

集成完成后，请验证以下功能：

- [ ] 启动应用时自动检测旧路径
- [ ] 迁移模态框正确显示
- [ ] 点击"立即迁移"成功执行迁移
- [ ] OpenSkills 安装界面正常工作
- [ ] 可以从 GitHub 仓库安装技能
- [ ] 可以从本地路径安装技能
- [ ] 安装成功后自动同步 AGENTS.md
- [ ] 错误提示正确显示

---

## 🐛 常见问题

### Q1: 组件导入失败

**错误**: `Module not found: ./components/skills/modals/MigrationModal`

**解决**: 确保文件路径正确，文件已创建。

### Q2: 类型错误

**错误**: `Property 'xxx' does not exist on type 'xxx'`

**解决**: 确保已在 `types.ts` 中添加类型定义，并正确导入。

### Q3: 迁移检查不工作

**解决**: 检查 Tauri 命令是否正确注册到 `lib.rs`。

---

**文档版本**: v1.0
**更新日期**: 2026-01-28
