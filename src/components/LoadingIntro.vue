<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, useId } from 'vue'
import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { preloadImages } from '../utils/preloadImages'
import { useI18n } from '../i18n'

gsap.registerPlugin(CustomEase)

const props = defineProps<{ images: string[] }>()
const emit = defineEmits<{ complete: [] }>()
const { messages } = useI18n()

const root = ref<HTMLElement | null>(null)
const page = ref<HTMLElement | null>(null)
const active = ref(true)
const loadError = ref(false)
const phase = ref<'loading' | 'stacking' | 'image-exit' | 'page-enter' | 'complete'>('loading')
const layers = ref<{ src: string; circle: boolean; growth: number }[]>([])
const lensMap = ref('')
const lens = ref<SVGFEDisplacementMapElement | null>(null)
const lensId = `intro-lens-${useId()}`

// One square/circle pair, followed by two increasingly larger repetitions.
const rounds = 3
const sizeMultiplier = 1.36
const layerDuration = 0.32
const layerInterval = 0.235
const playbackRate = 1.6
const startingScale = 0.58
const imageExitDuration = 0.36
const pageEntryDuration = 0.66
// Begin inside the preceding image, rather than restarting as a tiny dot.
// 75% scale corresponds to 40.476% of the remaining growth.
const growthEase = CustomEase.create('intro-growth', 'M0,0 C0.16,0.08 0.47,0.14 0.64,0.40476 C0.78,0.6228 0.89,1 1,1')

let context: gsap.Context | undefined
let disposed = false
let completed = false
let restoreScroll: (() => void) | undefined
let motionPreference: MediaQueryList | undefined
let loadingAssets = false

function lockScroll() {
  const preventScroll = (event: Event) => event.preventDefault()
  const preventScrollKey = (event: KeyboardEvent) => {
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) {
      event.preventDefault()
    }
  }

  document.documentElement.classList.add('intro-pending')
  window.scrollTo(0, 0)
  window.addEventListener('wheel', preventScroll, { passive: false })
  window.addEventListener('touchmove', preventScroll, { passive: false })
  window.addEventListener('keydown', preventScrollKey)

  restoreScroll = () => {
    document.documentElement.classList.remove('intro-pending')
    window.removeEventListener('wheel', preventScroll)
    window.removeEventListener('touchmove', preventScroll)
    window.removeEventListener('keydown', preventScrollKey)
  }
}

function complete() {
  if (completed || disposed) return
  completed = true
  phase.value = 'complete'
  active.value = false
  restoreScroll?.()
  motionPreference?.removeEventListener('change', handleMotionPreference)
  if (page.value) gsap.set(page.value, { clearProps: 'transform,opacity,visibility,filter,willChange' })
  emit('complete')
}

function prepareLens() {
  // A radial displacement field bends the viewport while leaving its edges still.
  // This map is generated once; only the filter strength animates during entry.
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const drawing = canvas.getContext('2d')
  if (!drawing) return
  const pixels = drawing.createImageData(size, size)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x / (size - 1)) * 2 - 1
      const ny = (y / (size - 1)) * 2 - 1
      const falloff = Math.max(0, 1 - nx * nx - ny * ny) ** 2
      const offset = (y * size + x) * 4
      pixels.data[offset] = Math.round(127.5 + nx * falloff * 127.5)
      pixels.data[offset + 1] = Math.round(127.5 + ny * falloff * 127.5)
      pixels.data[offset + 2] = 128
      pixels.data[offset + 3] = 255
    }
  }

  drawing.putImageData(pixels, 0, 0)
  lensMap.value = canvas.toDataURL('image/png')
}

function handleMotionPreference() {
  if (!motionPreference?.matches) return
  context?.revert()
  complete()
}

function shuffledImages(sources: string[]) {
  const shuffled = [...sources]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[other]] = [shuffled[other]!, shuffled[index]!]
  }
  return shuffled
}

function playIntro() {
  if (!root.value || !page.value) return complete()

  context = gsap.context(() => {
    const timeline = gsap.timeline({ defaults: { ease: 'power2.out' }, onComplete: complete }).timeScale(playbackRate)
    const imageLayers = root.value!.querySelectorAll<HTMLElement>('.intro-layer')
    const imageExitStart = (imageLayers.length - 1) * layerInterval + layerDuration - 0.035
    const pageEntryStart = imageExitStart + imageExitDuration
    phase.value = 'stacking'

    // A shared camera keeps every visible layer moving through each handoff.
    timeline.fromTo('.intro-stack', { scale: 1 }, {
      scale: 1.4,
      duration: pageEntryStart,
      ease: 'none',
      force3D: true,
    }, 0)

    imageLayers.forEach((layer, index) => {
      const start = index * layerInterval
      timeline.addLabel(`layer-${index + 1}`, start)
      timeline.set(layer, { visibility: 'visible', opacity: 0, scale: startingScale, force3D: true }, start)
      timeline.to(layer, { opacity: 1, duration: 0.12, ease: 'sine.inOut' }, start)
      timeline.to(layer, { scale: 1, duration: layerDuration, ease: growthEase, force3D: true }, start)
    })

    timeline.addLabel('image-exit', imageExitStart)
    timeline.call(() => { phase.value = 'image-exit' }, [], 'image-exit')
    const lastImage = imageLayers[imageLayers.length - 1]
    if (lastImage) {
      timeline.to(lastImage, { scale: 1.55, autoAlpha: 0, duration: imageExitDuration, ease: 'power1.in', overwrite: 'auto', force3D: true }, 'image-exit')
    }
    // Clear the older layers as the final image gives way to the page.
    timeline.to('.intro-placeholder, .intro-layer:not(:last-child)', { autoAlpha: 0, duration: 0.16 }, 'image-exit')
    timeline.addLabel('page-enter', pageEntryStart)
    timeline.call(() => { phase.value = 'page-enter' }, [], 'page-enter')
    timeline.set(page.value, {
      autoAlpha: 0,
      scale: 0.88,
      force3D: true,
      filter: lensMap.value ? `url(#${lensId})` : 'none',
      willChange: 'transform, opacity',
    }, 'page-enter')
    timeline.to(page.value, { scale: 1, autoAlpha: 1, duration: pageEntryDuration, ease: 'power2.out' }, 'page-enter')
    if (lens.value && lensMap.value) {
      const strength = Math.min(window.innerWidth, window.innerHeight) * 0.24
      timeline.fromTo(lens.value, { attr: { scale: strength } }, {
        attr: { scale: 0 },
        duration: pageEntryDuration,
        ease: 'power2.out',
      }, 'page-enter')
    }
  }, root.value)
}

async function startWhenReady() {
  if (loadingAssets || disposed || completed || !page.value) return
  loadingAssets = true
  loadError.value = false
  try {
    if (motionPreference?.matches || !props.images.length) return complete()

    const pool = shuffledImages([...new Set(props.images)])
    layers.value = Array.from({ length: rounds * 2 }, (_, index) => ({
      src: pool[index % pool.length]!,
      circle: index % 2 === 1,
      growth: sizeMultiplier ** (index + 1),
    }))
    await nextTick()
    // Select first, then load just the six photos used by this visit. Offscreen
    // features, backgrounds and fonts must never delay the first screen.
    await Promise.all([
      preloadImages(page.value),
      ...[...root.value!.querySelectorAll<HTMLImageElement>('.intro-layer img')].map(async (image) => {
        if (image.complete && image.naturalWidth === 0) image.src = image.src
        await image.decode()
      }),
    ])
    if (!disposed && !completed) playIntro()
  } catch {
    if (!disposed && !completed) loadError.value = true
  } finally {
    loadingAssets = false
  }
}

onMounted(() => {
  lockScroll()
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionPreference.addEventListener('change', handleMotionPreference)
  if (motionPreference.matches || !props.images.length) return complete()
  prepareLens()
  void startWhenReady()
})

onUnmounted(() => {
  disposed = true
  context?.revert()
  restoreScroll?.()
  motionPreference?.removeEventListener('change', handleMotionPreference)
})
</script>

<template>
  <div ref="root" class="intro-root" :class="{ 'intro-active': active }" :data-intro-phase="phase">
    <svg v-if="active" class="intro-filter" aria-hidden="true" width="0" height="0">
      <defs>
        <filter :id="lensId" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
          <feImage :href="lensMap" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="lens-map" />
          <feDisplacementMap ref="lens" in="SourceGraphic" in2="lens-map" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
    <div v-if="active" class="intro-stage" role="status" aria-live="polite" :aria-label="messages.loading.label">
      <div class="intro-stack">
      <span class="intro-placeholder" :class="{ 'is-loaded': phase !== 'loading' }" aria-hidden="true"></span>
      <div
        v-for="(layer, index) in layers"
        :key="index"
        class="intro-layer"
        :class="{ 'is-circle': layer.circle }"
        :style="{ '--growth': layer.growth, zIndex: index + 1 }"
        aria-hidden="true"
      >
        <img :src="layer.src" alt="" decoding="sync" draggable="false" />
      </div>
      </div>
      <div v-if="loadError" class="intro-error">
        <p>{{ messages.loading.error }}</p>
        <button type="button" @click="startWhenReady">{{ messages.loading.retry }}</button>
      </div>
    </div>

    <div ref="page" class="intro-page" :inert="active" :aria-hidden="active ? true : undefined">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.intro-root { --intro-square: clamp(56px, 12vmin, 128px); }
.intro-filter { position: absolute; width: 0; height: 0; pointer-events: none; }

.intro-stage {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #f8f8f7;
  touch-action: none;
  overscroll-behavior: none;
}

.intro-placeholder {
  position: relative;
  grid-area: 1 / 1;
  width: var(--intro-square);
  aspect-ratio: 1;
  overflow: hidden;
  background: #e0e0df;
}

.intro-stack {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  transform-origin: center;
  will-change: transform;
  backface-visibility: hidden;
}

.intro-placeholder::after {
  position: absolute;
  inset: 0;
  content: '';
  background: linear-gradient(110deg, transparent 20%, #ffffffb3 50%, transparent 80%);
  transform: translateX(-140%);
  animation: square-shimmer 0.7s ease-in-out infinite;
}

.intro-placeholder.is-loaded::after { animation: none; opacity: 0; }

.intro-error { position: absolute; top: calc(50% + var(--intro-square) / 2 + 24px); text-align: center; color: #62636a; font-size: 15px; }
.intro-error button { margin-top: 12px; padding: 8px 18px; border: 1px solid #d5d5d5; border-radius: 6px; background: #fff; color: #22262f; font: inherit; cursor: pointer; }
.intro-error button:focus-visible { outline: 2px solid #7a6bdf; outline-offset: 4px; }

.intro-layer {
  grid-area: 1 / 1;
  position: relative;
  width: calc(var(--intro-square) * var(--growth));
  aspect-ratio: 1;
  flex-shrink: 0;
  overflow: hidden;
  visibility: hidden;
  opacity: 0;
  transform: scale(0.58);
  transform-origin: center;
  will-change: transform;
  backface-visibility: hidden;
  background: #e0e0df;
}

.intro-layer.is-circle { border-radius: 50%; }
.intro-layer img { width: 100%; height: 100%; max-width: none; object-fit: cover; user-select: none; }

.intro-page { background: #fff; }
.intro-active .intro-page {
  position: fixed;
  inset: 0;
  z-index: 101;
  overflow: hidden;
  visibility: hidden;
  transform-origin: 50% 50%;
  pointer-events: none;
}

@keyframes square-shimmer {
  to { transform: translateX(140%); }
}

@media (prefers-reduced-motion: reduce) {
  .intro-placeholder::after { animation: none; }
}
</style>
