import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as libreoffice from "libreoffice-convert";

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
  error?: string;
}

export class DocumentConverter {
  private libreOfficePath: string = "";

  constructor(libreOfficePath?: string) {
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
   * 将文档转换为 PDF
   */
  async convertToPDF(
    inputPath: string,
    outputPath?: string,
  ): Promise<ConversionResult> {
    try {
      return {
        success: false,
        error: "PDF 转换需要 LibreOffice 支持",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Conversion failed",
      };
    }
  }

  /**
   * 将文档转换为 HTML（用于编辑）
   */
  async convertToHTML(
    inputPath: string,
    outputPath?: string,
  ): Promise<ConversionResult> {
    try {
      return {
        success: false,
        error: "HTML 转换需要 LibreOffice 支持",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Conversion failed",
      };
    }
  }

  /**
   * 将 HTML 转换回 WPS 格式
   */
  async convertFromHTML(
    htmlPath: string,
    outputPath: string,
    targetFormat: DocumentFormat,
  ): Promise<ConversionResult> {
    try {
      const buffer = fs.readFileSync(htmlPath);

      const outputBuffer = await convertAsync(buffer, targetFormat);

      // 确保输出目录存在
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(outputPath, new Uint8Array(outputBuffer));

      return {
        success: true,
        outputPath,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Conversion failed",
      };
    }
  }

  /**
   * 获取临时文件路径
   */
  getTempPath(originalPath: string, extension: string): string {
    const tempDir = path.join(originalPath, "..", ".wps-editor-temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileName = path.basename(originalPath, path.extname(originalPath));
    const timestamp = Date.now();
    return path.join(tempDir, `${fileName}_${timestamp}${extension}`);
  }

  /**
   * 清理临时文件
   */
  cleanupTempFiles(originalPath: string): void {
    const tempDir = path.join(originalPath, "..", ".wps-editor-temp");
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

export const converter = new DocumentConverter();
