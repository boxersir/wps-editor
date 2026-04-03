# 生产环境问题记录

本文档记录了 WPS Editor 插件在生产环境中遇到的问题和解决方案，用于将来开发和发布时参考。

## ⚠️ 重要警告

### 🚨 依赖管理黄金法则

**每次安装新依赖时，必须执行以下步骤：**

1. **更新 .vscodeignore 文件**
   ```bash
   # 在 .vscodeignore 中添加新依赖
   !node_modules/新依赖名/**
   ```

2. **检查间接依赖**
   ```bash
   # 查看依赖树
   npm ls 新依赖名
   
   # 确保所有间接依赖也添加到 .vscodeignore
   ```

3. **验证打包结果**
   ```bash
   # 打包
   npx vsce package
   
   # 检查包大小（应该明显增大）
   # 检查文件数量（应该包含新依赖的文件）
   ```

4. **测试生产环境**
   ```bash
   # 在干净环境中安装测试
   code --install-extension wps-editor-x.x.x.vsix
   ```

**为什么这很重要？**
- VS Code 扩展不会自动安装 npm 依赖
- `.vscodeignore` 默认排除所有 `node_modules`
- 生产环境没有 `node_modules` 目录
- 遗漏依赖会导致扩展完全无法加载

---

## 📋 问题列表

### 问题 1: 缺少模块错误 - `can't find module 'libreoffice-convert'`

**发生时间**: 2026-04-02
**严重程度**: 🔴 严重（导致扩展完全无法加载）

#### 问题描述
在生产环境中安装插件后，打开 .docx 文档时报错：
```
can't find module 'libreoffice-convert'
```

#### 根本原因
1. 代码中仍然导入了 `libreoffice-convert` 模块
2. 虽然移除了 LibreOffice 的依赖检测，但没有清理代码中的导入
3. 生产环境中 `libreoffice-convert` 模块不存在，导致扩展无法加载

#### 影响范围
- 扩展无法正常激活
- 所有文档预览和编辑功能失效
- 用户无法使用任何功能

#### 解决方案
1. **移除代码中的导入**：
   - 从 `src/services/smartConverter.ts` 中移除 `import * as libreoffice from "libreoffice-convert"`
   - 移除相关的包装函数 `convertAsync`

2. **更新 package.json**：
   - 从 `dependencies` 中移除 `"libreoffice-convert": "^1.8.1"`

3. **删除未使用的文件**：
   - 删除 `src/services/documentConverter.ts`（该文件也在使用 `libreoffice-convert` 且不再被使用）

4. **重新安装依赖**：
   ```bash
   npm install
   ```

5. **重新编译和打包**：
   ```bash
   npm run compile
   npx vsce package
   ```

#### 预防措施
1. **依赖管理**：
   - 定期检查 `package.json` 中的依赖是否都被实际使用
   - 使用工具（如 `npm-check` 或 `depcheck`）检查未使用的依赖
   - 确保代码中的导入与依赖列表一致

2. **代码清理**：
   - 重构后及时删除未使用的文件
   - 使用 `grep` 检查文件是否被引用：
     ```bash
     grep -r "documentConverter" src/
     ```
   - 定期进行代码审查，清理死代码

3. **发布前检查**：
   - 在发布前进行完整的编译和打包测试
   - 检查是否有编译错误或警告
   - 验证所有依赖都能正确安装
   - 在干净的环境中测试打包后的插件

---

### 问题 2: 日志限制导致调试困难

**发生时间**: 2026-04-02
**严重程度**: 🟡 中等（影响问题排查）

#### 问题描述
在生产环境中，大部分日志被 `process.env.NODE_ENV === "development"` 条件屏蔽，无法看到错误信息。

#### 根本原因
1. 使用环境变量来控制日志输出
2. 生产环境下 `NODE_ENV` 未设置为 `development`
3. 关键错误信息被隐藏，无法定位问题

#### 影响范围
- 无法在生产环境中调试问题
- 错误信息不完整，难以定位根本原因
- 增加了问题排查的时间成本

#### 解决方案
1. **移除日志限制**：
   - 从 `src/providers/wpsEditorProvider.ts` 的 `loadDocument` 方法中移除环境变量检查
   - 确保所有日志都能在生产环境中输出

2. **使用 VSCode 日志系统**（推荐）：
   ```typescript
   const outputChannel = vscode.window.createOutputChannel('WPS Editor');
   outputChannel.appendLine('日志信息');
   outputChannel.show();
   ```

3. **使用配置选项控制日志级别**：
   ```json
   "configuration": {
     "properties": {
       "wpsEditor.logLevel": {
         "type": "string",
         "enum": ["debug", "info", "warn", "error"],
         "default": "info"
       }
     }
   }
   ```

#### 预防措施
1. **统一日志策略**：
   - 避免使用 `process.env.NODE_ENV` 来控制日志输出
   - 使用 VSCode 的日志系统或配置选项来控制日志级别
   - 确保开发和生产环境的行为一致

2. **错误处理**：
   - 确保所有错误都能被正确捕获和显示
   - 提供详细的错误信息，包括堆栈跟踪
   - 使用用户友好的错误消息

---

### 问题 3: 缺少模块错误 - `can't find module 'mammoth'`

**发生时间**: 2026-04-02
**严重程度**: 🔴 严重（导致扩展完全无法加载）

#### 问题描述
在生产环境中安装插件后，打开 .docx 文档时报错：
```
can't find module 'mammoth'
```

#### 根本原因
1. `.vscodeignore` 文件中排除了所有 `node_modules/**
2. 打包后的插件不包含任何依赖
3. 用户安装插件时，VSCode 不会自动运行 `npm install`
4. 生产环境中找不到必要的运行时依赖

#### 影响范围
- 扩展无法正常激活
- 所有文档预览和编辑功能失效
- 用户无法使用任何功能

#### 解决方案
1. **修改 `.vscodeignore` 文件**：
   ```gitignore
   # 保留必要的依赖，但排除开发依赖
   node_modules/**
   !node_modules/mammoth/**
   !node_modules/exceljs/**
   !node_modules/@turbodocx/**
   !node_modules/axios/**
   !node_modules/pdfjs-dist/**
   # 排除测试文件
   node_modules/mammoth/test/**
   node_modules/mammoth/.github/**
   node_modules/exceljs/test/**
   node_modules/exceljs/spec/**
   ```

2. **重新打包插件**：
   ```bash
   npx vsce package
   ```

3. **验证打包结果**：
   - 检查包大小（应该包含依赖，约 18MB+）
   - 检查文件数量（应该包含依赖文件，1000+ 文件）

#### 预防措施
1. **理解 VSCode 扩展打包机制**：
   - VSCode 扩展不会自动安装 npm 依赖
   - 必须将运行时依赖打包到扩展中
   - 开发依赖可以排除，但运行时依赖必须包含

2. **配置 `.vscodeignore`**：
   - 使用 `!node_modules/package-name/**` 保留必要的依赖
   - 排除测试文件、文档等不必要的文件
   - 定期检查和更新 `.vscodeignore`

3. **发布前验证**：
   - 检查打包后的文件大小（如果只有几百 KB，说明依赖没打包）
   - 在干净的环境中测试安装后的插件
   - 确认所有依赖都能正常加载

#### 关键知识点
- **VSCode 扩展依赖管理**：
  - `devDependencies`：开发时使用的依赖，不需要打包
  - `dependencies`：运行时依赖，必须打包到扩展中
  - `.vscodeignore`：控制哪些文件被打包，默认排除 `node_modules`

- **打包检查清单**：
   - 包大小应该明显大于源代码（包含依赖）
   - 文件数量应该包含所有依赖文件
   - 在干净环境中测试安装后的功能

---

### 问题 4: 缺少模块错误 - `can't find module 'underscore'`

**发生时间**: 2026-04-02
**严重程度**: 🔴 严重（导致扩展完全无法加载）

#### 问题描述
在生产环境中安装插件后，打开 .docx 文档时报错：
```
Cannot find module 'underscore'
Require stack:
- /Users/caixin/.vscode/extensions/wps-editor.wps-editor-1.0.7/node_modules/mammoth/lib/index.js
- /Users/caixin/.vscode/extensions/wps-editor.wps-editor-1.0.7/out/services/officeConverter.js
- /Users/caixin/.vscode/extensions/wps-editor.wps-editor-1.0.7/out/services/smartConverter.js
- /Users/caixin/.vscode/extensions/wps-editor.wps-editor-1.0.7/out/providers/wpsPreviewProvider.js
- /Users/caixin/.vscode/extensions/wps-editor.wps-editor-1.0.7/out/extension.js
```

#### 根本原因
1. **间接依赖缺失**：只包含了直接依赖（mammoth、exceljs、@turbodocx/html-to-docx）
2. **未包含间接依赖**：mammoth 依赖于 underscore 等其他模块
3. **依赖链未完整打包**：VSCode 扩展打包时需要包含所有间接依赖

#### 影响范围
- 扩展无法正常激活
- 所有文档预览和编辑功能失效
- 用户无法使用任何功能

#### 解决方案
1. **分析所有依赖**：
   - 检查 mammoth 的依赖：@xmldom/xmldom、argparse、base64-js、bluebird、dingbat-to-unicode、jszip、lop、path-is-absolute、underscore、xmlbuilder
   - 检查 exceljs 的依赖：archiver、dayjs、fast-csv、jszip、readable-stream、saxes、tmp、unzipper、uuid
   - 检查 @turbodocx/html-to-docx 的依赖：axios、color-name、html-entities、html-minifier-terser、htmlparser2、image-size、jszip、lodash、lru-cache、mime-types、nanoid、xmlbuilder2
   - 检查 html-minifier-terser 的依赖：camel-case、clean-css、commander、entities、param-case、relateurl、terser
   - 检查 htmlparser2 的依赖：domelementtype、domhandler、domutils、entities

2. **更新 .vscodeignore 文件**：
   - 保留所有必要的直接和间接依赖
   - 排除测试文件和不必要的文件

3. **重新打包插件**：
   ```bash
   npx vsce package
   ```

4. **验证打包结果**：
   - 包大小：23.13MB（包含所有依赖）
   - 文件数量：4515 个文件
   - 状态：✅ 打包成功

#### 预防措施
1. **依赖树分析**：
   - 使用 `npm ls` 命令分析完整的依赖树
   - 确保所有间接依赖都被包含在打包中
   - 定期检查依赖关系，特别是当依赖版本更新时

2. **打包验证**：
   - 检查打包后的文件大小（应该明显大于源代码）
   - 检查文件数量（应该包含所有依赖文件）
   - 在干净的环境中测试安装后的插件

3. **自动化检查**：
   - 建立依赖检查脚本，确保所有必要的依赖都被包含
   - 使用 CI/CD 流程验证打包结果
   - 定期测试生产环境安装

#### 关键知识点
- **VSCode 扩展依赖管理**：
  - 必须包含所有直接和间接依赖
  - `.vscodeignore` 文件需要仔细配置，只排除开发依赖和测试文件
  - 依赖链中的任何缺失都会导致扩展无法加载

- **依赖分析工具**：
  - `npm ls`：查看完整依赖树
  - `npm list --prod`：查看生产依赖
  - `npm audit`：检查依赖安全性

- **打包最佳实践**：
  - 只包含必要的依赖
  - 排除测试文件和文档
  - 验证打包结果的大小和文件数量
  - 在干净环境中测试安装

---

### 问题 5: 缺少模块错误 - `can't find module 'setimmediate'`

**发生时间**: 2026-04-03
**严重程度**: 🔴 严重（导致扩展完全无法加载）

#### 问题描述
在生产环境中安装插件后，打开 .docx 文档时报错：
```
can't find module 'setimmediate'
```

#### 根本原因
1. **间接依赖缺失**：`setimmediate` 是由 `jszip` 和 `unzipper` 引入的间接依赖
2. **未包含在 .vscodeignore**：之前的配置中没有包含这个间接依赖
3. **依赖链未完整**：`jszip` 是 `mammoth` 和 `@turbodocx/html-to-docx` 的依赖

#### 影响范围
- 扩展无法正常激活
- 所有文档预览和编辑功能失效
- 用户无法使用任何功能

#### 解决方案
1. **分析依赖**：
   ```bash
   npm ls setimmediate
   # 输出显示 setimmediate 是 jszip 和 unzipper 的依赖
   ```

2. **更新 .vscodeignore 文件**：
   ```gitignore
   # 其他间接依赖
   !node_modules/setimmediate/**
   ```

3. **重新打包插件**：
   ```bash
   npx vsce package
   ```

4. **验证打包结果**：
   - 包大小：23.14MB（包含所有依赖）
   - 文件数量：4518 个文件
   - 状态：✅ 打包成功

#### 预防措施
1. **全面依赖分析**：
   - 使用 `npm ls` 命令分析完整的依赖树
   - 检查所有间接依赖，包括深层依赖
   - 特别注意由多个包共享的依赖

2. **依赖监控**：
   - 当安装新依赖时，检查其依赖树
   - 当依赖版本更新时，重新检查依赖关系
   - 建立依赖检查清单，确保所有依赖都被包含

3. **自动化验证**：
   - 建立打包后验证脚本，检查关键依赖是否存在
   - 使用 CI/CD 流程验证打包结果
   - 定期在干净环境中测试安装

---

## 🎯 最佳实践总结

### 依赖管理（⚠️ 重点）
- ✅ **最小化依赖**：只使用必要的依赖，减少潜在的兼容性问题
- ✅ **定期检查**：使用工具检查未使用的依赖，及时清理
- ✅ **版本锁定**：在 package.json 中锁定依赖版本，避免意外升级
- ✅ **替代方案**：优先使用 JavaScript 库，避免依赖外部工具
- ⚠️ **新依赖必须更新 .vscodeignore**：每次安装新依赖，必须同步更新 .vscodeignore 文件
- ⚠️ **包含间接依赖**：不仅要包含直接依赖，还要包含所有间接依赖
- ⚠️ **验证打包结果**：打包后检查文件大小和数量，确保依赖已包含

### 代码质量
- ✅ **及时清理**：重构后删除未使用的文件和代码
- ✅ **代码审查**：定期进行代码审查，识别潜在问题
- ✅ **测试覆盖**：确保所有功能都有相应的测试
- ✅ **文档更新**：及时更新文档，反映代码变更

### 发布流程
- ✅ **编译检查**：发布前确保编译无错误无警告
- ✅ **依赖验证**：验证所有依赖都能正确安装
- ✅ **环境测试**：在干净的环境中测试打包后的插件
- ✅ **功能测试**：测试所有核心功能是否正常工作

### 调试策略
- ✅ **统一日志**：使用一致的日志策略，便于调试
- ✅ **错误捕获**：确保所有错误都能被正确捕获和显示
- ✅ **用户反馈**：提供清晰的错误消息和解决建议
- ✅ **日志输出**：确保关键信息在生产环境中也能输出

---

## 📝 发布前检查清单

在发布新版本前，请确认以下项目：

### 依赖检查（⚠️ 重点）
- [ ] 所有依赖都在 `package.json` 中声明
- [ ] 所有导入的模块都已安装
- [ ] 没有未使用的依赖
- [ ] 依赖版本已锁定
- [ ] **新依赖已添加到 .vscodeignore** ⚠️
- [ ] **间接依赖已包含** ⚠️
- [ ] **打包后验证依赖存在** ⚠️

### 代码检查
- [ ] 编译无错误
- [ ] 编译无警告
- [ ] 未使用的文件已删除
- [ ] 代码格式一致

### 功能测试
- [ ] 预览模式正常工作
- [ ] 编辑模式正常工作
- [ ] 保存功能正常工作
- [ ] 错误处理正确

### 打包测试
- [ ] 打包成功
- [ ] 在干净环境中安装测试
- [ ] 所有功能正常工作
- [ ] 没有运行时错误

### 文档更新
- [ ] README 已更新
- [ ] CHANGELOG 已更新
- [ ] 版本号已更新
- [ ] 已知问题已记录

---

## 📚 依赖管理快速参考

### 安装新依赖的标准流程

```bash
# 1. 安装依赖
npm install 新依赖名

# 2. 查看依赖树（检查间接依赖）
npm ls 新依赖名

# 3. 更新 .vscodeignore
echo "!node_modules/新依赖名/**" >> .vscodeignore

# 4. 如果有间接依赖，也添加到 .vscodeignore
# （根据 npm ls 的结果）

# 5. 打包并验证
npx vsce package

# 6. 检查包大小和文件数量
# 包大小应该明显增大
# 文件数量应该包含新依赖的文件

# 7. 在干净环境中测试
# 卸载旧版本
# 安装新版本
# 测试功能
```

### 常见问题排查

**问题：生产环境报错 `can't find module 'xxx'`**

1. 检查 `package.json` 中是否声明了该依赖
2. 检查 `.vscodeignore` 中是否包含了该依赖
3. 检查是否包含了该依赖的所有间接依赖
4. 重新打包并验证

**问题：包大小没有明显变化**

1. 检查 `.vscodeignore` 配置是否正确
2. 检查依赖是否被正确安装（`node_modules` 是否存在）
3. 检查依赖名称是否拼写正确

**问题：打包成功但运行时出错**

1. 检查是否遗漏了间接依赖
2. 使用 `npm ls` 查看完整的依赖树
3. 确保所有依赖都添加到 `.vscodeignore`

---

## 🔗 相关文档

- [README.md](./README.md) - 项目说明
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 开发指南
- [RELEASE_GUIDE.md](./RELEASE_GUIDE.md) - 发布指南
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - 测试指南

---

**最后更新**: 2026-04-02
**维护者**: WPS Editor Team
