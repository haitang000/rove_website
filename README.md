# Rove website

基于 `whole_ui.png` 还原的 Rove 浏览器官网，使用 Vue 3、TypeScript、Vite、Outfit 字体和 Remix Icon。页面图片直接引用目录中提供的素材。

进站动画使用 GSAP：灰色方块扫光 → 随机方形/圆形摄影图共三轮、逐层放大 → 最后一张图片放大并完全淡出 → 网页主体放大淡入，伴随轻微鱼眼形变并恢复平面。图片淡出与网页淡入依次进行。共享缩放使图片切换时持续推进；时间轴以 1.6 倍速播放，资源就绪后的动画约 1.55 秒。资源解码完成后再播放；动画期间屏蔽滚轮、触摸及键盘滚动。系统开启减少动态效果时直接显示页面。尺寸倍率、轮次、间隔和整体速度可在 `src/components/LoadingIntro.vue` 顶部调整。

加载动画的摄影图保存在 `src/assets/intro/`，每次随机抽取六张且不重复。图片来自 Lorem Picsum / Unsplash；作者和原始链接保存在同目录的 `credits.json`。页面展示区继续使用原始设计素材。

平滑滚动使用 Lenis 独立驱动，在进站动画结束后启用；触屏保留原生滚动。介绍段落通过 ScrollTrigger 读取滚动进度，让字母逐个从浅灰变为黑色，反向滚动时恢复。系统开启减少动态效果时使用原生滚动，并直接显示黑色文字。

## 本地运行

```sh
npm install
npm run dev
```

## 构建与预览

```sh
npm run build
npm run preview
```

下载按钮当前跳转至 RoveBrowser 的最新 GitHub Release，GitHub 按钮跳转至源码仓库；链接集中配置在 `src/App.vue`。没有提供安装包时，不使用虚构的下载地址。

未登录状态访问该仓库和最新 Release 返回 404，可能需要仓库访问权限。正式上线前，可在 `src/App.vue` 中将 `downloadUrl` 替换为公开安装包或发布页地址。
