import { memo } from 'react'
import type { TFunction } from 'i18next'
import type { ToolOption, ToolStatusDto } from '../types'

type AddSkillModalProps = {
  open: boolean
  loading: boolean
  canClose: boolean
  addModalTab: 'local' | 'git' | 'openskills'
  localPath: string
  localName: string
  gitUrl: string
  gitName: string
  syncTargets: Record<string, boolean>
  installedTools: ToolOption[]
  toolStatus: ToolStatusDto | null
  onRequestClose: () => void
  onTabChange: (tab: 'local' | 'git' | 'openskills') => void
  onLocalPathChange: (value: string) => void
  onPickLocalPath: () => void
  onLocalNameChange: (value: string) => void
  onGitUrlChange: (value: string) => void
  onGitNameChange: (value: string) => void
  onSyncTargetChange: (toolId: string, checked: boolean) => void
  onSubmit: () => void
  onOpenSkillsClick?: () => void
  t: TFunction
}

const AddSkillModal = ({
  open,
  loading,
  canClose,
  addModalTab,
  localPath,
  localName,
  gitUrl,
  gitName,
  syncTargets,
  installedTools,
  toolStatus,
  onRequestClose,
  onTabChange,
  onLocalPathChange,
  onPickLocalPath,
  onLocalNameChange,
  onGitUrlChange,
  onGitNameChange,
  onSyncTargetChange,
  onSubmit,
  onOpenSkillsClick,
  t,
}: AddSkillModalProps) => {
  if (!open) return null

  return (
    <div
      className="modal-backdrop"
      onClick={() => (canClose ? onRequestClose() : null)}
    >
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{t('addSkillTitle')}</div>
          <button
            className="modal-close"
            type="button"
            onClick={onRequestClose}
            aria-label={t('close')}
            disabled={!canClose}
          >
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="tabs">
            <button
              className={`tab-item${addModalTab === 'local' ? ' active' : ''}`}
              type="button"
              onClick={() => onTabChange('local')}
            >
              {t('localTab')}
            </button>
            <button
              className={`tab-item${addModalTab === 'git' ? ' active' : ''}`}
              type="button"
              onClick={() => onTabChange('git')}
            >
              {t('gitTab')}
            </button>
            <button
              className={`tab-item${addModalTab === 'openskills' ? ' active' : ''}`}
              type="button"
              onClick={() => onTabChange('openskills')}
            >
              OpenSkills
            </button>
            <button className="tab-item disabled" type="button" disabled>
              {t('searchTab')}
            </button>
          </div>

          {addModalTab === 'local' ? (
            <>
              <div className="form-group">
                <label className="label">{t('localFolder')}</label>
                <div className="input-row">
                  <input
                    className="input"
                    placeholder={t('localPathPlaceholder')}
                    value={localPath}
                    onChange={(event) => onLocalPathChange(event.target.value)}
                  />
                  <button
                    className="btn btn-secondary input-action"
                    type="button"
                    onClick={onPickLocalPath}
                    disabled={!canClose}
                  >
                    {t('browse')}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="label">{t('optionalNamePlaceholder')}</label>
                <input
                  className="input"
                  placeholder={t('optionalNamePlaceholder')}
                  value={localName}
                  onChange={(event) => onLocalNameChange(event.target.value)}
                />
              </div>
            </>
          ) : addModalTab === 'git' ? (
            <>
              <div className="form-group">
                <label className="label">{t('repositoryUrl')}</label>
                <input
                  className="input"
                  placeholder={t('gitUrlPlaceholder')}
                  value={gitUrl}
                  onChange={(event) => onGitUrlChange(event.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="label">{t('optionalNamePlaceholder')}</label>
                <input
                  className="input"
                  placeholder={t('optionalNamePlaceholder')}
                  value={gitName}
                  onChange={(event) => onGitNameChange(event.target.value)}
                />
              </div>
            </>
          ) : (
            // OpenSkills 标签页
            <div className="form-group">
              <label className="label">从 OpenSkills 安装</label>
              <p className="helper-text" style={{ marginBottom: '1rem' }}>
                OpenSkills 是一个通用的 AI 编程代理技能加载器。点击下方按钮打开安装界面。
              </p>
              <button
                className="btn btn-primary"
                type="button"
                onClick={onOpenSkillsClick}
                disabled={!canClose}
                style={{ width: '100%' }}
              >
                打开 OpenSkills 安装界面
              </button>
            </div>
          )}

          <div className="form-group">
            <label className="label">{t('installToTools')}</label>
            {toolStatus ? (
              <div className="tool-matrix">
                {installedTools.map((tool) => (
                  <label
                    key={tool.id}
                    className={`tool-pill-toggle${
                      syncTargets[tool.id] ? ' active' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(syncTargets[tool.id])}
                      onChange={(event) =>
                        onSyncTargetChange(tool.id, event.target.checked)
                      }
                    />
                    {syncTargets[tool.id] ? <span className="status-badge" /> : null}
                    {tool.label}
                  </label>
                ))}
              </div>
            ) : (
              <div className="helper-text">{t('detectingTools')}</div>
            )}
            <div className="helper-text">{t('syncAfterCreate')}</div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onRequestClose}
            disabled={!canClose}
          >
            {t('cancel')}
          </button>
          {addModalTab !== 'openskills' && (
            <button
              className="btn btn-primary"
              onClick={onSubmit}
              disabled={loading}
            >
              {addModalTab === 'local' ? t('create') : t('install')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(AddSkillModal)
