'use client';

import { useEffect, useRef } from 'react';

const CELL_SIZE = 4;

export function LoadingRipples({ visible }: { visible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const surface = document.createElement('canvas');
    const surfaceContext = surface.getContext('2d');
    if (!surfaceContext) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 1;
    let height = 1;
    let columns = 2;
    let rows = 2;
    let current = new Float32Array(4);
    let previous = new Float32Array(4);
    let pixels = surfaceContext.createImageData(2, 2);
    let animationFrame = 0;
    let lastDrop = 0;
    let lastPointerWave = 0;
    let pointerX = -1;
    let pointerY = -1;

    const inject = (x: number, y: number, strength = 34, radius = 3) => {
      const centerX = Math.round((x / width) * columns);
      const centerY = Math.round((y / height) * rows);
      for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
        for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
          const gridX = centerX + offsetX;
          const gridY = centerY + offsetY;
          if (gridX < 2 || gridX >= columns - 2 || gridY < 2 || gridY >= rows - 2) continue;
          const distance = Math.hypot(offsetX, offsetY);
          if (distance > radius) continue;
          current[gridY * columns + gridX] += strength * (1 - distance / (radius + 0.4));
        }
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      columns = Math.max(64, Math.ceil(width / CELL_SIZE));
      rows = Math.max(40, Math.ceil(height / CELL_SIZE));
      surface.width = columns;
      surface.height = rows;
      current = new Float32Array(columns * rows);
      previous = new Float32Array(columns * rows);
      pixels = surfaceContext.createImageData(columns, rows);

      for (let i = 0; i < (reduceMotion ? 2 : 5); i += 1) {
        inject(Math.random() * width, Math.random() * height, 7 + Math.random() * 9, 1 + Math.round(Math.random()));
      }
    };

    const pointerWave = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointerX = event.clientX - bounds.left;
      pointerY = event.clientY - bounds.top;
      const now = performance.now();
      if (now - lastPointerWave > 34) {
        inject(pointerX, pointerY, event.pressure > 0.35 ? 16 : 9, 2);
        lastPointerWave = now;
      }
    };

    const pointerDown = (event: PointerEvent) => {
      pointerWave(event);
      inject(pointerX, pointerY, 24, 3);
    };

    const animate = (time: number) => {
      const damping = reduceMotion ? 0.978 : 0.988;
      for (let y = 1; y < rows - 1; y += 1) {
        const row = y * columns;
        for (let x = 1; x < columns - 1; x += 1) {
          const index = row + x;
          previous[index] = (
            (current[index - 1] + current[index + 1] + current[index - columns] + current[index + columns]) * 0.5
            - previous[index]
          ) * damping;
        }
      }
      [current, previous] = [previous, current];

      if (time - lastDrop > (reduceMotion ? 1050 : 430)) {
        inject(
          width * (0.08 + Math.random() * 0.84),
          height * (0.1 + Math.random() * 0.8),
          8 + Math.random() * 10,
          1 + Math.round(Math.random()),
        );
        lastDrop = time;
      }

      const data = pixels.data;
      for (let y = 1; y < rows - 1; y += 1) {
        const row = y * columns;
        for (let x = 1; x < columns - 1; x += 1) {
          const index = row + x;
          const horizontal = current[index - 1] - current[index + 1];
          const vertical = current[index - columns] - current[index + columns];
          const velocity = current[index] - previous[index];
          const energy = Math.min(1, (Math.abs(horizontal) + Math.abs(vertical)) * 0.095 + Math.abs(velocity) * 0.055);
          const glow = Math.round(255 * energy);
          const pixel = index * 4;
          data[pixel] = Math.round(glow * 0.83);
          data[pixel + 1] = Math.round(glow * 0.92);
          data[pixel + 2] = glow;
          data[pixel + 3] = 255;
        }
      }

      surfaceContext.putImageData(pixels, 0, 0);
      context.clearRect(0, 0, width, height);
      context.imageSmoothingEnabled = true;
      context.drawImage(surface, 0, 0, width, height);
      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('pointermove', pointerWave);
    canvas.addEventListener('pointerdown', pointerDown);
    animationFrame = window.requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', pointerWave);
      canvas.removeEventListener('pointerdown', pointerDown);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [visible]);

  return (
    <div className="loading-ripple-stage">
      <canvas ref={canvasRef} className="loading-ripples-canvas" aria-hidden="true" />
      <div className="loading-guide">
        <header className="loading-topline">
          <p>ECHO / FIELD NOTE<small>回声 / 进入提示</small></p>
          <span>SCENE / 01</span>
        </header>

        <div className="loading-center">
          <h2>LOADING</h2>
          <p>THE SHORE IS COMING INTO VIEW <small>/ 海岸正在显现</small></p>
        </div>

        <div className="loading-instruction">
          <p className="loading-kicker">LEAVE YOUR ECHO. <span>/ 留下你的回声</span></p>
          <p className="loading-deck">
            PRESS E WHEN YOU ARE READY. YOUR WORDS WILL WAIT HERE FOR A STRANGER.
          </p>
          <p className="loading-deck-zh">准备好时按下 E，留下一句话，等待陌生人遇见。</p>
        </div>

        <div className="loading-controls" aria-label="操作方式">
          <p><b>01</b><span>LOOK<small>CLICK + MOUSE / 环顾</small></span></p>
          <p><b>02</b><span>MOVE<small>W A S D / 移动</small></span></p>
          <p><b>03</b><span>HEIGHT<small>SPACE + CTRL / 升降</small></span></p>
          <p><b>04</b><span>LEAVE AN ECHO<small>PRESS E / 留下回声</small></span></p>
        </div>

        <p className="loading-ripple-note">
          MOVE THE CURSOR TO DISTURB THE WATER
          <small>移动鼠标，触碰水面</small>
        </p>
      </div>
    </div>
  );
}
