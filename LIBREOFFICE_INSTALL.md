# LibreOffice 安装指南

## 为什么需要安装 LibreOffice？

WPS Editor 使用 LibreOffice 作为文档转换引擎，将 WPS 格式转换为 PDF 和 HTML 格式进行预览和编辑。LibreOffice 是一个开源的办公套件，支持多种文档格式。

## 快速安装

### macOS（推荐方式）

```bash
# 使用 Homebrew 安装（需要已安装 Homebrew）
brew install --cask libreoffice
```

如果没有安装 Homebrew，先安装：
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### macOS（手动安装）

1. 访问：https://www.libreoffice.org/download/
2. 下载 macOS 版本
3. 打开下载的 .dmg 文件
4. 将 LibreOffice 拖拽到 Applications 文件夹
5. 首次打开时，如果提示"无法验证开发者"，右键点击选择"打开"

### Windows

1. 访问：https://www.libreoffice.org/download/
2. 下载 Windows 版本（.msi 安装包）
3. 运行安装包
4. 按照安装向导完成安装
5. 重启 VSCode

### Linux

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install libreoffice
```

#### CentOS/RHEL
```bash
sudo yum install libreoffice
```

#### Fedora
```bash
sudo dnf install libreoffice
```

#### Arch Linux
```bash
sudo pacman -S libreoffice-fresh
```

## 验证安装

### macOS
```bash
ls -la /Applications/LibreOffice.app/Contents/MacOS/soffice
```

如果文件存在，说明安装成功。

### Linux
```bash
which soffice
```

应该输出：`/usr/bin/soffice`

### Windows

检查以下路径：
- `C:\Program Files\LibreOffice\program\soffice.exe`
- `C:\Program Files (x86)\LibreOffice\program\soffice.exe`

## 配置自定义路径

如果 LibreOffice 不在默认路径，可以在 VSCode 中配置：

### 方法一：通过设置界面

1. 打开 VSCode
2. 按 `Ctrl+,` (Windows/Linux) 或 `Cmd+,` (macOS) 打开设置
3. 搜索 `wpsEditor.libreOfficePath`
4. 输入 LibreOffice 的完整路径

### 方法二：通过 settings.json

1. 按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (macOS)
2. 输入 `Preferences: Open Settings (JSON)`
3. 添加配置：

```json
{
  "wpsEditor.libreOfficePath": "/Applications/LibreOffice.app/Contents/MacOS/soffice"
}
```

### 常见路径

#### macOS
```
/Applications/LibreOffice.app/Contents/MacOS/soffice
```

#### Linux
```
/usr/bin/soffice
```

#### Windows
```
C:\Program Files\LibreOffice\program\soffice.exe
```

## 常见问题

### Q1: 安装后插件仍然提示找不到 LibreOffice？

**A**: 尝试以下步骤：
1. 完全关闭 VSCode
2. 重新打开 VSCode
3. 如果还是不行，重启电脑

### Q2: 如何确认 LibreOffice 是否正常工作？

**A**: 在终端运行：
```bash
# macOS
/Applications/LibreOffice.app/Contents/MacOS/soffice --version

# Linux
soffice --version

# Windows
"C:\Program Files\LibreOffice\program\soffice.exe" --version
```

应该输出版本号，如：`LibreOffice 7.6.4.1`

### Q3: 可以安装特定版本的 LibreOffice 吗？

**A**: 可以。访问：
https://downloadarchive.documentfoundation.org/libreoffice/old/

选择需要的版本下载。

### Q4: 安装失败怎么办？

**A**: 
1. 检查系统要求（LibreOffice 7.x 需要 macOS 10.13+）
2. 尝试重新下载安装包
3. 查看安装日志
4. 在 GitHub Issue 中提问

### Q5: LibreOffice 会影响系统性能吗？

**A**: 
- LibreOffice 只在文档转换时运行
- 不会常驻内存
- 对系统性能影响很小

### Q6: 可以卸载 LibreOffice 吗？

**A**: 可以，但卸载后插件将无法进行文档转换。

#### macOS 卸载
```bash
sudo rm -rf /Applications/LibreOffice.app
```

#### Windows 卸载
控制面板 → 程序和功能 → 卸载 LibreOffice

#### Linux 卸载
```bash
# Ubuntu/Debian
sudo apt-get remove libreoffice

# CentOS/RHEL
sudo yum remove libreoffice
```

## 替代方案

如果确实无法安装 LibreOffice，可以考虑：

### 方案一：使用 WPS Office（实验性）

如果已安装 WPS Office，可以尝试配置使用 WPS：

```json
{
  "wpsEditor.libreOfficePath": "/Applications/WPS Office.app/Contents/MacOS/wps"
}
```

**注意**: WPS Office 的兼容性未经充分测试，可能会有问题。

### 方案二：仅预览 PDF

如果只需要预览功能，可以：
1. 使用其他工具将 WPS 转换为 PDF
2. 使用 VSCode 的 PDF 预览功能

## 技术细节

### LibreOffice 如何工作？

插件通过 `libreoffice-convert` 库调用 LibreOffice 的命令行工具进行文档转换：

```bash
soffice --headless --convert-to pdf document.wps
```

### 转换过程

1. 插件读取 WPS 文件
2. 调用 LibreOffice 转换为 PDF 或 HTML
3. 使用 PDF.js 渲染预览
4. 使用 HTML 编辑器进行编辑
5. 保存时再转换回 WPS 格式

### 性能考虑

- 首次转换：1-3 秒
- 后续转换：0.5-1 秒
- 大文档可能需要更长时间

## 相关资源

- [LibreOffice 官网](https://www.libreoffice.org/)
- [LibreOffice 下载](https://www.libreoffice.org/download/)
- [LibreOffice 文档](https://documentation.libreoffice.org/)
- [libreoffice-convert npm 包](https://www.npmjs.com/package/libreoffice-convert)

---

**最后更新**: 2026-04-02  
**适用版本**: WPS Editor 1.0.0+
