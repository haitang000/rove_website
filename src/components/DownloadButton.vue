<script setup lang="ts">
import { RiMicrosoftFill } from '@remixicon/vue'

defineProps<{
  href: string
}>()
</script>

<template>
  <a class="button button-primary" :href="href" target="_blank" rel="noopener noreferrer">
    <RiMicrosoftFill aria-hidden="true" />
    <span>Download for Windows</span>
  </a>
</template>
