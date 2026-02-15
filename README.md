<p align="center">
  <img src="public/penio.png" alt="Penio Logo" width="120" height="120">
</p>

<h1 align="center">Penio</h1>

<p align="center">
  <strong>更酷、更炫、更灵动</strong>
</p>

<p align="center">
  一款强大的屏幕标注和演示工具，让你的演示、教学、录屏更加生动有趣
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#安装">安装</a> •
  <a href="#使用">使用</a> •
  <a href="#开发">开发</a> •
  <a href="#贡献">贡献</a> •
  <a href="#许可证">许可证</a>
</p>

---

## ✨ 功能特性

### 🎨 屏幕绘图

在屏幕上自由绘制，支持多种绘图工具，让你的演示更加直观。

<table>
  <tr>
    <td width="50%">
      <h4>压感画笔</h4>
      <video src="docs/mp4/屏幕绘图-压感画笔.mp4" controls></video>
      <p>支持压感的画笔工具，线条粗细随力度变化</p>
    </td>
    <td width="50%">
      <h4>渐隐画笔</h4>
      <video src="docs/mp4/屏幕绘图-渐隐画笔.mp4" controls></video>
      <p>笔迹自动渐隐消失，适合临时标注</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h4>矩形工具</h4>
      <video src="docs/mp4/屏幕绘图-矩形工具.mp4" controls></video>
      <p>快速绘制矩形框，突出重点区域</p>
    </td>
    <td width="50%">
      <h4>椭圆工具</h4>
      <video src="docs/mp4/屏幕绘图-椭圆工具.mp4" controls></video>
      <p>绘制圆形和椭圆，标注关键内容</p>
    </td>
  </tr>
</table>

### 🖱️ 鼠标点击特效

为鼠标点击添加炫酷的视觉效果，让观众清楚看到你的操作。

<table>
  <tr>
    <td width="33%">
      <h4>水波纹</h4>
      <video src="docs/mp4/水波纹.mp4" controls></video>
    </td>
    <td width="33%">
      <h4>烟花</h4>
      <video src="docs/mp4/烟花.mp4" controls></video>
    </td>
    <td width="33%">
      <h4>螺旋</h4>
      <video src="docs/mp4/螺旋.mp4" controls></video>
    </td>
  </tr>
  <tr>
    <td width="33%">
      <h4>圆形描边</h4>
      <video src="docs/mp4/圆形描边.mp4" controls></video>
    </td>
    <td width="33%">
      <h4>方形描边</h4>
      <video src="docs/mp4/方形描边.mp4" controls></video>
    </td>
    <td width="33%">
    </td>
  </tr>
</table>

### ⌨️ 键盘回显

实时显示你按下的按键，让教学演示更加清晰。

<video src="docs/mp4/键盘回显.mp4" controls></video>

### 🌍 多语言支持

支持中文（简体/繁体）、英语、日语、韩语、法语、德语、西班牙语等多种语言。

### 🎯 其他特性

- ✅ **跨平台支持**：支持 Windows、macOS、Linux
- ✅ **透明窗口**：绘图时不遮挡屏幕内容
- ✅ **快捷键操作**：自定义快捷键，快速切换功能
- ✅ **自定义样式**：调整颜色、大小、速度等参数
- ✅ **开机自启**：可设置开机自动启动
- ✅ **系统托盘**：最小化到系统托盘，随时调用

---

## 📦 安装

### 下载安装包

前往 [Releases](https://github.com/game1024/Penio/releases) 页面下载适合你操作系统的安装包：

- **Windows**: `Penio_x.x.x_x64_en-US.msi`
- **macOS**: `Penio_x.x.x_aarch64.dmg` 或 `Penio_x.x.x_x64.dmg`
- **Linux**: `Penio_x.x.x_amd64.deb` 或 `Penio_x.x.x_amd64.AppImage`

### 从源码构建

```bash
# 克隆仓库
git clone https://github.com/game1024/Penio.git
cd Penio

# 安装依赖
bun install

# 开发模式运行
bun run tauri dev

# 构建生产版本
bun run tauri build
```

---

## 🚀 使用

### 快捷键

默认快捷键（可在设置中自定义）：

- **切换绘图模式**: `Ctrl+Shift+D` (Windows/Linux) / `Cmd+Shift+D` (macOS)
- **显示/隐藏主窗口**: 点击系统托盘图标

### 基本操作

1. **启动应用**：应用会最小化到系统托盘
2. **打开设置**：点击托盘图标 → 设置
3. **启用功能**：
   - 在"鼠标"标签页启用点击特效
   - 在"键盘"标签页启用键盘回显
   - 在"绘图"标签页配置快捷键
4. **开始使用**：按下快捷键即可在屏幕上绘图

---

## 🛠️ 开发

### 技术栈

- **前端**: React + TypeScript + Vite
- **UI 框架**: Material-UI
- **桌面框架**: Tauri 2.0
- **后端**: Rust
- **绘图引擎**: Excalidraw
- **动画**: Mo.js

### 开发环境要求

- Node.js >= 18
- Bun >= 1.0
- Rust >= 1.70
- 操作系统特定要求：
  - **Windows**: WebView2
  - **macOS**: Xcode Command Line Tools
  - **Linux**: webkit2gtk, libgtk-3-dev

### 项目结构

```
penio/
├── src/                      # 前端源码
│   ├── components/          # React 组件
│   ├── hooks/              # 自定义 Hooks
│   ├── i18n/               # 国际化
│   ├── pages/              # 页面
│   ├── store/              # 状态管理
│   └── utils/              # 工具函数
├── src-tauri/              # Tauri 后端
│   ├── src/                # Rust 源码
│   ├── icons/              # 应用图标
│   └── capabilities/       # 权限配置
├── docs/                   # 文档和演示视频
└── public/                 # 静态资源
```

### 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

---

## 🙏 致谢

- [Tauri](https://tauri.app/) - 强大的桌面应用框架
- [Excalidraw](https://excalidraw.com/) - 优秀的手绘风格绘图工具
- [Mo.js](https://mojs.github.io/) - 灵活的动画库
- [Material-UI](https://mui.com/) - React UI 组件库

---

## 📮 联系方式

- **官网**: https://www.fiofio.cn
- **邮箱**: feedback@fiofio.cn
- **BiliBili**: [@game1024](https://space.bilibili.com/426988409)
- **Discord**: [加入我们的社区](https://discord.gg/sTqWPkTcqq)
- **GitHub Issues**: [报告问题](https://github.com/game1024/Penio/issues)

---

<p align="center">
  如果觉得这个项目对你有帮助，请给个 ⭐️ Star 支持一下！
</p>