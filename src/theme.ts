import { createTheme } from '@mui/material/styles';
import { green } from '@mui/material/colors';

// 扩展 PaletteColor 接口以支持色阶
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
}

const theme = createTheme({
  typography: {
    fontFamily: '"Fira Code", "Noto Sans SC", "Noto Sans TC", "Noto Sans", sans-serif',
  },
  palette: {
    success: {
      main: '#2e7d32', // MUI 默认 success.main
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#fff',
      ...green, // 注入 50-900 的色阶
    },
  },
});

export default theme;
