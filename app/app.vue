<script setup lang="ts">
// Подтверждение прав на сайт (Яндекс.Вебмастер). Google-подтверждение убрано по 152-ФЗ.
const { seo } = useAppConfig() as { seo?: { yandexVerification?: string } }
useHead({
  meta: [
    ...(seo?.yandexVerification ? [{ name: 'yandex-verification', content: seo.yandexVerification }] : []),
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
