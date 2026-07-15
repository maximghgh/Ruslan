<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

const { contacts } = useAppConfig()
const route = useRoute()

const open = ref(false)
const { y } = useWindowScroll()
const scrolled = computed(() => y.value > 80)

// На под-страницах (например, /keysy) якорные ссылки ведут на главную + якорь.
const anchor = (hash: string) => (route.path === '/' ? hash : `/${hash}`)
const homeHref = computed(() => (route.path === '/' ? '#top' : '/'))

const links = [
  { href: '#uslugi', label: 'Услуги' },
  { href: '#etapy', label: 'Этапы' },
  { href: '#preimuschestva', label: 'Почему я' },
  { href: '#stoimost', label: 'Стоимость' },
  { href: '#keysy', label: 'Кейсы' },
  { href: '#otzyvy', label: 'Отзывы' },
  { href: '#voprosy', label: 'Вопросы' },
]

function close() {
  open.value = false
}

watch(open, (v) => {
  if (import.meta.client) document.body.style.overflow = v ? 'hidden' : ''
})

onBeforeUnmount(() => {
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <header class="hdr" :class="{ 'hdr--scrolled': scrolled }">
    <div class="container hdr__inner">
      <a :href="homeHref" class="brand" aria-label="Руслан Ганеев — на главную" @click="close">
        <span class="brand__mark" aria-hidden="true">
          <BrandLogo :size="42" />
        </span>
        <span class="brand__text">
          <span class="brand__name">Руслан Ганеев</span>
          <span class="brand__sub">разблокировка карт и счетов</span>
        </span>
      </a>

      <nav class="hdr__nav" aria-label="Основное меню">
        <a v-for="l in links" :key="l.href" :href="anchor(l.href)" class="hdr__link">{{ l.label }}</a>
      </nav>

      <div class="hdr__actions">
        <a :href="`tel:${contacts.phoneHref}`" class="hdr__phone" @click="trackContact('phone')">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6.6 3.5c.5 0 .9.3 1 .8l.9 3.2c.1.4 0 .9-.3 1.2L7 10.3a14 14 0 0 0 6.7 6.7l1.6-2.2c.3-.3.8-.4 1.2-.3l3.2.9c.5.1.8.5.8 1V20a1.5 1.5 0 0 1-1.6 1.5C10.8 21 3 13.2 2.5 4.6A1.5 1.5 0 0 1 4 3h2.6Z" fill="currentColor" />
          </svg>
          <span>{{ contacts.phone }}</span>
        </a>
        <a :href="anchor('#kontakty')" class="btn btn--primary hdr__cta" @click="reachGoal('cta_click', { place: 'header' })">Оставить заявку</a>
      </div>

      <button
        class="burger"
        :class="{ 'burger--open': open }"
        :aria-expanded="open"
        :aria-label="open ? 'Закрыть меню' : 'Открыть меню'"
        @click="open = !open"
      >
        <span /><span /><span />
      </button>
    </div>

    <Transition name="mnav">
      <nav v-if="open" class="mnav" aria-label="Мобильное меню">
        <a v-for="l in links" :key="l.href" :href="anchor(l.href)" class="mnav__link" @click="close">{{ l.label }}</a>
        <a :href="`tel:${contacts.phoneHref}`" class="mnav__phone" @click="close(); trackContact('phone')">{{ contacts.phone }}</a>
        <a :href="anchor('#kontakty')" class="btn btn--primary btn--block btn--lg" @click="close(); reachGoal('cta_click', { place: 'header' })">Оставить заявку</a>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.hdr {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, .95);
  backdrop-filter: saturate(180%) blur(10px);
  border-bottom: 1px solid var(--border);
  transition: background .3s ease, box-shadow .3s ease, border-color .3s ease;
  animation: headerIn .58s cubic-bezier(.22, 1, .36, 1) both;
}
.hdr--scrolled {
  background: rgba(255, 255, 255, .88);
  border-color: rgba(228, 235, 244, .78);
  box-shadow: 0 8px 28px rgba(11, 28, 58, .09);
}
.hdr__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  height: 70px;
}

.brand { display: flex; align-items: center; gap: 11px; flex: none; }
.brand__mark {
  width: 42px; height: 42px;
  display: grid; place-items: center;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(4, 104, 214, .32);
  transition: transform .28s cubic-bezier(.22, 1, .36, 1), box-shadow .28s ease;
}
.brand__mark svg { width: 100%; height: 100%; }
.brand:hover .brand__mark { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(4, 104, 214, .36); }
.brand__text { display: flex; flex-direction: column; line-height: 1.15; }
.brand__name { font-weight: 800; font-size: 16px; color: var(--ink); letter-spacing: -.01em; }
.brand__sub { font-size: 11.5px; color: var(--muted); }

.hdr__nav { display: none; gap: 16px; }
.hdr__link {
  font-size: 14.5px; font-weight: 600; color: var(--text);
  position: relative; padding: 6px 0; transition: color .15s ease;
}
.hdr__link::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: 0;
  height: 2px; background: var(--blue-600); border-radius: 2px;
  transform: scaleX(0); transition: transform .2s ease;
}
.hdr__link:hover { color: var(--blue-700); }
.hdr__link:hover::after { transform: scaleX(1); }

.hdr__actions { display: none; align-items: center; gap: 12px; flex: none; }
.hdr__phone {
  display: flex; align-items: center; gap: 7px;
  font-weight: 700; font-size: 15px; color: var(--ink);
  white-space: nowrap; transition: color .15s ease;
}
.hdr__phone svg { width: 17px; height: 17px; color: var(--blue-600); }
.hdr__phone:hover { color: var(--blue-700); }
.hdr__cta { padding: 11px 17px; font-size: 14.5px; }

.burger {
  width: 44px; height: 44px; flex: none;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
  border-radius: 10px;
}
.burger span {
  display: block; width: 22px; height: 2.4px;
  background: var(--ink); border-radius: 2px;
  transition: transform .25s ease, opacity .2s ease;
}
.burger--open span:nth-child(1) { transform: translateY(7.4px) rotate(45deg); }
.burger--open span:nth-child(2) { opacity: 0; }
.burger--open span:nth-child(3) { transform: translateY(-7.4px) rotate(-45deg); }

.mnav {
  position: fixed;
  top: 70px; left: 0; right: 0;
  background: #fff;
  border-bottom: 1px solid var(--border);
  box-shadow: 0 24px 40px rgba(11, 28, 58, .14);
  padding: 14px 20px 22px;
  display: flex; flex-direction: column; gap: 4px;
  min-height: calc(100dvh - 70px);
  max-height: calc(100dvh - 70px);
  overflow-y: auto;
  will-change: opacity, transform;
}
.mnav__link {
  font-size: 17px; font-weight: 600; color: var(--ink);
  padding: 13px 8px; border-bottom: 1px solid var(--border);
}
.mnav__phone {
  font-size: 18px; font-weight: 800; color: var(--blue-700);
  padding: 14px 8px 16px;
}

.mnav-enter-active, .mnav-leave-active { transition: opacity .28s ease, transform .28s cubic-bezier(.22, 1, .36, 1); }
.mnav-enter-from, .mnav-leave-to { opacity: 0; transform: translateY(-14px); }

@keyframes headerIn {
  from { opacity: 0; transform: translateY(-16px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (min-width: 1160px) {
  .hdr__nav, .hdr__actions { display: flex; }
  .burger { display: none; }
}
</style>
