/**
 * MIT License
 * 
 * Copyright (c) 2026 game1024
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Store } from '@tauri-apps/plugin-store';
import { emit } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { useShortcut } from '../hooks/useShortcut';

// 创建 Settings Store 实例
let settingsStore: Store | null = null;

// 鼠标设置接口
export interface MouseSettings {
    enableClickEffect?: boolean;
    clickEffectType?: 'ripple' | 'firework' | 'spiral' | 'circleStroke' | 'rectStroke';
    scale?: number;
    speed?: number;
}

// 键盘设置接口
export interface KeyboardSettings {
    enableKeyboardEcho?: boolean;
    enableClickEcho?: boolean;
    preview?: boolean;
    scale?: number;
    fgColor?: string;
    bgColor?: string;
    offsetX?: number;
    offsetY?: number;
}

// 绘图设置接口
export interface DrawingSettings {
    toggleShortcut: string;
}

// 应用设置接口
export interface AppSettings {
    theme?: 'light' | 'dark' | 'auto';
    language?: 'zh-CN' | 'zh-TW' | 'en-US' | 'ja-JP' | 'ko-KR' | 'fr-FR' | 'de-DE' | 'es-ES';
    autoStart?: boolean;
    minimizeToTray?: boolean;
    // 鼠标设置
    mouse: MouseSettings;
    // 键盘设置
    keyboard: KeyboardSettings;
    // 绘图设置
    drawing: DrawingSettings;
    // 可以根据需要添加更多设置项
}

// 默认设置
const defaultSettings: AppSettings = {
    theme: 'auto',
    autoStart: false,
    minimizeToTray: true,
    mouse: {
        enableClickEffect: true,
        clickEffectType: 'ripple',
        scale: 1.0,
        speed: 1.0,
    },
    keyboard: {
        enableKeyboardEcho: true,
        enableClickEcho: true,
        preview: false,
        scale: 1.0,
        fgColor: 'rgba(190,255,255,1.0)',
        bgColor: 'rgba(0,0,0,0.5)',
        offsetX: 0,
        offsetY: 0,
    },
    drawing: {
        toggleShortcut: 'Alt+`',
    },
};

// 初始化 settings store
export const initSettingsStore = async () => {
    if (!settingsStore) {
        settingsStore = await Store.load('settings.bin');
    }
    return settingsStore;
};

// 获取所有设置
export const getSettings = async (): Promise<AppSettings> => {
    const store = await initSettingsStore();
    const settings = await store.get<AppSettings>('settings');
    return {
        ...defaultSettings,
        ...settings,
        mouse: { ...defaultSettings.mouse, ...settings?.mouse },
        keyboard: { ...defaultSettings.keyboard, ...settings?.keyboard },
        drawing: {...defaultSettings.drawing, ...settings?.drawing },
    };
};

// 更新设置
export const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const store = await initSettingsStore();
    const currentSettings = await getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    await store.set('settings', updatedSettings);
    await store.save();

    // 使用 Tauri 的 emit 广播事件到所有窗口
    if (newSettings.mouse) {
        try {
            await emit('mouse-settings-updated', updatedSettings.mouse);
        } catch (error) {
            console.error('Failed to emit mouse-settings-updated event:', error);
        }
    }

    if (newSettings.keyboard) {
        try {
            await emit('keyboard-settings-updated', updatedSettings.keyboard);
        } catch (error) {
            console.error('Failed to emit keyboard-settings-updated event:', error);
        }
    }

    if (newSettings.language) {
        try {
            await emit('language-updated', { language: updatedSettings.language });
        } catch (error) {
            console.error('Failed to emit language-updated event:', error);
        }
    }

    const { register, unregister } = useShortcut();
    if (newSettings.drawing) {
        try {
            await emit('drawing-settings-updated', updatedSettings.drawing);
            if (updatedSettings.drawing.toggleShortcut && updatedSettings.drawing.toggleShortcut != "") {
                await register(updatedSettings.drawing.toggleShortcut || defaultSettings.drawing.toggleShortcut, async () => {
                    await invoke('trigger_drawing_mode');
                })
            }

            await unregister(currentSettings.drawing.toggleShortcut);
        } catch (error: any) {
            throw error;
        }
    }

    return updatedSettings;
};

// 获取单个设置项
export const getSetting = async <K extends keyof AppSettings>(
    key: K
): Promise<AppSettings[K]> => {
    const settings = await getSettings();
    return settings[key];
};

// 设置单个设置项
export const setSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
) => {
    const store = await initSettingsStore();
    const currentSettings = await getSettings();
    currentSettings[key] = value;
    await store.set('settings', currentSettings);
    await store.save();
    return value;
};

// 重置所有设置为默认值
export const resetSettings = async () => {
    const store = await initSettingsStore();
    await store.set('settings', defaultSettings);
    await store.save();
    return defaultSettings;
};

// 导出 settings store 实例（用于高级操作）
export const getSettingsStore = () => settingsStore;
