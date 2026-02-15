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

import { useTranslation } from 'react-i18next';
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { SettingField } from './SettingField';
import { t } from 'i18next';
import { updateSettings } from '../store/settings';

export function LanguageSetting() {
  const { i18n } = useTranslation();
  
  const handleLanguageChange = async (language: string) => {
    // 更新 i18n
    await i18n.changeLanguage(language);
    // 更新 store 并广播事件
    await updateSettings({ language: language as any });
  };
  
  return (
    <SettingField
      label={t('general.language')}
      value={
        <Select
          value={i18n.language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          size="small"
          sx={{ minWidth: '8rem' }}
        >
          <MenuItem value="zh-CN">简体中文</MenuItem>
          <MenuItem value="zh-TW">繁體中文</MenuItem>
          <MenuItem value="en-US">English</MenuItem>
          <MenuItem value="de-DE">Deutsch</MenuItem>
          <MenuItem value="es-ES">Español</MenuItem>
          <MenuItem value="fr-FR">Français</MenuItem>
          <MenuItem value="ja-JP">日本語</MenuItem>
          <MenuItem value="ko-KR">한국어</MenuItem>
        </Select>
      }
    />
  );
}
