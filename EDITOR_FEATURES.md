# 编辑和分页功能实现指南

## ✅ 已实现功能

### 时间
2026-04-02 - 完整编辑器和分页功能实现完成

---

## 🎨 功能特性

### 1. 富文本编辑器

#### 格式化工具栏
- **文本格式**
  - ✅ 加粗 (Ctrl+B)
  - ✅ 斜体 (Ctrl+I)
  - ✅ 下划线 (Ctrl+U)
  - ✅ 删除线

- **标题样式**
  - ✅ 标题 1 (H1)
  - ✅ 标题 2 (H2)
  - ✅ 标题 3 (H3)
  - ✅ 正文 (P)

- **字体大小**
  - ✅ 小、正常、大、超大

- **对齐方式**
  - ✅ 左对齐
  - ✅ 居中
  - ✅ 右对齐

- **列表**
  - ✅ 无序列表
  - ✅ 有序列表

- **缩进**
  - ✅ 增加缩进
  - ✅ 减少缩进

- **插入元素**
  - ✅ 链接
  - ✅ 图片
  - ✅ 分页符

#### 快捷键
- ✅ **Ctrl+S** - 保存
- ✅ **Ctrl+B** - 加粗
- ✅ **Ctrl+I** - 斜体
- ✅ **Ctrl+U** - 下划线

---

### 2. 分页功能

#### 分页控制
- ✅ 第一页 (⏮️)
- ✅ 上一页 (◀️)
- ✅ 下一页 (▶️)
- ✅ 最后一页 (⏭️)
- ✅ 页码显示（第 X 页 / 共 Y 页）

#### 分页逻辑
```javascript
// 基于内容高度计算分页
const editorHeight = editor.scrollHeight;
const pageHeight = 800; // 每页大约 800px
totalPages = Math.ceil(editorHeight / pageHeight) || 1;
```

#### 自动分页
- ✅ 滚动时自动更新当前页码
- ✅ 点击分页按钮自动滚动到对应位置
- ✅ 插入分页符手动分页

---

### 3. 字数统计

- ✅ 实时统计字数
- ✅ 显示在工具栏右下角
- ✅ 编辑时自动更新

---

### 4. 保存功能

#### 保存流程
```
用户点击保存
    ↓
获取编辑器 HTML 内容
    ↓
发送到扩展后台
    ↓
转换为原格式（DOCX/XLSX 等）
    ↓
写入文件
    ↓
显示成功提示
```

#### 转换引擎
- **Office 格式** (.docx, .xlsx)
  - 使用 JavaScript 库
  - 无需 LibreOffice
  
- **WPS 格式** (.wps, .et, .dps)
  - 使用 LibreOffice
  - 需要安装 LibreOffice

---

## 🎨 UI 布局

```
┌─────────────────────────────────────────────────────────────┐
│ 工具栏                                                       │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 💾保存 👁️预览 │ B I U S │ 格式 ▼ 大小 ▼ │ ⬅️ ⬛ ➡️ │   │
│ │ • 列表 1.列表 │ → ← │ 🔗链接 🖼️图片 │ 📄分页符 │ 字数:0│   │
│ └───────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│ 分页栏                                                       │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ ⏮️ ◀️ 第 1 页 / 共 1 页 ▶️ ⏭️          JavaScript 引擎  │   │
│ └───────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│ 编辑器区域                                                   │
│ ┌───────────────────────────────────────────────────────┐   │
│ │                                                       │   │
│ │   文档内容（可编辑）                                   │   │
│ │                                                       │   │
│ │   - 支持富文本格式                                     │   │
│ │   - 支持表格、图片、列表                               │   │
│ │   - 实时字数统计                                       │   │
│ │                                                       │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 技术实现

### 编辑器架构

```typescript
// 富文本编辑器核心
function execCommand(command, value = null) {
  document.execCommand(command, false, value);
  editor.focus();
  updateWordCount();
}

// 分页计算
function calculatePagination() {
  const editorHeight = editor.scrollHeight;
  const pageHeight = 800;
  totalPages = Math.ceil(editorHeight / pageHeight) || 1;
  updatePageInfo();
}

// 字数统计
function updateWordCount() {
  const text = editor.innerText || '';
  const count = text.length;
  document.getElementById('word-count').textContent = `字数：${count}`;
}
```

### 保存流程

```typescript
// 1. 前端发送保存请求
document.getElementById('save-btn').addEventListener('click', () => {
  const content = editor.innerHTML;
  vscode.postMessage({ type: 'save', content: content });
});

// 2. 后端接收并处理
webviewPanel.webview.onDidReceiveMessage(async (message) => {
  switch (message.type) {
    case "save":
      await this.saveDocument(document, message.content, webviewPanel);
      break;
  }
});

// 3. 转换为原格式
const result = await this.converter.convertFromHTML(
  tempHtmlPath,
  filePath,
  format,
);
```

---

## 🔍 使用指南

### 打开编辑器

1. **打开 .docx 文件**
2. **右键** → "Open With" → "WPS Editor (Editor)"
3. **或** 使用命令面板：`Ctrl+Shift+P` → "WPS Editor: Open Editor"

### 编辑文档

#### 格式化文本
1. 选中文本
2. 点击工具栏按钮（B、I、U 等）
3. 或使用快捷键（Ctrl+B、Ctrl+I、Ctrl+U）

#### 插入元素
- **链接**: 点击 "🔗 链接"，输入 URL
- **图片**: 点击 "🖼️ 图片"，输入图片 URL
- **分页符**: 点击 "📄 分页符"

#### 使用列表
1. 选中段落
2. 点击 "• 列表"（无序）或 "1. 列表"（有序）

### 分页浏览

#### 使用分页按钮
- **⏮️** - 跳转到第一页
- **◀️** - 上一页
- **▶️** - 下一页
- **⏭️** - 跳转到最后一页

#### 滚动浏览
- 滚动编辑器自动更新页码
- 页码显示当前所在页

### 保存文档

#### 手动保存
- 点击 "💾 保存" 按钮
- 或按 **Ctrl+S**

#### 保存提示
- ✅ 成功：显示 "文档已保存" 通知
- ❌ 失败：显示错误消息

---

## 📝 样式说明

### 编辑器内容样式

```css
/* 标题样式 */
#editor h1 { font-size: 2em; border-bottom: 1px solid #eaecef; }
#editor h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; }
#editor h3 { font-size: 1.25em; }

/* 段落 */
#editor p { margin-bottom: 1em; }

/* 列表 */
#editor ul, #editor ol { margin-bottom: 1em; padding-left: 2em; }

/* 表格 */
#editor table { border-collapse: collapse; width: 100%; }
#editor table th, #editor table td { border: 1px solid #dfe2e5; padding: 8px 12px; }

/* 引用 */
#editor blockquote {
  border-left: 4px solid #dfe2e5;
  padding-left: 1em;
  color: #6a737d;
  font-style: italic;
}

/* 代码 */
#editor code {
  background-color: rgba(27,31,35,0.05);
  padding: 0.2em 0.4em;
  font-family: monospace;
}

/* 分页符 */
.page-break {
  border-top: 2px dashed #ccc;
  margin: 20px 0;
}
.page-break::after {
  content: '分页符';
  position: absolute;
  top: -10px;
  left: 50%;
  background: #f0f0f0;
  padding: 0 10px;
  font-size: 12px;
  color: #999;
}
```

---

## 🐛 已知限制

### 1. 分页精度
- **问题**: 分页基于估算（800px/页）
- **影响**: 分页可能不完全准确
- **解决**: 手动插入分页符调整

### 2. 图片支持
- **问题**: 图片仅支持 URL
- **影响**: 无法直接插入本地图片
- **解决**: 上传图片到图床或使用 Base64

### 3. 格式兼容性
- **问题**: HTML 转回 DOCX 可能丢失部分格式
- **影响**: 复杂格式可能不完美
- **解决**: 使用 LibreOffice 引擎（需要安装）

---

## 🚀 下一步优化

### 短期（1-2 周）
- [ ] 改进分页算法（更精确）
- [ ] 支持本地图片上传
- [ ] 添加撤销/重做功能
- [ ] 优化样式映射

### 中期（1 个月）
- [ ] 添加查找/替换功能
- [ ] 支持文档大纲
- [ ] 添加批注功能
- [ ] 支持修订模式

### 长期（2-3 个月）
- [ ] 协同编辑
- [ ] 版本历史
- [ ] 导出多种格式
- [ ] 模板支持

---

## 📋 测试清单

### 基础功能
- [ ] 打开 .docx 文件正常显示
- [ ] 打开 .xlsx 文件正常显示
- [ ] 编辑器可以正常编辑
- [ ] 格式化功能正常
- [ ] 保存功能正常

### 分页功能
- [ ] 分页按钮正常工作
- [ ] 页码显示正确
- [ ] 滚动时页码更新
- [ ] 分页符插入正常

### 高级功能
- [ ] 插入链接正常
- [ ] 插入图片正常
- [ ] 列表功能正常
- [ ] 表格显示正常
- [ ] 字数统计准确

### 兼容性
- [ ] .docx 文件编辑后保存正常
- [ ] .xlsx 文件编辑后保存正常
- [ ] .wps 文件（需要 LibreOffice）正常
- [ ] 快捷键正常工作

---

## 💡 技巧提示

### 高效编辑
1. **使用快捷键**: Ctrl+B/I/U 快速格式化
2. **快速保存**: Ctrl+S 随时保存
3. **分页浏览**: 使用分页按钮快速导航

### 格式建议
1. **使用标题样式**: 便于生成大纲
2. **合理使用分页符**: 控制文档结构
3. **定期保存**: 避免数据丢失

### 性能优化
1. **大文档**: 分批编辑，避免一次性加载过多内容
2. **图片**: 使用适当大小，避免过大图片
3. **表格**: 简化复杂表格结构

---

## 📞 问题反馈

遇到问题请提供：
1. 文件格式
2. 错误消息
3. 操作步骤
4. 截图（如果可能）

---

**实现状态**: ✅ 完成  
**编译状态**: ✅ 通过  
**可测试状态**: ✅ 就绪  

**编辑和分页功能实现成功！** 🎉
