<script lang="ts">
import { PAGE_PATHS } from "@/apis/constants";
import { getLastPage, rememberPage } from "@/router";
import { getToken } from "@/utils/auth";

export default {
  onLaunch() {
    // #ifdef H5
    // H5 刷新后入口地址不带页面 hash 或停留在登录页时，恢复上次访问的页面。
    if (!getToken()) {
      return;
    }

    const hashPath = window.location.hash.replace(/^#\//, "");

    if (!hashPath || hashPath.startsWith("pages/auth/index")) {
      uni.reLaunch({ url: getLastPage() || PAGE_PATHS.HOME });
    }
    // #endif
  },
  onShow() {
    // 记录当前页面，作为刷新后恢复页面的依据。
    const pages = getCurrentPages();
    const currentRoute = pages[pages.length - 1]?.route as string | undefined;

    if (!getToken() || !currentRoute || `/${currentRoute}` === PAGE_PATHS.AUTH) {
      return;
    }

    rememberPage(`/${currentRoute}`);
  },
};
</script>

<style lang="scss">
page,
view,
text,
button,
input,
textarea,
label,
scroll-view,
picker {
  font-family: $font-family-base;
}

page {
  height: 100%;
  overflow: hidden;
  background: $color-bg-page;
  color: $color-ink;
  font-size: $font-size-body;
  line-height: $line-height-normal;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

/* Element Plus 仅在 H5 端生效，变量对齐同一字体栈与字号 */
/* #ifdef H5 */
:root {
  --el-font-family: #{$font-family-base};
  --el-font-size-base: #{$font-size-body};
}
/* #endif */

/* #ifdef H5 */
/* 宽屏下限制内容宽度并居中，配合 rpxCalcMaxDeviceWidth 避免 rpx 被无限放大 */
@media (min-width: 768px) {
  body {
    background: $color-bg-page;
  }

  uni-page-body {
    max-width: $desktop-content-width;
    margin: 0 auto;
    background: $color-bg-page;
  }
}
/* #endif */

html,
body,
page,
uni-page-body {
  scrollbar-width: none;
}

html::-webkit-scrollbar,
body::-webkit-scrollbar,
page::-webkit-scrollbar,
uni-page-body::-webkit-scrollbar,
.uni-scroll-view::-webkit-scrollbar,
.uni-scroll-view-content::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
</style>
