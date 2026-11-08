import { onMounted, onUnmounted, watch, type Ref } from 'vue'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function useSmoothScroll(enabled: Ref<boolean>) {
  let lenis: Lenis | undefined
  let reducedMotion: MediaQueryList | undefined

  function sync() {
    lenis?.destroy()
    lenis = undefined
    if (!enabled.value || reducedMotion?.matches) return

    lenis = new Lenis({
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
    lenis?.destroy()
    reducedMotion?.removeEventListener('change', sync)
  })
}
