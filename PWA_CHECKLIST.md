# PWA 配置完成清单

## ✅ 已完成的配置

### 1. **vite.config.ts** 已更新
   - 导入了 `VitePWA` 插件
   - 配置了 Workbox 缓存策略
   - 定义了应用 manifest 信息

### 2. **index.html** 已更新
   - 添加了 PWA 必需的 meta 标签
   - 添加了 manifest.json 引用
   - 添加了主题颜色和移动网络应用支持标签

### 3. **public/manifest.json** 已创建
   - 定义了应用名称、图标、展示方式等
   - 配置了应用快捷方式
   - 定义了应用分类

### 4. **src/lib/pwa-utils.ts** 已创建
   - 提供 Service Worker 注册函数
   - 提供更新检查和通知功能
   - 支持自动更新检查

### 5. **文档已创建**
   - PWA_SETUP.md - 详细安装指南
   - install-pwa.sh - 快速安装脚本

## 📋 后续必须完成的步骤

### 1. 安装 Node.js（如果未安装）
```bash
# 安装 Homebrew（如果需要）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js
brew install node
```

### 2. 安装 PWA 依赖
```bash
npm install vite-plugin-pwa -D
```

或使用脚本：
```bash
chmod +x install-pwa.sh
./install-pwa.sh
```

### 3. 添加应用图标
在 `public/img/` 目录下放置以下图标文件：

| 文件名 | 尺寸 | 用途 |
|------|------|------|
| icon-192.png | 192x192 | Android 主屏幕 |
| icon-512.png | 512x512 | Android 启动画面 |
| icon-192-maskable.png | 192x192 | Android 自适应图标 |
| icon-512-maskable.png | 512x512 | Android 自适应图标 |
| apple-touch-icon.png | 180x180 | iOS 主屏幕 |
| screenshot-1.png | 540x720 | 移动端截图 |
| screenshot-2.png | 1280x720 | 桌面端截图 |

**快速生成工具**：
- [PWA Builder](https://www.pwabuilder.com/)
- [Favicon Generator](https://realfavicongenerator.net/)

### 4. 启动开发服务器
```bash
npm run dev
```

### 5. 构建生产版本
```bash
npm run build
npm run preview  # 本地测试生产版本
```

## 🧪 测试 PWA

### 在浏览器中检查：
1. 打开 DevTools (F12)
2. 进入 "Application" 标签页
3. 检查以下内容：
   - **Service Workers** - 应该显示已激活的 Service Worker
   - **Manifest** - 应该显示正确的应用清单信息
   - **Cache Storage** - 应该显示缓存的资源

### 安装应用：
- Chrome/Edge: 地址栏右上角应显示"安装"按钮
- Safari iOS: 点击分享按钮 > 添加到主屏幕
- Firefox: 右键菜单 > 安装应用

## 🚀 部署到生产环境

### 重要要求：
- **必须使用 HTTPS**（除了 localhost）
- 确保 manifest.json 可访问
- Service Worker 文件必须正确提供

### 部署检查清单：
- [ ] 所有图标文件已上传
- [ ] 生产构建已生成（npm run build）
- [ ] dist 文件夹包含 sw.js 和 manifest.webmanifest
- [ ] 已在 HTTPS 上部署
- [ ] manifest.json 响应头正确（Content-Type: application/json）
- [ ] Service Worker 已注册
- [ ] 在 DevTools 中验证缓存策略

## 📚 配置说明

### Workbox 缓存策略
```typescript
globPatterns: ['**/*.{js,css,html,ico,png,svg}']
```
- 缓存所有 JS、CSS、HTML、图标和 SVG 文件
- 其他资源需要网络

### Service Worker 更新
- `registerType: 'autoUpdate'` - 自动更新 Service Worker
- `injectRegister: 'auto'` - 自动注入注册代码
- `skipWaiting: true` - 新 Service Worker 立即生效

## 🔧 自定义 Service Worker 行为

在你的应用中使用 PWA 工具函数：

```typescript
import { 
  registerServiceWorkerWithNotification,
  checkForUpdates,
  startPeriodicUpdateCheck 
} from '@/lib/pwa-utils';

// 注册 SW 并显示更新通知
registerServiceWorkerWithNotification();

// 手动检查更新
checkForUpdates();

// 启动定期更新检查（每5分钟）
startPeriodicUpdateCheck();
```

## ❓ 常见问题

**Q: Service Worker 没有显示在 DevTools 中？**
A: 
- 清除浏览器缓存
- 确保运行在 HTTPS 或 localhost 上
- 检查 browser console 中的错误

**Q: 应用无法离线工作？**
A:
- 确保资源已缓存（检查 Cache Storage）
- 可能需要增加 globPatterns 中的文件模式
- 检查网络配置

**Q: 如何更新 PWA 中的图标？**
A:
- 更新 public/img 中的文件
- 构建新版本（npm run build）
- Service Worker 会自动检查和更新

## 📖 相关资源

- [Vite PWA 官方文档](https://vite-pwa-org.netlify.app/)
- [Workbox 文档](https://developers.google.com/web/tools/workbox)
- [PWA 开发者文档](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web App Manifest 规范](https://www.w3.org/TR/appmanifest/)
