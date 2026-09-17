---
layout: default
title: "节点"
lang: zh-CN
section: nodes
---

编辑器中的名称可能随语言变化。下文说明各节点的用途。

## Matter Controller 配置

从 Controller 节点创建配置，保存并部署。重新打开配置，使用设备的 Matter 设置码或二维码进行配对。然后在 Controller 节点选择已配对设备及端点。多个节点可共享同一配置。

## Matter Controller

选择已配对设备及其端点。编辑器会显示支持的开关、亮度、窗帘、温控或传感器功能。启用端口并填写命令和状态的 topic。

对于灯具，配置亮度命令 topic 后，发送 `msg.topic = "living-room/brightness"` 和 `msg.payload = 60`。状态 topic 输出设备反馈。其他设备类型应使用编辑器列出的功能。

## Matter Bridge 配置

创建桥接器配置，保存并部署。重新打开配置以显示配对二维码/设置码，然后在 Matter 应用中添加桥接器。共用此配置的设备节点会成为桥接器下的设备。

## Matter Bridge 设备

选择桥接器配置和设备类型，然后启用端口。**状态 topic** 的输入消息更新虚拟设备；Matter 应用命令从输出端口以**命令 topic** 发出。在 **KNX 模式**下，应用命令写入命令组地址，KNX 状态组地址更新应用。

例如，发送 `msg.topic = "living-room/light/status"`、`msg.payload = true` 表示灯已开启。应用命令会以 `msg.topic = "living-room/light/command"` 和布尔 payload 输出。将其连接到真实设备逻辑，再返回已确认的状态。

## 消息与数值

开关使用布尔值 `true` / `false`；亮度使用 0–100 的数字；色温使用开尔文。Controller 的状态消息在 `msg.topic` 中包含配置的 topic，在 `msg.payload` 中包含值。还可能输出 RAW 事件；如只需要映射状态，请按 `msg.topic` 筛选。

## KNX 模式

**本包也可以与 KNX Ultimate 配合使用。** 集成为原生功能：安装 `node-red-contrib-knx-ultimate` 并选择其网关，即可启用 **KNX 模式**。同一组映射字段将使用组地址和 DPT，并提供已导入 ETS 项目的地址建议。命令和状态直接通过总线传输，这些映射无需额外的 Function 节点。

[示例]({{ "/zh-CN/examples.html" | relative_url }})
