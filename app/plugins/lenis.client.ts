import Lenis from 'lenis'

declare module '#app' {
  interface NuxtApp {
    $lenis: Lenis | null
  }
}

export default defineNuxtPlugin(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReduced) {
    return {
      provide: {
        lenis: null,
      },
    }
  }

  const lenis = new Lenis({
    duration: 1.12,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.9,
  })

  // Нативный rAF-цикл вместо gsap.ticker — чтобы GSAP не тянулся в основной бандл,
  // а оставался только в лениво-подгружаемых чанках (Hero/Preloader).
  // Таймстамп rAF уже в миллисекундах, поэтому *1000 не нужно.
  let rafId = 0
  const raf = (time: number) => {
    lenis.raf(time)
    rafId = requestAnimationFrame(raf)
  }
  rafId = requestAnimationFrame(raf)
  void rafId

  // Удобный доступ для отладки в dev (в проде не выполняется).
  if (import.meta.dev) {
    ;(window as unknown as { __lenis?: unknown }).__lenis = lenis
  }

  // Плавное «перемещение по блокам»: клики по якорным ссылкам (#...) на той же
  // странице мягко прокручивают к секции с учётом высоты прилипающей шапки.
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
  const onAnchorClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const link = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
    if (!link) return
    const href = link.getAttribute('href')
    if (!href || href === '#') return
    const el = document.querySelector(href)
    if (!el) return
    e.preventDefault()
    lenis.scrollTo(href === '#top' ? 0 : (el as HTMLElement), {
      offset: href === '#top' ? 0 : -86,
      duration: 1.25,
      easing: easeOut,
    })
    if (window.history?.replaceState) window.history.replaceState(null, '', href)
  }
  document.addEventListener('click', onAnchorClick)

  return {
    provide: {
      lenis,
    },
  }
})
