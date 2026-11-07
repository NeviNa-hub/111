/**
 * 创作草稿存储
 */

export const DRAFT_KEYS = {
  image: "imageCreationDraft",
  video: "videoCreationDraft",
};

/**
 * 读取指定创作草稿。
 * @param {string} key 草稿键名。
 * @returns {Object|null} 草稿内容，不存在时返回 null。
 */
export const readCreationDraft = (key) => uni.getStorageSync(key) || null;

/**
 * 保存指定创作草稿。
 * @param {string} key 草稿键名。
 * @param {Object} data 草稿内容。
 * @returns {void}
 */
export const saveCreationDraft = (key, data) => {
  uni.setStorageSync(key, data);
};
