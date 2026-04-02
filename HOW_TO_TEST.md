# 如何测试编辑和分页功能

## 📋 测试步骤

### 第一步：编译项目

```bash
npm run compile
```

✅ 应该显示 "编译成功"

---

### 第二步：启动调试

1. 按 **F5** 键
2. 或点击运行和调试 → "启动调试"
3. 新的 VSCode 窗口会打开

---

### 第三步：打开测试文档

#### 方法 1：使用现有 .docx 文件
1. 在新窗口中打开一个 .docx 文件
2. 右键文件 → "Open With" → "WPS Editor (Editor)"

#### 方法 2：创建测试文档
```bash
# 创建一个简单的测试文档
echo "Hello World" > test.txt
# 然后用 Word 另存为 .docx
```

---

### 第四步：检查控制台日志

按 **F12** 打开开发者工具，查看 Console：

**预期看到**：
```
加载文档：/path/to/file.docx 格式：.docx
转换结果：{ success: true, output: '...', engine: 'javascript' }
```

**如果看到错误**：
```
加载文档错误：...
```
请复制完整的错误消息。

---

### 第五步：验证功能

#### ✅ 编辑器应该显示：

```
┌─────────────────────────────────────────┐
│ 💾保存 👁️预览 │ B I U S │ 格式 ▼ │ ... │
├─────────────────────────────────────────┤
│ ⏮️ ◀️ 第 1 页 / 共 1 页 ▶️ ⏭️            │
├─────────────────────────────────────────┤
│                                         │
│   [可编辑的文档内容]                     │
│                                         │
│   字数：XX                              │
│                                         │
└─────────────────────────────────────────┘
```

#### 测试清单：

- [ ] 工具栏显示正常
- [ ] 文档内容可见
- [ ] 可以输入文字
- [ ] 字数统计更新
- [ ] 分页栏显示

---

## 🔍 如果编辑器是空白的

### 检查点 1：转换是否成功

在 Console 中查看：
```javascript
// 应该看到
转换结果：{ success: true, ... }
```

如果 `success: false`，查看 `error` 字段。

### 检查点 2：消息是否发送

在 Console 中输入：
```javascript
// 监听消息
window.addEventListener('message', (e) => {
  console.log('收到消息:', e.data);
});
```

然后重新加载文档，应该看到：
```
收到消息：{ type: 'html', data: '...', ... }
```

### 检查点 3：HTML 是否正确渲染

在 Console 中输入：
```javascript
const editor = document.getElementById('editor');
console.log('编辑器 HTML:', editor?.innerHTML);
console.log('编辑器存在:', !!editor);
```

---

## 🎯 快速测试脚本

在开发者工具的 Console 中运行：

```javascript
// 快速检查
(function quickTest() {
  const checks = {
    '编辑器存在': !!document.getElementById('editor'),
    '保存按钮存在': !!document.getElementById('save-btn'),
    '分页栏存在': !!document.querySelector('.pagination-bar'),
    '字数统计存在': !!document.getElementById('word-count'),
    '工具栏存在': !!document.querySelector('.toolbar')
  };
  
  console.log('=== 快速检查结果 ===');
  Object.entries(checks).forEach(([name, result]) => {
    console.log(`${result ? '✅' : '❌'} ${name}`);
  });
  
  const allPassed = Object.values(checks).every(v => v);
  console.log('===================');
  console.log(allPassed ? '✅ 所有检查通过！' : '❌ 部分检查失败');
  
  return checks;
})();
```

---

## 🐛 常见问题

### Q1: 打开文件后显示空白

**解决**：
1. 按 F12 查看 Console
2. 查找错误消息
3. 检查文件格式是否支持

### Q2: 工具栏按钮点击无反应

**解决**：
1. 检查 Console 是否有错误
2. 确认 VSCode API 已初始化：
   ```javascript
   console.log(typeof acquireVsCodeApi);
   // 应该显示 "function"
   ```

### Q3: 分页显示 "第 1 页 / 共 1 页" 但内容很多

**解决**：
- 这是正常的，分页基于内容高度计算
- 滚动页面，页码应该更新
- 或手动插入分页符

---

## 📊 成功标准

### 必须满足：
- ✅ 编辑器打开无报错
- ✅ 文档内容可见
- ✅ 可以输入和编辑
- ✅ 工具栏按钮可以点击

### 最好满足：
- ✅ 格式化功能正常
- ✅ 分页浏览正常
- ✅ 保存功能正常
- ✅ 字数统计准确

---

## 💡 提示

### 如果还是不行：

1. **完全重启**：
   ```bash
   # 停止调试
   # 关闭所有 VSCode 窗口
   # 重新打开 VSCode
   # 按 F5 启动调试
   ```

2. **清除缓存**：
   ```bash
   npm run compile
   # 这会重新编译所有文件
   ```

3. **查看详细日志**：
   - 在 Console 中查看所有消息
   - 复制错误信息
   - 检查 `loadDocument` 方法是否被调用

4. **使用预览模式测试**：
   - 右键文件 → "Open With" → "WPS Editor (Preview)"
   - 如果预览模式可以显示，说明转换没问题
   - 问题可能在编辑器 HTML 渲染

---

## 📞 需要帮助？

请提供以下信息：

1. **Console 日志**（完整输出）
2. **错误消息**（如果有）
3. **测试步骤**（你做了什么）
4. **预期结果**（你期望看到什么）
5. **实际结果**（实际看到了什么）

---

**祝测试顺利！** 🚀
