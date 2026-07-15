// Отправка целей (конверсий) в Яндекс.Метрику.
//
// ВАЖНО: чтобы Директ мог оптимизировать рекламу и считать стоимость заявки,
// эти же идентификаторы целей нужно завести в интерфейсе Метрики
// (Настройки → Цели, тип «JavaScript-событие», значение = идентификатор ниже):
//   • lead            — отправлена заявка с формы (главная конверсия)
//   • phone_click     — клик по номеру телефона
//   • messenger_click — клик по мессенджеру (Telegram / WhatsApp / MAX)
//   • social_click    — клик по соцсети / Авито / каналу
//   • cta_click       — клик по кнопке «Оставить заявку/Получить консультацию»
//                       (промежуточная цель для ретаргетинга; параметр place = header/hero/footer)
// Если цель не заведена в Метрике — событие просто не учитывается, ошибок нет.

// Мессенджеры = «горячие» каналы прямой связи (отдельная цель под Директ).
const MESSENGERS = new Set(['telegram', 'whatsapp', 'max'])

export function reachGoal(target: string, params?: Record<string, unknown>): void {
  if (import.meta.server) return
  const { seo } = useAppConfig() as { seo?: { yandexMetrika?: string } }
  const id = seo?.yandexMetrika
  const ym = (window as unknown as { ym?: (...a: unknown[]) => void }).ym
  if (!id || typeof ym !== 'function') return
  ym(Number(id), 'reachGoal', target, params)
}

// Единая точка для кликов по контактам: сама выбирает нужную цель по ключу канала.
export function trackContact(key: string): void {
  if (key === 'phone') return reachGoal('phone_click')
  if (MESSENGERS.has(key)) return reachGoal('messenger_click', { channel: key })
  reachGoal('social_click', { channel: key })
}
