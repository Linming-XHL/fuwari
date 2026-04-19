---
title: 如何在Linux中部署napcat和nonebot为基础的QQ机器人
published: 2026-01-29
description: 详细介绍如何在Linux系统中部署基于napcat和nonebot的QQ机器人，包括环境搭建、依赖安装、配置优化等完整步骤
image: ''
tags: [Linux, QQ机器人, NoneBot, napcat, 部署教程]
category: 技术教程
draft: false 
lang: zh_CN
---

# 如何在Linux中部署napcat和nonebot为基础的QQ机器人

## 前言

随着QQ机器人的普及，越来越多的开发者选择使用NoneBot框架来快速构建自己的QQ机器人。而napcat作为一个稳定的QQ协议实现，为NoneBot提供了良好的支持。本文将详细介绍如何在Linux系统中部署基于napcat和nonebot的QQ机器人，帮助你快速搭建属于自己的机器人服务。

## 一、环境准备

### 1.1 系统要求

- **操作系统**：Ubuntu 20.04 LTS 或更高版本（本文以Ubuntu 22.04 LTS为例）
- **内存**：至少 1GB RAM
- **存储**：至少 10GB 可用空间
- **网络**：稳定的网络连接

### 1.2 安装必要的系统依赖

首先，我们需要安装一些必要的系统依赖：

```bash
# 更新系统包列表
sudo apt update

# 安装必要的依赖
sudo apt install -y python3 python3-pip python3-venv git curl wget

# 安装构建依赖（用于某些Python包的编译）
sudo apt install -y build-essential libssl-dev libffi-dev python3-dev
```

## 二、安装和配置napcat

### 2.1 下载napcat

napcat是一个基于Mirai的QQ协议实现，我们需要从GitHub上下载最新版本：

```bash
# 创建napcat目录
mkdir -p ~/bot/napcat
cd ~/bot/napcat

# 下载napcat（根据系统架构选择合适的版本）
# 对于x86_64架构
wget https://github.com/NapNeko/napcat/releases/latest/download/napcat-linux-amd64

# 对于arm64架构
# wget https://github.com/NapNeko/napcat/releases/latest/download/napcat-linux-arm64

# 赋予执行权限
chmod +x napcat-linux-amd64
```

### 2.2 配置napcat

创建napcat的配置文件：

```bash
# 创建配置目录
mkdir -p config

# 创建配置文件
cat > config/napcat.yml << 'EOF'
account:
  # QQ账号
  uin: 123456789
  # 密码（可选，建议使用扫码登录）
  password: ""
  # 协议类型：ANDROID_PHONE, ANDROID_PAD, ANDROID_WATCH
  protocol: ANDROID_PHONE

connection:
  # 心跳间隔（毫秒）
  heartbeatInterval: 30000
  # 重连间隔（毫秒）
  reconnectInterval: 5000

message:
  # 最大转发消息长度
  maxForwardMessageSize: 100

# 插件配置
plugin:
  # 插件目录
  pluginPath: plugins
  # 启用的插件
  enabledPlugins:
    - "nonebot"
EOF
```

### 2.3 启动napcat

```bash
# 启动napcat（首次启动需要扫码登录）
./napcat-linux-amd64

# 或者使用screen在后台运行
# screen -S napcat ./napcat-linux-amd64
```

首次启动时，会生成一个二维码，使用QQ扫码登录即可。

## 三、安装和配置NoneBot

### 3.1 创建Python虚拟环境

```bash
# 创建NoneBot目录
mkdir -p ~/bot/nonebot
cd ~/bot/nonebot

# 创建Python虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate

# 更新pip
pip install --upgrade pip
```

### 3.2 安装NoneBot和相关插件

```bash
# 安装NoneBot核心
pip install nonebot2

# 安装适配器（用于连接napcat）
pip install nonebot-adapter-onebot

# 安装命令行工具
pip install nb-cli

# 安装常用插件
pip install nonebot-plugin-apscheduler nonebot-plugin-alconna
```

### 3.3 初始化NoneBot项目

```bash
# 初始化项目
nb create

# 按照提示选择：
# - 项目名称：mybot
# - 模板：default
# - 适配器：OneBot V11
```

### 3.4 配置NoneBot

编辑NoneBot的配置文件：

```bash
# 进入项目目录
cd mybot

# 编辑.env文件
cat > .env << 'EOF'
# NoneBot 配置
NONEBOT_LOG_LEVEL=INFO
NONEBOT_CONFIG_SECRET=your-secret-key

# OneBot 适配器配置
ONEBOT_ACCESS_TOKEN=
ONEBOT_SECRET=
ONEBOT_API_ROOTS=http://localhost:8080
EOF

# 编辑bot.py文件
cat > bot.py << 'EOF'
import nonebot
from nonebot.adapters.onebot.v11 import Adapter as OneBotV11Adapter

# 初始化NoneBot
nonebot.init()

# 注册适配器
nonebot.register_adapter(OneBotV11Adapter)

# 加载插件
nonebot.load_builtin_plugins()
nonebot.load_plugins("plugins")

if __name__ == "__main__":
    nonebot.run()
EOF
```

### 3.5 创建示例插件

```bash
# 创建插件目录
mkdir -p plugins

# 创建示例插件
cat > plugins/hello.py << 'EOF'
from nonebot import on_command
from nonebot.adapters.onebot.v11 import MessageEvent
from nonebot.params import CommandArg
from nonebot.adapters.onebot.v11.message import Message

# 注册命令
hello = on_command("hello", aliases={"你好"}, priority=10, block=True)

@hello.handle()
async def _(event: MessageEvent, args: Message = CommandArg()):
    name = args.extract_plain_text()
    if name:
        await hello.finish(f"你好，{name}！欢迎使用NoneBot机器人！")
    else:
        await hello.finish("你好！欢迎使用NoneBot机器人！")
EOF
```

## 四、配置napcat与NoneBot的连接

### 4.1 配置napcat的OneBot插件

编辑napcat的配置文件，添加OneBot插件配置：

```bash
# 编辑napcat的配置文件
cat >> ~/bot/napcat/config/napcat.yml << 'EOF'

# OneBot 配置
onebot:
  # 是否启用
  enabled: true
  # 上报地址（NoneBot的地址）
 上报地址: http://localhost:8080/event
  # 访问令牌
  accessToken: ""
  # 重连间隔（毫秒）
  reconnectInterval: 3000
  # 心跳间隔（毫秒）
  heartbeatInterval: 30000
  # 心跳超时时间（毫秒）
  heartbeatTimeout: 60000
  # 机器人QQ号
  botId: 123456789
EOF
```

### 4.2 启动NoneBot

```bash
# 进入NoneBot项目目录
cd ~/bot/nonebot/mybot

# 激活虚拟环境
source ../venv/bin/activate

# 启动NoneBot
python bot.py

# 或者使用screen在后台运行
# screen -S nonebot python bot.py
```

## 五、配置系统服务

为了让napcat和NoneBot在系统启动时自动运行，我们需要创建系统服务：

### 5.1 创建napcat服务

```bash
sudo cat > /etc/systemd/system/napcat.service << 'EOF'
[Unit]
Description=NapCat QQ Bot
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/home/your-username/bot/napcat
ExecStart=/home/your-username/bot/napcat/napcat-linux-amd64
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF
```

### 5.2 创建NoneBot服务

```bash
sudo cat > /etc/systemd/system/nonebot.service << 'EOF'
[Unit]
Description=NoneBot QQ Bot
After=network.target napcat.service

[Service]
Type=simple
User=your-username
WorkingDirectory=/home/your-username/bot/nonebot/mybot
ExecStart=/bin/bash -c "source /home/your-username/bot/nonebot/venv/bin/activate && python bot.py"
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF
```

### 5.3 启用服务

```bash
# 重新加载systemd配置
sudo systemctl daemon-reload

# 启用服务
sudo systemctl enable napcat nonebot

# 启动服务
sudo systemctl start napcat nonebot

# 查看服务状态
sudo systemctl status napcat nonebot
```

## 六、常见问题排查

### 6.1 napcat无法登录

- **问题**：扫码后登录失败
- **解决方法**：
  1. 检查网络连接是否正常
  2. 尝试使用不同的协议类型（ANDROID_PAD或ANDROID_WATCH）
  3. 检查QQ账号是否被限制登录

### 6.2 NoneBot无法连接到napcat

- **问题**：日志显示无法连接到OneBot
- **解决方法**：
  1. 检查napcat的OneBot插件是否启用
  2. 检查网络地址和端口是否正确
  3. 检查防火墙设置，确保端口8080可以访问

### 6.3 机器人无响应

- **问题**：发送命令后机器人没有反应
- **解决方法**：
  1. 检查napcat是否正常运行
  2. 检查NoneBot是否正常运行
  3. 检查插件是否正确加载
  4. 查看日志文件，寻找错误信息

## 七、优化和维护

### 7.1 性能优化

- **内存优化**：关闭不必要的插件
- **CPU优化**：调整任务调度频率
- **网络优化**：使用稳定的网络连接，考虑使用CDN

### 7.2 安全建议

- **修改默认端口**：避免使用默认端口8080
- **设置访问令牌**：为OneBot设置访问令牌
- **定期更新**：定期更新napcat和NoneBot到最新版本
- **备份数据**：定期备份配置文件和数据

### 7.3 日志管理

```bash
# 查看napcat日志
sudo journalctl -u napcat

# 查看NoneBot日志
sudo journalctl -u nonebot

# 设置日志轮转
# 编辑/etc/logrotate.d/nonebot
```

## 八、扩展功能

### 8.1 添加更多插件

```bash
# 安装插件
pip install nonebot-plugin-weather nonebot-plugin-daily-random

# 或者从GitHub安装
pip install git+https://github.com/username/repository.git
```

### 8.2 自定义插件

创建自定义插件的步骤：
1. 在`plugins`目录中创建新的Python文件
2. 按照NoneBot的插件规范编写代码
3. 重启NoneBot服务

### 8.3 集成第三方服务

可以集成的第三方服务：
- **天气服务**：和风天气API
- **翻译服务**：百度翻译API
- **图灵机器人**：智能对话API
- **数据库**：MySQL、SQLite

## 九、总结

本文详细介绍了如何在Linux系统中部署基于napcat和nonebot的QQ机器人，包括：

1. **环境准备**：安装必要的系统依赖
2. **napcat配置**：下载、配置和启动napcat
3. **NoneBot配置**：安装、初始化和配置NoneBot
4. **服务配置**：创建系统服务，实现自动启动
5. **问题排查**：常见问题的解决方法
6. **优化维护**：性能优化、安全建议和日志管理
7. **功能扩展**：添加插件和集成第三方服务

通过本文的步骤，你应该能够成功搭建一个稳定运行的QQ机器人。如果你在部署过程中遇到问题，可以参考相关文档或社区寻求帮助。

## 参考链接

- [NoneBot文档](https://nonebot.dev/docs/)
- [napcat GitHub](https://github.com/NapNeko/napcat)
- [OneBot标准](https://github.com/botuniverse/onebot)

希望本文对你有所帮助，祝你机器人开发顺利！
