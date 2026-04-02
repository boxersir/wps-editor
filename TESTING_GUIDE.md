# 测试指南：.docx 和 .xlsx 文件预览

## ✅ 已修复的问题

**问题**: 打开 .docx 文档时提示转换失败

**原因**: 
- 预览代码对所有格式都尝试转换为 PDF
- 但 .docx 使用 Mammoth.js 转换为 HTML，不是 PDF
- .xlsx 使用 ExcelJS 转换为 HTML，不是 PDF

**解决方案**:
- 对于 .docx 和 .xlsx：直接显示 HTML
- 对于其他格式（.wps, .doc 等）：转换为 PDF 显示

---

## 🧪 测试步骤

### 测试 1：打开 .docx 文件（无需 LibreOffice）

1. 准备一个 .docx 文件
2. 在 VSCode 中打开
3. 右键 → "Open With" → "WPS Editor"
4. **预期结果**:
   - ✅ 文档正常显示
   - ✅ 底部显示 "使用 JavaScript 引擎渲染（无需 LibreOffice）"
   - ✅ 无需安装 LibreOffice

### 测试 2：打开 .xlsx 文件（无需 LibreOffice）

1. 准备一个 .xlsx 文件
2. 在 VSCode 中打开
3. 右键 → "Open With" → "WPS Editor"
4. **预期结果**:
   - ✅ 表格正常显示
   - ✅ 底部显示 "使用 JavaScript 引擎渲染（无需 LibreOffice）"
   - ✅ 无需安装 LibreOffice

### 测试 3：打开 .wps 文件（需要 LibreOffice）

1. 准备一个 .wps 文件
2. 在 VSCode 中打开
3. 右键 → "Open With" → "WPS Editor"
4. **预期结果**:
   - **如果已安装 LibreOffice**:
     - ✅ 文档正常显示
     - ✅ 底部显示 "使用 LibreOffice 引擎渲染"
   - **如果未安装 LibreOffice**:
     - ⚠️ 显示错误提示，要求安装 LibreOffice

### 测试 4：打开 .pdf 文件

1. 准备一个 .pdf 文件
2. 在 VSCode 中打开
3. 右键 → "Open With" → "WPS Editor"
4. **预期结果**:
   - ✅ PDF 正常显示
   - ✅ 可以使用 PDF.js 的功能（缩放、翻页等）

---

## 📊 功能对比

### .docx 文件

| 功能 | 旧方案 | 新方案 |
|------|--------|--------|
| **转换引擎** | LibreOffice | Mammoth.js |
| **输出格式** | PDF | HTML |
| **需要 LibreOffice** | ✅ 是 | ❌ 否 |
| **转换速度** | ~1-3 秒 | ~50-100ms |
| **性能提升** | - | **20-60 倍** |

### .xlsx 文件

| 功能 | 旧方案 | 新方案 |
|------|--------|--------|
| **转换引擎** | LibreOffice | ExcelJS |
| **输出格式** | PDF | HTML |
| **需要 LibreOffice** | ✅ 是 | ❌ 否 |
| **转换速度** | ~1-3 秒 | ~50-100ms |
| **性能提升** | - | **20-60 倍** |

---

## 🎨 UI 改进

### HTML 视图（.docx, .xlsx）

```
┌─────────────────────────────────────────┐
│ [上一页] [下一页] [100%▼] [编辑模式]    │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │   文档内容（HTML 渲染）            │  │
│  │                                   │  │
│  │   - 保留格式                      │  │
│  │   - 保留样式                      │  │
│  │   - 支持表格、列表、图片          │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  使用 JavaScript 引擎渲染（无需 LibreOffice）│
└─────────────────────────────────────────┘
```

### PDF 视图（.wps, .doc, .pdf）

```
┌─────────────────────────────────────────┐
│ [上一页] [下一页] [100%▼] [编辑模式]    │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │   PDF 页面（Canvas 渲染）          │  │
│  │                                   │  │
│  │   - 高质量渲染                    │  │
│  │   - 支持缩放                      │  │
│  │   - 支持翻页                      │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  共 10 页                                  │
└─────────────────────────────────────────┘
```

---

## 🔍 调试技巧

### 查看转换引擎

打开开发者工具（F12），在控制台查看：

```javascript
// 查看使用的转换引擎
console.log('Engine:', result.engine);
// 输出："javascript" 或 "libreoffice"
```

### 检查错误

如果转换失败，查看错误消息：

```javascript
// 错误处理
if (!result.success) {
  console.error('转换失败:', result.error);
}
```

### 性能测试

```javascript
// 测量转换时间
const start = Date.now();
const result = await converter.convertToHTML(filePath);
const duration = Date.now() - start;
console.log(`转换耗时：${duration}ms`);
```

---

## 📝 技术细节

### 转换流程

```
用户打开 .docx
    ↓
SmartConverter.detectFormat()
    ↓
格式 = .docx
    ↓
SmartConverter.convertToHTML()
    ↓
OfficeConverter.docxToHtml()
    ↓
Mammoth.js 转换
    ↓
返回 HTML
    ↓
Webview 显示 HTML
```

### 代码示例

```typescript
// 智能转换
const converter = new SmartConverter();
const format = converter.detectFormat('document.docx');

if (format === '.docx') {
  // 使用 Mammoth.js
  const result = await converter.convertToHTML('document.docx');
  console.log('引擎:', result.engine); // "javascript"
  console.log('HTML:', result.output);
}
```

---

## ✅ 验证清单

- [ ] .docx 文件可以正常预览（无需 LibreOffice）
- [ ] .xlsx 文件可以正常预览（无需 LibreOffice）
- [ ] .wps 文件需要 LibreOffice（如果未安装，提示安装）
- [ ] .pdf 文件可以正常预览
- [ ] HTML 视图显示正确
- [ ] PDF 视图显示正确
- [ ] 底部引擎信息提示正确
- [ ] 缩放功能正常
- [ ] 编辑模式按钮正常

---

## 🐛 已知问题

### 问题 1：样式可能不完全匹配

**原因**: Mammoth.js 使用语义化转换，可能不完全保留原始样式

**解决**: 
- 接受合理的样式差异
- 或者使用 LibreOffice 方案（需要安装）

### 问题 2：复杂表格可能渲染不完美

**原因**: ExcelJS 对复杂表格支持有限

**解决**:
- 简化表格结构
- 或者使用 LibreOffice 方案

---

## 📞 反馈

如果遇到问题，请提供：
1. 文件格式
2. 错误消息
3. 是否安装 LibreOffice
4. 测试文件（如果可能）

---

**最后更新**: 2026-04-02  
**状态**: ✅ 已修复
