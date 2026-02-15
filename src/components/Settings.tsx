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

import "./WxLogin.js";
import "@blueprintjs/core/lib/css/blueprint.css";

import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Switch from "@mui/material/Switch";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import * as AutoStart from "@tauri-apps/plugin-autostart";
import ShortcutField from "./ShortcutField";
import Stack from "@mui/material/Stack";
import { getSettings, updateSettings } from "../store/settings";
import { SettingField } from "./SettingField.js";
import Sketch from '@uiw/react-color-sketch';
import { rgbaStringToHsva } from '@uiw/color-convert';
import { useOS } from "../hooks/useOS.js";
import { useSnackbar } from "../contexts/SnackbarContext.js";
import { LanguageSetting } from "./LanguageSetting";
import * as macosPermissions from "tauri-plugin-macos-permissions-api";
import 关于页面 from "./AboutPage";

function 键盘设置页面() {
    const { t } = useTranslation();
    //const [loading, setLoading] = useState(true);
    const [enableKeyboardEcho, setEnableKeyboardEcho] = useState(true);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    const [scale, setScale] = useState(1.0);
    const [preview, setPreview] = useState(false);
    const { notify } = useSnackbar();
    const [enableClickEcho, setEnableClickEcho] = useState(true);
    const [fgColor, setFgColor] = useState('rgba(210,220,255,1.0)');
    const [bgColor, setBgColor] = useState('rgba(0,0,0,0.5)');
    const [fgColorAnchor, setFgColorAnchor] = useState<HTMLElement | null>(null);
    const [bgColorAnchor, setBgColorAnchor] = useState<HTMLElement | null>(null);

    // 加载设置
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await getSettings();
                setEnableKeyboardEcho(settings.keyboard?.enableKeyboardEcho ?? true);
                setEnableClickEcho(settings.keyboard?.enableClickEcho ?? true);
                setOffsetX(settings.keyboard?.offsetX ?? 0);
                setOffsetY(settings.keyboard?.offsetY ?? 0);
                setScale(settings.keyboard?.scale ?? 1.0);
                setFgColor(settings.keyboard?.fgColor ?? 'rgba(210,220,255,1.0)');
                setBgColor(settings.keyboard?.bgColor ?? 'rgba(0,0,0,0.5)');
            } catch (error) {
                console.error('加载键盘设置失败:', error);
                notify(t('keyboard.messages.loadFailed'), 'error');
            } finally {
                //setLoading(false);
            }
        };
        loadSettings();
    }, []);

    // 处理键盘回显开关
    const handleEnableKeyboardEchoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.checked;
        setEnableKeyboardEcho(newValue);

        try {
            const currentSettings = await getSettings();
            await updateSettings({
                keyboard: {
                    ...currentSettings.keyboard,
                    enableKeyboardEcho: newValue,
                }
            });
            notify(t(newValue ? 'keyboard.messages.keyboardEnabled' : 'keyboard.messages.keyboardDisabled'), 'success');
        } catch (error) {
            console.error('保存设置失败:', error);
            notify(t('keyboard.messages.saveFailed'), 'error');
            // 恢复原值
            setEnableKeyboardEcho(!newValue);
        }
    };

    // 处理鼠标回显开关
    const handleEnableClickEchoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.checked;
        setEnableClickEcho(newValue);

        try {
            const currentSettings = await getSettings();
            await updateSettings({
                keyboard: {
                    ...currentSettings.keyboard,
                    enableClickEcho: newValue,
                }
            });
            notify(t(newValue ? 'keyboard.messages.clickEnabled' : 'keyboard.messages.clickDisabled'), 'success');
        } catch (error) {
            console.error('保存设置失败:', error);
            notify(t('keyboard.messages.saveFailed'), 'error');
            // 恢复原值
            setEnableClickEcho(!newValue);
        }
    };

    // 处理偏移量变化（拖动中）
    const handleOffsetChange = async (type: 'x' | 'y', value: number) => {
        if (type === 'x') {
            setOffsetX(value);
        } else {
            setOffsetY(value);
        }

        // 拖动时启用预览并更新偏移量
        try {
            const currentSettings = await getSettings();
            await updateSettings({
                keyboard: {
                    ...currentSettings.keyboard,
                    [type === 'x' ? 'offsetX' : 'offsetY']: value,
                    preview: true,
                }
            });
            if (!preview) {
                setPreview(true);
            }
        } catch (error) {
            console.error('更新预览失败:', error);
        }
    };

    // 处理偏移量修改完成（松开 slider）
    const handleOffsetChangeCommitted = async (type: 'x' | 'y', value: number) => {
        const currentSettings = await getSettings();
        try {
            await updateSettings({
                keyboard: {
                    ...currentSettings.keyboard,
                    [type === 'x' ? 'offsetX' : 'offsetY']: value,
                    preview: false,
                }
            });
            setPreview(false);
        } catch (error) {
            console.error('保存设置失败:', error);
            notify(t('keyboard.messages.saveFailed'), 'error');
            // 恢复原值
            if (type === 'x') {
                setOffsetX(currentSettings.keyboard?.offsetX ?? 0);
            } else {
                setOffsetY(currentSettings.keyboard?.offsetY ?? 0);
            }
        }
    };

    // 处理缩放比例变化（修改中）
    const handleScaleChange = async (value: number) => {
        // 限制范围 0.5 - 3.0
        const clampedValue = Math.max(0.5, Math.min(3.0, value));
        setScale(clampedValue);

        // 修改时启用预览
        try {
            const currentSettings = await getSettings();
            await updateSettings({
                keyboard: {
                    ...currentSettings.keyboard,
                    scale: clampedValue,
                    preview: true,
                }
            });
            if (!preview) {
                setPreview(true);
            }
        } catch (error) {
            console.error('更新预览失败:', error);
        }
    };

    // 处理缩放比例修改完成
    const handleScaleChangeCommitted = async (value: number) => {
        const clampedValue = Math.max(0.5, Math.min(3.0, value));
        const currentSettings = await getSettings();
        try {
            await updateSettings({
                keyboard: {
                    ...currentSettings.keyboard,
                    scale: clampedValue,
                    preview: false,
                }
            });
            setPreview(false);
        } catch (error) {
            console.error('保存设置失败:', error);
            notify(t('keyboard.messages.saveFailed'), 'error');
            // 恢复原值
            setScale(currentSettings.keyboard?.scale ?? 1.0);
        }
    };

    // 处理字体颜色变化
    const handleFgColorChange = async (color: any) => {
        const rgbaColor = color.rgba ? `rgba(${color.rgba.r},${color.rgba.g},${color.rgba.b},${color.rgba.a})` : color.hex;
        setFgColor(rgbaColor);

        try {
            const currentSettings = await getSettings();
            await updateSettings({
                keyboard: {
                    ...currentSettings.keyboard,
                    fgColor: rgbaColor,
                    preview: true,
                }
            });
            if (!preview) {
                setPreview(true);
            }
        } catch (error) {
            console.error('更新字体颜色失败:', error);
        }
    };

    // 处理字体颜色选择完成
    const handleFgColorChangeComplete = async () => {
        try {
            const currentSettings = await getSettings();
            await updateSettings({
                keyboard: {
                    ...currentSettings.keyboard,
                    fgColor: fgColor,
                    preview: false,
                }
            });
            setPreview(false);
            notify(t('keyboard.messages.fgColorUpdated'), 'success');
        } catch (error) {
            console.error('保存字体颜色失败:', error);
            notify(t('keyboard.messages.saveFailed'), 'error');
        }
    };

    // 处理背景颜色变化
    const handleBgColorChange = async (color: any) => {
        const rgbaColor = color.rgba ? `rgba(${color.rgba.r},${color.rgba.g},${color.rgba.b},${color.rgba.a})` : color.hex;
        setBgColor(rgbaColor);

        try {
            const currentSettings = await getSettings();
            await updateSettings({
                keyboard: {
                    ...currentSettings.keyboard,
                    bgColor: rgbaColor,
                    preview: true,
                }
            });
            if (!preview) {
                setPreview(true);
            }
        } catch (error) {
            console.error('更新背景颜色失败:', error);
        }
    };

    // 处理背景颜色选择完成
    const handleBgColorChangeComplete = async () => {
        try {
            const currentSettings = await getSettings();
            await updateSettings({
                keyboard: {
                    ...currentSettings.keyboard,
                    bgColor: bgColor,
                    preview: false,
                }
            });
            setPreview(false);
            notify(t('keyboard.messages.bgColorUpdated'), 'success');
        } catch (error) {
            console.error('保存背景颜色失败:', error);
            notify(t('keyboard.messages.saveFailed'), 'error');
        }
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ m: 1, mb: 3, display: "block" }}>{t('keyboard.title')}</Typography>

            <Box sx={{ p: 2, backgroundColor: '#ffffff', borderRadius: 2 }}>
                <Stack direction="column" spacing={3} sx={{ p: 2 }}>
                    <SettingField
                        label={t('keyboard.enableKeyboardEcho')}
                        value={
                            <Switch
                                checked={enableKeyboardEcho}
                                onChange={handleEnableKeyboardEchoChange}
                            />
                        }
                    />
                    <SettingField
                        label={t('keyboard.enableClickEcho')}
                        value={
                            <Switch
                                checked={enableClickEcho}
                                onChange={handleEnableClickEchoChange}
                            />
                        }
                    />

                    <SettingField
                        label={t('keyboard.scale')}
                        value={
                            <>
                                <TextField
                                    value={scale}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        if (!isNaN(value)) {
                                            handleScaleChange(value);
                                        }
                                    }}
                                    onBlur={(e) => {
                                        const value = Number(e.target.value);
                                        if (!isNaN(value)) {
                                            handleScaleChangeCommitted(value);
                                        }
                                    }}
                                    type="number"
                                    size="small"
                                    sx={{ width: 'max-content' }}
                                    inputProps={{ min: 0.1, max: 10.0, step: 0.1 }}
                                />
                            </>
                        }
                    />

                    {/* X 轴偏移 */}
                    <Box>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                            <Typography sx={{ width: 'max-content' }}>{t('keyboard.offsetX')}</Typography>
                            <Slider
                                value={offsetX}
                                onChange={(_, value) => handleOffsetChange('x', value as number)}
                                onChangeCommitted={(_, value) => handleOffsetChangeCommitted('x', value as number)}
                                min={-200}
                                max={200}
                                step={1}
                                valueLabelDisplay="auto"
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                value={offsetX}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    if (!isNaN(value)) {
                                        handleOffsetChange('x', value);
                                    }
                                }}
                                onBlur={(e) => {
                                    const value = Number(e.target.value);
                                    if (!isNaN(value)) {
                                        handleOffsetChangeCommitted('x', value);
                                    }
                                }}
                                type="number"
                                size="small"
                                sx={{ width: 'max-content' }}
                                inputProps={{ min: -200, max: 200 }}
                            />
                        </Stack>
                    </Box>

                    {/* Y 轴偏移 */}
                    <Box>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                            <Typography sx={{ width: 'max-content' }}>{t('keyboard.offsetY')}</Typography>
                            <Slider
                                value={offsetY}
                                onChange={(_, value) => handleOffsetChange('y', value as number)}
                                onChangeCommitted={(_, value) => handleOffsetChangeCommitted('y', value as number)}
                                min={-200}
                                max={200}
                                step={1}
                                valueLabelDisplay="auto"
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                value={offsetY}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    if (!isNaN(value)) {
                                        handleOffsetChange('y', value);
                                    }
                                }}
                                onBlur={(e) => {
                                    const value = Number(e.target.value);
                                    if (!isNaN(value)) {
                                        handleOffsetChangeCommitted('y', value);
                                    }
                                }}
                                type="number"
                                size="small"
                                sx={{ width: 'max-content' }}
                                inputProps={{ min: -200, max: 200 }}
                            />
                        </Stack>
                    </Box>

                    {/* 字体颜色 */}
                    <SettingField
                        label={t('keyboard.fgColor')}
                        value={
                            <>

                                <span>
                                    <Button
                                        variant="outlined"
                                        onClick={(e) => setFgColorAnchor(e.currentTarget)}
                                        sx={{
                                            width: '8rem',
                                            height: '3rem',
                                            border: '2px solid #ccc',
                                            backgroundImage: `
                                                    linear-gradient(45deg, #ccc 25%, transparent 25%),
                                                    linear-gradient(-45deg, #ccc 25%, transparent 25%),
                                                    linear-gradient(45deg, transparent 75%, #ccc 75%),
                                                    linear-gradient(-45deg, transparent 75%, #ccc 75%)
                                                `,
                                            backgroundSize: '10px 10px',
                                            backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                backgroundColor: fgColor,
                                            },

                                        }}
                                    >
                                    </Button>
                                </span>
                                <Popover
                                    open={Boolean(fgColorAnchor)}
                                    anchorEl={fgColorAnchor}
                                    onClose={() => {
                                        setFgColorAnchor(null);
                                        handleFgColorChangeComplete();
                                    }}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                >
                                    <Sketch
                                        color={rgbaStringToHsva(fgColor)}
                                        onChange={handleFgColorChange}
                                    />
                                </Popover>
                            </>
                        }
                    />

                    {/* 背景颜色 */}
                    <SettingField
                        label={t('keyboard.bgColor')}
                        value={
                            <>
                                <span>
                                    <Button
                                        variant="outlined"
                                        onClick={(e) => setBgColorAnchor(e.currentTarget)}
                                        sx={{
                                            width: '8rem',
                                            height: '3rem',
                                            border: '2px solid #ccc',
                                            backgroundImage: `
                                                    linear-gradient(45deg, #ccc 25%, transparent 25%),
                                                    linear-gradient(-45deg, #ccc 25%, transparent 25%),
                                                    linear-gradient(45deg, transparent 75%, #ccc 75%),
                                                    linear-gradient(-45deg, transparent 75%, #ccc 75%)
                                                `,
                                            backgroundSize: '10px 10px',
                                            backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                backgroundColor: bgColor,
                                            },

                                        }}
                                    >
                                    </Button>
                                </span>

                                <Popover
                                    open={Boolean(bgColorAnchor)}
                                    anchorEl={bgColorAnchor}
                                    onClose={() => {
                                        setBgColorAnchor(null);
                                        handleBgColorChangeComplete();
                                    }}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                >
                                    <Sketch
                                        color={rgbaStringToHsva(bgColor)}
                                        onChange={handleBgColorChange}
                                    />
                                </Popover>
                            </>
                        }
                    />

                </Stack>
            </Box>
        </Box>
    );
}

function 鼠标设置页面() {
    const { t } = useTranslation();
    //const [loading, setLoading] = useState(true);
    const [enableClickEffect, setEnableClickEffect] = useState(true);
    const [clickEffectType, setClickEffectType] = useState<'ripple' | 'firework' | 'spiral' | 'circleStroke' | 'rectStroke'>('ripple');
    const [scale, setScale] = useState(1.0);
    const [speed, setSpeed] = useState(1.0);

    const { notify } = useSnackbar();


    // 加载设置
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await getSettings();
                setEnableClickEffect(settings.mouse?.enableClickEffect || false);
                setClickEffectType(settings.mouse?.clickEffectType || 'ripple');
                setScale(settings.mouse?.scale ?? 1.0);
                setSpeed(settings.mouse?.speed ?? 1.0);
            } catch (error) {
                console.error('加载鼠标设置失败:', error);
                notify(t('mouse.messages.loadFailed'), 'error');
            } finally {
                //setLoading(false);
            }
        };
        loadSettings();
    }, []);

    // 处理点击特效开关
    const handleEnableClickEffectChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.checked;
        setEnableClickEffect(newValue);

        try {
            const currentSettings = await getSettings();
            await updateSettings({
                mouse: {
                    ...currentSettings.mouse,
                    enableClickEffect: newValue,
                    clickEffectType,
                }
            });
            notify(t(newValue ? 'mouse.messages.enabled' : 'mouse.messages.disabled'), 'success');
        } catch (error) {
            console.error('保存设置失败:', error);
            notify(t('mouse.messages.saveFailed'), 'error');
            // 恢复原值
            setEnableClickEffect(!newValue);
        }
    };

    // 处理点击特效类型选择
    const handleClickEffectTypeChange = async (event: any) => {
        const typeMap: Record<number, 'ripple' | 'firework' | 'spiral' | 'circleStroke' | 'rectStroke'> = {
            0: 'ripple',
            1: 'firework',
            2: 'spiral',
            3: 'circleStroke',
            4: 'rectStroke',
        };
        const newType = typeMap[event.target.value as number];
        setClickEffectType(newType);

        try {
            const currentSettings = await getSettings();
            await updateSettings({
                mouse: {
                    ...currentSettings.mouse,
                    enableClickEffect,
                    clickEffectType: newType,
                }
            });
            notify(t('mouse.messages.typeChanged', { type: t(`mouse.effects.${newType}`) }), 'success');
        } catch (error) {
            console.error('保存设置失败:', error);
            notify(t('mouse.messages.saveFailed'), 'error');
        }
    };

    const getEffectTypeValue = () => {
        const valueMap = { ripple: 0, firework: 1, spiral: 2, circleStroke: 3, rectStroke: 4 };
        return valueMap[clickEffectType];
    };

    // 处理缩放比例变化
    const handleScaleChange = async (value: number) => {
        const clampedValue = Math.max(0.1, Math.min(5.0, value));
        setScale(clampedValue);

        try {
            const currentSettings = await getSettings();
            await updateSettings({
                mouse: {
                    ...currentSettings.mouse,
                    scale: clampedValue,
                }
            });
            //notify(t('mouse.messages.scaleUpdated'), 'success');
        } catch (error) {
            console.error('保存设置失败:', error);
            notify(t('mouse.messages.saveFailed'), 'error');
            const currentSettings = await getSettings();
            setScale(currentSettings.mouse?.scale ?? 1.0);
        }
    };

    // 处理缩放比例修改完成（保持兼容性，但现在不需要做额外操作）
    const handleScaleChangeCommitted = async (value: number) => {
        // 现在在onChange时就已经保存了，这里不需要额外操作
    };

    // 处理速度变化
    const handleSpeedChange = async (value: number) => {
        const clampedValue = Math.max(0.1, Math.min(5.0, value));
        setSpeed(clampedValue);

        try {
            const currentSettings = await getSettings();
            await updateSettings({
                mouse: {
                    ...currentSettings.mouse,
                    speed: clampedValue,
                }
            });
            //notify(t('mouse.messages.speedUpdated'), 'success');
        } catch (error) {
            console.error('保存设置失败:', error);
            notify(t('mouse.messages.saveFailed'), 'error');
            const currentSettings = await getSettings();
            setSpeed(currentSettings.mouse?.speed ?? 1.0);
        }
    };

    // 处理速度修改完成（保持兼容性，但现在不需要做额外操作）
    const handleSpeedChangeCommitted = async (value: number) => {
        // 现在在onChange时就已经保存了，这里不需要额外操作
    };



    return (
        <Box>
            <Typography variant="h5" sx={{ m: 1, mb: 3, display: "block" }}>{t('mouse.title')}</Typography>

            <Box sx={{ p: 2, backgroundColor: '#ffffff', borderRadius: 2 }}>
                <Stack direction="column" spacing={3} sx={{ p: 2 }}>
                    <SettingField
                        label={t('mouse.enableClickEffect')}
                        value={
                            <Switch
                                checked={enableClickEffect}
                                onChange={handleEnableClickEffectChange}
                            />
                        }
                    />

                    <SettingField
                        label={t('mouse.clickEffectType')}
                        value={
                            <Select
                                id="click-effect-type-select"
                                value={getEffectTypeValue()}
                                onChange={handleClickEffectTypeChange}
                                disabled={!enableClickEffect}
                                size="small"
                                MenuProps={{
                                    slotProps: {
                                        list: {
                                            dense: true,
                                        }
                                    }
                                }}
                                sx={{ minWidth: '8rem' }}
                            >
                                <MenuItem value={0}>{t('mouse.effects.ripple')}</MenuItem>
                                <MenuItem value={1}>{t('mouse.effects.firework')}</MenuItem>
                                <MenuItem value={2}>{t('mouse.effects.spiral')}</MenuItem>
                                <MenuItem value={3}>{t('mouse.effects.circleStroke')}</MenuItem>
                                <MenuItem value={4}>{t('mouse.effects.rectStroke')}</MenuItem>
                            </Select>
                        }
                    />

                    <SettingField
                        label={t('mouse.scale')}
                        value={
                            <>
                                <Slider
                                    value={scale}
                                    onChange={(_, value) => handleScaleChange(value as number)}
                                    onChangeCommitted={(_, value) => handleScaleChangeCommitted(value as number)}
                                    min={0.1}
                                    max={5.0}
                                    step={0.1}
                                    valueLabelDisplay="auto"
                                    sx={{ width: '9.375rem', mr: 2 }}
                                />
                                <TextField
                                    value={scale}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        if (!isNaN(value)) {
                                            handleScaleChange(value);
                                        }
                                    }}
                                    onBlur={(e) => {
                                        const value = Number(e.target.value);
                                        if (!isNaN(value)) {
                                            handleScaleChangeCommitted(value);
                                        }
                                    }}
                                    type="number"
                                    size="small"
                                    sx={{ width: 'max-content' }}
                                    inputProps={{ min: 0.1, max: 5.0, step: 0.1 }}
                                />
                            </>
                        }
                    />

                    <SettingField
                        label={t('mouse.speed')}
                        value={
                            <>
                                <Slider
                                    value={speed}
                                    onChange={(_, value) => handleSpeedChange(value as number)}
                                    onChangeCommitted={(_, value) => handleSpeedChangeCommitted(value as number)}
                                    min={0.1}
                                    max={5.0}
                                    step={0.1}
                                    valueLabelDisplay="auto"
                                    sx={{ width: '9.375rem', mr: 2 }}
                                />
                                <TextField
                                    value={speed}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        if (!isNaN(value)) {
                                            handleSpeedChange(value);
                                        }
                                    }}
                                    onBlur={(e) => {
                                        const value = Number(e.target.value);
                                        if (!isNaN(value)) {
                                            handleSpeedChangeCommitted(value);
                                        }
                                    }}
                                    type="number"
                                    size="small"
                                    sx={{ width: 'max-content' }}
                                    inputProps={{ min: 0.1, max: 5.0, step: 0.1 }}
                                />
                            </>
                        }
                    />
                </Stack>
            </Box>
        </Box>
    );
}


function 绘图设置页面() {
    const { t } = useTranslation();
    const [toggleShortcut, setToggleShortcut] = useState('');
    const { notify } = useSnackbar();

    // 加载设置
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await getSettings();
                setToggleShortcut(settings.drawing?.toggleShortcut);
            } catch (error) {
                console.error('加载绘图设置失败:', error);
                notify(t('drawing.messages.loadFailed'), 'error');
            }
        };
        loadSettings();
    }, []);

    // 处理快捷键变化
    const handleShortcutChange = async (shortcut: string) => {
        setToggleShortcut(shortcut);

        try {
            const currentSettings = await getSettings();
            await updateSettings({
                drawing: {
                    ...currentSettings.drawing,
                    toggleShortcut: shortcut,
                }
            });
            notify(t('drawing.messages.shortcutUpdated', { shortcut }), 'success');
        } catch (error) {
            console.error('保存设置失败:', error);
            notify(t('drawing.messages.saveFailed', { error: String(error) }), 'error');
        }
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ m: 1, mb: 3, display: "block" }}>{t('drawing.title')}</Typography>

            <Box sx={{ p: 2, backgroundColor: '#ffffff', borderRadius: 2 }}>
                <Stack direction="column" spacing={3} sx={{ p: 2 }}>
                    <SettingField
                        label={t('drawing.toggleMode')}
                        value={
                            <ShortcutField
                                value={toggleShortcut}
                                onChange={handleShortcutChange}
                            />
                        } />
                    <SettingField
                        label={t('drawing.clearAnnotation')}
                        value={
                            <ShortcutField
                                value={"Alt+Q"}
                                onChange={() => { }}
                                disable={true}

                            />
                        } />
                    <SettingField
                        label={t('drawing.shortcutHelp')}
                        value={
                            <ShortcutField
                                value={"Shift+/"}
                                onChange={() => { }}
                                disable={true}
                            />
                        } />
                </Stack>
            </Box>
        </Box>
    );
}

function 通用设置页面() {
    const { t } = useTranslation();
    const [enableAutoStart, setEnableAutoStart] = useState(false);
    const [hasAccessibilityPermission, setHasAccessibilityPermission] = useState(false);
    const [hasInputMonitoringPermission, setHasInputMonitoringPermission] = useState(false);
    const { notify } = useSnackbar();
    const { isMac } = useOS();


    // 加载设置
    useEffect(() => {
        const loadSettings = async () => {
            const isEnabled = await AutoStart.isEnabled();
            setEnableAutoStart(isEnabled);

            // 检查 macOS 权限
            if (isMac()) {
                try {
                    const accessibilityStatus = await macosPermissions.checkAccessibilityPermission();
                    setHasAccessibilityPermission(accessibilityStatus);

                    const inputMonitoringStatus = await macosPermissions.checkInputMonitoringPermission();
                    setHasInputMonitoringPermission(inputMonitoringStatus);
                } catch (error) {
                    console.error('检查权限失败:', error);
                }
            }
        };
        loadSettings();
    }, []);

    const handleEnableAutoStartChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.checked;
        setEnableAutoStart(newValue);

        try {
            if (newValue) {
                await AutoStart.enable();
                notify(t('general.messages.autoStartEnabled'), 'success');
            } else {
                await AutoStart.disable();
                notify(t('general.messages.autoStartDisabled'), 'success');
            }
        } catch (error) {
            console.error('设置开机自启动失败:', error);
            notify(t('general.messages.autoStartFailed'), 'error');
            // 恢复原值
            setEnableAutoStart(!newValue);
        }
    }

    // 请求辅助功能权限
    const handleRequestAccessibilityPermission = async () => {
        try {
            await macosPermissions.requestAccessibilityPermission();
            notify(t('general.messages.grantAccessibilityPermission'), 'info');
        } catch (error) {
            console.error('请求辅助功能权限失败:', error);
            notify(t('general.messages.requestPermissionFailed'), 'error');
        }
    }

    // 请求输入监控权限
    const handleRequestInputMonitoringPermission = async () => {
        try {
            await macosPermissions.requestInputMonitoringPermission();
            notify(t('general.messages.grantInputMonitoringPermission'), 'info');
        } catch (error) {
            console.error('请求输入监控权限失败:', error);
            notify(t('general.messages.requestPermissionFailed'), 'error');
        }
    }


    return (
        <Box>
            <Typography
                variant="h5"
                sx={{
                    m: 1,
                    mb: 3,
                    display: isMac() ? "block" : "none"
                }}>{t('general.permissionTitle')}</Typography>
            <Box sx={{
                p: 2,
                backgroundColor: '#ffffff',
                borderRadius: 2,
                display: isMac() ? 'block' : 'none',
                mb: 4
            }}>
                <Stack direction="column" spacing={3} sx={{ p: 2 }}>
                    {/* 辅助功能权限 */}
                    <SettingField
                        label={t('general.accessibilityPermission')}
                        value={
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleRequestAccessibilityPermission}
                                startIcon={hasAccessibilityPermission ? <CheckCircleIcon /> : undefined}
                                color={hasAccessibilityPermission ? 'success' : 'primary'}

                            >
                                {hasAccessibilityPermission ? t('general.authorized') : t('general.requestPermission')}
                            </Button>
                        }
                    />

                    {/* 输入监控权限 */}
                    <SettingField
                        label={t('general.inputMonitoringPermission')}
                        value={
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleRequestInputMonitoringPermission}
                                startIcon={hasInputMonitoringPermission ? <CheckCircleIcon /> : undefined}
                                color={hasInputMonitoringPermission ? 'success' : 'primary'}

                            >
                                {hasInputMonitoringPermission ? t('general.authorized') : t('general.requestPermission')}
                            </Button>
                        }
                    />
                </Stack>
            </Box>

            <Typography variant="h5" sx={{ m: 1, mb: 3, display: "block" }}>{t('general.title')}</Typography>

            <Box sx={{ p: 2, backgroundColor: '#ffffff', borderRadius: 2 }}>
                <Stack direction="column" spacing={3} sx={{ p: 2 }}>
                    <LanguageSetting />
                    <SettingField
                        label={t('general.autoStart')}
                        value={
                            <Switch
                                checked={enableAutoStart}
                                onChange={handleEnableAutoStartChange}
                            />
                        }
                    />
                </Stack>
            </Box>
        </Box>
    );
}



export { 键盘设置页面, 鼠标设置页面, 绘图设置页面, 通用设置页面, 关于页面 };