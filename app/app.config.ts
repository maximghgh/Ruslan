// Эти значения используются в шапке, блоке контактов, подвале и SEO-разметке.
export default defineAppConfig({
  // Временная заглушка формы: true → вместо формы показывается «на техобслуживании»
  // (данные не собираются). Вернуть приём заявок → поставить false и пересобрать.
  formMaintenance: true,

  contacts: {
    phone: '+7 (912) 450-45-68',
    phoneHref: '+79124504568',
    vk: 'https://vk.ru/yuristpro1',
    avito: 'https://www.avito.ru/moskva/predlozheniya_uslug/razblokirovka_kartschetov_po_115-fz161-fzdbo_4362010090?utm_campaign=native&utm_medium=item_page_ios&utm_source=soc_sharing_seller',
    tiktok: '',
    instagram: '',
    max: 'https://max.ru/join/L2q3rjaimnYvnu5k4VcNtkAvWLNMVOPKFnJ0jfFWFaE',
    telegram: 'https://t.me/ganeev_ruslan1',
    telegramChannel: 'https://t.me/ruslanganeev_yuristpro',
    whatsapp: '',
    email: '',
    // Куда приходят заявки с формы (через FormSubmit.co).
    leadEmail: 'RG14112003@yandex.ru',
    // Город / график (для блока контактов и SEO-разметки).
    city: 'Москва',
    schedule: 'Ежедневно, 09:00–21:00',
  },

  // ===== Реквизиты исполнителя =====
  // ВАЖНО: заполните ДО запуска Яндекс.Директа — модерация юр-услуг требует
  // реквизиты и политику. Пустые поля просто не показываются (безопасно).
  // Отображаются в подвале, в Политике конфиденциальности и в JSON-LD (taxID).
  legal: {
    status: 'ИП', // или 'ИП'
    fullName: 'Ганеев Руслан Ильдарович', // ФИО оператора перс. данных (лучше полностью, с отчеством)
    inn: '183237273480', // ИНН — обязателен для Директа. Впишите цифры, напр. '772233445566'
    ogrnip: '', // ОГРНИП — только если статус 'ИП'
  },

  // ===== Аналитика и подтверждение прав на сайт =====
  // Заполните после регистрации сайта в соответствующих сервисах.
  // Пустые значения = ничего не подключается (безопасно).
  seo: {
    yandexMetrika: '110042390', // номер счётчика Яндекс.Метрики (только цифры)
    yandexVerification: '07d7828b142d5842', // код подтверждения из Яндекс.Вебмастера (meta yandex-verification)
    // Google Analytics и Google-подтверждение убраны по 152-ФЗ (иностранные сервисы).
  },
})
