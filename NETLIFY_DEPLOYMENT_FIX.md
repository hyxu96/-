# Netlify 部署故障排除指南

## 🚨 常见部署失败原因及解决方案

### 1. **构建命令失败**

**错误信息**: `Command failed with exit code 127` 或 `npm: command not found`

**原因**: Node.js 或 npm 未正确安装

**解决方案**:
- ✅ 已添加 `netlify.toml` 配置文件
- ✅ 指定 Node.js 版本为 18
- ✅ 确保构建命令正确

### 2. **PWA 插件配置问题**

**错误信息**: 构建时出现 PWA 相关错误

**原因**: VitePWA 配置可能有问题

**解决方案**:
- ✅ 简化了 runtimeCaching 配置
- ✅ 移除了可能有问题的 cacheKeyWillBeUsed 函数
- ✅ 优化了缓存策略

### 3. **TypeScript 编译错误**

**错误信息**: TypeScript 相关编译错误

**解决方案**:
- ✅ 更新了构建脚本为 `tsc && vite build`
- ✅ 确保类型检查在构建前完成

### 4. **静态资源引用问题**

**错误信息**: 找不到图片或其他静态资源

**原因**: PWA manifest 中引用的文件不存在

**解决方案**:
- ✅ 确保所有图标文件都存在于 `public/img/` 目录
- ✅ manifest.json 中的路径正确

## 🔧 Netlify 配置检查

### netlify.toml 配置说明

```toml
[build]
  command = "npm run build"          # 构建命令
  publish = "dist"                   # 输出目录
  environment = { NODE_VERSION = "18" }  # Node.js 版本

[build.environment]
  VITE_DISABLE_HMR = "true"          # 禁用热重载

# SPA 重定向规则
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# 安全头和缓存策略
[[headers]]
  # Service Worker
  for = "/sw.js"
  Cache-Control = "public, max-age=0, must-revalidate"

  # 静态资源
  for = "/assets/*"
  Cache-Control = "public, max-age=31536000, immutable"

  # PWA 资源
  for = "/img/*"
  Cache-Control = "public, max-age=86400"
```

## 📋 部署前检查清单

### 本地构建测试
```bash
# 1. 清理缓存
npm run clean

# 2. 安装依赖
npm install

# 3. 类型检查
npm run lint

# 4. 构建测试
npm run build

# 5. 预览测试
npm run preview
```

### 文件检查
- [ ] `package.json` - 依赖正确，脚本正确
- [ ] `vite.config.ts` - PWA 配置正确
- [ ] `netlify.toml` - 配置文件存在
- [ ] `public/img/` - 所有图标文件存在
- [ ] `dist/` - 构建输出目录（构建后）

### Netlify 设置检查
- [ ] **构建命令**: `npm run build`
- [ ] **发布目录**: `dist`
- [ ] **Node 版本**: 18 或更高
- [ ] **环境变量**: 如有需要，正确设置

## 🐛 常见错误及解决方案

### 错误: `vite-plugin-pwa` 相关错误

**解决方案**: 检查 PWA 配置
```typescript
// 确保 vite.config.ts 中的配置正确
VitePWA({
  registerType: 'autoUpdate',
  injectRegister: 'auto',
  // 简化配置，避免复杂选项
})
```

### 错误: 找不到静态资源

**解决方案**: 验证文件路径
```bash
# 检查图标文件
ls -la public/img/

# 检查构建输出
ls -la dist/
```

### 错误: TypeScript 编译失败

**解决方案**: 运行类型检查
```bash
npm run lint
```

### 错误: 构建超时

**解决方案**: 优化构建配置
- 减少不必要的依赖
- 优化图片大小
- 检查循环依赖

## 🚀 部署步骤

### 1. 推送到 Git 仓库
```bash
git add .
git commit -m "Fix Netlify deployment issues"
git push origin main
```

### 2. Netlify 自动部署
- Netlify 会自动检测推送并开始构建
- 查看构建日志了解具体错误

### 3. 手动触发部署（可选）
- 在 Netlify 控制台中手动触发新部署
- 检查构建设置是否正确

## 📊 监控部署状态

### Netlify 控制台检查
1. **Deploy** 标签页 - 查看构建状态
2. **Functions** 标签页 - 检查函数状态
3. **Site settings** - 验证配置

### 构建日志分析
- 查看完整的构建日志
- 关注错误信息和警告
- 检查资源大小是否合理

## 🔄 回滚策略

如果新部署失败：

1. **暂停自动部署**
2. **回滚到上一个工作版本**
3. **修复问题后重新部署**

## 📞 获取帮助

### Netlify 支持
- [Netlify 文档](https://docs.netlify.com/)
- [构建故障排除](https://docs.netlify.com/configure-builds/troubleshooting-tips/)

### 社区资源
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [Vite PWA 部署](https://vite-pwa-org.netlify.app/deployment/)

---

**最后更新**: 2026年4月24日
**状态**: ✅ 配置已优化，准备重新部署