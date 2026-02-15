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

import { useState, useEffect } from 'react';
import { getSettings, type MouseSettings } from '../store/settings';
import { listen } from '@tauri-apps/api/event';

/**
 * 监听鼠标设置的 Hook
 * 自动从 store 加载并监听变化
 */
export function useMouseSettings() {
    const [mouseSettings, setMouseSettings] = useState<MouseSettings>({
        enableClickEffect: false,
        clickEffectType: 'ripple',
    });
    const [loading, setLoading] = useState(true);

    // 初始加载
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await getSettings();
                if (settings.mouse) {
                    setMouseSettings(settings.mouse);
                }
            } catch (error) {
                console.error('加载鼠标设置失败:', error);
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);

    // 监听 Tauri 事件（跨窗口通信）
    useEffect(() => {
        let unlisten: (() => void) | undefined;

        const setupListener = async () => {
            try {
                unlisten = await listen<MouseSettings>('mouse-settings-updated', (event) => {
                    console.log('Received mouse-settings-updated event:', event.payload);
                    setMouseSettings(event.payload);
                });
            } catch (error) {
                console.error('Failed to setup mouse-settings-updated listener:', error);
            }
        };

        setupListener();

        return () => {
            if (unlisten) {
                unlisten();
            }
        };
    }, []);

    return { mouseSettings, loading };
}
