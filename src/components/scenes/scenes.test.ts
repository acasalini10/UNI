/// <reference types="jest" />
/// <reference types="node" />
// AI-assisted (Claude Code): every university in the seed has a brand color and its own scene; no two share either (except the declared IE pair), and colors stay far enough apart to tell badges apart on Programs 3.
import { readFileSync } from "fs";
import { join } from "path";

import { sceneSpecs, sharedScenes } from "./specs";

// Minimal CSV reader: commas, quoted fields with commas inside.
function readUniversities(): { name: string; brand_color: string }[] {
  const text = readFileSync(join(__dirname, "../../../supabase/seed/universities.csv"), "utf8").trim();
  const [header, ...lines] = text.split(/\r?\n/).map((line) => {
    const fields: string[] = [];
    let field = "";
    let quoted = false;
    for (const c of line) {
      if (c === '"') quoted = !quoted;
      else if (c === "," && !quoted) {
        fields.push(field);
        field = "";
      } else field += c;
    }
    fields.push(field);
    return fields;
  });
  return lines.map((values) => Object.fromEntries(header.map((name, i) => [name, values[i] ?? ""])) as { name: string; brand_color: string });
}

// CIEDE2000 color difference between two "#RRGGBB" colors.
function lab(hex: string): [number, number, number] {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92));
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const x = f((r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047);
  const y = f(r * 0.2126 + g * 0.7152 + b * 0.0722);
  const z = f((r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

function deltaE(c1: string, c2: string): number {
  const [L1, a1, b1] = lab(c1);
  const [L2, a2, b2] = lab(c2);
  const rad = Math.PI / 180;
  const Cm = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)));
  const [ap1, ap2] = [a1 * (1 + G), a2 * (1 + G)];
  const [Cp1, Cp2] = [Math.hypot(ap1, b1), Math.hypot(ap2, b2)];
  const hue = (b: number, a: number) => (Math.atan2(b, a) / rad + 360) % 360;
  const [h1, h2] = [hue(b1, ap1), hue(b2, ap2)];
  let dh = h2 - h1;
  if (Cp1 * Cp2 === 0) dh = 0;
  else if (dh > 180) dh -= 360;
  else if (dh < -180) dh += 360;
  const dL = L2 - L1;
  const dC = Cp2 - Cp1;
  const dH = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin((dh * rad) / 2);
  const Lm = (L1 + L2) / 2;
  const Cpm = (Cp1 + Cp2) / 2;
  let hm = h1 + h2;
  if (Cp1 * Cp2 !== 0) {
    if (Math.abs(h1 - h2) > 180) hm += hm < 360 ? 360 : -360;
    hm /= 2;
  }
  const T = 1 - 0.17 * Math.cos((hm - 30) * rad) + 0.24 * Math.cos(2 * hm * rad) + 0.32 * Math.cos((3 * hm + 6) * rad) - 0.2 * Math.cos((4 * hm - 63) * rad);
  const dTheta = 30 * Math.exp(-(((hm - 275) / 25) ** 2));
  const Rc = 2 * Math.sqrt(Cpm ** 7 / (Cpm ** 7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lm - 50) ** 2) / Math.sqrt(20 + (Lm - 50) ** 2);
  const Sc = 1 + 0.045 * Cpm;
  const Sh = 1 + 0.015 * Cpm * T;
  const Rt = -Math.sin(2 * dTheta * rad) * Rc;
  return Math.sqrt((dL / Sl) ** 2 + (dC / Sc) ** 2 + (dH / Sh) ** 2 + Rt * (dC / Sc) * (dH / Sh));
}

// Clearly different at a glance (a just-noticeable difference is about 2).
const MIN_DISTANCE = 12;

const universities = readUniversities();
const sharedWith = (name: string) => sharedScenes.find((group) => group.includes(name)) ?? [name];
const sameGroup = (a: string, b: string) => sharedWith(a).includes(b);

describe("university colors and scenes", () => {
  test("the seed lists universities", () => {
    expect(universities.length).toBeGreaterThan(0);
  });

  test.each(universities.map((u) => [u.name, u.brand_color]))("%s has a brand color", (_name, color) => {
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  test.each(universities.map((u) => [u.name]))("%s has its own scene spec", (name) => {
    expect(sceneSpecs[name]).toBeDefined();
  });

  test("no scene spec without a university in the seed", () => {
    const names = new Set(universities.map((u) => u.name));
    expect(Object.keys(sceneSpecs).filter((name) => !names.has(name))).toEqual([]);
  });

  test("two universities never share a color or a scene, except a declared group", () => {
    for (const a of universities) {
      for (const b of universities) {
        if (a.name >= b.name) continue;
        const shared = sameGroup(a.name, b.name);
        const specA = JSON.stringify(sceneSpecs[a.name]);
        const specB = JSON.stringify(sceneSpecs[b.name]);
        if (shared) {
          expect([a.name, b.name, a.brand_color]).toEqual([a.name, b.name, b.brand_color]);
          expect(specA).toBe(specB);
        } else {
          expect({ pair: [a.name, b.name], sameSpec: specA === specB }).toEqual({ pair: [a.name, b.name], sameSpec: false });
          expect({ pair: [a.name, b.name], tooClose: deltaE(a.brand_color, b.brand_color) < MIN_DISTANCE }).toEqual({
            pair: [a.name, b.name],
            tooClose: false,
          });
        }
      }
    }
  });
});
