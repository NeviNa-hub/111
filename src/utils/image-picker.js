/**
 * 图片选择
 */

/**
 * 选择单张图片并返回本地路径与文件名。
 * @param {Object} options 透传给 uni.chooseImage 的可选参数。
 * @returns {Promise<{path: string, name: string}>} 所选图片信息。
 */
export const chooseSingleImage = (options = {}) =>
  new Promise((resolve, reject) => {
    uni.chooseImage({
      count: 1,
      sizeType: ["original", "compressed"],
      sourceType: ["album", "camera"],
      ...options,
      success: ({ tempFilePaths, tempFiles }) => {
        const path = tempFilePaths?.[0];
        const file = tempFiles?.[0];

        if (!path) {
          reject(new Error("未选择图片"));
          return;
        }

        resolve({
          path,
          name: file?.name || path.split("/").pop() || "已选图片",
        });
      },
      fail: (error) => reject(error),
    });
  });
