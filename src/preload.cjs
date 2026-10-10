const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('yura', {
  setPointerRegion: (interactive) => ipcRenderer.send('pointer-region', Boolean(interactive)),
  dragStart: () => ipcRenderer.send('drag-start'),
  dragMove: () => ipcRenderer.send('drag-move'),
  dragEnd: () => ipcRenderer.send('drag-end'),
  quit: () => ipcRenderer.send('quit'),
});
