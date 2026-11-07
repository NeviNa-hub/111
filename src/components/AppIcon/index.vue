<template>
  <view class="app-icon" :class="`app-icon--${name}`" aria-hidden="true"></view>
</template>

<script setup>
defineProps({
  /** 图标名称。 */
  name: { type: String, required: true },
  /** 图标尺寸。 */
  size: { type: String, default: "32rpx" },
});
</script>

<style scoped>
.app-icon {
  position: relative;
  display: inline-block;
  width: v-bind(size);
  height: v-bind(size);
  flex-shrink: 0;
  vertical-align: middle;
}

.app-icon::before,
.app-icon::after {
  position: absolute;
  content: "";
}

.app-icon--check::before {
  top: 22%;
  left: 18%;
  width: 60%;
  height: 35%;
  border-bottom: 2rpx solid currentColor;
  border-left: 2rpx solid currentColor;
  transform: rotate(-45deg);
}

.app-icon--spark::before {
  top: 10%;
  left: 42%;
  width: 16%;
  height: 80%;
  border-radius: 8rpx;
  background: currentColor;
}

.app-icon--spark::after {
  top: 42%;
  left: 10%;
  width: 80%;
  height: 16%;
  border-radius: 8rpx;
  background: currentColor;
}

.app-icon--grid::before {
  top: 10%;
  left: 10%;
  width: 28%;
  height: 28%;
  border: 2rpx solid currentColor;
  box-shadow:
    26rpx 0 0 -2rpx #fff,
    26rpx 0 0 0 currentColor,
    0 26rpx 0 -2rpx #fff,
    0 26rpx 0 0 currentColor,
    26rpx 26rpx 0 -2rpx #fff,
    26rpx 26rpx 0 0 currentColor;
}
</style>
