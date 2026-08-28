import React, { useEffect, useRef, useState } from 'react';
import {
  RotateCcw,
  Flower2,
  ChevronUp,
  ChevronDown,
  ArrowDown,
  Zap,
  Sprout,
  Monitor
} from 'lucide-react';

interface TrellisGrowthBackgroundProps {
  opacity?: number;
  interactive?: boolean;
}

// Botanical species configuration
type PlantSpecies = 'jasmine' | 'ivy' | 'wisteria' | 'clematis';
type GrowthMode = 'scroll' | 'ambient' | 'full';

interface Leaf {
  x: number;
  y: number;
  angle: number;
  targetSize: number;
  color: string;
  stemProgress: number; // 0 to 1 along stem
  flutterOffset: number;
  isFlower?: boolean;
  flowerType?: 'single' | 'cluster';
}

interface Tendril {
  x: number;
  y: number;
  startAngle: number;
  stemProgress: number;
}

interface VineSegment {
  x: number;
  y: number;
  cp1x: number;
  cp1y: number;
  cp2x: number;
  cp2y: number;
  targetX: number;
  targetY: number;
  thickness: number;
  frontOfWood: boolean;
}

interface Branch {
  segments: VineSegment[];
  leaves: Leaf[];
  stemProgressTrigger: number;
  growthProgress: number;
  color: string;
}

interface MainVine {
  id: number;
  startX: number;
  startY: number;
  segments: VineSegment[];
  branches: Branch[];
  leaves: Leaf[];
  tendrils: Tendril[];
  growthProgress: number;
  color: string;
  barkColor: string;
  delayOffset: number;
}

interface Slat {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  type: 'diag1' | 'diag2' | 'horiz' | 'vert' | 'frame';
}

interface LatticeJoint {
  x: number;
  y: number;
}

interface AmbientSpore {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  pulseSpeed: number;
}

export const TrellisGrowthBackground: React.FC<TrellisGrowthBackgroundProps> = ({
  opacity = 0.88,
  interactive = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Settings State
  const [species, setSpecies] = useState<PlantSpecies>('jasmine');
  const [growthMode, setGrowthMode] = useState<GrowthMode>('scroll');
  const [breezeStrength, setBreezeStrength] = useState<'calm' | 'gentle' | 'breezy'>('gentle');
  const [showDesk, setShowDesk] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [growthKey, setGrowthKey] = useState<number>(0);
  const [scrollPercent, setScrollPercent] = useState<number>(0);

  // Growth & Scroll References (Start with 28% base sprout so it's immediately visible at the top)
  const scrollTargetRef = useRef<number>(0.28);
  const smoothScrollRef = useRef<number>(0.28);
  const autoProgressRef = useRef<number>(0.28);

  // Mouse tracking
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false
  });

  const regrow = () => {
    smoothScrollRef.current = 0.05;
    autoProgressRef.current = 0.05;
    scrollTargetRef.current = 0.28;
    setGrowthKey(prev => prev + 1);
  };

  // Track window scroll to calculate scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        document.body.scrollHeight - window.innerHeight,
        1
      );
      const currentScroll = window.scrollY || document.documentElement.scrollTop || 0;
      const rawRatio = Math.min(1.0, Math.max(0, currentScroll / docHeight));

      const target = 0.28 + rawRatio * 0.72;
      scrollTargetRef.current = target;
      setScrollPercent(Math.round(rawRatio * 100));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      generateTrellis();
    };

    window.addEventListener('resize', handleResize);

    // Color palettes by botanical species
    const speciesPalettes = {
      jasmine: {
        vines: ['#1e4620', '#2d5a27', '#153818', '#31632d'],
        bark: ['#4a3525', '#5a4230', '#3b2a1c'],
        leaves: ['#2d6a4f', '#40916c', '#1b4332', '#52b788', '#31572c', '#74c69d'],
        flowers: ['#ffffff', '#fffef0', '#fef9c3', '#fef08a'],
        flowerCenter: '#f59e0b',
        hasFlowers: true,
        flowerType: 'single' as const
      },
      ivy: {
        vines: ['#173e2a', '#1e4c34', '#103322', '#26593f'],
        bark: ['#3e2d21', '#4d392b', '#2e2016'],
        leaves: ['#1b4332', '#2d6a4f', '#40916c', '#52b788', '#1e4935', '#255d44'],
        flowers: ['#d8f3dc', '#b7e4c7', '#95d5b2'],
        flowerCenter: '#74c69d',
        hasFlowers: false,
        flowerType: 'cluster' as const
      },
      wisteria: {
        vines: ['#342e24', '#423b2f', '#27221a', '#4c4232'],
        bark: ['#4b3f30', '#5a4d3b', '#393024'],
        leaves: ['#2d6a4f', '#386641', '#40916c', '#52b788', '#6a994e'],
        flowers: ['#c084fc', '#d8b4fe', '#a855f7', '#e9d5ff', '#9333ea', '#fae8ff'],
        flowerCenter: '#fbbf24',
        hasFlowers: true,
        flowerType: 'cluster' as const
      },
      clematis: {
        vines: ['#253322', '#30422c', '#1b2618', '#3a5035'],
        bark: ['#423223', '#523f2e', '#322519'],
        leaves: ['#2d6a4f', '#40916c', '#1b4332', '#386641', '#52b788'],
        flowers: ['#ec4899', '#f472b6', '#fbcfe8', '#db2777', '#fda4af'],
        flowerCenter: '#facc15',
        hasFlowers: true,
        flowerType: 'single' as const
      }
    };

    const currentPalette = speciesPalettes[species];

    // ==========================================
    // 1. PROCEDURAL WOODEN TRELLIS FRAMEWORK
    // ==========================================
    let slats: Slat[] = [];
    let latticeJoints: LatticeJoint[] = [];
    const spacing = Math.max(90, Math.min(130, width / 11));
    const slatWidth = 15;

    function generateTrellis() {
      slats = [];
      latticeJoints = [];

      // A) Outer wooden frame border beams
      const frameThickness = 26;
      slats.push(
        { x1: 0, y1: 0, x2: width, y2: 0, width: frameThickness, type: 'frame' },
        { x1: 0, y1: height, x2: width, y2: height, width: frameThickness, type: 'frame' },
        { x1: 0, y1: 0, x2: 0, y2: height, width: frameThickness, type: 'frame' },
        { x1: width, y1: 0, x2: width, y2: height, width: frameThickness, type: 'frame' }
      );

      // B) Diagonal Cross Lattice Slats (\ direction)
      for (let offset = -height; offset <= width + height; offset += spacing) {
        slats.push({
          x1: offset,
          y1: 0,
          x2: offset + height,
          y2: height,
          width: slatWidth,
          type: 'diag1'
        });
      }

      // C) Diagonal Cross Lattice Slats (/ direction)
      for (let offset = -height; offset <= width + height; offset += spacing) {
        slats.push({
          x1: offset + height,
          y1: 0,
          x2: offset,
          y2: height,
          width: slatWidth,
          type: 'diag2'
        });
      }

      // D) Horizontal structural reinforcement battens
      for (let y = spacing * 1.4; y < height; y += spacing * 2.2) {
        slats.push({
          x1: 0,
          y1: y,
          x2: width,
          y2: y,
          width: 10,
          type: 'horiz'
        });
      }

      // Intersections for wooden joint pegs
      for (let offset1 = -height; offset1 <= width + height; offset1 += spacing) {
        for (let offset2 = -height; offset2 <= width + height; offset2 += spacing) {
          const jx = (offset1 + offset2 + height) / 2;
          const jy = jx - offset1;
          if (jx >= -10 && jx <= width + 10 && jy >= -10 && jy <= height + 10) {
            latticeJoints.push({ x: jx, y: jy });
          }
        }
      }
    }

    generateTrellis();

    // ==========================================
    // 2. PROCEDURAL LIVING CLIMBING PLANT GENERATOR
    // ==========================================
    const numRootVines = Math.max(6, Math.min(12, Math.floor(width / 160)));
    const vines: MainVine[] = [];

    // Desk anchor position
    const deskH = Math.max(90, Math.min(145, height * 0.16));
    const deskY = height - deskH;

    for (let i = 0; i < numRootVines; i++) {
      const rootX = (width / (numRootVines + 1)) * (i + 1) + (Math.random() - 0.5) * 45;
      const rootY = showDesk ? deskY + 20 : height + 20;
      const vineColor =
        currentPalette.vines[Math.floor(Math.random() * currentPalette.vines.length)];
      const barkColor =
        currentPalette.bark[Math.floor(Math.random() * currentPalette.bark.length)];

      const segments: VineSegment[] = [];
      const leaves: Leaf[] = [];
      const tendrils: Tendril[] = [];
      const branches: Branch[] = [];

      let curX = rootX;
      let curY = rootY;
      const numSegments = 16 + Math.floor(Math.random() * 6);

      // Build organic climbing pathway up through the trellis lattice
      for (let s = 0; s < numSegments; s++) {
        const stepHeight = (height * 1.15) / numSegments;
        const targetY = Math.max(-60, curY - stepHeight + (Math.random() - 0.5) * 30);

        const wanderFrequency = 0.7 + (i % 3) * 0.2;
        const wander = Math.sin(s * wanderFrequency + i * 1.4) * 60 + (Math.random() - 0.5) * 45;
        const targetX = Math.max(30, Math.min(width - 30, curX + wander));

        const midY = (curY + targetY) / 2;
        const cp1x = curX + (Math.random() - 0.5) * 45;
        const cp1y = curY - stepHeight * 0.38;
        const cp2x = targetX + (Math.random() - 0.5) * 45;
        const cp2y = midY + (Math.random() - 0.5) * 20;

        const frontOfWood = s % 2 === 0;
        const thickness = Math.max(2.4, 8.5 - s * 0.32);

        segments.push({
          x: curX,
          y: curY,
          cp1x,
          cp1y,
          cp2x,
          cp2y,
          targetX,
          targetY,
          thickness,
          frontOfWood
        });

        // Add foliage leaves along this segment
        const leavesPerSeg = 3 + Math.floor(Math.random() * 3);
        for (let l = 0; l < leavesPerSeg; l++) {
          const t = (l + Math.random() * 0.35) / leavesPerSeg;

          const lx =
            Math.pow(1 - t, 3) * curX +
            3 * Math.pow(1 - t, 2) * t * cp1x +
            3 * (1 - t) * Math.pow(t, 2) * cp2x +
            Math.pow(t, 3) * targetX;
          const ly =
            Math.pow(1 - t, 3) * curY +
            3 * Math.pow(1 - t, 2) * t * cp1y +
            3 * (1 - t) * Math.pow(t, 2) * cp2y +
            Math.pow(t, 3) * targetY;

          const side = l % 2 === 0 ? 1 : -1;
          const baseAngle = side * (0.65 + Math.random() * 0.7) - Math.PI / 2;
          const leafColor =
            currentPalette.leaves[Math.floor(Math.random() * currentPalette.leaves.length)];

          const isFlower = currentPalette.hasFlowers && Math.random() < 0.34 && s > 1;

          leaves.push({
            x: lx,
            y: ly,
            angle: baseAngle + (Math.random() - 0.5) * 0.4,
            targetSize: isFlower ? 16 + Math.random() * 10 : 20 + Math.random() * 14,
            color: isFlower
              ? currentPalette.flowers[Math.floor(Math.random() * currentPalette.flowers.length)]
              : leafColor,
            stemProgress: (s + t) / numSegments,
            flutterOffset: Math.random() * Math.PI * 2,
            isFlower,
            flowerType: currentPalette.flowerType
          });
        }

        // Add curling tendrils
        if (Math.random() < 0.7) {
          tendrils.push({
            x: targetX,
            y: targetY,
            startAngle: Math.random() * Math.PI * 2,
            stemProgress: (s + 1) / numSegments
          });
        }

        // Spawn lateral side branches
        if (s === 3 || s === 7 || s === 11 || s === 14) {
          const branchSegments: VineSegment[] = [];
          const branchLeaves: Leaf[] = [];

          let bCurX = targetX;
          let bCurY = targetY;
          const branchDir = Math.random() > 0.5 ? 1 : -1;
          const branchSegCount = 4 + Math.floor(Math.random() * 3);

          for (let bs = 0; bs < branchSegCount; bs++) {
            const bTargetX = bCurX + branchDir * (45 + Math.random() * 40);
            const bTargetY = bCurY - (25 + Math.random() * 35);
            const bCp1x = bCurX + branchDir * 20;
            const bCp1y = bCurY - 10;
            const bCp2x = bTargetX - branchDir * 10;
            const bCp2y = bTargetY + 10;

            branchSegments.push({
              x: bCurX,
              y: bCurY,
              cp1x: bCp1x,
              cp1y: bCp1y,
              cp2x: bCp2x,
              cp2y: bCp2y,
              targetX: bTargetX,
              targetY: bTargetY,
              thickness: Math.max(2.0, 5.0 - bs * 0.6),
              frontOfWood: bs % 2 === 1
            });

            for (let bl = 0; bl < 2; bl++) {
              const bt = (bl + 0.5) / 2;
              const blx = (1 - bt) * bCurX + bt * bTargetX;
              const bly = (1 - bt) * bCurY + bt * bTargetY;
              const isBFlower = currentPalette.hasFlowers && Math.random() < 0.38;

              branchLeaves.push({
                x: blx,
                y: bly,
                angle: (bl % 2 === 0 ? 1 : -1) * 0.9 - Math.PI / 2,
                targetSize: isBFlower ? 14 + Math.random() * 8 : 16 + Math.random() * 10,
                color: isBFlower
                  ? currentPalette.flowers[Math.floor(Math.random() * currentPalette.flowers.length)]
                  : currentPalette.leaves[Math.floor(Math.random() * currentPalette.leaves.length)],
                stemProgress: (bs + bt) / branchSegCount,
                flutterOffset: Math.random() * Math.PI * 2,
                isFlower: isBFlower,
                flowerType: currentPalette.flowerType
              });
            }

            bCurX = bTargetX;
            bCurY = bTargetY;
          }

          branches.push({
            segments: branchSegments,
            leaves: branchLeaves,
            stemProgressTrigger: s / numSegments,
            growthProgress: 0,
            color: vineColor
          });
        }

        curX = targetX;
        curY = targetY;
      }

      vines.push({
        id: i,
        startX: rootX,
        startY: rootY,
        segments,
        branches,
        leaves,
        tendrils,
        growthProgress: 0,
        color: vineColor,
        barkColor,
        delayOffset: i * 0.03
      });
    }

    // ==========================================
    // 3. SUNLIGHT SPORES / GLOWING POLLEN
    // ==========================================
    const particles: AmbientSpore[] = [];
    for (let p = 0; p < 45; p++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35 + 0.1,
        vy: -0.15 - Math.random() * 0.35,
        size: 1.5 + Math.random() * 2.8,
        alpha: 0.35 + Math.random() * 0.5,
        color: Math.random() > 0.45 ? '#fef08a' : '#86efac',
        pulseSpeed: 0.02 + Math.random() * 0.04
      });
    }

    const breezeSpeeds = {
      calm: 0.001,
      gentle: 0.0025,
      breezy: 0.0055
    };
    const breezeAmplitudes = {
      calm: 0.05,
      gentle: 0.16,
      breezy: 0.35
    };

    let time = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    // ==========================================
    // 4. MAIN RENDER LOOP
    // ==========================================
    const render = () => {
      time += 1;
      const curBreezeSpeed = breezeSpeeds[breezeStrength];
      const curBreezeAmp = breezeAmplitudes[breezeStrength];

      // Smooth progress lerp
      if (growthMode === 'scroll') {
        const diff = scrollTargetRef.current - smoothScrollRef.current;
        smoothScrollRef.current += diff * 0.085;
      } else if (growthMode === 'ambient') {
        autoProgressRef.current = Math.min(1.0, autoProgressRef.current + 0.0015);
        smoothScrollRef.current = autoProgressRef.current;
      } else if (growthMode === 'full') {
        smoothScrollRef.current += (1.0 - smoothScrollRef.current) * 0.09;
      }

      ctx.clearRect(0, 0, width, height);

      // ----------------------------------------
      // A) DRAW WOODEN TRELLIS FRAMEWORK (BEHIND)
      // ----------------------------------------
      ctx.save();
      ctx.shadowColor = 'rgba(20, 10, 5, 0.12)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 8;

      slats.forEach(slat => {
        if (slat.type === 'frame') return;
        ctx.beginPath();
        ctx.moveTo(slat.x1, slat.y1);
        ctx.lineTo(slat.x2, slat.y2);
        ctx.strokeStyle = 'rgba(70, 40, 20, 0.08)';
        ctx.lineWidth = slat.width + 4;
        ctx.lineCap = 'round';
        ctx.stroke();
      });
      ctx.restore();

      const woodTones = {
        base: '#a06a48',
        dark: '#7e4e2c',
        light: '#bd8660',
        grain: '#532f14'
      };

      slats.forEach(slat => {
        if (slat.type === 'frame') return;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(slat.x1, slat.y1);
        ctx.lineTo(slat.x2, slat.y2);

        const grad = ctx.createLinearGradient(
          slat.x1,
          slat.y1,
          slat.x1 + slat.width,
          slat.y1 + slat.width
        );
        grad.addColorStop(0, woodTones.light);
        grad.addColorStop(0.35, woodTones.base);
        grad.addColorStop(0.85, woodTones.dark);
        grad.addColorStop(1, '#4e2d14');

        ctx.strokeStyle = grad;
        ctx.lineWidth = slat.width;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Center wood grain highlight
        ctx.beginPath();
        ctx.moveTo(slat.x1, slat.y1);
        ctx.lineTo(slat.x2, slat.y2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.restore();
      });

      // Lattice Intersections & Peg Joints
      ctx.save();
      latticeJoints.forEach(joint => {
        ctx.beginPath();
        ctx.arc(joint.x, joint.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#3e200c';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(joint.x - 0.7, joint.y - 0.7, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      });
      ctx.restore();

      // ----------------------------------------
      // B) DRAW GROWING VINES, BRANCHES & LEAVES (CLIMBING UP)
      // ----------------------------------------
      vines.forEach(vine => {
        const adjustedTarget = Math.max(
          0.02,
          Math.min(1.0, (smoothScrollRef.current - vine.delayOffset) / (1.0 - vine.delayOffset * 0.8))
        );
        vine.growthProgress += (adjustedTarget - vine.growthProgress) * 0.12;

        const currentProg = vine.growthProgress;
        if (currentProg <= 0.01) return;

        const totalSegmentsToDraw = vine.segments.length * currentProg;
        const fullSegCount = Math.floor(totalSegmentsToDraw);
        const partialSegProg = totalSegmentsToDraw - fullSegCount;

        for (let s = 0; s <= fullSegCount && s < vine.segments.length; s++) {
          const seg = vine.segments[s];
          const isPartial = s === fullSegCount;
          const prog = isPartial ? partialSegProg : 1.0;
          if (prog <= 0.001) continue;

          ctx.save();

          const breeze =
            Math.sin(time * curBreezeSpeed * 1000 + seg.y * 0.005) * curBreezeAmp * 12;

          let mousePullX = 0;
          let mousePullY = 0;
          if (mouseRef.current.active) {
            const dx = mouseRef.current.x - seg.x;
            const dy = mouseRef.current.y - seg.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 200) {
              const force = (1 - dist / 200) * 12;
              mousePullX = (dx / dist) * force;
              mousePullY = (dy / dist) * force;
            }
          }

          const startX = seg.x + breeze + mousePullX;
          const startY = seg.y;
          const cp1x = seg.cp1x + breeze * 0.8 + mousePullX;
          const cp1y = seg.cp1y;
          const cp2x = seg.cp2x + breeze * 1.2 + mousePullX;
          const cp2y = seg.cp2y;
          const targetX = seg.targetX + breeze + mousePullX;
          const targetY = seg.targetY;

          let endX = targetX;
          let endY = targetY;
          if (isPartial) {
            endX =
              Math.pow(1 - prog, 3) * startX +
              3 * Math.pow(1 - prog, 2) * prog * cp1x +
              3 * (1 - prog) * Math.pow(prog, 2) * cp2x +
              Math.pow(prog, 3) * targetX;
            endY =
              Math.pow(1 - prog, 3) * startY +
              3 * Math.pow(1 - prog, 2) * prog * cp1y +
              3 * (1 - prog) * Math.pow(prog, 2) * cp2y +
              Math.pow(prog, 3) * targetY;
          }

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          if (isPartial) {
            ctx.quadraticCurveTo(cp1x, cp1y, endX, endY);
          } else {
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
          }

          ctx.shadowColor = 'rgba(0, 40, 25, 0.22)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 4;

          ctx.strokeStyle = vine.color;
          ctx.lineWidth = seg.thickness;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Active growth tip glow at top of growing vine
          if (isPartial) {
            ctx.beginPath();
            ctx.arc(endX, endY, seg.thickness * 1.6, 0, Math.PI * 2);
            ctx.fillStyle = '#6ee7b7';
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 18;
            ctx.fill();

            // Sprout leaves
            ctx.beginPath();
            ctx.ellipse(endX - 4, endY - 5, 4, 8, -0.4, 0, Math.PI * 2);
            ctx.ellipse(endX + 4, endY - 5, 4, 8, 0.4, 0, Math.PI * 2);
            ctx.fillStyle = '#a7f3d0';
            ctx.fill();
          }

          ctx.restore();
        }

        // Render lateral branches
        vine.branches.forEach(branch => {
          if (currentProg < branch.stemProgressTrigger) return;

          const branchProg = Math.min(
            1.0,
            (currentProg - branch.stemProgressTrigger) / 0.28
          );
          branch.growthProgress = branchProg;
          if (branchProg <= 0.01) return;

          const bTotalSegs = branch.segments.length * branchProg;
          const bFullCount = Math.floor(bTotalSegs);
          const bPartialProg = bTotalSegs - bFullCount;

          for (let bs = 0; bs <= bFullCount && bs < branch.segments.length; bs++) {
            const bseg = branch.segments[bs];
            const isPartial = bs === bFullCount;
            const prog = isPartial ? bPartialProg : 1.0;
            if (prog <= 0.001) continue;

            ctx.save();
            const bStart = { x: bseg.x, y: bseg.y };
            let bEnd = { x: bseg.targetX, y: bseg.targetY };
            if (isPartial) {
              bEnd.x = (1 - prog) * bseg.x + prog * bseg.targetX;
              bEnd.y = (1 - prog) * bseg.y + prog * bseg.targetY;
            }

            ctx.beginPath();
            ctx.moveTo(bStart.x, bStart.y);
            ctx.quadraticCurveTo(bseg.cp1x, bseg.cp1y, bEnd.x, bEnd.y);
            ctx.strokeStyle = branch.color;
            ctx.lineWidth = bseg.thickness;
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.restore();
          }

          branch.leaves.forEach(leaf => {
            if (branchProg < leaf.stemProgress) return;
            const leafScale = Math.min(1.0, (branchProg - leaf.stemProgress) / 0.18);
            drawLeaf(ctx, leaf, leafScale, time, curBreezeSpeed, curBreezeAmp, currentPalette);
          });
        });

        // Render tendrils
        vine.tendrils.forEach(tendril => {
          if (currentProg < tendril.stemProgress) return;
          const tendrilProg = Math.min(1.0, (currentProg - tendril.stemProgress) / 0.15);

          ctx.save();
          ctx.beginPath();
          let angle = tendril.startAngle;
          let radius = 2;
          ctx.moveTo(tendril.x, tendril.y);

          const maxSteps = Math.floor(35 * tendrilProg);
          for (let step = 0; step < maxSteps; step++) {
            angle += 0.38;
            radius += 0.22;
            const tx = tendril.x + Math.cos(angle) * radius;
            const ty = tendril.y + Math.sin(angle) * radius - step * 0.65;
            ctx.lineTo(tx, ty);
          }

          ctx.strokeStyle = '#40916c';
          ctx.lineWidth = 1.6;
          ctx.stroke();
          ctx.restore();
        });

        // Render leaves & blooms
        vine.leaves.forEach(leaf => {
          if (currentProg < leaf.stemProgress) return;
          const growthDelta = (currentProg - leaf.stemProgress) / 0.1;
          const scale = Math.min(1.0, Math.max(0.01, growthDelta));
          drawLeaf(ctx, leaf, scale, time, curBreezeSpeed, curBreezeAmp, currentPalette);
        });
      });

      // ----------------------------------------
      // C) DRAW DESK WITH COMPUTER SETUP & NOTES (IN FRONT OF TRELLIS)
      // ----------------------------------------
      if (showDesk) {
        drawDeskWorkstation(ctx, width, height, time);
      }

      // ----------------------------------------
      // D) OUTER WOODEN FRAME BORDER BEAMS
      // ----------------------------------------
      const frameBeams = slats.filter(s => s.type === 'frame');
      frameBeams.forEach(frame => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(frame.x1, frame.y1);
        ctx.lineTo(frame.x2, frame.y2);

        const frameGrad = ctx.createLinearGradient(frame.x1, frame.y1, frame.x2, frame.y2);
        frameGrad.addColorStop(0, '#7f4f24');
        frameGrad.addColorStop(0.5, '#a06a48');
        frameGrad.addColorStop(1, '#583110');

        ctx.strokeStyle = frameGrad;
        ctx.lineWidth = frame.width;
        ctx.stroke();

        ctx.restore();
      });

      // ----------------------------------------
      // E) FLOATING SUNLIGHT SPORES / POLLEN
      // ----------------------------------------
      particles.forEach(p => {
        p.x += p.vx + Math.sin(time * 0.02 + p.y * 0.01) * 0.4;
        p.y += p.vy;

        if (p.y < -20) p.y = height + 10;
        if (p.x < -20) p.x = width + 10;
        if (p.x > width + 20) p.x = -10;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (0.65 + Math.sin(time * p.pulseSpeed + p.x) * 0.35);
        ctx.shadowColor = '#fef08a';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [species, growthMode, breezeStrength, showDesk, interactive, growthKey]);

  // =========================================================
  // DRAW DESK, COMPUTER SETUP, NOTES & PLANTERS IN FOREGROUND
  // =========================================================
  function drawDeskWorkstation(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number
  ) {
    // Normal, realistic desk depth (22% of screen height, min 170px, max 240px)
    const deskH = Math.max(170, Math.min(240, height * 0.23));
    const deskY = height - deskH;
    const centerX = width * 0.5;

    // -------------------------------------------------------
    // 1. DESK SHADOW ON WALL / BACKGROUND
    // -------------------------------------------------------
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, deskY - 12, width, 12);
    const wallShadow = ctx.createLinearGradient(0, deskY - 12, 0, deskY);
    wallShadow.addColorStop(0, 'rgba(10, 5, 2, 0)');
    wallShadow.addColorStop(1, 'rgba(10, 5, 2, 0.45)');
    ctx.fillStyle = wallShadow;
    ctx.fill();

    // -------------------------------------------------------
    // 2. SOLID WOOD DESKTOP SURFACE (Rich Polished Walnut / Teak)
    // -------------------------------------------------------
    const deskGrad = ctx.createLinearGradient(0, deskY, 0, height);
    deskGrad.addColorStop(0, '#5a3824');
    deskGrad.addColorStop(0.06, '#6b432c');
    deskGrad.addColorStop(0.25, '#4e2f1d');
    deskGrad.addColorStop(0.65, '#3b2214');
    deskGrad.addColorStop(1, '#24140a');

    ctx.beginPath();
    ctx.rect(0, deskY, width, deskH);
    ctx.fillStyle = deskGrad;
    ctx.fill();

    // Top beveled highlight edge of desk
    ctx.beginPath();
    ctx.moveTo(0, deskY);
    ctx.lineTo(width, deskY);
    ctx.strokeStyle = 'rgba(255, 235, 210, 0.42)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Secondary bevel rim
    ctx.beginPath();
    ctx.moveTo(0, deskY + 2.5);
    ctx.lineTo(width, deskY + 2.5);
    ctx.strokeStyle = 'rgba(30, 15, 8, 0.65)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Subtle Woodgrain Lines across Desk
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let wg = 12; wg < deskH; wg += 20) {
      ctx.beginPath();
      ctx.moveTo(0, deskY + wg);
      ctx.bezierCurveTo(
        width * 0.28,
        deskY + wg + Math.sin(wg * 0.5) * 3,
        width * 0.72,
        deskY + wg - Math.sin(wg * 0.5) * 3,
        width,
        deskY + wg
      );
      ctx.stroke();
    }
    ctx.restore();

    // -------------------------------------------------------
    // 3. WARM ARCHITECT LAMP (Upper Left)
    // -------------------------------------------------------
    const lampX = Math.max(70, width * 0.14);
    const lampY = deskY - 170;
    ctx.save();
    
    // Warm radial light beam
    const lampCone = ctx.createRadialGradient(
      lampX + 35,
      lampY + 25,
      12,
      lampX + 60,
      deskY + 50,
      320
    );
    lampCone.addColorStop(0, 'rgba(254, 240, 138, 0.26)');
    lampCone.addColorStop(0.35, 'rgba(253, 230, 138, 0.12)');
    lampCone.addColorStop(0.8, 'rgba(253, 230, 138, 0.03)');
    lampCone.addColorStop(1, 'rgba(253, 230, 138, 0)');
    ctx.fillStyle = lampCone;
    ctx.beginPath();
    ctx.arc(lampX + 60, deskY + 50, 320, 0, Math.PI * 2);
    ctx.fill();

    // Lamp Base & Articulated Metallic Arm
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lampX, deskY + 10);
    ctx.lineTo(lampX - 12, deskY - 95);
    ctx.lineTo(lampX + 30, lampY + 20);
    ctx.stroke();

    // Joints / brass pivot bolts
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(lampX - 12, deskY - 95, 4.5, 0, Math.PI * 2);
    ctx.arc(lampX + 30, lampY + 20, 4, 0, Math.PI * 2);
    ctx.fill();

    // Lamp Shade & Bulb
    ctx.save();
    ctx.translate(lampX + 30, lampY + 20);
    ctx.rotate(0.38);
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 14, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    
    // Glowing warm bulb
    ctx.beginPath();
    ctx.arc(0, 5, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.restore();
    ctx.restore();

    // -------------------------------------------------------
    // 4. FELT DESK MAT / LARGE MOUSEPAD (Centered)
    // -------------------------------------------------------
    const matW = Math.min(780, Math.max(480, width * 0.68));
    const matH = Math.min(130, deskH * 0.72);
    const matX = centerX - matW / 2;
    const matY = deskY + (deskH - matH) * 0.42;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(matX, matY, matW, matH, 10);
    ctx.fillStyle = '#16201b'; // Premium dark slate forest felt
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fill();

    // Emerald perimeter stitching
    ctx.strokeStyle = 'rgba(82, 183, 136, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // -------------------------------------------------------
    // 5. PROPORTIONATE COMPUTER MONITOR (Realistic 16:10 / 16:9)
    // -------------------------------------------------------
    // Realistic monitor dimensions (width ~ 480-560px on desktop, height = width * 0.60)
    const monW = Math.min(540, Math.max(340, width * 0.46));
    const monH = Math.round(monW * 0.60); // Proper 16:10 display ratio!
    const monX = centerX - monW / 2;
    // Proper ergonomic height clearance above the desk (~40-48px)
    const standClearance = 44;
    const monY = deskY - monH - standClearance;

    // A) MONITOR STAND (Heavy Chamfered Aluminum Base + Solid Column)
    ctx.save();
    const baseW = monW * 0.36;
    const baseH = 14;
    const baseX = centerX - baseW / 2;
    const baseY = deskY + 12;

    // Base Shadow on Desk
    ctx.beginPath();
    ctx.roundRect(baseX - 4, baseY + 4, baseW + 8, baseH + 4, 6);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // Solid Aluminum Base Plate
    const baseGrad = ctx.createLinearGradient(baseX, baseY, baseX, baseY + baseH);
    baseGrad.addColorStop(0, '#64748b');
    baseGrad.addColorStop(0.3, '#94a3b8');
    baseGrad.addColorStop(0.7, '#475569');
    baseGrad.addColorStop(1, '#1e293b');
    ctx.beginPath();
    ctx.roundRect(baseX, baseY, baseW, baseH, 4);
    ctx.fillStyle = baseGrad;
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Articulated Stand Column Neck (Elevates screen above desk)
    const neckW = 32;
    const neckTopY = monY + monH * 0.65;
    const neckH = baseY - neckTopY;
    const neckGrad = ctx.createLinearGradient(centerX - neckW / 2, 0, centerX + neckW / 2, 0);
    neckGrad.addColorStop(0, '#334155');
    neckGrad.addColorStop(0.3, '#94a3b8');
    neckGrad.addColorStop(0.7, '#64748b');
    neckGrad.addColorStop(1, '#1e293b');

    ctx.beginPath();
    ctx.roundRect(centerX - neckW / 2, neckTopY, neckW, neckH, 4);
    ctx.fillStyle = neckGrad;
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // B) MONITOR CHASSIS & OUTER FRAME
    ctx.save();
    // Ambient monitor drop-shadow onto trellis & desk
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 16;

    // Monitor Outer Body (Space-Gray / Obsidian Aluminum)
    ctx.beginPath();
    ctx.roundRect(monX, monY, monW, monH, 12);
    ctx.fillStyle = '#0a0f0d';
    ctx.fill();

    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // Slim Bezel Highlight
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(monX + 1, monY + 1, monW - 2, monH - 2, 11);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Top Webcam & Status LED
    ctx.beginPath();
    ctx.arc(centerX, monY + 5, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 6, monY + 5, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981'; // Green active camera LED
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 4;
    ctx.fill();

    // Bottom Chin Subtle Logo / Brushed Accent
    ctx.beginPath();
    ctx.moveTo(centerX - 18, monY + monH - 4.5);
    ctx.lineTo(centerX + 18, monY + monH - 4.5);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    // C) HIGH-RES SCREEN DISPLAY (Active Architecture IDE & Live Topology Visualizer)
    ctx.save();
    const bezelThickness = 9;
    const scrX = monX + bezelThickness;
    const scrY = monY + bezelThickness;
    const scrW = monW - bezelThickness * 2;
    const scrH = monH - bezelThickness * 2 - 8;

    // Screen Canvas Background (Deep Emerald Obsidian IDE)
    ctx.beginPath();
    ctx.roundRect(scrX, scrY, scrW, scrH, 6);
    ctx.fillStyle = '#06120d';
    ctx.fill();

    // Clip all inner screen contents cleanly inside display
    ctx.beginPath();
    ctx.roundRect(scrX, scrY, scrW, scrH, 6);
    ctx.clip();

    // 1. Top IDE Tab Bar
    const tabH = 18;
    ctx.fillStyle = '#0d241a';
    ctx.fillRect(scrX, scrY, scrW, tabH);

    // Window Traffic Light Dots (🔴 🟡 🟢)
    const dotY = scrY + tabH * 0.5;
    ctx.beginPath();
    ctx.arc(scrX + 10, dotY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(scrX + 18, dotY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(scrX + 26, dotY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();

    // Active Tab 1: trellis-engine.ts
    ctx.fillStyle = '#06120d';
    ctx.beginPath();
    ctx.roundRect(scrX + 38, scrY + 2, 110, tabH - 2, [4, 4, 0, 0]);
    ctx.fill();
    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 7.5px monospace';
    ctx.fillText('🌿 trellis-engine.ts', scrX + 44, scrY + 12);

    // Inactive Tab 2: system-mesh.tsx
    ctx.fillStyle = '#34d399';
    ctx.globalAlpha = 0.55;
    ctx.font = '7px monospace';
    ctx.fillText('📐 topology.tsx', scrX + 158, scrY + 12);
    ctx.globalAlpha = 1.0;

    // Divider Line under tabs
    ctx.strokeStyle = '#1a3d2e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(scrX, scrY + tabH);
    ctx.lineTo(scrX + scrW, scrY + tabH);
    ctx.stroke();

    // 2. Left Sidebar (Project Explorer)
    const sideW = Math.min(100, scrW * 0.22);
    ctx.fillStyle = '#081a13';
    ctx.fillRect(scrX, scrY + tabH, sideW, scrH - tabH - 14);

    // Sidebar Items
    ctx.fillStyle = '#52b788';
    ctx.font = 'bold 6.5px monospace';
    ctx.fillText('EXPLORER', scrX + 6, scrY + tabH + 11);

    const explorerFiles = [
      { name: '▼ src', isDir: true, color: '#93c5fd' },
      { name: '  ► core/', isDir: true, color: '#93c5fd' },
      { name: '    trellis.ts', isDir: false, color: '#6ee7b7' },
      { name: '    raft.go', isDir: false, color: '#fbbf24' },
      { name: '    mesh.proto', isDir: false, color: '#f472b6' },
      { name: '  ► network/', isDir: true, color: '#93c5fd' },
      { name: '    topology.ts', isDir: false, color: '#6ee7b7' }
    ];

    explorerFiles.forEach((file, fIdx) => {
      const fY = scrY + tabH + 22 + fIdx * 11;
      if (fY > scrY + scrH - 20) return;
      ctx.fillStyle = file.color;
      ctx.font = '6px monospace';
      ctx.fillText(file.name, scrX + 6, fY);
    });

    // Vertical Divider after sidebar
    ctx.strokeStyle = '#1a3d2e';
    ctx.beginPath();
    ctx.moveTo(scrX + sideW, scrY + tabH);
    ctx.lineTo(scrX + sideW, scrY + scrH - 14);
    ctx.stroke();

    // 3. Center Code Editor Area
    const editorX = scrX + sideW + 4;
    const editorW = scrW * 0.44;

    // Line Numbers & Code Lines
    const codeLines = [
      { num: '01', tokens: [{ t: 'import', c: '#f472b6' }, { t: ' { TrellisMesh }', c: '#fde047' }, { t: ' from', c: '#f472b6' }, { t: ' "core";', c: '#a7f3d0' }] },
      { num: '02', tokens: [{ t: 'import', c: '#f472b6' }, { t: ' { RaftCluster }', c: '#fde047' }, { t: ' from', c: '#f472b6' }, { t: ' "consensus";', c: '#a7f3d0' }] },
      { num: '03', tokens: [{ t: '', c: '' }] },
      { num: '04', tokens: [{ t: 'export', c: '#f472b6' }, { t: ' async', c: '#60a5fa' }, { t: ' function', c: '#60a5fa' }, { t: ' initTopology', c: '#fde047' }, { t: '() {', c: '#e2e8f0' }] },
      { num: '05', tokens: [{ t: '  const', c: '#60a5fa' }, { t: ' mesh', c: '#93c5fd' }, { t: ' =', c: '#f472b6' }, { t: ' new', c: '#60a5fa' }, { t: ' TrellisMesh', c: '#fde047' }, { t: '({', c: '#e2e8f0' }] },
      { num: '06', tokens: [{ t: '    qpsTarget:', c: '#6ee7b7' }, { t: ' 100_000,', c: '#fbbf24' }] },
      { num: '07', tokens: [{ t: '    p99LatencyMs:', c: '#6ee7b7' }, { t: ' 15,', c: '#fbbf24' }] },
      { num: '08', tokens: [{ t: '    replicas:', c: '#6ee7b7' }, { t: ' 5,', c: '#fbbf24' }] },
      { num: '09', tokens: [{ t: '    autoHeal:', c: '#6ee7b7' }, { t: ' true', c: '#f472b6' }] },
      { num: '10', tokens: [{ t: '  });', c: '#e2e8f0' }] },
      { num: '11', tokens: [{ t: '  await', c: '#f472b6' }, { t: ' mesh.', c: '#93c5fd' }, { t: 'startSync', c: '#fde047' }, { t: '();', c: '#e2e8f0' }] },
      { num: '12', tokens: [{ t: '}', c: '#e2e8f0' }] }
    ];

    // Highlight active line (Line 07)
    const activeLineY = scrY + tabH + 6 + 6 * 11;
    ctx.fillStyle = 'rgba(82, 183, 136, 0.12)';
    ctx.fillRect(editorX, activeLineY - 1, editorW + 40, 11);

    codeLines.forEach((line, lIdx) => {
      const lineY = scrY + tabH + 6 + lIdx * 11;
      if (lineY > scrY + scrH - 20) return;

      // Line Number
      ctx.fillStyle = '#3e6351';
      ctx.font = '6px monospace';
      ctx.fillText(line.num, editorX + 2, lineY + 7);

      // Code Tokens
      let tokenX = editorX + 16;
      line.tokens.forEach(tok => {
        if (!tok.t) return;
        ctx.fillStyle = tok.c;
        ctx.font = '6px monospace';
        ctx.fillText(tok.t, tokenX, lineY + 7);
        tokenX += ctx.measureText(tok.t).width;
      });
    });

    // Blinking Cursor on Active Line
    if (Math.floor(time / 20) % 2 === 0) {
      const curX = editorX + 115;
      ctx.fillStyle = '#10b981';
      ctx.fillRect(curX, activeLineY + 1, 4, 8);
    }

    // 4. Right Live Architecture Topology Visualizer
    const topoX = scrX + scrW * 0.68;
    const topoW = scrW - (topoX - scrX) - 6;
    const topoH = scrH - tabH - 18;

    // Topology Container Box
    ctx.fillStyle = '#081e15';
    ctx.beginPath();
    ctx.roundRect(topoX, scrY + tabH + 4, topoW, topoH, 4);
    ctx.fill();
    ctx.strokeStyle = '#1e4d3a';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Topology Header
    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 6px monospace';
    ctx.fillText('LIVE TOPOLOGY // 104k QPS', topoX + 6, scrY + tabH + 14);

    // Interactive Topology Nodes (Gateway -> Replicas -> Consensus)
    const tCenterY = scrY + tabH + 4 + topoH * 0.55;
    const tNodes = [
      { x: topoX + 20, y: tCenterY - 18, label: 'GATEWAY', color: '#60a5fa' },
      { x: topoX + topoW - 22, y: tCenterY - 26, label: 'RAFT-01', color: '#34d399' },
      { x: topoX + topoW - 22, y: tCenterY + 14, label: 'RAFT-02', color: '#a78bfa' },
      { x: topoX + topoW * 0.5, y: tCenterY + 28, label: 'CACHE', color: '#fbbf24' }
    ];

    // Connection Bus Wires
    ctx.strokeStyle = 'rgba(82, 183, 136, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(tNodes[0].x, tNodes[0].y);
    ctx.lineTo(tNodes[1].x, tNodes[1].y);
    ctx.moveTo(tNodes[0].x, tNodes[0].y);
    ctx.lineTo(tNodes[2].x, tNodes[2].y);
    ctx.moveTo(tNodes[0].x, tNodes[0].y);
    ctx.lineTo(tNodes[3].x, tNodes[3].y);
    ctx.stroke();

    // Animated Neon Glowing Data Packets
    const pktProgress1 = (time * 0.025) % 1;
    const pktX1 = (1 - pktProgress1) * tNodes[0].x + pktProgress1 * tNodes[1].x;
    const pktY1 = (1 - pktProgress1) * tNodes[0].y + pktProgress1 * tNodes[1].y;

    const pktProgress2 = ((time + 25) * 0.025) % 1;
    const pktX2 = (1 - pktProgress2) * tNodes[0].x + pktProgress2 * tNodes[2].x;
    const pktY2 = (1 - pktProgress2) * tNodes[0].y + pktProgress2 * tNodes[2].y;

    ctx.beginPath();
    ctx.arc(pktX1, pktY1, 2.5, 0, Math.PI * 2);
    ctx.arc(pktX2, pktY2, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#6ee7b7';
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 8;
    ctx.fill();

    // Render Node Circles & Labels
    tNodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.shadowColor = n.color;
      ctx.shadowBlur = 6;
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 4.5px sans-serif';
      ctx.fillText(n.label, n.x - 12, n.y + 12);
    });

    // 5. IDE Bottom Status Bar
    const statusY = scrY + scrH - 12;
    ctx.fillStyle = '#081a13';
    ctx.fillRect(scrX, statusY, scrW, 12);

    ctx.fillStyle = '#52b788';
    ctx.font = '5.5px monospace';
    ctx.fillText('⎇ main*  |  TypeScript 5.4  |  UTF-8  |  🟢 Engine: Active (11ms)', scrX + 6, statusY + 8.5);

    // Screen Glass Reflection / Specular Sheen (Diagonal Soft Glow)
    const glassGrad = ctx.createLinearGradient(scrX, scrY, scrX + scrW, scrY + scrH);
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    glassGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.02)');
    glassGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0)');
    glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.04)');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(scrX, scrY, scrW, scrH);

    ctx.restore();

    // -------------------------------------------------------
    // 6. ENGINEERING STICKY NOTES PINNED TO SETUP & TRELLIS
    // -------------------------------------------------------
    
    // Note 1: Canary Yellow Post-It pinned to top-right monitor frame
    ctx.save();
    const note1X = monX + monW - 28;
    const note1Y = monY + 12;
    ctx.translate(note1X, note1Y);
    ctx.rotate(0.09);
    
    // Shadow
    ctx.beginPath();
    ctx.roundRect(0, 0, 48, 44, 2);
    ctx.fillStyle = '#fef08a'; // Bright Yellow
    ctx.shadowColor = 'rgba(0,0,0,0.32)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    ctx.fill();

    // Top translucent tape strip
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillRect(14, -3, 20, 7);

    // Handwritten note text
    ctx.fillStyle = '#854d0e';
    ctx.font = 'bold 6.5px sans-serif';
    ctx.fillText('⚡ SHARD DB', 4, 11);
    ctx.font = '5.5px sans-serif';
    ctx.fillText('• 100k QPS Goal', 4, 20);
    ctx.fillText('• P99 < 15ms', 4, 28);
    ctx.fillText('• Raft Replicas = 5', 4, 36);
    ctx.restore();

    // Note 2: Mint Green Post-It pinned to bottom-left monitor frame
    ctx.save();
    const note2X = monX - 16;
    const note2Y = monY + monH - 65;
    ctx.translate(note2X, note2Y);
    ctx.rotate(-0.08);

    ctx.beginPath();
    ctx.roundRect(0, 0, 46, 42, 2);
    ctx.fillStyle = '#a7f3d0'; // Mint Green
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillRect(13, -3, 20, 7);

    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 6px sans-serif';
    ctx.fillText('🌱 TRELLIS 5-AXIS', 4, 11);
    ctx.font = '5.5px sans-serif';
    ctx.fillText('• Organic Climbing', 4, 20);
    ctx.fillText('• Auto-Bloom Lerp', 4, 28);
    ctx.fillText('• Spring Growth', 4, 36);
    ctx.restore();

    // Note 3: Warm Peach Index Card pinned directly to Wooden Trellis slat behind monitor
    ctx.save();
    const note3X = centerX + monW * 0.44;
    const note3Y = monY - 32;
    ctx.translate(note3X, note3Y);
    ctx.rotate(0.06);

    ctx.beginPath();
    ctx.roundRect(0, 0, 52, 46, 3);
    ctx.fillStyle = '#fecdd3'; // Warm Peach
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    ctx.fill();

    // Wooden Thumbtack / Push-Pin at top center
    ctx.beginPath();
    ctx.arc(26, 4, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#d97706';
    ctx.shadowColor = '#b45309';
    ctx.shadowBlur = 4;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(25, 3, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#fef3c7';
    ctx.fill();

    ctx.fillStyle = '#9f1239';
    ctx.font = 'bold 6.5px sans-serif';
    ctx.fillText('📐 ARCHITECTURE', 4, 14);
    ctx.font = '5px sans-serif';
    ctx.fillText('✓ Raft Consensus', 4, 23);
    ctx.fillText('✓ Cache-Aside Bus', 4, 31);
    ctx.fillText('✓ Zero-Downtime Roll', 4, 39);
    ctx.restore();

    // -------------------------------------------------------
    // 7. OPEN SPIRAL ENGINEERING SKETCHPAD (Left Desk Area)
    // -------------------------------------------------------
    const bookX = Math.max(90, centerX - matW * 0.44);
    const bookY = deskY + 16;
    const bookW = Math.min(130, width * 0.16);
    const bookH = 86;

    ctx.save();
    ctx.translate(bookX, bookY);
    ctx.rotate(-0.03);

    // Hardcover Shadow & Base
    ctx.beginPath();
    ctx.roundRect(-3, -3, bookW + 6, bookH + 6, 6);
    ctx.fillStyle = '#0f291e'; // Deep Forest Leather
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;
    ctx.fill();

    // 2-Page Grid Engineering Paper
    ctx.beginPath();
    ctx.roundRect(0, 0, bookW, bookH, 4);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();

    // Center Crease / Split
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bookW * 0.5, 0);
    ctx.lineTo(bookW * 0.5, bookH);
    ctx.stroke();

    // Engineering Grid Lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 0.6;
    for (let gy = 8; gy < bookH; gy += 7) {
      ctx.beginPath();
      ctx.moveTo(4, gy);
      ctx.lineTo(bookW - 4, gy);
      ctx.stroke();
    }

    // Left Page: Hand-drawn Architecture Diagram
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(8, 16, 20, 14);
    ctx.strokeRect(34, 16, 20, 14);
    ctx.beginPath();
    ctx.moveTo(28, 23);
    ctx.lineTo(34, 23);
    ctx.stroke();

    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 5px sans-serif';
    ctx.fillText('Client', 11, 25);
    ctx.fillText('Ingress', 36, 25);

    // Right Page: Handwritten Blueprint Checklist
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 6px sans-serif';
    ctx.fillText('Lattice Notes', bookW * 0.5 + 6, 14);
    ctx.font = '5px sans-serif';
    ctx.fillText('• 5-Axis Radar', bookW * 0.5 + 6, 26);
    ctx.fillText('• Microservice Mesh', bookW * 0.5 + 6, 36);
    ctx.fillText('• Auto-Bloom Lerp', bookW * 0.5 + 6, 46);
    ctx.fillText('• Zero Cold Starts', bookW * 0.5 + 6, 56);

    // Center Spiral Wire Rings
    for (let r = 8; r < bookH; r += 9) {
      ctx.beginPath();
      ctx.arc(bookW * 0.5, r, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = '#94a3b8';
      ctx.fill();
    }

    // Drafting Fountain Pen Resting across Notebook
    ctx.save();
    ctx.translate(bookW - 16, 8);
    ctx.rotate(0.42);
    ctx.beginPath();
    ctx.roundRect(-2.5, 0, 5, 62, 2);
    ctx.fillStyle = '#090d0b'; // Obsidian pen barrel
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 6;
    ctx.fill();

    // Metallic Brass Pen Clip & Gold Nib
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-1.5, 8, 3, 16);
    ctx.beginPath();
    ctx.moveTo(-2.5, 62);
    ctx.lineTo(2.5, 62);
    ctx.lineTo(0, 70);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();

    // -------------------------------------------------------
    // 8. MECHANICAL KEYBOARD & ERGONOMIC MOUSE (On Mat)
    // -------------------------------------------------------
    // 75% Mechanical Keyboard
    const kbW = Math.min(260, monW * 0.65);
    const kbH = 46;
    const kbX = centerX - kbW / 2 - 25;
    const kbY = deskY + (deskH - kbH) * 0.44;

    ctx.save();
    // Keyboard Body Shadow & Aluminum Case
    ctx.beginPath();
    ctx.roundRect(kbX, kbY, kbW, kbH, 6);
    ctx.fillStyle = '#0f172a';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Subtle Cyan/Emerald Underglow
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 8;

    // Keycaps Grid (6 Rows: Function, Numbers, QWERTY, ASDF, ZXCV, Spacebar)
    const kRows = 5;
    const kCols = 15;
    const kw = (kbW - 12) / kCols;
    const kh = (kbH - 10) / kRows;

    for (let r = 0; r < kRows; r++) {
      for (let c = 0; c < kCols; c++) {
        // Spacebar Row
        if (r === 4 && c >= 4 && c <= 10) {
          if (c === 4) {
            ctx.beginPath();
            ctx.roundRect(kbX + 6 + c * kw, kbY + 5 + r * kh, kw * 7 - 2, kh - 1.5, 2);
            ctx.fillStyle = '#334155';
            ctx.fill();
          }
          continue;
        }

        // Enter & Modifier Accent Keys
        const isAccent = (r === 2 && c === kCols - 1) || (r === 3 && c === 0);
        ctx.beginPath();
        ctx.roundRect(kbX + 6 + c * kw, kbY + 5 + r * kh, kw - 1.5, kh - 1.5, 1.8);
        ctx.fillStyle = isAccent ? '#047857' : '#1e293b';
        ctx.fill();
      }
    }
    ctx.restore();

    // Ergonomic Precision Mouse
    const mouseX = kbX + kbW + 28;
    const mouseY = kbY + 2;
    const mouseW = 24;
    const mouseH = 38;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(mouseX, mouseY, mouseW, mouseH, 10);
    ctx.fillStyle = '#0f172a';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Click split & illuminated emerald scroll wheel
    ctx.beginPath();
    ctx.moveTo(mouseX + mouseW / 2, mouseY);
    ctx.lineTo(mouseX + mouseW / 2, mouseY + 14);
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(mouseX + mouseW / 2 - 1.5, mouseY + 4, 3, 8, 1.5);
    ctx.fillStyle = '#10b981';
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();

    // -------------------------------------------------------
    // 9. STEAMING ARTISAN COFFEE MUG ON CORK COASTER
    // -------------------------------------------------------
    const mugX = Math.min(width - 80, centerX + monW * 0.5 + 75);
    const mugY = deskY + 22;
    ctx.save();

    // Cork Coaster
    ctx.beginPath();
    ctx.ellipse(mugX, mugY + 26, 18, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#b45309';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 6;
    ctx.fill();

    // Ceramic Deep Emerald Mug
    ctx.beginPath();
    ctx.roundRect(mugX - 14, mugY, 28, 26, [2, 2, 9, 9]);
    ctx.fillStyle = '#064e3b';
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    ctx.fill();
    ctx.strokeStyle = '#52b788';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Mug Handle
    ctx.beginPath();
    ctx.arc(mugX + 15, mugY + 13, 7, -Math.PI / 2, Math.PI / 2);
    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Hot Coffee Liquid
    ctx.beginPath();
    ctx.ellipse(mugX, mugY + 2.5, 12, 3.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#451a03';
    ctx.fill();

    // Rising Steaming Vapor Wisps
    const sOffset = (time * 0.04) % (Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(mugX - 4, mugY - 2);
    ctx.bezierCurveTo(
      mugX - 8 + Math.sin(sOffset) * 5,
      mugY - 14,
      mugX + Math.cos(sOffset) * 5,
      mugY - 24,
      mugX - 3,
      mugY - 34
    );
    ctx.moveTo(mugX + 4, mugY - 2);
    ctx.bezierCurveTo(
      mugX + 8 + Math.cos(sOffset) * 5,
      mugY - 12,
      mugX + Math.sin(sOffset) * 5,
      mugY - 22,
      mugX + 5,
      mugY - 32
    );
    ctx.stroke();
    ctx.restore();

    // -------------------------------------------------------
    // 10. BOTANICAL DESK PLANTERS (Vines Root & Sprout Up!)
    // -------------------------------------------------------
    // Left Terracotta Planter Pot
    const pot1X = Math.max(35, width * 0.07);
    const pot1Y = deskY - 14;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pot1X - 18, pot1Y);
    ctx.lineTo(pot1X + 18, pot1Y);
    ctx.lineTo(pot1X + 13, pot1Y + 38);
    ctx.lineTo(pot1X - 13, pot1Y + 38);
    ctx.closePath();
    ctx.fillStyle = '#c2410c';
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;
    ctx.fill();

    // Pot Rim
    ctx.beginPath();
    ctx.roundRect(pot1X - 20, pot1Y - 5, 40, 9, 3);
    ctx.fillStyle = '#ea580c';
    ctx.fill();

    // Rich Dark Moist Soil
    ctx.beginPath();
    ctx.ellipse(pot1X, pot1Y, 16, 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#27170c';
    ctx.fill();
    ctx.restore();

    // Right Glazed Ceramic Planter Pot
    const pot2X = Math.min(width - 35, width * 0.93);
    const pot2Y = deskY - 16;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pot2X - 20, pot2Y);
    ctx.lineTo(pot2X + 20, pot2Y);
    ctx.lineTo(pot2X + 15, pot2Y + 40);
    ctx.lineTo(pot2X - 15, pot2Y + 40);
    ctx.closePath();
    ctx.fillStyle = '#064e3b';
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;
    ctx.fill();

    // Pot Rim
    ctx.beginPath();
    ctx.roundRect(pot2X - 22, pot2Y - 5, 44, 9, 3);
    ctx.fillStyle = '#047857';
    ctx.fill();

    // Rich Dark Moist Soil
    ctx.beginPath();
    ctx.ellipse(pot2X, pot2Y, 18, 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#27170c';
    ctx.fill();
    ctx.restore();
  }

  function drawLeaf(
    ctx: CanvasRenderingContext2D,
    leaf: Leaf,
    scale: number,
    time: number,
    breezeSpeed: number,
    breezeAmp: number,
    palette: any
  ) {
    const leafWind =
      Math.sin(time * breezeSpeed * 900 + leaf.flutterOffset) * breezeAmp * 0.8;
    const drawAngle = leaf.angle + leafWind;
    const currentSize = leaf.targetSize * scale;

    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(drawAngle);

    if (leaf.isFlower) {
      // Flower Blossom
      const petals = leaf.flowerType === 'cluster' ? 6 : 5;
      const petalSize = currentSize * 0.75;

      ctx.shadowColor = 'rgba(255, 255, 255, 0.55)';
      ctx.shadowBlur = 10;

      for (let p = 0; p < petals; p++) {
        const pAngle = (p * (Math.PI * 2)) / petals;
        ctx.save();
        ctx.rotate(pAngle);
        ctx.beginPath();
        ctx.ellipse(0, petalSize * 0.65, petalSize * 0.4, petalSize * 0.72, 0, 0, Math.PI * 2);
        ctx.fillStyle = leaf.color;
        ctx.fill();

        ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      }

      // Golden Stamen
      ctx.beginPath();
      ctx.arc(0, 0, petalSize * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = palette.flowerCenter || '#f59e0b';
      ctx.fill();
    } else {
      // Botanical Leaf with Veins
      ctx.shadowColor = 'rgba(0, 35, 20, 0.16)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        -currentSize * 0.7,
        -currentSize * 0.3,
        -currentSize * 0.9,
        currentSize * 0.6,
        0,
        currentSize * 1.18
      );
      ctx.bezierCurveTo(
        currentSize * 0.9,
        currentSize * 0.6,
        currentSize * 0.7,
        -currentSize * 0.3,
        0,
        0
      );

      const leafGrad = ctx.createLinearGradient(0, 0, 0, currentSize * 1.18);
      leafGrad.addColorStop(0, leaf.color);
      leafGrad.addColorStop(1, '#133525');
      ctx.fillStyle = leafGrad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
      ctx.lineWidth = 0.85;
      ctx.stroke();

      // Midrib Vein
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.lineTo(0, currentSize * 0.98);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Lateral Veins
      for (let v = 1; v <= 3; v++) {
        const vy = (currentSize * 0.85 * v) / 4;
        ctx.beginPath();
        ctx.moveTo(0, vy);
        ctx.lineTo(-currentSize * 0.38, vy - currentSize * 0.1);
        ctx.moveTo(0, vy);
        ctx.lineTo(currentSize * 0.38, vy - currentSize * 0.1);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-700 z-0 overflow-hidden"
      style={{ opacity }}
    >
      {/* 2D High-Performance Organic Trellis & Architect Desk Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Floating Bottom-Right Trellis Controls & Scroll Growth Badge */}
      <div className="fixed bottom-6 right-6 pointer-events-auto z-40">
        <div className="bg-white/95 dark:bg-[#0c1e16]/95 backdrop-blur-md border border-[#bfc9c3]/50 dark:border-[#1e4d3a]/70 shadow-2xl rounded-2xl p-2.5 transition-all text-xs font-sans">
          <div className="flex items-center gap-2">
            
            {/* Main Toggle Button with Live Scroll Growth % */}
            <button
              onClick={() => setShowControls(!showControls)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] hover:bg-[#064e3b] font-semibold transition-all shadow-sm cursor-pointer"
              title="Living Trellis Growth Settings"
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Living Trellis</span>
              <span className="bg-white/20 dark:bg-black/20 px-1.5 py-0.5 rounded-md text-[10px] font-mono">
                {growthMode === 'scroll' ? `${scrollPercent}% Growth` : 'Active'}
              </span>
              {showControls ? (
                <ChevronDown className="w-3 h-3 ml-0.5" />
              ) : (
                <ChevronUp className="w-3 h-3 ml-0.5" />
              )}
            </button>

            {/* Quick Regrow Button */}
            <button
              onClick={regrow}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-[#13281f] border border-gray-200 dark:border-[#1e4d3a] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1b382b] font-semibold transition-all cursor-pointer"
              title="Reset and regrow vines"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Regrow</span>
            </button>
          </div>

          {/* Expanded Settings Panel */}
          {showControls && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#1e4d3a]/60 space-y-3.5 w-72 animate-in fade-in slide-in-from-bottom-2 duration-200">
              
              {/* Desk & Workstation Toggle */}
              <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-[#1e4d3a]/40">
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Desk & Setup Layer</span>
                </span>
                <button
                  onClick={() => setShowDesk(!showDesk)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                    showDesk
                      ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d]'
                      : 'bg-gray-200 dark:bg-[#1e4d3a] text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {showDesk ? 'Visible' : 'Hidden'}
                </button>
              </div>

              {/* Growth Trigger Mode */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Growth Trigger Mode
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {growthMode === 'scroll' ? 'Scroll-Driven' : growthMode === 'ambient' ? 'Continuous' : 'Full Canopy'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => setGrowthMode('scroll')}
                    className={`py-1.5 px-2 text-center rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      growthMode === 'scroll'
                        ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] shadow-sm'
                        : 'bg-gray-100 dark:bg-[#13281f] text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    <ArrowDown className="w-3 h-3" />
                    <span>On Scroll</span>
                  </button>
                  <button
                    onClick={() => setGrowthMode('ambient')}
                    className={`py-1.5 px-2 text-center rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      growthMode === 'ambient'
                        ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] shadow-sm'
                        : 'bg-gray-100 dark:bg-[#13281f] text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>Auto</span>
                  </button>
                  <button
                    onClick={() => setGrowthMode('full')}
                    className={`py-1.5 px-2 text-center rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      growthMode === 'full'
                        ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] shadow-sm'
                        : 'bg-gray-100 dark:bg-[#13281f] text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    <Flower2 className="w-3 h-3" />
                    <span>Full Bloom</span>
                  </button>
                </div>
                {growthMode === 'scroll' && (
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5 italic">
                    🌱 Scroll down the landing page to watch the vines climb from the desk up the trellis!
                  </p>
                )}
              </div>

              {/* Botanical Species */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1.5">
                  Botanical Species
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setSpecies('jasmine')}
                    className={`py-1.5 px-2 text-left rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      species === 'jasmine'
                        ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] shadow-sm'
                        : 'bg-gray-100 dark:bg-[#13281f] text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    <span>🌸 Star Jasmine</span>
                  </button>
                  <button
                    onClick={() => setSpecies('ivy')}
                    className={`py-1.5 px-2 text-left rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      species === 'ivy'
                        ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] shadow-sm'
                        : 'bg-gray-100 dark:bg-[#13281f] text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    <span>🍃 English Ivy</span>
                  </button>
                  <button
                    onClick={() => setSpecies('wisteria')}
                    className={`py-1.5 px-2 text-left rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      species === 'wisteria'
                        ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] shadow-sm'
                        : 'bg-gray-100 dark:bg-[#13281f] text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    <span>💜 Wisteria Vine</span>
                  </button>
                  <button
                    onClick={() => setSpecies('clematis')}
                    className={`py-1.5 px-2 text-left rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      species === 'clematis'
                        ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] shadow-sm'
                        : 'bg-gray-100 dark:bg-[#13281f] text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    <span>🌺 Pink Clematis</span>
                  </button>
                </div>
              </div>

              {/* Breeze Physics */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1.5">
                  Breeze Sway Physics
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {(['calm', 'gentle', 'breezy'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setBreezeStrength(mode)}
                      className={`py-1 px-1.5 capitalize text-center rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        breezeStrength === mode
                          ? 'bg-[#003527] dark:bg-[#52b788] text-white dark:text-[#06110d] shadow-sm'
                          : 'bg-gray-100 dark:bg-[#13281f] text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
