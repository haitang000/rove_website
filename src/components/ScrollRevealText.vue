<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { gsap } from 'gsap'
import { loadScrollTrigger } from '../utils/scrollAnimations'

const props = withDefaults(defineProps<{ lines: string[]; enabled: boolean; lineSeparator?: string }>(), {
  lineSeparator: ' ',
})
const paragraph = ref<HTMLParagraphElement | null>(null)
const wordsByLine = computed(() => props.lines.map((line) => line.split(' ')))
const fullText = computed(() => props.lines.join(props.lineSeparator))
let media: gsap.MatchMedia | undefined
let setupVersion = 0

async function setupReveal() {
  const version = ++setupVersion
  media?.revert()
  if (!props.enabled || !paragraph.value) return
  let ScrollTrigger: Awaited<ReturnType<typeof loadScrollTrigger>>
  try {
    ScrollTrigger = await loadScrollTrigger()
  } catch {
    if (version === setupVersion) {
      paragraph.value?.querySelectorAll('.reveal-character').forEach(character => character.classList.add('is-read'))
    }
    return
  }
  if (version !== setupVersion || !paragraph.value) return

  const element = paragraph.value
  const characters = [...element.querySelectorAll<HTMLElement>('.reveal-character')]
  let revealedCount = 0

  function reveal(count: number) {
    if (count === revealedCount) return
    const from = Math.min(count, revealedCount)
    const to = Math.max(count, revealedCount)
    for (let index = from; index < to; index++) {
      characters[index]!.classList.toggle('is-read', index < count)
    }
    revealedCount = count
  }

  media = gsap.matchMedia()
  media.add({
    motion: '(prefers-reduced-motion: no-preference)',
    reduced: '(prefers-reduced-motion: reduce)',
  }, (context) => {
    if (context.conditions?.reduced) {
      reveal(characters.length)
    } else {
      ScrollTrigger.create({
        trigger: element,
        start: 'top 85%',
        end: 'bottom 45%',
        onUpdate: (self) => reveal(Math.floor(self.progress * characters.length)),
        onRefresh: (self) => reveal(Math.floor(self.progress * characters.length)),
      })
    }

    return () => reveal(0)
  }, element)
}

onMounted(setupReveal)
watch(() => [props.enabled, props.lines], setupReveal, { flush: 'post' })
onUnmounted(() => {
  setupVersion++
  media?.revert()
})
</script>

<template>
  <p ref="paragraph" class="scroll-reveal-text">
    <span class="reveal-accessible">{{ fullText }}</span>
    <span aria-hidden="true">
      <template v-for="(words, lineIndex) in wordsByLine" :key="lineIndex">
        <template v-if="lineIndex"><br class="desktop-break" />{{ lineSeparator }}</template>
        <template v-for="(word, wordIndex) in words" :key="wordIndex">
          {{ wordIndex ? ' ' : '' }}<span class="reveal-word"><span
            v-for="(character, characterIndex) in Array.from(word)"
            :key="characterIndex"
            class="reveal-character"
          >{{ character }}</span></span>
        </template>
      </template>
    </span>
  </p>
</template>

<style scoped>
.reveal-word { white-space: nowrap; }
.reveal-word:lang(zh) { white-space: normal; }
.reveal-character { color: #c8c8c8; transition: color 90ms linear; }
.reveal-character.is-read { color: #22262f; }
.reveal-accessible {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@media (prefers-reduced-motion: reduce) {
  .reveal-character { color: #22262f; transition: none; }
}
</style>
