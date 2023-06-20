// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { marked } from "marked";
import * as fs from "node:fs";
import { debounce } from "lodash";
import { translate } from "my-translator";

const webViewMap: Map<vscode.Uri, vscode.WebviewPanel> = new Map();

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
      // 获得当前打开的文档
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor) {
        // 获取当前文档的内容
        const content = activeEditor.document.getText();
        // 活跃的文档
        const document = activeEditor.document;

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

        // 保存当前markdown文件对应侧边栏的webview
        webViewMap.set(document.uri, panel);

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
            ${marked.parse(content)}
          </body>
          <script>
            const bodyEl = document.body;
            window.addEventListener("message", (e) => {
              if (e.data.type === "update-html") {
                bodyEl.innerHTML = e.data.content;
              }
            })     
          </script>
        </html>
			  `;

        // 下面的监听是会监听到插件起作用的所有文件

        // 监听某个文档内容变化
        let changeDisposabe = vscode.workspace.onDidChangeTextDocument((e) => {
          if (e.document === document) {
            // console.log("修改的文件：", e.document.fileName);
            if (isMarkdownFile(e.document.fileName)) {
              // console.log("markdown: ", e.document.fileName);
              // 当前修改的是markdown文件
              debounceUpdate(document.uri, document);
            }
          }
        });
        // 清理注册函数
        context.subscriptions.push(changeDisposabe);

        // 监听当前workspace中某个文件保存
        let saveDisposable = vscode.workspace.onDidSaveTextDocument(
          (document) => {
            if (isMarkdownFile(document.fileName)) {
              // 保存的文件是markdown文件
              // 更新markdown文件到预览webview中
              update(document.uri, document);
            }
          }
        );
        // 注册清理函数
        context.subscriptions.push(saveDisposable);
      }
    }
  );

  // 注册命令的清理函数
  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

/**
 * 判断某一文件是否是markdown见闻
 * @param fileName 文件名称
 * @returns
 */
function isMarkdownFile(fileName: string) {
  if (fileName.endsWith(".md")) {
    let content = fs.readFileSync(fileName, "utf-8");
    // 判断Markdown文件的内容特征，例如文件头部的标识符
    if (
      content.startsWith("#") ||
      content.startsWith("---") ||
      content.includes("title:") ||
      content.includes("-")
    ) {
      return true;
    }
  }
  return false;
}

async function update(uri: vscode.Uri, document: vscode.TextDocument) {
  const panel = webViewMap.get(uri);
  if (panel) {
    // 文档中的内容，此处是markdown
    const text = document.getText();
    // const html = marked.parse(text);
    try {
      const res = await translate(
        // @ts-ignore
        { type: "md", data: text },
        "Chinese",
        "English"
      );
      console.log("翻译后的mk: ", res);
    } catch (err) {
      console.log("err ", err);
    }

    const html = await marked(text, { mangle: false });
    panel.webview.postMessage({
      type: "update-html",
      content: html,
    });
  }
}

const debounceUpdate = debounce(update, 100);
