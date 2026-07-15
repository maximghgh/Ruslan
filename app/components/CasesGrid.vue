<script setup lang="ts">
import type { Bank, CaseType, CaseItem } from '~/composables/useCases'
import { bankLogo, bankName, typeName, useCasesAsset } from '~/composables/useCases'

const props = withDefaults(defineProps<{
  items: CaseItem[]
  filters?: boolean
}>(), {
  filters: false,
})

const asset = useCasesAsset()

const bankChips = computed<{ id: 'all' | Bank; label: string }[]>(() => {
  const present = Array.from(new Set(props.items.map((c) => c.bank)))
  const order: Bank[] = ['cb', 'tbank', 'sber', 'ozon', 'alfa', 'yandex', 'other']
  return [
    { id: 'all', label: 'Все банки' },
    ...order.filter((b) => present.includes(b)).map((b) => ({ id: b, label: bankName[b] })),
  ]
})
const typeChips: { id: 'all' | CaseType; label: string }[] = [
  { id: 'all', label: 'Все дела' },
  { id: '115', label: '115-ФЗ' },
  { id: '161', label: '161-ФЗ' },
  { id: 'kompromet', label: 'Компрометация' },
]

const bankFilter = ref<'all' | Bank>('all')
const typeFilter = ref<'all' | CaseType>('all')

const filtered = computed(() =>
  props.items.filter(
    (c) =>
      (bankFilter.value === 'all' || c.bank === bankFilter.value) &&
      (typeFilter.value === 'all' || c.type === typeFilter.value),
  ),
)

const lightbox = ref<CaseItem | null>(null)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') lightbox.value = null
}

watch(lightbox, (v) => {
  if (import.meta.client) document.body.style.overflow = v ? 'hidden' : ''
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <div class="casesgrid">
    <div v-if="filters" class="cases__filters" data-reveal-item>
      <div class="filter-row" role="group" aria-label="Фильтр по банку">
        <button
          v-for="chip in bankChips"
          :key="chip.id"
          type="button"
          class="chip"
          :class="{ 'chip--active': bankFilter === chip.id }"
          @click="bankFilter = chip.id"
        >
          <img v-if="chip.id !== 'all'" class="chip__logo" :src="asset(bankLogo[chip.id as Bank])" alt="" />
          {{ chip.label }}
        </button>
      </div>
      <div class="filter-row" role="group" aria-label="Фильтр по типу дела">
        <button
          v-for="chip in typeChips"
          :key="chip.id"
          type="button"
          class="chip"
          :class="{ 'chip--active': typeFilter === chip.id }"
          @click="typeFilter = chip.id"
        >
          {{ chip.label }}
        </button>
      </div>
    </div>

    <TransitionGroup v-if="filtered.length" name="case-list" tag="div" class="cases__grid">
      <article v-for="c in filtered" :key="c.img" class="case" data-reveal-item data-scroll-mode="scale-in">
        <button
          type="button"
          class="case__media"
          :aria-label="`Открыть на весь экран: ${c.title}`"
          @click="lightbox = c"
        >
          <img :src="asset(c.img)" :alt="c.title" loading="lazy" decoding="async" />
          <span class="case__zoom" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" /><path d="M16.5 16.5 21 21M11 8v6M8 11h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
          </span>
        </button>
        <div class="case__body">
          <div class="case__tags">
            <span class="case__tag">
              <img class="case__tag-logo" :src="asset(bankLogo[c.bank])" alt="" />
              {{ bankName[c.bank] }}
            </span>
            <span class="case__tag case__tag--type" :class="`is-${c.type}`">{{ typeName[c.type] }}</span>
          </div>
          <h3 class="case__title">{{ c.title }}</h3>
          <p class="case__text">{{ c.text }}</p>
        </div>
      </article>
    </TransitionGroup>

    <p v-else class="cases__empty" data-reveal-item>
      По выбранным фильтрам кейсов пока нет — выберите другой банк или тип дела.
    </p>

    <Teleport to="body">
      <Transition name="lb">
        <div v-if="lightbox" class="lb" @click="lightbox = null">
          <button class="lb__close" type="button" aria-label="Закрыть" @click="lightbox = null">
            <svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" /></svg>
          </button>
          <figure class="lb__figure" @click.stop>
            <img :src="asset(lightbox.img)" :alt="lightbox.title" decoding="async" />
            <figcaption class="lb__caption">{{ lightbox.title }}</figcaption>
          </figure>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Фильтры */
.cases__filters {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 34px;
}
.filter-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 9px; }
.chip {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 16px;
  font-size: 14.5px; font-weight: 700;
  color: var(--ink);
  background: #fff;
  border: 1.6px solid var(--border);
  border-radius: 100px;
  transition:
    background .24s ease,
    border-color .24s ease,
    color .24s ease,
    transform .24s cubic-bezier(.22, 1, .36, 1),
    box-shadow .24s ease;
}
.chip:hover { border-color: var(--blue-400); transform: translateY(-2px); box-shadow: var(--shadow-xs); }
.chip:active { transform: translateY(0) scale(.97); }
.chip--active {
  background: var(--blue-600);
  border-color: var(--blue-600);
  color: #fff;
}
.chip__logo { width: 21px; height: 21px; object-fit: contain; flex: none; }

/* Сетка кейсов */
.cases__grid {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
.case {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition:
    transform .34s cubic-bezier(.22, 1, .36, 1),
    box-shadow .34s ease,
    border-color .34s ease;
}
.case:hover { transform: translateY(-7px); box-shadow: 0 24px 48px rgba(11, 28, 58, .13); border-color: var(--blue-400); }

.case__media {
  display: block;
  width: 100%;
  height: 248px;
  padding: 0;
  position: relative;
  cursor: zoom-in;
  background: var(--blue-50);
  border-bottom: 1px solid var(--border);
}
.case__media img {
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: top center;
  transition: transform .5s cubic-bezier(.22, 1, .36, 1);
}
.case:hover .case__media img { transform: scale(1.055); }
.case__zoom {
  position: absolute;
  top: 12px; right: 12px;
  width: 38px; height: 38px;
  display: grid; place-items: center;
  border-radius: 10px;
  background: rgba(11, 28, 58, .62);
  color: #fff;
  backdrop-filter: blur(3px);
  transition: background .24s ease, transform .24s ease;
}
.case__media:hover .case__zoom { background: var(--blue-600); transform: scale(1.05); }
.case__zoom svg { width: 20px; height: 20px; }

.case__body { padding: 18px 20px 20px; display: flex; flex-direction: column; gap: 9px; }
.case__tags { display: flex; flex-wrap: wrap; gap: 7px; }
.case__tag {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12.5px; font-weight: 700;
  padding: 5px 10px 5px 7px;
  border-radius: 100px;
  background: var(--bg-soft);
  color: var(--ink);
}
.case__tag-logo { width: 18px; height: 18px; object-fit: contain; flex: none; }
.case__tag--type { padding: 5px 11px; }
.case__tag--type.is-115 { background: var(--blue-100); color: var(--blue-700); }
.case__tag--type.is-161 { background: #e0f0fb; color: #0a6aa8; }
.case__tag--type.is-kompromet { background: #fdece1; color: #c0562b; }
.case__title { font-size: 17px; line-height: 1.3; }
.case__text { font-size: 14px; color: var(--text); }

.cases__empty {
  text-align: center;
  font-size: 16px;
  color: var(--muted);
  padding: 32px 0;
}

/* Лайтбокс */
.lb {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(7, 14, 28, .92);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  cursor: zoom-out;
}
.lb__figure {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  cursor: default;
  max-width: 100%;
}
.lb__figure img {
  max-width: min(94vw, 720px);
  max-height: 82vh;
  border-radius: 12px;
  box-shadow: 0 30px 70px rgba(0, 0, 0, .5);
}
.lb__caption {
  color: #e7edf6;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  max-width: 540px;
}
.lb__close {
  position: fixed;
  top: 18px; right: 18px;
  width: 46px; height: 46px;
  display: grid; place-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, .14);
  color: #fff;
  transition: background .15s ease;
}
.lb__close:hover { background: rgba(255, 255, 255, .28); }
.lb__close svg { width: 22px; height: 22px; }

.lb-enter-active, .lb-leave-active { transition: opacity .25s ease; }
.lb-enter-from, .lb-leave-to { opacity: 0; }
.lb-enter-active .lb__figure, .lb-leave-active .lb__figure { transition: transform .25s ease; }
.lb-enter-from .lb__figure, .lb-leave-to .lb__figure { transform: scale(.94); }

.case-list-enter-active,
.case-list-leave-active,
.case-list-move {
  transition: opacity .3s ease, transform .3s cubic-bezier(.22, 1, .36, 1);
}
.case-list-enter-from,
.case-list-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(.98);
}
.case-list-leave-active { position: absolute; }

@media (min-width: 640px) {
  .cases__grid { grid-template-columns: repeat(2, 1fr); gap: 22px; }
}
@media (min-width: 980px) {
  .cases__grid { grid-template-columns: repeat(3, 1fr); gap: 24px; }
}
</style>
