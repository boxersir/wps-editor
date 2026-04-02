import * as vscode from "vscode";
import * as path from "path";
import { SmartConverter } from "../services/smartConverter";

export class WpsPreviewProvider implements vscode.CustomEditorProvider {
  public static readonly viewType = "wpsEditor.preview";
  private converter: SmartConverter;
  private _currentPanel: vscode.WebviewPanel | undefined;
  private readonly _onDidChangeCustomDocument =
    new vscode.EventEmitter<vscode.CustomDocumentEditEvent>();

  constructor(private readonly context: vscode.ExtensionContext) {
    this.converter = new SmartConverter();
  }

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new WpsPreviewProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      WpsPreviewProvider.viewType,
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
    this._currentPanel = webviewPanel;

    // 设置 webview 内容
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this.context.extensionUri,
        vscode.Uri.joinPath(this.context.extensionUri, "out"),
      ],
    };

    webviewPanel.webview.html = this.getHtmlContent(webviewPanel.webview);

    // 加载文档
    await this.loadDocument(document.uri, webviewPanel.webview);

    // 监听来自 webview 的消息
    webviewPanel.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case "edit":
          // 切换到编辑器模式
          await vscode.commands.executeCommand(
            "vscode.openWith",
            document.uri,
            "wpsEditor.editor",
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

    console.log("预览加载文档:", filePath, "格式:", format);

    if (!this.converter.isWpsFormat(format)) {
      webview.postMessage({
        type: "error",
        message: "不支持的文档格式",
      });
      return;
    }

    try {
      // 对于 Office Open XML 格式（.docx, .xlsx），直接转换为 HTML
      if (format === ".docx" || format === ".xlsx") {
        console.log("使用 HTML 转换:", format);
        const result = await this.converter.convertToHTML(filePath);

        console.log("HTML 转换结果:", result);

        if (result.success && result.output) {
          webview.postMessage({
            type: "html",
            data: result.output,
            engine: result.engine,
          });
        } else {
          webview.postMessage({
            type: "error",
            message: result.error || "HTML 转换失败",
          });
        }
      } else {
        console.log("使用 PDF 转换:", format);
        // 其他格式转换为 PDF
        const result = await this.converter.convertToPDF(filePath);

        if (result.success && result.outputBuffer) {
          // 将 PDF 转换为 base64
          const pdfBase64 = result.outputBuffer.toString("base64");
          webview.postMessage({
            type: "pdf",
            data: pdfBase64,
          });
        } else {
          webview.postMessage({
            type: "error",
            message: result.error || "PDF 转换失败",
          });
        }
      }
    } catch (error: any) {
      console.error("加载文档错误:", error);
      webview.postMessage({
        type: "error",
        message: error.message || "转换失败",
      });
    }
  }

  async saveCustomDocument(
    document: vscode.CustomDocument,
    cancellation: vscode.CancellationToken,
  ): Promise<void> {
    // 预览模式不支持保存
  }

  async saveCustomDocumentAs(
    document: vscode.CustomDocument,
    destination: vscode.Uri,
    cancellation: vscode.CancellationToken,
  ): Promise<void> {
    // 预览模式不支持另存为
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
    // 获取 PDF.js 的 CDN 地址
    const pdfJsCdn =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    const pdfJsWorkerCdn =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WPS 预览</title>
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
    
    .toolbar button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .toolbar select {
      padding: 8px;
      background-color: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 2px;
    }
    
    #pdf-container {
      background-color: var(--vscode-editor-background);
      min-height: 500px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 20px;
    }
    
    .pdf-page {
      background-color: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      max-width: 100%;
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
    
    .error {
      padding: 20px;
      background-color: var(--vscode-inputValidation-errorBackground);
      border: 1px solid var(--vscode-inputValidation-errorBorder);
      border-radius: 4px;
      color: var(--vscode-errorForeground);
    }
    
    .error {
      padding: 20px;
      background-color: var(--vscode-inputValidation-errorBackground);
      border: 1px solid var(--vscode-inputValidation-errorBorder);
      border-radius: 4px;
      color: var(--vscode-errorForeground);
    }
    
    .page-info {
      margin-top: 10px;
      font-size: 13px;
      color: var(--vscode-descriptionForeground);
    }
    
    #html-container {
      background-color: var(--vscode-editor-background);
      min-height: 500px;
      padding: 20px;
    }
    
    #html-content {
      background-color: white;
      padding: 40px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      max-width: 1000px;
      margin: 0 auto;
      color: #333;
    }
    
    .engine-info {
      margin-top: 10px;
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="toolbar">
      <button id="prev-page" disabled>上一页</button>
      <button id="next-page" disabled>下一页</button>
      <select id="zoom-level">
        <option value="0.5">50%</option>
        <option value="0.75">75%</option>
        <option value="1" selected>100%</option>
        <option value="1.25">125%</option>
        <option value="1.5">150%</option>
        <option value="2">200%</option>
      </select>
      <button id="edit-mode">编辑模式</button>
      <span id="page-info" class="page-info"></span>
    </div>
    
    <div id="pdf-container" style="display: none;">
      <div class="loading">
        <div class="loading-spinner"></div>
        <div>正在加载文档...</div>
      </div>
    </div>
    
    <div id="html-container" style="display: none;">
      <div id="html-content"></div>
      <div id="engine-info" class="engine-info"></div>
    </div>
  </div>
  
  <script>
    const pdfJsWorkerSrc = '${pdfJsWorkerCdn}';
    let pdfjsLib = null;
    
    // 动态加载 PDF.js
    const script = document.createElement('script');
    script.src = '${pdfJsCdn}';
    script.onload = () => {
      pdfjsLib = window.pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfJsWorkerSrc;
      }
      initPDFViewer();
    };
    script.onerror = () => {
      console.error('PDF.js 加载失败');
      // PDF.js 加载失败，但仍然可以显示 HTML
      initPDFViewer();
    };
    document.head.appendChild(script);
    
    let pdfDoc = null;
    let currentPage = 1;
    let currentScale = 1;
    let pageRendering = false;
    let pageNumPending = null;
    
    function initPDFViewer() {
      // 页面导航
      document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage <= 1) return;
        currentPage--;
        renderPage(currentPage);
      });
      
      document.getElementById('next-page').addEventListener('click', () => {
        if (currentPage >= pdfDoc.numPages) return;
        currentPage++;
        renderPage(currentPage);
      });
      
      // 缩放控制
      document.getElementById('zoom-level').addEventListener('change', (e) => {
        currentScale = parseFloat(e.target.value);
        renderPage(currentPage);
      });
      
      // 编辑模式
      document.getElementById('edit-mode').addEventListener('click', () => {
        vscode.postMessage({ type: 'edit' });
      });
      
      // 监听来自扩展的消息
      window.addEventListener('message', event => {
        const message = event.data;
        if (message.type === 'pdf') {
          showPDFViewer();
          loadPDF(message.data);
        } else if (message.type === 'html') {
          showHTMLViewer(message.data, message.engine);
        } else if (message.type === 'error') {
          showError(message.message);
        }
      });
    }
    
    function showPDFViewer() {
      document.getElementById('pdf-container').style.display = 'flex';
      document.getElementById('html-container').style.display = 'none';
      
      // 启用 PDF 导航按钮
      document.getElementById('prev-page').disabled = false;
      document.getElementById('next-page').disabled = false;
      document.getElementById('zoom-level').disabled = false;
    }
    
    function showHTMLViewer(htmlContent, engine) {
      document.getElementById('pdf-container').style.display = 'none';
      document.getElementById('html-container').style.display = 'block';
      
      // 禁用 PDF 导航按钮（HTML 模式不需要）
      document.getElementById('prev-page').disabled = true;
      document.getElementById('next-page').disabled = true;
      document.getElementById('zoom-level').disabled = true;
      
      const htmlContentDiv = document.getElementById('html-content');
      htmlContentDiv.innerHTML = htmlContent;
      
      const engineInfo = document.getElementById('engine-info');
      if (engine === 'javascript') {
        engineInfo.textContent = '使用 JavaScript 引擎渲染（无需 LibreOffice）';
      } else {
        engineInfo.textContent = '使用 LibreOffice 引擎渲染';
      }
    }
    
    async function loadPDF(base64Data) {
      try {
        const pdfData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
        
        document.getElementById('page-info').textContent = \`共 \${pdfDoc.numPages} 页\`;
        updateNavigationButtons();
        currentPage = 1;
        renderPage(currentPage);
      } catch (error) {
        showError('加载 PDF 失败：' + error.message);
      }
    }
    
    function renderPage(num) {
      if (pageRendering) {
        pageNumPending = num;
        return;
      }
      
      pageRendering = true;
      
      pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale: currentScale });
        const container = document.getElementById('pdf-container');
        
        // 创建 canvas
        const canvas = document.createElement('canvas');
        canvas.className = 'pdf-page';
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        page.render(renderContext).promise.then(() => {
          pageRendering = false;
          
          // 替换加载中的内容
          container.innerHTML = '';
          container.appendChild(canvas);
          
          if (pageNumPending !== null) {
            renderPage(pageNumPending);
            pageNumPending = null;
          }
        });
      });
    }
    
    function updateNavigationButtons() {
      const prevBtn = document.getElementById('prev-page');
      const nextBtn = document.getElementById('next-page');
      
      prevBtn.disabled = currentPage <= 1;
      nextBtn.disabled = currentPage >= pdfDoc.numPages;
    }
    
    function showError(message) {
      const container = document.getElementById('pdf-container');
      container.innerHTML = \`<div class="error">\${message}</div>\`;
    }
    
    // VSCode API
    const vscode = acquireVsCodeApi();
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
