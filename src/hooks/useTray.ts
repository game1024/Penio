import { TrayIcon } from '@tauri-apps/api/tray';
import { Image } from '@tauri-apps/api/image';
import { Menu, PredefinedMenuItem } from '@tauri-apps/api/menu';
import { getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from '@tauri-apps/plugin-shell';
import { exit, relaunch } from '@tauri-apps/plugin-process';
import { useOS } from './useOS';
import i18n from '../i18n';

/**
 * 托盘菜单配置项
 */
export interface TrayMenuItem {
    id: string;
    label: string;
    enabled?: boolean;
    type?: 'normal' | 'separator';
}

/**
 * 托盘菜单事件处理器类型
 */
export type TrayMenuHandler = (menuId: string) => void | Promise<void>;


const TRAY_ID = "PENIO_TRAY"
/**
 * 托盘 Hook
 * 在 JS 中创建和管理系统托盘
 */
export function useTray() {
    const { isMac } = useOS();
    
    const getTrayById = () => {
        return TrayIcon.getById(TRAY_ID);
    }

    const getTrayMenu = async () => {
        const t = i18n.t.bind(i18n);
        const items = await Promise.all([
            {
                id: 'show',
                text: t('tray.preferences'),
                action: async () => {
                    const window = getCurrentWindow();
                    await window.show();
                    await window.setFocus();
                    await window.unminimize();
                }
            },
            {
                id: 'refresh_monitors',
                text: t('tray.resetWindow'),
                action: async () => {
                    await invoke('refresh_monitors', { emitEvent: true });
                }
            },
            PredefinedMenuItem.new({ item: 'Separator' }),
            {
                id: 'website',
                text: t('tray.website'),
                action: async () => {
                    await open('https://www.fiofio.cn');
                }
            },
            PredefinedMenuItem.new({ item: 'Separator' }),
            {
                id: 'version',
                text: t('tray.version', { version: await getVersion() }),
                enabled: false,
            },
            {
                id: 'restart',
                text: t('tray.restart'),
                action: async () => {
                    await relaunch();
                }
            },
            {
                id: 'quit',
                text: t('tray.quit'),
                action: async () => {
                    await exit(0);
                }
            }
        ]);

        return Menu.new({ items })
    }

    const updateTray = async () => {
        const tray = await getTrayById();
        if (tray) {
            tray.setMenu(await getTrayMenu());
        }
    }
    
    const createTray = async () => {
        const tray = await getTrayById();
        if (tray) {
            tray.setMenu(await getTrayMenu());
            return;
        }

        const menu = await getTrayMenu();
        const icon = isMac() ?
            await Image.fromBytes(new Uint8Array(await (await fetch('/tray-template.png')).arrayBuffer())) :
            await Image.fromBytes(new Uint8Array(await (await fetch('/tray.png')).arrayBuffer()))
        try {
            await TrayIcon.new({
                id: TRAY_ID,
                tooltip: 'Penio',
                menu,
                menuOnLeftClick: true,
                icon: icon,
                iconAsTemplate: isMac(),
            });

            console.log('Tray icon created successfully');
        } catch (error) {
            console.error('Failed to create tray icon:', error);
        }
    };

    return {
        createTray,
        updateTray
    }
}
