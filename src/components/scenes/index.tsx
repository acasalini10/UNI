// AI-assisted (Claude Code): draws a university's scene from its spec (layers back to front: sky, light, clouds, far, water, middle, ground, foreground, weather) tinted with its brand color, and the Program detail 4 hero that fades it into the page background.
import { StyleSheet, View } from "react-native";
import Svg, { Defs, G, Line, LinearGradient, Path, Rect, Stop } from "react-native-svg";

import { colors } from "@/theme";

import { sceneTones, type SceneTones } from "./palette";
import { Bike, Birds, Building, Cloud, FogBands, H, Lamp, Light, Punt, Rain, Rainbow, RidgeShape, Sailboat, Snowfall, Stars, Tree, W, Water, seeded } from "./parts";
import { sceneSpecFor, type SceneSpec } from "./specs";

export { sceneSpecFor } from "./specs";

export function sceneAccent(university: string, brandColor: string | null): string {
  const spec = sceneSpecFor(university);
  return sceneTones(brandColor, spec.time, spec.weather, spec.season).accent;
}

const layerFill = (tones: SceneTones, layer: "far" | "mid" | "near") => tones[layer];

function GroundPattern({ spec, tones }: { spec: SceneSpec; tones: SceneTones }) {
  const ground = spec.ground;
  if (!ground?.pattern) return null;
  const top = Math.max(...ground.heights) + 4;
  const rows = Array.from({ length: Math.ceil((H - top) / 7) }, (_, i) => top + i * 7);
  if (ground.pattern === "fields") {
    return (
      <G opacity={0.35}>
        {rows.map((y) => (
          <Rect key={y} x={0} y={y} width={W} height={2} fill={tones.far} />
        ))}
      </G>
    );
  }
  if (ground.pattern === "vineyard") {
    return (
      <G opacity={0.45}>
        {rows.map((y, i) => (
          <Line key={y} x1={0} y1={y + 10} x2={W} y2={y - 14 + i} stroke={tones.foliage} strokeWidth={2} strokeDasharray="4 3" />
        ))}
      </G>
    );
  }
  // Dry-stone walls between fields.
  return (
    <G stroke={tones.far} strokeWidth={1.5} fill="none" opacity={0.6}>
      <Path d={`M0 ${top + 6} C120 ${top - 4} 220 ${top + 14} ${W} ${top + 2}`} />
      <Path d={`M140 ${top - 2} L110 ${H}`} />
      <Path d={`M300 ${top} L330 ${H}`} />
    </G>
  );
}

export function SceneDrawing({ university, brandColor }: { university: string; brandColor: string | null }) {
  const spec = sceneSpecFor(university);
  const tones = sceneTones(brandColor, spec.time, spec.weather, spec.season);
  const rnd = seeded(university);
  const dark = spec.time === "night" || spec.time === "dusk";
  const lit = dark || spec.time === "dawn" || spec.weather === "rain" || spec.weather === "snow";
  const winter = spec.season === "winter";
  const snowy = spec.weather === "snow";

  const buildings = (layer: "far" | "mid" | "near") =>
    (spec.buildings ?? [])
      .filter((b) => b.layer === layer)
      .flatMap((b, i) =>
        b.blocks.map(([x, w, h], j) => (
          <Building key={`${layer}${i}-${j}`} style={b.style} x={x} base={b.base} w={w} h={h} body={layerFill(tones, layer)} tones={tones} lit={lit} rnd={rnd} snowy={snowy || (winter && layer !== "near")} />
        )),
      );
  const trees = (layer: "mid" | "near") =>
    (spec.trees ?? [])
      .filter((t) => t.layer === layer)
      .flatMap((t, i) =>
        t.xs.map((x, j) => <Tree key={`${layer}${i}-${j}`} kind={t.kind} x={x} y={t.base} size={t.size} tones={tones} fill={layerFill(tones, layer)} winter={winter} snowy={snowy} />),
      );

  return (
    <G>
      <Sky tones={tones} />
      {dark && <Stars tones={tones} rnd={rnd} />}
      <Light x={spec.light.x} y={spec.light.y} moon={dark} tones={tones} hazy={spec.weather === "fog" || spec.weather === "cloudy" || spec.weather === "rain"} />
      {spec.rainbow && <Rainbow tones={tones} />}
      {(spec.clouds ?? []).map(([x, y, scale]) => (
        <Cloud key={`${x}-${y}`} x={x} y={y} scale={scale} tones={tones} opacity={spec.weather === "rain" || spec.weather === "cloudy" ? 0.8 : 0.55} />
      ))}
      {spec.far && <RidgeShape ridge={spec.far} fill={tones.far} snow={spec.far.shape === "mountains" ? tones.snow : undefined} />}
      {buildings("far")}
      {spec.water && <Water y={spec.water.y} tones={tones} lightX={spec.light.x} rnd={rnd} />}
      {spec.water?.boats?.map((b) => (b.kind === "sail" ? <Sailboat key={b.x} x={b.x} y={b.y} tones={tones} /> : <Punt key={b.x} x={b.x} y={b.y} tones={tones} />))}
      {spec.quay && <Rect x={0} y={spec.quay.y} width={W} height={spec.quay.h} fill={tones.near} />}
      {spec.mid && <RidgeShape ridge={spec.mid} fill={tones.mid} />}
      {spec.ground && <RidgeShape ridge={spec.ground} fill={snowy ? tones.snow : tones.near} />}
      <GroundPattern spec={spec} tones={tones} />
      {spec.tramWires !== undefined && (
        <G stroke={tones.near} strokeWidth={1}>
          <Line x1={0} y1={spec.tramWires} x2={W} y2={spec.tramWires + 6} />
          <Line x1={0} y1={spec.tramWires + 5} x2={W} y2={spec.tramWires + 11} />
        </G>
      )}
      {buildings("mid")}
      {trees("mid")}
      {buildings("near")}
      {trees("near")}
      {spec.bikes?.map(([x, y]) => <Bike key={x} x={x} y={y} tones={tones} />)}
      {spec.lamps?.map(([x, y]) => <Lamp key={x} x={x} y={y} tones={tones} lit={lit} />)}
      {spec.birds && <Birds tones={tones} x={spec.birds[0]} y={spec.birds[1]} />}
      {spec.weather === "rain" && <Rain tones={tones} rnd={rnd} />}
      {spec.weather === "snow" && <Snowfall tones={tones} rnd={rnd} />}
      {spec.weather === "fog" && <FogBands tones={tones} />}
      {spec.weather === "wind" && (
        <G stroke={tones.cloud} strokeWidth={1.2} opacity={0.35} fill="none">
          <Path d="M60 110 q40 -8 80 0 t80 0" />
          <Path d="M200 132 q30 -6 60 0 t60 0" />
        </G>
      )}
    </G>
  );
}

function Sky({ tones }: { tones: SceneTones }) {
  return (
    <G>
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={tones.skyTop} />
          <Stop offset="0.7" stopColor={tones.skyHorizon} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={W} height={H} fill="url(#sky)" />
    </G>
  );
}

// Decorative only: hidden from VoiceOver.
export function ProgramHero({ university, brandColor, height }: { university: string; brandColor: string | null; height: number }) {
  return (
    <View style={[styles.hero, { height }]} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <Defs>
          {/* Darker top behind the status bar and buttons, page color at the bottom so the title below reads on a plain background. */}
          <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.bg} stopOpacity={0.5} />
            <Stop offset="0.25" stopColor={colors.bg} stopOpacity={0} />
            <Stop offset="0.72" stopColor={colors.bg} stopOpacity={0} />
            <Stop offset="1" stopColor={colors.bg} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <SceneDrawing university={university} brandColor={brandColor} />
        <Rect x={0} y={0} width={W} height={H} fill="url(#fade)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: "100%", backgroundColor: colors.bg },
});
