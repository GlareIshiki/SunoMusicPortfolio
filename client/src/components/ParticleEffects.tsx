import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
}

interface StarDust {
  x: number;
  y: number;
  size: number;
  speedY: number;
  drift: number;
  twinkle: number;
  twinkleSpeed: number;
  opacity: number;
}

interface AuroraRay {
  x: number;
  width: number;
  opacity: number;
  hue: number;
  speed: number;
  offset: number;
}

/**
 * Full-page particle effects overlay:
 * - Golden firefly particles that float gently
 * - Aurora light rays from above + falling star dust
 */
export function ParticleEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let stars: StarDust[] = [];
    let auroras: AuroraRay[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function initParticles() {
      const count = Math.floor((canvas!.width * canvas!.height) / 25000);

      // Fireflies
      particles = Array.from({ length: Math.min(count, 40) }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        size: Math.random() * 3 + 1,
        speedY: (Math.random() - 0.5) * 0.3,
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
      }));

      // Star dust
      stars = Array.from({ length: Math.min(count, 50) }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        size: Math.random() * 1.5 + 0.5,
        speedY: Math.random() * 0.4 + 0.1,
        drift: (Math.random() - 0.5) * 0.2,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.05 + 0.02,
        opacity: Math.random() * 0.6 + 0.2,
      }));

      // Aurora rays
      auroras = Array.from({ length: 4 }, (_, i) => ({
        x: (canvas!.width / 5) * (i + 1) + (Math.random() - 0.5) * 100,
        width: Math.random() * 80 + 40,
        opacity: Math.random() * 0.06 + 0.02,
        hue: Math.random() * 40 + 240, // purple-blue range
        speed: Math.random() * 0.3 + 0.1,
        offset: Math.random() * Math.PI * 2,
      }));
    }

    function drawFireflies(time: number) {
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += p.pulseSpeed;

        // Wrap around
        if (p.x < -10) p.x = canvas!.width + 10;
        if (p.x > canvas!.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas!.height + 10;
        if (p.y > canvas!.height + 10) p.y = -10;

        // Gentle direction change
        p.speedX += (Math.random() - 0.5) * 0.01;
        p.speedY += (Math.random() - 0.5) * 0.01;
        p.speedX = Math.max(-0.5, Math.min(0.5, p.speedX));
        p.speedY = Math.max(-0.5, Math.min(0.5, p.speedY));

        const glow = (Math.sin(p.pulse) + 1) / 2;
        const alpha = p.opacity * (0.4 + glow * 0.6);

        // Outer glow
        const gradient = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
        gradient.addColorStop(0, `rgba(212, 175, 55, ${alpha * 0.8})`);
        gradient.addColorStop(0.3, `rgba(212, 175, 55, ${alpha * 0.3})`);
        gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
        ctx!.fillStyle = gradient;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
        ctx!.fill();

        // Bright center
        ctx!.fillStyle = `rgba(255, 235, 180, ${alpha})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function drawAurora(time: number) {
      for (const ray of auroras) {
        const sway = Math.sin(time * 0.0003 * ray.speed + ray.offset) * 60;
        const x = ray.x + sway;
        const alpha = ray.opacity * (0.6 + Math.sin(time * 0.0005 + ray.offset) * 0.4);

        const gradient = ctx!.createLinearGradient(x, 0, x, canvas!.height * 0.7);
        gradient.addColorStop(0, `hsla(${ray.hue}, 60%, 70%, ${alpha})`);
        gradient.addColorStop(0.5, `hsla(${ray.hue + 20}, 50%, 60%, ${alpha * 0.4})`);
        gradient.addColorStop(1, `hsla(${ray.hue}, 60%, 70%, 0)`);

        ctx!.fillStyle = gradient;
        ctx!.beginPath();
        ctx!.moveTo(x - ray.width / 2, 0);
        ctx!.lineTo(x + ray.width / 2, 0);
        ctx!.lineTo(x + ray.width * 0.3 + sway * 0.3, canvas!.height * 0.7);
        ctx!.lineTo(x - ray.width * 0.3 + sway * 0.3, canvas!.height * 0.7);
        ctx!.closePath();
        ctx!.fill();
      }
    }

    function drawStarDust(time: number) {
      for (const s of stars) {
        s.y += s.speedY;
        s.x += s.drift;
        s.twinkle += s.twinkleSpeed;

        // Reset when falling off screen
        if (s.y > canvas!.height + 5) {
          s.y = -5;
          s.x = Math.random() * canvas!.width;
        }
        if (s.x < -5) s.x = canvas!.width + 5;
        if (s.x > canvas!.width + 5) s.x = -5;

        const twinkleAlpha = (Math.sin(s.twinkle) + 1) / 2;
        const alpha = s.opacity * (0.3 + twinkleAlpha * 0.7);

        // Star cross shape
        ctx!.fillStyle = `rgba(220, 210, 255, ${alpha})`;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx!.fill();

        // Tiny glow
        const glow = ctx!.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3);
        glow.addColorStop(0, `rgba(200, 190, 255, ${alpha * 0.5})`);
        glow.addColorStop(1, 'rgba(200, 190, 255, 0)');
        ctx!.fillStyle = glow;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function animate(time: number) {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      drawAurora(time);
      drawFireflies(time);
      drawStarDust(time);
      animationId = requestAnimationFrame(animate);
    }

    resize();
    initParticles();
    animationId = requestAnimationFrame(animate);

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      aria-hidden="true"
    />
  );
}
