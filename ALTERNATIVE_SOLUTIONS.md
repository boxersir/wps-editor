# 替代 LibreOffice 方案 - 综合评估报告

## 📋 背景

当前 WPS Editor 依赖 LibreOffice 进行文档转换，这给用户带来了一定的安装负担。我们深入调研了多种替代方案，以寻找更优的解决方案。

---

## 🔍 方案调研

### 方案一：纯 JavaScript 库（Office 格式）⭐⭐⭐⭐

#### 可用库

**1. Mammoth.js** - DOCX 转 HTML
- **npm**: `mammoth`
- **GitHub**: https://github.com/mwilliamson/mammoth.js
- **大小**: ~50KB
- **功能**:
  - ✅ DOCX → HTML（语义化转换）
  - ✅ DOCX → 纯文本
  - ✅ DOCX → Markdown
  - ✅ 自定义样式映射
  - ✅ 图片支持（Base64 或外部文件）
  - ✅ 表格、列表、脚注
  - ❌ 不支持 .doc（旧格式）
  - ❌ 不支持 WPS 格式

**使用示例**:
```typescript
import mammoth from 'mammoth';

// 转换为 HTML
const result = await mammoth.convertToHtml({
  path: "document.docx"
});
const html = result.value;
const messages = result.messages;

// 转换为纯文本
const textResult = await mammoth.extractRawText({
  path: "document.docx"
});
```

**2. Docx** - 创建和读取 DOCX
- **npm**: `docx`
- **大小**: ~200KB
- **功能**:
  - ✅ 创建 DOCX 文档
  - ✅ 读取 DOCX 文档
  - ✅ 完整的样式支持
  - ❌ 主要用于生成，解析功能有限

**3. DocShift** - 双向转换（新发现）⭐
- **GitHub**: https://github.com/ducbao414/docshift
- **npm**: `docshift`
- **大小**: ~240KB (minified + gzipped)
- **功能**:
  - ✅ DOCX ↔ HTML 双向转换
  - ✅ 纯客户端运行
  - ✅ 样式保留更好
  - ✅ 支持富文本编辑器集成
  - ❌ 仅支持 DOCX
  - ❌ 不支持 WPS 格式

**4. ExcelJS / XLSX** - 表格处理
- **npm**: `exceljs`, `xlsx`
- **功能**:
  - ✅ XLSX 读取和写入
  - ✅ XLS 读取（部分支持）
  - ✅ 样式、公式、图表
  - ❌ 不支持 .et（WPS 表格）

**5. PPTX 解析库**
- **npm**: `pptxgenjs`, `node-pptx`
- **功能**:
  - ✅ PPTX 生成
  - ⚠️ PPTX 读取（功能有限）
  - ❌ 不支持 .dps（WPS 演示）

#### 评估

| 维度 | 评分 | 说明 |
|------|------|------|
| 技术成熟度 | ⭐⭐⭐⭐ | Mammoth 等库已非常成熟 |
| 格式支持 | ⭐⭐ | 仅支持 Office 格式，不支持 WPS |
| 转换质量 | ⭐⭐⭐⭐ | DOCX 转换质量好 |
| 体积 | ⭐⭐⭐⭐⭐ | < 1MB，非常轻量 |
| 维护成本 | ⭐⭐⭐⭐⭐ | npm 包，易于维护 |
| 跨平台 | ⭐⭐⭐⭐⭐ | 纯 JavaScript，无平台依赖 |

**优点**:
- ✅ 无需外部依赖
- ✅ 体积小，安装快
- ✅ 纯 JavaScript，跨平台
- ✅ 易于集成和维护
- ✅ 社区活跃，文档完善

**缺点**:
- ❌ **不支持 WPS 专有格式** (.wps, .et, .dps)
- ❌ 仅支持 Office Open XML 格式 (.docx, .xlsx, .pptx)
- ❌ 旧格式支持有限 (.doc, .xls, .ppt)

---

### 方案二：在线转换 API ⭐⭐

#### 可用服务

**1. CloudConvert**
- **API**: https://cloudconvert.com/api
- **支持格式**: 200+ 格式，包括 WPS
- **价格**: 免费额度 + 付费套餐
- **优点**:
  - ✅ 支持 WPS 格式
  - ✅ 转换质量高
  - ✅ 无需本地依赖
- **缺点**:
  - ❌ 需要网络连接
  - ❌ 隐私问题（文档上传到云端）
  - ❌ 转换速度受网络影响
  - ❌ 免费额度有限

**使用示例**:
```typescript
import axios from 'axios';

async function convertWithCloudConvert(file: Buffer, inputFormat: string) {
  const response = await axios.post(
    'https://api.cloudconvert.com/v2/convert',
    {
      inputformat: inputFormat,
      outputformat: 'pdf',
      file: file.toString('base64')
    },
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    }
  );
  return response.data;
}
```

**2. Zamzar API**
- **API**: https://developers.zamzar.com/
- **支持格式**: 1200+ 格式
- **价格**: 付费服务

**3. Adobe Document Cloud API**
- **API**: https://documentcloud.adobe.com/document-services/
- **支持格式**: PDF 相关
- **价格**: 企业级定价

#### 评估

| 维度 | 评分 | 说明 |
|------|------|------|
| 格式支持 | ⭐⭐⭐⭐⭐ | 支持几乎所有格式 |
| 转换质量 | ⭐⭐⭐⭐ | 专业转换服务 |
| 便利性 | ⭐⭐⭐ | 需要网络和 API Key |
| 隐私安全 | ⭐⭐ | 文档需要上传 |
| 成本 | ⭐⭐ | 免费额度有限 |
| 速度 | ⭐⭐⭐ | 依赖网络速度 |

**优点**:
- ✅ 支持 WPS 格式
- ✅ 无需本地依赖
- ✅ 转换质量高
- ✅ 支持格式多

**缺点**:
- ❌ **隐私问题** - 文档需要上传到第三方
- ❌ **需要网络** - 离线无法使用
- ❌ **成本问题** - 大量使用需要付费
- ❌ **速度慢** - 受网络影响
- ❌ **合规风险** - 企业用户可能不允许上传文档

---

### 方案三：libwps（C++ 库封装）⭐⭐⭐

#### 技术背景

**libwps** 是一个 C++ 库，用于解析 Microsoft Works 和 Kingsoft WPS 格式：
- **GitHub**: https://github.com/libwps/libwps
- **许可**: LGPL / MPL
- **状态**: 活跃维护
- **功能**:
  - ✅ 解析 .wps（Microsoft Works）
  - ⚠️ 解析 Kingsoft WPS（部分支持）
  - ✅ 输出为文本或 HTML
  - ❌ 不支持 .et, .dps

#### 实现方式

**方式 A: Node.js Native 模块**
```cpp
// C++ Native 模块
#include <napi.h>
#include <libwps/libwps.h>

Napi::Value ConvertWps(const Napi::CallbackInfo& info) {
  // 调用 libwps 进行转换
  WPSDocument doc;
  doc.Load(inputPath);
  std::string html = doc.SaveAsHTML();
  return Napi::String::New(info.Env(), html);
}
```

**方式 B: WebAssembly**
```typescript
// 编译 libwps 为 WASM
import init, { convert_wps } from 'libwps-wasm';

await init();
const html = convert_wps(wpsBuffer);
```

#### 评估

| 维度 | 评分 | 说明 |
|------|------|------|
| 格式支持 | ⭐⭐⭐ | 支持 WPS 文字，不支持表格/演示 |
| 技术难度 | ⭐⭐ | 需要 C++ 和构建系统 |
| 维护成本 | ⭐⭐ | 需要维护 Native 模块 |
| 跨平台 | ⭐⭐⭐ | 需要为各平台编译 |
| 体积 | ⭐⭐⭐ | ~5-10MB |
| 性能 | ⭐⭐⭐⭐ | 原生代码，性能好 |

**优点**:
- ✅ 支持 WPS 格式（部分）
- ✅ 本地执行，隐私好
- ✅ 无需网络
- ✅ 性能较好

**缺点**:
- ❌ **技术复杂度高** - 需要 C++ 和 Native 模块开发
- ❌ **维护成本高** - 需要为各平台编译
- ❌ **支持不完整** - 仅支持文字，不支持表格和演示
- ❌ **许可证限制** - LGPL/MPL，可能影响商业使用
- ❌ **构建复杂** - 需要处理不同平台的依赖

---

### 方案四：WPS Office JS SDK（未找到）⭐

#### 调研结果

搜索了以下资源：
- WPS 开放平台：https://open.wps.cn/
- npm 包：搜索 "wps", "kingsoft"
- GitHub: 搜索 "wps sdk", "wps api"

**发现**:
- ✅ WPS 有开放平台 API（用于云文档）
- ❌ **没有公开的文档解析 SDK**
- ❌ **没有官方的 JavaScript 解析库**

**WPS 开放平台 API**:
- 主要用于云文档管理
- 需要认证和授权
- 不提供本地文件解析功能

---

### 方案五：逆向工程 / 自研解析器 ⭐

#### 技术可行性

**WPS 文件格式**:
- .wps: 基于 Microsoft Works 格式（二进制）
- .et: Kingsoft 表格格式（私有）
- .dps: Kingsoft 演示格式（私有）

**挑战**:
- ❌ **格式不公开** - Kingsoft 未公开格式规范
- ❌ **复杂度高** - Office 文档格式非常复杂
- ❌ **法律风险** - 可能涉及知识产权问题
- ❌ **时间成本** - 需要大量开发和测试

**已有项目参考**:
- libwps: 解析 Microsoft Works 格式
- libetonyek: 解析 Apple iWork 格式
- libcdr: 解析 CorelDRAW 格式

#### 评估

| 维度 | 评分 | 说明 |
|------|------|------|
| 技术可行性 | ⭐⭐ | 理论可行，实际困难 |
| 时间成本 | ⭐ | 需要数月到数年 |
| 法律风险 | ⭐⭐ | 可能涉及侵权 |
| 维护成本 | ⭐ | 需要持续跟进格式变化 |

**结论**: **不推荐** - 投入产出比太低

---

## 📊 综合对比

| 方案 | 格式支持 | 体积 | 隐私 | 成本 | 维护 | 推荐度 |
|------|---------|------|------|------|------|--------|
| **当前方案 (LibreOffice)** | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **JS 库 (仅 Office)** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **在线 API** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **libwps (Native)** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **自研解析器** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ | ⭐ | ❌ |

---

## 🎯 推荐方案：混合方案（Hybrid Approach）⭐⭐⭐⭐⭐

### 方案设计

结合多种方案的优势，实现最佳用户体验：

```typescript
// 智能转换引擎
class SmartConverter {
  async convert(inputPath: string, outputFormat: string) {
    const format = this.detectFormat(inputPath);
    
    // 1. Office Open XML 格式 - 使用 JS 库（无需 LibreOffice）
    if (['.docx', '.xlsx', '.pptx'].includes(format)) {
      return await this.convertWithJS(inputPath, outputFormat);
    }
    
    // 2. WPS 格式 - 尝试 LibreOffice
    if (['.wps', '.et', '.dps'].includes(format)) {
      if (await this.hasLibreOffice()) {
        return await this.convertWithLibreOffice(inputPath, outputFormat);
      } else {
        // 降级方案：尝试在线 API（需用户配置）
        if (this.config.useOnlineAPI) {
          return await this.convertWithAPI(inputPath, outputFormat);
        } else {
          throw new Error('WPS 格式需要安装 LibreOffice 或配置在线 API');
        }
      }
    }
    
    // 3. 旧 Office 格式 - 尝试 LibreOffice 或在线 API
    if (['.doc', '.xls', '.ppt'].includes(format)) {
      if (await this.hasLibreOffice()) {
        return await this.convertWithLibreOffice(inputPath, outputFormat);
      } else if (this.config.useOnlineAPI) {
        return await this.convertWithAPI(inputPath, outputFormat);
      } else {
        throw new Error('旧 Office 格式需要安装 LibreOffice');
      }
    }
  }
}
```

### 实施策略

#### 阶段一：支持 Office 格式（无需 LibreOffice）
- ✅ 集成 Mammoth.js 处理 .docx
- ✅ 集成 ExcelJS 处理 .xlsx
- ⚠️ .pptx 支持（功能有限）

**好处**:
- 使用 Office 格式的用户无需安装 LibreOffice
- 降低使用门槛
- 提升用户体验

#### 阶段二：优化 WPS 格式支持
- ⚠️ 研究 libwps 集成可行性
- ⚠️ 评估与 WPS 官方合作可能性
- ✅ 保持 LibreOffice 支持

#### 阶段三：可选在线 API
- ✅ 提供在线 API 配置选项
- ✅ 支持多种 API 服务
- ✅ 用户自行配置 API Key

### 配置选项

```json
{
  "wpsEditor.conversionEngine": {
    "type": "string",
    "enum": ["auto", "libreoffice", "javascript", "online"],
    "default": "auto",
    "description": "转换引擎选择"
  },
  "wpsEditor.preferJavascript": {
    "type": "boolean",
    "default": true,
    "description": "优先使用 JavaScript 库（无需 LibreOffice）"
  },
  "wpsEditor.onlineAPI": {
    "type": "object",
    "properties": {
      "enabled": { "type": "boolean", "default": false },
      "provider": { "type": "string", "enum": ["cloudconvert", "zamzar"] },
      "apiKey": { "type": "string" }
    }
  }
}
```

### 用户体验

#### 场景一：Office 格式用户
1. 打开 .docx 文件
2. 自动使用 Mammoth.js 转换
3. **无需安装 LibreOffice** ✅
4. 快速预览和编辑

#### 场景二：WPS 格式用户（已安装 LibreOffice）
1. 打开 .wps 文件
2. 检测到 LibreOffice
3. 使用 LibreOffice 转换
4. 正常使用

#### 场景三：WPS 格式用户（未安装 LibreOffice）
1. 打开 .wps 文件
2. 检测未安装 LibreOffice
3. 提示用户：
   - "安装 LibreOffice"（推荐）
   - "配置在线 API"（可选）
   - "查看支持格式说明"

---

## 📈 实施计划

### 短期（1-2 周）
- [ ] 集成 Mammoth.js 支持 .docx
- [ ] 集成 ExcelJS 支持 .xlsx
- [ ] 实现智能转换引擎
- [ ] 更新文档说明

### 中期（1 个月）
- [ ] 研究 libwps 集成
- [ ] 实现在线 API 支持
- [ ] 优化错误处理
- [ ] 用户测试和反馈

### 长期（2-3 个月）
- [ ] 研究 WPS 格式解析
- [ ] 探索与 WPS 官方合作
- [ ] 持续优化转换质量
- [ ] 扩展支持更多格式

---

## 💡 结论

### 最佳方案：混合方案（Hybrid Approach）

**核心理念**: 
- **Office 格式** - 使用 JavaScript 库（无需 LibreOffice）
- **WPS 格式** - 保持 LibreOffice 支持，提供在线 API 选项

**优势**:
1. ✅ **降低门槛** - Office 格式用户无需安装额外软件
2. ✅ **保持兼容** - WPS 格式继续支持
3. ✅ **灵活选择** - 用户可根据需求选择方案
4. ✅ **渐进优化** - 逐步减少依赖

**实施成本**:
- 开发时间：1-2 周
- 维护成本：低（使用成熟 npm 包）
- 风险：低（保持现有 LibreOffice 支持）

### 推荐行动

**立即实施**:
1. 集成 Mammoth.js 支持 .docx
2. 实现智能引擎（优先使用 JS 库）
3. 更新文档说明

**后续优化**:
1. 研究 libwps 集成
2. 实现在线 API 选项
3. 收集用户反馈

---

**报告完成时间**: 2026-04-02  
**建议方案**: 混合方案（Hybrid Approach）  
**预计实施时间**: 1-2 周  
**技术风险**: 低
