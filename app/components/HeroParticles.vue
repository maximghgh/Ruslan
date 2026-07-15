<script setup lang="ts">
type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  tier: 'small' | 'large'
}

type IconKind = 'lock' | 'shield' | 'card' | 'document'

type IconParticle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  kind: IconKind
  rotation: number
  spin: number
}

const canvas = ref<HTMLCanvasElement | null>(null)
const enabled = ref(false)

let ctx: CanvasRenderingContext2D | null = null
let particles: Particle[] = []
let icons: IconParticle[] = []
let frame = 0
let running = false
let io: IntersectionObserver | null = null
let lastFrameTime = 0
let gradientTime = 0
let canvasWidth = 0
let canvasHeight = 0
const parallax = { x: 0, y: 0, targetX: 0, targetY: 0 }

const maxFpsInterval = 1000 / 60
const gradientLoop = 8

let iconPaths: Record<IconKind, Path2D> | null = null

function createIconPaths() {
  iconPaths = {
    lock: new Path2D('M7 10V8a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2 0h6V8a3 3 0 0 0-6 0v2Zm4 5.7V17h-2v-1.3a2 2 0 1 1 2 0Z'),
    shield: new Path2D('M12 2 20 5v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3Zm0 3.2L6.3 7.3V11c0 3.6 2.2 6.8 5.7 8.3 3.5-1.5 5.7-4.7 5.7-8.3V7.3L12 5.2Z'),
    card: new Path2D('M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 4h16V8H4v2Zm2 5v2h5v-2H6Zm8 0v2h4v-2h-4Z'),
    document: new Path2D('M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 2.5V8h3.5L13 4.5ZM8 12v2h8v-2H8Zm0 4v2h6v-2H8Z'),
  }
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount
}

function lerpColor(a: [number, number, number], b: [number, number, number], amount: number) {
  const r = Math.round(lerp(a[0], b[0], amount))
  const g = Math.round(lerp(a[1], b[1], amount))
  const blue = Math.round(lerp(a[2], b[2], amount))
  return `rgb(${r}, ${g}, ${blue})`
}

function gradientAmount() {
  return (Math.sin((gradientTime / gradientLoop) * Math.PI * 2 - Math.PI / 2) + 1) / 2
}

function createParticle(width: number, height: number, tier: Particle['tier']): Particle {
  const speed = tier === 'large' ? 0.5 : 1

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.22 * speed,
    vy: (Math.random() - 0.5) * 0.18 * speed,
    radius: tier === 'large' ? 5 + Math.random() * 3 : 1 + Math.random(),
    alpha: tier === 'large' ? 0.06 : 0.26 + Math.random() * 0.2,
    tier,
  }
}

function createIcon(width: number, height: number, index: number): IconParticle {
  const kinds: IconKind[] = ['lock', 'shield', 'card', 'document']

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.08,
    vy: (Math.random() - 0.5) * 0.06,
    size: 20 + Math.random() * 9,
    alpha: 0.12 + Math.random() * 0.08,
    kind: kinds[index % kinds.length],
    rotation: (Math.random() - 0.5) * 0.35,
    spin: (Math.random() - 0.5) * 0.002,
  }
}

function resize() {
  if (!canvas.value || !ctx) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const rect = canvas.value.getBoundingClientRect()
  const nextWidth = rect.width
  const nextHeight = rect.height
  const scaleX = canvasWidth ? nextWidth / canvasWidth : 1
  const scaleY = canvasHeight ? nextHeight / canvasHeight : 1

  canvas.value.width = rect.width * dpr
  canvas.value.height = rect.height * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  particles.forEach((particle) => {
    particle.x *= scaleX
    particle.y *= scaleY
  })
  icons.forEach((icon) => {
    icon.x *= scaleX
    icon.y *= scaleY
  })

  canvasWidth = nextWidth
  canvasHeight = nextHeight

  const smallCount = Math.max(48, Math.min(70, Math.round(rect.width / 20)))
  const largeCount = Math.max(8, Math.min(16, Math.round(rect.width / 84)))
  const smallParticles = particles.filter((particle) => particle.tier === 'small').slice(0, smallCount)
  const largeParticles = particles.filter((particle) => particle.tier === 'large').slice(0, largeCount)

  while (smallParticles.length < smallCount) smallParticles.push(createParticle(rect.width, rect.height, 'small'))
  while (largeParticles.length < largeCount) largeParticles.push(createParticle(rect.width, rect.height, 'large'))

  particles = [...smallParticles, ...largeParticles]

  const iconCount = Math.max(4, Math.min(7, Math.round(rect.width / 210)))
  icons = icons.slice(0, iconCount)
  while (icons.length < iconCount) icons.push(createIcon(rect.width, rect.height, icons.length))
}

function wrap(point: Particle | IconParticle, width: number, height: number, margin: number) {
  if (point.x < -margin) point.x = width + margin
  if (point.x > width + margin) point.x = -margin
  if (point.y < -margin) point.y = height + margin
  if (point.y > height + margin) point.y = -margin
}

function drawGradient(width: number, height: number) {
  if (!ctx) return

  const amount = gradientAmount()
  const left = lerpColor([234, 244, 255], [232, 240, 254], amount)
  const center = lerpColor([232, 240, 254], [234, 244, 255], amount)
  const right = lerpColor([234, 244, 255], [232, 240, 254], amount)
  const gradient = ctx.createLinearGradient(0, 0, width, height)

  gradient.addColorStop(0, left)
  gradient.addColorStop(0.52, center)
  gradient.addColorStop(1, right)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

function drawConnections(tier: Particle['tier']) {
  if (!ctx) return

  const sameTier = particles.filter((particle) => particle.tier === tier)
  const maxDistance = tier === 'small' ? 110 : 80
  const maxDistanceSquared = maxDistance * maxDistance

  ctx.strokeStyle = 'rgba(24, 95, 165, 0.10)'
  ctx.lineWidth = tier === 'large' ? 0.8 : 0.6

  for (let i = 0; i < sameTier.length; i += 1) {
    for (let j = i + 1; j < sameTier.length; j += 1) {
      const a = sameTier[i]
      const b = sameTier[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const distanceSquared = dx * dx + dy * dy

      if (distanceSquared > maxDistanceSquared) continue

      ctx.globalAlpha = 1 - distanceSquared / maxDistanceSquared
      ctx.beginPath()
      ctx.moveTo(a.x + parallax.x, a.y + parallax.y)
      ctx.lineTo(b.x + parallax.x, b.y + parallax.y)
      ctx.stroke()
    }
  }

  ctx.globalAlpha = 1
}

function drawIcon(icon: IconParticle) {
  if (!ctx || !iconPaths) return

  ctx.save()
  ctx.translate(icon.x + parallax.x * 0.7, icon.y + parallax.y * 0.7)
  ctx.rotate(icon.rotation)
  ctx.scale(icon.size / 24, icon.size / 24)
  ctx.translate(-12, -12)
  ctx.fillStyle = `rgba(24, 95, 165, ${icon.alpha})`
  ctx.fill(iconPaths[icon.kind])
  ctx.restore()
}

function draw(timestamp: number) {
  if (!canvas.value || !ctx) return

  if (timestamp - lastFrameTime < maxFpsInterval) {
    if (running) frame = requestAnimationFrame(draw)
    return
  }

  const delta = Math.min((timestamp - lastFrameTime) / 16.67, 2)
  lastFrameTime = timestamp
  gradientTime = (gradientTime + (delta * 16.67) / 1000) % gradientLoop

  const rect = canvas.value.getBoundingClientRect()
  drawGradient(rect.width, rect.height)

  parallax.x = lerp(parallax.x, parallax.targetX, 0.04)
  parallax.y = lerp(parallax.y, parallax.targetY, 0.04)

  particles.forEach((particle) => {
    particle.x += particle.vx * delta
    particle.y += particle.vy * delta
    wrap(particle, rect.width, rect.height, 12)
  })

  icons.forEach((icon) => {
    icon.x += icon.vx * delta
    icon.y += icon.vy * delta
    icon.rotation += icon.spin * delta
    wrap(icon, rect.width, rect.height, 36)
  })

  drawConnections('large')
  drawConnections('small')

  particles.forEach((particle) => {
    const offsetMultiplier = particle.tier === 'large' ? 0.5 : 1

    ctx!.beginPath()
    ctx!.arc(
      particle.x + parallax.x * offsetMultiplier,
      particle.y + parallax.y * offsetMultiplier,
      particle.radius,
      0,
      Math.PI * 2,
    )
    ctx!.fillStyle = `rgba(24, 95, 165, ${particle.alpha})`
    ctx!.fill()
  })

  icons.forEach(drawIcon)

  if (running) frame = requestAnimationFrame(draw)
}

function start() {
  if (running) return
  running = true
  frame = requestAnimationFrame((timestamp) => {
    lastFrameTime = timestamp - maxFpsInterval
    draw(timestamp)
  })
}
function stop() {
  running = false
  cancelAnimationFrame(frame)
}

function handleMouseMove(event: MouseEvent) {
  if (!canvas.value) return

  const rect = canvas.value.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width - 0.5
  const y = (event.clientY - rect.top) / rect.height - 0.5

  parallax.targetX = x * 12
  parallax.targetY = y * 12
}

function handleMouseLeave() {
  parallax.targetX = 0
  parallax.targetY = 0
}

onMounted(async () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced || window.innerWidth < 768) return

  enabled.value = true
  await nextTick()

  if (!canvas.value) return

  ctx = canvas.value.getContext('2d')
  if (!ctx) return

  createIconPaths()
  resize()
  window.addEventListener('resize', resize, { passive: true })
  window.addEventListener('mousemove', handleMouseMove, { passive: true })
  window.addEventListener('mouseleave', handleMouseLeave, { passive: true })

  // Крутим анимацию только когда hero виден — вне вьюпорта rAF-цикл останавливается.
  io = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) start()
      else stop()
    },
    { threshold: 0 },
  )
  io.observe(canvas.value)
})

onBeforeUnmount(() => {
  stop()
  io?.disconnect()
  if (import.meta.client) {
    window.removeEventListener('resize', resize)
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseleave', handleMouseLeave)
  }
})
</script>

<template>
  <canvas v-if="enabled" ref="canvas" class="hero-particles" aria-hidden="true" />
</template>

<style scoped>
.hero-particles {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: .72;
}
</style>
