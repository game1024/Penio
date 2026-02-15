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
import "@excalidraw/excalidraw/css/app.scss";
import "@excalidraw/excalidraw/css/styles.scss";
import "@excalidraw/excalidraw/fonts/fonts.css";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { clickRippleAnimate, clickFirework, clickSpiral, clickCircleStroke, clickRectStroke } from "./animation/mouse";
import { type } from '@tauri-apps/plugin-os';
import { Excalidraw } from "@excalidraw/excalidraw";
import { useMouseSettings } from "../../hooks/useMouseSettings";
import { useKeyboardSettings } from "../../hooks/useKeyboardSettings";
import { KeyLabel, MODIFIER_KEY_LIST, IGNORE_KEY_LIST, MOUSE_CLICK_KEYS } from "../../types/ModifierKey";
import { Alert, Snackbar, Zoom } from "@mui/material";
import i18n from "../../i18n";

function App() {
  // 从 store 加载鼠标设置
  const { mouseSettings, } = useMouseSettings();

  const { keyboardSettings, } = useKeyboardSettings();

  // 存储鼠标穿透状态
  const [ignoreCursorEvents, setIgnoreCursorEvents] = useState(true);

  // 语言状态
  const [locale, setLocale] = useState<string>(i18n.language || 'zh-CN');

  // 记录键盘状态
  const [keyboardPanel, setKeyboardPanel] = useState<{
    keys: string[];
    modifierKeys: string[];
    offsetX: number;
    offsetY: number;
    scale: number;
  }>({
    keys: [],
    modifierKeys: [],
    offsetX: 0,
    offsetY: 0,
    scale: 1.0
  })

  useEffect(() => {
    if (keyboardSettings?.preview) {
      setKeyboardPanel(prev => ({
        ...prev,
        keys: ['实时预览'],
        offsetX: keyboardSettings.offsetX ?? 0,
        offsetY: keyboardSettings.offsetY ?? 0,
        scale: keyboardSettings.scale ?? 1.0,
      }));
    } else {
      setKeyboardPanel(prev => ({
        ...prev,
        keys: [],
        offsetX: keyboardSettings?.offsetX ?? 0,
        offsetY: keyboardSettings?.offsetY ?? 0,
        scale: keyboardSettings?.scale ?? 1.0,
      }));
    }
  }, [keyboardSettings]);

  // 监听来自主窗口的语言变化事件
  useEffect(() => {
    const setupListener = async () => {
      const appWindow = getCurrentWindow();
      
      const unlisten = await appWindow.listen<{ language: string }>('language-updated', (event) => {
        console.log('Received language-updated event:', event.payload.language);
        const newLanguage = event.payload.language;
        setLocale(newLanguage);
        // 更新 i18n 实例
        i18n.changeLanguage(newLanguage);
      });

      return unlisten;
    };

    const unlistenPromise = setupListener();

    return () => {
      unlistenPromise.then(unlisten => unlisten());
    };
  }, []);

  // 组件挂载时初始化窗口设置
  useEffect(() => {
    // 设置窗口焦点和忽略鼠标事件
    // 只能在渲染进程调用，确保整个窗口创建完后再忽略鼠标事件，否则会导致留有窗口边框残影
    // 注意：setIgnoreCursorEvents(true) 会导致窗口无法获得焦点
    // 如果需要忽略鼠标事件，将无法实现自动重新获取焦点
    const showWindow = async () => {
      const appWindow = await getCurrentWindow();
      await appWindow.setFocusable(false);
      await appWindow.setIgnoreCursorEvents(ignoreCursorEvents);
    }
    showWindow();
  }, []);

  // 监听全局快捷键切换鼠标穿透
  useEffect(() => {
    const setupListener = async () => {
      const appWindow = getCurrentWindow();
      const label = appWindow.label;
      console.log(`[${label}] 设置事件监听器`);

      // 使用 appWindow.listen 只监听发送给当前窗口的事件
      const unlisten = await appWindow.listen('toggle-cursor-events', async (event) => {
        console.log(event)
        console.log(`[${label}] 收到 toggle-cursor-events 事件, 当前状态: ${ignoreCursorEvents}`);
        const newState = !ignoreCursorEvents;

        setIgnoreCursorEvents(newState);
        if (newState == false) {
          setSnackbar({ open: true, message: '进入绘制模式' });
          setKeyboardPanel(prev => ({ ...prev, modifierKeys: [], keys: [] }));
          await appWindow.setFocusable(true)
          await appWindow.setIgnoreCursorEvents(newState);
          await appWindow.setFocus();

        } else {
          //setSnackbar({ open: true, message: '退出绘制模式' });
          // 解决MacOS退出绘制模式，光标样式没有立即恢复的问题
          // 使窗口无法获得焦点, 退出绘图模式后能立马捕获键盘事件
          setKeyboardPanel(prev => ({ ...prev, modifierKeys: [], keys: [] }));
          await appWindow.setFocusable(false);
          await appWindow.hide();
          await appWindow.show();
          await appWindow.setIgnoreCursorEvents(newState);
        }
      });
      return unlisten;
    };

    const unlistenPromise = setupListener();
    return () => {
      unlistenPromise.then(unlisten => unlisten());
    };
  }, [ignoreCursorEvents]);

  // 监听窗口可见性的变化
  useEffect(() => {
    const showWindow = async () => {
      const appWindow = await getCurrentWindow();
      const isVisible = await appWindow.isVisible();

      if (!isVisible) {
        await appWindow.show();
        await appWindow.unminimize();
        await appWindow.setAlwaysOnBottom(false);
        await appWindow.setAlwaysOnTop(true);
      }
    }

    const interval = setInterval(() => {
      showWindow();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 如果未启用点击特效，不添加监听器
    if (!mouseSettings.enableClickEffect) {
      return;
    }

    // 根据配置选择点击特效
    const effectMap = {
      ripple: clickRippleAnimate,
      firework: clickFirework,
      spiral: clickSpiral,
      circleStroke: clickCircleStroke,
      rectStroke: clickRectStroke,
    };

    const onClick = (e: MouseEvent) => {
      const effect = effectMap[mouseSettings.clickEffectType || 'ripple'];
      effect(e, mouseSettings);
    };

    const parent = document.querySelector('body');
    parent?.addEventListener('click', onClick, true);

    return () => {
      parent?.removeEventListener('click', onClick, true);
    }
  }, [mouseSettings]);

  useEffect(() => {
    // 监听来自 Rust 的全局鼠标事件
    const setupListener = async () => {
      const appWindow = getCurrentWindow();

      const unlistenRefreshMonitors = await appWindow.listen('refresh-monitors', async (event) => {
        console.log('refresh-monitors event received:', event);
        setKeyboardPanel(prev => ({ ...prev, modifierKeys: [], keys: [] }));
      });

      // 监听鼠标点击事件
      // 如果鼠标穿透关闭,不处理点击事件
      const unlistenMouseDown = await appWindow.listen<{ x: number, y: number }>('mouse-click', async (event) => {
        if (!ignoreCursorEvents) {
          return;
        }
        console.log('mouse-click event received:', event);
        const [innerPosition, outerPosition, innerSize, outerSize, scaleFactor] = await Promise.all([
          appWindow.innerPosition(),
          appWindow.outerPosition(),
          appWindow.innerSize(),
          appWindow.outerSize(),
          appWindow.scaleFactor()
        ]);

        console.log('Window Inner position:', innerPosition);
        console.log('Window Outer position:', outerPosition);
        console.log('Inner size:', innerSize);
        console.log('Outer size:', outerSize);
        console.log('Scale factor:', scaleFactor);
        try {
          console.log('rdev mouse-down payload:', { x: event.payload.x, y: event.payload.y });

          // 跨平台坐标转换
          // macOS: 窗口坐标返回的是逻辑像素，需要除以缩放因子转成物理像素，再和rev鼠标计算
          // Windows/Linux: 窗口坐标返回的是物理像素，可以和rev鼠标直接计算，然后除以缩放因子
          const osType = await type();
          console.log('OS Type:', osType);

          let windowX = 0;
          let windowY = 0;

          switch (osType) {
            case 'macos':
              windowX = event.payload.x - Math.round(innerPosition.x / scaleFactor);
              windowY = event.payload.y - Math.round(innerPosition.y / scaleFactor);
              break;
            case 'linux':
              windowX = Math.round((event.payload.x - innerPosition.x) / scaleFactor);
              windowY = Math.round((event.payload.y - innerPosition.y) / scaleFactor);
              break;
            default:
              // Windows and others
              windowX = Math.round((event.payload.x - innerPosition.x) / scaleFactor);
              windowY = Math.round((event.payload.y - innerPosition.y) / scaleFactor);
              break;
          }

          console.log('Converted coordinates:', { windowX, windowY });

          // 构造并分发鼠标事件到 WebView
          const mouseEvent = new MouseEvent('click', {
            clientX: windowX,
            clientY: windowY,
            bubbles: true,
            cancelable: true,
          });
          document.elementFromPoint(windowX, windowY)?.dispatchEvent(mouseEvent);

        } catch (error) {
          console.error('Error handling mouse-click event:', error);
        }
      });

      if (!keyboardSettings.enableKeyboardEcho) {
        setKeyboardPanel(prev => ({ ...prev, modifierKeys: [], keys: [] }));
        return [unlistenMouseDown];
      }

      // 监听键盘按下事件
      const unlistenKeyPress = await appWindow.listen<{ key: string }>('key-press', async (event) => {
        console.log(keyboardSettings.enableKeyboardEcho)
        console.log('key-press event received:', event);
        const isFocused = await appWindow.isFocused();
        if (isFocused) {
          return;
        }

        if (IGNORE_KEY_LIST.includes(event.payload.key)) {
          return;
        }

        if (event.payload.key.includes('Unknown')) {
          return;
        }

        if (!keyboardSettings.enableClickEcho && MOUSE_CLICK_KEYS.includes(event.payload.key)) {
          return;
        }

        // 这里可以根据需要处理键盘事件
        if (MODIFIER_KEY_LIST.includes(event.payload.key)) {
          const keyName = await KeyLabel(event.payload.key);

          setKeyboardPanel(prev => {
            if (!prev.modifierKeys.includes(keyName)) {
              return { ...prev, modifierKeys: [...prev.modifierKeys, keyName] };
            }
            return prev;
          });
        } else {
          const keyName = await KeyLabel(event.payload.key);
          setKeyboardPanel(prev => {
            if (!prev.keys.includes(keyName)) {
              return { ...prev, keys: [...prev.keys, keyName] };
            }
            return prev;
          });
        }
      });

      // 监听键盘释放事件
      const unlistenKeyRelease = await appWindow.listen<{ key: string }>('key-release', async (event) => {
        console.log('key-release event received:', event);
        // 这里可以根据需要处理键盘释放事件

        if (MODIFIER_KEY_LIST.includes(event.payload.key)) {
          const keyName = await KeyLabel(event.payload.key);
          setKeyboardPanel(prev => ({ ...prev, modifierKeys: prev.modifierKeys.filter(k => k !== keyName) }));
        } else {
          const keyName = await KeyLabel(event.payload.key);
          setKeyboardPanel(prev => ({ ...prev, keys: prev.keys.filter(k => k !== keyName) }));
        }
      });

      return [unlistenRefreshMonitors, unlistenMouseDown, unlistenKeyPress, unlistenKeyRelease];
    };

    const unlistenPromise = setupListener();

    // 组件卸载时清理
    return () => {
      unlistenPromise.then(unlisteners => {
        unlisteners.forEach(unlisten => unlisten());
      });
    };
  }, [ignoreCursorEvents, mouseSettings, keyboardSettings]);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={snackbar.open}
        autoHideDuration={1500}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        slots={{ transition: Zoom }}
      >
        <Alert
          onClose={() => setSnackbar({ open: false, message: '' })}
          severity="info"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <div
        style={{
          width: '100vw',
          display: 'flex',
          justifyContent: 'center',
          position: 'absolute',
          fontFamily: 'Fira Code',
          bottom: '5rem',
          right: '2rem',
          transition: 'opacity 0.5s',
          pointerEvents: 'none',
          zIndex: 999999
        }}>

        {/* 键盘按键信息显示区域 */}
        <div
          style={{
            padding: '0.5rem 1rem',
            color: keyboardSettings.fgColor || 'rgba(190,255,255,1.0)',
            borderRadius: '0.5rem',
            backgroundColor: keyboardSettings.bgColor || 'rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.2rem',
            transform: `translate(${keyboardPanel.offsetX}em, ${-keyboardPanel.offsetY}em) scale(${keyboardPanel.scale || 1.0})`,
            opacity: keyboardPanel.modifierKeys.length > 0 || keyboardPanel.keys.length > 0 ? 1 : 0.0,
          }}>

          <div
            style={{
              fontFamily: 'Fira Code',
              fontSize: '3rem', 
              fontWeight: 'bold'
            }}>
            {keyboardPanel.modifierKeys.length > 0 || keyboardPanel.keys.length > 0 ? `[ ${[...keyboardPanel.modifierKeys, ...keyboardPanel.keys].join('+')} ]` : ''}
          </div>

        </div>
      </div>

      <main style={{
        height: '100vh',
        display: 'block',
        background: 'transparent',
        opacity: ignoreCursorEvents ? 0.0 : 1,
        position: 'relative',
      }}>
        {/* 遮罩层：阻止 ignoreCursorEvents 时的事件穿透到 Excalidraw */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: ignoreCursorEvents ? 'auto' : 'none',
          zIndex: 999999,
        }} />

        {<Excalidraw
          langCode={
            locale === 'zh-CN' ? 'zh-CN' :
            locale === 'ja-JP' ? 'ja-JP' :
            locale === 'ko-KR' ? 'ko-KR' :
            locale === 'fr-FR' ? 'fr-FR' :
            locale === 'de-DE' ? 'de-DE' :
            locale === 'es-ES' ? 'es-ES' :
            'en'
          }
          autoFocus={true}
          initialData={{
            elements: [

            ],
            appState: {
              currentItemStrokeColor: 'red',
              currentItemRoundness: "sharp",
              viewBackgroundColor: "transparent",
              activeTool: {
                type: "freedraw",
                locked: true
              }
            }
          }}
          UIOptions={{
            canvasActions: {
              'export': false,
              'saveAsImage': false,
            }
          }}
        />}
      </main>
    </>
  );
}

export default App;
