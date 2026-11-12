<script lang="ts">
import { PAGE_PATHS } from "@/apis/constants";
import { getLastPage, rememberPage } from "@/router";
import { getToken } from "@/utils/auth";

export default {
  onLaunch() {
    // #ifdef H5
    const hashPath = window.location.hash.replace(/^#\//, "");
    const isAuthPage = !hashPath || hashPath.startsWith("pages/auth/index");

    // 未登录时直达地址或刷新落在内部页面一律回登录页；地址为空时由 pages.json 首项进入登录页。
    if (!getToken()) {
      if (!isAuthPage) {
        uni.reLaunch({ url: PAGE_PATHS.AUTH });
      }

      return;
    }

    // H5 刷新后入口地址不带页面 hash 或停留在登录页时，恢复上次访问的页面。
    if (!hashPath || isAuthPage) {
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
  background: linear-gradient(180deg, #ffecd2 0%, #fff8ec 48%, #fffdfb 100%);
  color: $color-ink;
  font-size: 28rpx;
  line-height: 1.6;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

/* Element Plus 仅在 H5 端生效，变量对齐同一字体栈与字号 */
/* #ifdef H5 */
:root {
  --el-font-family: #{$font-family-base};
  --el-font-size-base: #{28rpx};
}
/* #endif */

/* #ifdef H5 */
@media (min-width: 768px) {
  body {
    background: linear-gradient(180deg, #ffecd2 0%, #fff8ec 48%, #fffdfb 100%);
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  uni-page-body {
    max-width: 750px;
    margin: 0 auto;
    background: linear-gradient(180deg, #ffecd2 0%, #fff8ec 48%, #fffdfb 100%);
  }
}

@media (min-width: 1200px) {
  uni-page-body {
    width: 100%;
    box-sizing: border-box;
    background: linear-gradient(180deg, #ffecd2 0%, #fff8ec 48%, #fffdfb 100%);
  }

  uni-page-body:has(.app-bottom-nav) > :first-child {
    margin-left: 220px;
    width: calc(100% - 220px);
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
