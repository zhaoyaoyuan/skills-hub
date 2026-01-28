import { memo } from 'react'
import { Plus, Settings, Trash2 } from 'lucide-react'
import type { TFunction } from 'i18next'

type HeaderProps = {
  language: string
  loading: boolean
  onToggleLanguage: () => void
  onOpenSettings: () => void
  onOpenAdd: () => void
  onDeleteAll?: () => void
  skillCount?: number
  t: TFunction
}

const Header = ({
  language,
  loading,
  onToggleLanguage,
  onOpenSettings,
  onOpenAdd,
  onDeleteAll,
  skillCount = 0,
  t,
}: HeaderProps) => {
  const hasSkills = skillCount > 0
  const canDeleteAll = hasSkills && onDeleteAll

  return (
    <header className="skills-header">
      <div className="brand-area">
        <img className="logo-icon" src="/logo.png" alt="" />
        <div className="brand-text-wrap">
          <div className="brand-text">{t('appName')}</div>
          <div className="brand-subtitle">{t('subtitle')}</div>
        </div>
      </div>
      <div className="header-actions">
        <button className="lang-btn" type="button" onClick={onToggleLanguage}>
          {language === 'en' ? t('languageShort.en') : t('languageShort.zh')}
        </button>
        {canDeleteAll && (
          <button
            className="icon-btn btn-danger"
            type="button"
            onClick={onDeleteAll}
            disabled={loading}
            title={t('deleteAllSkills')}
          >
            <Trash2 size={18} />
          </button>
        )}
        <button className="icon-btn" type="button" onClick={onOpenSettings}>
          <Settings size={18} />
        </button>
        <button
          className="btn btn-primary"
          type="button"
          onClick={onOpenAdd}
          disabled={loading}
        >
          <Plus size={16} />
          {t('newSkill')}
        </button>
      </div>
    </header>
  )
}

export default memo(Header)
