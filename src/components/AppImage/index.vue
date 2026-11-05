<template>
  <view class="app-image">
    <image
      v-if="!isUnavailable"
      class="app-image-media"
      :src="src"
      :mode="mode"
      @error="handleError"
    />
    <view v-else class="app-image-fallback">
      <text class="fallback-mark">墨</text>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from "vue";

/**
 * @property {string} src 图片地址，为空时直接展示占位。
 * @property {string} mode 图片裁剪模式，透传给 image。
 */
const props = defineProps({
  src: { type: String, default: "" },
  mode: { type: String, default: "aspectFill" },
});

const failed = ref(false);
const isUnavailable = computed(() => failed.value || !props.src);

// 图片地址变化时重置失败状态
watch(
  () => props.src,
  () => {
    failed.value = false;
  }
);

// 记录加载失败，统一改用占位底纹
const handleError = () => {
  failed.value = true;
};
</script>

<style scoped lang="scss">
.app-image {
  display: block;
  overflow: hidden;
  background: $color-surface-muted;
}

.app-image-media {
  display: block;
  width: 100%;
  height: 100%;
}

.app-image-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: $color-primary-light;
  color: $color-primary-soft;
}

.fallback-mark {
  font-size: $font-size-title;
  font-weight: $font-weight-bold;
  line-height: $line-height-tight;
}
</style>
