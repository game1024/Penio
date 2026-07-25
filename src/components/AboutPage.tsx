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

import { Box, Typography, Button, Stack, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { open } from "@tauri-apps/plugin-shell";
import { getVersion, getName, getTauriVersion } from "@tauri-apps/api/app";
import { platform, arch, version } from "@tauri-apps/plugin-os";
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useSnackbar } from "../contexts/SnackbarContext";
import githubIcon from "../assets/github.svg";
import bmcIcon from "../assets/bmc.svg";

function 关于页面() {
    const { t } = useTranslation();
    const { notify } = useSnackbar();
    const [appName, setAppName] = useState<string>("...");
    const [appVersion, setAppVersion] = useState<string>("...");
    const [tauriVersion, setTauriVersion] = useState<string>("...");
    const [platformInfo, setPlatformInfo] = useState<{
        platform: string;
        platformArch: string;
        platformVersion: string;
    }>({
        platform: "...",
        platformArch: "...",
        platformVersion: "...",
    });
    const githubUrl = "https://github.com/game1024/Penio";
    const bmcUrl = "https://buymeacoffee.com/game1024";

    useEffect(() => {
        getName().then(setAppName);
        getVersion().then(setAppVersion);
        getTauriVersion().then(setTauriVersion);
        
        // 获取平台信息
        Promise.all([
            platform(),
            arch(),
            version(),
        ]).then(([platformName, platformArch, platformVersion]) => {
            setPlatformInfo({
                platform: platformName,
                platformArch,
                platformVersion,
            });
        });
    }, []);

    const handleGithubClick = async () => {
        await open(githubUrl);
    };

    const handleBmcClick = async () => {
        await open(bmcUrl);
    };

    const handleCopySystemInfo = async () => {
        const systemInfo = {
            appName,
            appVersion,
            tauriVersion,
            platform: platformInfo.platform,
            platformArch: platformInfo.platformArch,
            platformVersion: platformInfo.platformVersion,
        };
        
        try {
            await navigator.clipboard.writeText(JSON.stringify(systemInfo, null, 2));
            notify(t('about.copySuccess'), 'success');
        } catch (error) {
            notify(t('about.copyFailed'), 'error');
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 4,
                margin: "0 auto",
                gap: 4,
                maxWidth: '28rem',
            }}
        >
            {/* Logo 和应用信息 */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                {/* 应用Logo */}
                <Box
                    component="img"
                    src="/penio.png"
                    alt={appName}
                    sx={{
                        width: '6rem',
                        height: '6rem',
                        objectFit: "contain",
                    }}
                />

                {/* 应用名称和版本号 */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 0.5,
                    }}
                >
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        {appName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('about.version', { version: appVersion })}
                    </Typography>
                </Box>
            </Box>

            {/* 社交链接图标 */}
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Tooltip title="GitHub" arrow>
                    <IconButton
                        onClick={handleGithubClick}
                        sx={{
                            width: '3rem',
                            height: '3rem',
                            backgroundColor: 'background.socialButton',
                            '&:hover': {
                                backgroundColor: 'background.socialButtonHover',
                            },
                        }}
                    >
                        <Box
                            component="img"
                            src={githubIcon}
                            alt="GitHub"
                            sx={{ width: '1.5rem', height: '1.5rem' }}
                        />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Buy Me a Coffee" arrow>
                    <IconButton
                        onClick={handleBmcClick}
                        sx={{
                            width: '3rem',
                            height: '3rem',
                            backgroundColor: 'background.socialButton',
                            '&:hover': {
                                backgroundColor: 'background.socialButtonHover',
                            },
                        }}
                    >
                        <Box
                            component="img"
                            src={bmcIcon}
                            alt="Buy Me a Coffee"
                            sx={{ width: '1.5rem', height: '1.5rem' }}
                        />
                    </IconButton>
                </Tooltip>

            </Stack>

            {/* 操作按钮 */}
            <Stack spacing={2} sx={{ width: '100%', mt: 2 }}>
                {/* 复制软件信息 */}
                <Button
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopySystemInfo}
                    sx={{
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: "none",
                    }}
                >
                    {t('about.copySystemInfo')}
                </Button>
            </Stack>
        </Box>
    );
}

export default 关于页面;
