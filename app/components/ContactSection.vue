<script setup lang="ts">
const { contacts, formMaintenance } = useAppConfig()

const phoneSvg =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h3l1.7 4.2-2.1 1.6a13 13 0 0 0 6.6 6.6l1.6-2.1L21 16v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 3 5.2 2 2 0 0 1 5 4z"/></svg>'

const methods = [
  {
    key: 'phone',
    label: 'Телефон',
    value: contacts.phone,
    href: `tel:${contacts.phoneHref}`,
    color: '#0468d6',
    icon: phoneSvg,
  },
  ...useSocials().map((s) => ({
    key: s.key,
    label: s.title,
    value: s.value,
    href: s.href,
    color: s.color,
    icon: s.icon,
  })),
]

const sectionRef = ref<HTMLElement | null>(null)
useScrollAnimation(sectionRef, { mode: 'stagger-children', stagger: 0.1 })

const ways = ['Телефон', 'Телеграм', 'ВКонтакте', 'MAX', 'Email']

// Для этих способов связи нужен никнейм/ссылка — чтобы найти клиента в мессенджере.
const NICK_WAYS = ['Телеграм', 'ВКонтакте', 'MAX']
const needsNickname = computed(() => NICK_WAYS.includes(form.way))
const needsEmail = computed(() => form.way === 'Email')
const nicknamePlaceholder = computed(() => {
  if (form.way === 'Телеграм') return '@username или ссылка t.me/…'
  if (form.way === 'ВКонтакте') return 'Ссылка на профиль или короткое имя'
  if (form.way === 'MAX') return 'Ваш ник или ссылка в MAX'
  return 'Ваш никнейм'
})

const form = reactive({
  name: '',
  phone: '',
  way: '',
  nickname: '',
  contactEmail: '',
  bank: '',
  message: '',
  consent: false,
  company: '', // honeypot — поле-ловушка для спам-ботов
})

const errors = reactive<{ name: string; phone: string; consent: string; contact: string }>({
  name: '',
  phone: '',
  consent: '',
  contact: '',
})

// При смене способа связи сбрасываем ошибку доп-поля (ник/email).
watch(() => form.way, () => { errors.contact = '' })

const loading = ref(false)
const sent = ref(false)
const serverError = ref('')

// Фиксируем высоту формы, чтобы карточка «Заявка отправлена» была той же высоты.
const formEl = ref<HTMLFormElement | null>(null)
const lockedHeight = ref(0)
const successStyle = computed(() => (lockedHeight.value ? { minHeight: `${lockedHeight.value}px` } : {}))
function markSent() {
  lockedHeight.value = formEl.value?.offsetHeight || 0
  sent.value = true
}

// Маска телефона: +7 (XXX) XXX-XX-XX, автодополнение кода страны.
function formatPhone(raw: string): string {
  let d = raw.replace(/\D/g, '')
  if (!d) return ''
  if (d[0] === '8') d = '7' + d.slice(1)
  else if (d[0] !== '7') d = '7' + d
  d = d.slice(0, 11)
  let out = '+7'
  if (d.length > 1) out += ' (' + d.slice(1, 4)
  if (d.length >= 4) out += ') ' + d.slice(4, 7)
  if (d.length >= 7) out += '-' + d.slice(7, 9)
  if (d.length >= 9) out += '-' + d.slice(9, 11)
  return out
}
function onPhoneInput(e: Event) {
  form.phone = formatPhone((e.target as HTMLInputElement).value)
}

function validate() {
  errors.name = form.name.trim().length >= 2 ? '' : 'Укажите, как к вам обращаться'
  errors.phone =
    form.phone.replace(/\D/g, '').length >= 10 ? '' : 'Укажите корректный номер телефона'
  errors.consent = form.consent ? '' : 'Подтвердите согласие на обработку данных'

  // Доп-поле обязательно, если выбран способ связи, требующий контакт.
  errors.contact = ''
  if (needsNickname.value && !form.nickname.trim()) {
    errors.contact = `Укажите ник или ссылку в ${form.way}`
  } else if (needsEmail.value) {
    const em = form.contactEmail.trim()
    if (!em) errors.contact = 'Укажите email для ответа'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) errors.contact = 'Укажите корректный email'
  }

  return !errors.name && !errors.phone && !errors.consent && !errors.contact
}

// Заявки уходят на почту через FormSubmit.co (без сервера — работает на GitHub Pages).
// Адрес получателя задаётся в app.config.ts → contacts.leadEmail.
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${contacts.leadEmail}`

// Ловушка по времени: бот отправляет форму почти мгновенно, человек — нет.
let formOpenedAt = 0
onMounted(() => {
  formOpenedAt = Date.now()
})

async function submit() {
  serverError.value = ''
  if (!validate()) return

  // Honeypot: скрытое поле заполняют только боты — тихо «успех», ничего не шлём.
  if (form.company.trim()) {
    markSent()
    return
  }

  // Слишком быстрая отправка (< 2.5 с после загрузки) — почти наверняка бот.
  if (formOpenedAt && Date.now() - formOpenedAt < 2500) {
    markSent()
    return
  }

  loading.value = true
  try {
    // Нативный fetch — надёжнее ofetch для ответа FormSubmit (приходит text/html, а не json,
    // из-за чего $fetch зависал). AbortController — предохранитель от «вечного» ожидания.
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 15000)
    let res: { success?: string | boolean; message?: string } = {}
    try {
      const resp = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({
          'Имя': form.name,
          'Телефон': form.phone,
          'Способ связи': form.way || 'не указан',
          ...(needsNickname.value && form.nickname.trim()
            ? { 'Ник для связи': form.nickname.trim() }
            : {}),
          ...(needsEmail.value && form.contactEmail.trim()
            ? { 'Email для связи': form.contactEmail.trim(), _replyto: form.contactEmail.trim() }
            : {}),
          'Банк': form.bank || 'не указан',
          'Сообщение': form.message || 'не указано',
          _subject: `Заявка на разблокировку — ${form.name}, ${form.phone}`,
          _template: 'table',
          _captcha: 'false',
        }),
      })
      const text = await resp.text()
      try { res = JSON.parse(text) } catch { res = {} }
    } finally {
      clearTimeout(timer)
    }

    if (res.success === true || res.success === 'true') {
      reachGoal('lead') // главная конверсия для Метрики/Директа
      markSent()
    } else {
      serverError.value =
        res.message ||
        'Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь по телефону.'
    }
  } catch {
    serverError.value =
      'Не удалось отправить заявку. Проверьте соединение или свяжитесь по телефону.'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, {
    name: '',
    phone: '',
    way: '',
    nickname: '',
    contactEmail: '',
    bank: '',
    message: '',
    consent: false,
    company: '',
  })
  errors.name = errors.phone = errors.consent = ''
  serverError.value = ''
  lockedHeight.value = 0
  sent.value = false
}
</script>

<template>
  <section id="kontakty" ref="sectionRef" class="section section--soft contact scroll-animate scroll-animate--stagger-children">
    <div class="contact__glow" aria-hidden="true" />
    <div class="container">
      <div class="section-head" data-reveal-item>
        <p class="eyebrow">Контакты</p>
        <h2 class="section-title">Получите бесплатную консультацию</h2>
        <p class="section-subtitle">
          Опишите ситуацию любым удобным способом — отвечу, оценю перспективы
          и подскажу, как вернуть доступ к вашим деньгам.
        </p>
      </div>

      <div class="contact__layout">
        <div class="contact__info" data-reveal-item data-scroll-mode="fade-left">
          <h3 class="contact__info-title">Свяжитесь удобным способом</h3>
          <p class="contact__info-text">
            Первичная консультация — бесплатно и ни к чему не обязывает.
          </p>

          <address class="contact__contacts">
          <ul class="methods">
            <li v-for="m in methods" :key="m.label">
              <a
                class="method"
                :href="m.href"
                :style="{ '--c': m.color }"
                :target="m.href.startsWith('http') ? '_blank' : null"
                :rel="m.href.startsWith('http') ? 'noopener' : null"
                @click="trackContact(m.key)"
              >
                <span class="method__ic" v-html="m.icon" />
                <span class="method__body">
                  <b>{{ m.label }}</b>
                  <span>{{ m.value }}</span>
                </span>
                <svg class="method__arrow" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </a>
            </li>
          </ul>

          <div class="contact__meta">
            <div class="contact__meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.7-7-11a7 7 0 0 1 14 0c0 5.3-7 11-7 11z" /><circle cx="12" cy="10" r="2.6" /></svg>
              <span>{{ contacts.city }} и вся Россия — дистанционно</span>
            </div>
            <div class="contact__meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5.3l3.4 2" /></svg>
              <span>{{ contacts.schedule }}</span>
            </div>
          </div>
          </address>
        </div>

        <div class="form-card" data-reveal-item data-scroll-mode="fade-right">
          <div v-if="formMaintenance" class="form-maintenance">
            <span class="form-maintenance__ic" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/></svg>
            </span>
            <h3>Свяжитесь удобным способом</h3>
            <p>Опишите ситуацию звонком или в мессенджере — отвечу лично, оценю перспективы и подскажу, как вернуть доступ к деньгам. Первичная консультация — бесплатно.</p>
            <a :href="`tel:${contacts.phoneHref}`" class="btn btn--primary btn--block btn--lg">Позвонить {{ contacts.phone }}</a>
          </div>
          <Transition v-else name="swap" mode="out-in">
          <form v-if="!sent" key="form" ref="formEl" class="form" novalidate @submit.prevent="submit">
            <h3 class="form__title">Оставить заявку на разблокировку</h3>
            <p class="form__sub">Заполните форму — свяжусь с вами в ближайшее время.</p>

            <div class="hp" aria-hidden="true">
              <label>Не заполняйте это поле
                <input v-model="form.company" type="text" tabindex="-1" autocomplete="off" />
              </label>
            </div>

            <div class="field">
              <label for="f-name">Ваше имя <span aria-hidden="true">*</span></label>
              <input
                id="f-name"
                v-model="form.name"
                type="text"
                autocomplete="name"
                aria-required="true"
                :aria-invalid="errors.name ? 'true' : undefined"
                :aria-describedby="errors.name ? 'err-name' : undefined"
                placeholder="Как к вам обращаться"
                :class="{ 'is-error': errors.name }"
              />
              <span v-if="errors.name" id="err-name" role="alert" class="field__err">{{ errors.name }}</span>
            </div>

            <div class="field">
              <label for="f-phone">Телефон <span aria-hidden="true">*</span></label>
              <input
                id="f-phone"
                :value="form.phone"
                type="tel"
                inputmode="tel"
                autocomplete="tel"
                maxlength="18"
                aria-required="true"
                :aria-invalid="errors.phone ? 'true' : undefined"
                :aria-describedby="errors.phone ? 'err-phone' : undefined"
                placeholder="+7 (___) ___-__-__"
                :class="{ 'is-error': errors.phone }"
                @input="onPhoneInput"
              />
              <span v-if="errors.phone" id="err-phone" role="alert" class="field__err">{{ errors.phone }}</span>
            </div>

            <div class="field">
              <label for="f-way">Удобный способ связи</label>
              <select id="f-way" v-model="form.way" class="select">
                <option value="">Не важно</option>
                <option v-for="w in ways" :key="w" :value="w">{{ w }}</option>
              </select>
            </div>

            <div v-if="needsNickname" class="field field--nick">
              <label for="f-nick">Ваш ник / ссылка в {{ form.way }} <span>*</span></label>
              <input
                id="f-nick"
                v-model="form.nickname"
                type="text"
                autocomplete="off"
                :placeholder="nicknamePlaceholder"
                :class="{ 'is-error': errors.contact }"
                :aria-invalid="errors.contact ? 'true' : undefined"
              />
              <span v-if="errors.contact" role="alert" class="field__err">{{ errors.contact }}</span>
              <span v-else class="field__hint">Укажите ник или ссылку — чтобы я нашёл вас в {{ form.way }} и написал.</span>
            </div>

            <div v-if="needsEmail" class="field field--nick">
              <label for="f-cemail">Ваш email для ответа <span>*</span></label>
              <input
                id="f-cemail"
                v-model="form.contactEmail"
                type="email"
                autocomplete="email"
                inputmode="email"
                placeholder="you@example.com"
                :class="{ 'is-error': errors.contact }"
                :aria-invalid="errors.contact ? 'true' : undefined"
              />
              <span v-if="errors.contact" role="alert" class="field__err">{{ errors.contact }}</span>
              <span v-else class="field__hint">На этот адрес я отвечу на вашу заявку.</span>
            </div>

            <div class="field">
              <label for="f-bank">Ваш банк</label>
              <input
                id="f-bank"
                v-model="form.bank"
                type="text"
                placeholder="Например: Сбербанк, Т-Банк, ВТБ"
              />
            </div>

            <div class="field">
              <label for="f-msg">Опишите ситуацию</label>
              <textarea
                id="f-msg"
                v-model="form.message"
                rows="4"
                placeholder="Что произошло с картой или счётом, какой банк, что требует банк"
              />
            </div>

            <label class="consent" :class="{ 'is-error': errors.consent }">
              <input
                v-model="form.consent"
                type="checkbox"
                aria-required="true"
                :aria-invalid="errors.consent ? 'true' : undefined"
                :aria-describedby="errors.consent ? 'err-consent' : undefined"
              />
              <span>Я согласен на обработку
                <NuxtLink to="/politika-konfidencialnosti" target="_blank" class="consent__link" @click.stop>персональных данных</NuxtLink>
                для ответа на заявку.</span>
            </label>
            <span v-if="errors.consent" id="err-consent" role="alert" class="field__err field__err--block">{{ errors.consent }}</span>

            <button type="submit" class="btn btn--primary btn--block btn--lg" :disabled="loading">
              <template v-if="loading">Отправляем…</template>
              <template v-else>
                Отправить заявку
                <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </template>
            </button>

            <p v-if="serverError" class="form__status form__status--err" role="alert" aria-live="assertive">{{ serverError }}</p>

            <p class="form__note">
              Отправляя заявку, вы соглашаетесь с обработкой
              <NuxtLink to="/politika-konfidencialnosti" target="_blank" class="form__note-link">персональных данных</NuxtLink>.
              Консультация бесплатна и ни к чему не обязывает.
            </p>
          </form>

          <div v-else key="success" class="form-success" :style="successStyle">
            <span class="form-success__ic" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </span>
            <h3>Заявка отправлена!</h3>
            <p>
              Спасибо за обращение. Я свяжусь с вами в ближайшее время —
              как правило, в течение рабочего дня.
            </p>
            <button type="button" class="btn btn--outline" @click="resetForm">
              Отправить ещё одну заявку
            </button>
          </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact { position: relative; overflow: hidden; }
.contact__glow {
  position: absolute;
  top: -120px; right: -100px;
  width: 460px; height: 460px;
  background: radial-gradient(circle, #dbe9fb, transparent 68%);
  pointer-events: none;
  animation: contactGlow 8s ease-in-out infinite;
}
.contact__layout {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  gap: 22px;
}

.contact__info-title { font-size: 21px; margin-bottom: 6px; }
.contact__info-text { font-size: 15px; color: var(--muted); margin-bottom: 20px; }

.methods { display: grid; gap: 11px; }
.method {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  transition:
    transform .3s cubic-bezier(.22, 1, .36, 1),
    box-shadow .3s ease,
    border-color .3s ease,
    background .3s ease;
}
.method:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-sm);
  border-color: color-mix(in srgb, var(--c) 45%, var(--border));
  background: color-mix(in srgb, var(--c) 5%, #fff);
}
.method__ic {
  width: 46px; height: 46px; flex: none;
  display: grid; place-items: center;
  border-radius: 12px;
  color: var(--c);
  background: color-mix(in srgb, var(--c) 12%, #fff);
  transition: transform .3s cubic-bezier(.22, 1, .36, 1), background .3s ease;
}
.method__ic :deep(svg) { width: 24px; height: 24px; }
.method:hover .method__ic { transform: scale(1.05); background: color-mix(in srgb, var(--c) 17%, #fff); }
.method__body { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.method__body b { font-size: 15px; color: var(--ink); }
.method__body span { font-size: 13.5px; color: var(--muted); }
.method__arrow {
  width: 18px; height: 18px; color: var(--muted); flex: none;
  transition: transform .3s cubic-bezier(.22, 1, .36, 1), color .3s ease;
}
.method:hover .method__arrow { color: var(--c); transform: translateX(3px); }

.contact__meta {
  margin-top: 20px;
  display: grid;
  gap: 11px;
  padding: 16px 18px;
  background: var(--blue-50);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}
.contact__meta-item {
  display: flex; align-items: center; gap: 10px;
  font-size: 14.5px; font-weight: 600; color: var(--ink);
}
.contact__meta-item svg { width: 21px; height: 21px; flex: none; color: var(--blue-600); }

/* Карточка формы */
.form-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  padding: 26px 22px;
  transition: transform .34s cubic-bezier(.22, 1, .36, 1), box-shadow .34s ease;
}
.form-card:hover { transform: translateY(-4px); box-shadow: 0 34px 68px rgba(6, 40, 90, .18); }
.form__title { font-size: 21px; margin-bottom: 5px; }
.form__sub { font-size: 14.5px; color: var(--muted); margin-bottom: 20px; }

.hp { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }

.field { margin-bottom: 15px; display: flex; flex-direction: column; }
.field label { font-size: 14px; font-weight: 700; color: var(--ink); margin-bottom: 7px; }
.field label span { color: #e5484d; }
.field input,
.field textarea,
.select {
  width: 100%;
  font-size: 16px;
  padding: 13px 14px;
  border: 1.6px solid var(--border);
  border-radius: var(--radius-xs);
  background: #fff;
  color: var(--ink);
  transition: border-color .15s ease, box-shadow .15s ease;
}
.field textarea { resize: vertical; min-height: 96px; }
.field input::placeholder,
.field textarea::placeholder { color: #aab5c6; }
.field input:focus,
.field textarea:focus,
.select:focus {
  outline: none;
  border-color: var(--blue-500);
  box-shadow: 0 0 0 4px rgba(31, 134, 240, .14);
}
.field input.is-error,
.field textarea.is-error { border-color: #e5484d; }
.select {
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' stroke='%237b8aa3' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 8l5 5 5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 13px center;
  padding-right: 40px;
}
.field__err { font-size: 12.5px; color: #e5484d; margin-top: 5px; font-weight: 600; }
.field__err--block { display: block; margin-top: -6px; margin-bottom: 8px; }
.field__hint { font-size: 12.5px; color: var(--muted); margin-top: 6px; }

/* Плавное появление поля никнейма (CSS-анимация на монтировании — надёжнее Transition) */
.field--nick { animation: nickReveal .28s cubic-bezier(.22, 1, .36, 1) both; }
@keyframes nickReveal {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .field--nick { animation: none; }
}

.consent {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 4px 0 16px;
  cursor: pointer;
}
.consent input {
  width: 19px; height: 19px; flex: none; margin-top: 1px;
  accent-color: var(--blue-600); cursor: pointer;
}
.consent span { font-size: 13px; color: var(--text); }
.consent.is-error span { color: #e5484d; }
.consent__link { color: var(--blue-700); text-decoration: underline; }
.form__note-link { color: var(--blue-700); text-decoration: underline; }

/* Контакты в семантическом <address> — убираем курсив по умолчанию */
.contact__contacts { font-style: normal; display: block; }

.form__status {
  margin-top: 13px;
  font-size: 14px;
  font-weight: 600;
  padding: 12px 14px;
  border-radius: var(--radius-xs);
}
.form__status--err { background: #fdecec; color: #c0353a; }
.form__note { margin-top: 13px; font-size: 12px; color: var(--muted); }

.form-success {
  text-align: center;
  padding: 22px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Заглушка формы на техобслуживании */
.form-maintenance {
  text-align: center;
  padding: 26px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.form-maintenance__ic {
  width: 68px; height: 68px;
  margin-bottom: 18px;
  display: grid; place-items: center;
  border-radius: 50%;
  background: var(--blue-50);
  color: var(--blue-600);
}
.form-maintenance__ic svg { width: 32px; height: 32px; }
.form-maintenance h3 { font-size: 21px; margin-bottom: 10px; }
.form-maintenance p { font-size: 15px; color: var(--text); line-height: 1.6; margin-bottom: 22px; max-width: 340px; }
.form-success__ic {
  width: 72px; height: 72px;
  margin: 0 auto 18px;
  display: grid; place-items: center;
  border-radius: 50%;
  background: #e3f6ed;
  color: var(--green);
  animation: successPop .6s cubic-bezier(.34, 1.56, .64, 1) both;
}
.form-success__ic svg {
  width: 36px; height: 36px;
  animation: successDraw .45s ease both .28s;
}
.form-success h3 {
  font-size: 22px; margin-bottom: 10px;
  animation: successRise .5s cubic-bezier(.22, 1, .36, 1) both .34s;
}
.form-success p {
  font-size: 15px; color: var(--text); margin-bottom: 20px;
  animation: successRise .5s cubic-bezier(.22, 1, .36, 1) both .46s;
}
.form-success .btn {
  animation: successRise .5s cubic-bezier(.22, 1, .36, 1) both .58s;
}

@keyframes successPop {
  0% { opacity: 0; transform: scale(.4); }
  60% { transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes successDraw {
  from { opacity: 0; transform: scale(.6); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes successRise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Смена формы на экран успеха: форма плавно уходит, затем появляется успех */
.swap-leave-active { transition: opacity .32s ease, transform .32s cubic-bezier(.22, 1, .36, 1); }
.swap-leave-to { opacity: 0; transform: scale(.97) translateY(-6px); }
.swap-enter-active { transition: opacity .01s; }

@keyframes contactGlow {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: .75; }
  50% { transform: translate3d(-18px, 18px, 0) scale(1.04); opacity: .95; }
}

@media (min-width: 980px) {
  .contact__layout {
    grid-template-columns: 0.92fr 1.08fr;
    gap: 30px;
    align-items: start;
  }
  .form-card { padding: 32px 30px; }
}
</style>
