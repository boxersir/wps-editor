import * as fs from "fs";
import * as path from "path";
import * as libreoffice from "libreoffice-convert";
import { OfficeConverter } from "./officeConverter";
import { DependencyChecker } from "./dependencyChecker";

// 包装 libreoffice convert 函数以支持 Promise
function convertAsync(document: Buffer, format: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    libreoffice.convert(document, format, undefined, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export enum DocumentFormat {
  WPS = ".wps",
  ET = ".et",
  DPS = ".dps",
  DOC = ".doc",
  DOCX = ".docx",
  XLS = ".xls",
  XLSX = ".xlsx",
  PPT = ".ppt",
  PPTX = ".pptx",
  PDF = ".pdf",
  HTML = ".html",
  ODT = ".odt",
}

export interface ConversionResult {
  success: boolean;
  outputPath?: string;
  outputBuffer?: Buffer;
  output?: string;
  error?: string;
  messages?: string[];
  engine?: "libreoffice" | "javascript";
}

export class SmartConverter {
  private officeConverter: OfficeConverter;
  private libreOfficePath: string = "";

  constructor(libreOfficePath?: string) {
    this.officeConverter = new OfficeConverter();
    if (libreOfficePath) {
      this.libreOfficePath = libreOfficePath;
    }
  }

  /**
   * 检测文档格式
   */
  detectFormat(filePath: string): DocumentFormat | null {
    const ext = path.extname(filePath).toLowerCase();
    return Object.values(DocumentFormat).find((f) => f === ext) || null;
  }

  /**
   * 判断是否为 WPS 相关格式
   */
  isWpsFormat(format: DocumentFormat | null): boolean {
    if (!format) return false;
    const wpsFormats = [
      DocumentFormat.WPS,
      DocumentFormat.ET,
      DocumentFormat.DPS,
      DocumentFormat.DOC,
      DocumentFormat.DOCX,
    ];
    return wpsFormats.includes(format);
  }

  /**
   * 智能转换：优先使用 JavaScript 库，必要时使用 LibreOffice
   */
  async convertToHTML(
    inputPath: string,
    outputPath?: string,
  ): Promise<ConversionResult> {
    const format = this.detectFormat(inputPath);
    if (!format) {
      return {
        success: false,
        error: "不支持的文件格式",
      };
    }

    // 检查是否为 Office Open XML 格式（.docx, .xlsx）
    if (OfficeConverter.isSupportedOfficeFormat(format)) {
      return await this.convertWithJavaScript(inputPath, format, outputPath);
    }

    // 其他格式使用 LibreOffice
    return await this.convertWithLibreOffice(inputPath, ".html", outputPath);
  }

  /**
   * 使用 JavaScript 库转换（无需 LibreOffice）
   */
  private async convertWithJavaScript(
    inputPath: string,
    format: DocumentFormat,
    outputPath?: string,
  ): Promise<ConversionResult> {
    try {
      const buffer = fs.readFileSync(inputPath);
      let result: ConversionResult;

      switch (format) {
        case DocumentFormat.DOCX:
          result = await this.officeConverter.docxToHtml(buffer);
          break;
        case DocumentFormat.XLSX:
          result = await this.officeConverter.xlsxToHtml(buffer);
          break;
        default:
          return {
            success: false,
            error: "不支持的 Office 格式",
          };
      }

      if (result.success && outputPath && result.output) {
        fs.writeFileSync(outputPath, result.output, "utf-8");
        return {
          success: true,
          outputPath,
          engine: "javascript",
        };
      }

      return {
        ...result,
        engine: "javascript",
      };
    } catch (error: any) {
      return {
        success: false,
        error: `JavaScript conversion failed: ${error.message}`,
      };
    }
  }

  /**
   * 使用 LibreOffice 转换
   */
  async convertWithLibreOffice(
    inputPath: string,
    outputFormat: string,
    outputPath?: string,
  ): Promise<ConversionResult> {
    try {
      // 检查 LibreOffice 是否可用
      const hasLibreOffice = await DependencyChecker.checkLibreOffice();
      if (!hasLibreOffice) {
        const format = this.detectFormat(inputPath);
        if (format && OfficeConverter.isSupportedOfficeFormat(format)) {
          // 如果是 Office 格式，尝试使用 JavaScript 库
          return await this.convertWithJavaScript(
            inputPath,
            format,
            outputPath,
          );
        }

        DependencyChecker.showConversionError();
        return {
          success: false,
          error: "未找到 LibreOffice，无法进行文档转换",
          engine: "libreoffice",
        };
      }

      const buffer = fs.readFileSync(inputPath);
      const outputBuffer = await convertAsync(buffer, outputFormat);

      if (outputPath) {
        fs.writeFileSync(outputPath, new Uint8Array(outputBuffer));
        return {
          success: true,
          outputPath,
          engine: "libreoffice",
        };
      }

      return {
        success: true,
        outputBuffer,
        engine: "libreoffice",
      };
    } catch (error: any) {
      // 检查是否是 LibreOffice 相关错误
      if (error.message && error.message.includes("soffice")) {
        const format = this.detectFormat(inputPath);
        if (format && OfficeConverter.isSupportedOfficeFormat(format)) {
          // 如果是 Office 格式，尝试使用 JavaScript 库
          return await this.convertWithJavaScript(
            inputPath,
            format,
            outputPath,
          );
        }

        DependencyChecker.showConversionError();
        return {
          success: false,
          error: "未找到 LibreOffice，请先安装 LibreOffice",
          engine: "libreoffice",
        };
      }

      return {
        success: false,
        error: error.message || "Conversion failed",
        engine: "libreoffice",
      };
    }
  }

  /**
   * 将文档转换为 PDF
   */
  async convertToPDF(
    inputPath: string,
    outputPath?: string,
  ): Promise<ConversionResult> {
    return await this.convertWithLibreOffice(inputPath, ".pdf", outputPath);
  }

  /**
   * 获取转换引擎说明
   */
  getConversionEngineDescription(format: DocumentFormat): string {
    if (OfficeConverter.isSupportedOfficeFormat(format)) {
      return "使用 JavaScript 库（无需 LibreOffice）";
    }
    return "需要 LibreOffice";
  }

  /**
   * 清理临时文件
   */
  cleanupTempFiles(tempPath?: string): void {
    // 如果需要清理临时文件，可以在这里实现
    if (tempPath && fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (error) {
        console.error("Failed to cleanup temp file:", error);
      }
    }
  }

  /**
   * 获取临时文件路径
   */
  getTempPath(baseName: string, extension?: string): string {
    const ext = extension || "";
    const tempDir = path.join(
      require("os").tmpdir(),
      "wps-editor",
      baseName + ext,
    );
    if (!fs.existsSync(path.dirname(tempDir))) {
      fs.mkdirSync(path.dirname(tempDir), { recursive: true });
    }
    return tempDir;
  }

  /**
   * 将 HTML 转换回文档格式
   */
  async convertFromHTML(
    htmlPath: string,
    outputPath: string,
    targetFormat: DocumentFormat,
  ): Promise<ConversionResult> {
    // 对于 .docx 格式，使用 JavaScript 库
    if (targetFormat === DocumentFormat.DOCX) {
      try {
        const htmlContent = fs.readFileSync(htmlPath, "utf-8");
        const result = await this.officeConverter.htmlToDocx(htmlContent);

        if (result.success && result.outputBuffer) {
          fs.writeFileSync(outputPath, new Uint8Array(result.outputBuffer));
          return {
            success: true,
            outputPath,
            engine: "javascript",
          };
        }

        return result;
      } catch (error: any) {
        return {
          success: false,
          error: `HTML to DOCX conversion failed: ${error.message}`,
          engine: "javascript",
        };
      }
    }

    // 其他格式使用 LibreOffice
    return await this.convertWithLibreOffice(
      htmlPath,
      targetFormat,
      outputPath,
    );
  }
}
