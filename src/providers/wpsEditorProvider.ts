import * as vscode from "vscode";
import * as path from "path";
import { SmartConverter } from "../services/smartConverter";

export class WpsEditorProvider implements vscode.CustomEditorProvider {
  public static readonly viewType = "wpsEditor.editor";
  private converter: SmartConverter;
  private readonly _onDidChangeCustomDocument =
    new vscode.EventEmitter<vscode.CustomDocumentEditEvent>();

  constructor(private readonly context: vscode.ExtensionContext) {
    this.converter = new SmartConverter();
  }

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new WpsEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      WpsEditorProvider.viewType,
      provider,
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
        supportsMultipleEditorsPerDocument: false,
      },
    );
    return providerRegistration;
  }

  get onDidChangeCustomDocument(): vscode.Event<vscode.CustomDocumentEditEvent> {
    return this._onDidChangeCustomDocument.event;
  }

  async openCustomDocument(
    uri: vscode.Uri,
    openContext: vscode.CustomDocumentOpenContext,
    token: vscode.CancellationToken,
  ): Promise<vscode.CustomDocument> {
    const document = new WpsDocument(uri);
    return document;
  }

  async resolveCustomEditor(
    document: vscode.CustomDocument,
    webviewPanel: vscode.WebviewPanel,
    token: vscode.CancellationToken,
  ): Promise<void> {
    // 设置 webview 内容
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    webviewPanel.webview.html = this.getHtmlContent(webviewPanel.webview);

    // 加载文档
    await this.loadDocument(document.uri, webviewPanel.webview);

    // 监听保存
    webviewPanel.onDidDispose(() => {
      // 清理临时文件
      this.converter.cleanupTempFiles(document.uri.fsPath);
    });

    // 监听来自 webview 的消息
    webviewPanel.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case "save":
          await this.saveDocument(document, message.content, webviewPanel);
          break;
        case "preview":
          // 切换回预览模式
          await vscode.commands.executeCommand(
            "vscode.openWith",
            document.uri,
            "wpsEditor.preview",
          );
          break;
      }
    });
  }

  private async loadDocument(
    uri: vscode.Uri,
    webview: vscode.Webview,
  ): Promise<void> {
    const filePath = uri.fsPath;
    const format = this.converter.detectFormat(filePath);

    // 转换为 HTML 用于编辑
    const result = await this.converter.convertToHTML(filePath);

    if (result.success && result.outputBuffer) {
      const htmlContent = result.outputBuffer.toString("utf-8");
      webview.postMessage({
        type: "html",
        data: htmlContent,
      });
    } else {
      webview.postMessage({
        type: "error",
        message: result.error || "加载文档失败",
      });
    }
  }

  private async saveDocument(
    document: vscode.CustomDocument,
    htmlContent: string,
    webviewPanel: vscode.WebviewPanel,
  ): Promise<void> {
    const filePath = document.uri.fsPath;
    const format = this.converter.detectFormat(filePath);

    if (!format) {
      webviewPanel.webview.postMessage({
        type: "error",
        message: "无法识别文档格式",
      });
      return;
    }

    // 创建临时 HTML 文件
    const tempHtmlPath = this.converter.getTempPath(filePath, ".html");
    const fs = require("fs");
    fs.writeFileSync(tempHtmlPath, htmlContent);

    // 转换回原格式
    const result = await this.converter.convertFromHTML(
      tempHtmlPath,
      filePath,
      format,
    );

    // 清理临时文件
    fs.unlinkSync(tempHtmlPath);

    if (result.success) {
      webviewPanel.webview.postMessage({
        type: "success",
        message: "文档已保存",
      });

      // 重新加载文档
      await this.loadDocument(document.uri, webviewPanel.webview);
    } else {
      webviewPanel.webview.postMessage({
        type: "error",
        message: result.error || "保存失败",
      });
    }
  }

  async saveCustomDocument(
    document: vscode.CustomDocument,
    cancellation: vscode.CancellationToken,
  ): Promise<void> {
    // 自定义保存逻辑
  }

  async saveCustomDocumentAs(
    document: vscode.CustomDocument,
    destination: vscode.Uri,
    cancellation: vscode.CancellationToken,
  ): Promise<void> {
    // 另存为逻辑
  }

  revertCustomDocument(
    document: vscode.CustomDocument,
    cancellation: vscode.CancellationToken,
  ): Promise<void> {
    return Promise.resolve();
  }

  backupCustomDocument(
    document: vscode.CustomDocument,
    context: vscode.CustomDocumentBackupContext,
    cancellation: vscode.CancellationToken,
  ): Promise<vscode.CustomDocumentBackup> {
    return Promise.reject("Not implemented");
  }

  private getHtmlContent(webview: vscode.Webview): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WPS 编辑</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: var(--vscode-font-family);
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      padding: 20px;
      overflow-y: auto;
    }
    
    .container {
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .toolbar {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      padding: 10px;
      background-color: var(--vscode-toolbar-activeBackground);
      border-radius: 4px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .toolbar button {
      padding: 8px 16px;
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 2px;
      cursor: pointer;
      font-size: 13px;
    }
    
    .toolbar button:hover {
      background-color: var(--vscode-button-hoverBackground);
    }
    
    .editor-container {
      background-color: var(--vscode-editor-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      padding: 20px;
      min-height: 500px;
    }
    
    #editor {
      width: 100%;
      min-height: 400px;
      padding: 20px;
      background-color: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      font-size: 14px;
      line-height: 1.6;
      outline: none;
    }
    
    #editor:focus {
      border-color: var(--vscode-focusBorder);
    }
    
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      gap: 15px;
    }
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--vscode-progressBar-background);
      border-top-color: var(--vscode-button-background);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .error, .success {
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 15px;
    }
    
    .error {
      background-color: var(--vscode-inputValidation-errorBackground);
      border: 1px solid var(--vscode-inputValidation-errorBorder);
      color: var(--vscode-errorForeground);
    }
    
    .success {
      background-color: var(--vscode-inputValidation-infoBackground);
      border: 1px solid var(--vscode-inputValidation-infoBorder);
      color: var(--vscode-foreground);
    }
    
    .notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 15px 25px;
      border-radius: 4px;
      animation: slideIn 0.3s ease-out;
      z-index: 1000;
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="toolbar">
      <button id="save-btn">保存</button>
      <button id="preview-btn">预览模式</button>
      <button id="format-bold"><b>B</b></button>
      <button id="format-italic"><i>I</i></button>
      <button id="format-underline"><u>U</u></button>
      <select id="format-heading">
        <option value="">格式</option>
        <option value="h1">标题 1</option>
        <option value="h2">标题 2</option>
        <option value="h3">标题 3</option>
        <option value="p">正文</option>
      </select>
    </div>
    
    <div class="editor-container">
      <div id="editor" contenteditable="true">
        <div class="loading">
          <div class="loading-spinner"></div>
          <div>正在加载文档...</div>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    const editor = document.getElementById('editor');
    const vscode = acquireVsCodeApi();
    
    // 监听来自扩展的消息
    window.addEventListener('message', event => {
      const message = event.data;
      if (message.type === 'html') {
        loadHTML(message.data);
      } else if (message.type === 'error') {
        showNotification(message.message, 'error');
      } else if (message.type === 'success') {
        showNotification(message.message, 'success');
      }
    });
    
    function loadHTML(htmlContent) {
      // 清理 HTML 内容，只保留正文
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const body = doc.body.innerHTML;
      editor.innerHTML = body || '<p>开始编辑...</p>';
    }
    
    function showNotification(message, type) {
      const notification = document.createElement('div');
      notification.className = 'notification ' + type;
      notification.textContent = message;
      notification.style.backgroundColor = type === 'error' 
        ? 'var(--vscode-inputValidation-errorBackground)' 
        : 'var(--vscode-inputValidation-infoBackground)';
      notification.style.border = '1px solid var(--vscode-inputValidation-' + 
        (type === 'error' ? 'errorBorder' : 'infoBorder') + ')';
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
    
    // 工具栏功能
    document.getElementById('save-btn').addEventListener('click', () => {
      vscode.postMessage({
        type: 'save',
        content: '<html><body>' + editor.innerHTML + '</body></html>'
      });
    });
    
    document.getElementById('preview-btn').addEventListener('click', () => {
      vscode.postMessage({ type: 'preview' });
    });
    
    // 格式化命令
    document.getElementById('format-bold').addEventListener('click', () => {
      document.execCommand('bold', false, null);
    });
    
    document.getElementById('format-italic').addEventListener('click', () => {
      document.execCommand('italic', false, null);
    });
    
    document.getElementById('format-underline').addEventListener('click', () => {
      document.execCommand('underline', false, null);
    });
    
    document.getElementById('format-heading').addEventListener('change', (e) => {
      const format = e.target.value;
      if (format) {
        document.execCommand('formatBlock', false, format);
        e.target.value = '';
      }
    });
    
    // 自动保存（可选）
    let saveTimeout;
    editor.addEventListener('input', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        // 可以添加自动保存逻辑
      }, 5000);
    });
  </script>
</body>
</html>`;
  }
}

// WPS 文档类
class WpsDocument implements vscode.CustomDocument {
  constructor(private readonly _uri: vscode.Uri) {}

  get uri(): vscode.Uri {
    return this._uri;
  }

  dispose(): void {
    // 清理资源
  }
}
