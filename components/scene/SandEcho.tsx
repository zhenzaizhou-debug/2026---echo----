'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { LocalEcho } from '@/types/echo';

function makeEchoTexture(echo: LocalEcho) {
  if (typeof document === 'undefined') return new THREE.Texture();
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 220;
  const context = canvas.getContext('2d');
  if (!context) return new THREE.CanvasTexture(canvas);

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = '400 62px "Long Cang", "STKaiti", "KaiTi", cursive';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.lineWidth = 1.25;
  context.strokeStyle = `rgba(240, 173, 108, ${0.2 - echo.fade * 0.08})`;
  context.strokeText(echo.content, canvas.width / 2 + 1.2, 117.5);
  context.fillStyle = `rgba(35, 22, 17, ${0.96 - echo.fade * 0.24})`;
  context.shadowColor = 'rgba(255, 220, 174, .32)';
  context.shadowOffsetY = 1.9;
  context.fillText(echo.content, canvas.width / 2, 116);

  // Deterministic-looking broken patches suggest tide erosion without a fluid sim.
  const cuts = Math.round(echo.fade * 15);
  context.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < cuts; i += 1) {
    const seed = (i * 97 + echo.id.charCodeAt(echo.id.length - 1) * 31) % 997;
    const x = 100 + (seed * 43) % 1040;
    const y = 82 + (seed * 17) % 62;
    const width = 14 + (seed % 52);
    context.fillStyle = `rgba(0,0,0,${0.28 + echo.fade * 0.6})`;
    context.fillRect(x, y, width, 4 + (seed % 10));
  }
  context.globalCompositeOperation = 'source-over';

  if (echo.era) {
    context.font = '400 22px Georgia, serif';
    context.letterSpacing = '6px';
    context.fillStyle = 'rgba(62, 39, 28, .48)';
    context.fillText(echo.era, canvas.width / 2, 188);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function SandEcho({ echo }: { echo: LocalEcho }) {
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const { camera } = useThree();
  const [texture, setTexture] = useState<THREE.Texture>(() => makeEchoTexture(echo));

  useEffect(() => {
    let cancelled = false;
    void document.fonts.load('62px "Long Cang"').then(() => {
      if (cancelled) return;
      const next = makeEchoTexture(echo);
      setTexture((previous) => {
        previous.dispose();
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [echo]);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(() => {
    if (!material.current) return;
    const dx = camera.position.x - echo.position[0];
    const dz = camera.position.z - echo.position[2];
    const distance = Math.sqrt(dx * dx + dz * dz);
    const nearFade = THREE.MathUtils.smoothstep(distance, 0.7, 2.4);
    const farFade = 1 - THREE.MathUtils.smoothstep(distance, 30, 40);
    material.current.opacity = Math.max(0, nearFade * farFade * (0.96 - echo.fade * 0.3));
  });

  return (
    <mesh position={echo.position} rotation={[-Math.PI / 2, 0, echo.rotation]} renderOrder={24}>
      <planeGeometry args={[12.8, 2.18]} />
      <meshBasicMaterial
        ref={material}
        map={texture}
        transparent
        depthTest={false}
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
        opacity={0}
      />
    </mesh>
  );
}
