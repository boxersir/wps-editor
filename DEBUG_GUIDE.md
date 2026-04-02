# 调试指南：编辑和分页功能

## 🔍 问题诊断步骤

### 1. 打开开发者工具

在 VSCode 中打开编辑器后：
1. 按 **F12** 或 **Ctrl+Shift+I** 打开开发者工具
2. 切换到 **Console** 标签
3. 查看控制台输出

### 2. 查看日志输出

#### 预期日志（成功加载）：
```
加载文档：/path/to/document.docx 格式：.docx
转换结果：{ success: true, output: '...', engine: 'javascript' }
```

#### 如果看到错误：
```
加载文档错误：Error: ...
```

### 3. 检查 webview 消息

在开发者工具的 Console 中，输入：
```javascript
// 监听来自扩展的消息
window.addEventListener('message', (event) => {
  console.log('收到消息:', event.data);
});
```

---

## 🐛 常见问题排查

### 问题 1：编辑器显示空白

**可能原因**：
- HTML 转换失败
- 消息未正确发送

**检查步骤**：
1. 查看控制台是否有错误
2. 检查 `loadDocument` 是否被调用
3. 确认转换结果 `result.success === true`

**解决方案**：
```typescript
// 在 wpsEditorProvider.ts 中添加日志
console.log("转换结果:", result);
```

---

### 问题 2：工具栏按钮无响应

**可能原因**：
- 事件监听器未正确绑定
- VSCode API 未正确初始化

**检查步骤**：
1. 在 Console 中输入：
   ```javascript
   console.log('VSCode API:', typeof acquireVsCodeApi);
   ```
2. 检查按钮事件监听器

**解决方案**：
确保 HTML 中的 JavaScript 正确执行：
```javascript
const vscode = acquireVsCodeApi();
```

---

### 问题 3：分页不工作

**可能原因**：
- 分页计算错误
- 滚动事件未触发

**检查步骤**：
1. 在 Console 中查看：
   ```javascript
   console.log('总页数:', totalPages);
   console.log('当前页:', currentPage);
   ```
2. 检查 `calculatePagination()` 是否被调用

**解决方案**：
```javascript
function calculatePagination() {
  const editorHeight = editor.scrollHeight;
  const pageHeight = 800;
  totalPages = Math.ceil(editorHeight / pageHeight) || 1;
  console.log('计算分页:', totalPages);
  updatePageInfo();
}
```

---

### 问题 4：保存功能无效

**可能原因**：
- 消息未发送到扩展
- 转换回原格式失败

**检查步骤**：
1. 点击保存按钮时查看 Console：
   ```javascript
   console.log('发送保存消息');
   ```
2. 检查扩展后台日志

**解决方案**：
```typescript
// 在扩展后台添加日志
webviewPanel.webview.onDidReceiveMessage(async (message) => {
  console.log("收到消息:", message.type);
  switch (message.type) {
    case "save":
      console.log("保存文档...");
      await this.saveDocument(document, message.content, webviewPanel);
      break;
  }
});
```

---

## 🛠️ 手动测试步骤

### 测试 1：基本加载

1. 打开 .docx 文件
2. 右键 → "Open With" → "WPS Editor (Editor)"
3. 按 F12 打开开发者工具
4. 查看 Console

**预期输出**：
```
加载文档：/path/to/file.docx 格式：.docx
转换结果：{ success: true, ... }
```

---

### 测试 2：编辑功能

1. 在编辑器中输入文字
2. 选中文字
3. 点击工具栏的 **B** 按钮

**预期结果**：
- 文字变粗
- Console 无错误

**调试代码**：
```javascript
// 在 Console 中执行
document.getElementById('format-bold').click();
```

---

### 测试 3：分页功能

1. 输入大量文字使内容超过一页
2. 查看分页栏

**预期结果**：
- 显示 "第 1 页 / 共 X 页"
- 分页按钮可以点击

**调试代码**：
```javascript
// 在 Console 中执行
console.log('编辑器高度:', editor.scrollHeight);
console.log('总页数:', totalPages);
```

---

### 测试 4：保存功能

1. 编辑文档
2. 点击 "💾 保存"
3. 查看 Console

**预期输出**：
```
发送保存消息
```

**检查文件**：
- 文件修改时间应该更新
- 文件内容应该包含编辑的内容

---

## 📋 检查清单

### 前端（Webview）
- [ ] HTML 正确加载
- [ ] JavaScript 正确执行
- [ ] 事件监听器正确绑定
- [ ] VSCode API 可用
- [ ] 消息可以发送到扩展

### 后端（扩展）
- [ ] `loadDocument` 被调用
- [ ] 转换成功 (`result.success === true`)
- [ ] 消息正确发送到 webview
- [ ] 保存消息被接收
- [ ] 转换回原格式成功

### 文件格式
- [ ] .docx 文件可以打开
- [ ] .xlsx 文件可以打开
- [ ] 格式识别正确

---

## 🔧 调试技巧

### 1. 添加日志

在关键位置添加 `console.log`：

```typescript
// 在转换前后
console.log("开始转换:", filePath);
const result = await converter.convertToHTML(filePath);
console.log("转换完成:", result);
```

### 2. 使用断点

在 VSCode 中：
1. 打开 `wpsEditorProvider.ts`
2. 在 `loadDocument` 方法左侧点击添加断点
3. 按 F5 启动调试
4. 打开文档，程序会在断点处暂停

### 3. 检查消息传递

```typescript
// 发送消息时
console.log("发送消息到 webview:", {
  type: "html",
  dataLength: result.output?.length,
  engine: result.engine,
});

// 接收消息时
webview.onDidReceiveMessage((message) => {
  console.log("收到 webview 消息:", message);
});
```

### 4. 验证 HTML 内容

```javascript
// 在 webview 的 Console 中
const editor = document.getElementById('editor');
console.log('编辑器内容:', editor.innerHTML);
console.log('编辑器高度:', editor.scrollHeight);
```

---

## 📞 获取帮助

如果问题仍未解决，请提供：

1. **控制台日志**
   ```
   复制完整的控制台输出
   ```

2. **错误消息**
   ```
   完整的错误堆栈
   ```

3. **测试文件**
   - 文件格式
   - 文件大小
   - 是否可以分享

4. **环境信息**
   - VSCode 版本
   - 操作系统
   - 插件版本

---

## 🎯 快速验证脚本

在开发者工具的 Console 中运行：

```javascript
// 1. 检查编辑器是否存在
const editor = document.getElementById('editor');
console.log('编辑器存在:', !!editor);

// 2. 检查工具栏按钮
const saveBtn = document.getElementById('save-btn');
console.log('保存按钮存在:', !!saveBtn);

// 3. 检查 VSCode API
const vscode = acquireVsCodeApi();
console.log('VSCode API 可用:', !!vscode);

// 4. 测试消息发送
if (vscode && saveBtn) {
  console.log('✅ 基本功能正常');
} else {
  console.log('❌ 发现问题');
}

// 5. 检查分页
const pageInfo = document.getElementById('page-info');
console.log('分页信息:', pageInfo?.textContent);
```

---

**开始调试吧！** 🔍

如有问题，请查看日志输出并根据上述步骤排查。
