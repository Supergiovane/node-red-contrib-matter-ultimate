---
layout: default
title: "示例"
lang: zh-CN
section: examples
---

## 导入示例

下载下方 JSON，然后选择 **Node-RED 菜单 → 导入 → 选择文件**。阅读 Comment 节点，选择自己的桥接器/控制器和设备，按需设置 KNX 网关，然后部署。示例不含凭据，也不含自动触发的 Inject。完成配置后再手动点击 Inject。

## 灯具：Node-RED 命令

使用 Node-RED 消息开关和调节真实灯具，在 Debug 中查看配置的状态 topic。

<a class="download" download href="{{ "/examples/Matter%20Light%20-%20Topic%20Commands.json" | relative_url }}">下载 JSON</a> [JSON]({{ "/examples/Matter%20Light%20-%20Topic%20Commands.json" | relative_url }})

`examples/Matter Light - Topic Commands.json`

## Bridge：流程中的状态与命令

用 Inject 上报虚拟灯具状态，查看 Matter 应用发来的命令。

<a class="download" download href="{{ "/examples/Matter%20Bridge%20-%20Topic%20State%20and%20Commands.json" | relative_url }}">下载 JSON</a> [JSON]({{ "/examples/Matter%20Bridge%20-%20Topic%20State%20and%20Commands.json" | relative_url }})

`examples/Matter Bridge - Topic State and Commands.json`

## 灯具：原生 KNX

将真实灯具直接连接到 KNX 命令和反馈地址。请选择已有网关。

<a class="download" download href="{{ "/examples/Matter%20Light%20-%20Native%20KNX.json" | relative_url }}">下载 JSON</a> [JSON]({{ "/examples/Matter%20Light%20-%20Native%20KNX.json" | relative_url }})

`examples/Matter Light - Native KNX.json`

## Bridge：原生 KNX

使用独立的命令和状态地址，将 KNX 灯具提供给 Matter。

<a class="download" download href="{{ "/examples/Matter%20Bridge%20-%20Native%20KNX.json" | relative_url }}">下载 JSON</a> [JSON]({{ "/examples/Matter%20Bridge%20-%20Native%20KNX.json" | relative_url }})

`examples/Matter Bridge - Native KNX.json`

## 更多示例

examples 目录还包含其他设备示例。部署前请阅读其中的 Comment 节点。

[Matter Controller - Semantic Flow Input.json]({{ "/examples/Matter%20Controller%20-%20Semantic%20Flow%20Input.json" | relative_url }})
