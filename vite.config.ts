import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // 确保字体等资源文件被正确处理
  assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.ttf', '**/*.otf'],

  resolve: {
    alias: {
      "@excalidraw/excalidraw": path.resolve(__dirname, "src/packages/excalidraw/packages/excalidraw"),
      "@excalidraw/utils": path.resolve(__dirname, "src/packages/excalidraw/packages/utils"),
      "@excalidraw/math": path.resolve(__dirname, "src/packages/excalidraw/packages/math"),
    },
  },

  // 配置 CSS 预处理器
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler' as const,
        silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions'],
        quietDeps: true,
      },
    },
  },

  // 配置多页面入口
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        'motion-board': 'motion-board.html',
      },
      external: [
        // 排除测试相关的模块
        /\.test\.(ts|tsx|js|jsx)$/,
        /\.spec\.(ts|tsx|js|jsx)$/,
        /__tests__/,
      ],
    },
    // 排除 node_modules 中的测试文件
    commonjsOptions: {
      exclude: [
        /\.test\.(ts|tsx|js|jsx)$/,
        /\.spec\.(ts|tsx|js|jsx)$/,
        /__tests__/,
      ],
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
});
