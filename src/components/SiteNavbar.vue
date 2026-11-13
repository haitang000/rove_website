<script setup lang="ts">
import DownloadButton from './DownloadButton.vue'
import { useI18n } from '../i18n'
import roveLogo from '../../rove.svg'

defineProps<{ repositoryUrl: string }>()
defineEmits<{ download: [event: MouseEvent] }>()

const { messages } = useI18n()
</script>

<template>
  <header class="site-header">
    <nav class="site-navbar" :aria-label="messages.navigation.label">
      <a class="navbar-brand" href="#home" :aria-label="messages.navigation.home">
        <img :src="roveLogo" alt="" width="40" height="40" />
        <span>Rove</span>
      </a>

      <ul class="navbar-links">
        <li><a href="#features">{{ messages.navigation.features }}</a></li>
        <li><a :href="`${repositoryUrl}/releases`" target="_blank" rel="noopener noreferrer">{{ messages.navigation.changelogs }}</a></li>
        <li><a :href="`${repositoryUrl}/issues`" target="_blank" rel="noopener noreferrer">{{ messages.navigation.questions }}</a></li>
        <li><a :href="repositoryUrl" target="_blank" rel="noopener noreferrer">GitHub</a></li>
      </ul>

      <DownloadButton class="navbar-download" href="#download" :label="messages.navigation.download" @click="$emit('download', $event)" />
    </nav>
  </header>
</template>

<style scoped>
.site-header { padding-top: 26px; }
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
.navbar-links a:focus-visible { color: #22262f; }
.navbar-download { min-height: 52px; padding: 9px 14px; border-radius: 12px; font-size: 24px; }
.navbar-download:active { transform: scale(.97); }

@media (hover: hover) and (pointer: fine) {
  .navbar-links a:hover { color: #22262f; }
}

@media (max-width: 1599px) {
  .site-header { padding-top: 22px; }
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
  .site-header { padding-top: 16px; }
  .site-navbar { display: grid; grid-template-columns: 1fr auto; width: calc(100% - 40px); max-width: none; gap: 12px 20px; }
  .navbar-brand { width: fit-content; }
  .navbar-links { grid-column: 1 / -1; grid-row: 2; justify-content: space-between; flex-wrap: wrap; gap: 0 12px; }
  .navbar-links a { font-size: 16px; }
  .navbar-download { grid-column: 2; grid-row: 1; }
}
</style>
