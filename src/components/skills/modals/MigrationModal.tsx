import { memo } from 'react'
import { ArrowRight, CheckCircle2, Info } from 'lucide-react'
import type { TFunction } from 'i18next'

type MigrationModalProps = {
  open: boolean
  loading: boolean
  oldPath: string
  newPath: string
  onRequestClose: () => void
  onMigrate: () => void
  t?: TFunction // 保留用于未来的国际化
}

const MigrationModal = ({
  open,
  loading,
  oldPath,
  newPath,
  onRequestClose,
  onMigrate,
}: MigrationModalProps) => {
  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onRequestClose}>
      <div
        className="modal modal-migration"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-body">
          {/* Header */}
          <div className="modal-header">
            <div className="flex items-center gap-2">
              <Info className="text-blue-500" size={24} />
              <h2 className="text-lg font-semibold">检测到旧版存储路径</h2>
            </div>
          </div>

          {/* Content */}
          <div className="modal-content space-y-4 py-4">
            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              我们发现您的技能存储在旧路径中。建议迁移到新路径以获得更好的兼容性和功能。
            </p>

            {/* Path Comparison */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">旧路径:</span>
                <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                  {oldPath}
                </code>
              </div>

              <ArrowRight className="mx-auto text-gray-400" size={16} />

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">新路径:</span>
                <code className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded text-xs">
                  {newPath}
                </code>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-medium text-sm mb-3 text-blue-900 dark:text-blue-100">
                ✨ 迁移优势
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>与 OpenSkills 完全兼容</strong> - 使用统一的存储路径，技能自动共享
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>符合行业标准</strong> - 遵循 Anthropic 官方规范，与 Claude Code 等工具无缝集��
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>零配置使用</strong> - 无需手动配置，自动检测和同步技能
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>面向未来</strong> - 支持更多工具和功能的扩展
                  </span>
                </li>
              </ul>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-3 rounded-r">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                ⚠️ <strong>注意</strong>: 迁移会移动您的技能数据到新路径。建议先备份重要数据。
                迁移后旧路径中的技能将被移动，不会删除原始数据。
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="modal-footer flex justify-end gap-3">
            <button
              onClick={onRequestClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white disabled:opacity-50"
            >
              稍后处理
            </button>
            <button
              onClick={onMigrate}
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>迁移中...</span>
                </>
              ) : (
                <>
                  <span>立即迁移</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(MigrationModal)
