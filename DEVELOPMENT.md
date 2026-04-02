# WPS Editor 开发指南

## 项目结构

```
wps-editor/
├── src/
│   ├── extension.ts              # 主入口文件
│   ├── providers/
│   │   ├── wpsPreviewProvider.ts # PDF 预览提供者
│   │   └── wpsEditorProvider.ts  # 编辑器提供者
│   └── services/
│       └── documentConverter.ts  # 文档转换服务
├── out/                          # 编译输出目录
├── .vscode/
│   ├── launch.json               # 调试配置
│   └── tasks.json                # 任务配置
├── package.json                  # 扩展配置
└── tsconfig.json                 # TypeScript 配置
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 安装 LibreOffice（必需）

**macOS:**
```bash
brew install --cask libreoffice
```

**验证安装:**
```bash
/Applications/LibreOffice.app/Contents/MacOS/soffice --version
```

### 3. 编译项目

```bash
npm run compile
```

### 4. 运行和调试

- 按 `F5` 启动扩展开发主机
- 在新窗口中打开 WPS 文档测试

## 核心功能说明

### 文档转换流程

```
WPS 文档 (.wps/.et/.dps)
    ↓
LibreOffice 转换
    ↓
PDF (预览) 或 HTML (编辑)
    ↓
Webview 渲染
```

### 预览模式

1. **PDF.js 渲染**: 使用 Mozilla 的 PDF.js 库在 Webview 中渲染 PDF
2. **页面导航**: 支持翻页、缩放
3. **工具栏**: 上一页/下一页、缩放级别、切换到编辑模式

### 编辑模式

1. **HTML 编辑**: 使用 `contenteditable` 实现富文本编辑
2. **格式工具**: 加粗、斜体、下划线、标题
3. **保存**: HTML → LibreOffice → 原格式

## 添加新功能

### 添加新的文档格式

1. 在 `documentConverter.ts` 中添加格式枚举：
```typescript
export enum DocumentFormat {
  // ... 现有格式
  NEW_FORMAT = '.newext'
}
```

2. 在 `package.json` 中添加文件关联：
```json
"customEditors": [
  {
    "selector": [
      {
        "filenamePattern": "*.newext"
      }
    ]
  }
]
```

### 添加新的编辑功能

1. 在 `wpsEditorProvider.ts` 的 HTML 中添加工具栏按钮
2. 在 JavaScript 部分添加事件处理
3. 使用 `document.execCommand` 或自定义逻辑

### 优化 PDF 渲染

可以集成更高级的 PDF 查看器功能：
- 缩略图预览
- 搜索文本
- 书签导航
- 注释支持

## 常见问题

### Q: LibreOffice 路径配置

如果在 macOS 上找不到 LibreOffice：
```json
{
  "wpsEditor.libreOfficePath": "/Applications/LibreOffice.app/Contents/MacOS/soffice"
}
```

### Q: 转换失败

检查 LibreOffice 是否正确安装：
```bash
# macOS
ls -la /Applications/LibreOffice.app/Contents/MacOS/soffice

# Linux
which soffice

# Windows
# 检查 C:\Program Files\LibreOffice\program\soffice.exe
```

### Q: PDF 显示空白

确保 PDF.js worker 正确加载，检查 CDN 连接或使用本地文件。

## 性能优化建议

1. **懒加载**: 只在需要时加载 PDF 页面
2. **虚拟滚动**: 大文档使用虚拟滚动
3. **缓存**: 缓存转换后的 PDF
4. **Web Worker**: 将转换操作移到后台线程

## 测试

### 手动测试

1. 创建测试文档：
   - .wps 格式文档
   - .docx 格式文档
   - 包含复杂格式的文档

2. 测试场景：
   - 打开文档预览
   - 切换到编辑模式
   - 修改并保存
   - 转换为 PDF

### 自动化测试（待实现）

```bash
npm run test
```

## 打包发布

```bash
# 安装 vsce
npm install -g @vscode/vsce

# 打包
vsce package

# 发布（需要发布令牌）
vsce publish
```

## 下一步开发计划

1. ✗ 表格编辑支持
2. ✗ 演示文稿支持
3. ✗ 实时预览
4. ✗ 文档比较功能
5. ✗ 批注和修订模式

## 资源链接

- [VSCode 扩展 API 文档](https://code.visualstudio.com/api)
- [LibreOffice 开发者指南](https://wiki.documentfoundation.org/Development)
- [PDF.js 文档](https://mozilla.github.io/pdf.js/)
- [Custom Editor API](https://code.visualstudio.com/api/extension-guides/custom-editors)
