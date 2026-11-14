<script setup lang="ts">
import { computed, ref } from 'vue'
import { RiAlertLine, RiGithubFill } from '@remixicon/vue'
import DownloadButton from './DownloadButton.vue'
import { useI18n } from '../i18n'
import roveLogo from '../../rove.svg'

const props = defineProps<{
  previewUrl: string
  canaryUrl: string
  repositoryUrl: string
  homeHref: string
}>()

defineEmits<{ home: [event: MouseEvent] }>()

const { messages } = useI18n()
const channels = ['preview', 'canary'] as const
const selectedChannel = ref<(typeof channels)[number]>('preview')
const downloadUrl = computed(() => selectedChannel.value === 'preview' ? props.previewUrl : props.canaryUrl)
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

    <fieldset class="download-channels">
      <legend>{{ messages.downloadPage.versionLabel }}</legend>
      <div class="download-channel-options">
        <label v-for="channel in channels" :key="channel" class="download-channel">
          <input
            v-model="selectedChannel"
            type="radio"
            name="download-channel"
            :value="channel"
            :aria-labelledby="`download-channel-${channel}-title`"
            :aria-describedby="`download-channel-${channel}-description${channel === 'canary' ? ' download-channel-canary-warning' : ''}`"
          />
          <span class="download-channel-card">
            <span class="download-channel-heading">
              <span :id="`download-channel-${channel}-title`" class="download-channel-name">{{ messages.downloadPage.channels[channel].name }}</span>
              <span v-if="channel === 'canary'" id="download-channel-canary-warning" class="download-channel-warning">
                <RiAlertLine aria-hidden="true" />
                {{ messages.downloadPage.unstableLabel }}
              </span>
            </span>
            <span :id="`download-channel-${channel}-description`" class="download-channel-description">{{ messages.downloadPage.channels[channel].description }}</span>
          </span>
        </label>
      </div>
    </fieldset>

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

.download-channels { max-width: 872px; min-width: 0; margin: clamp(48px, 4.3vw, 88px) 0 0; padding: 0; border: 0; }
.download-channels legend { margin-bottom: 20px; padding: 0; font-size: clamp(30px, 2.34vw, 48px); font-weight: 600; line-height: 1.2; }
.download-channel-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.download-channel { position: relative; display: flex; min-width: 0; cursor: pointer; }
.download-channel input { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: pointer; }
.download-channel-card { display: flex; flex: 1; flex-direction: column; justify-content: center; min-width: 0; min-height: clamp(180px, 10.5vw, 214px); padding: clamp(24px, 2vw, 40px); border: 1px solid #e5e5e8; border-radius: 18px; }
.download-channel input:checked + .download-channel-card { border-color: #4062ff; box-shadow: inset 0 0 0 3px #4062ff; }
.download-channel input:checked + .download-channel-card .download-channel-name { color: #4062ff; }
.download-channel input:focus-visible + .download-channel-card { outline: 3px solid #6955f6; outline-offset: 5px; }
.download-channel-heading { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.download-channel-name { font-size: clamp(28px, 1.95vw, 40px); font-weight: 600; line-height: 1.2; }
.download-channel-warning { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 999px; color: #a61b27; background: #ffb4b8; font-size: 18px; line-height: 1.25; }
.download-channel-warning svg { width: 22px; height: 22px; flex-shrink: 0; }
.download-channel-description { margin-top: 4px; color: #4b4e56; font-size: clamp(18px, 1.27vw, 26px); font-weight: 300; line-height: 1.3; }
.download-channel-description:lang(zh) { line-height: 1.4; }

.download-page-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 18px; }
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
  .download-channels { margin-top: 40px; }
  .download-channels legend { margin-bottom: 16px; font-size: 28px; }
  .download-channel-options { grid-template-columns: 1fr; gap: 12px; }
  .download-channel-card { min-height: 0; padding: 24px; border-radius: 16px; }
  .download-channel-name { font-size: 28px; }
  .download-channel-warning { font-size: 16px; }
  .download-channel-warning svg { width: 20px; height: 20px; }
  .download-channel-description { font-size: 18px; }
  .download-page-actions { align-items: stretch; flex-direction: column; gap: 12px; margin-top: 16px; }
  .download-page-actions .button { min-height: 54px; padding: 12px 16px; font-size: 17px; }
}
</style>
