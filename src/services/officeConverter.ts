import * as mammoth from "mammoth";
import ExcelJS from "exceljs";
import htmlToDocxLib from "@turbodocx/html-to-docx";

export interface ConversionResult {
  success: boolean;
  output?: string;
  outputBuffer?: Buffer;
  messages?: string[];
  error?: string;
  engine?: "libreoffice" | "javascript";
}

export class OfficeConverter {
  constructor() {
    // htmlToDocxLib 已经通过 import 导入
  }

  /**
   * 将 DOCX 转换为 HTML
   */
  async docxToHtml(buffer: Buffer): Promise<ConversionResult> {
    try {
      const result = await mammoth.convertToHtml({ buffer });
      return {
        success: true,
        output: result.value,
        messages: result.messages?.map((m) => m.message) || [],
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "DOCX conversion failed",
      };
    }
  }

  /**
   * 将 DOCX 转换为纯文本
   */
  async docxToText(buffer: Buffer): Promise<ConversionResult> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return {
        success: true,
        output: result.value,
        messages: result.messages?.map((m) => m.message) || [],
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Text extraction failed",
      };
    }
  }

  /**
   * 将 XLSX 转换为 HTML 表格
   */
  async xlsxToHtml(buffer: Buffer): Promise<ConversionResult> {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);

      let html = '<div class="excel-sheets">';
      let messages: string[] = [];

      workbook.eachSheet((worksheet, sheetId) => {
        html += `<div class="sheet" data-sheet="${worksheet.name}">`;
        html += `<h3>${worksheet.name}</h3>`;
        html += '<table border="1">';

        let firstRow = true;
        worksheet.eachRow((row, rowNumber) => {
          html += "<tr>";
          row.eachCell((cell, colNumber) => {
            if (firstRow) {
              html += `<th>${this.escapeHtml(cell.value?.toString() || "")}</th>`;
            } else {
              html += `<td>${this.escapeHtml(cell.value?.toString() || "")}</td>`;
            }
          });
          html += "</tr>";
          firstRow = false;
        });

        html += "</table></div>";
      });

      html += "</div>";

      return {
        success: true,
        output: html,
        messages,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "XLSX conversion failed",
      };
    }
  }

  /**
   * 将 XLSX 转换为 CSV
   */
  async xlsxToCsv(buffer: Buffer): Promise<ConversionResult> {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);

      let csv = "";
      const messages: string[] = [];

      workbook.eachSheet((worksheet, sheetId) => {
        csv += `# Sheet: ${worksheet.name}\n`;
        worksheet.eachRow((row) => {
          const values: string[] = [];
          row.eachCell((cell) => {
            let str = cell.value?.toString() || "";
            // 如果包含逗号或引号，需要转义
            if (str.includes(",") || str.includes('"') || str.includes("\n")) {
              str = `"${str.replace(/"/g, '""')}"`;
            }
            values.push(str);
          });
          csv += values.join(",") + "\n";
        });
        csv += "\n";
      });

      return {
        success: true,
        output: csv,
        messages,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "CSV conversion failed",
      };
    }
  }

  /**
   * HTML 转义
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * 将 HTML 转换为 DOCX
   */
  async htmlToDocx(html: string): Promise<ConversionResult> {
    try {
      const docx = await htmlToDocxLib(html);

      // 处理返回值，可能是 Buffer、ArrayBuffer 或 Blob
      let buffer: Buffer;
      if (Buffer.isBuffer(docx)) {
        buffer = docx;
      } else if (docx instanceof ArrayBuffer) {
        buffer = Buffer.from(docx);
      } else if (docx instanceof Blob) {
        buffer = Buffer.from(await docx.arrayBuffer());
      } else {
        throw new Error("Unexpected return type from htmlToDocx");
      }

      return {
        success: true,
        outputBuffer: buffer,
        messages: [],
        engine: "javascript",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "HTML to DOCX conversion failed",
        engine: "javascript",
      };
    }
  }

  /**
   * 检测是否为支持的 Office 格式
   */
  static isSupportedOfficeFormat(extension: string): boolean {
    const supportedFormats = [".docx", ".doc", ".xlsx"];
    return supportedFormats.includes(extension.toLowerCase());
  }
}
