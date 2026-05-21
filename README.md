# Electronic Manager

Electronic Manager 是一个基于 Web 的服务器管理面板，提供直观的界面用于监控服务器状态、管理账户和自定义系统设置。

## 功能特性

- **服务器概览** — 实时查看系统运行时间、CPU 负载、内存使用、磁盘信息等关键指标
- **账户管理** — 支持账户的增删改查、角色分配（Admin/User/Guest）和状态管理
- **用户认证** — 完整的登录、注册和密码找回流程
- **通知系统** — 支持多种类型通知（成功/错误/警告/信息），可调节音量和音效风格（Default / Electronic / Natural / Soft）
- **主题定制** — 浅色、暗色、高对比三种主题，支持现代/经典界面风格切换
- **字体与动画** — 可调节字体大小（12px–22px）和动画过渡时长
- **响应式导航** — 可展开/折叠的侧边导航栏，状态自动持久化

## 项目结构

```
Electronic-Manager/
├── pages/                  # 页面文件
│   ├── login.html          # 登录页
│   ├── register.html       # 注册页
│   ├── forget.html         # 忘记密码页
│   ├── main.html           # 服务器概览主页
│   ├── accounts.html       # 账户管理页
│   ├── settings.html       # 系统设置页
│   ├── success.html        # 操作成功提示页
│   └── test.html           # 综合测试页
├── scripts/                # JavaScript 脚本
│   ├── base.js             # 全局基础功能（导航、页面跳转）
│   ├── main.js             # 概览页面逻辑
│   ├── accounts.js         # 账户管理逻辑
│   ├── settings.js         # 设置页面逻辑
│   ├── settings-global.js  # 设置全局应用逻辑
│   ├── notification.js     # 通知系统核心
│   ├── custom-select.js    # 自定义下拉选择框
│   └── test.js             # 测试页面逻辑
├── styles/                 # 样式文件
│   ├── base.css            # 全局样式与主题变量
│   ├── main.css            # 概览页样式
│   ├── accounts.css        # 账户管理页样式
│   ├── settings.css        # 设置页样式
│   ├── notification.css    # 通知组件样式
│   └── test.css            # 测试页样式
├── res/                    # 静态资源
│   ├── sounds/             # 通知音效（四种风格 × 三种优先级）
│   └── *.png               # 项目 Logo
└── tools/
    └── generate-sounds.js  # 音效生成工具
```

## 快速开始

直接使用浏览器打开 `pages/login.html` 即可进入系统。

> 项目为纯前端实现，无需构建步骤或后端服务即可运行。

## 技术栈

- **HTML5** — 语义化页面结构
- **CSS3** — 自定义属性主题系统、Flexbox 布局、过渡动画
- **JavaScript (Vanilla)** — 原生 ES6+，无框架依赖
- **Web Audio API** — 通知音效播放

## 自定义

### 生成自定义音效

```bash
node tools/generate-sounds.js
```

该脚本会为四种风格（default / electronic / natural / soft）分别生成高、中、低三种优先级的 WAV 音效文件。

### 主题扩展

在 `styles/base.css` 的 `:root` 后添加新的 `.theme-*` 类即可注册新主题，需包含所有 `--*` 自定义属性变量。