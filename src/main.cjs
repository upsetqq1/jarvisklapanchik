const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('node:path');

let windowRef;
let dragOrigin;

function createWindow() {
  console.log('Юра: создаю окно прототипа');
  const { workArea } = screen.getPrimaryDisplay();
  windowRef = new BrowserWindow({
    width: 480,
    height: 500,
    x: workArea.x + workArea.width - 500,
    y: workArea.y + workArea.height - 530,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    show: false,
    hasShadow: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  windowRef.loadFile(path.join(__dirname, 'index.html'));
  windowRef.webContents.on('did-fail-load', (_event, code, description) => console.error('Не удалось открыть интерфейс:', code, description));
  windowRef.once('ready-to-show', () => {
    windowRef.showInactive();
    windowRef.setIgnoreMouseEvents(true, { forward: true });
  });
  windowRef.on('closed', () => { windowRef = null; });
}

ipcMain.on('pointer-region', (_event, interactive) => {
  if (windowRef && !windowRef.isDestroyed()) {
    windowRef.setIgnoreMouseEvents(!interactive, { forward: true });
  }
});

ipcMain.on('drag-start', () => {
  if (!windowRef || windowRef.isDestroyed()) return;
  dragOrigin = { ...windowRef.getBounds(), cursor: screen.getCursorScreenPoint() };
});

ipcMain.on('drag-move', () => {
  if (!windowRef || windowRef.isDestroyed() || !dragOrigin) return;
  const cursor = screen.getCursorScreenPoint();
  windowRef.setPosition(
    Math.round(dragOrigin.x + cursor.x - dragOrigin.cursor.x),
    Math.round(dragOrigin.y + cursor.y - dragOrigin.cursor.y),
  );
});

ipcMain.on('drag-end', () => { dragOrigin = null; });
ipcMain.on('quit', () => app.quit());

app.whenReady().then(createWindow).catch((error) => {
  console.error('Ошибка запуска Юры:', error);
  app.exit(1);
});
