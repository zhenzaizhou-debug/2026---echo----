'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export function Ocean() {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWarm: { value: new THREE.Color('#cc754a') },
      uCold: { value: new THREE.Color('#183e52') },
    }),
    [],
  );

  useFrame((state) => {
    if (material.current) material.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh position={[-36, -0.18, -34]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[72, 190, 72, 100]} />
      <shaderMaterial
        ref={material}
        transparent
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          varying float vWave;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 p = position;
            float a = sin(p.y * .42 + uTime * .9) * .16;
            float b = sin(p.x * .7 - p.y * .16 + uTime * .55) * .09;
            p.z += a + b;
            vWave = a + b;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uWarm;
          uniform vec3 uCold;
          varying float vWave;
          varying vec2 vUv;
          void main() {
            float horizon = smoothstep(.08, .94, vUv.y);
            float glint = smoothstep(.10, .24, vWave) * .22;
            vec3 color = mix(uCold, uWarm, horizon * .44 + glint);
            gl_FragColor = vec4(color, .96);
          }
        `}
      />
    </mesh>
  );
}

export function FoamLines() {
  const bands = useMemo(() => {
    return [0, 1.8, 3.7].map((offset) => {
      const points: THREE.Vector3[] = [];
      for (let z = -92; z <= 40; z += 1.2) {
        const x = -1.6 - offset + Math.sin(z * 0.17 + offset) * (0.55 + offset * 0.12);
        points.push(new THREE.Vector3(x, 0.025 + offset * 0.002, z));
      }
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 138, 0.035, 3, false);
    });
  }, []);

  return (
    <group>
      {bands.map((geometry, index) => (
        <mesh key={index} geometry={geometry}>
          <meshBasicMaterial color="#f4d7b5" transparent opacity={0.58 - index * 0.11} />
        </mesh>
      ))}
    </group>
  );
}
