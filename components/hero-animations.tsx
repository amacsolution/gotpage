"use client"

import { useEffect, useRef } from "react"

export function HeroAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Ustawienie rozmiaru canvas na pełny rozmiar rodzica
    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.offsetWidth
        canvas.height = parent.offsetHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Parametry animacji
    const particlesArray: Particle[] = []
    const numberOfParticles = 50
    // Ustaw kolory jako state, aby reagowały na zmianę motywu
    let colors: string[] = ["#f0338c", "#f0338c33", "#f0338c22", "#333"]

    const getColors = () => {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark")
      return isDark
        ? ["#f0338c", "#f0338c33", "#f0338c", "#fff"]
        : ["#f0338c", "#f0338c33", "#f0338c22", "#333"]
    }

    colors = getColors()

    // Listen for theme changes and update colors
    const themeObserver = new MutationObserver(() => {
      colors = getColors()
      // Optionally, re-color all particles
      particlesArray.forEach(p => {
        p.color = colors[Math.floor(Math.random() * colors.length)]
      })
    })

    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    // Clean up observer on unmount
    // (add this to your cleanup function at the end of useEffect)

    // Klasa cząsteczki
    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * canvas!.width
        this.y = Math.random() * canvas!.height
        this.size = Math.random() * 5 + 1
        this.speedX = Math.random() * 1 - 0.7
        this.speedY = Math.random() * 1 - 0.7
        this.color = colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas!.width) this.x = 0
        else if (this.x < 0) this.x = canvas!.width
        if (this.y > canvas!.height) this.y = 0
        else if (this.y < 0) this.y = canvas!.height
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Inicjalizacja cząsteczek
    function init() {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle())
      }
    }

    // Rysowanie linii między cząsteczkami
    function connect() {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark")
      if (!ctx) return
      let opacityValue = 1
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x
          const dy = particlesArray[a].y - particlesArray[b].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            opacityValue = 1 - distance / 100
            ctx.strokeStyle = isDark ? `rgba(255, 255, 255, ${opacityValue * 0.6}) ` : `rgba(0, 0, 0, ${opacityValue * 0.6}) `
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y)
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y)
            ctx.stroke()
          }
        }
      }
    }

    // Animacja
    function animate() {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update()
        particlesArray[i].draw()
      }
      connect()
      requestAnimationFrame(animate)
    }

    init()
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0  h-full -z-10" />
}

