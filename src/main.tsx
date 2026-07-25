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

import React, { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getTheme } from './theme';
import { getSettings } from './store/settings';
import { listen } from '@tauri-apps/api/event';
import './i18n';

// Import local fonts
import '@fontsource/fira-code/index.css';
import '@fontsource/noto-sans/index.css';
import '@fontsource/noto-sans-sc/index.css';
import '@fontsource/noto-sans-tc/index.css';

function ThemedApp() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  // Resolve the actual theme mode
  const resolveMode = (setting: 'light' | 'dark' | 'auto'): 'light' | 'dark' => {
    if (setting === 'auto') return prefersDark ? 'dark' : 'light';
    return setting;
  };

  // Load theme setting on mount
  useEffect(() => {
    (async () => {
      try {
        const settings = await getSettings();
        setThemeMode(resolveMode(settings.theme || 'auto'));
      } catch (e) {
        console.error('Failed to load theme setting:', e);
      }
    })();
  }, []);

  // React to system preference changes when in auto mode
  useEffect(() => {
    (async () => {
      try {
        const settings = await getSettings();
        if (settings.theme === 'auto') {
          setThemeMode(prefersDark ? 'dark' : 'light');
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [prefersDark]);

  // Listen for theme changes from other windows
  useEffect(() => {
    const setupListener = async () => {
      const unlisten = await listen<{ theme: 'light' | 'dark' | 'auto' }>('theme-updated', (event) => {
        setThemeMode(resolveMode(event.payload.theme));
      });
      return unlisten;
    };
    const unlistenPromise = setupListener();
    return () => {
      unlistenPromise.then(unlisten => unlisten());
    };
  }, [prefersDark]);

  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemedApp />
  </React.StrictMode>,
);
