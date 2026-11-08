<script setup lang="ts">
import { computed, ref } from 'vue'
import { RiGithubFill, RiChromeFill } from '@remixicon/vue'
import DownloadButton from './components/DownloadButton.vue'
import FeatureCard from './components/FeatureCard.vue'
import LoadingIntro from './components/LoadingIntro.vue'
import ScrollRevealText from './components/ScrollRevealText.vue'
import { useSmoothScroll } from './composables/useSmoothScroll'
import { useI18n } from './i18n'
import roveLogo from '../rove.svg'
import banner from '../banner.png'
import tabManagement from '../tab_management.png'
import splitView from '../split.png'
import peek from '../peek.png'
import ctaBackground from '../cta_bg.png'

const repositoryUrl = 'https://github.com/haitang000/RoveBrowser'
const downloadUrl = `${repositoryUrl}/releases/latest`
const introComplete = ref(false)
const { messages } = useI18n()
useSmoothScroll(introComplete)
const introPhotos = Object.values(import.meta.glob('./assets/intro/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
})) as string[]

const features = computed(() => [
  {
    image: tabManagement,
    ...messages.value.features.tabs,
  },
  {
    image: splitView,
    ...messages.value.features.split,
  },
  {
    image: peek,
    ...messages.value.features.peek,
  },
])
</script>

<template>
  <LoadingIntro :images="introPhotos" :preload="[tabManagement, splitView, peek, banner, ctaBackground]" @complete="introComplete = true">
  <a class="skip-link" href="#meet-rove">{{ messages.skipToContent }}</a>

  <main class="page-shell">
    <section class="hero" aria-labelledby="hero-title">
      <header class="hero-header">
        <div class="hero-copy">
          <img class="brand-mark" :src="roveLogo" alt="Rove" width="64" height="64" />
          <h1 id="hero-title">
            <template v-for="(line, index) in messages.hero.title" :key="index">
              <br v-if="index" />{{ line }}
            </template>
          </h1>
          <p class="hero-description">{{ messages.hero.description }}</p>
        </div>

        <nav class="hero-actions" :aria-label="messages.hero.actionsLabel">
          <DownloadButton :href="downloadUrl" />
          <a class="button button-secondary" :href="repositoryUrl" target="_blank" rel="noopener noreferrer">
            <RiGithubFill aria-hidden="true" />
            <span>{{ messages.githubButton }}</span>
          </a>
        </nav>
      </header>

      <div class="hero-visual">
        <img
          :src="banner"
          class="browser-preview"
          :alt="messages.hero.imageAlt"
          width="1440"
          height="852"
          fetchpriority="high"
        />
      </div>
    </section>

    <section id="meet-rove" class="introduction" aria-labelledby="meet-title">
      <h2 id="meet-title" class="eyebrow">{{ messages.introduction.title }}</h2>
      <ScrollRevealText :lines="messages.introduction.lines" :line-separator="messages.introduction.lineSeparator" :enabled="introComplete" />
    </section>

    <section class="features" :aria-label="messages.featuresLabel">
      <FeatureCard v-for="feature in features" :key="feature.image" v-bind="feature" />
    </section>

    <section class="performance" aria-labelledby="performance-title">
      <h2 id="performance-title">{{ messages.performance.title }}</h2>
      <p class="performance-description">{{ messages.performance.description }}</p>

      <div class="benchmark" role="img" :aria-label="messages.performance.benchmarkLabel">
        <div class="benchmark-row">
          <div class="browser-name">
            <span class="browser-icon"><img :src="roveLogo" alt="" width="44" height="44" /></span>
            <span>Rove</span>
          </div>
          <div class="benchmark-result">
            <span class="benchmark-bar benchmark-bar-rove"></span>
            <span class="benchmark-value benchmark-value-rove">19.9</span>
          </div>
        </div>
        <div class="benchmark-row">
          <div class="browser-name">
            <span class="browser-icon"><RiChromeFill aria-hidden="true" /></span>
            <span>Chrome</span>
          </div>
          <div class="benchmark-result">
            <span class="benchmark-bar benchmark-bar-chrome"></span>
            <span class="benchmark-value">23.0</span>
          </div>
        </div>
      </div>
    </section>

    <section class="download-banner" aria-labelledby="download-title">
      <div class="download-copy">
        <h2 id="download-title">{{ messages.download.title }}</h2>
        <p>
          <template v-for="(line, index) in messages.download.description.split('\n')" :key="index">
            <br v-if="index" class="desktop-break" />{{ index ? ' ' : '' }}{{ line }}
          </template>
        </p>
        <DownloadButton :href="downloadUrl" />
      </div>
    </section>
  </main>
  </LoadingIntro>
</template>
