"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
function activate(context) {
    console.log('Molecule Viewer extension is now active!');
    // 注册自定义编辑器提供程序
    const provider = new MoleculeEditorProvider(context);
    context.subscriptions.push(vscode.window.registerCustomEditorProvider('molViewer.mol', provider, {
        webviewOptions: { retainContextWhenHidden: true }
    }), vscode.window.registerCustomEditorProvider('molViewer.sdf', provider, {
        webviewOptions: { retainContextWhenHidden: true }
    }), vscode.window.registerCustomEditorProvider('molViewer.smi', provider, {
        webviewOptions: { retainContextWhenHidden: true }
    }), vscode.window.registerCustomEditorProvider('molViewer.mol2', provider, {
        webviewOptions: { retainContextWhenHidden: true }
    }));
}
class MoleculeEditorProvider {
    context;
    _onDidChangeCustomDocument = new vscode.EventEmitter();
    onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;
    constructor(context) {
        this.context = context;
    }
    async openCustomDocument(uri, _openContext, _token) {
        const content = (await vscode.workspace.fs.readFile(uri)).toString();
        return {
            uri,
            content,
            dispose: () => { }
        };
    }
    async resolveCustomEditor(document, webviewPanel, _token) {
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(this.context.extensionPath, 'media'))
            ]
        };
        const htmlPath = vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'viewer.html'));
        let html = await vscode.workspace.fs.readFile(htmlPath);
        const htmlContent = html.toString().replace(/#{webview.cspSource}/g, webviewPanel.webview.cspSource);
        webviewPanel.webview.html = htmlContent;
        const updateWebview = async () => {
            const format = document.uri.fsPath.split('.').pop()?.toLowerCase() || 'mol';
            webviewPanel.webview.postMessage({
                type: 'updateContent',
                content: document.content,
                format: format
            });
        };
        webviewPanel.webview.onDidReceiveMessage(message => {
            switch (message.type) {
                case 'debug':
                    console.log('[Debug]', message.message);
                    break;
            }
        });
        updateWebview();
    }
    saveCustomDocument(document) {
        return Promise.resolve();
    }
    saveCustomDocumentAs(document, destination) {
        return Promise.resolve();
    }
    revertCustomDocument(document) {
        return Promise.resolve();
    }
    backupCustomDocument(document, context) {
        return Promise.resolve({
            id: context.destination.toString(),
            delete: () => { }
        });
    }
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map