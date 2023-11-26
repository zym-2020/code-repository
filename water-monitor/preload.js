const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("myVersion", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});

contextBridge.exposeInMainWorld("api", {
  ping: () => ipcRenderer.invoke("ping"),
});
