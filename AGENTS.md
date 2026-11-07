# 开发约束

适用于全仓库。任务开始或规则变化时阅读。用户明确要求优先；只记录后续开发必须遵守的规则，页面细节以现有实现和当次需求为准。

## 开工

- 先运行 `git status --short`，保护已有改动；修改前阅读目标文件、调用方、同类实现，并搜索可复用组件、Hook、API、Store 和样式。
- 只改需求必需的文件；不顺手重构或清理。未经明确要求，不加依赖、不改接口协议、不执行 `git add`、提交、推送或部署。
- 接口或业务规则不明时先查现有契约；仍影响产品行为再确认，不写死假设。

## 代码结构

- 使用现有 Vue 3 + JavaScript、Vite、Pinia、Element Plus、SCSS、npm；不引入 TypeScript 或新架构。
- 动态菜单页面放 `views/{resource}/index.vue`，使菜单的 `component` 与页面目录名一致；其他页面可按模块放 `views/{module}/{resource}/index.vue`。专用组件/Hook 就近维护，公共能力放 `src/components`、`src/hooks`、`src/utils`。不跨模块引用内部实现。
- 页面/Hook 管交互，API 管请求，Store 只管会话、权限、上下文和应用设置；Demo 数据及规则只放 `src/mock`。
- Vue 按 `<template>`、`<script setup>`、`<style scoped lang="scss">` 排列；Vue 组件文件和脚本导入名用 PascalCase，本项目自定义组件的模板标签用 kebab-case（如 `<base-dialog>`），`@element-plus/icons-vue` 图标标签保持 PascalCase，JS 文件用 kebab-case。
- 跨目录导入用 `@/`；Store 统一从 `@/stores` 引入，不依赖 `stores/modules` 内部文件。

## 代码布局

- `<script setup>` 和 JS 文件的导入按 Vue/第三方包、`@/` 仓库模块、相对路径分组；组间空一行，同组导入连续排列。
- 一个 `const` / `let` 声明只绑定一个变量，不用逗号串联多个声明；从同一对象解构多个字段仍算一个声明。相关变量同组连续排列，不同用途的组间空一行。
- 组件脚本依次放置导入、Props/Emits/注入、Store/Router 等上下文、常量和响应式状态、派生值、交互与请求方法、生命周期与监听注册。实际顺序以初始化依赖为准；只为说明约束或原因写注释，不用逐行说明变量。
- 方法按调用流程或职责排列，辅助方法放在首次同步调用之前；方法与方法之间空一行，生命周期注册与前面的方法之间也空一行。避免只靠 Prettier 整理代码结构。
- Vue 模板中的插值文案需要分行时，开始标签、完整的 `{{ ... }}` 文案和结束标签各占一行；不要将 `{{`、表达式和 `}}` 拆到不同的行。

## 命名与复用

- 模块、资源及普通文件夹用小写 kebab-case；公共组件目录用 PascalCase（如 `BaseDialog`），页面专用目录用 `components` / `hooks`。不为统一命名改动现有路径。
- 自定义方法用 camelCase 和明确的“动词 + 对象”命名，如 `loadUsers`、`resetForm`、`handleSubmit`；Hook 用 `useXxx`，布尔判断用 `is` / `has` / `can` 前缀。对接后端的原始 API 函数名保持现有契约。
- 独立定义的自定义方法统一用 `const` 箭头函数，异步方法用 `const name = async (...) => {}`；不新增 `function` 声明或函数表达式。对象字面量内的方法遵循现有接口结构。转换旧方法时先检查调用顺序、递归和导出方式，避免改变初始化时机与外部 API 名称。
- 相邻方法定义之间保留一个空行；方法前的 JSDoc 与该方法紧邻，不在注释和定义之间插空行。
- 稳定常量用 UPPER_SNAKE_CASE；样式类用语义化 kebab-case，状态类用 `is-` / `has-` 前缀，不新增 ID 选择器。
- 页面控件先用 Element Plus，再复用现有公共组件；专用组件留在页面目录。组件通过 props/emits 传递数据与事件，不直接改 Props 或依赖其他页面内部状态。
- 小范围逻辑优先留在现有文件；不为单个常量、判断或少量重复代码新增文件、封装或状态。只有行为一致且抽取能降低整体复杂度时才放公共能力：纯逻辑放 `utils`，响应式逻辑放 `hooks`，请求放 `apis`，通用界面放 `components`。公共方法不夹带模块专属字段或页面状态。

## 组件与异步

- Props 声明类型和默认值且不直接修改；`defineProps` 前用中文 JSDoc 逐项说明传入属性的类型和用途，每个属性的定义统一放在一行。Emits 显式声明，双向绑定用 `modelValue`；派生值用 `computed`，列表用稳定业务主键。
- 不用 `watch` 代替可计算值；`v-if` 与 `v-for` 不放在同一元素上。
- 表单有初值、校验、提交中状态和防重复提交；关闭或切换记录时重置。
- 使用 Element Plus 表单时绑定 `model`、`rules` 和字段 `prop`；提交用 `validate()`，单字段操作用 `validateField()`。字段错误在对应表单项展示，不在提交方法中重复手写校验或用全局消息代替。
- 卸载时清理请求、计时器和监听器；取消旧请求或校验请求代次，防止旧响应覆盖新状态。

## 请求与权限

- 请求链为“页面/Hook → 对应 API → `src/utils/request.js`”；页面不直接 `fetch`。遵守接口字段和 `{ code, data }` 响应结构，异常不能当空数据。
- 登录及 GEO 管理使用真实后端和现有原始 API；其他模块的 Demo 只经 `src/apis/demo/client.js` 访问 `src/mock`。不得伪造后端未提供的操作。
- 登录与用户资料流程沿用 `E:/Gitee/system/hlg-geo-frontend-test`：页面调用原始登录 API，令牌写入本站独立 Cookie，Store 保存 `/admin/profile` 原始资料；路由保留本项目现有实现。参考项目持久化 `isLogin` 和完整资料、吞掉资料请求错误的做法不沿用，刷新时以后端会话重新确认。
- 请求层处理通用错误和会话；页面处理业务错误，避免重复提示。切换账号、组织或权限时取消旧请求并清缓存；缓存不作为授权依据。
- 动态路由经 `router/addRoutes.js` 的菜单校验和固定组件映射注册；按钮不注册路由。GEO 固定菜单仅是入口，数据和写操作仍由后端逐请求鉴权。

## UI 与安全

- 优先复用 Element Plus、`BaseDialog`、`BaseMessageBox`、`ResourceShell` 和 `BasePagination`；公共样式放 `src/styles`，页面样式保持 scoped。
- Vue 模板标签不添加 `aria-label` 属性；控件含义优先通过可见文案和现有组件行为表达。
- 页面整体最小宽度为 1440px；不为页面根容器或整体内容设置小于 1440px 的 `max-width`，也不新增小于 1440px 的 `@media (max-width: ...)` 断点。表单、弹窗等内部组件可按自身设计限制宽度。
- 样式使用 SCSS 结构：关联的子元素、修饰符和交互状态在所属选择器内嵌套，状态选择器用 `&`；独立选择器保持并列，避免无意义嵌套和过深层级。保留 CSS 自定义属性作为主题变量。
- 相邻样式规则块之间保留一个空行，包括 SCSS 嵌套规则；声明与紧随其后的嵌套规则之间也留一个空行。
- 删除、充值等危险操作二次确认并防重复提交；用户 HTML 经 DOMPurify 清洗，外链新窗口加 `rel="noopener noreferrer"`。
- Token 仅按登录约定写入本站 Cookie；不把密钥、密码、Token 或不必要的个人信息写入源码、日志、URL、其他存储或前端环境变量。

## 交付

- 新增或修改的导出方法、复用方法、复杂业务方法，以及页面和页面专用组件中的具名方法，按参数情况写注释：接收参数的方法沿用中文 JSDoc，首句说明用途，用 `@param {类型} 名称` 说明参数、`@returns {类型}` 说明返回值，必要时说明副作用和异常；异步返回标 `Promise<类型>`，无返回值标 `void`。不接收参数的方法用 `//` 简述用途，不写 JSDoc；其他简单私有方法不凑注释。
- 权限、路由和异常恢复的复杂分支说明约束与原因；无空 `catch`、调试代码或未使用变量。
- 新增或修改的代码必须用项目 Prettier 格式化（90 列、2 空格、双引号、分号、ES5 尾逗号、LF）；用 `npx prettier --write <修改文件>` 只处理本次修改，不改动无关文件。
- 代码变更后运行 `npm run format:check`、`npm run build` 和相关检查，覆盖一个失败或边界路径；不得跳过检查以求通过。
- 说明改动、实际验证和未验证范围；构建通过不等于自动化测试通过。
