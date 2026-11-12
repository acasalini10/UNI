// AI-assisted (Claude Code): scene tones from a university brand color and the scene's time of day, weather and season. Hue from the brand, fixed lightness ladder per time of day, so a dark navy and a light gold give scenes equally readable on the dark page.
import { colors } from "@/theme";

export type Time = "dawn" | "morning" | "noon" | "afternoon" | "sunset" | "dusk" | "night";
export type Weather = "clear" | "cloudy" | "rain" | "snow" | "fog" | "wind";
export type Season = "spring" | "summer" | "autumn" | "winter";

export type SceneTones = {
  skyTop: string;
  skyHorizon: string; // warmer at dawn and sunset
  light: string; // sun or moon
  cloud: string;
  far: string; // farthest layer
  mid: string;
  near: string; // closest layer, darkest
  wall: string; // light walls (stucco, whitewash, stone)
  window: string; // unlit windows
  lamp: string; // lit windows, street lamps
  foliage: string; // tree crowns: seasonal
  blossom: string; // spring flowers, autumn leaves
  water: string;
  snow: string;
  accent: string; // light accent used on the page (key facts strip)
};

// No brand color yet (data.md: blank = not published): the app accent blue.
const FALLBACK = colors.accent;

const SKY: Record<Time, number> = { night: 0.12, dusk: 0.2, dawn: 0.3, sunset: 0.28, morning: 0.4, afternoon: 0.38, noon: 0.44 };
// Daylight factor for the land layers.
const DAY: Record<Time, number> = { night: 0.55, dusk: 0.68, dawn: 0.85, sunset: 0.82, morning: 1, afternoon: 0.97, noon: 1 };

export function hexToHsl(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16);
  const r = ((value >> 16) & 255) / 255;
  const g = ((value >> 8) & 255) / 255;
  const b = (value & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function hsl(h: number, s: number, l: number): string {
  const clamp = (v: number) => Math.min(Math.max(v, 0), 1);
  return `hsl(${Math.round(((h % 360) + 360) % 360)}, ${Math.round(clamp(s) * 100)}%, ${Math.round(clamp(l) * 100)}%)`;
}

// Move hue a toward hue b by t (shortest way round the circle).
function towards(a: number, b: number, t: number): number {
  const d = ((b - a + 540) % 360) - 180;
  return a + d * t;
}

export function sceneTones(brandColor: string | null, time: Time = "afternoon", weather: Weather = "clear", season: Season = "summer"): SceneTones {
  const [h, rawS] = hexToHsl(brandColor ?? FALLBACK);
  // Keep greys grey, but stop strong colors from glowing on the dark page.
  const base = rawS < 0.08 ? rawS : Math.min(Math.max(rawS, 0.35), 0.7);
  const s = weather === "fog" || weather === "rain" || weather === "cloudy" ? base * 0.65 : base;
  const day = DAY[time];
  const sky = SKY[time] + (weather === "fog" ? 0.06 : 0);
  const warm = time === "dawn" || time === "sunset";
  const autumn = towards(h, 28, 0.6);
  return {
    skyTop: hsl(h, s * 0.8, sky),
    skyHorizon: warm ? hsl(towards(h, 30, 0.5), Math.max(s, 0.45), sky + 0.2) : hsl(h, s * 0.7, sky + 0.12),
    light: warm ? hsl(towards(h, 40, 0.6), 0.75, 0.8) : time === "night" || time === "dusk" ? hsl(h, 0.2, 0.88) : hsl(h, s * 0.4, 0.9),
    cloud: hsl(h, s * 0.35, Math.min(sky + 0.32, 0.86)),
    far: hsl(h, s, 0.46 * day),
    mid: hsl(h, s, 0.35 * day),
    near: hsl(h, s, Math.max(0.23 * day, 0.11)),
    wall: hsl(h, s * 0.35, 0.72 * day),
    window: hsl(h, s * 0.5, 0.6 * day),
    lamp: hsl(44, 0.9, 0.74),
    foliage: season === "autumn" ? hsl(autumn, 0.55, 0.32 * day) : hsl(h, s, 0.27 * day),
    blossom: season === "autumn" ? hsl(autumn, 0.7, 0.55 * day) : hsl(towards(h, 340, 0.4), 0.55, 0.8 * day),
    water: hsl(h, s * 0.85, sky + 0.04),
    snow: hsl(h, 0.15, 0.9 * Math.max(day, 0.7)),
    accent: hsl(h, base, 0.62),
  };
}
