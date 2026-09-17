---
layout: default
title: "控制 Matter 设备，或向 Matter 提供自己的设备"
lang: zh-CN
section: index
---

使用 **Controller** 控制真实 Matter 设备。使用 **Bridge** 将 KNX 设备或 Node-RED 流程中的值提供给 Matter 应用。两者方向不同，请按需求选择。

节点直接使用 Node-RED 消息：`msg.topic` 标识功能，`msg.payload` 提供数值。无需安装 KNX Ultimate。

## 安装

此公开测试版向所有人开放。通过 **管理节点面板 → 安装** 安装本包，然后重启 Node-RED。也可以在 Node-RED 用户目录（通常为 `~/.node-red`）中执行以下命令。需要 Node.js 20.18.1 或更高版本及 Node-RED 3.1.1 或更高版本。只有需要 KNX 集成时才安装 `node-red-contrib-knx-ultimate`。

```sh
npm install node-red-contrib-matter-ultimate
```

## 使用 Node-RED 消息

启用输入/输出端口，在命令和状态字段中填写 topic 名称。将 KNX 网关留空；此时不需要 DPT，因此相应字段会隐藏。命令和状态应使用不同的 topic。名称必须精确匹配，不支持通配符。

## KNX 模式

> **本包也可以与 KNX Ultimate 配合使用。** 集成为原生功能：安装 `node-red-contrib-knx-ultimate` 并选择其网关，即可启用 **KNX 模式**。同一组映射字段将使用组地址和 DPT，并提供已导入 ETS 项目的地址建议。命令和状态直接通过总线传输，这些映射无需额外的 Function 节点。

| 设置 | Node-RED 消息 | KNX 模式 |
| --- | --- | --- |
| KNX 网关 | 留空 | 选择已有网关 |
| 映射字段 | 精确匹配的 topic，例如 `living-room/on` | 组地址，例如 `1/1/1` |
| DPT | 隐藏且不使用 | 选择正确的数据点类型 |
| 命令与状态 | 通过 `msg.topic` 和 `msg.payload` | 通过 KNX 总线 |

选择网关时，请将已保存的 topic 替换为实际组地址，并选择正确的 DPT。已选择的网关离线时，节点仍保持 KNX 模式。要恢复使用 Node-RED 消息，请清空网关并重新配置 topic。

## 迁移现有流程

先备份完整的 Node-RED 用户目录。保留 **KNX Ultimate 7**，安装新包并重启。选择 **Back up and convert**，检查流程并点击 **Deploy**，然后再升级到 KNX Ultimate 8。节点 ID、连线和配置引用会保留。下载的 JSON 不包含受保护的凭据或 Matter 配对数据。

请保留同一 Node-RED 用户目录，不要删除 `knxultimatestorage/matter`，其中保存配对身份及 fabric。不要仅为迁移而重置或重新配对设备。流程 JSON 导出不包含这些数据。
