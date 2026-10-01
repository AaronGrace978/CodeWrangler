import { contextBridge, ipcRenderer } from 'electron'
import type { CatalogModel, ExplainRequest, ExplainResult, ModelRefresh, ProviderId, PublicSettings, SettingsPatch } from '../shared/types'

const api = {
  getSettings: (): Promise<PublicSettings> => ipcRenderer.invoke('settings:get'),
  saveSettings: (patch: SettingsPatch): Promise<PublicSettings> => ipcRenderer.invoke('settings:save', patch),
  refreshModels: (provider: ProviderId): Promise<ModelRefresh> => ipcRenderer.invoke('models:refresh', provider),
  testConnection: (): Promise<{ ok: boolean; message: string }> => ipcRenderer.invoke('connection:test'),
  explain: (request: ExplainRequest): Promise<ExplainResult> => ipcRenderer.invoke('explain:start', request),
  cancelExplain: (): Promise<void> => ipcRenderer.invoke('explain:cancel'),
  openLink: (url: string): Promise<void> => ipcRenderer.invoke('link:open', url),
  onChunk: (callback: (text: string) => void): (() => void) => {
    const listener = (_event: unknown, text: string) => callback(text)
    ipcRenderer.on('explain:chunk', listener)
    return () => ipcRenderer.removeListener('explain:chunk', listener)
  },
  onOpenSettings: (callback: () => void): (() => void) => {
    const listener = () => callback()
    ipcRenderer.on('settings:open', listener)
    return () => ipcRenderer.removeListener('settings:open', listener)
  }
}

contextBridge.exposeInMainWorld('codewrangler', api)
