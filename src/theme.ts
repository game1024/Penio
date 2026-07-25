import { createTheme } from '@mui/material/styles';
import { green } from '@mui/material/colors';

// 扩展 PaletteColor 和 TypeBackground 接口
declare module '@mui/material/styles' {
  interface PaletteColor {
    50?: string;
    100?: string;
    200?: string;
    300?: string;
    400?: string;
    500?: string;
    600?: string;
    700?: string;
    800?: string;
    900?: string;
  }

  interface SimplePaletteColorOptions {
    50?: string;
    100?: string;
    200?: string;
    300?: string;
    400?: string;
    500?: string;
    600?: string;
    700?: string;
    800?: string;
    900?: string;
  }

  interface TypeBackground {
    socialButton: string;
    socialButtonHover: string;
  }
}

const sharedTheme = {
  typography: {
    fontFamily: '"Fira Code", "Noto Sans SC", "Noto Sans TC", "Noto Sans", sans-serif',
  },
};

const sharedPalette = {
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#fff',
    ...green,
  },
};

const lightTheme = createTheme({
  ...sharedTheme,
  palette: {
    mode: 'light',
    ...sharedPalette,
    background: {
      default: '#e8e8e8',
      paper: '#ffffff',
      socialButton: '#ffffff',
      socialButtonHover: '#e8e8e8',
    },
  },
});

const darkTheme = createTheme({
  ...sharedTheme,
  palette: {
    mode: 'dark',
    ...sharedPalette,
    background: {
      default: '#0a0a0a',
      paper: '#1e1e1e',
      socialButton: '#ffffff',
      socialButtonHover: '#cccccc',
    },
  },
});

export function getTheme(mode: 'light' | 'dark') {
  return mode === 'dark' ? darkTheme : lightTheme;
}

// 保持向后兼容
const theme = lightTheme;
export default theme;
