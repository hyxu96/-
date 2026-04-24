# 🚀 MomoPet PWA 快速启动指南

## 30 秒快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 打开浏览器
# 访问 http://localhost:3000
```

## 核心特性已配置 ✅

| 功能 | 状态 | 位置 |
|------|------|------|
| Service Worker | ✅ | `src/main.tsx` |
| 应用清单 | ✅ | `public/manifest.json` |
| 应用图标 | ✅ | `public/img/` |
| 离线支持 | ✅ | `vite.config.ts` |
| 自动更新 | ✅ | `src/main.tsx` |
| HTML meta 标签 | ✅ | `index.html` |

## 验证 PWA（F12 DevTools）

1. **Application → Service Workers** → 检查激活状态
2. **Application → Manifest** → 查看应用信息
3. **Network** → 刷新页面 → 检查缓存

## 构建生产版本

```bash
# 构建
npm run build

# 本地测试
npm run preview

# 部署到服务器（需要 HTTPS）
```

## 应用信息

**名称**: MomoPet - 宠物健康助手  
**描述**: 可爱简约的手绘风宠物健康记录应用  
**主题色**: #f0f8e8 (淡绿色)  
**图标**: ✓ 已从 cover/ 生成  

## 文档

- 📖 详细指南：[PWA_DEPLOYMENT_GUIDE.md](./PWA_DEPLOYMENT_GUIDE.md)
- ✓ 完整清单：[PWA_CHECKLIST.md](./PWA_CHECKLIST.md)
- 📚 设置说明：[PWA_SETUP.md](./PWA_SETUP.md)

## 已安装的依赖

```json
{
  "vite-plugin-pwa": "^0.19.0"
}
```

## 关键文件

```
✓ vite.config.ts       - PWA 插件配置
✓ public/manifest.json - 应用清单
✓ index.html           - HTML 与 meta 标签
✓ src/main.tsx         - Service Worker 注册
✓ public/img/          - 应用图标
```

---

**准备就绪！🎉 现在可以 `npm run dev` 启动项目了**
