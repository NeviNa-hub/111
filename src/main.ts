import { createSSRApp } from "vue";
import "@/router";

// #ifdef H5
import ElButton from "element-plus/es/components/button/index.mjs";
import ElForm from "element-plus/es/components/form/index.mjs";
import ElIcon from "element-plus/es/components/icon/index.mjs";
import ElInput from "element-plus/es/components/input/index.mjs";
import ElRadio from "element-plus/es/components/radio/index.mjs";
import "element-plus/es/components/button/style/css";
import "element-plus/es/components/form/style/css";
import "element-plus/es/components/form-item/style/css";
import "element-plus/es/components/icon/style/css";
import "element-plus/es/components/input/style/css";
import "element-plus/es/components/radio/style/css";
import "element-plus/es/components/radio-button/style/css";
import "element-plus/es/components/radio-group/style/css";

// 按需注册当前用到的 Element Plus 组件；表单项与单选子组件由父组件一并注册。
const ELEMENT_PLUS_COMPONENTS = [ElButton, ElForm, ElIcon, ElInput, ElRadio];
// #endif

import App from "./App.vue";

export function createApp() {
  const app = createSSRApp(App);

  // #ifdef H5
  ELEMENT_PLUS_COMPONENTS.forEach((component) => app.use(component));
  // #endif

  return {
    app,
  };
}
