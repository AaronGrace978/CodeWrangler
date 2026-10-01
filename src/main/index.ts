import { app, BrowserWindow, ipcMain, Menu, shell, type MenuItemConstructorOptions } from 'electron'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { safeHttpsUrl } from '../shared/links'
import { sanitizeExplainRequest, sanitizePatch } from '../shared/settings'
import type { ProviderId } from '../shared/types'
import { cancelExplain, explain, refreshModels, testConnection } from './explain'
import { getSettings, updateSettings } from './store'

app.setName('CodeWrangler')

let windowRef: BrowserWindow | null = null

function iconFile(): string | undefined {
  const packaged = join(process.resourcesPath, 'icon.png')
  const dev = join(app.getAppPath(), 'build', 'icon.png')
  if (app.isPackaged && existsSync(packaged)) return packaged
  if (existsSync(dev)) return dev
  return undefined
}

function preloadFile(): string {
  const mjs = join(import.meta.dirname, '../preload/index.mjs')
  const js = join(import.meta.dirname, '../preload/index.js')
  return existsSync(mjs) ? mjs : js
}

function installMenu(): void {
  const openSettings = () => windowRef?.webContents.send('settings:open')
  const template: MenuItemConstructorOptions[] = []
  if (process.platform === 'darwin') {
    template.push({
      label: 'CodeWrangler',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { label: 'Settings', accelerator: 'CommandOrControl+,', click: openSettings },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })
  }
  template.push({ role: 'editMenu' })
  const book: MenuItemConstructorOptions = {
    label: 'Book',
    submenu: [
      { label: 'Settings', accelerator: 'CommandOrControl+,', click: openSettings },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { role: 'togglefullscreen' }
    ]
  }
  if (!app.isPackaged && Array.isArray(book.submenu)) {
    book.submenu.push({ type: 'separator' }, { role: 'reload' }, { role: 'toggleDevTools' })
  }
  template.push(book)
  if (process.platform !== 'darwin') {
    template.push({
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'close' }]
    })
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function createWindow(): void {
  const icon = iconFile()
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1080,
    minHeight: 760,
    show: false,
    title: 'CodeWrangler',
    backgroundColor: '#2a2118',
    autoHideMenuBar: false,
    icon,
    webPreferences: {
      preload: preloadFile(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })
  windowRef = win
  win.on('closed', () => {
    if (windowRef === win) windowRef = null
  })
  win.once('ready-to-show', () => win.show())
  win.webContents.setWindowOpenHandler(({ url }) => {
    const safe = safeHttpsUrl(url)
    if (safe) void shell.openExternal(safe)
    return { action: 'deny' }
  })
  win.webContents.on('will-navigate', (event, url) => {
    const dev = process.env.ELECTRON_RENDERER_URL
    if (dev && url.startsWith(dev)) return
    if (url.startsWith('file://')) return
    event.preventDefault()
  })
  if (process.env.ELECTRON_RENDERER_URL) void win.loadURL(process.env.ELECTRON_RENDERER_URL)
  else void win.loadFile(join(import.meta.dirname, '../renderer/index.html'))
}

function registerIpc(): void {
  ipcMain.handle('settings:get', () => getSettings())
  ipcMain.handle('settings:save', (_event, patch: unknown) => {
    const clean = sanitizePatch(patch)
    if (!clean.ok) throw new Error(clean.message)
    return updateSettings(clean.value)
  })
  ipcMain.handle('models:refresh', (_event, provider: ProviderId) => refreshModels(provider))
  ipcMain.handle('connection:test', () => testConnection())
  ipcMain.handle('explain:start', (event, request: unknown) => {
    const clean = sanitizeExplainRequest(request)
    if (!clean.ok) return { ok: false, message: clean.message }
    return explain(event.sender, clean.value)
  })
  ipcMain.handle('explain:cancel', () => {
    cancelExplain()
  })
  ipcMain.handle('link:open', (_event, url: unknown) => {
    if (typeof url !== 'string') return
    const safe = safeHttpsUrl(url)
    if (safe) void shell.openExternal(safe)
  })
}

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (!windowRef) return
    if (windowRef.isMinimized()) windowRef.restore()
    windowRef.focus()
  })
  app.whenReady().then(() => {
    app.setAboutPanelOptions({
      applicationName: 'CodeWrangler',
      applicationVersion: app.getVersion(),
      copyright: 'Created by Aaron Grace, M.Ed.',
      credits: 'A book that explains code in everyday words.'
    })
    if (process.platform === 'win32') app.setAppUserModelId('com.aarongrace.codewrangler')
    installMenu()
    registerIpc()
    createWindow()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
