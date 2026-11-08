<script setup lang="ts">
import { RiMicrosoftFill } from '@remixicon/vue'
import { useI18n } from '../i18n'

const { messages } = useI18n()

defineProps<{
  href: string
}>()
</script>

<template>
  <a class="button button-primary" :href="href" target="_blank" rel="noopener noreferrer">
    <RiMicrosoftFill aria-hidden="true" />
    <span>{{ messages.downloadButton }}</span>
  </a>
</template>
