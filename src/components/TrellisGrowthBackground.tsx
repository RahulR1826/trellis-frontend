import React, { useEffect, useRef, useState } from 'react';
import {
  RotateCcw,
  Flower2,
  ChevronUp,
  ChevronDown,
  ArrowDown,
  Zap,
  Sprout
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
  opacity = 0.95,
  interactive = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Settings State
  const [species, setSpecies] = useState<PlantSpecies>('jasmine');
  const [growthMode, setGrowthMode] = useState<GrowthMode>('scroll');
  const [breezeStrength, setBreezeStrength] = useState<'calm' | 'gentle' | 'breezy'>('gentle');
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
      
      // Calculate growth target from scroll:
      // At top (0% scroll): 28% base sprout
      // At bottom (100% scroll): 100% full canopy trellis coverage
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
    const spacing = Math.max(90, Math.min(130, width / 11)); // responsive lattice spacing
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

    for (let i = 0; i < numRootVines; i++) {
      const rootX = (width / (numRootVines + 1)) * (i + 1) + (Math.random() - 0.5) * 50;
      const rootY = height + 20;
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

        // Sinusoidal twining and wandering around lattice
        const wanderFrequency = 0.7 + (i % 3) * 0.2;
        const wander = Math.sin(s * wanderFrequency + i * 1.4) * 60 + (Math.random() - 0.5) * 45;
        const targetX = Math.max(30, Math.min(width - 30, curX + wander));

        // Control points for organic bezier spline curve
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
          
          // Cubic Bezier interpolation
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

            // Branch leaves
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
      // A) DRAW WOODEN TRELLIS FRAMEWORK
      // ----------------------------------------
      // 1) Soft drop shadow
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

      // 2) Realistic Wood Slat Rendering with Warm Cedar Tones
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

      // 3) Lattice Intersections & Peg Joints
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
      // B) DRAW GROWING VINES, BRANCHES & LEAVES
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

        // Render main vine stem segments
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
      // C) OUTER WOODEN FRAME BORDER BEAMS
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
      // D) FLOATING SUNLIGHT SPORES / POLLEN
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
  }, [species, growthMode, breezeStrength, interactive, growthKey]);

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
      {/* 2D High-Performance Organic Trellis Canvas */}
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
                    🌱 Scroll down the landing page to watch the vines climb the trellis!
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
