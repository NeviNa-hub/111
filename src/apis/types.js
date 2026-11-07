/**
 * 接口与页面数据模型（JSDoc typedef）。
 * 后端响应保持 snake_case，API 层统一映射为下列 camelCase 模型。
 *
 * @typedef {Object} PageInfo
 * @property {number} page 当前页码。
 * @property {number} pageSize 每页条数。
 * @property {number} total 总条数。
 *
 * @typedef {Object} TaskState
 * @property {string} taskId 任务标识。
 * @property {string} status 任务状态，见 TASK_STATUS。
 * @property {number} progress 0-100 的生成进度。
 *
 * @typedef {Object} HeroRecommendation
 * @property {string} label 推荐标签。
 * @property {string} caption 推荐标题。
 * @property {string} prompt 提示词。
 * @property {string} imageUrl 封面图地址。
 * @property {string} modelName 模型名称。
 * @property {number} generatedCount 已生成次数。
 *
 * @typedef {Object} CreationEntry
 * @property {number} creationId 创作入口标识。
 * @property {string} eyebrow 卡片上方英文标识。
 * @property {string} title 创作模式名称。
 * @property {string} inputLabel 输入前缀文案。
 * @property {string} inputValue 输入示例文案。
 * @property {string} icon 输入框右侧图标。
 * @property {string} note 卡片底部说明。
 * @property {string} action 操作按钮文案。
 * @property {string} url 目标页面地址。
 *
 * @typedef {Object} HomeOverview
 * @property {string} weatherText 页头天气文案。
 * @property {string} quote 页尾寄语。
 * @property {HeroRecommendation} hero 今日推荐。
 * @property {CreationEntry[]} creations 灵感工坊轮播。
 *
 * @typedef {Object} WorkbenchDraft
 * @property {number} draftId 草稿标识。
 * @property {string} title 草稿标题。
 * @property {string} time 更新时间文案。
 * @property {string} status 草稿状态文案。
 *
 * @typedef {Object} WorkbenchFrame
 * @property {number} frameId 分镜标识。
 * @property {string} name 分镜名称。
 *
 * @typedef {Object} WorkbenchOverview
 * @property {string[]} filmChips 胶卷轨道标签。
 * @property {WorkbenchFrame[]} frames 分镜列表。
 * @property {WorkbenchDraft[]} drafts 草稿列表。
 *
 * @typedef {Object} LibraryTab
 * @property {string} status 作品状态。
 * @property {string} name 标签名称。
 * @property {number} count 作品数量。
 *
 * @typedef {Object} LibraryWork
 * @property {number} workId 作品标识。
 * @property {string} title 作品标题。
 * @property {string} status 作品状态。
 * @property {string} className 画作底纹样式类。
 * @property {string} imageUrl 作品图片地址，可能为空。
 *
 * @typedef {Object} LibraryGenerating
 * @property {number} workId 生成中作品标识。
 * @property {string} title 作品标题。
 * @property {string} statusText 生成阶段文案。
 *
 * @typedef {Object} LibraryResult
 * @property {string} summary 作品统计摘要。
 * @property {LibraryTab[]} tabs 状态标签与数量。
 * @property {PageInfo} pageInfo 分页信息。
 * @property {LibraryWork[]} works 当前页作品。
 * @property {LibraryGenerating|null} generating 生成中提示。
 *
 * @typedef {Object} ImageStyle
 * @property {number} styleId 画风标识。
 * @property {string} name 画风名称。
 * @property {string} description 画风说明。
 * @property {string} className 预览底纹样式类。
 *
 * @typedef {Object} ImageStyleOptions
 * @property {number} defaultStyleId 默认画风标识。
 * @property {ImageStyle[]} styles 画风列表。
 *
 * @typedef {Object} ImageRatioOption
 * @property {number} ratioId 比例标识。
 * @property {string} name 比例名称。
 * @property {string} description 比例说明。
 * @property {string} value 比例值，例如 1:1。
 *
 * @typedef {Object} ImageCountOption
 * @property {number} countId 张数标识。
 * @property {string} name 张数名称。
 * @property {number} value 图片张数。
 * @property {number} cost 消耗灵感点。
 *
 * @typedef {Object} ImageCanvasOptions
 * @property {ImageRatioOption[]} ratios 画幅比例。
 * @property {ImageCountOption[]} counts 生成张数。
 * @property {string} defaultRatio 默认比例。
 * @property {string} defaultCount 默认张数名称。
 * @property {string} estimatedTime 预计生成耗时。
 *
 * @typedef {Object} ImageCreationOptions
 * @property {string[]} suggestions 灵感词。
 * @property {string} polishSuffix 润色后缀。
 * @property {string} randomPrompt 随机意象文案。
 * @property {number} promptLimit 意境字数上限。
 *
 * @typedef {Object} ImageTaskStatus
 * @property {string} taskId 任务标识。
 * @property {string} status 任务状态。
 * @property {number} progress 生成进度。
 * @property {string} progressTitle 进度页主标题。
 * @property {string} stageLabel 当前阶段。
 * @property {string} typeLabel 任务类型文案。
 * @property {string} workName 作品名称。
 * @property {string} detail 作品详情。
 * @property {string[]} tags 作品标签。
 * @property {number} cost 消耗灵感点。
 * @property {string} estimatedTime 预计耗时。
 * @property {string} description 任务说明。
 * @property {string} tip 云端提示。
 * @property {string} statusText 阶段状态文案。
 * @property {string} progressLabel 进度圈说明。
 *
 * @typedef {Object} OptimizationDirection
 * @property {number} directionId 方向标识。
 * @property {string} iconName 图标名称。
 * @property {string} title 方向名称。
 * @property {string} description 方向说明。
 *
 * @typedef {Object} ImageOptimizationOptions
 * @property {OptimizationDirection[]} directions 优化方向。
 * @property {string[]} intensities 重绘强度。
 * @property {string} defaultDirection 默认方向名称。
 * @property {string} defaultIntensity 默认强度名称。
 * @property {number} cost 消耗灵感点。
 * @property {string} estimatedTime 预计耗时。
 *
 * @typedef {Object} VideoRatio
 * @property {number} ratioId 比例标识。
 * @property {string} value 比例值。
 * @property {string} name 比例名称。
 * @property {string} description 比例说明。
 * @property {boolean} recommended 是否推荐。
 *
 * @typedef {Object} VideoMode
 * @property {string} modeId 模式标识。
 * @property {string} name 模式名称。
 * @property {string} icon 模式图标。
 *
 * @typedef {Object} VideoCreationOptions
 * @property {VideoRatio[]} ratios 画幅列表。
 * @property {VideoMode[]} modes 创作模式。
 * @property {string[]} suggestions 灵感词。
 * @property {number} promptLimit 意境字数上限。
 * @property {string} defaultRatio 默认画幅。
 * @property {string} defaultMode 默认模式。
 * @property {string} defaultPrompt 默认意境。
 * @property {string} polishSuffix 润色后缀。
 * @property {number} power 可用算力。
 *
 * @typedef {Object} VideoFpsOption
 * @property {number} fpsId 帧率标识。
 * @property {number} value 帧率值。
 * @property {string} name 帧率名称。
 * @property {string} tag 推荐标签。
 * @property {string} description 帧率说明。
 *
 * @typedef {Object} VideoRenderOptions
 * @property {VideoFpsOption[]} fpsOptions 帧率列表。
 * @property {number} defaultFps 默认帧率。
 * @property {number} cost 消耗灵感点。
 * @property {string} estimatedTime 预计耗时。
 * @property {string} previewTitle 预览标题。
 * @property {string} cameraMove 运镜描述。
 *
 * @typedef {Object} UploadedImage
 * @property {string} uploadId 上传标识。
 * @property {string} url 可访问地址。
 * @property {string} name 文件名。
 *
 * @typedef {Object} AccountOverview
 * @property {number|null} pointsBalance 灵感点余额，无数据时为 null。
 */

export {};
