# WPS Editor 测试指南

## 问题解决

✅ **已修复**: WPS 文件现在使用 Custom Editor API 打开，不再尝试以文本方式打开二进制文件

## 测试步骤

### 1. 安装 LibreOffice

**macOS:**
```bash
brew install --cask libreoffice
```

**验证安装:**
```bash
ls -la /Applications/LibreOffice.app/Contents/MacOS/soffice
```

### 2. 编译项目

```bash
npm run compile
```

### 3. 启动调试

- 按 `F5` 键启动扩展开发主机
- 或使用命令：`Debug: Start Debugging`

### 4. 测试 WPS 文件预览

#### 方法一：直接打开
1. 在开发主机窗口中，按 `Cmd+O` (macOS) 或 `Ctrl+O` (Windows/Linux)
2. 选择 `.wps` 文件
3. 文件应该自动使用 WPS Editor 打开，显示 PDF 预览

#### 方法二：右键菜单
1. 在资源管理器中找到 `.wps` 文件
2. 右键点击文件
3. 选择 "Open With" → "WPS Editor"

#### 方法三：命令面板
1. 按 `Cmd+Shift+P` (macOS) 或 `Ctrl+Shift+P` (Windows/Linux)
2. 输入 "Open With"
3. 选择 "WPS Editor"

### 5. 测试功能

#### 预览模式
- ✅ 页面导航（上一页/下一页）
- ✅ 缩放控制（50% - 200%）
- ✅ 切换到编辑模式

#### 编辑模式
- ✅ 富文本编辑
- ✅ 格式化（加粗、斜体、下划线）
- ✅ 标题格式
- ✅ 保存文档
- ✅ 切换回预览模式

### 6. 测试文件格式

测试以下格式：
- `.wps` (WPS 文字)
- `.doc` (Word 97-2003)
- `.docx` (Word)
- `.et` (WPS 表格) - 预览
- `.dps` (WPS 演示) - 预览

## 常见问题排查

### 问题 1: 仍然看到"二进制文件"错误

**原因**: 文件关联配置未生效

**解决方法**:
1. 确保 `package.json` 中的 `customEditors` 配置正确
2. 重新加载 VSCode 窗口：`Cmd+Shift+P` → "Reload Window"
3. 检查扩展是否正确激活

### 问题 2: 文档转换失败

**原因**: LibreOffice 未安装或路径配置错误

**解决方法**:
```bash
# macOS - 检查 LibreOffice
ls -la /Applications/LibreOffice.app/Contents/MacOS/soffice

# 如果未安装
brew install --cask libreoffice
```

配置 LibreOffice 路径：
```json
{
  "wpsEditor.libreOfficePath": "/Applications/LibreOffice.app/Contents/MacOS/soffice"
}
```

### 问题 3: PDF 无法显示

**原因**: PDF.js 加载失败

**解决方法**:
1. 检查网络连接（使用 CDN）
2. 或下载 PDF.js 到本地项目

### 问题 4: 编辑后保存失败

**原因**: 临时文件权限问题

**解决方法**:
1. 检查项目目录权限
2. 查看开发者工具控制台错误信息

## 调试技巧

### 查看日志

1. 打开开发者工具：`Help` → `Toggle Developer Tools`
2. 查看 Console 标签页的错误信息
3. 查看 Extension Host 的输出

### 输出面板

1. 查看 → 输出
2. 选择 "Extension Host"
3. 查看 WPS Editor 的日志

### 断点调试

1. 在 TypeScript 文件中设置断点
2. 按 F5 启动调试
3. 触发相应功能查看变量和调用栈

## 测试用例

### 测试用例 1: 简单 WPS 文档

```
1. 创建一个简单的 WPS 文档
2. 包含标题、段落、列表
3. 在 VSCode 中打开
4. 验证预览显示正确
5. 切换到编辑模式
6. 修改一些内容
7. 保存
8. 用 WPS Office 打开验证
```

### 测试用例 2: 复杂格式文档

```
1. 创建包含表格、图片的文档
2. 在 VSCode 中打开
3. 验证格式保留情况
4. 记录格式丢失的部分
```

### 测试用例 3: 大文档性能

```
1. 打开 > 10MB 的 WPS 文档
2. 记录加载时间
3. 测试翻页流畅度
4. 测试缩放性能
```

## 性能优化建议

1. **懒加载 PDF 页面**: 只加载当前可见页面
2. **缓存转换结果**: 避免重复转换
3. **使用 Web Worker**: 将转换移到后台线程
4. **虚拟滚动**: 大文档使用虚拟滚动

## 下一步改进

- [ ] 添加文档缩略图
- [ ] 实现搜索功能
- [ ] 支持批注和修订
- [ ] 优化表格编辑
- [ ] 添加自动保存

## 反馈和报告问题

如果遇到问题，请记录：
1. VSCode 版本
2. 操作系统版本
3. 错误信息截图
4. 复现步骤
5. 测试文件（如果可能）

---

**测试状态**: ✅ 准备就绪
**最后更新**: 2026-04-02
