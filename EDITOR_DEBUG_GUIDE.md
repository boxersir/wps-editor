# 编辑器不能编辑 - 调试指南

## 🎯 问题：.docx 文档不能编辑

### 🔍 第一步：检查 Console 日志

按 **F12** 打开开发者工具，查看 Console 输出。

#### 应该看到的日志：

```
编辑器初始化成功
所有事件监听器绑定完成
loadHTML 被调用
HTML 内容长度：1234
编辑器元素：<div id="editor" contenteditable="true">...</div>
编辑器 contenteditable：true
设置编辑器可编辑
contentEditable：true
HTML 内容已设置
编辑器 innerHTML 长度：1234
编辑器已聚焦
```

#### 如果看到错误：

```
编辑器元素未找到
```
→ 编辑器元素不存在，DOM 加载有问题

```
编辑器元素不存在，无法加载内容
```
→ 编辑器元素在 loadHTML 时不存在

---

### 🔍 第二步：检查编辑器元素

在 Console 中运行以下命令：

```javascript
// 1. 检查编辑器是否存在
const editor = document.getElementById('editor');
console.log('编辑器存在:', !!editor);

// 2. 检查 contenteditable 属性
console.log('contentEditable:', editor?.contentEditable);
console.log('isContentEditable:', editor?.isContentEditable);

// 3. 检查是否有 readonly 属性
console.log('readonly:', editor?.getAttribute('readonly'));

// 4. 检查样式
const computedStyle = window.getComputedStyle(editor);
console.log('pointer-events:', computedStyle.pointerEvents);
console.log('user-select:', computedStyle.userSelect);
console.log('display:', computedStyle.display);
console.log('visibility:', computedStyle.visibility);
console.log('opacity:', computedStyle.opacity);

// 5. 检查是否被其他元素覆盖
const rect = editor.getBoundingClientRect();
console.log('编辑器位置:', rect);
console.log('编辑器宽度:', rect.width);
console.log('编辑器高度:', rect.height);
```

#### 预期结果：

```
编辑器存在：true
contentEditable：true
isContentEditable：true
readonly：null
pointer-events：auto
user-select：text
display：block
visibility：visible
opacity：1
编辑器位置：DOMRect {x: ..., y: ..., width: ..., height: ...}
编辑器宽度：> 0
编辑器高度：> 0
```

---

### 🔍 第三步：手动设置可编辑

如果上面的检查显示有问题，尝试手动设置：

```javascript
// 获取编辑器
const editor = document.getElementById('editor');

// 设置可编辑
editor.contentEditable = 'true';
editor.removeAttribute('readonly');
editor.style.pointerEvents = 'auto';
editor.style.userSelect = 'text';
editor.style.cursor = 'text';

// 聚焦
editor.focus();

// 验证
console.log('contentEditable:', editor.contentEditable);
console.log('isContentEditable:', editor.isContentEditable);
```

然后尝试点击编辑器并输入文字。

---

### 🔍 第四步：检查是否有覆盖层

有时候其他元素会覆盖编辑器，导致无法点击。

```javascript
// 检查编辑器上方的元素
const editor = document.getElementById('editor');
const rect = editor.getBoundingClientRect();

// 检查鼠标位置的元素
const centerX = rect.left + rect.width / 2;
const centerY = rect.top + rect.height / 2;
const elementAtPoint = document.elementFromPoint(centerX, centerY);

console.log('编辑器中心位置的元素:', elementAtPoint);
console.log('是否是编辑器本身:', elementAtPoint === editor);

// 如果不是编辑器，检查 z-index
if (elementAtPoint !== editor) {
  console.log('编辑器被以下元素覆盖:', elementAtPoint);
  console.log('覆盖元素的 z-index:', window.getComputedStyle(elementAtPoint).zIndex);
  console.log('编辑器的 z-index:', window.getComputedStyle(editor).zIndex);
}
```

#### 解决覆盖问题：

如果有元素覆盖编辑器，可以尝试：

```javascript
// 提高编辑器的 z-index
editor.style.zIndex = '9999';
```

---

### 🔍 第五步：检查事件监听器

检查编辑器是否有事件监听器阻止输入：

```javascript
const editor = document.getElementById('editor');

// 获取所有事件监听器（需要 Chrome DevTools）
// 在 Elements 面板中，右键编辑器元素 → Break on → Attributes modifications

// 或者检查是否有全局事件阻止
document.addEventListener('click', (e) => {
  console.log('点击事件:', e.target);
}, true);

document.addEventListener('keydown', (e) => {
  console.log('按键事件:', e.target, e.key);
}, true);
```

然后尝试点击编辑器或输入文字，查看是否有事件被阻止。

---

### 🔍 第六步：检查 VSCode 扩展设置

有时候 VSCode 的设置会影响编辑器。

检查 `.vscode/settings.json`：

```json
{
  "wpsEditor.enableEditing": true
}
```

---

### 🔍 第七步：检查文件权限

确保文件有读写权限：

```javascript
// 在扩展中检查文件权限
const fs = require('fs');
const path = '/path/to/your/file.docx';

try {
  fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK);
  console.log('文件有读写权限');
} catch (err) {
  console.error('文件没有读写权限:', err);
}
```

---

## 🛠️ 常见问题和解决方案

### 问题 1：编辑器显示内容但无法输入

**症状**：可以看到文档内容，但点击没有反应，无法输入。

**可能原因**：
- `contenteditable` 属性未正确设置
- 有其他元素覆盖编辑器
- 事件监听器阻止了输入

**解决方案**：
```javascript
const editor = document.getElementById('editor');
editor.contentEditable = 'true';
editor.focus();
```

### 问题 2：编辑器完全空白

**症状**：编辑器区域是空白的，没有内容。

**可能原因**：
- HTML 内容没有正确加载
- 编辑器元素不存在
- 样式问题导致内容不可见

**解决方案**：
```javascript
// 检查编辑器内容
const editor = document.getElementById('editor');
console.log('编辑器 HTML:', editor.innerHTML);

// 如果为空，手动设置内容
if (!editor.innerHTML.trim()) {
  editor.innerHTML = '<p>测试内容</p>';
}
```

### 问题 3：编辑器有内容但样式混乱

**症状**：内容显示但格式不对，或者背景色不对。

**可能原因**：
- CSS 样式冲突
- VSCode 主题变量未正确应用

**解决方案**：
检查 CSS 样式，确保使用正确的 VSCode 变量。

---

## 📊 完整诊断脚本

复制以下代码到 Console 中运行，它会输出完整的诊断信息：

```javascript
(function diagnoseEditor() {
  console.log('=== 编辑器诊断开始 ===');
  
  // 1. 检查编辑器元素
  const editor = document.getElementById('editor');
  console.log('1. 编辑器元素:', editor);
  
  if (!editor) {
    console.error('❌ 编辑器元素不存在！');
    return;
  }
  
  // 2. 检查可编辑属性
  console.log('2. 可编辑属性:');
  console.log('  contentEditable:', editor.contentEditable);
  console.log('  isContentEditable:', editor.isContentEditable);
  console.log('  readonly:', editor.getAttribute('readonly'));
  
  // 3. 检查样式
  const computedStyle = window.getComputedStyle(editor);
  console.log('3. 样式:');
  console.log('  pointer-events:', computedStyle.pointerEvents);
  console.log('  user-select:', computedStyle.userSelect);
  console.log('  display:', computedStyle.display);
  console.log('  visibility:', computedStyle.visibility);
  console.log('  opacity:', computedStyle.opacity);
  console.log('  cursor:', computedStyle.cursor);
  
  // 4. 检查位置和大小
  const rect = editor.getBoundingClientRect();
  console.log('4. 位置和大小:');
  console.log('  x:', rect.x);
  console.log('  y:', rect.y);
  console.log('  width:', rect.width);
  console.log('  height:', rect.height);
  
  // 5. 检查内容
  console.log('5. 内容:');
  console.log('  innerHTML 长度:', editor.innerHTML.length);
  console.log('  innerText 长度:', editor.innerText?.length || 0);
  console.log('  前 100 字符:', editor.innerText?.substring(0, 100) || '(无内容)');
  
  // 6. 检查覆盖层
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const elementAtPoint = document.elementFromPoint(centerX, centerY);
  console.log('6. 覆盖层:');
  console.log('  中心位置元素:', elementAtPoint);
  console.log('  是否被覆盖:', elementAtPoint !== editor);
  
  if (elementAtPoint !== editor) {
    console.warn('⚠️ 编辑器被以下元素覆盖:', elementAtPoint);
  }
  
  // 7. 检查焦点
  console.log('7. 焦点:');
  console.log('  document.activeElement:', document.activeElement);
  console.log('  是否聚焦:', document.activeElement === editor);
  
  // 8. 尝试修复
  console.log('8. 尝试修复...');
  editor.contentEditable = 'true';
  editor.removeAttribute('readonly');
  editor.style.pointerEvents = 'auto';
  editor.style.userSelect = 'text';
  editor.style.cursor = 'text';
  editor.focus();
  
  console.log('✅ 修复完成，现在 contentEditable:', editor.contentEditable);
  console.log('=== 编辑器诊断结束 ===');
  
  // 返回诊断结果
  return {
    editorExists: !!editor,
    isEditable: editor.isContentEditable,
    isCovered: elementAtPoint !== editor,
    hasContent: editor.innerHTML.length > 0,
    isFocused: document.activeElement === editor
  };
})();
```

---

## 🎯 测试步骤

### 1. 重新加载
按 **F5** 重新启动调试

### 2. 打开编辑器
右键 .docx 文件 → "Open With..." → "WPS Editor (Editor)"

### 3. 运行诊断
按 **F12** 打开开发者工具，粘贴上面的诊断脚本到 Console 中运行

### 4. 查看结果
根据诊断结果，采取相应的解决方案

### 5. 测试编辑
尝试点击编辑器并输入文字

---

## 📝 请提供以下信息

如果问题仍然存在，请提供：

1. **Console 完整日志**
   - 包括所有错误和警告

2. **诊断脚本输出**
   - 运行上面的诊断脚本，复制输出

3. **截图**
   - 编辑器界面截图
   - 开发者工具 Console 截图

4. **测试文件信息**
   - 文件路径
   - 文件大小
   - 文件类型

---

**现在请运行诊断脚本，并将结果告诉我！** 🔍
