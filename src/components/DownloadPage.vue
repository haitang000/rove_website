<script setup lang="ts">
import { RiGithubFill } from '@remixicon/vue'
import DownloadButton from './DownloadButton.vue'
import { useI18n } from '../i18n'
import roveLogo from '../../rove.svg'

defineProps<{
  downloadUrl: string
  repositoryUrl: string
  homeHref: string
}>()

defineEmits<{ home: [event: MouseEvent] }>()

const { messages } = useI18n()
</script>

<template>
  <main class="download-page" aria-labelledby="download-page-title">
    <a class="download-page-brand" :href="homeHref" :aria-label="messages.downloadPage.backHome" @click="$emit('home', $event)">
      <img :src="roveLogo" alt="Rove" width="68" height="68" />
    </a>

    <h1 id="download-page-title" tabindex="-1">
      <template v-for="(line, index) in messages.downloadPage.title" :key="index">
        <br v-if="index" />{{ line }}
      </template>
    </h1>

    <ol class="download-notices">
      <li v-for="(notice, index) in messages.downloadPage.notices" :key="index">
        <span class="download-notice-number" aria-hidden="true">{{ index + 1 }}</span>
        <p>{{ notice }}</p>
      </li>
    </ol>

    <nav class="download-page-actions" :aria-label="messages.downloadPage.actionsLabel">
      <DownloadButton :href="downloadUrl" :label="messages.downloadPage.confirmButton" external />
      <a class="button button-secondary" :href="repositoryUrl" target="_blank" rel="noopener noreferrer">
        <RiGithubFill aria-hidden="true" />
        <span>{{ messages.githubButton }}</span>
      </a>
    </nav>
  </main>
</template>

<style scoped>
.download-page {
  width: min(1536px, 75%);
  min-height: 100svh;
  margin-inline: auto;
  padding-top: clamp(80px, 11vw, 226px);
  padding-bottom: 96px;
}

.download-page-brand { display: block; width: fit-content; margin-bottom: 14px; }
.download-page-brand img { width: clamp(48px, 3.32vw, 68px); height: auto; }
.download-page h1 { font-size: clamp(44px, 3.71vw, 76px); font-weight: 600; line-height: .95; }
.download-page h1:focus { outline: none; }
.download-page h1:lang(zh) { line-height: 1.15; letter-spacing: 0; }

.download-notices { display: grid; gap: 12px; margin: clamp(48px, 4vw, 82px) 0 0; padding: 0; list-style: none; }
.download-notices li { display: flex; align-items: stretch; gap: clamp(18px, 1.27vw, 26px); min-height: clamp(80px, 5.22vw, 107px); }
.download-notice-number { display: grid; place-items: center; flex: 0 0 clamp(56px, 3.71vw, 76px); color: #fff; background: #4062ff; font-size: clamp(36px, 2.44vw, 50px); font-weight: 400; line-height: 1; }
.download-notices li:nth-child(2) .download-notice-number { background: #d24afa; }
.download-notices p { align-self: center; font-size: clamp(24px, 1.855vw, 38px); font-weight: 400; line-height: 1.32; }
.download-notices p:lang(zh) { line-height: 1.6; }

.download-page-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: clamp(48px, 4.3vw, 88px); }
.download-page-actions .button { min-height: 72px; padding: 16px 26px; font-size: 26px; }
.download-page-actions .button-secondary { min-width: 348px; }
.download-page-actions .button:active { transform: scale(.98); }

@media (max-width: 1599px) {
  .download-page-actions .button { min-height: 60px; padding: 12px 22px; font-size: 21px; }
  .download-page-actions .button-secondary { min-width: 284px; }
}

@media (max-width: 1199px) {
  .download-page { width: calc(100% - 128px); padding-top: 80px; }
  .download-page-actions .button-secondary { min-width: 0; }
}

@media (max-width: 700px) {
  .download-page { width: calc(100% - 48px); padding-top: 56px; padding-bottom: 48px; }
  .download-page-brand { margin-bottom: 20px; }
  .download-page-brand img { width: 44px; }
  .download-page h1 { font-size: clamp(30px, 7.9vw, 44px); line-height: 1.04; }
  .download-notices { gap: 20px; margin-top: 40px; }
  .download-notices li { min-height: 0; gap: 16px; }
  .download-notice-number { flex-basis: 44px; min-height: 64px; font-size: 30px; }
  .download-notices p { padding-block: 4px; font-size: 18px; line-height: 1.45; overflow-wrap: anywhere; }
  .download-page-actions { align-items: stretch; flex-direction: column; gap: 12px; margin-top: 40px; }
  .download-page-actions .button { min-height: 54px; padding: 12px 16px; font-size: 17px; }
}
</style>
