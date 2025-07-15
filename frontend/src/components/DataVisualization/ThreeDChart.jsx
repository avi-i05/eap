import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const vibrantColors = [
  '#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51',
  '#3a86ff', '#8338ec', '#ff006e', '#fb5607', '#ffbe0b',
  '#06d6a0', '#118ab2', '#073b4c', '#ef476f', '#ffd166',
  '#7209b7', '#4361ee', '#4cc9f0', '#f72585', '#4895ef',
  '#560bad', '#b5179e', '#f72585', '#480ca8', '#3a0ca3'
];

const ThreePieDonutChart = ({ data, chartType }) => {
  const canvasRef = useRef();
  const [initialized, setInitialized] = useState(false);
  const mouse = useRef(new THREE.Vector2());
  const raycaster = useRef(new THREE.Raycaster());
  const hoveredSegment = useRef(null);
  const labelSprites = useRef([]);
  const animationRef = useRef();
  const sceneRef = useRef();
  const rendererRef = useRef();
  const cameraRef = useRef();

  useEffect(() => {
    if (!data || !data.datasets || data.datasets.length === 0) return;

    if (canvasRef.current.children.length > 0) {
      while (canvasRef.current.firstChild) {
        canvasRef.current.removeChild(canvasRef.current.firstChild);
      }
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, 600 / 400, 1, 1000);
    camera.position.set(0, 0, 350);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    renderer.setSize(600, 400);
    renderer.setClearColor(0x000000, 0);
    canvasRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
    light1.position.set(1, 1, 1);
    scene.add(light1);
    const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
    light2.position.set(-1, -1, 0.5);
    scene.add(light2);

    const radius = 100;
    const innerRadius = chartType.includes("donut") ? 50 : 0;
    const height = 30;
    const values = data.datasets[0].data;
    const labels = data.labels;
    const total = values.reduce((sum, v) => sum + v, 0);

    const segments = [];
    let startAngle = 0;
    labelSprites.current = [];

    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      if (value <= 0) continue;

      const angle = (value / total) * Math.PI * 2;
      const endAngle = startAngle + angle;
      const midAngle = startAngle + angle / 2;

      const shape = new THREE.Shape();
      if (innerRadius > 0) {
        shape.moveTo(innerRadius * Math.cos(startAngle), innerRadius * Math.sin(startAngle));
        shape.lineTo(innerRadius * Math.cos(endAngle), innerRadius * Math.sin(endAngle));
        shape.lineTo(radius * Math.cos(endAngle), radius * Math.sin(endAngle));
        shape.lineTo(radius * Math.cos(startAngle), radius * Math.sin(startAngle));
        shape.lineTo(innerRadius * Math.cos(startAngle), innerRadius * Math.sin(startAngle));
      } else {
        shape.moveTo(0, 0);
        shape.lineTo(radius * Math.cos(startAngle), radius * Math.sin(startAngle));
        shape.lineTo(radius * Math.cos(endAngle), radius * Math.sin(endAngle));
        shape.lineTo(0, 0);
      }

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: height,
        bevelEnabled: false,
        curveSegments: 32
      });

      const color = new THREE.Color(vibrantColors[i % vibrantColors.length]);
      const material = new THREE.MeshPhongMaterial({
        color,
        side: THREE.DoubleSide,
        flatShading: true,
        specular: 0x111111,
        shininess: 30
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData = {
        index: i,
        angle: midAngle,
        originalPosition: new THREE.Vector3(0, -height / 2, 0)
      };
      mesh.rotation.x = -Math.PI / 3;
      mesh.position.copy(mesh.userData.originalPosition);
      scene.add(mesh);
      segments.push(mesh);

      const createLabel = (text, fontSize = 24, isLarge = false) => {
        const labelCanvas = document.createElement("canvas");
        labelCanvas.width = isLarge ? 400 : 300;
        labelCanvas.height = isLarge ? 120 : 60;
        const ctx = labelCanvas.getContext("2d");
        ctx.fillStyle = "#333333";

        if (isLarge) {
          ctx.font = `bold ${fontSize + 8}px Arial`;
          ctx.fillText(labels[i], 20, 40);
          ctx.font = `bold ${fontSize + 4}px Arial`;
          ctx.fillText(`${value} (${Math.round((value / total) * 100)}%)`, 20, 80);
        } else {
          ctx.font = `bold ${fontSize}px Arial`;
          ctx.fillText(`${labels[i]} (${value})`, 20, 40);
        }

        const texture = new THREE.CanvasTexture(labelCanvas);
        const spriteMaterial = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          opacity: isLarge ? 0 : 0.9
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(isLarge ? 120 : 80, isLarge ? 40 : 20, 1);
        sprite.position.set(
          (radius + 30) * Math.cos(midAngle),
          (radius + 30) * Math.sin(midAngle),
          20
        );
        scene.add(sprite);
        return sprite;
      };

      const smallLabel = createLabel(`${labels[i]} (${value})`);
      const largeLabel = createLabel(`${labels[i]}\n${value} (${Math.round((value / total) * 100)}%)`, 24, true);
      labelSprites.current.push({ small: smallLabel, large: largeLabel });

      startAngle = endAngle;
    }

    const onMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    window.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      raycaster.current.setFromCamera(mouse.current, cameraRef.current);
      const intersects = raycaster.current.intersectObjects(segments);

      if (hoveredSegment.current && (!intersects[0] || intersects[0].object !== hoveredSegment.current)) {
        hoveredSegment.current.position.copy(hoveredSegment.current.userData.originalPosition);
        labelSprites.current.forEach(({ small, large }) => {
          small.material.opacity = 0.9;
          large.material.opacity = 0;
        });
        hoveredSegment.current = null;
      }

      if (intersects.length > 0) {
        const segment = intersects[0].object;
        if (hoveredSegment.current !== segment) {
          if (hoveredSegment.current) {
            hoveredSegment.current.position.copy(hoveredSegment.current.userData.originalPosition);
          }

          const offset = 20;
          segment.position.set(
            offset * Math.cos(segment.userData.angle),
            offset * Math.sin(segment.userData.angle) - height / 2,
            0
          );
          hoveredSegment.current = segment;

          labelSprites.current.forEach(({ small, large }, idx) => {
            small.material.opacity = idx === segment.userData.index ? 0 : 0.9;
            large.material.opacity = idx === segment.userData.index ? 1 : 0;
          });
        }
      }

      renderer.render(scene, cameraRef.current);
    };

    animate();
    setInitialized(true);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
      if (sceneRef.current) {
        while (sceneRef.current.children.length > 0) {
          const object = sceneRef.current.children[0];
          if (object.geometry) object.geometry.dispose();
          if (object.material) object.material.dispose();
          sceneRef.current.remove(object);
        }
      }
    };
  }, [data, chartType]);

  if (!data) return <div className="loading-chart">Loading chart data...</div>;

  return (
    <div
      ref={canvasRef}
      className="three-d-chart"
      style={{
        display: initialized ? "block" : "none"
      }}
    />
  );
};

export default ThreePieDonutChart;
