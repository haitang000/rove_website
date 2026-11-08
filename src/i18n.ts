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
