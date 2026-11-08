<script setup lang="ts">
defineProps<{
  image: string
  imageAlt: string
  title: string[]
  description: string
}>()
</script>

<template>
  <article class="feature-card">
    <img
      class="feature-image"
      :src="image"
      :alt="imageAlt"
      width="660"
      height="410"
      loading="eager"
      decoding="async"
    />
    <div class="feature-copy">
      <h2>
        <template v-for="(line, index) in title" :key="line">
          <br v-if="index" />{{ line }}
        </template>
      </h2>
      <p>
        <template v-for="(line, index) in description.split('\n')" :key="line">
          <br v-if="index" class="desktop-break" />{{ index ? ' ' : '' }}{{ line }}
        </template>
      </p>
    </div>
  </article>
</template>
