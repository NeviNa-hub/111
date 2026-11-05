/**
 * Mock 任务存储：按创建时间推进进度，供轮询接口读取。
 */
import { TASK_STATUS } from "../apis/constants.js";

const TASK_DURATION = 12000;

const taskStore = new Map();
let taskSequence = 0;

/**
 * 创建一个模拟任务并返回任务标识。
 * @param {string} type 任务类型：image / optimization / video。
 * @param {Object} payload 创建任务时的业务参数。
 * @returns {string} 任务标识。
 */
export const createMockTask = (type, payload = {}) => {
  taskSequence += 1;

  const taskId = `${type}-${Date.now()}-${taskSequence}`;

  taskStore.set(taskId, {
    taskId,
    type,
    payload,
    createdAt: Date.now(),
  });

  return taskId;
};

/**
 * 读取模拟任务并按时间推进进度。
 * @param {string} taskId 任务标识。
 * @returns {Object|null} 任务快照，不存在时返回 null。
 */
export const readMockTask = (taskId) => {
  const record = taskStore.get(taskId);

  if (!record) {
    return null;
  }

  const elapsed = Date.now() - record.createdAt;
  const progress = Math.min(100, Math.floor((elapsed / TASK_DURATION) * 100));

  return {
    ...record,
    progress,
    status: progress >= 100 ? TASK_STATUS.COMPLETED : TASK_STATUS.PROCESSING,
  };
};
