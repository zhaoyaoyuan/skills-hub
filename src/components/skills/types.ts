export type OnboardingVariant = {
  tool: string
  name: string
  path: string
  fingerprint?: string | null
  is_link: boolean
  link_target?: string | null
}

export type OnboardingGroup = {
  name: string
  variants: OnboardingVariant[]
  has_conflict: boolean
}

export type OnboardingPlan = {
  total_tools_scanned: number
  total_skills_found: number
  groups: OnboardingGroup[]
}

export type ToolOption = {
  id: string
  label: string
}

export type ManagedSkill = {
  id: string
  name: string
  source_type: string
  source_ref?: string | null
  central_path: string
  created_at: number
  updated_at: number
  last_sync_at?: number | null
  status: string
  targets: {
    tool: string
    mode: string
    status: string
    target_path: string
    synced_at?: number | null
  }[]
}

export type GitSkillCandidate = {
  name: string
  description?: string | null
  subpath: string
}

export type InstallResultDto = {
  skill_id: string
  name: string
  central_path: string
  content_hash?: string | null
}

export type ToolInfoDto = {
  key: string
  label: string
  installed: boolean
}

export type ToolStatusDto = {
  tools: ToolInfoDto[]
  installed: string[]
  newly_installed: string[]
}

export type UpdateResultDto = {
  skill_id: string
  name: string
  content_hash?: string | null
  source_revision?: string | null
  updated_targets: string[]
}

// ============== Migration Types ==============

export type MigrationCheck = {
  needed: boolean
  old_path: string
  new_path: string
  reason: 'OldPathExists' | 'BothPathsExist'
}

export type MigrationResult = {
  old_path_existed: boolean
  new_path_existed: boolean
  migrated_count: number
  skipped: boolean
  message: string
}

// ============== OpenSkills Types ==============

export type OpenSkillsSkill = {
  name: string
  description?: string | null
  location: string
}
