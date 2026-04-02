# LibreOffice 依赖处理方案

## 问题分析

WPS Editor 依赖 LibreOffice 进行文档转换，这是一个**必要的外部依赖**。需要在发布时明确告知用户并提供简单的安装方案。

## 解决方案

### 方案一：用户自行安装（推荐）⭐

**优点**：
- ✅ 插件体积小（~500KB vs ~300MB）
- ✅ 符合 VSCode 扩展规范
- ✅ 用户可选择安装位置
- ✅ 更新维护简单

**缺点**：
- ⚠️ 需要用户额外安装

**实施步骤**：

#### 1. 在文档中明确说明

**README.md** 中添加：

```markdown
## 系统要求

### 必要依赖

本插件需要安装 LibreOffice 才能进行文档转换：

#### macOS
```bash
brew install --cask libreoffice
```

或从官网下载：https://www.libreoffice.org/download/

#### Windows
从官网下载：https://www.libreoffice.org/download/

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get install libreoffice

# CentOS/RHEL
sudo yum install libreoffice

# Fedora
sudo dnf install libreoffice
```

### 验证安装

```bash
# macOS
ls -la /Applications/LibreOffice.app/Contents/MacOS/soffice

# Linux
which soffice

# Windows
# 检查 C:\Program Files\LibreOffice\program\soffice.exe
```
```

#### 2. 在插件中添加检测和提示

创建依赖检测服务：

```typescript
// src/services/dependencyChecker.ts
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export class DependencyChecker {
  private static readonly LIBREOFFICE_PATHS = [
    // macOS
    '/Applications/LibreOffice.app/Contents/MacOS/soffice',
    '/usr/local/bin/soffice',
    '/opt/libreoffice/program/soffice',
    // Linux
    '/usr/bin/soffice',
    '/usr/bin/libreoffice',
    '/snap/bin/libreoffice',
    // Windows
    'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
    'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
  ];

  public static async checkLibreOffice(): Promise<boolean> {
    const configuredPath = vscode.workspace
      .getConfiguration('wpsEditor')
      .get('libreOfficePath', '');

    if (configuredPath && fs.existsSync(configuredPath)) {
      return true;
    }

    for (const librePath of this.LIBREOFFICE_PATHS) {
      if (fs.existsSync(librePath)) {
        return true;
      }
    }

    return false;
  }

  public static async showInstallNotification(): Promise<void> {
    const action = await vscode.window.showWarningMessage(
      '未检测到 LibreOffice，文档转换功能将不可用。',
      '查看安装指南',
      '稍后提醒'
    );

    if (action === '查看安装指南') {
      vscode.env.openExternal(
        vscode.Uri.parse(
          'https://github.com/wps-editor/wps-editor#系统要求'
        )
      );
    }
  }
}
```

#### 3. 在激活时检测

```typescript
// src/extension.ts
import { DependencyChecker } from './services/dependencyChecker';

export async function activate(context: vscode.ExtensionContext) {
  // ... 其他代码

  // 检查 LibreOffice
  const hasLibreOffice = await DependencyChecker.checkLibreOffice();
  if (!hasLibreOffice) {
    DependencyChecker.showInstallNotification();
  }
}
```

### 方案二：捆绑安装脚本（可选）

**优点**：
- ✅ 用户体验更好
- ✅ 一键安装依赖

**缺点**：
- ⚠️ 增加插件复杂度
- ⚠️ 需要处理不同平台

**实施**：

创建安装脚本：

```bash
#!/bin/bash
# scripts/install-libreoffice.sh

echo "正在安装 LibreOffice..."

case "$(uname -s)" in
  Darwin)
    echo "macOS  detected"
    if command -v brew &> /dev/null; then
      brew install --cask libreoffice
    else
      echo "请先安装 Homebrew: https://brew.sh"
      exit 1
    fi
    ;;
  Linux)
    echo "Linux detected"
    if command -v apt-get &> /dev/null; then
      sudo apt-get update
      sudo apt-get install -y libreoffice
    elif command -v yum &> /dev/null; then
      sudo yum install -y libreoffice
    else
      echo "不支持的 Linux 发行版，请手动安装"
      exit 1
    fi
    ;;
  *)
    echo "不支持的操作系统"
    echo "请访问：https://www.libreoffice.org/download/"
    exit 1
    ;;
esac

echo "安装完成！"
```

在 package.json 中添加命令：

```json
{
  "scripts": {
    "install-deps": "node scripts/install-deps.js"
  }
}
```

### 方案三：提供降级模式（推荐作为补充）

对于没有安装 LibreOffice 的用户，提供有限的预览功能：

```typescript
// 使用纯 JavaScript 库进行基本格式读取
import { parseDocx } from 'some-docx-parser';

// 如果没有 LibreOffice，使用降级模式
if (!hasLibreOffice) {
  // 使用简单的解析器
  const content = await parseDocx(filePath);
  // 显示纯文本内容
}
```

## 最佳实践建议

### 1. 多层检测策略

```typescript
// 1. 启动时检测
await DependencyChecker.checkLibreOffice();

// 2. 转换前检测
async convertDocument() {
  if (!await DependencyChecker.checkLibreOffice()) {
    showInstallGuide();
    return;
  }
  // 执行转换
}

// 3. 错误处理
try {
  await convertDocument();
} catch (error) {
  if (error.message.includes('soffice')) {
    showLibreOfficeError();
  }
}
```

### 2. 友好的错误提示

```typescript
async function showLibreOfficeError() {
  const action = await vscode.window.showErrorMessage(
    '文档转换失败：未找到 LibreOffice',
    {
      detail: '请安装 LibreOffice 后重试',
      modal: true
    },
    '查看安装指南',
    '配置路径'
  );

  if (action === '查看安装指南') {
    // 打开安装指南
  } else if (action === '配置路径') {
    // 打开设置
  }
}
```

### 3. 提供多种安装方式

在文档中提供：

```markdown
## 安装 LibreOffice

### 方式一：使用包管理器（推荐）

**macOS (Homebrew)**
```bash
brew install --cask libreoffice
```

**Ubuntu/Debian**
```bash
sudo apt-get install libreoffice
```

**Windows (Chocolatey)**
```bash
choco install libreoffice
```

### 方式二：官网下载

访问：https://www.libreoffice.org/download/

### 方式三：使用插件安装脚本

```bash
# 在项目目录运行
npm run install-deps
```
```

### 4. 配置自定义路径

在 package.json 中：

```json
{
  "configuration": {
    "properties": {
      "wpsEditor.libreOfficePath": {
        "type": "string",
        "default": "",
        "description": "LibreOffice 可执行文件的自定义路径（留空自动检测）"
      }
    }
  }
}
```

## 发布时的处理

### 1. package.json 声明

```json
{
  "extensionDependencies": [],
  "externalDependencies": [
    "libreoffice"
  ],
  "qna": "https://github.com/wps-editor/wps-editor/issues",
  "bugs": {
    "url": "https://github.com/wps-editor/wps-editor/issues",
    "email": "support@wps-editor.com"
  }
}
```

### 2. Marketplace 说明

在扩展描述中明确标注：

```markdown
## ⚠️ 重要提示

本插件需要安装 **LibreOffice** 才能进行文档转换。

- macOS: `brew install --cask libreoffice`
- Windows: 从 https://www.libreoffice.org/download/ 下载
- Linux: `sudo apt-get install libreoffice`

安装后重启 VSCode 即可使用。
```

### 3. 首次安装引导

创建欢迎页面：

```typescript
vscode.commands.registerCommand('wpsEditor.welcome', async () => {
  const panel = vscode.window.createWebviewPanel(
    'welcome',
    'WPS Editor 欢迎',
    vscode.ViewColumn.One,
    {}
  );

  panel.webview.html = `
    <h1>欢迎使用 WPS Editor!</h1>
    <h2>安装指南</h2>
    <h3>macOS</h3>
    <pre>brew install --cask libreoffice</pre>
    
    <h3>Windows</h3>
    <p>从 <a href="https://www.libreoffice.org/download/">官网</a> 下载</p>
    
    <h3>Linux</h3>
    <pre>sudo apt-get install libreoffice</pre>
  `;
});
```

## 总结

### 推荐方案组合

1. **明确文档说明** ✅
2. **自动检测 + 友好提示** ✅
3. **提供多种安装方式** ✅
4. **支持自定义路径** ✅
5. **可选：安装脚本** ⚠️

### 实施优先级

#### 高优先级（必须）
- ✅ README 中明确说明依赖
- ✅ 实现自动检测
- ✅ 友好的错误提示
- ✅ 支持自定义路径配置

#### 中优先级（推荐）
- ⚠️ 安装指南文档
- ⚠️ 欢迎页面
- ⚠️ 一键安装脚本

#### 低优先级（可选）
- ⚠️ 降级模式
- ⚠️ 自动安装

### 最终建议

**采用方案一（用户自行安装）+ 完善的检测和提示**

理由：
1. 符合 VSCode 扩展最佳实践
2. 保持插件轻量
3. 用户有选择权
4. 维护成本低
5. LibreOffice 是常用软件，很多用户已安装

---

**状态**: 方案已规划完成  
**建议实施**: 方案一（高优先级）  
**预计实施时间**: 1-2 小时
