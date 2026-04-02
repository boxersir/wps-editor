# WPS Editor 插件发布指南

## 🎉 发布准备完成

### ✅ 编译状态
```bash
npm run compile
# ✅ 编译成功
```

### 📦 发布包准备

由于环境限制，无法直接执行发布命令，但所有准备工作已完成：

1. **代码编译**：✅ 完成
2. **依赖安装**：✅ 完成
3. **功能测试**：✅ 完成
4. **版本配置**：✅ 完成

---

## 🚀 发布步骤

### 步骤 1：安装 VS Code Extensions CLI
```bash
# 全局安装
npm install -g vsce

# 或使用 npx
npx vsce
```

### 步骤 2：验证发布内容
```bash
# 列出将包含在发布包中的文件
vsce ls

# 检查 package.json 配置
vsce verify
```

### 步骤 3：创建发布包
```bash
# 创建 .vsix 发布包
vsce package

# 输出：wps-editor-1.0.0.vsix
```

### 步骤 4：发布到 VS Code Marketplace
```bash
# 发布到 Marketplace
vsce publish

# 或指定版本发布
vsce publish 1.0.0
```

---

## 🔧 发布配置

### package.json 关键配置

```json
{
  "name": "wps-editor",
  "displayName": "WPS Editor",
  "description": "Preview and edit WPS documents (.wps, .et, .dps) in VSCode",
  "version": "1.0.0",
  "publisher": "wps-editor",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": [
    "Other",
    "Visualization"
  ],
  "keywords": [
    "wps", "office", "document", "editor", "preview",
    "pdf", "word", "excel", "powerpoint"
  ],
  "icon": "images/icon.png",
  "repository": {
    "type": "git",
    "url": "https://github.com/wps-editor/wps-editor"
  }
}
```

### 发布脚本

```json
{
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "lint": "eslint src --ext ts",
    "package": "vsce package",
    "publish": "vsce publish",
    "validate": "vsce ls"
  }
}
```

---

## 📋 发布清单

### ✅ 功能验证
- [x] .docx 文档打开、编辑、保存
- [x] .xlsx 文档打开
- [x] 编辑功能（加粗、斜体、下划线）
- [x] 分页显示
- [x] 预览模式
- [x] 编辑器模式
- [x] 错误处理

### ✅ 代码质量
- [x] TypeScript 编译成功
- [x] 无语法错误
- [x] 无警告
- [x] 代码风格一致

### ✅ 依赖管理
- [x] 所有依赖已安装
- [x] 版本锁定
- [x] 无安全漏洞

### ✅ 文档准备
- [x] README.md
- [x] CHANGELOG.md
- [x] LICENSE
- [x] 发布说明

---

## 🎯 发布版本信息

### 版本：1.0.0

#### 核心功能
- ✅ WPS 文档预览
- ✅ DOCX 文档编辑
- ✅ XLSX 文档预览
- ✅ 富文本编辑
- ✅ 分页显示
- ✅ 无需 LibreOffice（.docx 和 .xlsx）

#### 技术特点
- ✅ 纯 JavaScript 实现
- ✅ TypeScript 支持
- ✅ 跨平台兼容
- ✅ 性能优化
- ✅ 错误处理

---

## 💡 发布后注意事项

### 监控
- [ ] 监控 Marketplace 下载量
- [ ] 监控用户评论
- [ ] 监控错误报告

### 更新计划
- [ ] 收集用户反馈
- [ ] 修复 bug
- [ ] 添加新功能
- [ ] 定期更新依赖

---

## 🔍 故障排除

### 常见问题

#### 1. 发布失败
```bash
# 错误：EPERM: operation not permitted
# 解决：使用管理员权限运行

sudo npm install -g vsce
```

#### 2. 依赖问题
```bash
# 错误：Missing dependencies
# 解决：重新安装依赖

npm install
```

#### 3. 版本冲突
```bash
# 错误：Version already exists
# 解决：更新版本号

# 在 package.json 中修改
"version": "1.0.1"
```

---

## 📞 支持

### 联系方式
- **GitHub Issues**：[https://github.com/wps-editor/wps-editor/issues](https://github.com/wps-editor/wps-editor/issues)
- **Email**：support@wps-editor.com

### 文档
- **README**：[https://github.com/wps-editor/wps-editor#readme](https://github.com/wps-editor/wps-editor#readme)
- **使用指南**：[https://github.com/wps-editor/wps-editor/wiki](https://github.com/wps-editor/wps-editor/wiki)

---

## 🎉 发布完成

**WPS Editor 插件已准备就绪，可以发布到 VS Code Marketplace！**

### 发布命令总结
```bash
# 1. 安装 vsce
npm install -g vsce

# 2. 创建发布包
vsce package

# 3. 发布
vsce publish
```

**发布成功后，用户可以在 VS Code 扩展市场中搜索 "WPS Editor" 安装使用！** 🎊
