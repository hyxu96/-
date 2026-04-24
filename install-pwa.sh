#!/bin/bash

# PWA 快速安装脚本 - 在 macOS 上运行

echo "========================================"
echo "React PWA 快速安装指南"
echo "========================================"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    echo ""
    echo "请先安装 Homebrew，然后运行："
    echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    echo ""
    echo "然后安装 Node.js："
    echo "  brew install node"
    echo ""
    exit 1
fi

echo "✅ Node.js 已安装: $(node --version)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

echo "✅ npm 已安装: $(npm --version)"
echo ""

# 安装依赖
echo "📦 安装 PWA 依赖..."
npm install vite-plugin-pwa -D

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ PWA 依赖安装成功！"
    echo ""
    echo "已完成以下配置："
    echo "  ✓ vite.config.ts - 已配置 VitePWA 插件"
    echo "  ✓ index.html - 已添加 PWA meta 标签"
    echo "  ✓ public/manifest.json - 已创建应用清单"
    echo "  ✓ src/lib/pwa-utils.ts - PWA 工具函数"
    echo ""
    echo "后续步骤："
    echo "  1. 将应用图标放到 public/img/ 目录"
    echo "  2. 运行: npm run dev"
    echo "  3. 在浏览器中检查 DevTools > Application > Service Workers"
    echo ""
    echo "构建生产版本："
    echo "  npm run build"
    echo ""
else
    echo "❌ PWA 依赖安装失败"
    exit 1
fi
