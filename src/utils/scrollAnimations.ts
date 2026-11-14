import { gsap } from 'gsap'

let scrollTrigger: Promise<typeof import('gsap/ScrollTrigger')['ScrollTrigger']> | undefined

// Shared by the navbar, text reveal and smooth scrolling, after the intro.
export function loadScrollTrigger() {
  return scrollTrigger ??= import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
    gsap.registerPlugin(ScrollTrigger)
    return ScrollTrigger
  }).catch((error) => {
    scrollTrigger = undefined
    throw error
  })
}
