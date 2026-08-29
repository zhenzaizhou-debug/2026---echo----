'use client';

import { extend, useThree } from '@react-three/fiber';
import {
  SparkRenderer as SparkRendererClass,
  SplatFileType,
  SplatMesh as SplatMeshClass,
  type SplatMesh as SparkSplatMesh,
} from '@sparkjsdev/spark';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BEACH_POSITION, BEACH_ROTATION, BEACH_SCALE } from '@/lib/beach-transform';

const SparkRenderer = extend(SparkRendererClass);
const SplatMesh = extend(SplatMeshClass);

const SPLAT_PARTS = [
  '/scene/echo-beach.spz.part0',
  '/scene/echo-beach.spz.part1',
  '/scene/echo-beach.spz.part2',
  '/scene/echo-beach.spz.part3',
];
const SPLAT_BYTES = 62_719_204;

interface GaussianBeachProps {
  active: boolean;
  onProgress: (value: number) => void;
  onReady: () => void;
  onError: () => void;
}

async function fetchPart(url: string, index: number, progress: number[], signal: AbortSignal) {
  const response = await fetch(url, { signal, cache: 'force-cache' });
  if (!response.ok) throw new Error(`Unable to load splat part ${index}`);
  if (!response.body) return new Uint8Array(await response.arrayBuffer());

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.byteLength;
    progress[index] = size;
  }

  const joined = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return joined;
}

export function GaussianBeach({ active, onProgress, onReady, onError }: GaussianBeachProps) {
  const renderer = useThree((state) => state.gl);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const meshRef = useRef<SparkSplatMesh>(null);

  useEffect(() => {
    if (!active || bytes) return;
    const controller = new AbortController();
    const partProgress = SPLAT_PARTS.map(() => 0);
    let progressFrame = 0;

    const report = () => {
      const loaded = partProgress.reduce((total, value) => total + value, 0);
      onProgress(Math.min(0.84, (loaded / SPLAT_BYTES) * 0.84));
      progressFrame = requestAnimationFrame(report);
    };
    progressFrame = requestAnimationFrame(report);

    void Promise.all(
      SPLAT_PARTS.map((url, index) => fetchPart(url, index, partProgress, controller.signal)),
    )
      .then((parts) => {
        if (controller.signal.aborted) return;
        const joined = new Uint8Array(SPLAT_BYTES);
        let offset = 0;
        for (const part of parts) {
          joined.set(part, offset);
          offset += part.byteLength;
        }
        if (offset !== SPLAT_BYTES) throw new Error('Incomplete splat download');
        onProgress(0.86);
        setBytes(joined);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        onError();
      })
      .finally(() => cancelAnimationFrame(progressFrame));

    return () => {
      controller.abort();
      cancelAnimationFrame(progressFrame);
    };
  }, [active, bytes, onError, onProgress]);

  useEffect(() => () => meshRef.current?.dispose(), []);

  const sparkRendererArgs = useMemo(
    () => ({
      renderer,
      enableLod: true,
      lodSplatScale: 0.82,
      lodRenderScale: 1.35,
      maxPixelRadius: 360,
      focalAdjustment: 1.15,
    }),
    [renderer],
  );

  const splatArgs = useMemo(
    () => bytes
      ? ({
          fileBytes: bytes,
          fileType: SplatFileType.SPZ,
          fileName: 'echo-beach.spz',
          lod: true,
          onProgress: (event: ProgressEvent) => {
            const parse = event.total > 0 ? event.loaded / event.total : 0.5;
            onProgress(0.86 + Math.min(0.13, parse * 0.13));
          },
          onLoad: () => {
            onProgress(1);
            onReady();
          },
        })
      : null,
    [bytes, onProgress, onReady],
  );

  if (!active || !splatArgs) return null;

  return (
    <SparkRenderer args={[sparkRendererArgs]}>
      <group
        position={BEACH_POSITION}
        rotation={BEACH_ROTATION}
        scale={BEACH_SCALE}
      >
        <SplatMesh ref={meshRef} args={[splatArgs]} />
      </group>
    </SparkRenderer>
  );
}
