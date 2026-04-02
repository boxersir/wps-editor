import * as vscode from "vscode";
import * as path from "path";
import { WpsPreviewProvider } from "./providers/wpsPreviewProvider";
import { WpsEditorProvider } from "./providers/wpsEditorProvider";
import { SmartConverter, DocumentFormat } from "./services/smartConverter";
import { DependencyChecker } from "./services/dependencyChecker";

export async function activate(context: vscode.ExtensionContext) {
  console.log("WPS Editor 扩展已激活");

  // 检查 LibreOffice 依赖
  const hasLibreOffice = await DependencyChecker.checkLibreOffice();
  if (!hasLibreOffice) {
    const suppressWarning = vscode.workspace
      .getConfiguration("wpsEditor")
      .get("suppressLibreOfficeWarning", false);

    if (!suppressWarning) {
      DependencyChecker.showInstallNotification();
    }
  }

  // 注册预览提供者
  const previewProvider = WpsPreviewProvider.register(context);
  context.subscriptions.push(previewProvider);

  // 注册编辑提供者
  const editorProvider = WpsEditorProvider.register(context);
  context.subscriptions.push(editorProvider);

  // 注册命令：打开预览
  const openPreviewCommand = vscode.commands.registerCommand(
    "wpsEditor.openPreview",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("请先打开一个 WPS 文档");
        return;
      }

      const document = editor.document;
      const converter = new SmartConverter();
      const format = converter.detectFormat(document.uri.fsPath);

      if (!converter.isWpsFormat(format)) {
        vscode.window.showErrorMessage("不支持的文档格式");
        return;
      }

      // 打开预览面板
      await vscode.commands.executeCommand(
        "vscode.openWith",
        document.uri,
        "wpsEditor.preview",
      );
    },
  );
  context.subscriptions.push(openPreviewCommand);

  // 注册命令：转换为 PDF
  const convertToPdfCommand = vscode.commands.registerCommand(
    "wpsEditor.convertToPDF",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("请先打开一个 WPS 文档");
        return;
      }

      const document = editor.document;
      const converter = new SmartConverter();
      const format = converter.detectFormat(document.uri.fsPath);

      if (!converter.isWpsFormat(format)) {
        vscode.window.showErrorMessage("不支持的文档格式");
        return;
      }

      // 选择保存位置
      const saveUri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.joinPath(
          document.uri,
          "..",
          path.basename(
            document.uri.fsPath,
            path.extname(document.uri.fsPath),
          ) + ".pdf",
        ),
        filters: {
          PDF: ["pdf"],
        },
      });

      if (!saveUri) {
        return;
      }

      // 转换文档
      vscode.window.showInformationMessage("正在转换文档...");
      const result = await converter.convertToPDF(
        document.uri.fsPath,
        saveUri.fsPath,
      );

      if (result.success) {
        vscode.window.showInformationMessage(
          `文档已成功转换为 PDF: ${saveUri.fsPath}`,
        );

        // 询问是否打开 PDF
        const openPdf = await vscode.window.showInformationMessage(
          "是否打开生成的 PDF 文件？",
          "是",
          "否",
        );

        if (openPdf === "是") {
          await vscode.commands.executeCommand("vscode.open", saveUri);
        }
      } else {
        vscode.window.showErrorMessage(`转换失败：${result.error}`);
      }
    },
  );
  context.subscriptions.push(convertToPdfCommand);

  // 监听配置变化
  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("wpsEditor")) {
      console.log("WPS Editor 配置已更新");
    }
  });
}

export function deactivate() {
  console.log("WPS Editor 扩展已停用");
}
