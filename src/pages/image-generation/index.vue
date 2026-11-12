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
import { getErrorMessage, isApiError } from "@/utils/request";

const TASK_STATUS_TEXT = {
  [TASK_STATUS.PENDING]: "任务已创建",
  [TASK_STATUS.PROCESSING]: "云端处理中",
  [TASK_STATUS.COMPLETED]: "任务已完成",
  [TASK_STATUS.FAILED]: "生成失败",
};
const task = reactive({
  mode: "creation",
  taskId: "",
  status: TASK_STATUS.PENDING,
  progress: 0,
  message: "",
  resultUrl: "",
});

const { start: startPolling } = useTaskPolling({
  fetchTask: () =>
    task.mode === "optimization"
      ? getImageOptimizationTaskStatus({ taskId: task.taskId })
      : getImageTaskStatus({ taskId: task.taskId }),
  interval: 3000,
  maxAttempts: 60,
  isCompleted: (data) => data.status === TASK_STATUS.COMPLETED,
  isFailed: (data) => data.status === TASK_STATUS.FAILED,
  onProgress: (data) => {
    task.status = data.status || TASK_STATUS.PROCESSING;
    task.progress = Number(data.progress) || 0;

    if (data.result_urls?.[0]) {
      task.resultUrl = data.result_urls[0];
    }
  },
  onCompleted: (data) => {
    task.status = TASK_STATUS.COMPLETED;
    task.progress = 100;
    task.resultUrl = data.result_urls?.[0] || "";
  },
  onFailed: (error) => {
    const isRequestError = isApiError(error);

    task.status = TASK_STATUS.FAILED;
    task.message = isRequestError
      ? "任务状态查询失败，请稍后在作品库确认结果。"
      : getErrorMessage(error, "任务进度获取失败，请稍后重试");

    if (!isRequestError) {
      uni.showToast({ title: task.message, icon: "none" });
    }
  },
});

const progressData = computed(() => {
  const isOptimization = task.mode === "optimization";
  const isCompleted = task.status === TASK_STATUS.COMPLETED;
  const isFailed = task.status === TASK_STATUS.FAILED;
  const stageLabel =
    TASK_STATUS_TEXT[task.status] || TASK_STATUS_TEXT[TASK_STATUS.PENDING];
  let title = isOptimization ? "图片优化" : "画卷生成中";
  let tip = "已进入云端处理，离开页面不影响任务进度。";
  let progressLabel = "气韵流转";

  if (isCompleted) {
    title = "生成完成";
    tip = "任务已完成，可前往作品库查看。";
    progressLabel = "生成完成";
  }

  if (isFailed) {
    title = "生成未完成";
    tip = task.message || "任务处理失败，请返回重新尝试。";
    progressLabel = "生成失败";
  }

  return {
    mode: task.mode,
    title,
    progressTitle: isOptimization ? "淬炼重绘" : "研墨成画",
    stageLabel,
    typeLabel: isOptimization ? "图片优化" : "文字生图",
    progress: task.progress,
    progressLabel,
    statusText: stageLabel,
    workName: isOptimization ? "图片优化任务" : "新建画卷",
    detail: "云端智能生成",
    tags: [],
    cost: isOptimization ? 1 : 2,
    description: isCompleted ? "已完成并归档作品库" : "任务完成后自动保存至作品库",
    estimatedTime: "预计稍候完成",
    tip,
    status: task.status,
    resultUrl: isCompleted ? task.resultUrl : "",
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
