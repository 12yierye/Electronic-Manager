# 用户管理数据同步机制设计

## 概述

在 Manager 模块中实现完整的用户数据同步机制，确保添加/删除用户时实时保存到服务端数据库，并包含认证、数据一致性、网络异常处理等保障。

## 架构

```
Manager 界面 ──HTTP (Authorization: Bearer <token>)──> 服务端
     │                                                      │
     ├─ 登录认证 (token 管理)                                ├─ 认证中间件
     ├─ 添加用户 POST /api/accounts                        ├─ 添加用户
     ├─ 删除用户 DELETE /api/accounts/:username             ├─ 删除用户
     ├─ 离线队列 (localStorage) → 自动重试                  ├─ 数据持久化 (users.json)
     └─ 数据一致性 (操作后自动刷新)                          └─ token 校验
```

## 服务端变更

### 认证中间件
- 从 `Authorization: Bearer <token>` 提取 token
- 调用凭证验证逻辑（复用现有 `/credential/verify` 机制）
- 验证通过后检查用户名是否为 `admin`
- 失败返回 `401 { success: false, message: '未授权' }`

### POST /api/accounts/login
- 接收 `{ username, password }`
- 验证用户名密码（复用 `/login` 逻辑）
- 仅 `admin` 用户可登录
- 成功生成 token + 返回 `{ success: true, token, username }`

### POST /api/accounts
- 接收 `{ username, password, role }`
- 需认证中间件保护
- 检查用户名唯一性
- 生成完整用户对象写入 users.json
- 返回 `201 { success: true, user: {...} }`

### DELETE /api/accounts/:username
- 需认证中间件保护
- 禁止删除自身
- 从 users.json 移除目标用户
- 清理关联数据（文件目录、在线状态）
- 返回 `200 { success: true, message: '已删除' }`

## 前端变更

### 登录管理
- 页面加载检查 localStorage 中 token
- 有 token 则调用 `/credential/verify` 验证
- 无 token 或过期则显示登录弹窗
- 登录成功后存储 `{ token, username }`
- 所有 fetch 自动附加 `Authorization` header

### 添加用户流程
1. 点击"添加账户"打开模态框（含密码字段）
2. 填写用户名、密码、角色，点击保存
3. 调用 `POST /api/accounts`（带 token）
4. 成功 → 通知 + 清除缓存 + 刷新列表
5. 失败 → 显示错误 + 保留表单（可修改重试）

### 删除用户流程
1. 点击删除 → confirm 确认
2. 调用 `DELETE /api/accounts/:username`（带 token）
3. 成功 → 通知 + 清除缓存 + 刷新列表
4. 失败 → 显示错误通知

### 离线队列
- 网络错误时，将操作存入 localStorage 队列
- 每次成功的 API 请求后检查队列
- 按先进先出顺序重试
- 重试成功移除，失败保留
- 页面可见性变化时自动重试

### 数据一致性
- 添加/删除成功后 `accountsCache = null`
- 立即 `refreshAccounts()` 从服务端重新获取
- 确保界面与服务端完全一致