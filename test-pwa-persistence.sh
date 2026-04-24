#!/bin/bash

# PWA 数据持久化测试脚本

echo "🧪 PWA 数据持久化测试"
echo "========================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 需要先安装 Node.js"
    echo "运行: brew install node"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"

# 检查依赖
if [ ! -f "package.json" ]; then
    echo "❌ 找不到 package.json"
    exit 1
fi

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建成功"

# 启动预览服务器
echo "🚀 启动预览服务器..."
npm run preview > /dev/null 2>&1 &
PREVIEW_PID=$!

# 等待服务器启动
sleep 3

echo "✅ 服务器启动 (PID: $PREVIEW_PID)"
echo ""
echo "📋 测试清单:"
echo "  1. 打开浏览器访问 http://localhost:4173"
echo "  2. 完成宠物设置和数据录入"
echo "  3. 刷新页面 - 数据应保持"
echo "  4. 打开 DevTools → Application → Storage"
echo "  5. 检查 localStorage 和 IndexedDB"
echo "  6. 设置网络为离线模式"
echo "  7. 修改数据 - 应正常保存"
echo "  8. 恢复网络 - 数据应同步"
echo ""
echo "🔍 调试命令:"
echo "  # 检查存储状态"
echo "  persistentStorage.getStorageInfo()"
echo ""
echo "  # 检查 Service Worker"
echo "  navigator.serviceWorker.getRegistrations()"
echo ""
echo "  # 手动恢复数据"
echo "  # (在浏览器控制台运行恢复脚本)"
echo ""
echo "⚠️  测试完成后按 Ctrl+C 停止服务器"

# 等待用户输入
trap "echo ''; echo '🛑 停止服务器...'; kill $PREVIEW_PID 2>/dev/null; exit 0" INT

# 保持脚本运行
while true; do
    sleep 1
done