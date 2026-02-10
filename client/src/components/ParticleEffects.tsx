import { useEffect, useRef } from 'react';

// --- Ancient Rune fragments ---
interface Rune {
  x: number;
  y: number;
  char: string;
  size: number;
  speedY: number;
  drift: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
}

// --- Gold Leaf (金箔) ---
interface GoldLeaf {
  x: number;
  y: number;
  width: number;
  height: number;
  speedY: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmp: number;
  rotation: number;
  rotationSpeed: number;
  tiltPhase: number;
  tiltSpeed: number;
  opacity: number;
  hue: number; // gold tone variation
}

// Rune-like characters: magic circle arcs, alchemical symbols, musical symbols
const RUNE_CHARS = [
  '☽', '✦', '⊕', '⟡', '◇', '△', '⏣', '⎔',
  '♮', '𝄞', '⁂', '✧', '⟐', '◈', '⌘', '⏧',
  '᛭', 'ᚦ', 'ᚱ', 'ᛊ', 'ᚨ', 'ᛉ', 'ᚹ', 'ᛏ',
];

/**
 * Full-page particle effects overlay:
 * - Ancient rune/magic circle fragments falling slowly
 * - Gold leaf (金箔) fluttering down with rotation and sway
 */
export function ParticleEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let runes: Rune[] = [];
    let leaves: GoldLeaf[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function initParticles() {
      const area = canvas!.width * canvas!.height;
      const runeCount = Math.min(Math.floor(area / 40000), 30);
      const leafCount = Math.min(Math.floor(area / 35000), 25);

      // Ancient runes
      runes = Array.from({ length: runeCount }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        char: RUNE_CHARS[Math.floor(Math.random() * RUNE_CHARS.length)],
        size: Math.random() * 14 + 10,
        speedY: Math.random() * 0.25 + 0.08,
        drift: (Math.random() - 0.5) * 0.15,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.005,
        opacity: Math.random() * 0.15 + 0.05,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.015 + 0.005,
      }));

      // Gold leaves
      leaves = Array.from({ length: leafCount }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        width: Math.random() * 8 + 4,
        height: Math.random() * 5 + 3,
        speedY: Math.random() * 0.35 + 0.15,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.01 + 0.005,
        swayAmp: Math.random() * 40 + 20,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        tiltPhase: Math.random() * Math.PI * 2,
        tiltSpeed: Math.random() * 0.02 + 0.01,
        opacity: Math.random() * 0.4 + 0.15,
        hue: Math.random() * 15 + 38, // 38-53 range (gold tones)
      }));
    }

    function drawRunes(time: number) {
      for (const r of runes) {
        r.y += r.speedY;
        r.x += r.drift;
        r.rotation += r.rotationSpeed;
        r.pulse += r.pulseSpeed;

        // Reset when off screen
        if (r.y > canvas!.height + 30) {
          r.y = -30;
          r.x = Math.random() * canvas!.width;
          r.char = RUNE_CHARS[Math.floor(Math.random() * RUNE_CHARS.length)];
        }
        if (r.x < -30) r.x = canvas!.width + 30;
        if (r.x > canvas!.width + 30) r.x = -30;

        const glow = (Math.sin(r.pulse) + 1) / 2;
        const alpha = r.opacity * (0.5 + glow * 0.5);

        ctx!.save();
        ctx!.translate(r.x, r.y);
        ctx!.rotate(r.rotation);

        // Outer glow
        ctx!.shadowColor = `rgba(212, 175, 55, ${alpha * 0.8})`;
        ctx!.shadowBlur = 15;

        // Rune character
        ctx!.font = `${r.size}px serif`;
        ctx!.textAlign = 'center';
        ctx!.textBaseline = 'middle';
        ctx!.fillStyle = `rgba(212, 175, 55, ${alpha})`;
        ctx!.fillText(r.char, 0, 0);

        ctx!.restore();
      }
    }

    function drawGoldLeaves(time: number) {
      for (const leaf of leaves) {
        leaf.y += leaf.speedY;
        leaf.swayPhase += leaf.swaySpeed;
        leaf.rotation += leaf.rotationSpeed;
        leaf.tiltPhase += leaf.tiltSpeed;

        const swayX = Math.sin(leaf.swayPhase) * leaf.swayAmp * 0.02;
        leaf.x += swayX;

        // Reset when off screen
        if (leaf.y > canvas!.height + 20) {
          leaf.y = -20;
          leaf.x = Math.random() * canvas!.width;
        }
        if (leaf.x < -20) leaf.x = canvas!.width + 20;
        if (leaf.x > canvas!.width + 20) leaf.x = -20;

        // 3D-like tilt effect: scale width based on sine
        const tilt = Math.sin(leaf.tiltPhase);
        const displayWidth = leaf.width * Math.abs(tilt);
        const alpha = leaf.opacity * (0.6 + Math.abs(tilt) * 0.4);

        ctx!.save();
        ctx!.translate(leaf.x, leaf.y);
        ctx!.rotate(leaf.rotation);

        // Gold leaf shape (irregular quadrilateral)
        const hw = displayWidth / 2;
        const hh = leaf.height / 2;

        // Gradient for metallic look
        const grad = ctx!.createLinearGradient(-hw, -hh, hw, hh);
        grad.addColorStop(0, `hsla(${leaf.hue}, 75%, 55%, ${alpha})`);
        grad.addColorStop(0.4, `hsla(${leaf.hue + 5}, 85%, 70%, ${alpha * 1.2})`);
        grad.addColorStop(0.6, `hsla(${leaf.hue - 3}, 70%, 50%, ${alpha})`);
        grad.addColorStop(1, `hsla(${leaf.hue + 8}, 80%, 60%, ${alpha * 0.8})`);

        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.moveTo(-hw * 0.3, -hh);
        ctx!.quadraticCurveTo(hw * 0.8, -hh * 0.6, hw, 0);
        ctx!.quadraticCurveTo(hw * 0.7, hh * 0.8, 0, hh);
        ctx!.quadraticCurveTo(-hw * 0.9, hh * 0.5, -hw, -hh * 0.2);
        ctx!.closePath();
        ctx!.fill();

        // Subtle shine highlight
        ctx!.fillStyle = `rgba(255, 245, 200, ${alpha * 0.3})`;
        ctx!.beginPath();
        ctx!.ellipse(hw * 0.2, -hh * 0.2, hw * 0.3, hh * 0.25, 0.3, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.restore();
      }
    }

    function animate(time: number) {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      drawRunes(time);
      drawGoldLeaves(time);
      animationId = requestAnimationFrame(animate);
    }

    resize();
    initParticles();
    animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      resize();
      initParticles();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
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
