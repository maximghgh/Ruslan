<script setup lang="ts">
import { cases } from '~/composables/useCases'

const siteUrl = 'https://yuristpro1.ru'
const total = cases.length

const title = `Кейсы разблокировки карт и счетов (${total}) — Руслан Ганеев`
const description =
  `Более ${total} документально подтверждённых разблокировок банковских карт и счетов по 115-ФЗ и 161-ФЗ: ответы банков и Банка России о снятии ограничений и исключении из базы ЦБ РФ.`

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Кейсы', item: `${siteUrl}/keysy/` },
      ],
    },
    {
      '@type': 'CollectionPage',
      '@id': `${siteUrl}/keysy/#collection`,
      url: `${siteUrl}/keysy/`,
      name: title,
      description,
      inLanguage: 'ru-RU',
      isPartOf: { '@id': `${siteUrl}/#website` },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: total,
        itemListElement: cases.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'ImageObject',
            name: c.title,
            caption: c.text,
            contentUrl: `${siteUrl}${c.img}`,
          },
        })),
      },
    },
  ],
}

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website',
  ogUrl: `${siteUrl}/keysy/`,
  ogImage: `${siteUrl}/og-image.png`,
  ogLocale: 'ru_RU',
  robots: 'index, follow, max-image-preview:large',
})
useHead({
  link: [{ rel: 'canonical', href: `${siteUrl}/keysy/` }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
    },
  ],
})
</script>

<template>
  <section class="section keyspage">
    <div class="container">
      <NuxtLink to="/" class="keyspage__back">
        <svg viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        На главную
      </NuxtLink>

      <div class="section-head keyspage__head">
        <p class="eyebrow">Кейсы</p>
        <h1 class="section-title">
          <span class="keyspage__num">{{ total }}</span> подтверждённых разблокировок карт и счетов по 115-ФЗ и 161-ФЗ
        </h1>
        <p class="section-subtitle">
          Реальные ответы банков и Центрального банка РФ о снятии блокировок по 115-ФЗ и 161-ФЗ.
          Отфильтруйте по банку или типу дела, нажмите на изображение, чтобы открыть на весь экран.
        </p>
      </div>

      <h2 class="sr-only">Галерея подтверждённых кейсов разблокировки карт и счетов</h2>
      <CasesGrid :items="cases" :filters="true" />
    </div>
  </section>
</template>

<style scoped>
.keyspage { padding-top: 32px; }
.keyspage__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 18px;
  font-size: 15px;
  font-weight: 700;
  color: var(--blue-700);
  transition: gap .2s ease, color .2s ease;
}
.keyspage__back svg { width: 20px; height: 20px; }
.keyspage__back:hover { gap: 10px; color: var(--blue-600); }
.keyspage__head { margin-bottom: 30px; }
.keyspage__num {
  background: linear-gradient(120deg, var(--blue-600), var(--cyan));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
@media (min-width: 900px) {
  .keyspage { padding-top: 44px; }
}
</style>
