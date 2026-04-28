import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface VortexVisualizerProps {
  isPlaying: boolean;
  analyserNode: AnalyserNode | null;
  oscillationValue: number;
  numTones: number;
  isInhale: boolean;
}

const VortexVisualizer: React.FC<VortexVisualizerProps> = ({ isPlaying, analyserNode, oscillationValue, numTones, isInhale }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const coreRef = useRef<THREE.Mesh | null>(null);
  const toneNodesRef = useRef<THREE.Group | null>(null);
  const frameId = useRef<number | null>(null);
  const dataArray = useRef<Uint8Array | null>(null);
  const mouse = useRef({ x: 0, y: 0 });

  // Setup effect
  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mountNode.clientWidth / mountNode.clientHeight, 0.1, 1000);
    camera.position.z = 100;
    scene.fog = new THREE.FogExp2(0x000104, 0.0035);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountNode.appendChild(renderer.domElement);

    // Particle Field
    const particleCount = 20000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const baseColor = new THREE.Color('#8b5cf6');

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 800;
      positions[i3 + 1] = (Math.random() - 0.5) * 400;
      positions[i3 + 2] = (Math.random() - 0.5) * 400;
      baseColor.toArray(colors, i3);
    }
    const particlesGeom = new THREE.BufferGeometry();
    particlesGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const particlesMat = new THREE.PointsMaterial({ size: 0.5, vertexColors: true, transparent: true, opacity: 0.7 });
    const particles = new THREE.Points(particlesGeom, particlesMat);
    scene.add(particles);

    // Central Core (replaces Z-axis)
    const coreGeom = new THREE.IcosahedronGeometry(10, 3);
    const coreMat = new THREE.MeshBasicMaterial({ color: '#a78bfa', wireframe: true });
    const core = new THREE.Mesh(coreGeom, coreMat);
    scene.add(core);
    
    // Tone Nodes group
    const toneNodes = new THREE.Group();
    scene.add(toneNodes);

    // Store refs
    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    particlesRef.current = particles;
    coreRef.current = core;
    toneNodesRef.current = toneNodes;

    // Handle resize
    const handleResize = () => {
      if (renderer && camera) {
        camera.aspect = mountNode.clientWidth / mountNode.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      mountNode.removeChild(renderer.domElement);
      renderer.dispose();
      frameId.current && cancelAnimationFrame(frameId.current);
    };
  }, []);

  // Update tone nodes when numTones changes
  useEffect(() => {
    const toneNodes = toneNodesRef.current;
    if (!toneNodes) return;
    
    // Clear old nodes
    while(toneNodes.children.length) {
      toneNodes.remove(toneNodes.children[0]);
    }

    // Create new nodes
    const textureLoader = new THREE.TextureLoader();
    const spriteTexture = textureLoader.load('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0icHVycGxlIi8+PC9zdmc+'); // simple dot
    for (let i = 0; i < numTones; i++) {
      const material = new THREE.SpriteMaterial({ 
        map: spriteTexture, 
        color: new THREE.Color().setHSL(0.7 + (i/numTones) * 0.2, 0.8, 0.7),
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8,
      });
      const sprite = new THREE.Sprite(material);
      const angle = (i / numTones) * Math.PI * 2;
      const radius = 40 + (i % 2) * 10;
      sprite.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, -20);
      sprite.scale.set(4,4,4);
      toneNodes.add(sprite);
    }

  }, [numTones]);


  // Animation loop effect
  useEffect(() => {
    if (analyserNode) {
      dataArray.current = new Uint8Array(analyserNode.frequencyBinCount);
    }
    
    const animate = (time: number) => {
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const particles = particlesRef.current;
      const core = coreRef.current;
      const toneNodes = toneNodesRef.current;
      
      if (!renderer || !scene || !camera || !particles || !core || !toneNodes) return;
      
      const timeSec = time * 0.001;
      let audioEnergy = 0;
      
      if (isPlaying && analyserNode && dataArray.current) {
        analyserNode.getByteFrequencyData(dataArray.current);
        const lowerHalf = dataArray.current.slice(0, dataArray.current.length / 8);
        audioEnergy = lowerHalf.reduce((acc, val) => acc + val, 0) / lowerHalf.length / 255;
      }
      
      // Update camera - smoother on landing
      const camTargetX = mouse.current.x * (isPlaying ? 20 : 40);
      const camTargetY = mouse.current.y * (isPlaying ? 20 : 40);
      camera.position.x += (camTargetX - camera.position.x) * 0.02;
      camera.position.y += (camTargetY - camera.position.y) * 0.02;
      camera.position.z = 100 - audioEnergy * 20 + Math.sin(timeSec * 0.3) * 10;
      camera.lookAt(0, 0, 0);

      // Update core - more active when idle
      core.rotation.y = timeSec * (isPlaying ? 0.1 : 0.05);
      core.rotation.x = timeSec * (isPlaying ? 0.08 : 0.04);
      const coreScale = (isPlaying ? 1.0 : 1.5) + oscillationValue * 0.3 + audioEnergy * 0.5;
      core.scale.set(coreScale, coreScale, coreScale);
      (core.material as THREE.MeshBasicMaterial).color.setHSL(0.75, 0.8, 0.5 + oscillationValue * 0.2 + (isPlaying ? 0 : 0.1));
      
      // Update particles - slow drift on landing
      particles.rotation.y = timeSec * 0.01;
      particles.rotation.z = timeSec * 0.005;
      const positions = particles.geometry.attributes.position;
      const initialPositions = (particles.geometry.userData.initialPositions ||= (positions as any).clone());

      for(let i=0; i < positions.count; i++) {
        const i3 = i * 3;
        const ix = initialPositions.getX(i);
        const iy = initialPositions.getY(i);
        const iz = initialPositions.getZ(i);
        const dispFreq = isPlaying ? 0.05 : 0.01;
        const dispAmp = isPlaying ? 10 * audioEnergy : 5;
        const displacement = Math.sin(ix * dispFreq + timeSec * 0.2) * dispAmp;
        positions.setZ(i, iz + displacement);
      }
      positions.needsUpdate = true;
      
      // Update tone nodes
      toneNodes.children.forEach((node, i) => {
        if(isPlaying && dataArray.current) {
          const bin = Math.floor((i / numTones) * (dataArray.current.length / 8));
          const energy = dataArray.current[bin] / 255;
          const scale = 4 + energy * 12;
          (node as THREE.Sprite).scale.set(scale, scale, scale);
          (node as THREE.Sprite).material.opacity = 0.5 + energy * 0.5;
        } else {
            (node as THREE.Sprite).scale.set(2, 2, 2);
            (node as THREE.Sprite).material.opacity = 0.2;
        }
      });
      
      renderer.render(scene, camera);
      frameId.current = requestAnimationFrame(animate);
    };

    frameId.current = requestAnimationFrame(animate);

    return () => {
      frameId.current && cancelAnimationFrame(frameId.current);
    };
  }, [isPlaying, analyserNode, oscillationValue, numTones, isInhale]);

  return (
    <div ref={mountRef} className="w-full h-full relative">
      {isPlaying && (
        <div className="absolute inset-x-0 top-[25%] flex items-center justify-center pointer-events-none">
          <div className={`text-purple-200/60 text-[10px] md:text-xs tracking-[0.8em] uppercase transition-all duration-[2000ms] ${isInhale ? 'scale-110 opacity-70' : 'scale-95 opacity-30'}`}>
            {isInhale ? 'Inhale' : 'Exhale'}
          </div>
        </div>
      )}
    </div>
  );
};

export default VortexVisualizer;
