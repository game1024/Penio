import * as GlobalShortcut from '@tauri-apps/plugin-global-shortcut';
import { invoke } from '@tauri-apps/api/core';
import { getSettings} from '../store/settings';

type ShortcutTriggerState = {
id: number;
shortcut: string;
state: "Pressed" | "Released";
};

export function useShortcut() {
    const register = async (shortcut: string, callback: () => void): Promise<void> => {
        try {
            // 检查快捷键是否已经注册
            const registered = await GlobalShortcut.isRegistered(shortcut);
            if (registered) {
                console.log('Shortcut already registered:', shortcut);
                throw new Error('快捷键已被占用，请选择其他快捷键');
            }
            await GlobalShortcut.register(shortcut, ({state}:ShortcutTriggerState) => {
                if (state === "Pressed") return;
                callback();
            }
            );

        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const unregister = async (shortcut: string): Promise<void> => {
        try {
            const registered = await GlobalShortcut.isRegistered(shortcut);
            if (registered) {
                await GlobalShortcut.unregister(shortcut);
                console.log('Unregistered shortcut:', shortcut);
            }
        } catch (error) {
            console.error('Failed to unregister shortcut:', error);
        }
    };

    const initShortcut = async (): Promise<void> => {
        try {
            const settings = await getSettings();
            const shortcut = settings.drawing?.toggleShortcut || 'Alt+`';
            await register(shortcut, async () => {
                await invoke('trigger_drawing_mode');
            });
        } catch (error) {
            console.error('Failed to initialize shortcut:', error);
        }
    };

    return { initShortcut, register, unregister };
}

