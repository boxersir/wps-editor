import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export class DependencyChecker {
  private static readonly LIBREOFFICE_PATHS: string[] = [
    // macOS
    '/Applications/LibreOffice.app/Contents/MacOS/soffice',
    '/usr/local/bin/soffice',
    '/opt/libreoffice/program/soffice',
    // Linux
    '/usr/bin/soffice',
    '/usr/bin/libreoffice',
    '/snap/bin/libreoffice',
    // Windows
    'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
    'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
  ];

  public static async checkLibreOffice(): Promise<boolean> {
    const configuredPath = vscode.workspace
      .getConfiguration('wpsEditor')
      .get('libreOfficePath', '');

    if (configuredPath && fs.existsSync(configuredPath)) {
      return true;
    }

    for (const librePath of this.LIBREOFFICE_PATHS) {
      if (fs.existsSync(librePath)) {
        return true;
      }
    }

    return false;
  }

  public static async showInstallNotification(): Promise<void> {
    const action = await vscode.window.showWarningMessage(
      '未检测到 LibreOffice，文档转换功能将不可用。',
      '查看安装指南',
      '稍后提醒',
      '不再提醒'
    );

    if (action === '查看安装指南') {
      vscode.env.openExternal(
        vscode.Uri.parse('https://github.com/wps-editor/wps-editor#系统要求')
      );
    } else if (action === '不再提醒') {
      await vscode.workspace
        .getConfiguration('wpsEditor')
        .update('suppressLibreOfficeWarning', true, vscode.ConfigurationTarget.Global);
    }
  }

  public static async showConversionError(): Promise<void> {
    const action = await vscode.window.showErrorMessage(
      '文档转换失败：未找到 LibreOffice',
      {
        detail: '请安装 LibreOffice 后重试',
        modal: true,
      },
      '查看安装指南',
      '配置路径'
    );

    if (action === '查看安装指南') {
      vscode.env.openExternal(
        vscode.Uri.parse('https://github.com/wps-editor/wps-editor#系统要求')
      );
    } else if (action === '配置路径') {
      vscode.commands.executeCommand(
        'workbench.action.openSettings',
        'wpsEditor.libreOfficePath'
      );
    }
  }
}
