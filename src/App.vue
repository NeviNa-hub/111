<script lang="ts">
export default {};
</script>

<style lang="scss">
/* 全局排版基线：单一字体栈、统一正文颜色与行高 */
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
