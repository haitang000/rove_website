import { onMounted, onUnmounted, watch, type Ref } from 'vue'
import type Lenis from 'lenis'
import { loadScrollTrigger } from '../utils/scrollAnimations'

export function useSmoothScroll(enabled: Ref<boolean>) {
  let lenis: Lenis | undefined
  let reducedMotion: MediaQueryList | undefined
  let setupVersion = 0

  async function sync() {
    const version = ++setupVersion
    lenis?.destroy()
    lenis = undefined
    if (!enabled.value || reducedMotion?.matches) return

    let LenisConstructor: typeof Lenis
    let ScrollTrigger: Awaited<ReturnType<typeof loadScrollTrigger>>
    try {
      const [module, plugin] = await Promise.all([import('lenis'), loadScrollTrigger()])
      LenisConstructor = module.default
      ScrollTrigger = plugin
    } catch {
      return // Fall back to native scrolling if the optional chunks fail.
    }
    if (version !== setupVersion) return

    lenis = new LenisConstructor({
      autoRaf: true,
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
    })
    // Lenis owns scrolling and its animation frame; GSAP only reads progress.
    lenis.on('scroll', ScrollTrigger.update)
    ScrollTrigger.refresh()
  }

  onMounted(() => {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion.addEventListener('change', sync)
    sync()
  })

  watch(enabled, sync, { flush: 'post' })

  onUnmounted(() => {
    setupVersion++
    lenis?.destroy()
    reducedMotion?.removeEventListener('change', sync)
  })
}
