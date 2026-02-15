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

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { locale } from '@tauri-apps/plugin-os';
import { getSettings, updateSettings } from '../store/settings';
import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';
import enUS from './locales/en-US.json';
import jaJP from './locales/ja-JP.json';
import koKR from './locales/ko-KR.json';
import frFR from './locales/fr-FR.json';
import deDE from './locales/de-DE.json';
import esES from './locales/es-ES.json';

// 将系统语言代码映射到应用支持的语言
const mapSystemLocaleToAppLanguage = (systemLocale: string): string => {
  // 系统语言格式可能是 "zh-CN", "zh_CN", "en-US", "en_US" 等
  const normalized = systemLocale.replace('_', '-');
  
  // 支持的语言列表
  const supportedLanguages = ['zh-CN', 'zh-TW', 'en-US', 'ja-JP', 'ko-KR', 'fr-FR', 'de-DE', 'es-ES'];
  
  // 完全匹配
  if (supportedLanguages.includes(normalized)) {
    return normalized;
  }
  
  // 尝试语言代码匹配（如 "zh" -> "zh-CN"）
  const langCode = normalized.split('-')[0].toLowerCase();
  // 特殊处理繁体中文
  if (normalized === 'zh-TW' || normalized === 'zh-HK' || normalized === 'zh-Hant') {
    return 'zh-TW';
  }
  const languageMap: Record<string, string> = {
    'zh': 'zh-CN',
    'en': 'en-US',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'es': 'es-ES',
  };
  
  return languageMap[langCode] || 'zh-CN';
};

// 获取初始语言设置
export const initLocale = async (): Promise<string> => {
  try {
    const settings = await getSettings();
    
    if (settings.language) {
      return settings.language;
    }
    
    // 如果没有保存的语言设置，获取系统语言
    const systemLocale = await locale();
    console.log('Detected system locale:', systemLocale);
    if (systemLocale) {
      const appLanguage = mapSystemLocaleToAppLanguage(systemLocale);
      // 保存到 settings store
      await updateSettings({ language: appLanguage as any });
      return appLanguage;
    }
  } catch (error) {
    console.error('Failed to get initial language:', error);
  }
  
  return 'zh-CN';
};

// 先同步初始化 i18n，使用默认语言
i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': {
        translation: zhCN
      },
      'zh-TW': {
        translation: zhTW
      },
      'en-US': {
        translation: enUS
      },
      'ja-JP': {
        translation: jaJP
      },
      'ko-KR': {
        translation: koKR
      },
      'fr-FR': {
        translation: frFR
      },
      'de-DE': {
        translation: deDE
      },
      'es-ES': {
        translation: esES
      }
    },
    lng: 'zh-CN', // 先使用默认语言
    fallbackLng: 'zh-CN',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
