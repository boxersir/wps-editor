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

    if (process.env.NODE_ENV === "development") {
      console.log("加载文档:", filePath, "格式:", format);
    }

    // 转换为 HTML 用于编辑
    const result = await this.converter.convertToHTML(filePath);

    if (process.env.NODE_ENV === "development") {
      console.log("转换结果:", result);
    }

    if (result.success && result.output) {
      webview.postMessage({
        type: "html",
        data: result.output,
        format: format,
        engine: result.engine,
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
      overflow: hidden;
    }
    
    .container {
      max-width: 1000px;
      margin: 0 auto;
      height: calc(100vh - 120px);
      display: flex;
      flex-direction: column;
    }
    
    .toolbar {
      display: flex;
      gap: 8px;
      margin-bottom: 15px;
      padding: 12px;
      background-color: var(--vscode-toolbar-activeBackground);
      border-radius: 4px;
      flex-wrap: wrap;
      align-items: center;
    }
    
    .toolbar button, .toolbar select {
      padding: 8px 12px;
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 2px;
      cursor: pointer;
      font-size: 13px;
      height: 32px;
    }
    
    .toolbar button:hover {
      background-color: var(--vscode-button-hoverBackground);
    }
    
    .toolbar button:active {
      transform: scale(0.98);
    }
    
    .toolbar select {
      background-color: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      color: var(--vscode-input-foreground);
      cursor: pointer;
    }
    
    .toolbar-divider {
      width: 1px;
      height: 24px;
      background-color: var(--vscode-input-border);
      margin: 0 4px;
    }
    
    .editor-wrapper {
      flex: 1;
      background-color: var(--vscode-editor-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      background-color: var(--vscode-statusbar-background);
      border-bottom: 1px solid var(--vscode-input-border);
      font-size: 13px;
    }
    
    .pagination-controls {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .pagination-controls button {
      padding: 4px 12px;
      font-size: 12px;
      height: 28px;
    }
    
    .page-info {
      color: var(--vscode-descriptionForeground);
    }
    
    .editor-container {
      flex: 1;
      overflow-y: auto;
      padding: 0;
    }
    
    #editor {
      width: 100%;
      min-height: 100%;
      padding: 30px;
      background-color: white;
      color: #333;
      outline: none;
      font-size: 14px;
      line-height: 1.6;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    
    #editor:focus {
      background-color: white;
    }
    
    /* 编辑器内容样式 */
    #editor h1, #editor h2, #editor h3, #editor h4, #editor h5, #editor h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }
    
    #editor h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    #editor h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    #editor h3 { font-size: 1.25em; }
    
    #editor p {
      margin-bottom: 1em;
    }
    
    #editor ul, #editor ol {
      margin-bottom: 1em;
      padding-left: 2em;
    }
    
    #editor table {
      border-collapse: collapse;
      margin-bottom: 1em;
      width: 100%;
    }
    
    #editor table th, #editor table td {
      border: 1px solid #dfe2e5;
      padding: 8px 12px;
    }
    
    #editor table th {
      background-color: #f6f8fa;
      font-weight: 600;
    }
    
    #editor img {
      max-width: 100%;
      height: auto;
      margin: 1em 0;
    }
    
    #editor blockquote {
      border-left: 4px solid #dfe2e5;
      padding-left: 1em;
      margin-left: 0;
      color: #6a737d;
      font-style: italic;
    }
    
    #editor pre {
      background-color: #f6f8fa;
      padding: 16px;
      border-radius: 3px;
      overflow: auto;
      margin-bottom: 1em;
    }
    
    #editor code {
      background-color: rgba(27,31,35,0.05);
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: monospace;
      font-size: 85%;
    }
    
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
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
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
    
    .page-break {
      border-top: 2px dashed #ccc;
      margin: 20px 0;
      position: relative;
    }
    
    .page-break::after {
      content: '分页符';
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      background: #f0f0f0;
      padding: 0 10px;
      font-size: 12px;
      color: #999;
    }
    
    .word-count {
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
      margin-left: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="toolbar">
      <button id="save-btn" title="保存 (Ctrl+S)">💾 保存</button>
      <button id="preview-btn" title="预览模式">👁️ 预览</button>
      <div class="toolbar-divider"></div>
      <button id="format-bold" title="加粗 (Ctrl+B)"><b>B</b></button>
      <button id="format-italic" title="斜体 (Ctrl+I)"><i>I</i></button>
      <button id="format-underline" title="下划线 (Ctrl+U)"><u>U</u></button>
      <button id="format-strikethrough" title="删除线"><s>S</s></button>
      <div class="toolbar-divider"></div>
      <select id="format-heading" title="标题样式">
        <option value="">格式</option>
        <option value="h1">标题 1</option>
        <option value="h2">标题 2</option>
        <option value="h3">标题 3</option>
        <option value="p">正文</option>
      </select>
      <select id="format-fontsize" title="字体大小">
        <option value="">大小</option>
        <option value="1">小</option>
        <option value="3">正常</option>
        <option value="5">大</option>
        <option value="7">超大</option>
      </select>
      <div class="toolbar-divider"></div>
      <button id="format-align-left" title="左对齐">⬅️</button>
      <button id="format-align-center" title="居中">⬛</button>
      <button id="format-align-right" title="右对齐">➡️</button>
      <div class="toolbar-divider"></div>
      <button id="format-list-ul" title="无序列表">• 列表</button>
      <button id="format-list-ol" title="有序列表">1. 列表</button>
      <div class="toolbar-divider"></div>
      <button id="format-indent" title="增加缩进">→</button>
      <button id="format-outdent" title="减少缩进">←</button>
      <div class="toolbar-divider"></div>
      <button id="insert-link" title="插入链接">🔗 链接</button>
      <button id="insert-image" title="插入图片">🖼️ 图片</button>
      <div class="toolbar-divider"></div>
      <button id="insert-page-break" title="插入分页符">📄 分页符</button>
      <span class="word-count" id="word-count">字数：0</span>
    </div>
    
    <div class="editor-wrapper">
      <div class="pagination-bar">
        <div class="pagination-controls">
          <button id="page-first" title="第一页">⏮️</button>
          <button id="page-prev" title="上一页">◀️</button>
          <span class="page-info" id="page-info">第 1 页 / 共 1 页</span>
          <button id="page-next" title="下一页">▶️</button>
          <button id="page-last" title="最后一页">⏭️</button>
        </div>
        <div>
          <span id="engine-info" style="color: var(--vscode-descriptionForeground); font-size: 12px;"></span>
        </div>
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
  </div>
  
  <script>
    const vscode = acquireVsCodeApi();
    
    let currentPage = 1;
    let totalPages = 1;
    let currentFormat = '';
    let editor = null;
    
    // 确保 DOM 加载完成
    function initEditor() {
      editor = document.getElementById('editor');
      if (!editor) {
        console.error('编辑器元素未找到');
        setTimeout(initEditor, 100);
        return;
      }
      
      console.log('编辑器初始化成功');
      bindEventListeners();
    }
    
    // 绑定所有事件监听器
    function bindEventListeners() {
      // 监听来自扩展的消息
      window.addEventListener('message', event => {
        const message = event.data;
        if (message.type === 'html') {
          loadHTML(message.data, message.format, message.engine);
        } else if (message.type === 'error') {
          showNotification(message.message, 'error');
        } else if (message.type === 'success') {
          showNotification(message.message, 'success');
        }
      });
      
      // 工具栏按钮事件
      const saveBtn = document.getElementById('save-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          console.log('保存按钮点击');
          const content = editor.innerHTML;
          vscode.postMessage({ type: 'save', content: content });
        });
      }
      
      const previewBtn = document.getElementById('preview-btn');
      if (previewBtn) {
        previewBtn.addEventListener('click', () => {
          console.log('预览按钮点击');
          vscode.postMessage({ type: 'preview' });
        });
      }
      
      // 格式化按钮
      const boldBtn = document.getElementById('format-bold');
      if (boldBtn) {
        boldBtn.addEventListener('click', () => execCommand('bold'));
      }
      
      const italicBtn = document.getElementById('format-italic');
      if (italicBtn) {
        italicBtn.addEventListener('click', () => execCommand('italic'));
      }
      
      const underlineBtn = document.getElementById('format-underline');
      if (underlineBtn) {
        underlineBtn.addEventListener('click', () => execCommand('underline'));
      }
      
      const strikethroughBtn = document.getElementById('format-strikethrough');
      if (strikethroughBtn) {
        strikethroughBtn.addEventListener('click', () => execCommand('strikeThrough'));
      }
      
      // 标题格式
      const headingSelect = document.getElementById('format-heading');
      if (headingSelect) {
        headingSelect.addEventListener('change', (e) => {
          const tag = e.target.value;
          if (tag) {
            execCommand('formatBlock', tag);
            e.target.value = '';
          }
        });
      }
      
      // 字体大小
      const fontsizeSelect = document.getElementById('format-fontsize');
      if (fontsizeSelect) {
        fontsizeSelect.addEventListener('change', (e) => {
          const size = e.target.value;
          if (size) {
            execCommand('fontSize', size);
            e.target.value = '';
          }
        });
      }
      
      // 对齐按钮
      const alignLeftBtn = document.getElementById('format-align-left');
      if (alignLeftBtn) {
        alignLeftBtn.addEventListener('click', () => execCommand('justifyLeft'));
      }
      
      const alignCenterBtn = document.getElementById('format-align-center');
      if (alignCenterBtn) {
        alignCenterBtn.addEventListener('click', () => execCommand('justifyCenter'));
      }
      
      const alignRightBtn = document.getElementById('format-align-right');
      if (alignRightBtn) {
        alignRightBtn.addEventListener('click', () => execCommand('justifyRight'));
      }
      
      // 列表按钮
      const listUlBtn = document.getElementById('format-list-ul');
      if (listUlBtn) {
        listUlBtn.addEventListener('click', () => execCommand('insertUnorderedList'));
      }
      
      const listOlBtn = document.getElementById('format-list-ol');
      if (listOlBtn) {
        listOlBtn.addEventListener('click', () => execCommand('insertOrderedList'));
      }
      
      // 缩进按钮
      const indentBtn = document.getElementById('format-indent');
      if (indentBtn) {
        indentBtn.addEventListener('click', () => execCommand('indent'));
      }
      
      const outdentBtn = document.getElementById('format-outdent');
      if (outdentBtn) {
        outdentBtn.addEventListener('click', () => execCommand('outdent'));
      }
      
      // 插入链接
      const insertLinkBtn = document.getElementById('insert-link');
      if (insertLinkBtn) {
        insertLinkBtn.addEventListener('click', () => {
          const url = prompt('请输入链接地址:');
          if (url) {
            execCommand('createLink', url);
          }
        });
      }
      
      // 插入图片
      const insertImageBtn = document.getElementById('insert-image');
      if (insertImageBtn) {
        insertImageBtn.addEventListener('click', () => {
          const url = prompt('请输入图片地址:');
          if (url) {
            execCommand('insertImage', url);
          }
        });
      }
      
      // 插入分页符
      const insertPageBreakBtn = document.getElementById('insert-page-break');
      if (insertPageBreakBtn) {
        insertPageBreakBtn.addEventListener('click', () => {
          execCommand('insertHorizontalRule');
          const hr = editor.querySelector('hr:last-child');
          if (hr) {
            hr.className = 'page-break';
          }
          calculatePagination();
        });
      }
      
      // 分页控制
      const pageFirstBtn = document.getElementById('page-first');
      if (pageFirstBtn) {
        pageFirstBtn.addEventListener('click', () => {
          currentPage = 1;
          updatePageInfo();
          editor.scrollTop = 0;
        });
      }
      
      const pagePrevBtn = document.getElementById('page-prev');
      if (pagePrevBtn) {
        pagePrevBtn.addEventListener('click', () => {
          if (currentPage > 1) {
            currentPage--;
            updatePageInfo();
            const pageHeight = 800;
            editor.scrollTop = (currentPage - 1) * pageHeight;
          }
        });
      }
      
      const pageNextBtn = document.getElementById('page-next');
      if (pageNextBtn) {
        pageNextBtn.addEventListener('click', () => {
          if (currentPage < totalPages) {
            currentPage++;
            updatePageInfo();
            const pageHeight = 800;
            editor.scrollTop = (currentPage - 1) * pageHeight;
          }
        });
      }
      
      const pageLastBtn = document.getElementById('page-last');
      if (pageLastBtn) {
        pageLastBtn.addEventListener('click', () => {
          currentPage = totalPages;
          updatePageInfo();
          editor.scrollTop = editor.scrollHeight;
        });
      }
      
      console.log('所有事件监听器绑定完成');
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initEditor);
    } else {
      initEditor();
    }
    
    function loadHTML(htmlContent, format, engine) {
      currentFormat = format;
      
      console.log('loadHTML 被调用');
      console.log('HTML 内容长度:', htmlContent?.length);
      console.log('编辑器元素:', editor);
      console.log('编辑器 contenteditable:', editor?.contentEditable);
      
      // 显示引擎信息
      const engineInfo = document.getElementById('engine-info');
      if (engineInfo && engine === 'javascript') {
        engineInfo.textContent = '有使用问题联系caixin185';
      } else if (engineInfo) {
        engineInfo.textContent = 'LibreOffice 引擎';
      }
      
      // 清理并加载 HTML 内容
      if (editor) {
        // 确保编辑器可编辑
        editor.contentEditable = 'true';
        editor.removeAttribute('readonly');
        editor.style.pointerEvents = 'auto';
        editor.style.userSelect = 'text';
        
        console.log('设置编辑器可编辑');
        console.log('contentEditable:', editor.contentEditable);
        
        editor.innerHTML = htmlContent || '<p>开始编辑...</p>';
        
        console.log('HTML 内容已设置');
        console.log('编辑器 innerHTML 长度:', editor.innerHTML.length);
        
        // 计算分页
        calculatePagination();
        
        // 更新字数统计
        updateWordCount();
        
        // 监听编辑事件
        editor.addEventListener('input', () => {
          updateWordCount();
        });
        
        // 聚焦编辑器
        editor.focus();
        console.log('编辑器已聚焦');
      } else {
        console.error('编辑器元素不存在，无法加载内容');
      }
    }
    
    function calculatePagination() {
      // 简单的分页计算（基于内容高度）
      if (editor) {
        const editorHeight = editor.scrollHeight;
        const pageHeight = 800; // 每页大约 800px
        totalPages = Math.ceil(editorHeight / pageHeight) || 1;
        updatePageInfo();
      }
    }
    
    function updatePageInfo() {
      const pageInfo = document.getElementById('page-info');
      if (pageInfo) {
        pageInfo.textContent = '第 ' + currentPage + ' 页 / 共 ' + totalPages + ' 页';
        
        // 更新按钮状态
        const pageFirst = document.getElementById('page-first');
        const pagePrev = document.getElementById('page-prev');
        const pageNext = document.getElementById('page-next');
        const pageLast = document.getElementById('page-last');
        
        if (pageFirst) pageFirst.disabled = currentPage <= 1;
        if (pagePrev) pagePrev.disabled = currentPage <= 1;
        if (pageNext) pageNext.disabled = currentPage >= totalPages;
        if (pageLast) pageLast.disabled = currentPage >= totalPages;
      }
    }
    
    function updateWordCount() {
      if (editor) {
        const text = editor.innerText || '';
        const count = text.length;
        const wordCount = document.getElementById('word-count');
        if (wordCount) {
          wordCount.textContent = '字数：' + count;
        }
      }
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
      notification.style.color = type === 'error'
        ? 'var(--vscode-errorForeground)'
        : 'var(--vscode-foreground)';
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
    
    // 格式化命令
    function execCommand(command, value = null) {
      if (editor) {
        document.execCommand(command, false, value);
        editor.focus();
        updateWordCount();
      }
    }
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
