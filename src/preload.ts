import { ipcRenderer, contextBridge } from "electron";
import { type ipcMainHandlers } from "./utils/ipc-main-handlers";

type AllowedChannel = keyof typeof ipcMainHandlers;

// セキュリティ対策でipcRendererの一部のAPIだけをラップして公開する
// ref: https://github.com/electron-vite/electron-vite-react/blob/f3e8e2cf6892b5d15eb974d1c3a8218f5f0d501b/electron/preload/index.ts#L3
const api = {
  invoke<K extends AllowedChannel>(
    channel: K,
    ...args: Parameters<(typeof ipcMainHandlers)[K]>[1][]
  ): Promise<Awaited<ReturnType<(typeof ipcMainHandlers)[K]>>> {
    return ipcRenderer.invoke(channel, ...args);
  },
  send<K extends AllowedChannel>(
    channel: AllowedChannel,
    ...args: Parameters<(typeof ipcMainHandlers)[K]>[1][]
  ): ReturnType<typeof ipcRenderer.send> {
    return ipcRenderer.send(channel, ...args);
  },
  on(
    channel: AllowedChannel,
    listener: Parameters<typeof ipcRenderer.on>[1]
  ): ReturnType<typeof ipcRenderer.on> {
    return ipcRenderer.on(channel, listener);
  },
  off(
    channel: AllowedChannel,
    listener: Parameters<typeof ipcRenderer.off>[1]
  ): ReturnType<typeof ipcRenderer.off> {
    return ipcRenderer.off(channel, listener);
  },
};

// ipcRendererの一部のAPIを使っているので、そのまま"ipcRenderer"という名前でwindowオブジェクトに公開する
contextBridge.exposeInMainWorld("ipcRenderer", api);

declare global {
  interface Window {
    ipcRenderer: typeof api;
  }
}
