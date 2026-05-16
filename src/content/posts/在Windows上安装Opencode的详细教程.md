---
title: 在Windows上安装Opencode的详细教程
published: 2026-05-16
description: '从零开始，手把手教你如何在 Windows 系统上安装、配置和使用 Opencode，涵盖多种安装方式、provider 配置、常用命令和进阶技巧'
image: ''
tags: [Opencode, Windows, 安装, AI, 教程]
category: '教程'
draft: false 
lang: 'zh-CN'
---

## 一、Opencode 是什么

Opencode 是一款开源的 AI 编程助手，运行在终端中。它可以理解你的整个代码仓库，帮你写代码、改 Bug、重构、写文档，几乎涵盖所有软件工程任务。与 GitHub Copilot 这类编辑器插件不同，Opencode 是"代理式"的——它能自主调用工具：读文件、搜索代码、执行命令，像一个真正的程序员搭档。

Opencode 支持 75+ 种 LLM 提供商，包括 OpenAI、Anthropic（Claude）、Google Gemini、DeepSeek，以及通过 OpenCode Zen 提供的免费模型。你可以在 Windows、macOS、Linux 上使用它，也可以在浏览器中通过 Web 版访问。

## 二、环境要求

在开始安装之前，确保你的 Windows 系统满足以下要求：

**操作系统：**
- Windows 10 1809（Build 17763）及以上版本
- Windows 11 所有版本
- 建议使用 Windows 11 23H2 或更高版本以获得最佳体验

**硬件要求：**
- CPU：双核及以上（推荐四核）
- 内存：至少 4GB（推荐 8GB 以上）
- 磁盘：至少 500MB 可用空间
- 网络：稳定的互联网连接

**前置依赖：**
- Node.js 20.x 或更高版本（如果使用 npm 安装方式）
- pnpm 9.x 或更高版本（如果使用 pnpm 安装方式）
- Git（用于克隆仓库和版本控制功能）
- PowerShell 7+ 或 Windows Terminal（推荐）

### 2.1 安装 Node.js

如果你选择通过 npm 安装 Opencode，需要先安装 Node.js。访问 [nodejs.org](https://nodejs.org)，下载最新的 LTS 版本（20.x 或更高）。安装时一路点击"Next"即可，建议勾选"自动安装必要的工具"选项。

安装完成后，打开 PowerShell 验证：

```powershell
node --version
npm --version
```

如果正确输出版本号，说明 Node.js 安装成功。

### 2.2 安装 pnpm（可选但推荐）

pnpm 比 npm 更快更省空间。安装完 Node.js 后，在 PowerShell 中运行：

```powershell
npm install -g pnpm
```

验证安装：

```powershell
pnpm --version
```

## 三、安装 Opencode

Opencode 提供多种安装方式，你可以根据自己的喜好选择其中一种。

### 方式一：通过 npm 全局安装（推荐）

这是最简单也最推荐的安装方式。打开 PowerShell（建议以管理员身份运行），执行：

```powershell
npm install -g @opencode-ai/opencode
```

等待安装完成。安装过程中会下载 Opencode 及其依赖，通常需要 1-3 分钟，取决于你的网络速度。

验证安装：

```powershell
opencode --version
```

如果看到版本号输出，说明安装成功。

### 方式二：通过 pnpm 全局安装

如果你已经安装了 pnpm，也可以使用 pnpm 安装：

```powershell
pnpm add -g @opencode-ai/opencode
```

pnpm 的安装速度通常比 npm 更快，因为它的缓存机制更高效。

### 方式三：通过 Winget 安装（Windows 内置包管理器）

Windows 11 和 Windows 10 较新版本自带 winget 包管理器。直接在 PowerShell 中运行：

```powershell
winget install opencode
```

这种方式会自动处理环境变量和路径配置。

### 方式四：直接下载二进制文件

访问 [Opencode 的 GitHub Releases 页面](https://github.com/anomalyco/opencode/releases)，下载 Windows 平台的安装包（通常是 `.exe` 或 `.msi` 格式）。下载后双击安装即可。

这种方式不需要预先安装 Node.js，适合不想在系统上安装 Node 的用户。

## 四、首次运行与配置

### 4.1 启动 Opencode

安装完成后，在 PowerShell 或 Windows Terminal 中输入：

```powershell
opencode
```

首次启动时，你会看到一个欢迎界面。Opencode 会引导你选择 AI 提供商并配置 API Key。

### 4.2 选择提供商

在终端中出现的交互界面中：

1. 输入 `/connect` 命令并回车
2. 你会看到一系列可用的提供商列表
3. 如果你有 DeepSeek API Key，选择 `DeepSeek`
4. 如果没有 API Key，可以选择 `OpenCode Zen`——这是 Opencode 官方提供的模型服务，部分模型免费可用

### 4.3 配置 API Key

**使用 DeepSeek：**
- 访问 [DeepSeek 开发者平台](https://platform.deepseek.com) 注册账号
- 在 API Keys 页面创建一个新的 API Key
- 复制 Key，粘贴到 Opencode 的终端提示中

**使用 OpenCode Zen：**
- Opencode 会打开浏览器跳转到 [opencode.ai/auth](https://opencode.ai/auth) 登录页面
- 使用 GitHub 账号登录
- 获取你的 Zen API Key
- 将 Key 粘贴回终端

### 4.4 选择模型

配置完 API Key 后，Opencode 会列出可用的模型列表。对于 DeepSeek 用户：
- `deepseek-v4-flash`：快速且经济，适合日常编码任务
- `deepseek-v4-pro`：更强推理能力，适合复杂任务

对于 Zen 用户，可以查看所有可用的免费和付费模型，用方向键选择，回车确认。

## 五、高级配置

### 5.1 配置文件的位置

Opencode 的配置文件位于 `~/.config/opencode/opencode.jsonc`（Windows 下对应 `C:\Users\你的用户名\.config\opencode\opencode.jsonc`）。你可以手动编辑这个文件来精细控制 Opencode 的行为。

### 5.2 配置模型和提供商

一个典型的配置文件示例：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "model": "opencode/deepseek-v4-flash-free"
}
```

如果你有自己的 API Key，可以配置自定义提供商：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "model": "deepseek/deepseek-v4-flash",
  "provider": {
    "deepseek": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "DeepSeek",
      "options": {
        "baseURL": "https://api.deepseek.com",
        "apiKey": "你的DeepSeek API Key"
      },
      "models": {
        "deepseek-v4-flash": {
          "name": "DeepSeek V4 Flash",
          "limit": {
            "context": 1048576,
            "output": 262144
          }
        }
      }
    }
  }
}
```

### 5.3 启用 1M 上下文

对于支持 1M 上下文的模型（如 DeepSeek V4 系列），可以在模型名后添加 `[1m]` 后缀，同时为模型配置正确的上下文限制：

```jsonc
{
  "model": "opencode/deepseek-v4-flash-free[1m]",
  "provider": {
    "opencode": {
      "models": {
        "deepseek-v4-flash-free": {
          "limit": {
            "context": 1000000,
            "output": 262144
          }
        }
      }
    }
  }
}
```

### 5.4 启用自动上下文压缩

为了防止上下文溢出，可以开启自动压缩功能：

```jsonc
{
  "compaction": {
    "auto": true,
    "strategy": "summarize",
    "threshold": 0.9,
    "prune_tool_outputs": true
  }
}
```

当上下文使用量达到 90% 时，Opencode 会自动总结之前的对话内容并释放空间。

### 5.5 安装插件

Opencode 支持通过插件扩展功能。在配置文件的 `plugin` 数组中添加插件名即可：

```jsonc
{
  "plugin": [
    "opencode-morph-fast-apply",
    "opencode-pty"
  ]
}
```

`opencode-morph-fast-apply` 可以加速文件修改的写入速度，`opencode-pty` 提供了更好的终端交互体验。

### 5.6 安装 Skills

Skills 是 Opencode 的技能包，可以让模型掌握特定领域的知识。你可以从 ClawHub 等社区获取 Skills，并将其放在 `~/.config/opencode/skills/` 目录下。在配置中注册即可：

```jsonc
{
  "skills": {
    "paths": ["~/.config/opencode/skills"]
  }
}
```

## 六、常用命令与操作

### 6.1 基础命令

进入 Opencode 终端后，你可以直接输入自然语言描述任务：

```
帮我写一个 Python 函数，实现斐波那契数列
```

Opencode 会理解你的请求，生成代码，并直接在终端中展示差异。

### 6.2 常用 Slash 命令

- `/help`：查看帮助信息
- `/connect`：切换或配置 AI 提供商
- `/models`：查看可用模型列表
- `/agent`：切换代理模式
- `/settings`：打开设置界面
- `/share`：生成当前会话的分享链接
- `/undo`：撤销上一次文件修改

### 6.3 使用快捷键

Opencode 终端支持多种快捷键：
- `Ctrl+C`：中断当前操作
- `Ctrl+D`：退出 Opencode
- `↑` `↓`：浏览历史命令
- `Tab`：自动补全

### 6.4 处理文件

Opencode 可以创建、编辑、重命名和删除文件。当你提出涉及文件操作的请求时，Opencode 会自动调用相应工具。在应用更改前，它会展示差异并请求你的确认。你也可以在配置中调整权限设置，让操作更自动化。

## 七、进阶技巧

### 7.1 使用 @agent 切换代理

Opencode 内置了多个专用代理：
- `@build`：默认代理，适合大多数编程任务
- `@plan`：计划模式，只出方案不写代码
- `@explore`：探索模式，用于搜索和理解代码仓库
- `@general`：通用问答模式

### 7.2 配置多个提供商

你可以在配置中同时配置多个提供商，通过 `/connect` 命令随时切换：

```jsonc
{
  "provider": {
    "deepseek": {
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "baseURL": "https://api.deepseek.com",
        "apiKey": "{env:DEEPSEEK_API_KEY}"
      },
      "models": {
        "deepseek-v4-flash": {}
      }
    },
    "anthropic": {
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

使用环境变量 `{env:变量名}` 来引用 API Key，避免明文写在配置文件中。

### 7.3 自定义权限

你可以控制 Opencode 能执行的操作类型：

```jsonc
{
  "permission": {
    "edit": "ask",
    "bash": { "git *": "allow", "*": "ask" },
    "read": "allow",
    "glob": "allow",
    "grep": "allow"
  }
}
```

- `allow`：自动允许
- `ask`：每次询问
- `deny`：拒绝

### 7.4 使用 OpenCode Zen 免费模型

如果你没有自己的 API Key，OpenCode Zen 提供了多个免费模型：
- DeepSeek V4 Flash Free
- MiniMax M2.5 Free
- Ring 2.6 1T Free
- Nemotron 3 Super Free
- Big Pickle

这些模型虽然免费，但在使用期间可能会收集数据用于模型改进。如果注重隐私，建议使用自己的 API Key。

### 7.5 上下文自动压缩配置

在长时间编码会话中，上下文管理非常重要。除了自动压缩，你还可以调整更多参数：

```jsonc
{
  "compaction": {
    "auto": true,
    "strategy": "summarize",
    "threshold": 0.9,
    "prune_tool_outputs": true,
    "tail_turns": 3,
    "reserved": 5000
  }
}
```

- `tail_turns`：保留最近几轮对话的完整内容不被压缩
- `reserved`：保留多少 token 的缓冲空间

## 八、常见问题

### 8.1 Opencode 命令找不到

如果在安装后输入 `opencode` 提示"找不到命令"，说明 npm 全局安装目录没有在系统 PATH 中。

在 PowerShell 中运行：

```powershell
npm config get prefix
```

然后将输出的目录添加到系统环境变量 PATH 中。通常这个目录是 `C:\Users\你的用户名\AppData\Roaming\npm`。

### 8.2 连接被重置

如果你在使用过程中遇到网络连接问题，如 `Recv failure: Connection was reset`，通常是因为网络环境无法正常访问 GitHub 或相关 API。

解决方法：
- 检查代理设置，确保你的网络可以访问 GitHub
- 使用 `git config --global http.proxy` 配置合适的代理
- 切换到国内镜像源或使用 OpenCode Zen 作为 provider

### 8.3 模型报错 reasoning_content

使用 DeepSeek V4 开启思考模式时，可能会遇到 `reasoning_content must be passed back` 错误。解决方法是在模型配置中添加 `interleaved` 字段：

```jsonc
{
  "deepseek-v4-flash": {
    "name": "DeepSeek V4 Flash",
    "interleaved": {
      "field": "reasoning_content"
    }
  }
}
```

### 8.4 如何更新 Opencode

使用 npm 安装的用户：

```powershell
npm update -g @opencode-ai/opencode
```

使用 pnpm 安装的用户：

```powershell
pnpm update -g @opencode-ai/opencode
```

### 8.5 如何卸载 Opencode

```powershell
npm uninstall -g @opencode-ai/opencode
```

或：

```powershell
pnpm remove -g @opencode-ai/opencode
```

## 九、总结

通过本教程，你已经学会了在 Windows 上安装和配置 Opencode 的完整流程。从环境准备到多种安装方式，从基础配置到进阶技巧，Opencode 的强大之处在于它的灵活性——你可以根据自己的需求和预算选择不同的提供商和模型，通过配置文件和插件系统定制专属的开发体验。

记住，Opencode 是一个仍在快速演进的开源项目。如果你遇到问题，可以查看 [官方文档](https://opencode.ai/docs) 或在 [GitHub Issues](https://github.com/anomalyco/opencode/issues) 中搜索解决方案。社区非常活跃，大多数问题都能很快得到回应。

现在，打开你的终端，输入 `opencode`，开始体验 AI 编程助手的强大吧。
