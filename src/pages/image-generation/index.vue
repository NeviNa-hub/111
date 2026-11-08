<template>
  <generation-progress :data="progressData" />
</template>

<script setup>
import { computed, reactive } from "vue";
import { onLoad } from "@dcloudio/uni-app";

import { TASK_STATUS } from "@/apis/constants";
import { getImageOptimizationTaskStatus } from "@/apis/image-optimization";
import { getImageTaskStatus } from "@/apis/text-to-image";
import GenerationProgress from "@/components/GenerationProgress/index.vue";
import useTaskPolling from "@/hooks/useTaskPolling";
import { getErrorMessage } from "@/utils/request";

const task = reactive({
  mode: "creation",
  taskId: "",
  progress: 0,
  statusData: null,
});

const { start: startPolling } = useTaskPolling({
  fetchTask: () =>
    task.mode === "optimization"
      ? getImageOptimizationTaskStatus({ taskId: task.taskId })
      : getImageTaskStatus({ taskId: task.taskId }),
  interval: 3000,
  maxAttempts: 60,
  isCompleted: (data) => data.status === TASK_STATUS.COMPLETED,
  onProgress: (data) => {
    task.progress = data.progress;
    task.statusData = { statusText: "云端处理中", tip: "离开页面不影响任务进度。" };
  },
  onCompleted: (data) => {
    task.progress = data.progress;
    task.statusData = {
      statusText: "已完成 · 已归档作品库",
      tip: "任务已完成，可前往作品库查看。",
    };
  },
  onFailed: (error) => {
    uni.showToast({
      title: getErrorMessage(error, "任务进度获取失败，请稍后重试"),
      icon: "none",
    });
  },
});

const progressData = computed(() => {
  const isOptimization = task.mode === "optimization";
  const status = task.statusData || {};

  return {
    mode: task.mode,
    title: isOptimization ? "图片优化" : "画卷生成中",
    progressTitle: isOptimization ? "淬炼重绘" : "研墨成画",
    stageLabel: task.progress >= 100 ? "任务已完成" : "云端处理中",
    typeLabel: isOptimization ? "图片优化" : "文字生图",
    progress: task.progress,
    progressLabel: "气韵流转",
    statusText: status.statusText || "云端处理中",
    workName: isOptimization ? "图片优化任务" : "新建画卷",
    detail: "云端智能生成",
    tags: [],
    cost: isOptimization ? 3 : 4,
    description: "任务完成后自动保存至作品库",
    estimatedTime: "预计稍候完成",
    tip:
      status.tip ||
      "已进入云端处理，期间离开或切换页面不影响生成，可在作品库查看。",
  };
});

/**
 * 读取任务类型并加载进度。
 * @param {{mode?: string, taskId?: string}} query 页面查询参数。
 * @returns {void}
 */
onLoad((query) => {
  task.mode = query.mode === "optimization" ? "optimization" : "creation";
  task.taskId = query.taskId || "";

  if (!task.taskId) {
    uni.showToast({ title: "缺少任务标识", icon: "none" });
    return;
  }

  startPolling();
});
</script>
