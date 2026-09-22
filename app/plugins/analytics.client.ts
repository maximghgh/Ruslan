// Аналитика: только Яндекс.Метрика (российская, данные в РФ).
// Google Analytics убран по 152-ФЗ (иностранная аналитика, передача данных за границу).
// ВАЖНО (152-ФЗ, «согласие до обработки»): счётчик грузится ТОЛЬКО после того, как
// пользователь нажал «Принять» в cookie-баннере (см. app/components/CookieConsent.vue).
// До согласия — ни одного запроса к mc.yandex.ru.
export default defineNuxtPlugin(() => {
  const { seo } = useAppConfig() as { seo?: { yandexMetrika?: string } }
  const w = window as unknown as Record<string, unknown> & { dataLayer?: unknown[] }
  const router = useRouter()

  const metrika = seo?.yandexMetrika
  if (!metrika) return

  let initialized = false
  const init = () => {
    if (initialized) return
    initialized = true
    // ===== Яндекс.Метрика =====
    if (metrika) {
      ;(function (m: any, e: Document, t: string, r: string, i: string) {
        m[i] =
          m[i] ||
          function (...args: unknown[]) {
            ;(m[i].a = m[i].a || []).push(args)
          }
        m[i].l = 1 * (new Date() as unknown as number)
        const k = e.createElement(t) as HTMLScriptElement
        const a = e.getElementsByTagName(t)[0]
        k.async = true
        k.src = r
        a?.parentNode?.insertBefore(k, a)
      })(w, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym')
      ;(w.ym as (...a: unknown[]) => void)(Number(metrika), 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: false, // запись сессий выключена — тяжёлая для CWV; включайте точечно для отладки
      })
    }
  }

  // Загрузку откладываем до простоя браузера (или до таймаута), чтобы не мешать LCP/INP.
  const schedule = () => {
    const ric = (w as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback
    if (typeof ric === 'function') ric(init, { timeout: 3000 })
    else window.setTimeout(init, 1500)
  }

  // 152-ФЗ: счётчик грузится ТОЛЬКО после согласия на cookie.
  let consent: string | null = null
  try { consent = localStorage.getItem('cookie_consent') } catch { /* нет доступа */ }
  if (consent === 'accepted') {
    schedule()
  } else {
    // ждём нажатия «Принять» в cookie-баннере
    window.addEventListener('cookie-consent-accepted', schedule, { once: true })
  }

  // Учёт переходов между страницами (SPA): первый просмотр уже учтён при init.
  let first = true
  router.afterEach((to) => {
    if (first) {
      first = false
      return
    }
    if (metrika && typeof w.ym === 'function') {
      ;(w.ym as (...a: unknown[]) => void)(Number(metrika), 'hit', to.fullPath)
    }
  })
})
