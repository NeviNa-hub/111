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
    task.statusData = data;
  },
  onCompleted: (data) => {
    task.progress = data.progress;
    task.statusData = data;
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
    progressTitle:
      status.progressTitle || (isOptimization ? "淬炼重绘" : "研墨成画"),
    stageLabel: status.stageLabel || "正在连接云端",
    typeLabel: status.typeLabel || "",
    progress: task.progress,
    progressLabel: status.progressLabel || "气韵流转",
    statusText: status.statusText || "等待云端响应",
    workName: status.workName || "任务校验中",
    detail: status.detail || "",
    tags: status.tags || [],
    cost: typeof status.cost === "number" ? status.cost : null,
    description: status.description || "正在获取任务信息",
    estimatedTime: status.estimatedTime || "",
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
