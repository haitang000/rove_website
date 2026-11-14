export async function preloadImages(container: HTMLElement) {
  // Only explicitly marked first-screen images gate the entrance. Decode the
  // actual responsive element so a mobile visit never preloads the desktop URL.
  const images = [...container.querySelectorAll<HTMLImageElement>('img[data-preload]')]
  await Promise.all(images.map(async (image) => {
    // A failed element can retry the same responsive source from the network.
    if (image.complete && image.naturalWidth === 0) image.src = image.currentSrc || image.src
    await image.decode()
  }))
}
