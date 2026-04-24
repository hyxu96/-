# PWA 安装指南

本项目已配置为 Progressive Web App (PWA)。以下是必要的步骤和说明。

## 安装步骤

### 1. 安装 Node.js（如果未安装）

在 macOS 上，使用 Homebrew 安装：
```bash
# 首先安装 Homebrew（如果未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 然后安装 Node.js
brew install node
```

### 2. 安装 PWA 依赖

```bash
npm install vite-plugin-pwa -D
```

### 3. 运行开发服务器

```bash
npm run dev
```

## 文件说明

- **vite.config.ts** - 已配置 VitePWA 插件，包含 Workbox 配置
- **index.html** - 已添加 PWA 必需的 meta 标签和 manifest 链接
- **public/manifest.json** - PWA 应用清单文件
- **public/img/** - 应放置应用图标文件：
  - icon-192.png (192x192)
  - icon-512.png (512x512)
  - icon-192-maskable.png (192x192 - 可适应不同形状的图标)
  - icon-512-maskable.png (512x512 - 可适应不同形状的图标)
  - apple-touch-icon.png (180x180 - iOS)
  - screenshot-1.png (540x720 - 移动端)
  - screenshot-2.png (1280x720 - 桌面端)

## 功能配置

### 已启用的功能：

1. **自动更新** - Service Worker 会自动检查并安装更新
2. **离线支持** - 所有资源都被缓存，支持离线使用
3. **安装提示** - 用户可以将应用添加到主屏幕

### Workbox 配置：

```typescript
workbox: {
  clientsClaim: true,          // 立即控制所有页面
  skipWaiting: true,           // 跳过等待期，立即激活新 SW
  globPatterns: [              // 缓存的文件模式
    '**/*.{js,css,html,ico,png,svg}'
  ]
}
```

## 构建和部署

### 生产构建：

```bash
npm run build
```

生成的 `dist` 文件夹包含完整的 PWA，包括：
- `sw.js` - Service Worker（自动生成）
- `workbox-*.js` - Workbox 库（自动生成）
- `manifest.webmanifest` - PWA 清单（自动生成）

### 注意事项：

- PWA 需要通过 HTTPS 提供（本地开发和 localhost 除外）
- 首次加载时，应用会注册 Service Worker
- 应用可以在支持 PWA 的浏览器中安装（Chrome、Edge、Safari iOS）

## 添加应用图标

将您的应用图标放入 `public/img/` 目录。推荐使用以下工具生成：

- [PWA Image Generator](https://www.pwabuilder.com/)
- [Icon Generator](https://www.favicon-generator.org/)

## 测试 PWA

1. 使用 `npm run build` 构建项目
2. 使用 `npm run preview` 在本地预览
3. 在浏览器开发者工具中检查：
   - Application > Service Workers
   - Application > Manifest
   - Network 标签查看缓存情况

## 浏览器支持

- Chrome/Edge 40+
- Firefox 44+
- Safari 11.1+ (iOS 12+)
- Samsung Internet 4+
