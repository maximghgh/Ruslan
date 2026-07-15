<script setup lang="ts">
const { contacts, legal } = useAppConfig()
const year = new Date().getFullYear()
const socialLinks = useSocials()

// Реквизиты исполнителя (показываются, только когда заполнены в app.config.ts → legal).
const requisites = computed(() => {
  const parts: string[] = []
  if (legal?.status && legal?.fullName) parts.push(`${legal.status} ${legal.fullName}`)
  if (legal?.inn) parts.push(`ИНН ${legal.inn}`)
  if (legal?.ogrnip) parts.push(`ОГРНИП ${legal.ogrnip}`)
  return parts.join(', ')
})

// В подвале «Telegram-канал» показываем первым.
const footerSocials = computed(() => {
  const channel = socialLinks.filter((s) => s.key === 'telegramChannel')
  const rest = socialLinks.filter((s) => s.key !== 'telegramChannel')
  return [...channel, ...rest]
})

const navLinks = [
  { href: '#uslugi', label: 'Услуги' },
  { href: '#etapy', label: 'Этапы работы' },
  { href: '#preimuschestva', label: 'Почему я' },
  { href: '#stoimost', label: 'Стоимость и гарантии' },
  { href: '#keysy', label: 'Кейсы и результаты' },
  { href: '#otzyvy', label: 'Отзывы' },
  { href: '#voprosy', label: 'Вопросы и ответы' },
  { href: '#kontakty', label: 'Контакты' },
]

const contactLinks = [
  { key: 'phone', label: contacts.phone, href: `tel:${contacts.phoneHref}`, ext: false },
  ...socialLinks.map((link) => ({ key: link.key, label: link.title, href: link.href, ext: true })),
]
</script>

<template>
  <footer class="site-footer">
    <div class="container">
      <div class="ftr__top">
        <div class="ftr__brand">
          <div class="ftr__logo">
            <span class="ftr__mark" aria-hidden="true">
              <BrandLogo :size="42" />
            </span>
            <span class="ftr__name">Руслан Ганеев</span>
          </div>
          <p class="ftr__desc">
            Помощь в разблокировке банковских карт и счетов по 115-ФЗ и 161-ФЗ.
            Снятие блокировки, вывод из базы ЦБ РФ, восстановление доступа к деньгам.
            Москва и вся Россия — дистанционно.
          </p>
          <a href="#kontakty" class="btn btn--white" @click="reachGoal('cta_click', { place: 'footer' })">Получить консультацию</a>
        </div>

        <nav class="ftr__col" aria-label="Разделы сайта">
          <h4 class="ftr__col-title">Разделы</h4>
          <a v-for="l in navLinks" :key="l.href" :href="l.href" class="ftr__link">{{ l.label }}</a>
          <NuxtLink to="/keysy" class="ftr__link">Все кейсы</NuxtLink>
          <NuxtLink to="/politika-konfidencialnosti" class="ftr__link">Политика конфиденциальности</NuxtLink>
        </nav>

        <div class="ftr__col">
          <h4 class="ftr__col-title">Связаться</h4>
          <a
            v-for="c in contactLinks"
            :key="c.label"
            :href="c.href"
            :target="c.ext ? '_blank' : null"
            :rel="c.ext ? 'noopener' : null"
            class="ftr__link"
            @click="trackContact(c.key)"
          >{{ c.label }}</a>
        </div>
      </div>

      <div class="ftr__bottom">
        <div>
          <p class="ftr__copy">© {{ year }} Руслан Ганеев. Разблокировка карт и счетов по 115-ФЗ и 161-ФЗ.</p>
          <p v-if="requisites" class="ftr__legal ftr__legal--req">{{ requisites }}</p>
          <p class="ftr__legal">
            Информация на сайте носит справочный характер и не является публичной офертой.
            Услуги оказываются на основании договора. Отправляя формы на сайте,
            вы соглашаетесь с обработкой
            <NuxtLink to="/politika-konfidencialnosti" class="ftr__legal-link">персональных данных</NuxtLink>.
          </p>
        </div>

        <div class="ftr__socials" aria-label="Социальные сети">
          <a
            v-for="social in footerSocials"
            :key="social.title"
            :href="social.href"
            class="ftr__social"
            :class="{ 'ftr__social--labeled': social.key === 'telegramChannel' }"
            :style="{ '--c': social.color }"
            target="_blank"
            rel="noopener"
            :aria-label="social.title"
            :title="social.title"
            @click="trackContact(social.key)"
          >
            <span class="ftr__social-ic" v-html="social.icon" />
            <b v-if="social.key === 'telegramChannel'" class="ftr__social-label">канал</b>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: var(--ink);
  color: #c4cfe0;
  padding: 52px 0 30px;
}
.ftr__top {
  display: grid;
  grid-template-columns: 1fr;
  gap: 34px;
  padding-bottom: 34px;
  border-bottom: 1px solid rgba(255, 255, 255, .1);
}
.ftr__logo { display: flex; align-items: center; gap: 11px; margin-bottom: 14px; }
.ftr__mark {
  width: 42px; height: 42px; flex: none;
  display: grid; place-items: center;
  border-radius: 12px;
  overflow: hidden;
}
.ftr__mark svg { width: 100%; height: 100%; }
.ftr__name { font-size: 18px; font-weight: 800; color: #fff; }
.ftr__desc { font-size: 14.5px; line-height: 1.6; margin-bottom: 20px; max-width: 420px; }

.ftr__col { display: flex; flex-direction: column; }
.ftr__col-title {
  font-size: 13px; text-transform: uppercase; letter-spacing: .06em;
  color: #8294ad; margin-bottom: 15px; font-weight: 700;
}
.ftr__link {
  font-size: 15px;
  color: #c4cfe0;
  padding: 6px 0;
  transition: color .15s ease, transform .15s ease;
  width: fit-content;
}
.ftr__link:hover { color: #fff; transform: translateX(3px); }

.ftr__bottom {
  padding-top: 26px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 22px;
  align-items: start;
}
.ftr__copy { font-size: 14px; color: #97a6bd; font-weight: 600; }
.ftr__legal { font-size: 12.5px; color: #6f8099; line-height: 1.6; max-width: 760px; }
.ftr__legal--req { margin-bottom: 6px; color: #8294ad; }
.ftr__legal-link { color: #97a6bd; text-decoration: underline; }
.ftr__legal-link:hover { color: #fff; }
.ftr__socials {
  display: flex;
  flex-wrap: wrap;
  gap: 11px;
}
.ftr__social {
  width: 46px;
  height: 46px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: rgba(255, 255, 255, .06);
  border: 1px solid rgba(255, 255, 255, .1);
  color: #dce8f8;
  transition:
    transform .26s cubic-bezier(.22, 1, .36, 1),
    background .26s ease,
    border-color .26s ease,
    color .26s ease,
    box-shadow .26s ease;
}
.ftr__social-ic {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
}
.ftr__social-ic :deep(svg) { width: 22px; height: 22px; }
.ftr__social--labeled {
  width: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 17px 0 12px;
}
.ftr__social-label { font-size: 13.5px; font-weight: 700; white-space: nowrap; }
.ftr__social:hover {
  transform: translateY(-4px);
  background: var(--c);
  border-color: var(--c);
  color: #fff;
  box-shadow: 0 12px 26px color-mix(in srgb, var(--c) 45%, transparent);
}

@media (min-width: 760px) {
  .ftr__top { grid-template-columns: 1.7fr 1fr 1fr; gap: 40px; }
  .ftr__bottom { grid-template-columns: 1fr auto; }
  .ftr__socials { justify-content: flex-end; }
}
</style>
