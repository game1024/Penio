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
import { listen } from '@tauri-apps/api/event';
import { getActivationCode, AUTH_CODE } from '../store/auth';

export function useAuth() {
    const [isVip, setIsVip] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    // 初始加载
    useEffect(() => {
        const loadAuth = async () => {
            try {
                const code = await getActivationCode();
                setIsVip(code === AUTH_CODE);
            } catch (error) {
                console.error('加载用户详情失败:', error);
            } finally {
                setLoading(false);
            }
        };
        loadAuth();
    }, []);

    // 监听 Tauri 事件（跨窗口通信）
    useEffect(() => {
        let unlisten: (() => void) | undefined;

        const setupListener = async () => {
            try {
                unlisten = await listen<string | null>('activation-code-updated', (event) => {
                    console.log('Received activation-code-updated event:', event.payload);
                    setIsVip(event.payload === AUTH_CODE);
                });
            } catch (error) {
                console.error('Failed to setup activation-code-updated listener:', error);
            }
        };

        setupListener();

        return () => {
            if (unlisten) {
                unlisten();
            }
        };
    }, []);

    return { isVip, loading };
}