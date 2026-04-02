# WPS Editor 发布指南

## 快速发布流程

### 1. 安装发布工具

```bash
npm install -g @vscode/vsce
```

### 2. 准备工作

#### 2.1 注册 VSCode Marketplace
1. 访问 https://marketplace.visualstudio.com/manage
2. 登录 Microsoft 账号
3. 创建 Publisher（发布者）
   - Publisher ID: `wps-editor`（或其他唯一名称）
   - 显示名称：你的组织名称
   - 填写必要信息

#### 2.2 创建 Personal Access Token
1. 访问 https://dev.azure.com/
2. 登录你的 Microsoft 账号
3. 点击右上角用户头像 → Personal access tokens
4. 创建新的 token：
   - 名称：vsce-publish
   - 过期时间：90 天或更长
   - 权限：Marketplace (Manage)
5. 复制生成的 token（只显示一次）

#### 2.3 配置 VSCE
```bash
vsce login wps-editor
# 粘贴你的 Personal Access Token
```

### 3. 发布前检查

#### 3.1 代码检查
```bash
# 编译项目
npm run compile

# 验证扩展包内容
npm run validate

# 检查依赖
npm audit
```

#### 3.2 文件检查
- [x] package.json 配置完整
- [x] README.md 存在且内容完整
- [x] CHANGELOG.md 存在
- [x] LICENSE 存在
- [ ] images/icon.png（可选，建议添加）
- [ ] 截图（可选，建议添加）

#### 3.3 功能测试
```bash
# 打包
npm run package

# 本地测试
code --install-extension wps-editor-1.0.0.vsix
```

### 4. 发布扩展

#### 方式一：一键发布
```bash
npm run publish
```

#### 方式二：手动发布
```bash
# 打包
vsce package

# 发布
vsce publish
```

#### 方式三：指定版本发布
```bash
vsce publish 1.0.0
```

### 5. 验证发布

1. 访问 https://marketplace.visualstudio.com/items?itemName=wps-editor.wps-editor
2. 检查扩展页面显示正常
3. 确认版本号正确
4. 测试安装按钮

## 更新版本流程

### 1. 更新版本号

编辑 `package.json`：
```json
{
  "version": "1.0.1"  // 递增版本号
}
```

### 2. 更新 CHANGELOG.md

添加新版本更新记录：
```markdown
## [1.0.1] - 2026-04-XX

### 修复
- 修复 XXX 问题
- 优化 XXX 功能

### 新增
- 新增 XXX 功能
```

### 3. 发布更新
```bash
npm run publish
```

### 4. 创建 Git 标签
```bash
git tag -a v1.0.1 -m "Release version 1.0.1"
git push origin v1.0.1
```

## 自动化发布（推荐）

### 配置 GitHub Actions

创建 `.github/workflows/publish.yml`:

```yaml
name: Publish Extension

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm install
      
      - name: Compile
        run: npm run compile
      
      - name: Publish to VSCE
        uses: lannonbr/vsce-action@master
        with:
          args: "publish"
        env:
          VSCE_PAT: ${{ secrets.VSCE_PAT }}
      
      - name: Publish to Open VSX
        uses: HaaLeo/publish-vscode-extension@v1
        with:
          pat: ${{ secrets.OVSX_PAT }}
          extensionFile: ${{ github.workspace }}/*.vsix
```

### 配置 Secrets

在 GitHub 仓库设置中添加：
1. `VSCE_PAT` - VSCode Marketplace Personal Access Token
2. `OVSX_PAT` - Open VSX Registry Personal Access Token（可选）

## 发布到 Open VSX Registry（可选）

### 1. 注册账号
访问 https://open-vsx.org/ 并登录

### 2. 创建 Token
在账户设置中创建 Personal Access Token

### 3. 安装 ovsx
```bash
npm install -g ovsx
```

### 4. 发布
```bash
ovsx publish
```

## 常见问题

### Q1: Publisher 名称可以修改吗？
**A**: 不可以。Publisher 名称一旦创建就不能修改。

### Q2: 扩展名称可以修改吗？
**A**: 可以，但需要作为新扩展发布。

### Q3: 如何撤回已发布的版本？
**A**: 
1. 访问 https://marketplace.visualstudio.com/manage
2. 找到你的扩展
3. 点击版本旁边的删除按钮

### Q4: 发布失败怎么办？
**A**: 
1. 检查错误信息
2. 验证 Personal Access Token 是否有效
3. 确认 package.json 配置正确
4. 检查网络连接

### Q5: 如何测试扩展？
**A**: 
```bash
# 打包
vsce package

# 本地安装测试
code --install-extension wps-editor-1.0.0.vsix

# 卸载
code --uninstall-extension wps-editor
```

## 版本命名规范

遵循语义化版本规范（Semantic Versioning）：

- **主版本号（MAJOR）**: 不兼容的 API 修改
  - 例如：1.0.0 → 2.0.0
  
- **次版本号（MINOR）**: 向下兼容的功能性新增
  - 例如：1.0.0 → 1.1.0
  
- **修订号（PATCH）**: 向下兼容的问题修正
  - 例如：1.0.0 → 1.0.1

## 发布清单

### 首次发布
- [ ] 注册 Publisher
- [ ] 创建 Personal Access Token
- [ ] 配置 VSCE
- [ ] 准备 README.md
- [ ] 准备 CHANGELOG.md
- [ ] 准备 LICENSE
- [ ] 设计图标（可选）
- [ ] 准备截图（可选）
- [ ] 验证扩展包
- [ ] 发布到 Marketplace
- [ ] 验证发布成功
- [ ] 创建 Git 标签

### 后续更新
- [ ] 更新版本号
- [ ] 更新 CHANGELOG.md
- [ ] 测试功能
- [ ] 发布更新
- [ ] 创建 Git 标签
- [ ] 通知用户更新

## 资源和链接

- [VSCode 扩展发布官方指南](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [VSCode Marketplace](https://marketplace.visualstudio.com/vscode)
- [Open VSX Registry](https://open-vsx.org/)
- [语义化版本规范](https://semver.org/)
- [VSCE 文档](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#packaging-extensions)

---

**最后更新**: 2026-04-02
**状态**: 准备就绪
