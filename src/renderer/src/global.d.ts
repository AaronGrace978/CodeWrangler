import type {
  CatalogModel,
  ExplainRequest,
  ExplainResult,
  ModelRefresh,
  ProviderId,
  PublicSettings,
  SettingsPatch
} from '@shared/types'

export type CodeWranglerApi = {
  getSettings: () => Promise<PublicSettings>
  saveSettings: (patch: SettingsPatch) => Promise<PublicSettings>
  refreshModels: (provider: ProviderId) => Promise<ModelRefresh>
  testConnection: () => Promise<{ ok: boolean; message: string }>
  explain: (request: ExplainRequest) => Promise<ExplainResult>
  cancelExplain: () => Promise<void>
  openLink: (url: string) => Promise<void>
  onChunk: (callback: (text: string) => void) => () => void
  onOpenSettings: (callback: () => void) => () => void
}

declare global {
  interface Window {
    codewrangler?: CodeWranglerApi
  }
}

export {}
