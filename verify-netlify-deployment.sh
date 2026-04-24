#!/bin/bash

# Netlify 部署验证脚本

echo "🔍 Netlify 部署验证"
echo "===================="
echo ""

# 检查必要文件
echo "📋 检查配置文件..."

files=(
  "package.json"
  "vite.config.ts"
  "netlify.toml"
  "tsconfig.json"
  "index.html"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file 存在"
  else
    echo "  ❌ $file 缺失"
  fi
done

echo ""

# 检查 PWA 图标
echo "🖼️  检查 PWA 图标..."
if [ -d "public/img" ]; then
  icon_files=(
    "icon-192.png"
    "icon-512.png"
    "icon-192-maskable.png"
    "icon-512-maskable.png"
    "apple-touch-icon.png"
    "screenshot-1.png"
    "screenshot-2.png"
  )

  for icon in "${icon_files[@]}"; do
    if [ -f "public/img/$icon" ]; then
      echo "  ✅ $icon 存在"
    else
      echo "  ❌ $icon 缺失"
    fi
  done
else
  echo "  ❌ public/img 目录不存在"
fi

echo ""

# 检查 Node.js 和 npm（如果可用）
echo "🔧 检查构建环境..."
if command -v node &> /dev/null; then
  echo "  ✅ Node.js: $(node --version)"
else
  echo "  ⚠️  Node.js 未安装（Netlify 会自动提供）"
fi

if command -v npm &> /dev/null; then
  echo "  ✅ npm: $(npm --version)"
else
  echo "  ⚠️  npm 未安装（Netlify 会自动提供）"
fi

echo ""

# 验证 package.json
echo "📦 验证 package.json..."
if [ -f "package.json" ]; then
  # 检查关键依赖
  dependencies=(
    "vite"
    "vite-plugin-pwa"
    "react"
    "@vitejs/plugin-react"
  )

  for dep in "${dependencies[@]}"; do
    if grep -q "\"$dep\":" package.json; then
      echo "  ✅ $dep 依赖存在"
    else
      echo "  ❌ $dep 依赖缺失"
    fi
  done

  # 检查构建脚本
  if grep -q '"build":' package.json; then
    echo "  ✅ build 脚本存在"
  else
    echo "  ❌ build 脚本缺失"
  fi
fi

echo ""

# 验证 netlify.toml
echo "🌐 验证 Netlify 配置..."
if [ -f "netlify.toml" ]; then
  if grep -q "command = \"npm run build\"" netlify.toml; then
    echo "  ✅ 构建命令正确"
  else
    echo "  ❌ 构建命令错误"
  fi

  if grep -q "publish = \"dist\"" netlify.toml; then
    echo "  ✅ 发布目录正确"
  else
    echo "  ❌ 发布目录错误"
  fi

  if grep -q "NODE_VERSION = \"18\"" netlify.toml; then
    echo "  ✅ Node.js 版本指定"
  else
    echo "  ⚠️  Node.js 版本未指定"
  fi
else
  echo "  ❌ netlify.toml 不存在"
fi

echo ""

# 总结
echo "📊 验证总结"
echo "============"

errors=0
warnings=0

# 检查关键文件
for file in "${files[@]}"; do
  if [ ! -f "$file" ]; then
    ((errors++))
  fi
done

# 检查关键图标
if [ -d "public/img" ]; then
  for icon in "${icon_files[@]}"; do
    if [ ! -f "public/img/$icon" ]; then
      ((warnings++))
    fi
  done
else
  ((errors++))
fi

if [ $errors -eq 0 ]; then
  echo "✅ 所有关键文件都存在"
else
  echo "❌ 发现 $errors 个关键文件缺失"
fi

if [ $warnings -eq 0 ]; then
  echo "✅ 所有图标文件都存在"
else
  echo "⚠️  发现 $warnings 个图标文件缺失"
fi

echo ""
echo "🚀 下一步:"
echo "  1. 提交所有更改到 Git"
echo "  2. 推送到 Netlify 连接的仓库"
echo "  3. 等待 Netlify 自动部署"
echo "  4. 检查 Netlify 控制台的构建日志"

if [ $errors -gt 0 ]; then
  echo ""
  echo "❌ 请先修复上述错误再部署"
  exit 1
else
  echo ""
  echo "✅ 配置验证通过，可以安全部署！"
fi