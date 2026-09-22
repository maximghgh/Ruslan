<script setup lang="ts">
// Баннер согласия на cookie (152-ФЗ). До нажатия «Принять» трекеры (Яндекс.Метрика)
// не загружаются — см. app/plugins/analytics.client.ts (слушает событие cookie-consent-accepted).
const CONSENT_KEY = 'cookie_consent'
const visible = ref(false)

onMounted(() => {
  try {
    if (!localStorage.getItem(CONSENT_KEY)) visible.value = true
  } catch {
    /* localStorage недоступен — баннер не показываем, трекеры не грузятся */
  }
})

function decide(value: 'accepted' | 'declined') {
  try { localStorage.setItem(CONSENT_KEY, value) } catch { /* ignore */ }
  visible.value = false
  if (value === 'accepted') {
    window.dispatchEvent(new CustomEvent('cookie-consent-accepted'))
  }
}
</script>

<template>
  <div
    v-if="visible"
    id="cookie-consent"
    class="cookie-consent cookie-banner"
    role="dialog"
    aria-live="polite"
    aria-label="Использование файлов cookie"
  >
    <p class="cookie-consent__text">
      Мы используем файлы cookie для работы сайта и сбора обезличенной статистики (Яндекс.Метрика).
      Нажимая «Принять», вы соглашаетесь с обработкой cookie. Подробнее — в
      <NuxtLink to="/politika-konfidencialnosti" class="cookie-consent__link">Политике конфиденциальности</NuxtLink>.
    </p>
    <div class="cookie-consent__actions">
      <button type="button" class="cookie-consent__btn cookie-consent__btn--accept" @click="decide('accepted')">
        Принять
      </button>
      <button type="button" class="cookie-consent__btn cookie-consent__btn--decline" @click="decide('declined')">
        Отклонить
      </button>
    </div>
  </div>
</template>

<style scoped>
.cookie-consent {
  position: fixed;
  left: 14px;
  right: 14px;
  bottom: 14px;
  z-index: 200;
  max-width: 1040px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: 0 18px 50px rgba(6, 40, 90, .22);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: cookieReveal .3s cubic-bezier(.22, 1, .36, 1) both;
}
@keyframes cookieReveal {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.cookie-consent__text { font-size: 13.5px; line-height: 1.55; color: var(--ink); margin: 0; }
.cookie-consent__link { color: var(--blue-700); text-decoration: underline; }
.cookie-consent__actions { display: flex; gap: 10px; }
.cookie-consent__btn {
  flex: 1;
  padding: 11px 14px;
  border-radius: var(--radius-xs);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background .15s ease, border-color .15s ease, transform .15s ease;
}
.cookie-consent__btn:active { transform: scale(.98); }
.cookie-consent__btn--accept { background: var(--blue-600); color: #fff; border: 1px solid var(--blue-600); }
.cookie-consent__btn--accept:hover { background: var(--blue-700); border-color: var(--blue-700); }
.cookie-consent__btn--decline { background: #fff; color: var(--ink); border: 1px solid var(--border); }
.cookie-consent__btn--decline:hover { border-color: var(--blue-500); }

@media (min-width: 620px) {
  .cookie-consent { flex-direction: row; align-items: center; gap: 18px; }
  .cookie-consent__text { flex: 1; }
  .cookie-consent__actions { flex: none; }
  .cookie-consent__btn { flex: none; min-width: 116px; }
}
@media (prefers-reduced-motion: reduce) {
  .cookie-consent { animation: none; }
}
</style>
