// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as marked from "marked";

const test = () => {
  // The code you place here will be executed every time your command is executed
  // Display a message box to the user
  vscode.window.showInformationMessage("插件打开后就会显示我😊");
  const panel = vscode.window.createWebviewPanel(
    "catCoding",
    "Cat Coding",
    vscode.ViewColumn.One,
    {
      retainContextWhenHidden: true, // 保证 Webview 所在页面进入后台时不被释放
      enableScripts: true, // 运行 JS 执行
    }
  );
  panel.webview.html = getWebviewContent();
  // 向webview发消息
  panel.webview.postMessage({ text: "I'm VSCode extension" });

  // 监听webview的消息
  panel.webview.onDidReceiveMessage((data) => {
    console.log(data.text);
  });
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "helloworld" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  // 注册命令
  let disposable = vscode.commands.registerCommand(
    "timotte.translation",
    () => {
      // vscode.window.showInformationMessage(
      //   "打开文件的路径" + vscode?.window?.activeTextEditor?.document.uri
      // );
      // 获得当前打开的文档
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor) {
        // 获取当前文档的内容
        const content = activeEditor.document.getText();

        // 创建新的Webview面板
        const panel = vscode.window.createWebviewPanel(
          "timotte-markdownPreview",
          "Markdown Translation",
          vscode.ViewColumn.Beside,
          {
            enableScripts: true, // 允许在webview中执行js
            retainContextWhenHidden: true, // 进入后台时webview内容不被释放
          }
        );

        // 将Markdown内容设置为Webview面板的HTMl
        panel.webview.html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MarkDown文件预览</title>
            <style>
              body {
                padding: 20px;
              }
            </style>
          </head>
          <body>
            <hr />
            ${marked.parse(content)}
          </body>
        </html>
			`;
      }
    }
  );

  // 注册命令的清理函数
  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function getWebviewContent() {
  return `<!DOCTYPE html>
	  <html lang="en">
		<head>
		  <meta charset="UTF-8">
		  <meta name="viewport" content="width=device-width, initial-scale=1.0">
		  <title>Cat Coding</title>
		</head>
		<body>
		  <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
		  <p id="test"></p>
		  <script>
			window.addEventListener('message', e => {
			  document.getElementById('test').innerHTML = e.data.text;
			});
			const vscode = acquireVsCodeApi();
			vscode.postMessage({
			  text: "I'm Webview"
			});
		  </script>
		</body>
	  </html>`;
}
