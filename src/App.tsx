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

import { useState, useEffect } from "react";
import "./App.css";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import { initLocale } from './i18n';
import { getCurrentWindow } from "@tauri-apps/api/window";

import MouseIcon from '@mui/icons-material/Mouse';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import BrushIcon from '@mui/icons-material/Brush';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';

import { 关于页面, 鼠标设置页面, 键盘设置页面, 绘图设置页面, 通用设置页面 } from "./components/Settings";
import { TabIndex } from "./types/TabIndex";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { useTray } from "./hooks/useTray";
import { useShortcut } from "./hooks/useShortcut";
import { useMachineId } from "./hooks/useMachineId";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      style={{
        flexGrow: 1,
        backgroundColor: '#eeeeee',
        overflowY: 'auto',
        height: '98vh',
      }}
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const { t } = useTranslation();
  const { createTray, updateTray } = useTray();
  const { initShortcut } = useShortcut();
  const { initMachineId } = useMachineId();

  // 初始化语言设置、托盘、快捷键、机器码
  useEffect(() => {
    const initialize = async () => {
      const language = await initLocale();
      if (language !== i18n.language) {
        await i18n.changeLanguage(language);
      }
      // 语言初始化完成后创建托盘
      await createTray();
      await initShortcut();
      await initMachineId();
    };
    
    initialize().catch(console.error);
  }, [])

  // 监听语言更新，更新托盘菜单
  useEffect(() => {
    const setupListener = async () => {
      const appWindow = getCurrentWindow();
      
      const unlisten = await appWindow.listen<{ language: string }>('language-updated', () => {
        updateTray();
      });

      return unlisten;
    };

    const unlistenPromise = setupListener();

    return () => {
      unlistenPromise.then(unlisten => unlisten());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTabno(params.get('tabno') ? parseInt(params.get('tabno')!) : 1);

    // 禁用生产环境的右键菜单 
    // macOS: 生产环境的协议是 tauri:
    // Windows/Linux: 生产环境的域名是 tauri.localhost
    if (window.location.host == "tauri.localhost" || window.location.protocol == "tauri:") {
      const disableContextMenu = (e: Event) => {
        e.preventDefault();
      };

      const disableRefresh = (e: KeyboardEvent) => {
        if (
          (e.key === 'F5') ||
          (e.ctrlKey && e.key === 'r') ||
          (e.metaKey && e.key === 'r')
        ) {
          e.preventDefault();
        }
      }

      document.addEventListener('contextmenu', disableContextMenu, false);
      document.addEventListener('keydown', disableRefresh, false);

      return () => {
        document.removeEventListener('contextmenu', disableContextMenu, false);
        document.removeEventListener('keydown', disableRefresh, false);
      }
    }
  }, []);

  const initTab = () => {
    const params = new URLSearchParams(window.location.search);
    const tabno = params.get('tabno')
    if (tabno !== null) {
      return parseInt(tabno, 10);
    }
    return 1;
  }

  const [tabno, setTabno] = useState(initTab);

  // 监听标签切换，更新 URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('tabno', tabno.toString());
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [tabno]);

  return (
    <SnackbarProvider>
      <main className="console-container" style={{ display: 'flex' }}>
        <Tabs
          value={tabno}
          onChange={(_, newValue) => setTabno(newValue)}
          orientation="vertical"
          sx={{ minWidth: '6rem' }}>
          <Tab value={TabIndex.鼠标} icon={<MouseIcon />} label={t('tabs.mouse')} />
          <Tab value={TabIndex.键盘} icon={<KeyboardIcon />} label={t('tabs.keyboard')} />
          <Tab value={TabIndex.绘图} icon={<BrushIcon />} label={t('tabs.drawing')} />
          <Tab value={TabIndex.通用} icon={<SettingsIcon />} label={t('tabs.general')} />
          <Tab value={TabIndex.关于} icon={<InfoIcon />} label={t('tabs.about')} />
        </Tabs>

        <TabPanel value={tabno} index={TabIndex.鼠标}>
          <鼠标设置页面 />
        </TabPanel>
        <TabPanel value={tabno} index={TabIndex.键盘}>
          <键盘设置页面 />
        </TabPanel>
        <TabPanel value={tabno} index={TabIndex.绘图}>
          <绘图设置页面 />
        </TabPanel>
        <TabPanel value={tabno} index={TabIndex.通用}>
          <通用设置页面 />
        </TabPanel>
        <TabPanel value={tabno} index={TabIndex.关于}>
          <关于页面 />
        </TabPanel>
      </main>
    </SnackbarProvider>
  )
}

export default App;