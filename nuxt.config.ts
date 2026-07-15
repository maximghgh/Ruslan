// https://nuxt.com/docs/api/configuration/nuxt-config

// Базовый путь сайта. На GitHub Pages проект открывается по под-пути (/Ruslan/),
// он задаётся переменной NUXT_APP_BASE_URL в GitHub Actions; локально — корень.
const baseURL = process.env.NUXT_APP_BASE_URL || '/'

export default defineNuxtConfig({
  compatibilityDate: '2026-05-16',

  devtools: { enabled: true },

  modules: ['@nuxtjs/sitemap', '@nuxtjs/robots', '@nuxt/fonts'],

  css: ['~/assets/css/main.css'],

  // Шрифты хостятся локально (скачиваются на этапе сборки), с кириллицей и font-display:swap.
  // Это убирает render-blocking внешний Google Fonts и его ненадёжность из РФ.
  fonts: {
    families: [
      { name: 'Manrope', provider: 'google', weights: [400, 500, 600, 700, 800], subsets: ['cyrillic', 'latin'] },
      { name: 'Unbounded', provider: 'google', weights: [600, 700, 800], subsets: ['cyrillic', 'latin'] },
    ],
  },

  // Общие SEO-настройки сайта. URL замените на ваш реальный домен,
  // когда он появится — он используется в canonical, sitemap.xml и robots.txt.
  site: {
    url: 'https://yuristpro1.ru',
    name: 'Разблокировка карт и счетов по 115-ФЗ и 161-ФЗ — Руслан Ганеев',
    description:
      'Профессиональная помощь в разблокировке банковских карт и счетов по 115-ФЗ и 161-ФЗ. Снятие блокировки, вывод из базы ЦБ РФ, восстановление ДБО. Москва и вся Россия — дистанционно.',
    defaultLocale: 'ru',
    indexable: true,
    // GitHub Pages отдаёт статические страницы со слэшем (/keysy/) — приводим
    // canonical, sitemap и og:url к одному виду, чтобы не было дублей.
    trailingSlash: true,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0468d6' },
        { name: 'format-detection', content: 'telephone=yes' },
      ],
      link: [
        { rel: 'icon', href: `${baseURL}favicon.ico`, sizes: '48x48' },
        { rel: 'icon', type: 'image/svg+xml', href: `${baseURL}favicon.svg` },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: `${baseURL}favicon-32x32.png` },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: `${baseURL}favicon-16x16.png` },
        { rel: 'apple-touch-icon', sizes: '180x180', href: `${baseURL}apple-touch-icon.png` },
        { rel: 'manifest', href: `${baseURL}site.webmanifest` },
        // Ускоряем соединение с доменами аналитики (Метрика → mc.yandex.ru, GA → googletagmanager).
        { rel: 'preconnect', href: 'https://mc.yandex.ru', crossorigin: '' },
        { rel: 'dns-prefetch', href: 'https://mc.yandex.ru' },
        { rel: 'preconnect', href: 'https://www.googletagmanager.com' },
        { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
      ],
    },
  },

  // Почтовые настройки читаются из .env (серверная часть, в браузер не попадают).
  runtimeConfig: {
    mailHost: process.env.MAIL_HOST || 'smtp.gmail.com',
    mailPort: process.env.MAIL_PORT || '587',
    mailUser: process.env.MAIL_USERNAME || '',
    mailPass: process.env.MAIL_PASSWORD || '',
    mailFrom: process.env.MAIL_FROM_ADDRESS || '',
    mailFromName: process.env.MAIL_FROM_NAME || 'Сайт-визитка',
    mailTo: process.env.MAIL_TO || '',
  },

  routeRules: {
    '/': { prerender: true },
    '/keysy': { prerender: true },
    '/politika-konfidencialnosti': { prerender: true },
  },

  sitemap: {
    autoLastmod: true,
    defaults: { changefreq: 'monthly', priority: 0.7 },
    urls: [
      { loc: '/', priority: 1.0, changefreq: 'weekly' },
      { loc: '/keysy/', priority: 0.8, changefreq: 'weekly' },
      { loc: '/politika-konfidencialnosti/', priority: 0.3, changefreq: 'yearly' },
    ],
  },

  robots: {
    robotsTxt: baseURL === '/',
  },

  nitro: {
    compressPublicAssets: true,
  },
})
