# WPS Editor for VSCode

一款用于在 VSCode 中预览和编辑 WPS 文档的插件。

[![Version](https://img.shields.io/github/package-json/v/wps-editor/wps-editor)](https://marketplace.visualstudio.com/items?itemName=wps-editor.wps-editor)
[![License](https://img.shields.io/github/license/wps-editor/wps-editor)](https://github.com/wps-editor/wps-editor/blob/main/LICENSE)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/wps-editor.wps-editor)](https://marketplace.visualstudio.com/items?itemName=wps-editor.wps-editor)

## 安装

### 从 VSCode Marketplace 安装（推荐）

1. 打开 VSCode
2. 按 `Ctrl+P` (或 `Cmd+P` on macOS)
3. 输入 `ext install wps-editor.wps-editor`
4. 按回车安装

### 手动安装

1. 从 [GitHub Releases](https://github.com/wps-editor/wps-editor/releases) 下载最新的 `.vsix` 文件
2. 在 VSCode 中，按 `Ctrl+Shift+P` (或 `Cmd+Shift+P` on macOS)
3. 输入 `Extensions: Install from VSIX`
4. 选择下载的 `.vsix` 文件

## 功能特性

- ✅ 支持 WPS 文档格式预览 (.wps, .et, .dps)
- ✅ 支持 Microsoft Office 格式 (.doc, .docx, .xls, .xlsx, .ppt, .pptx)
- ✅ PDF 预览（基于 PDF.js）
- ✅ 文档编辑功能
- ✅ 格式转换（WPS → PDF, WPS → HTML）
- ✅ 富文本编辑器
- ✨ **新增**: .docx/.xlsx 格式无需安装 LibreOffice（使用 JavaScript 库）

## 安装依赖

```bash
npm install
```

## 开发

```bash
# 编译 TypeScript
npm run compile

# 监听模式
npm run watch

# 打包扩展
npm run vscode:prepublish
```

## 使用方法

### 预览文档
1. 在 VSCode 中打开 WPS 文档
2. 右键点击文件，选择 "Open With" → "WPS Editor"
3. 或使用命令面板：`Ctrl+Shift+P` → "WPS Editor: Open WPS Preview"

### 编辑文档
1. 在预览模式下点击 "编辑模式" 按钮
2. 使用富文本编辑器进行编辑
3. 点击 "保存" 按钮保存更改

### 转换为 PDF
1. 打开 WPS 文档
2. 使用命令面板：`Ctrl+Shift+P` → "WPS Editor: Convert to PDF"
3. 选择保存位置

## 系统要求

- VSCode >= 1.85.0
- Node.js >= 16.0.0

### ⚠️ 重要：LibreOffice 依赖

此插件依赖 **LibreOffice** 进行文档转换，但以下格式除外：

- ✅ **.docx** (Word 2007+) - 使用 Mammoth.js，**无需 LibreOffice**
- ✅ **.xlsx** (Excel 2007+) - 使用 ExcelJS，**无需 LibreOffice**
- ⚠️ **.wps, .et, .dps, .doc, .xls** - 需要安装 LibreOffice

**安装 LibreOffice:**

#### macOS
```bash
# 使用 Homebrew（推荐）
brew install --cask libreoffice

# 或从官网下载
# https://www.libreoffice.org/download/
```

#### Windows
从官网下载安装：https://www.libreoffice.org/download/

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get install libreoffice

# CentOS/RHEL
sudo yum install libreoffice

# Fedora
sudo dnf install libreoffice
```

#### 验证安装

```bash
# macOS
ls -la /Applications/LibreOffice.app/Contents/MacOS/soffice

# Linux
which soffice

# Windows
# 检查 C:\Program Files\LibreOffice\program\soffice.exe
```

#### 自定义路径

如果 LibreOffice 不在默认路径，可以在 VSCode 设置中配置：

```json
{
  "wpsEditor.libreOfficePath": "/你的/LibreOffice/路径/soffice"
}
```

常见路径：
- **macOS**: `/Applications/LibreOffice.app/Contents/MacOS/soffice`
- **Linux**: `/usr/bin/soffice`
- **Windows**: `C:\Program Files\LibreOffice\program\soffice.exe`

## 配置选项

- `wpsEditor.libreOfficePath`: LibreOffice 可执行文件路径（留空使用默认路径）
- `wpsEditor.autoPreview`: 打开 WPS 文档时自动预览

## 技术架构

```
┌─────────────────────────────────────┐
│   VSCode Extension                  │
│  ┌─────────────────────────────┐    │
│  │   Webview Panel             │    │
│  │  ┌───────────────────────┐  │    │
│  │  │  预览模式：PDF.js    │  │    │
│  │  │  编辑模式：HTML5    │  │    │
│  │  └───────────────────────┘  │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   DocumentConverter                 │
│  - LibreOffice 转换引擎             │
│  - WPS ↔ PDF                        │
│  - WPS ↔ HTML                       │
└─────────────────────────────────────┘
```

## 支持的文件格式

- **WPS 格式**: .wps (文字), .et (表格), .dps (演示)
- **Microsoft Office**: .doc, .docx, .xls, .xlsx, .ppt, .pptx
- **OpenDocument**: .odt, .ods, .odp
- **PDF**: .pdf (仅预览)

## 开发计划

- [ ] 表格编辑支持
- [ ] 演示文稿编辑支持
- [ ] 实时协作编辑
- [ ] 文档版本控制
- [ ] 更多格式支持

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
