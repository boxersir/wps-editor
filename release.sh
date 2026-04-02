#!/bin/bash

# WPS Editor 发布脚本
# 使用方法：./release.sh [version]

set -e

echo "======================================"
echo "WPS Editor 发布脚本"
echo "======================================"

# 检查是否安装了 vsce
if ! command -v vsce &> /dev/null
then
    echo "❌ 未安装 VSCE 工具"
    echo "请先运行：npm install -g @vscode/vsce"
    exit 1
fi

# 检查是否登录
echo "检查 VSCE 登录状态..."
if ! vsce ls &> /dev/null
then
    echo "⚠️  未登录 VSCE Marketplace"
    echo "请先运行：vsce login <publisher-name>"
    exit 1
fi
echo "✅ VSCE 已登录"

# 获取版本号
if [ -z "$1" ]; then
    VERSION=$(node -p "require('./package.json').version")
    echo "使用 package.json 中的版本号：$VERSION"
else
    VERSION=$1
    echo "使用指定版本号：$VERSION"
fi

# 编译
echo ""
echo "======================================"
echo "步骤 1: 编译项目"
echo "======================================"
npm run compile
echo "✅ 编译完成"

# 检查必要文件
echo ""
echo "======================================"
echo "步骤 2: 检查必要文件"
echo "======================================"

files=(
    "package.json"
    "README.md"
    "CHANGELOG.md"
    "LICENSE"
    "out/extension.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ 缺少文件：$file"
        exit 1
    fi
done

# 检查图标（警告但不阻止）
if [ -f "images/icon.png" ]; then
    echo "✅ images/icon.png"
else
    echo "⚠️  缺少图标：images/icon.png（可选）"
fi

# 打包
echo ""
echo "======================================"
echo "步骤 3: 打包扩展"
echo "======================================"
vsce package --out wps-editor-$VERSION.vsix
echo "✅ 打包完成：wps-editor-$VERSION.vsix"

# 询问是否发布
echo ""
echo "======================================"
echo "步骤 4: 发布到 Marketplace"
echo "======================================"
read -p "是否立即发布到 VSCode Marketplace? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "发布中..."
    vsce publish
    echo "✅ 发布完成"
    
    echo ""
    echo "======================================"
    echo "发布成功！"
    echo "======================================"
    echo "扩展页面：https://marketplace.visualstudio.com/items?itemName=wps-editor.wps-editor"
    echo ""
    echo "下一步："
    echo "1. 验证扩展页面显示正常"
    echo "2. 测试在线安装"
    echo "3. 创建 Git 标签"
    echo "4. 创建 GitHub Release"
else
    echo ""
    echo "======================================"
    echo "打包完成，未发布"
    echo "======================================"
    echo "可以手动运行：vsce publish"
    echo "或安装本地包测试：code --install-extension wps-editor-$VERSION.vsix"
fi

echo ""
echo "======================================"
echo "发布脚本执行完毕"
echo "======================================"
