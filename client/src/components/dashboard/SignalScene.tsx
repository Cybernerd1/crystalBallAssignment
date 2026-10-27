import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useTheme } from '../../hooks/useTheme';

gsap.registerPlugin(ScrollTrigger);

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Points || child instanceof THREE.Line) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose());
      else child.material.dispose();
    }
  });
}

function createParticleField(count: number) {
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const radius = 2.2 + Math.random() * 1.9;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = radius * Math.cos(phi);
    positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geometry;
}

/** A small data-orbit sculpture: quiet at rest, responsive to the workspace scroll. */
export default function SignalScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { buttonColor } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const accent = new THREE.Color(buttonColor);
    const ink = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim());
    const sculpture = new THREE.Group();
    const core = new THREE.Group();
    sculpture.add(core);
    scene.add(sculpture);

    const wireMaterial = new THREE.MeshBasicMaterial({
      color: accent,
      wireframe: true,
      transparent: true,
      opacity: 0.76,
    });
    const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.48, 2), wireMaterial);
    core.add(wire);

    const innerMaterial = new THREE.MeshBasicMaterial({
      color: ink,
      transparent: true,
      opacity: 0.055,
    });
    core.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.18, 2), innerMaterial));

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.24,
    });
    const ringOne = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.009, 8, 160), ringMaterial);
    ringOne.rotation.set(0.9, 0.25, 0.3);
    core.add(ringOne);
    const ringTwo = new THREE.Mesh(new THREE.TorusGeometry(1.82, 0.006, 8, 160), ringMaterial.clone());
    ringTwo.rotation.set(-0.25, 0.8, -0.4);
    core.add(ringTwo);

    const particles = new THREE.Points(
      createParticleField(180),
      new THREE.PointsMaterial({ color: accent, size: 0.025, transparent: true, opacity: 0.58 }),
    );
    sculpture.add(particles);

    const resize = () => {
      const { width, height } = root.getBoundingClientRect();
      const aspect = Math.max(width, 1) / Math.max(height, 1);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(Math.max(width, 1), Math.max(height, 1), false);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(root);

    const render = () => renderer.render(scene, camera);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) gsap.ticker.add(render);
    else render();

    const scroller = root.closest('.app__content') ?? undefined;
    const context = gsap.context(() => {
      if (reduceMotion) return;
      gsap.fromTo(
        root.querySelectorAll('[data-scene-label]'),
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.12, ease: 'power3.out', delay: 0.18 },
      );
      gsap.to(sculpture.rotation, {
        x: 0.38,
        y: Math.PI * 1.1,
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top 85%',
          end: 'bottom 20%',
          scrub: 1.4,
        },
      });
      gsap.to(core.position, {
        y: -0.36,
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      });
    }, root);

    const ambient = reduceMotion
      ? null
      : gsap.to(sculpture.rotation, {
          z: Math.PI * 2,
          duration: 28,
          repeat: -1,
          ease: 'none',
        });

    return () => {
      context.revert();
      ambient?.kill();
      gsap.ticker.remove(render);
      observer.disconnect();
      disposeObject(scene);
      renderer.dispose();
    };
  }, [buttonColor]);

  return (
    <div className="signal-scene" ref={rootRef} aria-hidden="true">
      <canvas ref={canvasRef} className="signal-scene__canvas" />
      <div className="signal-scene__grid" />
      <div className="signal-scene__label signal-scene__label--top" data-scene-label>
        <span className="signal-scene__dot" />
        live signal
      </div>
      <div className="signal-scene__label signal-scene__label--side" data-scene-label>
        <span>03</span>
        layers
      </div>
      <div className="signal-scene__caption" data-scene-label>
        <span className="mono">FORMA / SIGNAL_01</span>
        <span>People, in focus.</span>
      </div>
    </div>
  );
}
