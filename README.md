# 妙笔生花 · AI 创作前端

基于 uni-app（Vue 3）的 AI 创作应用前端，覆盖「文字生图 / 视频创作 / 图片优化」三条创作链路，支持 H5 与微信小程序等多端编译。整体采用茶金 + 暖杏的国风暖色视觉。

## 功能概览

| 模块 | 说明 |
| --- | --- |
| 登录 / 注册 | 账号密码登录、注册、协议勾选，会话令牌持久化 |
| 首页 · 文稿库 | 灵感工坊创作入口 |
| 创作台 | 创作类型选择 |
| 文字生图 | 提示词编辑 → 挑选画风 → 设定画幅 → 画卷生成 |
| 视频创作 | 画幅 / 创作模式 / 意境构想 → 规格画质 → 渲染预览 |
| 图片优化 | 上传原图、优化项选择、效果对比 |
| 作品库 | 全部 / 已完成 / 创作中 / 草稿筛选、触底分页、创作类型标识 |
| 我的 | 用户资料、积分明细 |
| 工作坊 | 建设中占位页，内嵌灵感工坊轮播提供创作入口 |

## 技术栈

- uni-app 3 + Vue 3（`<script setup>`）+ Vite 5
- Element Plus + `@element-plus/icons-vue`
- SCSS，全局设计令牌见 `src/styles/tokens.scss`
- Vue `reactive` 会话状态（`src/stores`）
- 内置 Mock 数据层（`src/mock` + `mock-server`）

## 快速开始

```bash
npm install
npm run dev:h5          # H5 预览
npm run dev:mp-weixin   # 微信小程序，开发者工具导入 dist/dev/mp-weixin
npm run build:mp-weixin # 小程序生产产物
```

Mock 开关：`.env.development` 中 `VITE_USE_MOCK=true` 走内置模拟数据，改为 `false` 走真实后端（基地址由 `VITE_API_BASE_URL` 配置）。

## 目录结构

```
src/
├─ apis/        # 接口请求层
├─ components/  # 公共组件（底部导航、页头、轮播、生成弹窗等）
├─ hooks/       # 复用逻辑
├─ mock/        # Demo 数据与规则
├─ pages/       # 页面
├─ router/      # 路由与登录守卫
├─ stores/      # 会话状态
├─ styles/      # 全局设计令牌
└─ utils/       # 请求、鉴权等工具
```

## APP端 实现效果预览。

### 登录 / 注册
<img width="375" height="812" alt="image" src="https://github.com/user-attachments/assets/784b4055-d5ea-45bf-bf31-45d7ce3df7e5" />
<img width="375" height="812" alt="image" src="https://github.com/user-attachments/assets/644cd5bb-0eaf-469e-bc39-077db537d41d" />



### 首页 · 文稿库
<img width="374" height="813" alt="image" src="https://github.com/user-attachments/assets/c9c23b41-e923-42ae-ad65-386ce330c90f" />


### 创作台
<img width="375" height="812" alt="image" src="https://github.com/user-attachments/assets/54be160d-e951-40f1-9add-b41ff51ee2a1" />



### 文字生图
<img width="450" height="1013" alt="image" src="https://github.com/user-attachments/assets/0d606c14-036a-4a06-b70f-0ddbb2fe0e87" />
<img width="450" height="1013" alt="image" src="https://github.com/user-attachments/assets/1e802c53-323d-46a7-bb73-7b3c2d545724" />
<img width="450" height="1013" alt="image" src="https://github.com/user-attachments/assets/580b01e0-9c24-402e-a9aa-fa7e272fe71f" />
<img width="450" height="1013" alt="image" src="https://github.com/user-attachments/assets/d8d5147d-2c2b-4c3f-b32f-10104ee6e82b" />


### 视频创作
<img width="450" height="1013" alt="image" src="https://github.com/user-attachments/assets/f67bc1c1-80c1-4313-8d6e-3503e1ed55ef" />
<img width="450" height="1013" alt="image" src="https://github.com/user-attachments/assets/2ddc4105-4836-4cb9-ba84-7c3c2e57c0f5" />
<img width="453" height="330" alt="image" src="https://github.com/user-attachments/assets/bdf1c4dc-0748-4a82-b61d-e7d76ff72054" />



### 图片优化
<img width="450" height="1013" alt="image" src="https://github.com/user-attachments/assets/dce2fb18-2ec7-481b-b66d-ad939754f3f2" />
<img width="465" height="522" alt="image" src="https://github.com/user-attachments/assets/4adb282b-2687-4ff2-8eb9-c95d7e66adb8" />



### 作品库
<img width="450" height="1013" alt="image" src="https://github.com/user-attachments/assets/ceaefe49-3798-4b4d-b322-5eec5259eb3b" />
<img width="452" height="1013" alt="image" src="https://github.com/user-attachments/assets/00ba9d8a-71ff-4494-b427-3dd7f9ffdc03" />


### 我的
<img width="375" height="812" alt="image" src="https://github.com/user-attachments/assets/b234b431-1489-43cb-874f-c0ecb53303cc" />
<img width="375" height="812" alt="image" src="https://github.com/user-attachments/assets/0c375e12-1b1b-460e-aa5b-d9640961c670" />




### 工作坊
<img width="450" height="1013" alt="image" src="https://github.com/user-attachments/assets/2a5e88a4-4bf5-4e38-93fc-85d964dbbcac" />



## PC端 实现效果预览。
<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/3254bf13-01ca-4044-a4b2-9d4a2a373a48" />

<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/077dce46-1d4b-4c8c-8f7a-d1227387bb8e" />

<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/e131203c-9779-4936-b2f8-c794b05cda05" />
