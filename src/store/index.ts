import { Store } from '@tauri-apps/plugin-store';

// 创建 Tauri Store 实例
let store: Store | null = null;


// 初始化 store（使用 .bin 扩展名）
export const initStore = async () => {
    if (!store) {
        store = await Store.load('auth.bin');
    }
    return store;
};


// 获取 store 实例
export const getStore = () => store;

// 导出 settings store
export * from './settings';
