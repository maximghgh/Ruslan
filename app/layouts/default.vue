<template>
  <div class="page">
    <a href="#main-content" class="skip-link">Перейти к содержимому</a>
    <AnimatedBg variant="aurora" />
    <AppPreloader />
    <SiteHeader />
    <main id="main-content" tabindex="-1">
      <slot />
    </main>
    <SiteFooter />
    <ClientOnly>
      <QuickContact />
    </ClientOnly>
  </div>
</template>
