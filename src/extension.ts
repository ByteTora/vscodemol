// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	console.log('Molecule Viewer extension is now active!');

	// 注册自定义编辑器提供程序
	const provider = new MoleculeEditorProvider(context);
	
	context.subscriptions.push(
		vscode.window.registerCustomEditorProvider('molViewer.mol', provider, {
			webviewOptions: { retainContextWhenHidden: true }
		}),
		vscode.window.registerCustomEditorProvider('molViewer.sdf', provider, {
			webviewOptions: { retainContextWhenHidden: true }
		}),
		vscode.window.registerCustomEditorProvider('molViewer.smi', provider, {
			webviewOptions: { retainContextWhenHidden: true }
		}),
		vscode.window.registerCustomEditorProvider('molViewer.mol2', provider, {
			webviewOptions: { retainContextWhenHidden: true }
		})
	);
}

interface MoleculeDocument extends vscode.CustomDocument {
	uri: vscode.Uri;
	content: string;
}

class MoleculeEditorProvider implements vscode.CustomEditorProvider<MoleculeDocument> {
	private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<vscode.CustomDocumentEditEvent<MoleculeDocument>>();
	public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;

	constructor(
		private readonly context: vscode.ExtensionContext
	) { }

	async openCustomDocument(
		uri: vscode.Uri,
		_openContext: vscode.CustomDocumentOpenContext,
		_token: vscode.CancellationToken
	): Promise<MoleculeDocument> {
		const content = (await vscode.workspace.fs.readFile(uri)).toString();
		return {
			uri,
			content,
			dispose: () => { }
		};
	}

	async resolveCustomEditor(
		document: MoleculeDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		webviewPanel.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.file(path.join(this.context.extensionPath, 'media'))
			]
		};

		const htmlPath = vscode.Uri.file(
			path.join(this.context.extensionPath, 'media', 'viewer.html')
		);
		
		let html = await vscode.workspace.fs.readFile(htmlPath);
		const htmlContent = html.toString().replace(
			/#{webview.cspSource}/g,
			webviewPanel.webview.cspSource
		);

		webviewPanel.webview.html = htmlContent;

		const updateWebview = async () => {
			const format = document.uri.fsPath.split('.').pop()?.toLowerCase() || 'mol';
			webviewPanel.webview.postMessage({
				type: 'updateContent',
				content: document.content,
				format: format
			});
		};

		webviewPanel.webview.onDidReceiveMessage(
			message => {
				switch (message.type) {
					case 'debug':
						console.log('[Debug]', message.message);
						break;
				}
			}
		);

		updateWebview();
	}

	saveCustomDocument(document: MoleculeDocument): Thenable<void> {
		return Promise.resolve();
	}

	saveCustomDocumentAs(document: MoleculeDocument, destination: vscode.Uri): Thenable<void> {
		return Promise.resolve();
	}

	revertCustomDocument(document: MoleculeDocument): Thenable<void> {
		return Promise.resolve();
	}

	backupCustomDocument(document: MoleculeDocument, context: vscode.CustomDocumentBackupContext): Thenable<vscode.CustomDocumentBackup> {
		return Promise.resolve({
			id: context.destination.toString(),
			delete: () => { }
		});
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
