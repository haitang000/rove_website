<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { gsap } from 'gsap'
import { loadScrollTrigger } from '../utils/scrollAnimations'
import DownloadButton from './DownloadButton.vue'
import { useI18n } from '../i18n'
import roveLogo from '../../rove.svg'

const props = defineProps<{ repositoryUrl: string; enabled: boolean; changelog?: boolean; homeHref?: string }>()
defineEmits<{ navigate: [event: MouseEvent] }>()

const { messages } = useI18n()
const header = ref<HTMLElement | null>(null)
let media: gsap.MatchMedia | undefined
let setupVersion = 0

async function setupScrollEffects() {
  const version = ++setupVersion
  media?.revert()
  if (!props.enabled || !header.value) return
  try {
    await loadScrollTrigger()
  } catch {
    return // Navigation remains usable with native scrolling if loading fails.
  }
  if (version !== setupVersion || !header.value) return

  const element = header.value
  const background = element.querySelector<HTMLElement>('.navbar-background')!
  const navbar = element.querySelector<HTMLElement>('.site-navbar')!
  const brand = element.querySelector<HTMLElement>('.navbar-brand')!
  const links = element.querySelector<HTMLElement>('.navbar-links')!
  const items = [...links.querySelectorAll<HTMLElement>('li')]
  const download = element.querySelector<HTMLElement>('.navbar-download-slot')!
  const targets = [brand, ...items, download]

  media = gsap.matchMedia()
  media.add({
    desktop: '(min-width: 701px)',
    mobile: '(max-width: 700px)',
    motion: '(prefers-reduced-motion: no-preference)',
  }, (context) => {
    let offsets: number[] = []
    function measureSpacing() {
      let outerSpread = 0
      let extraGap = 0
      if (context.conditions?.mobile) {
        const gap = parseFloat(getComputedStyle(links).columnGap)
        const contentWidth = items.reduce((width, item) => width + item.offsetWidth, 0) + gap * (items.length - 1)
        extraGap = Math.max(0, Math.min(16, (links.clientWidth - contentWidth) / (items.length - 1)))
      } else {
        const inset = window.innerWidth <= 1199 ? 32 : 48
        const availableWidth = Math.min(1440, element.clientWidth - inset * 2)
        outerSpread = Math.max(0, Math.min(160, (availableWidth - navbar.offsetWidth) / 2))
        extraGap = outerSpread * .15
      }
      offsets = [-outerSpread, ...items.map((_, index) => (index - (items.length - 1) / 2) * extraGap), outerSpread]
    }

    measureSpacing()
    const timeline = gsap.timeline({
      defaults: { duration: 1, ease: 'none' },
      scrollTrigger: {
        trigger: element,
        start: 0,
        end: 420,
        scrub: context.conditions?.motion ? .2 : true,
        invalidateOnRefresh: true,
        onRefreshInit: measureSpacing,
      },
    })
    timeline.fromTo(background, { opacity: 0 }, { opacity: 1 }, 0)
    if (context.conditions?.motion) {
      timeline.fromTo(targets, { x: 0 }, { x: (index) => offsets[index] ?? 0 }, 0)
    }
  }, element)
}

onMounted(setupScrollEffects)
watch(() => [props.enabled, messages.value], setupScrollEffects, { flush: 'post' })
onUnmounted(() => {
  setupVersion++
  media?.revert()
})
</script>

<template>
  <header ref="header" class="site-header" :class="{ 'site-header--changelog': changelog }">
    <div class="navbar-background" aria-hidden="true"></div>
    <nav class="site-navbar" :aria-label="messages.navigation.label">
      <a class="navbar-brand" :href="homeHref ?? '#home'" :aria-label="messages.navigation.home" @click="changelog && $emit('navigate', $event)">
        <img :src="roveLogo" alt="" width="40" height="40" />
        <span>Rove</span>
      </a>

      <ul class="navbar-links">
        <li><a href="#features" @click="changelog && $emit('navigate', $event)">{{ messages.navigation.features }}</a></li>
        <li><a href="#changelog" :aria-current="changelog ? 'page' : undefined" @click="$emit('navigate', $event)">{{ messages.navigation.changelogs }}</a></li>
        <li><a :href="`${repositoryUrl}/issues`" target="_blank" rel="noopener noreferrer">{{ messages.navigation.questions }}</a></li>
        <li><a :href="repositoryUrl" target="_blank" rel="noopener noreferrer">GitHub</a></li>
      </ul>

      <div class="navbar-download-slot">
        <DownloadButton class="navbar-download" href="#download" :label="messages.navigation.download" @click="$emit('navigate', $event)" />
      </div>
    </nav>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 5;
  isolation: isolate;
  padding-block: 26px;
  border-bottom: 1px solid transparent;
}
.navbar-background {
  position: absolute;
  inset: 0 0 -1px;
  z-index: -1;
  border-bottom: 1px solid #22262f0a;
  background: #fff;
  opacity: 0;
  pointer-events: none;
}
.site-header--changelog .navbar-background { opacity: 1; }
.site-navbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 60px;
  width: fit-content;
  max-width: calc(100% - 96px);
  margin-inline: auto;
}
.navbar-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  text-decoration: none;
  font-size: 40px;
  font-weight: 500;
  line-height: 1;
}
.navbar-brand img { width: 40px; height: 40px; }
.navbar-links { display: flex; align-items: center; gap: 24px; margin: 0; padding: 0; list-style: none; }
.navbar-links a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: #62656d;
  font-size: 28px;
  font-weight: 300;
  line-height: 1.4;
  text-decoration: none;
  white-space: nowrap;
}
.navbar-links a:focus-visible, .navbar-links a[aria-current] { color: #22262f; }
.navbar-links a[aria-current] { text-decoration: underline; text-underline-offset: .33em; text-decoration-color: #6b64df; }
.navbar-download-slot { flex-shrink: 0; }
.navbar-download { min-height: 52px; padding: 9px 14px; border-radius: 12px; font-size: 24px; }
.navbar-download:active { transform: scale(.97); }

@media (hover: hover) and (pointer: fine) {
  .navbar-links a:hover { color: #22262f; }
}

@media (max-width: 1599px) {
  .site-header { padding-block: 22px; }
  .site-navbar { gap: 40px; }
  .navbar-brand { gap: 6px; font-size: 32px; }
  .navbar-brand img { width: 32px; height: 32px; }
  .navbar-links { gap: 20px; }
  .navbar-links a { font-size: 22px; }
  .navbar-download { min-height: 44px; padding: 8px 12px; border-radius: 9px; font-size: 18px; }
  .navbar-download :deep(svg) { width: 21px; height: 21px; }
}

@media (max-width: 1199px) {
  .site-navbar { max-width: calc(100% - 64px); gap: 28px; }
  .navbar-brand { font-size: 28px; }
  .navbar-brand img { width: 30px; height: 30px; }
  .navbar-links { gap: 16px; }
  .navbar-links a { font-size: 18px; }
  .navbar-download { font-size: 16px; }
}

@media (max-width: 700px) {
  .site-header { padding-block: 16px; }
  .site-navbar { display: grid; grid-template-columns: 1fr auto; width: calc(100% - 40px); max-width: none; gap: 12px 20px; }
  .navbar-brand { width: fit-content; }
  .navbar-links { grid-column: 1 / -1; grid-row: 2; justify-content: center; flex-wrap: wrap; gap: 0 8px; }
  .navbar-links a { font-size: 16px; }
  .navbar-download-slot { grid-column: 2; grid-row: 1; }
}
</style>
