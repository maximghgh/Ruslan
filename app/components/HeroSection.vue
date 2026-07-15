<script setup lang="ts">
import { useIntersectionObserver, useMouseInElement } from '@vueuse/core'

const { contacts } = useAppConfig()
const { $lenis } = useNuxtApp()

// Учитываем base URL сайта (например, /Ruslan/ на GitHub Pages),
// иначе изображения из public/ не загружаются на под-пути.
const baseURL = useRuntimeConfig().app.baseURL
const asset = (path: string) => baseURL.replace(/\/$/, '') + path

// Предзагрузка LCP-изображения первого экрана (портрет) — стартует загрузку в самом
// начале, до обработки компонентов. srcset/sizes совпадают с <source> ниже.
useHead({
  link: [
    {
      rel: 'preload',
      as: 'image',
      type: 'image/webp',
      imagesrcset: `${asset('/ruslan-hero.webp')} 760w, ${asset('/ruslan-hero@2x.webp')} 1120w`,
      imagesizes: '(min-width: 960px) 460px, 88vw',
      fetchpriority: 'high',
    },
  ],
})

const titleWords = ['Разблокировка', 'карт', 'и', 'счетов', 'по', '115-ФЗ', 'и', '161-ФЗ']
const titleText = titleWords.join(' ')

const trust = [
  'Бесплатная первичная консультация',
  'Честная оценка перспектив дела',
  'Полная конфиденциальность',
  'Работаю со всеми банками РФ',
]

const stats = [
  { value: '3+ лет', countTo: 3, prefix: '', suffix: '+ лет', label: 'помогаю с разблокировкой' },
  { value: '500+', countTo: 500, prefix: '', suffix: '+', label: 'разблокировок карт и счетов' },
  { value: 'Вся РФ', countTo: null, prefix: '', suffix: '', label: 'работаю дистанционно' },
  { value: 'от 1 дня', countTo: 1, prefix: 'от ', suffix: ' дня', label: 'срок снятия блокировки' },
]

const titleRef = ref<HTMLElement | null>(null)
const eyebrowRef = ref<HTMLElement | null>(null)
const leadRef = ref<HTMLElement | null>(null)
const actionsRef = ref<HTMLElement | null>(null)
const trustRef = ref<HTMLElement | null>(null)
const visualRef = ref<HTMLElement | null>(null)
const photoRef = ref<HTMLElement | null>(null)
const badgesRef = ref<HTMLElement | null>(null)
const statsRef = ref<HTMLElement | null>(null)
const bgShift = ref(0)
const statValues = ref(stats.map((s) => s.value))
let cleanupLenis: (() => void) | undefined
let stopStatsObserver: (() => void) | undefined

const { elementX, elementY, elementWidth, elementHeight, isOutside } = useMouseInElement(visualRef)

const cardStyle = computed<Record<string, string>>(() => {
  if (!import.meta.client || elementWidth.value === 0 || elementHeight.value === 0 || isOutside.value) {
    return { '--tilt-x': '0deg', '--tilt-y': '0deg', '--par-x': '0px', '--par-y': '0px' }
  }

  const px = (elementX.value / elementWidth.value) - 0.5
  const py = (elementY.value / elementHeight.value) - 0.5

  return {
    '--tilt-x': `${(py * -8).toFixed(2)}deg`,
    '--tilt-y': `${(px * 10).toFixed(2)}deg`,
    '--par-x': `${(px * 18).toFixed(1)}px`,
    '--par-y': `${(py * 18).toFixed(1)}px`,
  }
})

const bgStyle = computed<Record<string, string>>(() => ({
  transform: `translate3d(0, ${bgShift.value}px, 0)`,
}))

function formatStat(index: number, value: number) {
  const stat = stats[index]
  return `${stat.prefix}${Math.round(value).toLocaleString('ru-RU')}${stat.suffix}`
}

onMounted(async () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isMobile = window.matchMedia('(max-width: 767px)').matches
  // Прячем элементы под анимацию, только когда JS реально стартовал. Без этого класса
  // (нет JS / до гидратации) текст первого экрана виден сразу — LCP не блокируется,
  // и заголовок не «пропадает», если скрипт не выполнится.
  if (!prefersReduced) document.documentElement.classList.add('js-hero-anim')
  const { gsap } = await import('gsap')

  const words = titleRef.value?.querySelectorAll('.hero__word') ?? []
  const chips = trustRef.value?.querySelectorAll('li') ?? []
  const badges = badgesRef.value?.querySelectorAll('.hero-badge') ?? []

  if (prefersReduced) {
    gsap.set([eyebrowRef.value, words, leadRef.value, actionsRef.value, chips, photoRef.value, badges], {
      autoAlpha: 1,
      y: 0,
      x: 0,
      scale: 1,
      clipPath: 'inset(0% 0% 0% 0%)',
    })
  } else {
    gsap
      .timeline({ defaults: { ease: 'power3.out' } })
      .fromTo(eyebrowRef.value, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.6 })
      .fromTo(words, { autoAlpha: 0, y: 44 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07 }, 0.1)
      .fromTo(
        photoRef.value,
        { autoAlpha: 0, clipPath: 'inset(8% 6% 14% 6% round 30px)', scale: 1.06 },
        { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0% round 30px)', scale: 1, duration: 1.05 },
        0.25,
      )
      .fromTo(leadRef.value, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.5)
      .fromTo(actionsRef.value, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.62)
      .fromTo(chips, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 }, 0.7)
      .fromTo(
        badges,
        { autoAlpha: 0, y: 24, scale: 0.82 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.14, ease: 'back.out(1.7)' },
        0.85,
      )
  }

  const statsControls = useIntersectionObserver(
    statsRef,
    ([entry]) => {
      if (!entry?.isIntersecting) return

      stats.forEach((stat, index) => {
        if (stat.countTo === null) {
          statValues.value[index] = stat.value
          return
        }

        if (prefersReduced) {
          statValues.value[index] = stat.value
          return
        }

        const counter = { value: 0 }
        gsap.to(counter, {
          value: stat.countTo,
          duration: 1.35,
          ease: 'power2.out',
          onUpdate: () => {
            statValues.value[index] = formatStat(index, counter.value)
          },
          onComplete: () => {
            statValues.value[index] = stat.value
          },
        })
      })

      statsControls.stop()
    },
    { threshold: 0.35 },
  )
  stopStatsObserver = statsControls.stop

  if ($lenis && !prefersReduced && !isMobile) {
    const onScroll = ({ scroll }: { scroll: number }) => {
      bgShift.value = Math.min(scroll * 0.3, 120)
    }

    $lenis.on('scroll', onScroll)
    cleanupLenis = () => $lenis.off('scroll', onScroll)
  }
})

onBeforeUnmount(() => {
  cleanupLenis?.()
  stopStatsObserver?.()
})
</script>

<template>
  <section
    id="top"
    class="hero"
  >
    <div class="hero__bg" :style="bgStyle" aria-hidden="true">
      <span class="blob blob--1" />
      <span class="blob blob--2" />
      <span class="hero__grid-lines" />
    </div>
    <ClientOnly>
      <HeroParticles />
    </ClientOnly>

    <div class="container hero__grid">
      <div class="hero__content">
        <p ref="eyebrowRef" class="eyebrow">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5l8-3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /></svg>
          Юридическая помощь · 115-ФЗ и 161-ФЗ
        </p>

        <h1 ref="titleRef" class="hero__title" :aria-label="titleText">
          <template v-for="(word, index) in titleWords" :key="`${word}-${index}`">
            <br v-if="index === 4" class="hero__title-break">
            <span
              class="hero__word"
              :class="{ 'hero__word--accent': index >= 4 }"
              aria-hidden="true"
            >{{ word }}</span>
          </template>
        </h1>

        <p ref="leadRef" class="hero__lead">
          Помогу снять блокировку банковской карты, счёта и дистанционного
          обслуживания, выведу из базы ЦБ РФ. Работаю с физлицами и бизнесом —
          в Москве и по всей России <strong>дистанционно</strong>.
        </p>

        <div ref="actionsRef" class="hero__actions">
          <a href="#kontakty" class="btn btn--primary btn--lg" @click="reachGoal('cta_click', { place: 'hero' })">
            Получить консультацию
            <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </a>
          <a :href="`tel:${contacts.phoneHref}`" class="btn btn--outline btn--lg" @click="trackContact('phone')">
            <svg viewBox="0 0 24 24" fill="none"><path d="M6.6 3.5c.5 0 .9.3 1 .8l.9 3.2c.1.4 0 .9-.3 1.2L7 10.3a14 14 0 0 0 6.7 6.7l1.6-2.2c.3-.3.8-.4 1.2-.3l3.2.9c.5.1.8.5.8 1V20a1.5 1.5 0 0 1-1.6 1.5C10.8 21 3 13.2 2.5 4.6A1.5 1.5 0 0 1 4 3h2.6Z" fill="currentColor" /></svg>
            Позвонить
          </a>
        </div>

        <ul ref="trustRef" class="hero__trust">
          <li v-for="item in trust" :key="item">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#16a86b" /><path d="M8 12.4l2.6 2.6L16 9.5" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" /></svg>
            {{ item }}
          </li>
        </ul>
      </div>

      <div ref="visualRef" class="hero__visual">
        <div class="hero-portrait" :style="cardStyle">
          <span class="hero-portrait__glow" aria-hidden="true" />
          <span class="hero-portrait__ring" aria-hidden="true" />

          <figure ref="photoRef" class="hero-portrait__frame">
            <picture>
              <source
                type="image/webp"
                :srcset="`${asset('/ruslan-hero.webp')} 760w, ${asset('/ruslan-hero@2x.webp')} 1120w`"
                sizes="(min-width: 960px) 460px, 88vw"
              >
              <img
                :src="asset('/ruslan-hero.jpg')"
                width="760"
                height="1140"
                alt="Руслан Ганеев — специалист по разблокировке банковских карт и счетов"
                fetchpriority="high"
                decoding="async"
              >
            </picture>
            <figcaption class="hero-portrait__id">
              <strong>Руслан Ганеев</strong>
              <span>юрист · разблокировка по 115-ФЗ, 161-ФЗ и ДБО</span>
            </figcaption>
          </figure>

          <div ref="badgesRef" class="hero-portrait__badges" aria-hidden="true">
            <div class="hero-badge hero-badge--unlock">
              <span class="hero-badge__icon">
                <svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.4 4.2L19 7" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </span>
              <span class="hero-badge__text">
                <b>Карта разблокирована</b>
                <small>доступ восстановлен</small>
              </span>
            </div>

            <div class="hero-badge hero-badge--case">
              <span class="hero-badge__num">5 дней</span>
              <small>средний срок ответа банка</small>
            </div>

            <div class="hero-badge hero-badge--rating">
              <span class="hero-badge__stars">
                <svg v-for="n in 5" :key="n" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 18.9 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9 2.9-6z" /></svg>
              </span>
              <b>500+ дел</b>
              <small>с разблокировкой</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <ul ref="statsRef" class="hero__stats">
        <li v-for="(s, index) in stats" :key="s.label" data-reveal-item>
          <span class="hero__stat-value">{{ statValues[index] }}</span>
          <span class="hero__stat-label">{{ s.label }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  padding: 40px 0 56px;
  background:
    radial-gradient(1100px 620px at 78% -8%, #e7f1ff 0%, transparent 60%),
    linear-gradient(180deg, #eef4fc 0%, #f7fafe 52%, #fff 100%);
  overflow: hidden;
}
.hero__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  will-change: transform;
}
.blob { position: absolute; border-radius: 50%; filter: blur(70px); opacity: .55; }
.blob--1 { width: 420px; height: 420px; background: #cfe1fb; top: -140px; right: -90px; }
.blob--2 { width: 360px; height: 360px; background: #d9f0fb; bottom: -120px; left: -120px; }
.hero__grid-lines {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(4, 104, 214, .045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(4, 104, 214, .045) 1px, transparent 1px);
  background-size: 46px 46px;
  mask-image: radial-gradient(900px 560px at 80% 6%, #000 0%, transparent 72%);
  -webkit-mask-image: radial-gradient(900px 560px at 80% 6%, #000 0%, transparent 72%);
}

.hero__grid { position: relative; display: grid; gap: 36px; }
.hero__content { position: relative; z-index: 2; }

.hero__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 32px;
  margin: 6px 0 16px;
  letter-spacing: -.035em;
  line-height: 1.12;
}
.hero__word {
  display: inline-block;
  margin-right: .2em;
  will-change: opacity, transform;
}
/* Начальные состояния анимации применяются только при активном JS (см. onMounted). */
.js-hero-anim .hero__word { opacity: 0; transform: translateY(40px); }
.js-hero-anim .hero__lead,
.js-hero-anim .hero__actions { opacity: 0; transform: translateY(22px); }
.js-hero-anim .hero__trust li { opacity: 0; }
.js-hero-anim .hero-badge { opacity: 0; }
.hero__word--accent {
  background: linear-gradient(100deg, var(--blue-600), var(--cyan));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.hero__lead {
  font-size: 17px;
  max-width: 540px;
  margin-bottom: 26px;
}
.hero__lead strong { color: var(--ink); }

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 26px;
}

.hero__trust { display: grid; gap: 10px; }
.hero__trust li {
  display: flex; align-items: center; gap: 10px;
  font-size: 15px; font-weight: 600; color: var(--ink);
}
.hero__trust svg { width: 21px; height: 21px; flex: none; }

/* ===== Портрет первого экрана ===== */
.hero__visual {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1100px;
}
.hero-portrait {
  position: relative;
  width: min(460px, 100%);
  transform: rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg));
  transition: transform .25s ease-out;
  will-change: transform;
}
.hero-portrait__glow {
  position: absolute;
  inset: -12% -10% -4%;
  border-radius: 40px;
  background:
    radial-gradient(60% 55% at 70% 28%, rgba(4, 104, 214, .42), transparent 70%),
    radial-gradient(60% 50% at 30% 80%, rgba(0, 166, 230, .34), transparent 72%);
  filter: blur(34px);
  opacity: .9;
  animation: heroGlow 9s ease-in-out infinite;
}
.hero-portrait__ring {
  position: absolute;
  inset: -16px;
  border-radius: 36px;
  background: linear-gradient(150deg, rgba(255, 255, 255, .9), rgba(4, 104, 214, .18) 40%, transparent 70%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  padding: 1.5px;
  opacity: .8;
}
.hero-portrait__frame {
  position: relative;
  z-index: 1;
  border-radius: 30px;
  overflow: hidden;
  aspect-ratio: 4 / 5;
  background: linear-gradient(180deg, #dfe7f1, #c9d4e2);
  box-shadow:
    0 40px 90px rgba(6, 40, 90, .28),
    0 14px 32px rgba(11, 28, 58, .18),
    inset 0 0 0 1px rgba(255, 255, 255, .55);
  will-change: clip-path, transform, opacity;
}
.hero-portrait__frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 56% 14%;
  transform: translate(var(--par-x, 0px), var(--par-y, 0px)) scale(1.06);
  transition: transform .25s ease-out;
}
.hero-portrait__frame::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(176deg, transparent 52%, rgba(8, 22, 44, .12) 72%, rgba(8, 22, 44, .68) 100%),
    linear-gradient(115deg, rgba(4, 104, 214, .14), transparent 42%);
  pointer-events: none;
}
.hero-portrait__id {
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 18px;
  z-index: 2;
  color: #fff;
}
.hero-portrait__id strong {
  display: block;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  letter-spacing: -.02em;
}
.hero-portrait__id span {
  display: block;
  margin-top: 2px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, .82);
}

.hero-portrait__badges { position: absolute; inset: 0; z-index: 4; pointer-events: none; }
.hero-badge {
  position: absolute;
  border: 1px solid rgba(228, 235, 244, .9);
  background: #fff;
  box-shadow:
    0 26px 54px rgba(11, 28, 58, .22),
    0 6px 16px rgba(11, 28, 58, .12),
    inset 0 0 0 1px rgba(255, 255, 255, .6);
}
.hero-badge--unlock {
  top: 56%;
  left: -52px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 17px 13px 13px;
  border-radius: 20px;
  animation: heroFloat 5.6s ease-in-out 1.9s infinite;
}
.hero-badge__icon {
  width: 44px;
  height: 44px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: #e3f6ed;
  color: var(--green);
}
.hero-badge__icon svg { width: 24px; height: 24px; }
.hero-badge__text b { display: block; color: var(--ink); font-size: 14.5px; white-space: nowrap; }
.hero-badge__text small { display: block; color: var(--muted); font-size: 12px; margin-top: 1px; }

.hero-badge--case {
  right: -32px;
  top: 30%;
  width: 150px;
  padding: 16px 18px;
  border-radius: 20px;
  animation: heroFloat 6.2s ease-in-out 2.1s infinite;
}
.hero-badge__num {
  display: block;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 28px;
  line-height: 1;
  letter-spacing: -.03em;
  white-space: nowrap;
  color: var(--blue-700);
}
.hero-badge--case small { display: block; margin-top: 7px; color: var(--muted); font-size: 12.5px; line-height: 1.25; }

.hero-badge--rating {
  top: -24px;
  left: -34px;
  padding: 12px 16px;
  border-radius: 18px;
  text-align: left;
  animation: heroFloat 5.2s ease-in-out 2.3s infinite;
}
.hero-badge__stars { display: flex; gap: 2px; color: var(--amber); margin-bottom: 4px; }
.hero-badge__stars svg { width: 13px; height: 13px; }
.hero-badge--rating b { display: block; color: var(--ink); font-size: 15px; font-weight: 800; }
.hero-badge--rating small { display: block; color: var(--muted); font-size: 11.5px; }

@keyframes heroGlow {
  0%, 100% { transform: scale(1); opacity: .82; }
  50% { transform: scale(1.06); opacity: 1; }
}
@keyframes heroFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-9px); }
}

/* ===== Статистика ===== */
.hero__stats {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  margin-top: 40px;
}
.hero__stats li {
  background: #fff;
  padding: 20px 16px;
  text-align: center;
}
.hero__stat-value {
  display: block;
  font-family: var(--font-display);
  font-size: 23px; font-weight: 700; color: var(--blue-700);
  letter-spacing: -.03em;
}
.hero__stat-label { display: block; font-size: 13.5px; color: var(--muted); margin-top: 5px; }

@media (min-width: 600px) {
  .hero__title { font-size: 41px; }
}
@media (max-width: 560px) {
  .hero-portrait { width: min(330px, 86vw); }
  .hero-badge--unlock { left: -14px; padding: 10px 14px 10px 10px; }
  .hero-badge--unlock .hero-badge__icon { width: 36px; height: 36px; }
  .hero-badge--unlock .hero-badge__text small { display: none; }
  .hero-badge--case { right: -14px; width: 132px; padding: 13px 14px; }
  .hero-badge--case .hero-badge__num { font-size: 25px; }
  .hero-badge--rating { left: -14px; top: -18px; }
}
@media (min-width: 960px) {
  .hero {
    min-height: calc(100dvh - 70px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 34px 0 44px;
  }
  .hero__grid { grid-template-columns: 1.04fr .96fr; align-items: center; gap: 56px; }
  .hero__content { padding-top: 8px; }
  .hero__title { font-size: 50px; }
  .hero__lead { font-size: 18.5px; }
  .hero__trust { grid-template-columns: 1fr 1fr; }
  .hero__stats { grid-template-columns: repeat(4, 1fr); margin-top: 24px; }
  .hero__stat-value { font-size: 29px; }
}

@media (prefers-reduced-motion: reduce) {
  .hero__word,
  .hero__lead,
  .hero__actions,
  .hero__trust li,
  .hero-badge { opacity: 1; transform: none; }
  .hero-portrait__glow,
  .hero-badge--unlock,
  .hero-badge--case,
  .hero-badge--rating { animation: none; }
  .hero-portrait__frame img { transform: scale(1.06); }
}
</style>
