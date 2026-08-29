'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { LOCAL_ECHOES } from '@/data/local-echoes';
import { BEACH_POSITION, BEACH_ROTATION, BEACH_SCALE } from '@/lib/beach-transform';
import type { LocalEcho } from '@/types/echo';
import { GaussianBeach } from './GaussianBeach';
import { Ocean, FoamLines } from './Ocean';
import { FreeFlyController } from './PlayerController';
import { SandEcho } from './SandEcho';

interface BeachSceneProps {
  entered: boolean;
  explorationEnabled: boolean;
  writing: boolean;
  splatReady: boolean;
  onSplatProgress: (value: number) => void;
  onSplatReady: () => void;
  onSplatError: () => void;
}

function projectEchoes(collider: THREE.Object3D) {
  collider.updateMatrixWorld(true);
  const raycaster = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);
  const transform = new THREE.Matrix4().compose(
    new THREE.Vector3(...BEACH_POSITION),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...BEACH_ROTATION)),
    new THREE.Vector3(BEACH_SCALE, BEACH_SCALE, BEACH_SCALE),
  );
  return LOCAL_ECHOES.map((echo): LocalEcho => {
    const worldPosition = new THREE.Vector3(...echo.position).applyMatrix4(transform);
    raycaster.set(new THREE.Vector3(worldPosition.x, 480, worldPosition.z), down);
    const ground = raycaster.intersectObject(collider, true)[0];
    if (!ground) return echo;
    return { ...echo, position: [worldPosition.x, ground.point.y + 0.065, worldPosition.z] };
  });
}

function EchoField({ collider }: { collider: THREE.Object3D }) {
  const { camera } = useThree();
  const echoes = useMemo(() => projectEchoes(collider), [collider]);
  const [nearby, setNearby] = useState<LocalEcho[]>([]);
  const sample = useRef(-1);
  const signature = useRef('');

  useFrame((state) => {
    const tick = Math.floor(state.clock.elapsedTime * 2);
    if (tick === sample.current) return;
    sample.current = tick;
    const next = echoes.filter((echo) => {
      const dx = camera.position.x - echo.position[0];
      const dz = camera.position.z - echo.position[2];
      return dx * dx + dz * dz < 42 * 42;
    });
    const nextSignature = next.map((echo) => echo.id).join('|');
    if (nextSignature !== signature.current) {
      signature.current = nextSignature;
      setNearby(next);
    }
  });

  return nearby.map((echo) => <SandEcho key={echo.id} echo={echo} />);
}

function PalmSilhouette() {
  return (
    <group position={[23, 0, -48]} rotation={[0, 0, -0.19]}>
      <mesh position={[0, 4.5, 0]} rotation={[0, 0, -0.1]}>
        <cylinderGeometry args={[0.16, 0.34, 9, 7]} />
        <meshStandardMaterial color="#2b2925" roughness={1} />
      </mesh>
      <group position={[-0.4, 9, 0]}>
        {Array.from({ length: 9 }).map((_, index) => (
          <mesh key={index} rotation={[0.15 + (index % 2) * 0.25, index * 0.7, -0.8]}>
            <planeGeometry args={[0.55, 5]} />
            <meshStandardMaterial color="#292b25" side={THREE.DoubleSide} roughness={1} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function FallbackEnvironment() {
  return (
    <>
      <fog attach="fog" args={['#b96d52', 22, 112]} />
      <ambientLight intensity={1.25} color="#ffc18a" />
      <directionalLight position={[-24, 18, -35]} intensity={3.1} color="#ffb36d" />
      <directionalLight position={[18, 9, 5]} intensity={0.65} color="#6aa1af" />

      <mesh position={[25, -0.4, -33]} rotation={[-Math.PI / 2, 0, -0.035]}>
        <planeGeometry args={[68, 190, 40, 70]} />
        <meshStandardMaterial color="#9b623a" roughness={1} metalness={0} />
      </mesh>
      <Ocean />
      <FoamLines />

      <mesh position={[-25, 7.8, -82]}>
        <sphereGeometry args={[5.2, 48, 48]} />
        <meshBasicMaterial color="#ffbd73" fog={false} />
      </mesh>
      <mesh position={[-25, 7.8, -83]} scale={[3.4, 0.34, 1]}>
        <sphereGeometry args={[5.2, 32, 16]} />
        <meshBasicMaterial color="#f7a96e" transparent opacity={0.14} fog={false} />
      </mesh>

      <group position={[19, 0, -74]}>
        <mesh position={[0, 1.5, 0]} scale={[17, 3.2, 5]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#463a35" roughness={1} />
        </mesh>
        <mesh position={[16, 0.8, -3]} scale={[22, 2.1, 6]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#55443a" roughness={1} />
        </mesh>
      </group>

      {[
        [7, 0.2, -13, 0.7],
        [12, 0.35, -25, 1.1],
        [2, 0.22, -42, 0.8],
        [13, 0.16, -66, 0.6],
      ].map(([x, y, z, scale], index) => (
        <mesh key={index} position={[x, y, z]} rotation={[0.2, index * 0.9, -0.1]} scale={scale}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#4e4137" roughness={1} />
        </mesh>
      ))}
      <PalmSilhouette />
    </>
  );
}

export function BeachScene({
  entered,
  explorationEnabled,
  writing,
  splatReady,
  onSplatProgress,
  onSplatReady,
  onSplatError,
}: BeachSceneProps) {
  const { scene: colliderSource } = useGLTF('/scene/echo-beach-collider.glb');
  const collider = useMemo(() => {
    const aligned = colliderSource.clone(true);
    aligned.position.set(...BEACH_POSITION);
    aligned.rotation.set(...BEACH_ROTATION);
    aligned.scale.setScalar(BEACH_SCALE);
    aligned.updateMatrixWorld(true);
    return aligned;
  }, [colliderSource]);

  return (
    <>
      <color attach="background" args={['#120d0a']} />
      {!splatReady && <FallbackEnvironment />}

      <GaussianBeach
        active={entered}
        onProgress={onSplatProgress}
        onReady={onSplatReady}
        onError={onSplatError}
      />

      <primitive object={collider} visible={false} />
      <EchoField collider={collider} />
      <FreeFlyController
        enabled={explorationEnabled}
        writing={writing}
      />
    </>
  );
}

useGLTF.preload('/scene/echo-beach-collider.glb');
