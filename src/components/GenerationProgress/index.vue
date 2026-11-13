<template>
  <view
    class="generation-progress"
    :class="{ 'is-optimization': data.mode === 'optimization' }"
  >
    <app-page-header :title="data.title" />
    <generation-dialog
      v-if="data.mode === 'optimization'"
      type="optimization"
      :status="data.status"
      :progress="data.progress"
      :progress-label="data.stageLabel"
      :note="data.tip"
      :result-url="data.resultUrl"
      @back="goWorkbench"
      @library="goLibrary"
    />
    <scroll-view scroll-y :show-scrollbar="false" class="generation-content">
      <view class="progress-body">
        <view class="progress-card">
          <view class="progress-head">
            <text class="progress-heading">{{ data.progressTitle }}</text>
            <text class="progress-cost">
              {{ data.cost === null ? "—" : data.cost }} 灵感点
            </text>
          </view>
          <view class="progress-ring">
            <text>{{ data.progress }}<small>%</small></text>
            <label>{{ data.progressLabel }}</label>
          </view>
          <view class="progress-track"
            ><view :style="{ width: `${data.progress}%` }"></view
          ></view>
        </view>
        <view v-if="data.resultUrl" class="result-card">
          <image
            class="result-image"
            :src="data.resultUrl"
            mode="aspectFit"
            @tap="previewResult"
          />
          <text class="result-hint"
            >轻触图片放大查看；图片链接约 1 小时后失效，请及时保存</text
          >
        </view>
        <view class="cloud-tip">{{ data.tip }}</view>
      </view>
    </scroll-view>
    <view class="generation-actions">
      <button class="primary-action" @tap="goLibrary">
        前往作品库查看进度
      </button>
      <button class="secondary-action" @tap="goWorkbench">返回工作台</button>
    </view>
  </view>
</template>

<script setup>
import AppPageHeader from "@/components/AppPageHeader/index.vue";
import GenerationDialog from "@/components/GenerationDialog/index.vue";

const props = defineProps({
  /** 任务进度页面展示数据。 */
  data: { type: Object, required: true },
});

// 预览生成结果大图
const previewResult = () => {
  if (!props.data.resultUrl) {
    return;
  }

  uni.previewImage({ urls: [props.data.resultUrl] });
};

// 前往作品库。
const goLibrary = () => {
  uni.navigateTo({ url: "/pages/library/index" });
};

// 返回创作台。
const goWorkbench = () => {
  uni.reLaunch({ url: "/pages/workbench/index" });
};
</script>

<style scoped lang="scss">
.generation-progress {
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #ffecd2 0%, #fff8ec 48%, #fffdfb 100%);
  color: $color-ink;
}

.generation-content {
  height: calc(100vh - #{100rpx} - var(--status-bar-height, 0px));
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  padding: 0 32rpx;
  padding-bottom: calc(250rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(250rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

/* 进度模块整体垂直居中，内容较矮时不在顶部留出大片空白 */
.progress-body {
  width: 100%;
  margin: auto 0;
}

.progress-card {
  padding: 36rpx 40rpx 44rpx;
  border-radius: 32rpx;
  background: $color-surface;
  box-shadow: 0 10rpx 30rpx rgba(95, 133, 117, 0.06);
  text-align: center;
}

.progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.progress-heading {
  overflow: hidden;
  color: $color-ink;
  font-size: 34rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-cost {
  flex-shrink: 0;
  padding: 8rpx 20rpx;
  border: 1rpx solid #86e5dc;
  border-radius: 999rpx;
  color: $color-primary;
  font-size: 22rpx;
  line-height: 1.4;
  @include numeric;
}

.progress-ring {
  margin: 48rpx auto 0;
  width: 240rpx;
  height: 240rpx;
  border: 2rpx dashed #abd9d5;
  border-radius: 50%;
  background: rgba(228, 241, 238, 0.45);
  text-align: center;
}

.progress-ring text {
  display: block;
  margin-top: 68rpx;
  color: $color-ink;
  font-size: 68rpx;
  font-weight: 700;
  @include numeric;
}

.progress-ring text small {
  color: $color-primary;
  font-size: 26rpx;
}

.progress-ring label {
  display: block;
  margin-top: 8rpx;
  color: #4e665e;
  font-size: 24rpx;
}

.progress-track {
  height: 12rpx;
  margin-top: 48rpx;
  overflow: hidden;
  border-radius: 8rpx;
  background: #edf2ef;
}

.progress-track view {
  height: 100%;
  border-radius: inherit;
  background: $color-primary;
}

.result-card {
  margin-top: 24rpx;
  padding: 20rpx;
  border-radius: 24rpx;
  background: $color-surface;
  text-align: center;
}

.result-image {
  width: 100%;
  height: 420rpx;
}

.result-hint {
  display: block;
  margin-top: 12rpx;
  color: $color-muted;
  font-size: 22rpx;
}

.cloud-tip {
  margin-top: 20rpx;
  padding: 16rpx;
  border: 1rpx solid #b8e3d7;
  border-radius: 24rpx;
  background: #f8faf7;
  color: #8a6840;
  font-size: 24rpx;
  line-height: 1.6;
  text-align: center;
}

/* ============================================================
 * 桌面 H5 适配：宽屏下内容限宽居中，卡片不被拉满全屏
 * ============================================================ */
@media (min-width: $breakpoint-desktop) {
  .generation-content {
    max-width: 720px;
    margin: 0 auto;
  }
}

.generation-actions {
  @include action-bar;
}

.generation-actions button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: $tap-size;
  padding: 0;
  border: 0;
  border-radius: 32rpx;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1;
}

.generation-actions button::after {
  border: 0;
}

.primary-action {
  background: $color-primary;
  color: #fff;
}

.secondary-action {
  margin-top: 16rpx;
  background: $color-surface;
  color: #4e665e;
  box-shadow: 0 2rpx 12rpx rgba(30, 58, 70, 0.06);
}

.is-optimization .generation-content,
.is-optimization .generation-actions {
  display: none;
}
</style>
