// src/components/Fireflies.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Fireflies = ({
  count = 150,              // Increased number of fireflies
  color = 0xffeeaa,         // Warm yellowish glow
  size = 0.002,               // Larger visible size
  speed = 0.5,              // Movement speed
  spread = 40,              // How widely they spread
}: {
  count?: number;
  color?: number;
  size?: number;
  speed?: number;
  spread?: number;
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // Transparent

    const camera = new THREE.PerspectiveCamera(
      40,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 20; // Slightly farther for better view

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // Fireflies (instanced points)
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const offsets = new Float32Array(count * 3); // For individual movement

    for (let i = 0; i < count; i++) {
      // Random starting position
      positions[i * 3] = (Math.random() - 0.2) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.2) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.2) * spread;

      // Random offset for sine wave movement
      offsets[i * 3] = Math.random() * Math.PI * 2;
      offsets[i * 3 + 1] = Math.random() * Math.PI * 2;
      offsets[i * 3 + 2] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('offset', new THREE.BufferAttribute(offsets, 3));

    const material = new THREE.PointsMaterial({
      size,
      color,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Animation loop
    let time = 0;
    const animate = () => {
      time += 0.016; // ~60fps delta

      const positionsAttr = geometry.attributes.position as THREE.BufferAttribute;

      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const iy = ix + 1;
        const iz = ix + 2;

        const offsetX = offsets[ix];
        const offsetY = offsets[iy];
        const offsetZ = offsets[iz];

        // Gentle sine-wave floating
        positionsAttr.array[ix] += Math.sin(time + offsetX) * speed * 0.09;
        positionsAttr.array[iy] += Math.cos(time + offsetY) * speed * 0.009;
        positionsAttr.array[iz] += Math.sin(time + offsetZ) * speed * 0.009;

        // Soft boundary bounce (keep them in view)
        if (Math.abs(positionsAttr.array[ix]) > spread) positionsAttr.array[ix] *= -0.98;
        if (Math.abs(positionsAttr.array[iy]) > spread) positionsAttr.array[iy] *= -0.98;
        if (Math.abs(positionsAttr.array[iz]) > spread / 2) positionsAttr.array[iz] *= -0.98;
      }

      positionsAttr.needsUpdate = true;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [count, color, size, speed, spread]);

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none" />;
};

export default Fireflies;