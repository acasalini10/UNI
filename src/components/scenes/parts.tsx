// AI-assisted (Claude Code): shared layer components for the university scenes: sky, light, weather, ridges, water, buildings in generic regional styles, trees, boats and small details. Generic only: no real buildings, landmarks, text or symbols (guideline 5.2, data.md).
import type { ReactElement } from "react";
import { Circle, Ellipse, G, Line, Path, Polygon, Rect } from "react-native-svg";

import type { SceneTones } from "./palette";
import type { BuildingStyle, Ridge, TreeKind } from "./specs";

// Every scene draws in this box; the hero crops it with "slice". Buttons sit in the top 56 units.
export const W = 400;
export const H = 240;

// Small deterministic random generator, so a scene looks the same on every render.
export function seeded(key: string): () => number {
  let a = 0;
  for (let i = 0; i < key.length; i++) a = (Math.imul(a ^ key.charCodeAt(i), 2654435761) + i) | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Stars({ tones, rnd }: { tones: SceneTones; rnd: () => number }) {
  return (
    <G>
      {Array.from({ length: 28 }, (_, i) => (
        <Circle key={i} cx={rnd() * W} cy={rnd() * 110} r={rnd() < 0.2 ? 1.3 : 0.7} fill={tones.light} opacity={0.4 + rnd() * 0.5} />
      ))}
    </G>
  );
}

// Sun with a soft halo, or a crescent moon at night and dusk.
export function Light({ x, y, moon, tones, hazy }: { x: number; y: number; moon: boolean; tones: SceneTones; hazy: boolean }) {
  if (moon) {
    return (
      <G>
        <Circle cx={x} cy={y} r={22} fill={tones.light} opacity={0.08} />
        <Circle cx={x} cy={y} r={11} fill={tones.light} />
        <Circle cx={x + 5} cy={y - 3} r={10} fill={tones.skyTop} />
      </G>
    );
  }
  return (
    <G opacity={hazy ? 0.45 : 1}>
      <Circle cx={x} cy={y} r={46} fill={tones.light} opacity={0.08} />
      <Circle cx={x} cy={y} r={30} fill={tones.light} opacity={0.14} />
      <Circle cx={x} cy={y} r={18} fill={tones.light} />
    </G>
  );
}

export function Cloud({ x, y, scale, tones, opacity = 0.55 }: { x: number; y: number; scale: number; tones: SceneTones; opacity?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <Ellipse cx={0} cy={0} rx={30} ry={8} fill={tones.cloud} />
      <Ellipse cx={-8} cy={-6} rx={15} ry={9} fill={tones.cloud} />
      <Ellipse cx={10} cy={-9} rx={14} ry={11} fill={tones.cloud} />
    </G>
  );
}

export function Rain({ tones, rnd }: { tones: SceneTones; rnd: () => number }) {
  return (
    <G opacity={0.35}>
      {Array.from({ length: 60 }, (_, i) => {
        const x = rnd() * (W + 40);
        const y = rnd() * H;
        return <Line key={i} x1={x} y1={y} x2={x - 5} y2={y + 14} stroke={tones.cloud} strokeWidth={1} />;
      })}
    </G>
  );
}

export function Snowfall({ tones, rnd }: { tones: SceneTones; rnd: () => number }) {
  return (
    <G opacity={0.8}>
      {Array.from({ length: 70 }, (_, i) => (
        <Circle key={i} cx={rnd() * W} cy={rnd() * H} r={0.8 + rnd() * 1.4} fill={tones.snow} />
      ))}
    </G>
  );
}

export function FogBands({ tones }: { tones: SceneTones }) {
  return (
    <G>
      {[150, 172, 196].map((y, i) => (
        <Rect key={y} x={-20} y={y} width={W + 40} height={14 + i * 4} rx={9} fill={tones.cloud} opacity={0.22} />
      ))}
    </G>
  );
}

export function Birds({ tones, x, y }: { tones: SceneTones; x: number; y: number }) {
  return (
    <G stroke={tones.near} strokeWidth={1.4} fill="none" opacity={0.7}>
      {[
        [0, 0, 1],
        [14, 6, 0.8],
        [-12, 9, 0.7],
      ].map(([dx, dy, s], i) => (
        <Path key={i} d={`M${x + dx - 6 * s} ${y + dy} q${3 * s} ${-4 * s} ${6 * s} 0 q${3 * s} ${-4 * s} ${6 * s} 0`} />
      ))}
    </G>
  );
}

export function Rainbow({ tones }: { tones: SceneTones }) {
  return (
    <G fill="none" opacity={0.3}>
      {[0, 6, 12].map((d) => (
        <Path key={d} d={`M${150 + d} 170 A ${110 - d} ${110 - d} 0 0 1 ${370 - d} 170`} stroke={d === 6 ? tones.blossom : tones.light} strokeWidth={4} />
      ))}
    </G>
  );
}

// Land outline from left to right; closed at the bottom of the box.
export function RidgeShape({ ridge, fill, snow }: { ridge: Ridge; fill: string; snow?: string }) {
  const pts = ridge.heights;
  const step = W / (pts.length - 1);
  if (ridge.shape === "mountains") {
    const line = pts.map((y, i) => `${i * step},${y}`).join(" ");
    return (
      <G>
        <Polygon points={`0,${H} ${line} ${W},${H}`} fill={fill} />
        {snow &&
          pts.map((y, i) => {
            const before = pts[i - 1];
            const after = pts[i + 1];
            if (before === undefined || after === undefined || y > before - 12 || y > after - 12) return null;
            const x = i * step;
            const dl = Math.min(18, (before - y) * 0.5);
            const dr = Math.min(18, (after - y) * 0.5);
            const ratioL = (step * dl) / (before - y);
            const ratioR = (step * dr) / (after - y);
            return <Polygon key={i} points={`${x},${y} ${x - ratioL},${y + dl} ${x - ratioL / 3},${y + dl - 4} ${x + ratioR / 3},${y + dr} ${x + ratioR},${y + dr}`} fill={snow} />;
          })}
      </G>
    );
  }
  if (ridge.shape === "mesas") {
    let d = `M0 ${H} L0 ${pts[0]}`;
    for (let i = 1; i < pts.length; i++) {
      const x0 = (i - 1) * step;
      const x1 = i * step;
      d += ` L${x0 + step * 0.35} ${pts[i - 1]} L${x0 + step * 0.5} ${pts[i]} L${x1} ${pts[i]}`;
    }
    return <Path d={`${d} L${W} ${H} Z`} fill={fill} />;
  }
  if (ridge.shape === "crag") {
    // Rough hill: a steep rocky face on one side, a long slope on the other.
    let d = `M0 ${H} L0 ${pts[0]}`;
    for (let i = 1; i < pts.length; i++) {
      const x = i * step;
      d += ` L${x - step * 0.6} ${(pts[i - 1] + pts[i]) / 2 - 3} L${x} ${pts[i]}`;
    }
    return <Path d={`${d} L${W} ${H} Z`} fill={fill} />;
  }
  // hills and flat: smooth curve
  let d = `M0 ${H} L0 ${pts[0]}`;
  for (let i = 1; i < pts.length; i++) {
    const x0 = (i - 1) * step;
    const x1 = i * step;
    const mx = (x0 + x1) / 2;
    d += ` C${mx} ${pts[i - 1]} ${mx} ${pts[i]} ${x1} ${pts[i]}`;
  }
  return <Path d={`${d} L${W} ${H} Z`} fill={fill} />;
}

export function Water({ y, tones, lightX, rnd }: { y: number; tones: SceneTones; lightX: number; rnd: () => number }) {
  return (
    <G>
      <Rect x={0} y={y} width={W} height={H - y} fill={tones.water} />
      {/* Light path and ripples */}
      {Array.from({ length: 7 }, (_, i) => {
        const w = 26 - i * 2.5;
        return <Rect key={`l${i}`} x={lightX - w / 2 + (rnd() - 0.5) * 6} y={y + 4 + i * 7} width={w} height={1.6} fill={tones.light} opacity={0.35} />;
      })}
      {Array.from({ length: 10 }, (_, i) => (
        <Rect key={`r${i}`} x={rnd() * W} y={y + 6 + rnd() * (H - y - 10)} width={14 + rnd() * 24} height={1.2} fill={tones.cloud} opacity={0.22} />
      ))}
    </G>
  );
}

export function Sailboat({ x, y, tones, scale = 1 }: { x: number; y: number; tones: SceneTones; scale?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`}>
      <Polygon points="0,-26 0,-2 16,-2" fill={tones.wall} />
      <Polygon points="-2,-20 -2,-2 -11,-2" fill={tones.wall} opacity={0.8} />
      <Path d="M-14 0 L18 0 L13 5 L-10 5 Z" fill={tones.near} />
    </G>
  );
}

export function Punt({ x, y, tones }: { x: number; y: number; tones: SceneTones }) {
  return (
    <G>
      <Rect x={x} y={y} width={34} height={4} fill={tones.near} />
      <Line x1={x + 28} y1={y} x2={x + 36} y2={y - 26} stroke={tones.near} strokeWidth={1.5} />
      <Rect x={x + 26} y={y - 12} width={4} height={12} fill={tones.near} />
    </G>
  );
}

export function Bike({ x, y, tones }: { x: number; y: number; tones: SceneTones }) {
  return (
    <G stroke={tones.near} strokeWidth={1.4} fill="none">
      <Circle cx={x} cy={y} r={5} />
      <Circle cx={x + 16} cy={y} r={5} />
      <Path d={`M${x} ${y} L${x + 6} ${y - 8} L${x + 13} ${y - 8} L${x + 16} ${y} M${x + 6} ${y - 8} L${x + 9} ${y} L${x + 13} ${y - 8}`} />
    </G>
  );
}

export function Lamp({ x, y, tones, lit }: { x: number; y: number; tones: SceneTones; lit: boolean }) {
  return (
    <G>
      {lit && <Circle cx={x} cy={y - 30} r={10} fill={tones.lamp} opacity={0.25} />}
      <Rect x={x - 1} y={y - 30} width={2} height={30} fill={tones.near} />
      <Circle cx={x} cy={y - 31} r={3} fill={lit ? tones.lamp : tones.window} />
    </G>
  );
}

export function Tree({ kind, x, y, size, tones, fill, winter, snowy }: { kind: TreeKind; x: number; y: number; size: number; tones: SceneTones; fill: string; winter: boolean; snowy: boolean }) {
  const s = size;
  const bare = winter && (kind === "round" || kind === "blossom" || kind === "poplar" || kind === "plane");
  if (bare) {
    return (
      <G stroke={fill} strokeWidth={1.4} fill="none">
        <Line x1={x} y1={y} x2={x} y2={y - s * 1.4} strokeWidth={2.2} />
        <Path d={`M${x} ${y - s * 0.7} l${-s * 0.5} ${-s * 0.5} M${x} ${y - s * 0.9} l${s * 0.5} ${-s * 0.55} M${x} ${y - s * 1.2} l${-s * 0.3} ${-s * 0.35} M${x - s * 0.3} ${y - s * 1.0} l${-s * 0.15} ${-s * 0.3}`} />
      </G>
    );
  }
  const crown = kind === "pine" || kind === "cypress" || kind === "cactus" || kind === "palm" ? fill : tones.foliage;
  switch (kind) {
    case "pine":
      return (
        <G>
          <Polygon points={`${x},${y - s * 1.8} ${x - s * 0.55},${y - s * 0.2} ${x + s * 0.55},${y - s * 0.2}`} fill={crown} />
          <Rect x={x - s * 0.06} y={y - s * 0.25} width={s * 0.12} height={s * 0.25} fill={fill} />
          {snowy && <Polygon points={`${x},${y - s * 1.8} ${x - s * 0.18},${y - s * 1.3} ${x + s * 0.18},${y - s * 1.3}`} fill={tones.snow} />}
        </G>
      );
    case "cypress":
      return <Ellipse cx={x} cy={y - s * 0.95} rx={s * 0.18} ry={s * 0.95} fill={crown} />;
    case "poplar":
      return (
        <G>
          <Rect x={x - s * 0.05} y={y - s * 0.3} width={s * 0.1} height={s * 0.3} fill={fill} />
          <Ellipse cx={x} cy={y - s * 0.95} rx={s * 0.28} ry={s * 0.75} fill={crown} />
        </G>
      );
    case "palm":
      return (
        <G>
          <Path d={`M${x} ${y} Q${x + s * 0.15} ${y - s} ${x + s * 0.3} ${y - s * 1.7}`} stroke={fill} strokeWidth={s * 0.1} fill="none" />
          {[-150, -110, -60, -20, 20].map((a) => {
            const r = (a * Math.PI) / 180;
            const cx = x + s * 0.3;
            const cy = y - s * 1.7;
            return <Path key={a} d={`M${cx} ${cy} Q${cx + Math.cos(r) * s * 0.5} ${cy + Math.sin(r) * s * 0.5 - s * 0.2} ${cx + Math.cos(r) * s * 0.85} ${cy + Math.sin(r) * s * 0.85 + s * 0.15}`} stroke={crown} strokeWidth={s * 0.1} fill="none" />;
          })}
        </G>
      );
    case "cactus":
      return (
        <G fill={crown}>
          <Rect x={x - s * 0.1} y={y - s * 1.3} width={s * 0.2} height={s * 1.3} rx={s * 0.1} />
          <Path d={`M${x - s * 0.1} ${y - s * 0.6} h${-s * 0.25} v${-s * 0.35}`} stroke={crown} strokeWidth={s * 0.14} strokeLinecap="round" fill="none" />
          <Path d={`M${x + s * 0.1} ${y - s * 0.8} h${s * 0.25} v${-s * 0.3}`} stroke={crown} strokeWidth={s * 0.14} strokeLinecap="round" fill="none" />
        </G>
      );
    case "eucalyptus":
      return (
        <G>
          <Path d={`M${x} ${y} L${x + s * 0.05} ${y - s * 1.2} M${x + s * 0.05} ${y - s * 0.9} L${x - s * 0.25} ${y - s * 1.3}`} stroke={fill} strokeWidth={s * 0.08} fill="none" />
          <Ellipse cx={x + s * 0.1} cy={y - s * 1.45} rx={s * 0.4} ry={s * 0.28} fill={crown} />
          <Ellipse cx={x - s * 0.3} cy={y - s * 1.35} rx={s * 0.25} ry={s * 0.2} fill={crown} />
        </G>
      );
    case "olive":
      return (
        <G>
          <Path d={`M${x} ${y} Q${x - s * 0.1} ${y - s * 0.4} ${x + s * 0.05} ${y - s * 0.6}`} stroke={fill} strokeWidth={s * 0.12} fill="none" />
          <Ellipse cx={x} cy={y - s * 0.8} rx={s * 0.6} ry={s * 0.32} fill={crown} />
        </G>
      );
    case "blossom":
    case "round":
    case "plane":
    default: {
      const r = kind === "plane" ? s * 0.7 : s * 0.55;
      return (
        <G>
          <Rect x={x - s * 0.06} y={y - s * 0.5} width={s * 0.12} height={s * 0.5} fill={fill} />
          <Circle cx={x} cy={y - s * 0.5 - r * 0.8} r={r} fill={crown} />
          {kind === "plane" && <Circle cx={x - r * 0.7} cy={y - s * 0.5 - r * 0.5} r={r * 0.6} fill={crown} />}
          {(kind === "blossom" || (snowy && !winter)) &&
            [
              [-0.4, -0.9],
              [0.3, -1.2],
              [0.1, -0.5],
              [-0.1, -1.5],
              [0.5, -0.8],
            ].map(([dx, dy], i) => <Circle key={i} cx={x + dx * r} cy={y - s * 0.5 + dy * r} r={r * 0.14} fill={tones.blossom} />)}
        </G>
      );
    }
  }
}

type BuildingArgs = { style: BuildingStyle; x: number; base: number; w: number; h: number; body: string; tones: SceneTones; lit: boolean; rnd: () => number; snowy: boolean };

// Rows and columns of windows; lit ones glow at dusk and night.
function windows(x: number, top: number, w: number, h: number, cols: number, rows: number, a: BuildingArgs, shape: "rect" | "arch" | "band" = "rect"): ReactElement[] {
  const out: ReactElement[] = [];
  const cw = w / cols;
  const rh = h / rows;
  for (let r = 0; r < rows; r++) {
    if (shape === "band") {
      out.push(<Rect key={`b${r}`} x={x + 2} y={top + r * rh + rh * 0.3} width={w - 4} height={rh * 0.38} fill={a.lit && a.rnd() < 0.6 ? a.tones.lamp : a.tones.window} opacity={0.85} />);
      continue;
    }
    for (let c = 0; c < cols; c++) {
      const on = a.lit ? a.rnd() < 0.55 : false;
      const wx = x + c * cw + cw * 0.3;
      const wy = top + r * rh + rh * 0.25;
      const ww = cw * 0.4;
      const wh = rh * 0.5;
      const fill = on ? a.tones.lamp : a.tones.window;
      out.push(
        shape === "arch" ? (
          <Path key={`${r}-${c}`} d={`M${wx} ${wy + wh} V${wy + ww / 2} A${ww / 2} ${ww / 2} 0 0 1 ${wx + ww} ${wy + ww / 2} V${wy + wh} Z`} fill={fill} opacity={on ? 0.95 : 0.6} />
        ) : (
          <Rect key={`${r}-${c}`} x={wx} y={wy} width={ww} height={wh} fill={fill} opacity={on ? 0.95 : 0.6} />
        ),
      );
    }
  }
  return out;
}

export function Building(a: BuildingArgs) {
  const { style, x, base, w, h, body, tones } = a;
  const top = base - h;
  const roofSnow = a.snowy ? tones.snow : body;
  const floors = Math.max(1, Math.round(h / 16));
  const cols = Math.max(1, Math.round(w / 12));
  switch (style) {
    case "brownstone":
      return (
        <G>
          <Rect x={x} y={top} width={w} height={h} fill={body} />
          <Rect x={x - 2} y={top - 3} width={w + 4} height={4} fill={roofSnow} />
          {windows(x, top + 4, w, h - 8, cols, floors, a)}
        </G>
      );
    case "stucco":
      return (
        <G>
          <Rect x={x} y={top} width={w} height={h} fill={tones.wall} />
          <Rect x={x - 1} y={top - 3} width={w + 2} height={3} fill={tones.wall} />
          <Rect x={x} y={base - 10} width={w} height={2} fill={tones.window} opacity={0.5} />
          {windows(x, top + 3, w, h - 14, cols, Math.max(1, floors - 1), a)}
        </G>
      );
    case "georgian":
    case "terrace":
    case "tenement": {
      const pitched = style !== "georgian";
      return (
        <G>
          <Rect x={x} y={top} width={w} height={h} fill={style === "tenement" ? tones.wall : body} opacity={style === "tenement" ? 0.75 : 1} />
          {pitched && <Polygon points={`${x - 1},${top} ${x + w * 0.2},${top - 9} ${x + w * 0.8},${top - 9} ${x + w + 1},${top}`} fill={roofSnow} />}
          <Rect x={x + w * 0.15} y={top - (pitched ? 15 : 7)} width={4} height={pitched ? 8 : 7} fill={body} />
          <Rect x={x + w * 0.75} y={top - (pitched ? 15 : 7)} width={4} height={pitched ? 8 : 7} fill={body} />
          {windows(x, top + 2, w, h - 4, cols, floors, a)}
        </G>
      );
    }
    case "stone":
      return (
        <G>
          <Rect x={x} y={top} width={w} height={h} fill={tones.wall} opacity={0.7} />
          <Polygon points={`${x},${top} ${x + w / 2},${top - Math.min(w * 0.45, 18)} ${x + w},${top}`} fill={roofSnow === body ? tones.near : roofSnow} />
          {windows(x, top + 3, w, h - 6, cols, Math.max(1, floors - 1), a, "arch")}
        </G>
      );
    case "modern":
      return (
        <G>
          <Rect x={x} y={top} width={w} height={h} fill={body} />
          {windows(x, top + 2, w, h - 4, 1, floors, a, "band")}
        </G>
      );
    case "canal": {
      // Narrow house with a curved gable.
      const gable = Math.min(w * 0.8, 16);
      return (
        <G>
          <Path d={`M${x} ${base} V${top} C${x} ${top - gable * 0.4} ${x + w * 0.25} ${top - gable * 0.5} ${x + w * 0.3} ${top - gable} H${x + w * 0.7} C${x + w * 0.75} ${top - gable * 0.5} ${x + w} ${top - gable * 0.4} ${x + w} ${top} V${base} Z`} fill={body} />
          {windows(x, top - gable * 0.6, w, h + gable * 0.6 - 4, Math.max(1, cols), floors + 1, a)}
        </G>
      );
    }
    case "mediterranean":
      return (
        <G>
          <Rect x={x} y={top} width={w} height={h} fill={tones.wall} />
          <Rect x={x} y={top - 4} width={w * 0.4} height={4} fill={tones.wall} />
          <Line x1={x + w * 0.45} y1={top - 3} x2={x + w} y2={top - 3} stroke={tones.window} strokeWidth={1} />
          {windows(x, top + 3, w, h - 6, Math.max(1, Math.round(cols / 1.5)), Math.max(1, floors - 1), a)}
        </G>
      );
    case "ochre":
      return (
        <G>
          <Rect x={x} y={top} width={w} height={h} fill={tones.wall} opacity={0.85} />
          <Polygon points={`${x - 3},${top} ${x + 4},${top - 6} ${x + w - 4},${top - 6} ${x + w + 3},${top}`} fill={roofSnow === body ? tones.mid : roofSnow} />
          {windows(x, top + 3, w, h - 6, cols, floors, a)}
        </G>
      );
    case "chalet":
      return (
        <G>
          <Rect x={x} y={top} width={w} height={h} fill={body} />
          <Polygon points={`${x - 6},${top + 2} ${x + w / 2},${top - w * 0.35} ${x + w + 6},${top + 2}`} fill={roofSnow === body ? tones.near : roofSnow} />
          {windows(x, top + 3, w, h - 6, Math.max(1, cols - 1), Math.max(1, floors), a)}
        </G>
      );
    case "farm":
      return (
        <G>
          <Rect x={x} y={top} width={w} height={h} fill={body} />
          <Polygon points={`${x - 2},${top} ${x + w / 2},${top - w * 0.3} ${x + w + 2},${top}`} fill={roofSnow === body ? tones.near : roofSnow} />
          <Rect x={x + w + 3} y={top - w * 0.2} width={w * 0.22} height={h + w * 0.2} rx={w * 0.11} fill={tones.wall} opacity={0.75} />
        </G>
      );
    case "adobe":
      return (
        <G>
          <Rect x={x} y={top} width={w} height={h} rx={3} fill={tones.wall} opacity={0.8} />
          {windows(x, top + 3, w, h - 6, Math.max(1, Math.round(cols / 2)), 1, a)}
        </G>
      );
    case "villa":
      return (
        <G>
          <Rect x={x} y={top} width={w} height={h} fill={tones.wall} opacity={0.8} />
          <Polygon points={`${x - 2},${top} ${x + w / 2},${top - w * 0.3} ${x + w + 2},${top}`} fill={roofSnow === body ? tones.mid : roofSnow} />
          {windows(x, top + 2, w, h - 4, Math.max(1, cols - 1), 1, a)}
        </G>
      );
    case "brick":
    default:
      return (
        <G>
          <Rect x={x} y={top} width={w} height={h} fill={body} />
          <Rect x={x - 1} y={top - 2} width={w + 2} height={2} fill={roofSnow} />
          {windows(x, top + 3, w, h - 6, cols, floors, a)}
        </G>
      );
  }
}
