---
title: 将Ubuntu26.04的GNOME更换为KDE并安装Liquorix内核
published: 2026-08-19
description: '从 GNOME 50 迁移到 KDE Plasma 6.6，并安装低延迟的 Liquorix 内核，让你的 Ubuntu 26.04 桌面又快又流畅。'
image: ''
tags: [Linux, Ubuntu, KDE, 内核, Liquorix]
category: 'Linux'
draft: false 
lang: 'zh-CN'
---

Ubuntu 26.04 LTS（代号 Resolute Raccoon，坚毅浣熊）于 2026 年 4 月 23 日正式发布，它搭载了 GNOME 50 桌面环境与 Linux 7.0 内核，并成为首个彻底移除 Xorg 桌面会话、仅支持 Wayland 的长期支持版本。对于多数用户而言，GNOME 简洁现代、开箱即用，但它的设计哲学——"极简、隐藏细节、依赖扩展（Extension）补全功能"——也让不少追求效率与自由度的用户感到受限。

如果你厌倦了 GNOME 的"一刀切"式交互，希望拥有更像 Windows 的经典任务栏、随时可调的系统设置，以及更低的空闲资源占用，那么把桌面换成 KDE Plasma 是一个明智的选择。再配合专为桌面交互优化的 Liquorix 内核，你的 Ubuntu 26.04 将获得从软件到内核的全方位响应速度提升。本文将手把手带你完成整套迁移。

## 一、为什么选择 KDE Plasma 与 Liquorix？

### 1. KDE Plasma 6.6：高效与自由的化身

KDE Plasma 与 GNOME 代表着两种截然不同的设计理念。GNOME 追求"少即是多"，把大量选项藏起来，通过第三方扩展恢复功能；而 Plasma 奉行"用户主权"，几乎所有行为都可以在图形界面的"系统设置"里直接调整，无需安装任何额外扩展。

具体到 Ubuntu 26.04 这一代，两者在高刷屏上的表现已经有了可量化的差距：Phoronix 在 Ubuntu 26.04 上对 GNOME 50 与 KDE Plasma 6.6 的对比测试显示，使用 Radeon 显卡时 Plasma 的窗口合成与帧渲染性能明显优于 GNOME，在高分辨率与高刷新率场景下体验更跟手。

在资源占用上，KDE Plasma 的经典对比也一直占据优势：空闲时 Plasma 通常只需 600–900 MB 内存，而 GNOME 往往要 800 MB–1.2 GB。对于内存门槛刚刚从 4 GB 提高到 6 GB 的 26.04 来说，这一点点差距在日常多任务时感受尤为明显。此外，KDE 自带的 Dolphin 文件管理器、KRunner 快速启动器、KDE Connect 手机互联等工具，对提高日常工作效率帮助很大。

### 2. Liquorix 内核：为交互而生

Liquorix 是一款专门针对桌面、音视频制作与游戏等交互式场景优化的 Linux 内核，由开发者 Damentz 维护。它与 Ubuntu 默认内核的最大区别在于编译配置的取向：

- **PDS/BMQ 进程调度器**：比默认的 CFS/EEVDF 更适合多任务交互负载，降低输入延迟；
- **1000 Hz 高分辨率调度**：系统时钟节拍从默认的 250 Hz 提升到 1000 Hz，任务调度更精细、更及时；
- **硬内核抢占（Full Preemption）**：即使系统在高负载下，UI 线程也能及时得到响应，避免"卡顿"；
- **优化的磁盘 I/O**：多队列设备使用 Kyber 调度器，单队列设备使用 BFQ，确保高 I/O 时界面依然流畅；
- **Zen 交互调优**：一系列针对桌面响应性而非极限吞吐量的内核参数组合；
- **BBR2 拥塞控制**：提升网络吞吐，降低传输延迟；
- **LZ4 压缩交换内存与 MGLRU**：内存压力下表现更好。

简单说，Liquorix 就是"为桌面手感而生"的内核，配合 KDE 这种本身就强调响应性的桌面环境，双管齐下效果显著。

> **重要提示**：Liquorix 内核只提供 amd64（x86_64）架构的构建，不支持 ARM 等其他架构；且内核未签名，如果开启了 Secure Boot，必须先关闭（详见下文第七节）。

## 二、准备工作

在动任何系统级组件之前，务必先做好安全网：

```bash
# 1. 备份重要数据（主目录、配置等）
tar czf ~/backup-home-$(date +%Y%m%d).tar.gz ~/Documents ~/Pictures ~/Music 2>/dev/null

# 2. 记录当前默认显示管理器与内核版本，便于日后回滚
cat /etc/X11/default-display-manager 2>/dev/null
uname -r
```

如果你在用虚拟机，建议先在宿主机上打一个快照；物理机用户最好准备一个 Ubuntu Live USB，以防万一需要应急恢复。

## 三、安装 KDE Plasma 桌面环境

Ubuntu 26.04 的官方软件源中已经包含 Kubuntu 26.04 的完整软件包（KDE Plasma 6.6 + Qt 6.10.2 + KDE Frameworks 6.24），无需添加任何 PPA。先更新系统，再选择安装方式：

```bash
sudo apt update && sudo apt upgrade -y
```

### 方案 A：完整安装（推荐，适合作为主力桌面）

```bash
sudo apt install kubuntu-desktop
```

`kubuntu-desktop` 是 Kubuntu 的元包，会一次性带来完整的 Plasma 桌面、SDDM 显示管理器，以及 Dolphin、Konsole、Discover、Okular 等一整套 KDE 应用。安装体积约 1–2 GB，适合已经决定长期使用 KDE 的用户。

### 方案 B：最小安装（适合只想尝鲜或双桌面共存）

```bash
sudo apt install kde-plasma-desktop
```

`kde-plasma-desktop` 只安装 Plasma 桌面核心、窗口管理器、基础系统托盘与 SDDM，不包含大部分 KDE 应用。如果你想保留 GNOME 应用、只换个桌面外观，或者硬盘空间紧张，选这个更合适。

无论选哪种方案，安装过程中如果出现关于显示管理器（Display Manager）的选择对话框，**请务必选择 sddm**——它是 Plasma 官方推荐、兼容性最好的登录管理器。如果你不小心选成了 gdm3，后面可以用命令改回来（见下节）。

## 四、切换显示管理器与登录会话

### 1. 确认/切换默认显示管理器

安装完成后，检查当前默认显示管理器：

```bash
cat /etc/X11/default-display-manager
```

如果输出的不是 `/usr/bin/sddm`，执行以下命令把它切换为 SDDM：

```bash
sudo dpkg-reconfigure sddm
```

在弹出的界面里选择 `sddm` 并回车确认。之后重启系统：

```bash
sudo reboot
```

### 2. 在登录界面选择 Plasma 会话

重启后你会进入 SDDM 登录界面。在输入密码之前，点击左下角或右下角的**会话（Session）选择器**（通常是一个下拉菜单或齿轮图标），从 GNOME 切换为 **Plasma (Wayland)**。

注意：Ubuntu 26.04 已经彻底移除了 Xorg 桌面会话，因此这里只有 Wayland 选项。KDE Plasma 6.6 的 Wayland 支持已经非常成熟，NVIDIA 与 AMD 显卡均可获得良好的体验。

登录成功后，你看到的将是全新的 KDE Plasma 桌面：底部有类似 Windows 的任务栏，左上角是应用程序启动菜单，Alt+F2 可以呼出 KRunner 快速启动器。

## 五、（可选）卸载 GNOME 释放空间

如果你已经确认在 KDE 下所有日常工作正常，可以卸载 GNOME 以释放磁盘空间并避免两个桌面环境的设置相互干扰。

```bash
sudo apt remove --purge ubuntu-desktop gnome-shell gdm3 nautilus gnome-terminal
sudo apt autoremove --purge
```

> **警告**：这一步不可逆且风险较高，请务必在 KDE 下稳定使用一段时间后再操作。建议仅卸载 `gnome-shell` 等核心组件，保留 `gdm3` 作为备用登录管理器也行——不过既然已经切到 SDDM，留着 gdm3 意义不大。

## 六、KDE 初始优化

刚装好的 Plasma 是"够用"的，但下面几个设置能让它更快：

1. **禁用 Baloo 文件索引**：系统设置 → 搜索 → 文件搜索，关闭"文件索引"。这对机械硬盘用户尤其重要。
2. **减少合成器负载**：系统设置 → 显示与监控 → 合成，如果不需要酷炫特效，可以降低动画速度或关闭模糊。
3. **关闭 Discover 自动检查更新**：避免后台频繁联网。
4. **开启 KRunner**：按 Alt+F2 输入命令或搜索，日常效率神器。
5. **窗口按钮与布局**：系统设置 → 外观 → 窗口装饰，可以一键切换为 macOS 风格或 Windows 风格，让上手成本降到最低。
6. **安装 NVIDIA/AMD 驱动**：如果桌面出现花屏或高刷不流畅，检查系统设置 → 显卡与显示，确认驱动已正确加载；Liquorix 内核与最新的 595.x 系列 NVIDIA 驱动、Mesa 26.0.x 均能正常配合。

## 七、安装 Liquorix 内核

### 1. 检查 Secure Boot 状态

Liquorix 内核**未签名**，如果启用了 Secure Boot，重启后会出现"invalid signature"之类的报错而无法引导。先检查状态：

```bash
mokutil --sb-state
```

如果输出 `SecureBoot enabled`，需要进入 UEFI/BIOS 设置（开机按 F2 / Del / F12 等），找到 Security → Secure Boot，将其 **Disabled** 后保存退出。

### 2. 一键安装（官方推荐）

Liquorix 官方提供了全自动安装脚本，它会自动判断发行版、添加 PPA 并安装内核：

```bash
curl -s 'https://liquorix.net/install-liquorix.sh' | sudo bash
```

该脚本在 Ubuntu 上实际执行的动作是：添加 `ppa:damentz/liquorix` → 更新软件源 → 安装 `linux-image-liquorix-amd64` 与 `linux-headers-liquorix-amd64`。

### 3. 手动安装（原理等价）

如果你想看清楚每一步，也可以手动操作：

```bash
sudo add-apt-repository ppa:damentz/liquorix
sudo apt update
sudo apt install linux-image-liquorix-amd64 linux-headers-liquorix-amd64
```

安装过程中 `update-grub` 会被自动调用，Liquorix 内核会自动成为 GRUB 菜单中的第一项。

### 4. 重启并验证

```bash
sudo reboot
```

重启后确认当前运行的内核：

```bash
uname -r
```

看到类似 `6.18.x-x-liquorix-amd64` 的输出，就代表 Liquorix 内核已经生效。

### 5. 保持内核更新

Liquorix 通过 PPA 分发，只要执行常规的 `sudo apt update && sudo apt upgrade` 即可自动更新到最新版本，无需额外操作。

## 八、故障排查与回滚

### 启动失败/无法引导

如果安装 Liquorix 后系统无法正常启动，在 GRUB 菜单选择"Advanced options for Ubuntu"，手动选择原来的 Ubuntu 内核（不带 liquorix 字样）进入系统，然后卸载：

```bash
sudo apt remove --purge linux-image-liquorix-amd64 linux-headers-liquorix-amd64
sudo apt autoremove --purge
sudo update-grub
```

### 内核模块（DKMS）加载失败

Liquorix 内核要求所有内核模块都有对应签名。若遇到 `Required key not available` 类报错，多半是 Secure Boot 或模块签名校验导致的——按上文关闭 Secure Boot，或使用 `mokutil` 导入自签名密钥即可。

### 想换回 GNOME

如果你卸载了 GNOME 后又后悔了，一条命令即可装回：

```bash
sudo apt install ubuntu-desktop
```

然后用 `sudo dpkg-reconfigure gdm3` 把默认显示管理器切回 GDM，登录界面选择 GNOME 会话即可。

## 九、结语

至此，你的 Ubuntu 26.04 已经从"GNOME + 默认内核"全面升级为"KDE Plasma 6.6 + Liquorix 内核"的组合。前者带来了更低的资源占用、更自由的可定制性和更跟手的高刷体验；后者则从进程调度、磁盘 I/O、网络协议等底层维度进一步压低了响应延迟。两者叠加，无论是日常办公、写代码，还是影音娱乐，都能明显感受到系统"变快、变顺"了。

最后提醒三点：第一，任何系统级改动前记得备份；第二，卸载 GNOME 前先在 KDE 下充分验证；第三，如果你的硬件开启了 Secure Boot，装 Liquorix 前务必先关闭。祝你的新桌面用得愉快！
