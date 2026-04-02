# WPS Editor 发版上线清单

## 发版前检查

### 1. 代码质量
- [x] TypeScript 编译通过
- [x] 无编译错误和警告
- [x] 代码格式化
- [ ] 单元测试通过（待添加）
- [ ] 集成测试通过

### 2. 功能测试
- [ ] WPS 文档预览功能正常
- [ ] 文档编辑功能正常
- [ ] 格式转换功能正常
- [ ] 保存功能正常
- [ ] 错误处理完善

### 3. 文档完善
- [x] README.md - 用户文档
- [x] DEVELOPMENT.md - 开发文档
- [x] TESTING.md - 测试指南
- [x] PROJECT_SUMMARY.md - 项目总结
- [ ] CHANGELOG.md - 更新日志

### 4. 依赖检查
- [x] 生产依赖已安装
- [x] 开发依赖已安装
- [ ] 无安全漏洞（需运行 npm audit）
- [ ] 依赖版本锁定（package-lock.json）

### 5. VSCode 扩展配置
- [ ] publisher 已注册到 VSCode Marketplace
- [ ] 图标文件（icon.png）- 可选但推荐
- [ ] 截图（screenshots）- 可选但推荐
- [ ] 许可证文件（LICENSE）
- [ ] 仓库地址
- [ ] 主页地址
- [ ] bug 报告地址

## 发版步骤

### 步骤 1：安装发布工具

```bash
npm install -g @vscode/vsce
```

### 步骤 2：登录 VSCode Marketplace

1. 访问 https://marketplace.visualstudio.com/manage
2. 创建 Publisher（如果还没有）
3. 创建 Personal Access Token
4. 登录：
```bash
vsce login <publisher-name>
```

### 步骤 3：更新 package.json

需要添加以下字段：

```json
{
  "publisher": "你的 publisher ID",
  "repository": {
    "type": "git",
    "url": "https://github.com/你的用户名/wps-editor"
  },
  "homepage": "https://github.com/你的用户名/wps-editor",
  "bugs": {
    "url": "https://github.com/你的用户名/wps-editor/issues",
    "email": "你的邮箱"
  },
  "icon": "images/icon.png",
  "galleryBanner": {
    "color": "#C80000",
    "theme": "dark"
  },
  "badges": [
    {
      "url": "https://img.shields.io/github/stars/你的用户名/wps-editor",
      "href": "https://github.com/你的用户名/wps-editor",
      "description": "GitHub Stars"
    }
  ],
  "keywords": [
    "wps",
    "office",
    "document",
    "editor",
    "preview",
    "pdf",
    "word",
    "excel",
    "powerpoint"
  ]
}
```

### 步骤 4：创建必要的文件

#### LICENSE 文件
使用 MIT 许可证（或其他你选择的许可证）

#### CHANGELOG.md
记录版本更新历史

#### images/icon.png
插件图标（512x512 像素）

### 步骤 5：验证扩展

```bash
# 打包前验证
vsce ls

# 打包
vsce package

# 本地测试安装的 .vsix 文件
code --install-extension wps-editor-1.0.0.vsix
```

### 步骤 6：发布

```bash
# 发布到市场
vsce publish

# 或者指定版本
vsce publish 1.0.0

# 发布到 Open VSX Registry（可选）
ovsx publish
```

### 步骤 7：创建 GitHub Release

1. 打标签：
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

2. 在 GitHub 创建 Release
3. 上传 .vsix 文件到 Release

## 发布后检查

### 1. Marketplace 验证
- [ ] 扩展页面显示正常
- [ ] 安装按钮可用
- [ ] 描述和截图正确
- [ ] 版本号正确

### 2. 功能验证
- [ ] 从 Marketplace 安装后功能正常
- [ ] 自动更新机制正常

### 3. 文档更新
- [ ] 更新 README 中的版本号
- [ ] 更新 CHANGELOG
- [ ] 更新安装说明

## 后续更新流程

### 小版本更新（1.0.1）
- Bug 修复
- 性能优化
- 文档更新

### 次版本更新（1.1.0）
- 新功能（向后兼容）
- 功能改进

### 主版本更新（2.0.0）
- 破坏性变更
- 重大功能更新

## 版本命名规范

遵循语义化版本规范（Semantic Versioning）：
- MAJOR.MINOR.PATCH
- 例如：1.0.0, 1.0.1, 1.1.0, 2.0.0

## 自动化发布（可选）

### 配置 GitHub Actions

创建 `.github/workflows/publish.yml`：

```yaml
name: Publish Extension
on:
  release:
    types: [published]
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run compile
      - uses: lannonbr/vsce-action@master
        with:
          args: "publish"
        env:
          VSCE_PAT: ${{ secrets.VSCE_PAT }}
```

## 注意事项

1. **Publisher 名称**：一旦设置不能更改
2. **扩展名称**：在 Marketplace 中必须唯一
3. **版本号**：每次发布必须递增
4. **依赖**：确保所有依赖都已正确声明
5. **许可证**：确保有使用开源许可证
6. **隐私政策**：如果收集用户数据，需要提供隐私政策

## 资源和链接

- [VSCode 扩展发布指南](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [VSCode Marketplace](https://marketplace.visualstudio.com/vscode)
- [Open VSX Registry](https://open-vsx.org/)
- [语义化版本规范](https://semver.org/)

---

**准备状态**: 待完成
**最后更新**: 2026-04-02
