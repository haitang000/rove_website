export async function preloadImages(container: HTMLElement, sources: string[]) {
  const pageImages = [...container.querySelectorAll<HTMLImageElement>('img')]

  // Hidden, offscreen lazy images must also start loading before the entrance.
  for (const image of pageImages) image.loading = 'eager'

  const backgroundSources = [...container.querySelectorAll<HTMLElement>('*')]
    .flatMap((element) => [...getComputedStyle(element).backgroundImage.matchAll(/url\(\s*["']?(.*?)["']?\s*\)/g)])
    .map((match) => match[1]!)
  const pageSources = pageImages.map((image) => image.currentSrc || image.src).filter(Boolean)

  const preload = [...new Set([...sources, ...backgroundSources, ...pageSources])].map(async (source) => {
    const image = new Image()
    image.src = source
    await image.decode()
  })

  await Promise.all([...preload, document.fonts.ready])

  // A successful preload lets failed page elements reload from the cache on retry.
  // Actual elements must also be decoded before the page becomes visible.
  await Promise.all(pageImages.map(async (image) => {
    if (image.complete && image.naturalWidth === 0) image.src = image.currentSrc || image.src
    await image.decode()
  }))
}
