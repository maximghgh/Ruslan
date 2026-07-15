<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error?.statusCode === 404)

// Ссылка на главную с учётом base URL (на GitHub Pages сайт может жить под под-путём).
const home = useRuntimeConfig().app.baseURL

useHead({
  title: is404.value ? 'Страница не найдена — Руслан Ганеев' : 'Ошибка — Руслан Ганеев',
  meta: [{ name: 'robots', content: 'noindex, follow' }],
})
</script>

<template>
  <div class="errpage">
    <div class="errpage__inner">
      <p class="errpage__code">{{ error?.statusCode || 500 }}</p>
      <h1 class="errpage__title">
        {{ is404 ? 'Такой страницы нет' : 'Что-то пошло не так' }}
      </h1>
      <p class="errpage__text">
        {{ is404
          ? 'Возможно, ссылка устарела или страница была перемещена. Вернитесь на главную — там вся информация о разблокировке карт и счетов по 115-ФЗ и 161-ФЗ.'
          : 'Мы уже разбираемся. Попробуйте обновить страницу или вернуться на главную.' }}
      </p>
      <a :href="home" class="btn btn--primary btn--lg">
        На главную
        <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </a>
    </div>
  </div>
</template>

<style scoped>
.errpage {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 32px;
  background: linear-gradient(180deg, #eef4fc 0%, #f7fafe 52%, #fff 100%);
  text-align: center;
}
.errpage__inner { max-width: 520px; }
.errpage__code {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(64px, 18vw, 128px);
  line-height: 1;
  letter-spacing: -.04em;
  background: linear-gradient(120deg, var(--blue-600), var(--cyan));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.errpage__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(24px, 5vw, 34px);
  margin: 8px 0 12px;
}
.errpage__text { color: var(--muted); font-size: 16px; line-height: 1.6; margin-bottom: 26px; }
</style>
