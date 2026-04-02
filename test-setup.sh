#!/bin/bash

# WPS Editor 测试脚本

echo "======================================"
echo "WPS Editor 环境检查"
echo "======================================"

# 检查 Node.js
echo -n "检查 Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ $NODE_VERSION"
else
    echo "❌ 未安装 Node.js"
    exit 1
fi

# 检查 npm
echo -n "检查 npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ $NPM_VERSION"
else
    echo "❌ 未安装 npm"
    exit 1
fi

# 检查 LibreOffice (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -n "检查 LibreOffice... "
    if [ -f "/Applications/LibreOffice.app/Contents/MacOS/soffice" ]; then
        echo "✅ 已安装"
    else
        echo "⚠️  未安装 LibreOffice"
        echo "   请运行：brew install --cask libreoffice"
    fi
fi

# 检查项目依赖
echo -n "检查项目依赖... "
if [ -d "node_modules" ]; then
    echo "✅ 已安装"
else
    echo "❌ 未安装依赖"
    echo "   请运行：npm install"
    exit 1
fi

# 检查编译输出
echo -n "检查编译输出... "
if [ -f "out/extension.js" ]; then
    echo "✅ 已编译"
else
    echo "⚠️  未编译"
    echo "   请运行：npm run compile"
fi

echo ""
echo "======================================"
echo "测试建议"
echo "======================================"
echo "1. 按 F5 启动调试"
echo "2. 打开一个 .wps 文件测试"
echo "3. 检查是否正确显示 PDF 预览"
echo ""
echo "如需创建测试文件:"
echo "1. 用 WPS Office 创建一个简单文档"
echo "2. 保存为 .wps 格式"
echo "3. 在 VSCode 中打开"
echo ""
