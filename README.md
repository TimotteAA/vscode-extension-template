## vscode 插件开发

vscode 类似于 electron，给开发者提供了 webview（渲染进程）与插件本事（也许能理解成主进程），命令的注册是通过 package.json 中的 contributes 配置项。
比如：

```json
  "contributes": {
    "commands": [
      {
        "command": "timotte.translation",
        "title": "Translate Markdown File"
      }
    ]
  },
```

此处注册了一个命令：timotte.translation，而 title 则是 vscode command panel 中让注册插件时传的回调生效的命令名词。
其次，还有 activedEvents 配置，表示插件生效的事件：

```json
  "activationEvents": [
    "onLanguage:markdown",
    "onCommand:timotte.translation"
  ],
```

此处表示当插件为 markdown 文件，且执行注册命令时生效。

## todo

1. 调试插件开发，在 md 文件保存与修改时做到自动更新
2. 研究下 markdown 解析的第三方库
# vscode-extension-template
