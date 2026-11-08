<script setup lang="ts">
import { RiMicrosoftFill } from '@remixicon/vue'
import { useI18n } from '../i18n'

const { messages } = useI18n()

defineProps<{
  href: string
  label?: string
  external?: boolean
}>()
</script>

<template>
  <a class="button button-primary" :href="href" :target="external ? '_blank' : undefined" :rel="external ? 'noopener noreferrer' : undefined">
    <RiMicrosoftFill aria-hidden="true" />
    <span>{{ label ?? messages.downloadButton }}</span>
  </a>
</template>
