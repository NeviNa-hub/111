# 妙笔生花 H5 / 小程序接口契约

本文件是前端当前实现的接口契约，后端可按此实现后直接替换本地 Mock。
前端调用链：页面 → `src/apis/*` → `src/apis/http.js` → 真实请求层或 Mock。
所有接口字段使用后端惯例 `snake_case`，页面模型由 `src/apis` 映射为 `camelCase`，页面不感知后端字段。

## 1. 统一响应体

```json
{
  "code": 0,
  "message": "操作成功",
  "data": {}
}
```

- `code: 0` 表示成功，其余为业务错误。
- 失败时 `data` 可为 `null`，`message` 直接用于面向用户的提示。
- HTTP 状态码正常时也必须返回上述结构；HTTP 4xx/5xx 时同样建议返回 `code` 与 `message`。
- 前端请求层会解包 `data`；非 0 `code`、非 2xx、超时、断网都会抛出 `ApiError`，由页面决定展示方式。

### 列表结构

```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "page_info": { "page": 1, "page_size": 10, "total": 12 },
    "lists": []
  }
}
```

列表接口统一使用 `data.page_info` 与 `data.lists`；`page` 从 1 开始，`page_size` 默认 10，最大 50。

### 动作 / 详情结构

动作类接口的 `data` 直接返回对象或必要字段，例如创建任务返回 `{ "task_id", "status" }`，详情接口直接返回任务对象。

## 2. 错误码

| code  | 含义              | 典型场景                     |
| ----- | ----------------- | ---------------------------- |
| 0     | 成功              | -                            |
| 40101 | 未登录 / 会话过期 | 令牌失效                     |
| 40401 | 资源不存在        | 作品或配置不存在             |
| 40402 | 任务不存在或过期  | 轮询已过期的 `task_id`       |
| 40901 | 灵感点不足        | 创建任务时余额不足           |
| 42201 | 参数校验失败      | 缺少 `prompt` / `image_path` |
| 50001 | 服务异常          | 后端内部错误                 |
| 90001 | 网络异常（前端）  | 断网、超时                   |
| 90002 | 请求取消（前端）  | 主动中止请求                 |

失败示例：

```json
{ "code": 42201, "message": "缺少必要参数：prompt", "data": null }
{ "code": 40402, "message": "任务不存在或已过期", "data": null }
{ "code": 40901, "message": "灵感点不足，请先充值", "data": null }
```

## 3. 账户

### GET /account/overview

用于所有页面页头灵感点展示。

响应 `data`：

```json
{ "points_balance": 800 }
```

待定：余额实时扣减、明细入口接口。

## 4. 首页

### GET /home/overview

响应 `data`：

```json
{
  "weather_text": "今日谷雨",
  "quote": "造法自然 · 意致千里",
  "hero": {
    "label": "今日推荐 · 烟岚登翠",
    "caption": "青绿水墨江南",
    "prompt": "水墨淋漓，宋式青绿设色，微风拂动湖面 ...",
    "image_url": "/static/home/home-1.png",
    "model_name": "国产大模型",
    "generated_count": 1280
  },
  "creations": [
    {
      "creation_id": 1,
      "eyebrow": "IMAGE INK",
      "title": "文字生图",
      "input_label": "意境：",
      "input_value": "宋式青绿水墨...",
      "icon": "✦",
      "note": "字句勾勒意境",
      "action": "去探索",
      "url": "/pages/image-creation/index"
    }
  ]
}
```

说明：

- `url` 为小程序内部页面路径，后端下发前需与前端路由保持一致。
- 今日推荐如需轮播，可扩展 `heroes` 数组；当前 UI 只展示单个 `hero`，扩展前属于待定项。
- 天气与寄语的真实数据源待定，当前 Mock 为固定文案。

## 5. 创作台

### GET /workbench

响应 `data`：

```json
{
  "film_chips": ["四开画幅", "轨迹平滑", "60FPS 帧率"],
  "frames": [{ "frame_id": 1, "name": "起势·淡雾" }],
  "drafts": [
    {
      "draft_id": 1,
      "title": "《松山夜笛》插图构思",
      "time": "2小时前",
      "status": "待生成"
    }
  ]
}
```

## 6. 作品库

### GET /library

请求参数（query）：

| 字段      | 类型   | 必填 | 说明                                       |
| --------- | ------ | ---- | ------------------------------------------ |
| page      | number | 否   | 页码，默认 1                               |
| page_size | number | 否   | 每页条数，默认 10，最大 50                 |
| status    | string | 否   | `all` / `completed` / `creating` / `draft` |

响应 `data`：

```json
{
  "summary": "共 12 幅典藏 · 1 幅研墨中",
  "tabs": [
    { "status": "all", "name": "全部", "count": 12 },
    { "status": "completed", "name": "已完成", "count": 7 },
    { "status": "creating", "name": "创作中", "count": 1 },
    { "status": "draft", "name": "草稿", "count": 4 }
  ],
  "page_info": { "page": 1, "page_size": 10, "total": 12 },
  "lists": [
    {
      "work_id": 1,
      "title": "《寒江独钓图》",
      "status": "completed",
      "class_name": "river-work",
      "image_url": ""
    }
  ],
  "generating": {
    "work_id": 3,
    "title": "《烟渚微茫图》",
    "status_text": "生成中 · 墨骨勾勒"
  }
}
```

说明：

- `summary` 必须与 `tabs` 中 `all.count` 口径一致，前端已在 Mock 中按同一数据源计算，避免出现“摘要 18 / 全部 19”。
- `generating` 为可选对象，没有进行中的任务时返回 `null`。
- `image_url` 为空时页面使用 `class_name` 对应的渐变底纹占位。
- 待定：作品创建时间、导出状态、缩略图尺寸等字段。

## 7. 文字生图

### GET /text-to-image/options

```json
{
  "suggestions": ["江南烟雨", "宋代山水", "青绿设色", "晨曦微光", "枯墨留白"],
  "polish_suffix": "画面空灵雅致，留白自然，笔触细腻",
  "random_prompt": "薄雾晨光里的青绿山水，远处层峦叠嶂，近处一叶轻舟掠过溪面",
  "prompt_limit": 500
}
```

### GET /text-to-image/styles

```json
{
  "default_style_id": 1,
  "lists": [
    {
      "style_id": 1,
      "name": "宋式水墨",
      "description": "写意淡墨，温润留白，淡雅韵味。",
      "class_name": "ink-style"
    }
  ]
}
```

### GET /text-to-image/canvas-options

```json
{
  "ratios": [
    {
      "ratio_id": 1,
      "name": "1:1 方形",
      "description": "适合朋友圈 / 头像",
      "value": "1:1"
    }
  ],
  "counts": [
    { "count_id": 1, "name": "单张", "value": 1, "cost": 2 },
    { "count_id": 2, "name": "双张", "value": 2, "cost": 4 },
    { "count_id": 3, "name": "四张", "value": 4, "cost": 8 }
  ],
  "default_ratio": "1:1",
  "default_count": "双张",
  "estimated_time": "约 6~8 秒"
}
```

### POST /text-to-image/tasks

请求体：

```json
{ "prompt": "宋式青绿水墨远山", "style": "宋式水墨", "ratio": "1:1", "count": "双张" }
```

响应 `data`：

```json
{ "task_id": "image-1720000000000-1", "status": "processing" }
```

### GET /text-to-image/tasks/{task_id}

响应 `data`：

```json
{
  "task_id": "image-1720000000000-1",
  "status": "processing",
  "progress": 68,
  "progress_title": "研墨成画",
  "stage_label": "立轴画心 · 析出中",
  "type_label": "天工化育",
  "work_name": "《宋式青绿水墨远山》",
  "detail": "宋式水墨 · 1:1",
  "tags": ["宋式水墨", "1:1", "双张"],
  "cost": 4,
  "estimated_time": "约 6~8 秒",
  "description": "研墨调色，点染山石梧桐与溪桥花茂",
  "tip": "已投入云端渲染池，离开页面不影响任务进度",
  "status_text": "第二阶段 · 丹青晕染",
  "progress_label": "气韵流转",
  "result_urls": []
}
```

任务状态枚举：`pending` / `processing` / `completed` / `failed`。
前端在 `status === "completed"` 时停止轮询；`failed` 时提示 `message`。
待定：失败原因字段、结果图片尺寸、作品归档后的 `work_id`。

## 8. 图片优化

### GET /image-optimization/options

```json
{
  "directions": [
    {
      "direction_id": 1,
      "icon_name": "grid",
      "title": "无损超清",
      "description": "4K超分重塑"
    }
  ],
  "intensities": ["微调修润", "均衡重构", "深度淬炼"],
  "default_direction": "无损超清",
  "default_intensity": "均衡重构",
  "cost": 3,
  "estimated_time": "约 8 秒"
}
```

### POST /image-optimization/tasks

请求体：

```json
{
  "image_path": "https://cdn.example.com/upload/xxx.png",
  "direction": "无损超清",
  "intensity": "均衡重构",
  "keep_detail": true
}
```

响应 `data`：同文字生图，返回 `{ task_id, status }`。

### GET /image-optimization/tasks/{task_id}

字段同 `GET /text-to-image/tasks/{task_id}`，展示文案可按优化流程调整。

## 9. 视频创作

### GET /video/creation-options

```json
{
  "power": 800,
  "prompt_limit": 300,
  "default_ratio": "16:9",
  "default_mode": "text",
  "ratios": [
    {
      "ratio_id": 1,
      "value": "16:9",
      "name": "16:9 横屏",
      "description": "视野宽广 · 磅礴画卷",
      "recommended": true
    }
  ],
  "modes": [
    { "mode_id": "text", "name": "文字生视频", "icon": "✦" },
    { "mode_id": "image", "name": "图卷生动境", "icon": "❖" }
  ],
  "suggestions": ["清溪泛舟", "浮岚暖翠", "寒江雪霁", "竹影摇曳"],
  "polish_suffix": "水波微澜，晨雾轻笼，气韵徐徐流转",
  "default_prompt": "孤舟蓑笠，江雪霏霏，水波微澜，远山在晨雾中徐徐隐退"
}
```

待定：`power` 与 `/account/overview` 的 `points_balance` 是否同一余额；当前 Mock 两者同值，后端可统一为一个余额接口。

### GET /video/render-options

```json
{
  "power": 800,
  "cost": 8,
  "default_fps": 60,
  "estimated_time": "约 18 秒",
  "preview_title": "《江雪孤舟 · 动态长卷》",
  "camera_move": "平缓推镜",
  "fps_options": [
    {
      "fps_id": 1,
      "value": 30,
      "name": "30 FPS · 典雅",
      "tag": "节律省电",
      "description": "传统水墨电影韵味，起承转合自然含蓄"
    },
    {
      "fps_id": 2,
      "value": 60,
      "name": "60 FPS · 丝滑 4K 超清",
      "tag": "首推",
      "recommended": true,
      "description": "雪浪微澜，丝缕毕现，水汽流动如真如幻"
    }
  ]
}
```

### POST /video/tasks

请求体：

```json
{
  "mode": "text",
  "ratio": "16:9",
  "ratio_name": "16:9 横屏",
  "prompt": "孤舟蓑笠，江雪霏霏",
  "image_path": "",
  "fps": 60
}
```

`mode` 为 `image` 时 `image_path` 必填；为 `text` 时 `prompt` 必填。

响应 `data`：`{ "task_id": "video-...", "status": "processing" }`。

### GET /video/tasks/{task_id}

```json
{
  "task_id": "video-...",
  "status": "processing",
  "progress": 12,
  "progress_title": "动卷渲染中",
  "stage_label": "云端逐帧重绘",
  "estimated_time": "约 18 秒",
  "note": "动卷已进入云端渲染池，退出或锁屏均不影响进度，完成后自动归档至作品库。"
}
```

## 10. 上传与选图

### POST /uploads/images

请求体（Mock 契约，当前以本地路径占位）：

```json
{ "file_path": "wxfile://xxx.png", "name": "image.png" }
```

响应 `data`：

```json
{
  "upload_id": "upload-...",
  "url": "https://cdn.example.com/upload/xxx.png",
  "name": "image.png"
}
```

后端接入时建议改为 `multipart/form-data` 或“申请直传签名 + 前端直传”方案；前端 `src/apis/upload.js` 保持 `{ filePath, name } → { uploadId, url, name }` 的调用契约不变。

## 11. Mock 开关与异常态

- 开关：`src/apis/config.js` 的 `USE_MOCK`，读取 `VITE_USE_MOCK`，默认开启。设置 `VITE_USE_MOCK=false` 即切换真实请求，页面代码无需改动。
- 场景：H5 控制台执行 `uni.setStorageSync("__mock_scenario__", "empty" | "failure" | "slow" | "normal")` 后刷新页面。
  - `empty`：首页灵感工坊、创作台分镜/草稿、作品库返回空列表。
  - `failure`：所有 Mock 请求返回 `code: 50001` 等价异常，用于验证错误态。
  - `slow`：延迟 1200ms，用于验证加载态。
  - `normal`：默认。
- 任务轮询：Mock 按创建时间在 12 秒内推进 `progress` 到 100 并切换为 `completed`。

## 12. 本地 Mock 服务

提供三种运行模式，页面与 `src/apis` 代码均无需改动：

| 模式                   | 启动                                             | 数据来源                                  |
| ---------------------- | ------------------------------------------------ | ----------------------------------------- |
| 进程内 Mock（默认）    | `npm run dev:h5`                                 | 请求层直接读取 `src/mock`，不发起网络请求 |
| 本地 Mock HTTP 服务    | `npm run mock:server`                            | Node 原生 http，端口默认 3001             |
| 本地服务 + H5 一键启动 | `npm run dev:mock`                               | 自动以 `VITE_USE_MOCK=false` 启动 H5      |
| 真实后端               | 配置 `VITE_USE_MOCK=false` + `VITE_API_BASE_URL` | 真实 HTTP 网关                            |

### 启动与停用

```bash
npm run mock:server
# [mock-server] listening on http://127.0.0.1:3001

npm run dev:mock
# 同时启动 mock 服务与 H5，Ctrl+C 会同步关闭两个进程
```

```bash
# 手动组合：先起 mock 服务，再以真实请求模式起 H5
npm run mock:server
VITE_USE_MOCK=false VITE_API_BASE_URL=http://127.0.0.1:3001 npm run dev:h5
```

Windows PowerShell：

```powershell
$env:VITE_USE_MOCK="false"
$env:VITE_API_BASE_URL="http://127.0.0.1:3001"
npm run dev:h5
```

### 配置

| 变量                 | 默认值      | 说明                                                           |
| -------------------- | ----------- | -------------------------------------------------------------- |
| `MOCK_PORT`          | `3001`      | Mock 服务端口                                                  |
| `MOCK_HOST`          | `127.0.0.1` | Mock 服务监听地址                                              |
| `MOCK_DELAY_MS`      | `260`       | 普通响应延迟                                                   |
| `MOCK_SLOW_DELAY_MS` | `1200`      | `slow` 场景延迟                                                |
| `VITE_USE_MOCK`      | `true`      | `false` 时走真实 HTTP                                          |
| `VITE_API_BASE_URL`  | 空          | 真实请求基地址；本地服务可填 `http://127.0.0.1:3001` 或 `/api` |

Vite 已配置 `/api` → `http://127.0.0.1:3001` 代理。把 `VITE_API_BASE_URL=/api` 即可通过开发服务器代理访问本地 Mock，避免跨域；直接填写本地服务地址也可以，服务已开启 CORS。

### 场景切换

`normal | empty | failure | slow` 与进程内 Mock 行为一致，可通过 header 或 query 指定：

```bash
curl -H "X-Mock-Scenario: empty" http://127.0.0.1:3001/library
curl "http://127.0.0.1:3001/library?__mock_scenario__=failure"
```

- `empty`：首页灵感工坊、创作台分镜/草稿、作品库返回空数据。
- `failure`：返回 `code: 50001`，HTTP 500。
- `slow`：延迟 1200ms。

为便于验证错误分支，本地服务额外支持单次强制错误与延迟覆盖（仅调试用）：

```bash
curl "http://127.0.0.1:3001/home/overview?__mock_error__=40101"  # HTTP 401 / code 40101
curl "http://127.0.0.1:3001/home/overview?__mock_error__=40901"  # HTTP 409 / code 40901
curl "http://127.0.0.1:3001/library?__mock_delay__=1500"          # 覆盖本次延迟
```

### 数据一致性

`mock-server/index.mjs` 直接复用 `src/mock/index.js` 的路由与 fixture，与进程内 Mock 是同一份数据源；新增接口时只需在 `src/mock` 实现一次。任务状态在服务进程内按创建时间推进，重启服务后任务记录清空。

## 13. 待确认事项

1. 页面截图中的作品库统计“共 18 幅 / 全部 19”口径不一致；本契约要求 `summary` 与 `tabs.all.count` 使用同一数据源，最终数量以数据库索引为准。
2. 灵感点余额的扣减时机、并发创建任务的幂等键、失败是否退回余额，需要后端明确。
3. 生成结果的媒体地址、宽高、时长、失败原因字段尚未定义。
4. 首页今日推荐是否支持多图轮播、天气/节气数据来源尚未定义。
5. 上传接口的真实协议（直传签名 / multipart）待后端确认。
