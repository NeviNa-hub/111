<template>
  <view class="workbench-page">
    <app-page-header title="创作台" />
    <scroll-view scroll-y :show-scrollbar="false" class="content">
      <!-- 01 文字生图 -->
      <view class="tool-card tool-teal">
        <view class="card-heading">
          <text class="card-title">文字生图</text>
          <text class="card-tag">墨韵·宣</text>
          <text class="card-ready">向导就绪</text>
        </view>
        <text class="card-desc">三步流式构思，从画风择定到纸墨挥毫。</text>
        <view class="card-art">
          <app-image
            class="art-image"
            src="/static/theme/theme-images.jpg"
            mode="aspectFill"
          />
          <text class="art-chip chip-left">留白神韵</text>
          <text class="art-chip chip-right">青绿工笔</text>
        </view>
        <view class="card-footer">
          <text class="footer-note">支持宣纸留白与精细排版</text>
          <button class="footer-button" @click="startTool('文字生图')">研墨生图</button>
        </view>
      </view>

      <!-- 02 视频创作 -->
      <view class="tool-card tool-blue">
        <view class="card-heading">
          <text class="card-title">视频创作</text>
          <text class="card-tag tag-blue">流光·镜</text>
          <text class="card-ready ready-blue">多镜连贯</text>
        </view>
        <text class="card-desc">精准掌控光影轨迹与运镜调度，独立成片。</text>
        <view class="film-art">
          <view class="film-title">
            <text class="film-name">水墨分镜胶卷轨道</text>
            <view class="film-marquee">
              <view class="film-marquee-track">
                <view v-for="copy in 2" :key="copy" class="film-marquee-group">
                  <text v-for="chip in filmChips" :key="chip" class="film-chip">
                    {{ chip }}
                  </text>
                </view>
              </view>
            </view>
          </view>
          <view class="film-frames">
            <view v-for="frame in frames" :key="frame.frameId" class="film-frame">
              <i class="frame-thumb"></i>
              <small class="frame-label">{{ frame.name }}</small>
            </view>
            <text v-if="!frames.length" class="film-empty">分镜待载入</text>
          </view>
        </view>
        <view class="card-footer">
          <text class="footer-note">四镜连贯 · 独立成片</text>
          <button class="footer-button button-blue" @click="startTool('视频创作')">
            逐帧调度
          </button>
        </view>
      </view>

      <!-- 03 图片优化 -->
      <view class="tool-card tool-purple">
        <view class="card-heading">
          <text class="card-title">图片优化</text>
          <text class="card-tag tag-purple">净辞·重塑</text>
          <text class="card-ready ready-purple">无损超分</text>
        </view>
        <text class="card-desc">还原本真质感，微米级去噪与旧照色彩修复。</text>
        <view class="compare-art">
          <app-image
            class="art-image compare-before"
            src="/static/theme/theme-optimization-before.jpg"
            mode="aspectFill"
          />
          <app-image
            class="art-image compare-after"
            src="/static/theme/theme-optimization-after.jpg"
            mode="aspectFill"
          />
          <text class="compare-handle">↔</text>
          <text class="compare-tag tag-original">旧影修复</text>
          <text class="compare-tag tag-upscaled">纤毫毕现</text>
        </view>
        <view class="card-footer">
          <text class="footer-note">最大支持五千万像素解析</text>
          <button class="footer-button button-purple" @click="startTool('图片优化')">
            净炼重绘
          </button>
        </view>
      </view>

      <!-- 草稿与便签库 -->
      <view class="draft-card">
        <view class="draft-title">
          <text>草稿与便签库</text>
          <text class="draft-subtitle">完整归档</text>
        </view>
        <view v-for="draft in drafts" :key="draft.draftId" class="draft-row">
          <text class="draft-name">{{ draft.title }} · {{ draft.time }}</text>
          <text class="draft-status">{{ draft.status }}</text>
        </view>
        <app-state-hint
          v-if="!drafts.length"
          type="empty"
          title="暂无草稿"
          description="完成一次创作后，草稿会自动归档到这里"
        />
      </view>
    </scroll-view>
    <app-bottom-nav active="creation" />
  </view>
</template>

<script setup>
import AppBottomNav from "@/components/AppBottomNav/index.vue";
import AppImage from "@/components/AppImage/index.vue";
import AppPageHeader from "@/components/AppPageHeader/index.vue";

const frames = [
  { frameId: 1, name: "起势·淡雾" },
  { frameId: 2, name: "承转·远山" },
  { frameId: 3, name: "流光·松石" },
  { frameId: 4, name: "收敛·留白" },
];
const drafts = [
  {
    draftId: 1,
    title: "《松山夜笛》插图构思",
    time: "2小时前",
    status: "待生成",
  },
  { draftId: 2, title: "茶室空间运镜脚本设计", time: "昨日", status: "已分镜" },
  { draftId: 3, title: "老照片人物去污处理", time: "3日前", status: "已完成" },
];
const filmChips = ["四开画幅", "轨迹平滑", "60FPS 帧率"];

/**
 * 根据工具名称进入对应创作流程或公共待开发页。
 * @param {string} name 工具名称。
 * @returns {void}
 */
const startTool = (name) => {
  if (name === "文字生图") {
    uni.navigateTo({ url: "/pages/image-creation/index" });
    return;
  }

  if (name === "图片优化") {
    uni.navigateTo({ url: "/pages/image-optimization/index" });
    return;
  }

  if (name === "视频创作") {
    uni.navigateTo({ url: "/pages/video-creation/index" });
    return;
  }

  uni.navigateTo({
    url: `/pages/under-development/index?title=${encodeURIComponent(name)}`,
  });
};
</script>

<style scoped lang="scss">
.workbench-page {
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #ffecd2 0%, #fff8ec 48%, #fffdfb 100%);
  color: $color-ink;
}

.content {
  height: calc(100vh - 210rpx - var(--status-bar-height, 0px));
  overflow-x: hidden;
  padding: 28rpx 40rpx;
  padding-bottom: calc(#{24rpx} + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.content-state {
  margin-bottom: 24rpx;
}

/* ========== 工具卡片通用结构 ========== */
.tool-card {
  margin-bottom: 28rpx;
  padding: 24rpx;
  border-radius: 28rpx;
  background: $color-surface;
  box-shadow: 0 6rpx 20rpx rgba(150, 100, 40, 0.14);
}

/* 卡片标题行 */
.card-heading {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.card-title {
  flex-shrink: 0;
  color: $color-primary;
  font-size: 34rpx;
  font-weight: 700;
}

.card-tag {
  flex-shrink: 0;
  padding: 8rpx 12rpx;
  border: 1rpx solid rgba(232, 106, 74, 0.3);
  border-radius: 8rpx;
  background: #fdeee9;
  color: #e86a4a;
  font-size: 22rpx;
}

.card-ready {
  flex-shrink: 0;
  margin-left: auto;
  color: $color-primary;
  font-size: 24rpx;
}

/* 卡片描述 */
.card-desc {
  display: block;
  margin: 16rpx 0 20rpx;
  color: #4e665e;
  font-size: 24rpx;
  line-height: 1.6;
}

/* 插图画区 */
.card-art,
.film-art,
.compare-art {
  position: relative;
  height: 320rpx;
  overflow: hidden;
  border-radius: 20rpx;
}

.art-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* 卡片底部（说明 + 按钮） */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 20rpx;
}

.footer-note {
  min-width: 0;
  color: #4e665e;
  font-size: 24rpx;
  @include text-ellipsis;
}

.footer-button {
  @include tap-area(72rpx);
  flex-shrink: 0;
  margin: 0;
  padding: 0 20rpx;
  border: 0;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #8a6840 0%, #9c6e38 100%);
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 1;
}

.footer-button:after {
  border: 0;
}

.footer-button:active {
  opacity: 0.85;
}

/* ========== 01 文字生图 · 插图角标 ========== */
.art-chip {
  position: absolute;
  bottom: 12rpx;
  padding: 8rpx 12rpx;
  border-radius: 8rpx;
  background: rgba(255, 255, 255, 0.9);
  color: #4e665e;
  font-size: 22rpx;
  animation: chip-shake 4s ease-in-out infinite;
}

.chip-left {
  left: 16rpx;
}

.chip-right {
  left: 156rpx;
  /* 与左侧错开摇晃时机，避免两个角标同步晃动 */
  animation-delay: 2s;
}

@keyframes chip-shake {
  0%,
  88%,
  100% {
    transform: rotate(0); /* 静止 */
  }

  93% {
    transform: rotate(-8deg); /* 左摆 */
  }

  97% {
    transform: rotate(8deg); /* 右摆 */
  }
}

/* ========== 02 视频创作 · 胶卷 ========== */
.film-art {
  padding: 22rpx;
  box-sizing: border-box;
  background: linear-gradient(180deg, #e5f3fb 0%, #f5fbfd 54%, #fff 100%);
  box-shadow: inset 0 0 0 1rpx #d7eaf5;
}

.film-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #d8e8f0;
}

.film-name {
  flex-shrink: 0;
  color: $color-ink;
  font-size: 26rpx;
  font-weight: 700;
  @include text-ellipsis;
}

/* 弹幕滚动区：两组相同内容循环位移，实现无缝滚动 */
.film-marquee {
  flex: 1;
  min-width: 0;
  margin-left: 20rpx;
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
}

.film-marquee-track {
  display: flex;
  width: max-content;
  animation: film-chip-scroll 12s linear infinite;
}

.film-marquee-group {
  display: flex;
  gap: 12rpx;
  padding-right: 12rpx;
}

@keyframes film-chip-scroll {
  to {
    transform: translateX(-50%);
  }
}

.film-meta {
  color: #92a3ac;
  font-size: 22rpx;
}

.film-frames {
  display: flex;
  align-items: flex-end;
  gap: 12rpx;
  /* margin: 20rpx 0; */
}

/* 从左到右逐渐放大：basis 取 auto 保证最小宽度装得下标签，剩余空间按递增比例分配，
 * 模拟胶片分镜的透视感，且窄屏下文字不会换行 */
.film-frame {
  overflow: hidden;
  padding: 8rpx;
  border: 1rpx solid #a9cde4;
  border-radius: 12rpx;
  background: #fff;
  text-align: center;
  box-sizing: border-box;
}

.film-frame:nth-child(1) {
  flex: 0.6 1 auto;
}

.film-frame:nth-child(2) {
  flex: 0.75 1 auto;
}

.film-frame:nth-child(3) {
  flex: 0.9 1 auto;
}

.film-frame:nth-child(4) {
  flex: 1.1 1 auto;
  border-color: #50b5ff;
  box-shadow: 0 6rpx 16rpx rgba(50, 156, 232, 0.2);
}

.frame-thumb {
  display: block;
  height: 88rpx;
  margin-bottom: 8rpx;
  border-radius: 8rpx;
  background-position: center;
  background-size: cover;
}

.film-frame:nth-child(1) .frame-thumb {
  height: 88rpx;
  background-image: url("../../assets/theme/theme-videos-1.jpg");
}

.film-frame:nth-child(2) .frame-thumb {
  height: 110rpx;
  background-image: url("../../assets/theme/theme-videos-2.jpg");
}

.film-frame:nth-child(3) .frame-thumb {
  height: 132rpx;
  background-image: url("../../assets/theme/theme-videos-3.jpg");
}

.film-frame:nth-child(4) .frame-thumb {
  height: 156rpx;
  background-image: url("../../assets/theme/theme-videos-4.jpg");
}

.frame-label {
  display: block;
  overflow: hidden;
  color: #5a7888;
  font-size: 22rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.film-empty {
  color: $color-muted;
  font-size: 24rpx;
}

.film-chip {
  padding: 8rpx 12rpx;
  border: 1rpx solid #ccf7d3;
  border-radius: 16rpx;
  background: #fff;
  color: #4e665e;
  font-size: 22rpx;
}

/* ========== 03 图片优化 · 对比图 ========== */
.compare-art {
  box-shadow: inset 0 0 0 1rpx rgba(255, 255, 255, 0.45);
}

.compare-handle {
  position: absolute;
  z-index: 3;
  top: 42%;
  left: 2%;
  width: 46rpx;
  height: 46rpx;
  border-radius: 50%;
  background: #fff;
  color: #595bdc;
  line-height: 46rpx;
  text-align: center;
  font-size: 26rpx;
  animation: handle-sweep 5s ease-in-out infinite;
}

/* 优化前铺底、优化后从左到右擦除显示，停留后收回并循环 */
.compare-before {
  z-index: 1;
}

.compare-after {
  z-index: 2;
  clip-path: inset(0 100% 0 0);
  animation: compare-wipe 5s ease-in-out infinite;
}

/* 3 秒擦入、2 秒停留后回到起点循环 */
@keyframes compare-wipe {
  0% {
    clip-path: inset(0 100% 0 0);
  }

  60%,
  100% {
    clip-path: inset(0 0 0 0);
  }
}

/* 手柄跟随擦除分界线移动，擦完后淡出 */
@keyframes handle-sweep {
  0% {
    left: 1%;
    opacity: 0;
  }

  60% {
    left: 92%;
    opacity: 1;
  }

  70%,
  100% {
    left: 96%;
    opacity: 0;
  }
}

.compare-tag {
  position: absolute;
  z-index: 3;
  bottom: 82rpx;
  padding: 8rpx 12rpx;
  border-radius: 8rpx;
  background: rgba(62, 75, 85, 0.85);
  color: #fff;
  font-size: 22rpx;
  opacity: 0;
}

/* 分界线扫过左侧后淡入（与 compare-wipe 同周期） */
.tag-original {
  left: 14rpx;
  animation: tag-original-show 5s ease-in-out infinite;
}

/* 分界线扫过右侧后淡入 */
.tag-upscaled {
  right: 14rpx;
  animation: tag-upscaled-show 5s ease-in-out infinite;
}

@keyframes tag-original-show {
  0%,
  8% {
    opacity: 0;
  }

  14%,
  100% {
    opacity: 1;
  }
}

@keyframes tag-upscaled-show {
  0%,
  40% {
    opacity: 0;
  }

  45%,
  100% {
    opacity: 1;
  }
}

.compare-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 66rpx;
  background: rgba(124, 130, 153, 0.92);
  color: #fff;
  font-size: 24rpx;
  line-height: 66rpx;
  text-align: center;
}

/* ========== 草稿与便签库 ========== */
.draft-card {
  margin-bottom: 24rpx;
  padding: 24rpx;
  border: 1rpx solid $color-line;
  border-radius: 28rpx;
  background: $color-surface;
}

.draft-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 8rpx;
  color: $color-ink;
  font-size: 34rpx;
  font-weight: 700;
}

.draft-subtitle {
  color: $color-muted;
  font-size: 24rpx;
  font-weight: 400;
}

.draft-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 12rpx;
  padding: 20rpx 16rpx;
  border: 1rpx solid $color-line;
  border-radius: 16rpx;
  color: #4e665e;
  font-size: 24rpx;
}

.draft-name {
  flex: 1;
  min-width: 0;
  @include text-ellipsis;
}

.draft-status {
  flex-shrink: 0;
  padding: 8rpx 12rpx;
  border: 1rpx solid #85e4da;
  border-radius: 8rpx;
  color: $color-primary;
  font-size: 22rpx;
}

/* ============================================================
 * 桌面 H5 适配：992px 以上切换为固定像素 + 双列栅格
 * ============================================================ */
@media (min-width: 992px) {
  /* 桌面断点下 rpx 会随视口放大，这里固定一套 px 刻度 */
  /* 与全局 rpx 刻度一致：宽屏下 1rpx ≈ 1px */
  $desktop-micro: 22rpx;
  $desktop-caption: 24rpx;
  $desktop-aux: 26rpx;
  $desktop-body: 28rpx;
  $desktop-metric: 30rpx;
  $desktop-heading: 34rpx;
  $desktop-title: 38rpx;

  .content {
    height: calc(100vh - #{100rpx} - #{102rpx} - var(--status-bar-height, 0px));
    max-width: 750px;
    margin: 0 auto;
    padding: 24px 24px 60px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    align-content: start;
  }

  /* 前两张工具卡并列，第三张占整行更聚焦 */
  .tool-card {
    margin-bottom: 0;
    padding: 22px;
    border-radius: 16px;
  }

  .tool-purple {
    grid-column: 1 / -1;
  }

  .draft-card {
    grid-column: 1 / -1;
    margin-bottom: 0;
    padding: 22px;
    border-radius: 16px;
  }

  /* 标题行 */
  .card-title {
    font-size: $desktop-title;
  }

  .card-tag {
    margin-left: 10px;
    padding: 3px 8px;
    font-size: $desktop-caption;
  }

  .card-ready {
    font-size: $desktop-aux;
  }

  .card-desc {
    margin: 10px 0 14px;
    font-size: $desktop-body;
  }

  /* 插图画区 */
  .card-art,
  .film-art,
  .compare-art {
    height: 220px;
    border-radius: 12px;
  }

  .art-chip {
    bottom: 10px;
    padding: 4px 10px;
    font-size: $desktop-caption;
  }

  .chip-left {
    left: 12px;
  }

  .chip-right {
    left: 110px;
  }

  /* 底部说明 + 按钮 */
  .card-footer {
    margin-top: 16px;
  }

  .footer-note {
    font-size: $desktop-aux;
  }

  .footer-button {
    height: 36px;
    padding: 0 20px;
    font-size: $desktop-aux;
    line-height: 36px;
  }

  /* 胶卷 */
  .film-art {
    padding: 16px;
  }

  .film-name {
    font-size: $desktop-body;
  }

  .film-meta {
    font-size: $desktop-caption;
  }

  .film-frames {
    gap: 10px;
    margin: 14px 0;
  }

  .film-frame {
    padding: 6px;
    border-radius: 10px;
  }

  .film-frame:nth-child(1) .frame-thumb {
    height: 60px;
  }

  .film-frame:nth-child(2) .frame-thumb {
    height: 76px;
  }

  .film-frame:nth-child(3) .frame-thumb {
    height: 92px;
  }

  .film-frame:nth-child(4) .frame-thumb {
    height: 108px;
  }

  .frame-label {
    font-size: $desktop-micro;
  }

  .film-chip {
    padding: 5px 10px;
    font-size: $desktop-caption;
  }

  /* 桌面端悬停暂停滚动，方便看清内容 */
  .film-marquee:hover .film-marquee-track {
    animation-play-state: paused;
  }

  /* 对比图 */
  .compare-handle {
    width: 28px;
    height: 28px;
    font-size: $desktop-metric;
    line-height: 28px;
  }

  .compare-tag {
    bottom: 56px;
    padding: 5px 10px;
    font-size: $desktop-caption;
  }

  .compare-caption {
    height: 40px;
    font-size: $desktop-caption;
    line-height: 40px;
  }

  /* 草稿库 */
  .draft-title {
    font-size: $desktop-heading;
  }

  .draft-subtitle {
    font-size: $desktop-caption;
  }

  .draft-row {
    margin-top: 10px;
    padding: 14px 16px;
    font-size: $desktop-body;
  }

  .draft-status {
    font-size: $desktop-caption;
  }
}
</style>
