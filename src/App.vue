<script setup lang="ts">
import { ref } from 'vue'
import { RiGithubFill, RiChromeFill } from '@remixicon/vue'
import DownloadButton from './components/DownloadButton.vue'
import FeatureCard from './components/FeatureCard.vue'
import LoadingIntro from './components/LoadingIntro.vue'
import ScrollRevealText from './components/ScrollRevealText.vue'
import { useSmoothScroll } from './composables/useSmoothScroll'
import roveLogo from '../rove.svg'
import banner from '../banner.png'
import tabManagement from '../tab_management.png'
import splitView from '../split.png'
import peek from '../peek.png'
import ctaBackground from '../cta_bg.png'

const repositoryUrl = 'https://github.com/haitang000/RoveBrowser'
const downloadUrl = `${repositoryUrl}/releases/latest`
const introComplete = ref(false)
useSmoothScroll(introComplete)
const introductionLines = [
  'Your tabs in a sidebar, your browsing organized into',
  'spaces. A lightweight, high-performance browser built',
  'with Rust for Windows. Free and open-source, designed',
  'to make browsing feel effortless.',
]
const introPhotos = Object.values(import.meta.glob('./assets/intro/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
})) as string[]

const features = [
  {
    image: tabManagement,
    imageAlt: 'Rove tab overview, with all open tabs organized into Personal and Work spaces.',
    title: ['Manage all your tabs', 'efficiently'],
    description: 'Manage all your tabs in one place - incredibly convenient',
  },
  {
    image: splitView,
    imageAlt: 'Two websites open side by side in Rove’s split view.',
    title: ['Multitask,', 'effortlessly.'],
    description: 'View two pages side by side. Compare, research, and get more done without switching tabs.',
  },
  {
    image: peek,
    imageAlt: 'A YouTube video preview floating above the current page in Rove.',
    title: ['A Glance Is', 'All You Need.'],
    description: 'Preview links instantly without leaving your page.\nStay focused, browse seamlessly.',
  },
]
</script>

<template>
  <LoadingIntro :images="introPhotos" :preload="[tabManagement, splitView, peek, banner, ctaBackground]" @complete="introComplete = true">
  <a class="skip-link" href="#meet-rove">Skip to content</a>

  <main class="page-shell">
    <section class="hero" aria-labelledby="hero-title">
      <header class="hero-header">
        <div class="hero-copy">
          <img class="brand-mark" :src="roveLogo" alt="Rove" width="64" height="64" />
          <h1 id="hero-title">Light by Design.<br />Fast by Nature.</h1>
          <p class="hero-description">A Windows browser built with Rust. Free and open-source</p>
        </div>

        <nav class="hero-actions" aria-label="Get Rove">
          <DownloadButton :href="downloadUrl" />
          <a class="button button-secondary" :href="repositoryUrl" target="_blank" rel="noopener noreferrer">
            <RiGithubFill aria-hidden="true" />
            <span>View on GitHub</span>
          </a>
        </nav>
      </header>

      <div class="hero-visual">
        <img
          :src="banner"
          class="browser-preview"
          alt="Rove browser with a clean vertical sidebar, browsing spaces, and the Notion homepage."
          width="1440"
          height="852"
          fetchpriority="high"
        />
      </div>
    </section>

    <section id="meet-rove" class="introduction" aria-labelledby="meet-title">
      <h2 id="meet-title" class="eyebrow">Meet Rove</h2>
      <ScrollRevealText :lines="introductionLines" :enabled="introComplete" />
    </section>

    <section class="features" aria-label="A more effortless way to browse">
      <FeatureCard v-for="feature in features" :key="feature.image" v-bind="feature" />
    </section>

    <section class="performance" aria-labelledby="performance-title">
      <h2 id="performance-title">Incredible app size and speed</h2>
      <p class="performance-description">Speedometer3.1 (The lower the better)</p>

      <div class="benchmark" role="img" aria-label="Performance comparison from the design: Rove 19.9, Chrome 23.0. Lower is better.">
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
        <h2 id="download-title">Go Further. Browse Lighter.</h2>
        <p>Experience a lighter, faster way to explore the web. Built with Rust, made for<br class="desktop-break" /> Windows, and free for everyone.</p>
        <DownloadButton :href="downloadUrl" />
      </div>
    </section>
  </main>
  </LoadingIntro>
</template>
