# 预览模式 HTML 显示修复

## 🐛 问题原因

**症状**：
- 转换成功（`success: true`）
- HTML 内容已生成
- 但预览界面仍然空白

**原因**：
PDF.js 库加载可能失败或较慢，导致整个脚本初始化受阻。

---

## ✅ 修复内容

### 1. 安全加载 PDF.js

```javascript
let pdfjsLib = null;

const script = document.createElement('script');
script.src = '${pdfJsCdn}';
script.onload = () => {
  pdfjsLib = window.pdfjsLib;
  if (pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfJsWorkerSrc;
  }
  initPDFViewer();
};
script.onerror = () => {
  console.error('PDF.js 加载失败');
  // PDF.js 加载失败，但仍然可以显示 HTML
  initPDFViewer();
};
```

**改进**：
- ✅ PDF.js 加载失败不影响 HTML 显示
- ✅ 初始化总是执行
- ✅ 错误被捕获并记录

### 2. HTML 模式禁用 PDF 按钮

```javascript
function showHTMLViewer(htmlContent, engine) {
  // 显示 HTML 容器
  document.getElementById('html-container').style.display = 'block';
  document.getElementById('pdf-container').style.display = 'none';
  
  // 禁用 PDF 导航按钮
  document.getElementById('prev-page').disabled = true;
  document.getElementById('next-page').disabled = true;
  document.getElementById('zoom-level').disabled = true;
  
  // 设置内容
  htmlContentDiv.innerHTML = htmlContent;
  
  // 显示引擎信息
  if (engine === 'javascript') {
    engineInfo.textContent = '使用 JavaScript 引擎渲染（无需 LibreOffice）';
  } else {
    engineInfo.textContent = '使用 LibreOffice 引擎渲染';
  }
}
```

**改进**：
- ✅ HTML 模式下禁用无关按钮
- ✅ 清晰显示使用的引擎
- ✅ 避免用户困惑

---

## 🎯 测试步骤

### 1. 重新编译
```bash
npm run compile
```

### 2. 启动调试
按 **F5** 启动调试

### 3. 打开 .docx 文件
1. 右键文件 → "Open With" → "WPS Editor (Preview)"
2. 或右键文件 → "Open With" → "WPS Editor (Editor)"

### 4. 验证显示

**预览模式应该显示**：
```
┌─────────────────────────────────────────┐
│ [上一页] [下一页] [100%▼] [编辑模式]    │
│ (已禁用) (已禁用) (已禁用)              │
├─────────────────────────────────────────┤
│                                         │
│   一、两个字符串相加                     │
│   别名：大数相加                         │
│   描述：给两个大整数...                  │
│                                         │
│   使用 JavaScript 引擎渲染（无需 LibreOffice）│
└─────────────────────────────────────────┘
```

---

## 📊 验证清单

### 预览模式
- [ ] 文档内容正常显示
- [ ] 上一页/下一页按钮已禁用（灰色）
- [ ] 缩放下拉框已禁用
- [ ] 底部显示 "使用 JavaScript 引擎渲染（无需 LibreOffice）"
- [ ] 编辑模式按钮可以点击

### 编辑器模式
- [ ] 工具栏显示正常
- [ ] 文档内容可编辑
- [ ] 分页栏显示
- [ ] 字数统计正常

---

## 🔍 调试技巧

### 如果仍然空白

#### 1. 检查 Console 日志

按 **F12** 打开开发者工具，查看：

**应该看到**：
```
预览加载文档：/path/to/file.docx 格式：.docx
使用 HTML 转换：.docx
HTML 转换结果：{ success: true, ... }
```

**如果看到错误**：
```
PDF.js 加载失败
```
这是正常的，HTML 仍然应该显示。

#### 2. 检查 HTML 容器

在 Console 中输入：
```javascript
const htmlContainer = document.getElementById('html-container');
const htmlContent = document.getElementById('html-content');

console.log('HTML 容器显示:', htmlContainer?.style.display);
console.log('HTML 内容:', htmlContent?.innerHTML?.substring(0, 100));
```

**预期**：
```
HTML 容器显示：block
HTML 内容：一、两个字符串相加...
```

#### 3. 检查消息接收

在 Console 中输入：
```javascript
window.addEventListener('message', (e) => {
  console.log('收到消息:', e.data);
  if (e.data.type === 'html') {
    console.log('HTML 内容长度:', e.data.data?.length);
  }
});
```

然后重新加载文档。

---

## 🎨 UI 状态对比

### PDF 模式（.wps, .pdf）
```
工具栏：[上一页] [下一页] [100%▼] [编辑模式]
         ↑启用    ↑启用    ↑启用
状态：   可用     可用     可用
容器：   PDF 容器显示，HTML 容器隐藏
```

### HTML 模式（.docx, .xlsx）
```
工具栏：[上一页] [下一页] [100%▼] [编辑模式]
         ↓禁用    ↓禁用    ↓禁用
状态：   灰色    灰色    灰色
容器：   PDF 容器隐藏，HTML 容器显示
底部：   使用 JavaScript 引擎渲染（无需 LibreOffice）
```

---

## 📝 技术细节

### 消息流程

```
扩展后台
    ↓
转换文档 (.docx → HTML)
    ↓
发送消息到 webview:
{
  type: 'html',
  data: '<p>文档内容...</p>',
  engine: 'javascript'
}
    ↓
webview 接收消息
    ↓
判断 type === 'html'
    ↓
调用 showHTMLViewer(data, engine)
    ↓
显示 HTML 容器
设置 innerHTML
显示引擎信息
```

### 样式处理

```css
#html-container {
  background-color: var(--vscode-editor-background);
  min-height: 500px;
  padding: 20px;
}

#html-content {
  background-color: white;
  padding: 40px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  max-width: 1000px;
  margin: 0 auto;
  color: #333;
}
```

---

## ✅ 成功标准

### 必须满足
- ✅ 文档内容显示
- ✅ 白色背景显示内容
- ✅ 底部显示引擎信息
- ✅ 无 JavaScript 错误

### 最好满足
- ✅ PDF 按钮正确禁用
- ✅ 编辑模式按钮可用
- ✅ 样式美观

---

## 🚀 下一步

### 如果预览模式正常了

1. **测试编辑器模式**：
   - 右键 → "Open With" → "WPS Editor (Editor)"
   - 检查是否可以编辑

2. **测试保存功能**：
   - 编辑文档
   - 点击保存
   - 检查文件是否更新

3. **测试其他格式**：
   - .xlsx 文件
   - .wps 文件（需要 LibreOffice）

---

**修复完成！现在应该可以正常预览了！** 🎉

如果还有问题，请提供：
1. Console 完整日志
2. 截图
3. 测试文件类型
