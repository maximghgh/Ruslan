<script setup lang="ts">
const { contacts, legal } = useAppConfig()
const siteUrl = 'https://yuristpro1.ru'

const operator = [legal?.status, legal?.fullName].filter(Boolean).join(' ')
const updated = '15 июля 2026 г.'

const title = 'Политика конфиденциальности и обработки персональных данных'
const description =
  'Политика обработки персональных данных сайта yuristpro1.ru: какие данные собираются через форму заявки, цели и сроки обработки, права пользователя. Согласно 152-ФЗ.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website',
  ogUrl: `${siteUrl}/politika-konfidencialnosti`,
  ogLocale: 'ru_RU',
  robots: 'index, follow',
})
useHead({
  link: [{ rel: 'canonical', href: `${siteUrl}/politika-konfidencialnosti` }],
})
</script>

<template>
  <section class="section legal-page">
    <div class="container container--narrow">
      <NuxtLink to="/" class="legal-page__back">
        <svg viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        На главную
      </NuxtLink>

      <h1 class="legal-page__title">Политика конфиденциальности</h1>
      <p class="legal-page__meta">Обработка персональных данных на сайте yuristpro1.ru. Обновлено: {{ updated }}</p>

      <div class="legal-page__body">
        <h2>1. Общие положения</h2>
        <p>
          Настоящая Политика обработки персональных данных (далее — «Политика») действует в отношении
          всей информации, которую оператор может получить о пользователе во время использования сайта
          <strong>yuristpro1.ru</strong> (далее — «Сайт»). Политика разработана во исполнение требований
          Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных».
        </p>
        <p>
          Оператор персональных данных: <strong v-if="operator">{{ operator }}</strong><span v-else>Ганеев Руслан</span><span v-if="legal?.inn">, ИНН {{ legal.inn }}</span>
          (далее — «Оператор»). Использование Сайта означает согласие пользователя с настоящей Политикой
          и условиями обработки его персональных данных.
        </p>

        <h2>2. Какие данные обрабатываются</h2>
        <p>Оператор обрабатывает персональные данные, которые пользователь предоставляет добровольно при заполнении формы заявки на Сайте:</p>
        <ul>
          <li>имя (или то, как к пользователю обращаться);</li>
          <li>номер телефона;</li>
          <li>иные сведения, которые пользователь сообщает добровольно в сообщении/комментарии.</li>
        </ul>
        <p>
          Также автоматически могут собираться обезличенные технические данные с помощью сервисов
          интернет-статистики (Яндекс.Метрика, Google Analytics): IP-адрес, данные cookie, информация о
          браузере, действия на Сайте. Эти данные не позволяют идентифицировать пользователя.
        </p>

        <h2>3. Цели обработки</h2>
        <ul>
          <li>обратная связь с пользователем: ответ на заявку, консультация по услуге;</li>
          <li>предоставление услуг по разблокировке банковских карт и счетов;</li>
          <li>анализ качества работы Сайта и улучшение его функционирования (в обезличенном виде).</li>
        </ul>

        <h2>4. Правовые основания</h2>
        <p>
          Правовым основанием обработки является согласие пользователя, выражаемое путём отправки формы
          заявки на Сайте, а также исполнение договора/оказание услуги по инициативе пользователя.
          Отправляя форму, пользователь подтверждает согласие на обработку указанных персональных данных.
        </p>

        <h2>5. Условия и сроки обработки</h2>
        <p>
          Обработка осуществляется с использованием средств автоматизации и без таковых. Оператор не
          передаёт персональные данные третьим лицам, за исключением случаев, предусмотренных
          законодательством РФ. Данные хранятся не дольше, чем этого требуют цели обработки, либо до
          отзыва согласия пользователем.
        </p>
        <p>
          Оператор принимает необходимые организационные и технические меры для защиты персональных данных
          от неправомерного доступа, уничтожения, изменения, блокирования, копирования и распространения.
        </p>

        <h2>6. Права пользователя</h2>
        <p>Пользователь вправе в любой момент:</p>
        <ul>
          <li>получить информацию об обработке своих персональных данных;</li>
          <li>требовать уточнения, блокирования или уничтожения данных, если они неполны, устарели, неточны или обрабатываются с нарушением закона;</li>
          <li>отозвать согласие на обработку персональных данных.</li>
        </ul>
        <p>Для реализации своих прав пользователь может обратиться к Оператору по контактам ниже.</p>

        <h2>7. Файлы cookie</h2>
        <p>
          Сайт использует файлы cookie для корректной работы и сбора обезличенной статистики. Пользователь
          может отключить cookie в настройках браузера, однако это может повлиять на работу Сайта.
        </p>

        <h2>8. Контакты оператора</h2>
        <p>
          По вопросам обработки персональных данных обращайтесь:
        </p>
        <ul>
          <li>Телефон: <a :href="`tel:${contacts.phoneHref}`">{{ contacts.phone }}</a></li>
          <li v-if="contacts.email">E-mail: <a :href="`mailto:${contacts.email}`">{{ contacts.email }}</a></li>
        </ul>

        <h2>9. Изменения Политики</h2>
        <p>
          Оператор вправе вносить изменения в настоящую Политику. Новая редакция вступает в силу с момента
          её размещения на Сайте, если иное не предусмотрено новой редакцией.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.legal-page { padding-top: 32px; }
.legal-page__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 18px;
  font-size: 15px;
  font-weight: 700;
  color: var(--blue-700);
  transition: gap .2s ease, color .2s ease;
}
.legal-page__back svg { width: 20px; height: 20px; }
.legal-page__back:hover { gap: 10px; color: var(--blue-600); }
.legal-page__title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(26px, 5vw, 40px);
  letter-spacing: -.03em;
  margin-bottom: 8px;
}
.legal-page__meta { color: var(--muted); font-size: 14px; margin-bottom: 28px; }
.legal-page__body { max-width: 760px; }
.legal-page__body h2 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  margin: 28px 0 10px;
}
.legal-page__body p { margin-bottom: 12px; line-height: 1.7; color: var(--ink); }
.legal-page__body ul { margin: 0 0 14px; padding-left: 22px; }
.legal-page__body li { margin-bottom: 6px; line-height: 1.6; }
.legal-page__body a { color: var(--blue-700); text-decoration: underline; }
.container--narrow { max-width: 860px; }
</style>
