'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface FreeFlyControllerProps {
  enabled: boolean;
  writing: boolean;
}

export function FreeFlyController({ enabled, writing }: FreeFlyControllerProps) {
  const { camera, gl } = useThree();
  const cameraRef = useRef(camera);
  const keys = useRef(new Set<string>());
  const yaw = useRef(Math.PI);
  const pitch = useRef(-0.055);
  const focus = useRef(0);
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const vertical = useRef(new THREE.Vector3(0, 1, 0));

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === 'TEXTAREA' || target?.tagName === 'INPUT';
      if (isTyping) return;
      keys.current.add(event.code);
      if (enabled && ['Space', 'ControlLeft', 'ControlRight'].includes(event.code)) event.preventDefault();
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.code);
    const mouseMove = (event: MouseEvent) => {
      if (!enabled || writing || document.pointerLockElement !== gl.domElement) return;
      yaw.current -= event.movementX * 0.00155;
      pitch.current = THREE.MathUtils.clamp(pitch.current - event.movementY * 0.00125, -1.42, 1.42);
    };
    const pointerDown = (event: PointerEvent) => {
      if (!enabled || writing) return;
      lastPointer.current = { x: event.clientX, y: event.clientY };
      if (event.pointerType === 'mouse') {
        void gl.domElement.requestPointerLock?.().catch(() => undefined);
      } else {
        dragging.current = true;
      }
    };
    const pointerMove = (event: PointerEvent) => {
      if (!dragging.current || !enabled || writing) return;
      yaw.current -= (event.clientX - lastPointer.current.x) * 0.004;
      pitch.current = THREE.MathUtils.clamp(pitch.current - (event.clientY - lastPointer.current.y) * 0.003, -1.42, 1.42);
      lastPointer.current = { x: event.clientX, y: event.clientY };
    };
    const pointerUp = () => { dragging.current = false; };
    const pointerLockChange = () => {
      if (document.pointerLockElement !== gl.domElement) keys.current.clear();
    };

    window.addEventListener('keydown', down, { passive: false });
    window.addEventListener('keyup', up);
    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('pointerlockchange', pointerLockChange);
    gl.domElement.addEventListener('pointerdown', pointerDown);
    gl.domElement.addEventListener('pointermove', pointerMove);
    window.addEventListener('pointerup', pointerUp);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('pointerlockchange', pointerLockChange);
      gl.domElement.removeEventListener('pointerdown', pointerDown);
      gl.domElement.removeEventListener('pointermove', pointerMove);
      window.removeEventListener('pointerup', pointerUp);
    };
  }, [enabled, gl.domElement, writing]);

  useFrame((_, delta) => {
    const activeCamera = cameraRef.current;
    focus.current = THREE.MathUtils.damp(focus.current, writing ? 1 : 0, 3.4, delta);

    const forwardInput = Number(keys.current.has('KeyW')) - Number(keys.current.has('KeyS'));
    const sideInput = Number(keys.current.has('KeyD')) - Number(keys.current.has('KeyA'));
    const riseInput = Number(keys.current.has('Space'))
      - Number(keys.current.has('ControlLeft') || keys.current.has('ControlRight'));
    const boost = keys.current.has('ShiftLeft') || keys.current.has('ShiftRight');

    const targetDirection = direction.current.set(0, 0, 0);
    forward.current.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    right.current.set(Math.cos(yaw.current), 0, -Math.sin(yaw.current));
    targetDirection.addScaledVector(forward.current, forwardInput);
    targetDirection.addScaledVector(right.current, sideInput);
    targetDirection.addScaledVector(vertical.current, riseInput);
    if (targetDirection.lengthSq() > 1) targetDirection.normalize();

    const speed = boost ? 13.5 : 5.2;
    targetDirection.multiplyScalar(speed);
    velocity.current.lerp(targetDirection, 1 - Math.exp(-8.5 * delta));
    if (!enabled || writing) velocity.current.multiplyScalar(Math.exp(-10 * delta));

    activeCamera.position.addScaledVector(velocity.current, delta);
    activeCamera.position.x = THREE.MathUtils.clamp(activeCamera.position.x, -150, 76);
    activeCamera.position.y = THREE.MathUtils.clamp(activeCamera.position.y, -8, 72);
    activeCamera.position.z = THREE.MathUtils.clamp(activeCamera.position.z, -94, 260);

    const appliedPitch = THREE.MathUtils.lerp(pitch.current, -0.42, focus.current);
    activeCamera.quaternion.setFromEuler(new THREE.Euler(appliedPitch, yaw.current, 0, 'YXZ'));
  });

  return null;
}
