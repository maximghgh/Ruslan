<script setup lang="ts">
// Учитываем base URL сайта (/Ruslan/ на GitHub Pages) для статики из public/.
const baseURL = useRuntimeConfig().app.baseURL
const asset = (path: string) => baseURL.replace(/\/$/, '') + path

const svg = (inner: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`

const advantages = [
  {
    icon: svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r=".6"/>'),
    title: 'Узкая специализация',
    text: 'Занимаюсь только разблокировкой счетов и карт. Глубоко знаю 115-ФЗ, 161-ФЗ и практику банков.',
  },
  {
    icon: svg('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.4 2.4 3.7 5.3 3.7 8.5S14.4 18.1 12 20.5C9.6 18.1 8.3 15.2 8.3 12S9.6 5.9 12 3.5z"/>'),
    title: 'Дистанционно по всей России',
    text: 'Решаем вопрос онлайн, без визитов и очередей — нужен только телефон и документы в электронном виде.',
  },
  {
    icon: svg('<path d="M4 9.5L12 4l8 5.5"/><path d="M5 9.8v8.7M19 9.8v8.7M9.3 9.8v8.7M14.7 9.8v8.7M3.3 18.8h17.4"/>'),
    title: 'Работаю со всеми банками',
    text: 'Сбербанк, Т-Банк, Альфа-Банк, ВТБ, Озон Банк и другие — знаю специфику каждого банка.',
  },
  {
    icon: svg('<circle cx="12" cy="12" r="8.5"/><path d="M8.3 12.3l2.6 2.6 4.8-5.4"/>'),
    title: 'Честная оценка',
    text: 'Сразу скажу, реально ли помочь в вашем случае. Не берусь за дело, если шансов на успех нет.',
  },
  {
    icon: svg('<rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),
    title: 'Полная конфиденциальность',
    text: 'Ваша ситуация, документы и персональные данные остаются строго между нами.',
  },
  {
    icon: svg('<path d="M6 21V3.5M6 4h11.5l-2.3 3.8L17.5 12H6"/>'),
    title: 'Сопровождение до результата',
    text: 'Не бросаю на полпути: веду дело до полного снятия блокировки и возврата доступа к деньгам.',
  },
]

const facts = [
  { strong: '115-ФЗ, 161-ФЗ и ДБО', sub: 'профильная специализация' },
  { strong: 'Москва + вся РФ', sub: 'личный приём и работа онлайн' },
  { strong: 'Лично', sub: 'веду каждое дело от и до' },
]

const sectionRef = ref<HTMLElement | null>(null)
useScrollAnimation(sectionRef, { mode: 'scale-in', stagger: 0.1 })
</script>

<template>
  <section id="preimuschestva" ref="sectionRef" class="section section--soft adv scroll-animate scroll-animate--scale-in">
    <div class="container">
      <div class="section-head" data-reveal-item>
        <p class="eyebrow">Почему обращаются ко мне</p>
        <h2 class="section-title">Решаю вопрос с блокировкой под ключ</h2>
        <p class="section-subtitle">
          Вы получаете не общие советы, а конкретный результат — снятую блокировку
          и возвращённый доступ к вашим деньгам.
        </p>
      </div>

      <div class="adv__layout">
        <aside class="expert" data-reveal-item data-scroll-mode="scale-in">
          <figure class="expert__media">
            <img
              :src="asset('/ruslan-ganeev.jpg')"
              alt="Руслан Ганеев — специалист по разблокировке банковских карт и счетов по 115-ФЗ и 161-ФЗ"
              loading="lazy"
              decoding="async"
            >
          </figure>

          <div class="expert__content">
            <p class="expert__kicker">Экспертное сопровождение</p>
            <h3 class="expert__name">Руслан Ганеев</h3>
            <p class="expert__role">Специалист по разблокировке счетов и карт</p>
            <p class="expert__bio">
              Помогаю людям и бизнесу вернуть доступ к собственным деньгам, когда
              банк заблокировал карту или счёт. Знаю банковские процедуры изнутри
              и выстраиваю общение с банком так, чтобы блокировку сняли быстро.
            </p>
          </div>

          <div class="expert__aside">
            <ul class="expert__facts">
              <li v-for="f in facts" :key="f.strong">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#16a86b" /><path d="M8 12.4l2.6 2.6L16 9.5" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" /></svg>
                <span><b>{{ f.strong }}</b>{{ f.sub }}</span>
              </li>
            </ul>
            <a href="#kontakty" class="btn btn--primary btn--block">Получить консультацию</a>
          </div>
        </aside>

        <ul class="adv__list">
          <li v-for="a in advantages" :key="a.title" class="adv__item" data-reveal-item data-scroll-mode="scale-in">
            <span class="adv__ic" v-html="a.icon" />
            <div>
              <h3 class="adv__title">{{ a.title }}</h3>
              <p class="adv__text">{{ a.text }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.adv__layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}

.expert {
  position: relative;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) 282px;
  gap: 28px;
  align-items: center;
  overflow: hidden;
  background:
    radial-gradient(circle at 7% 12%, rgba(4, 104, 214, .13), transparent 34%),
    radial-gradient(circle at 92% 10%, rgba(0, 166, 230, .09), transparent 28%),
    linear-gradient(135deg, #ffffff 0%, #f8fbff 56%, #eef6ff 100%);
  border: 1px solid rgba(203, 218, 238, .92);
  border-radius: 26px;
  padding: 24px;
  box-shadow: 0 22px 54px rgba(11, 28, 58, .10);
  transition:
    transform .32s cubic-bezier(.22, 1, .36, 1),
    box-shadow .32s ease,
    border-color .32s ease;
}
.expert::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(110deg, rgba(255, 255, 255, .35) 0 12%, transparent 34%),
    linear-gradient(180deg, transparent, rgba(255, 255, 255, .34));
  pointer-events: none;
}
.expert:hover {
  transform: translateY(-4px);
  border-color: rgba(90, 166, 245, .64);
  box-shadow: 0 28px 68px rgba(11, 28, 58, .13);
}
.expert__media {
  position: relative;
  z-index: 1;
  width: 220px;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: 24px;
  background:
    radial-gradient(circle at 28% 0%, rgba(4, 104, 214, .18), transparent 34%),
    linear-gradient(145deg, #e9f2fd, #ffffff);
  box-shadow: 0 18px 42px rgba(11, 28, 58, .14);
  isolation: isolate;
}
.expert__media::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(180deg, transparent 52%, rgba(8, 20, 38, .46) 100%),
    linear-gradient(105deg, rgba(255, 255, 255, .22) 0 10%, transparent 31% 100%);
  pointer-events: none;
}
.expert__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 18%;
  transform: scale(1.02);
  transition: transform .45s cubic-bezier(.22, 1, .36, 1), filter .45s ease;
}
.expert:hover .expert__media img {
  transform: scale(1.06);
  filter: saturate(1.04) contrast(1.02);
}
.expert__media figcaption {
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 14px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, .44);
  border-radius: 14px;
  background: rgba(255, 255, 255, .84);
  color: var(--ink);
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
  text-align: center;
  backdrop-filter: blur(14px);
}
.expert__content,
.expert__aside {
  position: relative;
  z-index: 1;
}
.expert__kicker {
  width: fit-content;
  margin-bottom: 11px;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(4, 104, 214, .09);
  color: var(--blue-700);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: .06em;
  line-height: 1;
  text-transform: uppercase;
}
.expert__name {
  margin-bottom: 7px;
  font-size: clamp(28px, 3vw, 42px);
  font-weight: 900;
  color: var(--ink);
  letter-spacing: -.03em;
}
.expert__role {
  max-width: 520px;
  margin-bottom: 18px;
  font-size: 16px;
  color: var(--blue-600);
  font-weight: 800;
}
.expert__bio {
  max-width: 630px;
  font-size: 16px;
  color: var(--text);
}
.expert__aside {
  display: grid;
  gap: 16px;
}
.expert__facts {
  display: grid;
  gap: 10px;
}
.expert__facts li {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px;
  border: 1px solid rgba(228, 235, 244, .88);
  border-radius: 16px;
  background: rgba(255, 255, 255, .78);
  box-shadow: 0 8px 18px rgba(11, 28, 58, .05);
}
.expert__facts svg { width: 22px; height: 22px; flex: none; }
.expert__facts b { display: block; font-size: 14.5px; color: var(--ink); }
.expert__facts span { font-size: 13px; color: var(--muted); line-height: 1.25; }

.adv__list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
.adv__item {
  min-height: 176px;
  display: flex;
  flex-direction: column;
  gap: 17px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 22px;
  transition:
    transform .3s cubic-bezier(.22, 1, .36, 1),
    box-shadow .3s ease,
    border-color .3s ease,
    background .3s ease;
}
.adv__item:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 38px rgba(11, 28, 58, .10);
  border-color: var(--blue-400);
  background: linear-gradient(180deg, #fff 0%, #f8fbff 100%);
}
.adv__ic {
  width: 48px; height: 48px; flex: none;
  display: grid; place-items: center;
  border-radius: 12px;
  background: var(--blue-100);
  color: var(--blue-600);
  transition: transform .3s cubic-bezier(.22, 1, .36, 1), background .3s ease, color .3s ease;
}
.adv__ic :deep(svg) { width: 25px; height: 25px; }
.adv__item:hover .adv__ic { transform: translateY(-2px) scale(1.05); background: var(--blue-600); color: #fff; }
.adv__title { font-size: 17px; margin-bottom: 7px; }
.adv__text { font-size: 14.5px; color: var(--text); }

@media (min-width: 760px) {
  .adv__list { grid-template-columns: 1fr 1fr; }
}
@media (min-width: 1000px) {
  .adv__list { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1100px) {
  .expert {
    grid-template-columns: 184px minmax(0, 1fr);
    align-items: start;
  }
  .expert__media { width: 184px; }
  .expert__aside {
    grid-column: 1 / -1;
  }
  .expert__facts {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .expert {
    grid-template-columns: 1fr;
    padding: 18px;
    border-radius: 22px;
  }
  .expert__media {
    width: min(260px, 100%);
    justify-self: center;
  }
  .expert__facts {
    grid-template-columns: 1fr;
  }
  .expert__name {
    font-size: 28px;
  }
}
</style>
