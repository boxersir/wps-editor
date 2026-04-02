# 更新日志

## [1.0.0] - 2026-04-02

### 新增功能
- ✨ 支持 WPS 文档格式预览 (.wps, .et, .dps)
- ✨ 支持 Microsoft Office 格式 (.doc, .docx, .xls, .xlsx, .ppt, .pptx)
- ✨ PDF 预览功能（基于 PDF.js）
- ✨ 文档编辑功能（富文本编辑器）
- ✨ 格式转换（WPS ↔ PDF, WPS ↔ HTML）
- ✨ 自定义编辑器集成
- ✨ 页面导航和缩放控制
- ✨ 文档保存功能

### 技术特性
- 🔧 基于 LibreOffice 的文档转换引擎
- 🔧 使用 PDF.js 进行 PDF 渲染
- 🔧 VSCode Custom Editor API 集成
- 🔧 TypeScript 实现，类型安全
- 🔧 支持 macOS、Windows、Linux

### 已知问题
- ⚠️ 需要安装 LibreOffice 才能进行文档转换
- ⚠️ 表格编辑功能有限
- ⚠️ 复杂格式可能无法完全保留

### 系统要求
- VSCode >= 1.85.0
- LibreOffice（用于文档转换）
- Node.js >= 16.0.0

---

## 版本说明

### 语义化版本规范
- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

### 发布周期
- 主版本：根据重大功能更新
- 次版本：每月发布
- 修订号：根据 Bug 修复需求
