import { computed, readonly, ref, watch } from 'vue'

export type Locale = 'en' | 'zh-CN'

const en = {
  meta: {
    title: 'Rove — Light by Design. Fast by Nature.',
    description: 'Meet Rove. A lightweight Windows browser built with Rust. Your tabs in a sidebar, your browsing organized into spaces. Free and open-source.',
  },
  loading: {
    label: 'Loading Rove',
    error: 'Some images couldn’t load.',
    retry: 'Try again',
  },
  skipToContent: 'Skip to content',
  downloadButton: 'Download for Windows',
  githubButton: 'View on GitHub',
  navigation: {
    label: 'Main navigation',
    home: 'Rove homepage',
    features: 'Features',
    changelogs: 'Changelog',
    questions: 'Q&A',
    download: 'Download',
  },
  hero: {
    title: ['Light by Design.', 'Fast by Nature.'],
    description: 'A Windows browser built with Rust. Free and open-source',
    actionsLabel: 'Get Rove',
    imageAlt: 'Rove browser with a clean vertical sidebar, browsing spaces, and the Notion homepage.',
  },
  introduction: {
    title: 'Meet Rove',
    lines: [
      'Your tabs in a sidebar, your browsing organized into',
      'spaces. A lightweight, high-performance browser built',
      'with Rust for Windows. Free and open-source, designed',
      'to make browsing feel effortless.',
    ],
    lineSeparator: ' ',
  },
  featuresLabel: 'A more effortless way to browse',
  features: {
    tabs: {
      imageAlt: 'Rove tab overview, with all open tabs organized into Personal and Work spaces.',
      title: ['Manage all your tabs', 'efficiently'],
      description: 'Manage all your tabs in one place - incredibly convenient',
    },
    split: {
      imageAlt: 'Two websites open side by side in Rove’s split view.',
      title: ['Multitask,', 'effortlessly.'],
      description: 'View two pages side by side. Compare, research, and get more done without switching tabs.',
    },
    peek: {
      imageAlt: 'A YouTube video preview floating above the current page in Rove.',
      title: ['A Glance Is', 'All You Need.'],
      description: 'Preview links instantly without leaving your page.\nStay focused, browse seamlessly.',
    },
  },
  performance: {
    title: 'Incredible app size and speed',
    description: 'Speedometer3.1 (The lower the better)',
    benchmarkLabel: 'Performance comparison from the design: Rove 19.9, Chrome 23.0. Lower is better.',
  },
  download: {
    title: 'Go Further. Browse Lighter.',
    description: 'Experience a lighter, faster way to explore the web. Built with Rust, made for\nWindows, and free for everyone.',
  },
  changelogPage: {
    meta: {
      title: 'Changelog — Rove',
      description: 'Follow new features, fixes, and development in Rove, sourced from the browser’s GitHub commit history.',
    },
    title: 'Changelog',
    description: 'New features, fixes, and ongoing work on Rove for Windows.',
    githubHistory: 'Commit history',
    archive: 'Archive',
    month: 'Browse by month',
    filter: 'Filter by commit type',
    kinds: { all: 'All', feat: 'Features', fix: 'Fixes', other: 'Other' },
    badges: { feat: 'Feature', fix: 'Fix', other: 'Other' },
    syncing: 'Checking GitHub for updates…',
    snapshot: 'Showing a saved copy of the GitHub history.',
    error: 'Couldn’t load the GitHub history.',
    retry: 'Try again',
    empty: 'No commits match this view.',
    more: 'Show more commits',
  },
  downloadPage: {
    meta: {
      title: 'Before downloading — Rove',
      description: 'Before downloading Rove, learn about its early development stage, Windows 10 or later requirement, and WebView2 dependency.',
    },
    title: ['Before downloading,', 'there are a few things', 'you need to know'],
    notices: [
      "Rove is still in the early stages of development, and we don't recommend anyone use it as their primary browser.",
      'Rove is only available for Windows 10 and later versions, and it relies on WebView2 to function properly.',
    ],
    versionLabel: 'Choose a version',
    channels: {
      preview: {
        name: 'Preview',
        description: 'Get the latest Preview build, more stable than Canary.',
      },
      canary: {
        name: 'Canary',
        description: 'Built from the latest commits. Try new changes first, but expect instability.',
      },
    },
    unstableLabel: 'Unstable',
    confirmButton: 'Download',
    actionsLabel: 'Download Rove or view the source code',
    backHome: 'Back to the Rove homepage',
  },
}

const translations = {
  en,
  'zh-CN': {
    meta: {
      title: 'Rove — 轻盈设计，天生迅捷。',
      description: '认识 Rove：基于 Rust 构建的轻量 Windows 浏览器。侧边栏管理标签页，用空间整理浏览。免费开源，让浏览轻松自如。',
    },
    loading: {
      label: '正在加载 Rove',
      error: '部分图片加载失败。',
      retry: '重试',
    },
    skipToContent: '跳转到正文',
    downloadButton: '下载 Windows 版',
    githubButton: '在 GitHub 上查看',
    navigation: {
      label: '主导航',
      home: 'Rove 首页',
      features: '功能',
      changelogs: '更新日志',
      questions: '常见问题',
      download: '下载',
    },
    hero: {
      title: ['轻盈设计。', '天生迅捷。'],
      description: '基于 Rust 构建的 Windows 浏览器，免费且开源。',
      actionsLabel: '获取 Rove',
      imageAlt: 'Rove 浏览器界面，展示简洁的垂直侧边栏、浏览空间和 Notion 首页。',
    },
    introduction: {
      title: '认识 Rove',
      lines: [
        '侧边栏集中管理标签页，用空间整理浏览。',
        '这是一款基于 Rust 构建、专为 Windows 打造的',
        '轻量高性能浏览器。免费开源，',
        '让每一次浏览都轻松自如。',
      ],
      lineSeparator: '',
    },
    featuresLabel: '更轻松的浏览方式',
    features: {
      tabs: {
        imageAlt: 'Rove 标签页总览，所有打开的标签页按个人和工作空间分类。',
        title: ['集中管理标签页，', '高效有序。'],
        description: '所有标签页，一处管理，整理和查找都更方便。',
      },
      split: {
        imageAlt: 'Rove 分屏视图中并排打开的两个网页。',
        title: ['多任务并行，', '轻松自如。'],
        description: '两个页面并排浏览，无需来回切换标签页，轻松对比、查阅，高效完成任务。',
      },
      peek: {
        imageAlt: 'Rove 当前页面上方悬浮显示的 YouTube 视频预览。',
        title: ['轻轻一瞥，', '即刻预览。'],
        description: '无需离开当前页面，即可预览链接内容。\n保持专注，让浏览流畅连贯。',
      },
    },
    performance: {
      title: '小巧体积，出色速度',
      description: 'Speedometer3.1（数值越低越好）',
      benchmarkLabel: '设计稿中的性能对比：Rove 19.9，Chrome 23.0。数值越低越好。',
    },
    download: {
      title: '探索更远，浏览更轻。',
      description: '以更轻盈、更迅捷的方式探索网络。基于 Rust 构建，专为 Windows 打造，向所有人免费开放。',
    },
    changelogPage: {
      meta: {
        title: '更新日志 — Rove',
        description: '从 GitHub 提交记录了解 Windows 版 Rove 的新功能、修复和开发进展。',
      },
      title: '更新日志',
      description: '了解 Windows 版 Rove 的新功能、修复和开发进展。',
      githubHistory: 'GitHub 提交记录',
      archive: '归档',
      month: '按月浏览',
      filter: '按提交类型筛选',
      kinds: { all: '全部', feat: '功能', fix: '修复', other: '其他' },
      badges: { feat: '功能', fix: '修复', other: '其他' },
      syncing: '正在从 GitHub 检查更新…',
      snapshot: '正在显示已保存的 GitHub 提交记录。',
      error: '暂时无法加载 GitHub 提交记录。',
      retry: '重试',
      empty: '当前筛选下没有提交。',
      more: '显示更多提交',
    },
    downloadPage: {
      meta: {
        title: '下载前须知 — Rove',
        description: '下载 Rove 前，请了解其早期开发状态、Windows 10 及以上版本要求，以及 WebView2 运行依赖。',
      },
      title: ['下载之前，', '有几件事', '你需要了解'],
      notices: [
        'Rove 仍处于早期开发阶段，我们暂不建议将它作为主力浏览器使用。',
        'Rove 仅支持 Windows 10 及以上版本，并依赖 WebView2 才能正常运行。',
      ],
      versionLabel: '选择下载版本',
      channels: {
        preview: {
          name: 'Preview',
          description: '获取最新的 Preview 构建，相比 Canary 更加稳定。',
        },
        canary: {
          name: 'Canary',
          description: '基于最新提交构建，抢先体验新更改，但可能不稳定。',
        },
      },
      unstableLabel: '不稳定',
      confirmButton: '下载',
      actionsLabel: '下载 Rove 或查看源代码',
      backHome: '返回 Rove 首页',
    },
  },
} satisfies Record<Locale, typeof en>

const locale = ref<Locale>('en')
const messages = computed(() => translations[locale.value])

export function detectLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const base = language.toLowerCase().split(/[-_]/)[0]
    if (base === 'zh') return 'zh-CN'
    if (base === 'en') return 'en'
  }
  return 'en'
}

export function initializeI18n() {
  const syncLocale = () => {
    locale.value = detectLocale(navigator.languages?.length ? navigator.languages : [navigator.language])
  }
  syncLocale()

  const stopMetadata = watch(locale, () => {
    document.documentElement.lang = locale.value
    document.title = messages.value.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', messages.value.meta.description)
    document.querySelector('#boot-splash')?.setAttribute('aria-label', messages.value.loading.label)
  }, { immediate: true, flush: 'sync' })

  window.addEventListener('languagechange', syncLocale)
  return () => {
    window.removeEventListener('languagechange', syncLocale)
    stopMetadata()
  }
}

export function useI18n() {
  return { locale: readonly(locale), messages }
}
