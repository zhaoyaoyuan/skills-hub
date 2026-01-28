import { memo, useState } from 'react'
import { Download, ExternalLink, Github, Loader2 } from 'lucide-react'
import type { TFunction } from 'i18next'

type OpenSkillsInstallModalProps = {
  open: boolean
  loading: boolean
  onRequestClose: () => void
  onInstall: (source: string) => Promise<void>
  t?: TFunction // 保留用于未来的国际化
}

const OpenSkillsInstallModal = ({
  open,
  loading,
  onRequestClose,
  onInstall,
}: OpenSkillsInstallModalProps) => {
  const [source, setSource] = useState('')

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!source.trim()) {
      return
    }

    await onInstall(source.trim())
    setSource('')
  }

  const suggestions = [
    { name: 'Anthropic 官方技能库', value: 'anthropics/skills', icon: Github },
    { name: 'GitHub 仓库', value: 'owner/repo', icon: ExternalLink },
  ]

  return (
    <div className="modal-backdrop" onClick={onRequestClose}>
      <div
        className="modal modal-openskills"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-body">
          {/* Header */}
          <div className="modal-header">
            <h2 className="text-lg font-semibold">从 OpenSkills 安装技能</h2>
            <button
              onClick={onRequestClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={loading}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="modal-content space-y-4 py-4">
            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              OpenSkills 是一个通用的 AI 编程代理技能加载器。输入 GitHub 仓库或本地路径即可安装技能。
            </p>

            {/* Requirements */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
              <h3 className="font-medium text-sm mb-2 text-amber-900 dark:text-amber-100">
                ⚠️ 使用前准备
              </h3>
              <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                <li>1. 安装 Node.js: <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">nodejs.org</a></li>
                <li>2. 安装 OpenSkills: <code>npm install -g openskills</code></li>
                <li>3. 确保终端可以执行 <code>openskills --version</code></li>
              </ul>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-medium text-sm mb-2 text-blue-900 dark:text-blue-100">
                💡 支持的格式
              </h3>
              <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                <li>• GitHub 仓库: <code>owner/repo</code> 或 <code>https://github.com/owner/repo</code></li>
                <li>• 本地路径: <code>./local-skill</code> (相对于项目根目录)</li>
                <li>• 仓库子目录: <code>owner/repo/tree/main/skills/skill-name</code></li>
                <li>• 私有仓库: <code>git@github.com:owner/private-repo.git</code></li>
              </ul>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  技能来源
                </label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="例如: anthropics/skills 或 ./local-skill"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Suggestions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  快速选择
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.value}
                      type="button"
                      onClick={() => setSource(suggestion.value)}
                      disabled={loading}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <suggestion.icon size={16} />
                      <span>{suggestion.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onRequestClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading || !source.trim()}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>安装中...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>安装</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(OpenSkillsInstallModal)
