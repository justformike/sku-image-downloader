export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 处理根路径，返回HTML页面
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(htmlContent, {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Cache-Control': 'public, max-age=3600',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'SAMEORIGIN',
        },
      });
    }
    
    // 404 处理
    return new Response('Not Found', { status: 404 });
  },
};

// HTML内容
const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SKU图片批量下载工具</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>
    <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary: #2563eb;
            --primary-dark: #1e40af;
            --secondary: #8b5cf6;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --bg-main: #0f172a;
            --bg-card: #1e293b;
            --bg-hover: #334155;
            --text-primary: #f1f5f9;
            --text-secondary: #94a3b8;
            --border: #334155;
            --shadow: rgba(0, 0, 0, 0.3);
        }

        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: var(--text-primary);
            min-height: 100vh;
            padding: 20px;
            overflow-x: hidden;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 40px 20px;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(37, 99, 235, 0.3);
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .header h1 {
            font-size: 3em;
            font-weight: 700;
            margin-bottom: 12px;
            position: relative;
            z-index: 1;
            text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .header p {
            font-size: 1.1em;
            opacity: 0.95;
            position: relative;
            z-index: 1;
        }

        .browser-warning {
            background: linear-gradient(135deg, var(--warning), #dc2626);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
            animation: slideDown 0.4s ease-out;
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .card {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 24px;
            border: 1px solid var(--border);
            box-shadow: 0 10px 40px var(--shadow);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 50px var(--shadow);
        }

        .card h2 {
            font-size: 1.5em;
            margin-bottom: 24px;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .card h2::before {
            content: '';
            width: 4px;
            height: 24px;
            background: linear-gradient(180deg, var(--primary), var(--secondary));
            border-radius: 2px;
        }

        .tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 24px;
            background: var(--bg-main);
            padding: 6px;
            border-radius: 12px;
        }

        .tab {
            flex: 1;
            padding: 12px 24px;
            border: none;
            background: transparent;
            color: var(--text-secondary);
            font-family: inherit;
            font-size: 1em;
            font-weight: 500;
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.3s ease;
        }

        .tab.active {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }

        .tab:hover:not(.active) {
            background: var(--bg-hover);
            color: var(--text-primary);
        }

        .upload-area {
            border: 2px dashed var(--border);
            border-radius: 12px;
            padding: 48px 24px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: var(--bg-main);
        }

        .upload-area:hover {
            border-color: var(--primary);
            background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(139, 92, 246, 0.1));
            transform: scale(1.02);
        }

        .upload-area.drag-over {
            border-color: var(--primary);
            background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(139, 92, 246, 0.2));
            transform: scale(1.05);
        }

        .upload-icon {
            font-size: 4em;
            margin-bottom: 16px;
            opacity: 0.6;
        }

        .textarea-input {
            width: 100%;
            min-height: 200px;
            padding: 16px;
            background: var(--bg-main);
            border: 1px solid var(--border);
            border-radius: 12px;
            color: var(--text-primary);
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.95em;
            resize: vertical;
            transition: all 0.3s ease;
        }

        .textarea-input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
        }

        .input-group {
            margin-bottom: 20px;
        }

        .input-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--text-secondary);
        }

        .input-group input,
        .input-group select {
            width: 100%;
            padding: 12px 16px;
            background: var(--bg-main);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: var(--text-primary);
            font-family: inherit;
            font-size: 1em;
            transition: all 0.3s ease;
        }

        .input-group input:focus,
        .input-group select:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
        }

        .input-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        .btn {
            padding: 14px 32px;
            border: none;
            border-radius: 12px;
            font-family: inherit;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            justify-content: center;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
        }

        .btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(37, 99, 235, 0.5);
        }

        .btn-secondary {
            background: var(--bg-hover);
            color: var(--text-primary);
        }

        .btn-secondary:hover:not(:disabled) {
            background: var(--border);
        }

        .btn-danger {
            background: var(--danger);
            color: white;
        }

        .btn-danger:hover:not(:disabled) {
            background: #dc2626;
        }

        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .btn-group {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        .preview-section {
            background: var(--bg-main);
            border-radius: 12px;
            padding: 20px;
            margin-top: 24px;
        }

        .preview-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
        }

        .stat-card {
            background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(139, 92, 246, 0.1));
            padding: 20px;
            border-radius: 12px;
            border: 1px solid var(--border);
        }

        .stat-value {
            font-size: 2em;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 4px;
        }

        .stat-label {
            color: var(--text-secondary);
            font-size: 0.95em;
        }

        .progress-section {
            margin-top: 24px;
        }

        .progress-bar-container {
            width: 100%;
            height: 40px;
            background: var(--bg-main);
            border-radius: 20px;
            overflow: hidden;
            margin-bottom: 12px;
            position: relative;
            box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            transition: width 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .progress-bar::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.3),
                transparent
            );
            animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }

        .progress-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-weight: 600;
            color: white;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
            z-index: 1;
        }

        .task-list {
            max-height: 400px;
            overflow-y: auto;
            margin-top: 20px;
        }

        .task-item {
            background: var(--bg-main);
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-left: 3px solid transparent;
            transition: all 0.3s ease;
        }

        .task-item:hover {
            background: var(--bg-hover);
        }

        .task-item.pending {
            border-left-color: var(--text-secondary);
        }

        .task-item.downloading {
            border-left-color: var(--primary);
            background: linear-gradient(90deg, var(--bg-main), rgba(37, 99, 235, 0.1));
        }

        .task-item.success {
            border-left-color: var(--success);
        }

        .task-item.failed {
            border-left-color: var(--danger);
        }

        .task-status {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .task-status.pending {
            background: var(--text-secondary);
        }

        .task-status.downloading {
            background: var(--primary);
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }

        .task-status.success {
            background: var(--success);
        }

        .task-status.failed {
            background: var(--danger);
        }

        .task-info {
            flex: 1;
        }

        .task-sku {
            font-weight: 600;
            font-family: 'JetBrains Mono', monospace;
            color: var(--text-primary);
            margin-bottom: 4px;
        }

        .task-url {
            font-size: 0.85em;
            color: var(--text-secondary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .task-error {
            color: var(--danger);
            font-size: 0.85em;
            margin-top: 4px;
        }

        .summary-section {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(37, 99, 235, 0.1));
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            margin-top: 24px;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }

        .summary-item {
            text-align: center;
        }

        .summary-value {
            font-size: 2.5em;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .summary-value.success {
            color: var(--success);
        }

        .summary-value.failed {
            color: var(--danger);
        }

        .summary-value.total {
            color: var(--primary);
        }

        .error-log {
            background: var(--bg-main);
            border-radius: 8px;
            padding: 16px;
            max-height: 300px;
            overflow-y: auto;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9em;
        }

        .error-item {
            padding: 8px;
            margin-bottom: 8px;
            background: rgba(239, 68, 68, 0.1);
            border-left: 3px solid var(--danger);
            border-radius: 4px;
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }

        ::-webkit-scrollbar-track {
            background: var(--bg-main);
            border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb {
            background: var(--border);
            border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--primary);
        }

        .hidden {
            display: none;
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 2em;
            }

            .card {
                padding: 20px;
            }

            .input-row {
                grid-template-columns: 1fr;
            }

            .btn-group {
                flex-direction: column;
            }

            .btn {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect, useRef } = React;

        // Language translations
        const translations = {
            zh: {
                title: "SKU图片批量下载工具",
                subtitle: "高效批量下载商品图片，自动按SKU分类整理",
                browserWarning: "浏览器兼容性提示：",
                browserWarningText: "本工具需要使用 File System Access API。请使用最新版本的",
                browserWarningOr: "或",
                browserWarningEnd: "浏览器以获得最佳体验。",
                dataInput: "数据输入",
                fileUpload: "文件上传",
                textPaste: "文本粘贴",
                clickOrDrag: "点击选择文件或拖拽文件到此处",
                selectedFile: "已选择：",
                supportedFormats: "支持 CSV, XLS, XLSX 格式",
                pasteData: "粘贴数据（第一行为表头）",
                placeholder: "SKU    URL1    URL2    URL3\nA123    https://example.com/img1.jpg    https://example.com/img2.jpg    https://example.com/img3.jpg\nB456    https://example.com/img4.jpg    https://example.com/img5.jpg    https://example.com/img6.jpg",
                delimiter: "数据分隔符",
                delimiterTab: "制表符 (Tab)",
                delimiterComma: "逗号 (,)",
                delimiterSemicolon: "分号 (;)",
                delimiterPipe: "竖线 (|)",
                parseData: "解析数据",
                skuColumn: "SKU 列名",
                skuPlaceholder: "例如: SKU, 商品编号",
                urlColumn: "URL 列名（支持多列）",
                urlPlaceholder: "例如: URL (自动识别 URL1, URL2...)",
                urlHint: "💡 自动识别同名多列：URL, URL1, URL2 或 URL_1, URL_2",
                dataPreview: "数据预览",
                skuCount: "SKU 数量",
                imageCount: "图片总数",
                avgImages: "平均图片/SKU",
                downloadControl: "下载控制",
                startDownload: "▶️ 开始下载",
                pause: "⏸️ 暂停",
                resume: "▶️ 继续",
                cancel: "⏹️ 取消任务",
                reset: "🔄 重置全部",
                completed: "已完成",
                taskList: "任务列表",
                downloadComplete: "下载完成",
                totalTasks: "总任务数",
                success: "成功",
                failed: "失败",
                errorLog: "错误日志",
                exportErrorLog: "💾 导出错误日志",
                errorSKU: "SKU:",
                errorURL: "URL:",
                errorReason: "错误:",
                language: "语言"
            },
            en: {
                title: "SKU Image Batch Downloader",
                subtitle: "Efficiently download product images in bulk, automatically organized by SKU",
                browserWarning: "Browser Compatibility Notice:",
                browserWarningText: "This tool requires the File System Access API. Please use the latest version of",
                browserWarningOr: "or",
                browserWarningEnd: "browser for the best experience.",
                dataInput: "Data Input",
                fileUpload: "File Upload",
                textPaste: "Text Paste",
                clickOrDrag: "Click to select file or drag file here",
                selectedFile: "Selected:",
                supportedFormats: "Supports CSV, XLS, XLSX formats",
                pasteData: "Paste Data (First row as header)",
                placeholder: "SKU    URL1    URL2    URL3\nA123    https://example.com/img1.jpg    https://example.com/img2.jpg    https://example.com/img3.jpg\nB456    https://example.com/img4.jpg    https://example.com/img5.jpg    https://example.com/img6.jpg",
                delimiter: "Data Delimiter",
                delimiterTab: "Tab",
                delimiterComma: "Comma (,)",
                delimiterSemicolon: "Semicolon (;)",
                delimiterPipe: "Pipe (|)",
                parseData: "Parse Data",
                skuColumn: "SKU Column Name",
                skuPlaceholder: "e.g.: SKU, Product Code",
                urlColumn: "URL Column Name (Multiple Supported)",
                urlPlaceholder: "e.g.: URL (auto-detect URL1, URL2...)",
                urlHint: "💡 Auto-detect multiple columns: URL, URL1, URL2 or URL_1, URL_2",
                dataPreview: "Data Preview",
                skuCount: "SKU Count",
                imageCount: "Total Images",
                avgImages: "Avg Images/SKU",
                downloadControl: "Download Control",
                startDownload: "▶️ Start Download",
                pause: "⏸️ Pause",
                resume: "▶️ Resume",
                cancel: "⏹️ Cancel Task",
                reset: "🔄 Reset All",
                completed: "Completed",
                taskList: "Task List",
                downloadComplete: "Download Complete",
                totalTasks: "Total Tasks",
                success: "Success",
                failed: "Failed",
                errorLog: "Error Log",
                exportErrorLog: "💾 Export Error Log",
                errorSKU: "SKU:",
                errorURL: "URL:",
                errorReason: "Error:",
                language: "Language"
            },
            es: {
                title: "Herramienta de Descarga Masiva de Imágenes SKU",
                subtitle: "Descargue eficientemente imágenes de productos en lotes, organizadas automáticamente por SKU",
                browserWarning: "Aviso de Compatibilidad del Navegador:",
                browserWarningText: "Esta herramienta requiere la API de acceso al sistema de archivos. Por favor, utilice la última versión de",
                browserWarningOr: "o",
                browserWarningEnd: "navegador para obtener la mejor experiencia.",
                dataInput: "Entrada de Datos",
                fileUpload: "Subir Archivo",
                textPaste: "Pegar Texto",
                clickOrDrag: "Haga clic para seleccionar archivo o arrastre archivo aquí",
                selectedFile: "Seleccionado:",
                supportedFormats: "Soporta formatos CSV, XLS, XLSX",
                pasteData: "Pegar Datos (Primera fila como encabezado)",
                placeholder: "SKU    URL1    URL2    URL3\nA123    https://example.com/img1.jpg    https://example.com/img2.jpg    https://example.com/img3.jpg\nB456    https://example.com/img4.jpg    https://example.com/img5.jpg    https://example.com/img6.jpg",
                delimiter: "Delimitador de Datos",
                delimiterTab: "Tabulación (Tab)",
                delimiterComma: "Coma (,)",
                delimiterSemicolon: "Punto y coma (;)",
                delimiterPipe: "Barra vertical (|)",
                parseData: "Analizar Datos",
                skuColumn: "Nombre de Columna SKU",
                skuPlaceholder: "ej.: SKU, Código de Producto",
                urlColumn: "Nombre de Columna URL (Múltiples Soportadas)",
                urlPlaceholder: "ej.: URL (detecta automáticamente URL1, URL2...)",
                urlHint: "💡 Detección automática de múltiples columnas: URL, URL1, URL2 o URL_1, URL_2",
                dataPreview: "Vista Previa de Datos",
                skuCount: "Cantidad de SKU",
                imageCount: "Total de Imágenes",
                avgImages: "Prom. Imágenes/SKU",
                downloadControl: "Control de Descarga",
                startDownload: "▶️ Iniciar Descarga",
                pause: "⏸️ Pausar",
                resume: "▶️ Continuar",
                cancel: "⏹️ Cancelar Tarea",
                reset: "🔄 Restablecer Todo",
                completed: "Completado",
                taskList: "Lista de Tareas",
                downloadComplete: "Descarga Completa",
                totalTasks: "Tareas Totales",
                success: "Éxito",
                failed: "Fallido",
                errorLog: "Registro de Errores",
                exportErrorLog: "💾 Exportar Registro de Errores",
                errorSKU: "SKU:",
                errorURL: "URL:",
                errorReason: "Error:",
                language: "Idioma"
            }
        };

        function App() {
            const [language, setLanguage] = useState('zh');
            const [activeTab, setActiveTab] = useState('file');
            const [file, setFile] = useState(null);
            const [textData, setTextData] = useState('');
            const [delimiter, setDelimiter] = useState('tab');
            const [skuColumn, setSkuColumn] = useState('SKU');
            const [urlColumn, setUrlColumn] = useState('URL');
            const [parsedData, setParsedData] = useState(null);
            const [isDownloading, setIsDownloading] = useState(false);
            const [isPaused, setIsPaused] = useState(false);
            const [tasks, setTasks] = useState([]);
            const [progress, setProgress] = useState(0);
            const [summary, setSummary] = useState(null);
            const [showBrowserWarning, setShowBrowserWarning] = useState(false);
            
            const fileInputRef = useRef(null);
            const downloadHandleRef = useRef(null);
            const pausedRef = useRef(false);

            const t = translations[language];

            // Alert messages translations
            const alerts = {
                zh: {
                    parseError: '解析失败',
                    excelParseError: 'Excel解析失败',
                    enterData: '请输入数据',
                    uploadFirst: '请先上传并解析数据',
                    browserNotSupported: '您的浏览器不支持 File System Access API。请使用最新版本的 Chrome 或 Edge 浏览器。',
                    downloadError: '下载过程出错'
                },
                en: {
                    parseError: 'Parse failed',
                    excelParseError: 'Excel parse failed',
                    enterData: 'Please enter data',
                    uploadFirst: 'Please upload and parse data first',
                    browserNotSupported: 'Your browser does not support the File System Access API. Please use the latest version of Chrome or Edge browser.',
                    downloadError: 'Error during download process'
                },
                es: {
                    parseError: 'Error de análisis',
                    excelParseError: 'Error de análisis de Excel',
                    enterData: 'Por favor, ingrese datos',
                    uploadFirst: 'Por favor, cargue y analice los datos primero',
                    browserNotSupported: 'Su navegador no admite la API de acceso al sistema de archivos. Por favor, utilice la última versión del navegador Chrome o Edge.',
                    downloadError: 'Error durante el proceso de descarga'
                }
            };

            const msg = alerts[language];

            useEffect(() => {
                // Check if File System Access API is supported
                if (!('showDirectoryPicker' in window)) {
                    setShowBrowserWarning(true);
                }
            }, []);

            const handleFileUpload = (e) => {
                const uploadedFile = e.target.files[0];
                if (uploadedFile) {
                    setFile(uploadedFile);
                    parseFile(uploadedFile);
                }
            };

            const handleDragOver = (e) => {
                e.preventDefault();
                e.currentTarget.classList.add('drag-over');
            };

            const handleDragLeave = (e) => {
                e.currentTarget.classList.remove('drag-over');
            };

            const handleDrop = (e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('drag-over');
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile) {
                    setFile(droppedFile);
                    parseFile(droppedFile);
                }
            };

            const parseFile = async (file) => {
                const fileName = file.name.toLowerCase();
                
                if (fileName.endsWith('.csv')) {
                    Papa.parse(file, {
                        header: true,
                        complete: (results) => {
                            processData(results.data);
                        },
                        error: (error) => {
                            alert(msg.parseError + ': ' + error.message);
                        }
                    });
                } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const data = new Uint8Array(e.target.result);
                            const workbook = XLSX.read(data, { type: 'array' });
                            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                            processData(jsonData);
                        } catch (error) {
                            alert(msg.excelParseError + ': ' + error.message);
                        }
                    };
                    reader.readAsArrayBuffer(file);
                }
            };

            const handleTextParse = () => {
                if (!textData.trim()) {
                    alert(msg.enterData);
                    return;
                }

                const delimiters = {
                    'tab': '\t',
                    'comma': ',',
                    'semicolon': ';',
                    'pipe': '|'
                };

                const sep = delimiters[delimiter];
                const lines = textData.trim().split('\n');
                const headers = lines[0].split(sep).map(h => h.trim());
                
                const data = lines.slice(1).map(line => {
                    const values = line.split(sep);
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = values[index]?.trim() || '';
                    });
                    return obj;
                });

                processData(data);
            };

            const processData = (data) => {
                // Group by SKU - support multiple URL columns
                const grouped = {};
                
                data.forEach(row => {
                    const sku = row[skuColumn];
                    
                    if (!sku) return;
                    
                    if (!grouped[sku]) {
                        grouped[sku] = [];
                    }
                    
                    // Check for multiple URL columns
                    // Support patterns like: URL, URL1, URL2, URL3 or 图片1, 图片2, 图片3
                    const urlColumns = Object.keys(row).filter(key => {
                        const keyLower = key.toLowerCase();
                        const urlColumnLower = urlColumn.toLowerCase();
                        
                        // Exact match
                        if (key === urlColumn) return true;
                        
                        // Pattern match: URL1, URL2, etc.
                        if (keyLower.startsWith(urlColumnLower) && /\d*$/.test(key)) return true;
                        
                        // Pattern match: URL_1, URL_2, etc.
                        if (keyLower.startsWith(urlColumnLower + '_')) return true;
                        
                        return false;
                    });
                    
                    // Sort columns to maintain order (URL, URL1, URL2, ...)
                    urlColumns.sort((a, b) => {
                        const aNum = parseInt(a.replace(/\D/g, '') || '0');
                        const bNum = parseInt(b.replace(/\D/g, '') || '0');
                        return aNum - bNum;
                    });
                    
                    // Add all URLs from matched columns
                    urlColumns.forEach(col => {
                        const url = row[col]?.trim();
                        if (url && url.startsWith('http')) {
                            grouped[sku].push(url);
                        }
                    });
                    
                    // If no URL columns found, try the specified column only
                    if (urlColumns.length === 0 && row[urlColumn]) {
                        const url = row[urlColumn].trim();
                        if (url && url.startsWith('http')) {
                            grouped[sku].push(url);
                        }
                    }
                });

                const totalImages = Object.values(grouped).reduce((sum, urls) => sum + urls.length, 0);
                
                setParsedData({
                    grouped,
                    skuCount: Object.keys(grouped).length,
                    imageCount: totalImages
                });

                // Create task list
                const taskList = [];
                Object.entries(grouped).forEach(([sku, urls]) => {
                    urls.forEach((url, index) => {
                        taskList.push({
                            id: sku + "_" + index,
                            sku,
                            url,
                            index,
                            status: 'pending',
                            error: null
                        });
                    });
                });
                setTasks(taskList);
            };

            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            const downloadImage = async (url) => {
                const response = await fetch(url, {
                    mode: 'cors',
                    cache: 'no-cache'
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                return await response.blob();
            };

            const getFileExtension = (url) => {
                const match = url.match(/\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i);
                return match ? match[1].toLowerCase() : 'jpg';
            };

            const startDownload = async () => {
                if (!parsedData) {
                    alert(msg.uploadFirst);
                    return;
                }

                if (!('showDirectoryPicker' in window)) {
                    alert(msg.browserNotSupported);
                    return;
                }

                try {
                    // Request directory access
                    const dirHandle = await window.showDirectoryPicker({
                        mode: 'readwrite'
                    });
                    downloadHandleRef.current = dirHandle;

                    setIsDownloading(true);
                    setIsPaused(false);
                    pausedRef.current = false;
                    setSummary(null);

                    let successCount = 0;
                    let failedCount = 0;
                    const errors = [];

                    for (let i = 0; i < tasks.length; i++) {
                        if (pausedRef.current) {
                            break;
                        }

                        const task = tasks[i];
                        
                        // Update task status to downloading
                        setTasks(prev => prev.map((t, idx) => 
                            idx === i ? { ...t, status: 'downloading' } : t
                        ));

                        try {
                            // Create SKU folder if not exists
                            let skuFolderHandle;
                            try {
                                skuFolderHandle = await dirHandle.getDirectoryHandle(task.sku, { create: true });
                            } catch (error) {
                                throw new Error('无法创建文件夹: ' + error.message);
                            }

                            // Download image
                            const blob = await downloadImage(task.url);
                            const ext = getFileExtension(task.url);
                            const fileName = `${task.sku}_${String(task.index + 1).padStart(2, '0')}.${ext}`;

                            // Write file
                            const fileHandle = await skuFolderHandle.getFileHandle(fileName, { create: true });
                            const writable = await fileHandle.createWritable();
                            await writable.write(blob);
                            await writable.close();

                            // Update task status to success
                            setTasks(prev => prev.map((t, idx) => 
                                idx === i ? { ...t, status: 'success' } : t
                            ));
                            successCount++;

                        } catch (error) {
                            // Update task status to failed
                            setTasks(prev => prev.map((t, idx) => 
                                idx === i ? { ...t, status: 'failed', error: error.message } : t
                            ));
                            failedCount++;
                            errors.push({
                                sku: task.sku,
                                url: task.url,
                                error: error.message
                            });
                        }

                        // Update progress
                        setProgress(((i + 1) / tasks.length) * 100);

                        // Small delay to prevent overwhelming the browser
                        await delay(100);
                    }

                    setIsDownloading(false);
                    setSummary({
                        total: tasks.length,
                        success: successCount,
                        failed: failedCount,
                        errors
                    });

                } catch (error) {
                    alert(msg.downloadError + ': ' + error.message);
                    setIsDownloading(false);
                }
            };

            const pauseDownload = () => {
                pausedRef.current = true;
                setIsPaused(true);
            };

            const resumeDownload = () => {
                pausedRef.current = false;
                setIsPaused(false);
                continueDownload();
            };

            const continueDownload = async () => {
                if (!downloadHandleRef.current) return;

                setIsDownloading(true);
                let successCount = tasks.filter(t => t.status === 'success').length;
                let failedCount = tasks.filter(t => t.status === 'failed').length;
                const errors = tasks.filter(t => t.status === 'failed').map(t => ({
                    sku: t.sku,
                    url: t.url,
                    error: t.error
                }));

                const startIndex = tasks.findIndex(t => t.status === 'pending' || t.status === 'downloading');
                if (startIndex === -1) {
                    setIsDownloading(false);
                    return;
                }

                for (let i = startIndex; i < tasks.length; i++) {
                    if (pausedRef.current) {
                        break;
                    }

                    const task = tasks[i];
                    if (task.status !== 'pending' && task.status !== 'downloading') {
                        continue;
                    }

                    setTasks(prev => prev.map((t, idx) => 
                        idx === i ? { ...t, status: 'downloading' } : t
                    ));

                    try {
                        let skuFolderHandle;
                        try {
                            skuFolderHandle = await downloadHandleRef.current.getDirectoryHandle(task.sku, { create: true });
                        } catch (error) {
                            throw new Error('无法创建文件夹: ' + error.message);
                        }

                        const blob = await downloadImage(task.url);
                        const ext = getFileExtension(task.url);
                        const fileName = `${task.sku}_${String(task.index + 1).padStart(2, '0')}.${ext}`;

                        const fileHandle = await skuFolderHandle.getFileHandle(fileName, { create: true });
                        const writable = await fileHandle.createWritable();
                        await writable.write(blob);
                        await writable.close();

                        setTasks(prev => prev.map((t, idx) => 
                            idx === i ? { ...t, status: 'success' } : t
                        ));
                        successCount++;

                    } catch (error) {
                        setTasks(prev => prev.map((t, idx) => 
                            idx === i ? { ...t, status: 'failed', error: error.message } : t
                        ));
                        failedCount++;
                        errors.push({
                            sku: task.sku,
                            url: task.url,
                            error: error.message
                        });
                    }

                    setProgress(((i + 1) / tasks.length) * 100);
                    await delay(100);
                }

                setIsDownloading(false);
                setSummary({
                    total: tasks.length,
                    success: successCount,
                    failed: failedCount,
                    errors
                });
            };

            const cancelDownload = () => {
                pausedRef.current = true;
                setIsDownloading(false);
                setIsPaused(false);
                setProgress(0);
            };

            const resetAll = () => {
                setFile(null);
                setTextData('');
                setParsedData(null);
                setTasks([]);
                setProgress(0);
                setSummary(null);
                setIsDownloading(false);
                setIsPaused(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            };

            const exportErrorLog = () => {
                if (!summary || summary.errors.length === 0) return;

                const headers = language === 'zh' ? ['SKU', 'URL', '错误原因'] 
                    : language === 'en' ? ['SKU', 'URL', 'Error Reason']
                    : ['SKU', 'URL', 'Razón del Error'];

                const csvContent = [
                    headers,
                    ...summary.errors.map(e => [e.sku, e.url, e.error])
                ].map(row => row.join(',')).join('\n');

                const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `error_log_${new Date().getTime()}.csv`;
                link.click();
            };

            return (
                <div className="container">
                    <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '20px'}}>
                        <div style={{
                            background: 'var(--bg-card)',
                            borderRadius: '12px',
                            padding: '8px',
                            display: 'flex',
                            gap: '8px',
                            border: '1px solid var(--border)',
                            boxShadow: '0 4px 12px var(--shadow)'
                        }}>
                            <span style={{
                                padding: '8px 16px',
                                color: 'var(--text-secondary)',
                                fontSize: '0.9em',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                🌐 {t.language}
                            </span>
                            <button
                                className={`tab ${language === 'zh' ? 'active' : ''}`}
                                onClick={() => setLanguage('zh')}
                                style={{padding: '8px 16px', fontSize: '0.9em'}}
                            >
                                中文
                            </button>
                            <button
                                className={`tab ${language === 'en' ? 'active' : ''}`}
                                onClick={() => setLanguage('en')}
                                style={{padding: '8px 16px', fontSize: '0.9em'}}
                            >
                                English
                            </button>
                            <button
                                className={`tab ${language === 'es' ? 'active' : ''}`}
                                onClick={() => setLanguage('es')}
                                style={{padding: '8px 16px', fontSize: '0.9em'}}
                            >
                                Español
                            </button>
                        </div>
                    </div>

                    <div className="header">
                        <h1>{t.title}</h1>
                        <p>{t.subtitle}</p>
                    </div>

                    {showBrowserWarning && (
                        <div className="browser-warning">
                            <span style={{fontSize: '1.5em'}}>⚠️</span>
                            <div>
                                <strong>{t.browserWarning}</strong> {t.browserWarningText} <strong>Chrome</strong> {t.browserWarningOr} <strong>Microsoft Edge</strong> {t.browserWarningEnd}
                            </div>
                        </div>
                    )}

                    <div className="card">
                        <h2>📁 {t.dataInput}</h2>
                        
                        <div className="tabs">
                            <button 
                                className={`tab ${activeTab === 'file' ? 'active' : ''}`}
                                onClick={() => setActiveTab('file')}
                            >
                                📄 {t.fileUpload}
                            </button>
                            <button 
                                className={`tab ${activeTab === 'text' ? 'active' : ''}`}
                                onClick={() => setActiveTab('text')}
                            >
                                📝 {t.textPaste}
                            </button>
                        </div>

                        {activeTab === 'file' ? (
                            <div>
                                <div 
                                    className="upload-area"
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <div className="upload-icon">📤</div>
                                    <div style={{fontSize: '1.1em', marginBottom: '8px'}}>
                                        {file ? `${t.selectedFile} ${file.name}` : t.clickOrDrag}
                                    </div>
                                    <div style={{fontSize: '0.9em', color: 'var(--text-secondary)'}}>
                                        {t.supportedFormats}
                                    </div>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.xls,.xlsx"
                                    onChange={handleFileUpload}
                                    style={{display: 'none'}}
                                />
                            </div>
                        ) : (
                            <div>
                                <div className="input-group">
                                    <label>{t.pasteData}</label>
                                    <textarea
                                        className="textarea-input"
                                        value={textData}
                                        onChange={(e) => setTextData(e.target.value)}
                                        placeholder={t.placeholder}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>{t.delimiter}</label>
                                    <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)}>
                                        <option value="tab">{t.delimiterTab}</option>
                                        <option value="comma">{t.delimiterComma}</option>
                                        <option value="semicolon">{t.delimiterSemicolon}</option>
                                        <option value="pipe">{t.delimiterPipe}</option>
                                    </select>
                                </div>
                                <button className="btn btn-primary" onClick={handleTextParse}>
                                    {t.parseData}
                                </button>
                            </div>
                        )}

                        <div className="input-row" style={{marginTop: '24px'}}>
                            <div className="input-group">
                                <label>{t.skuColumn}</label>
                                <input
                                    type="text"
                                    value={skuColumn}
                                    onChange={(e) => setSkuColumn(e.target.value)}
                                    placeholder={t.skuPlaceholder}
                                />
                            </div>
                            <div className="input-group">
                                <label>{t.urlColumn}</label>
                                <input
                                    type="text"
                                    value={urlColumn}
                                    onChange={(e) => setUrlColumn(e.target.value)}
                                    placeholder={t.urlPlaceholder}
                                />
                                <div style={{fontSize: '0.85em', color: 'var(--text-secondary)', marginTop: '4px'}}>
                                    {t.urlHint}
                                </div>
                            </div>
                        </div>

                        {parsedData && (
                            <div className="preview-section">
                                <h3 style={{marginBottom: '16px', color: 'var(--text-primary)'}}>📊 {t.dataPreview}</h3>
                                <div className="preview-stats">
                                    <div className="stat-card">
                                        <div className="stat-value">{parsedData.skuCount}</div>
                                        <div className="stat-label">{t.skuCount}</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">{parsedData.imageCount}</div>
                                        <div className="stat-label">{t.imageCount}</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-value">
                                            {(parsedData.imageCount / parsedData.skuCount).toFixed(1)}
                                        </div>
                                        <div className="stat-label">{t.avgImages}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {parsedData && (
                        <div className="card">
                            <h2>🚀 {t.downloadControl}</h2>
                            <div className="btn-group">
                                {!isDownloading && !isPaused && (
                                    <button 
                                        className="btn btn-primary"
                                        onClick={startDownload}
                                    >
                                        {t.startDownload}
                                    </button>
                                )}
                                {isDownloading && !isPaused && (
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={pauseDownload}
                                    >
                                        {t.pause}
                                    </button>
                                )}
                                {isPaused && (
                                    <button 
                                        className="btn btn-primary"
                                        onClick={resumeDownload}
                                    >
                                        {t.resume}
                                    </button>
                                )}
                                <button 
                                    className="btn btn-danger"
                                    onClick={cancelDownload}
                                    disabled={!isDownloading && !isPaused}
                                >
                                    {t.cancel}
                                </button>
                                <button 
                                    className="btn btn-secondary"
                                    onClick={resetAll}
                                    disabled={isDownloading}
                                >
                                    {t.reset}
                                </button>
                            </div>

                            {(isDownloading || isPaused || summary) && (
                                <div className="progress-section">
                                    <div className="progress-bar-container">
                                        <div className="progress-bar" style={{width: `${progress}%`}}>
                                        </div>
                                        <div className="progress-text">
                                            {progress.toFixed(1)}%
                                        </div>
                                    </div>
                                    <div style={{textAlign: 'center', color: 'var(--text-secondary)'}}>
                                        {tasks.filter(t => t.status === 'success').length} / {tasks.length} {t.completed}
                                    </div>
                                </div>
                            )}

                            {tasks.length > 0 && (
                                <div className="task-list">
                                    <h3 style={{marginBottom: '16px', color: 'var(--text-primary)'}}>📋 {t.taskList}</h3>
                                    {tasks.map((task, index) => (
                                        <div key={task.id} className={`task-item ${task.status}`}>
                                            <div className={`task-status ${task.status}`}></div>
                                            <div className="task-info">
                                                <div className="task-sku">{task.sku}</div>
                                                <div className="task-url">{task.url}</div>
                                                {task.error && (
                                                    <div className="task-error">❌ {task.error}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {summary && (
                        <div className="card">
                            <h2>✅ {t.downloadComplete}</h2>
                            <div className="summary-section">
                                <div className="summary-grid">
                                    <div className="summary-item">
                                        <div className="summary-value total">{summary.total}</div>
                                        <div className="stat-label">{t.totalTasks}</div>
                                    </div>
                                    <div className="summary-item">
                                        <div className="summary-value success">{summary.success}</div>
                                        <div className="stat-label">{t.success}</div>
                                    </div>
                                    <div className="summary-item">
                                        <div className="summary-value failed">{summary.failed}</div>
                                        <div className="stat-label">{t.failed}</div>
                                    </div>
                                </div>

                                {summary.errors.length > 0 && (
                                    <div>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                                            <h3 style={{color: 'var(--text-primary)'}}>❌ {t.errorLog}</h3>
                                            <button className="btn btn-secondary" onClick={exportErrorLog}>
                                                {t.exportErrorLog}
                                            </button>
                                        </div>
                                        <div className="error-log">
                                            {summary.errors.map((error, index) => (
                                                <div key={index} className="error-item">
                                                    <div><strong>{t.errorSKU}</strong> {error.sku}</div>
                                                    <div><strong>{t.errorURL}</strong> {error.url}</div>
                                                    <div><strong>{t.errorReason}</strong> {error.error}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>`;
