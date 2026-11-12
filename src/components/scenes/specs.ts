// AI-assisted (Claude Code): one scene spec per university (time of day, weather, season, layers and details), keyed by the university name in supabase/seed/universities.csv. Every scene is generic: landscape, climate and regional building style of the setting, never a real building, landmark, text or symbol (guideline 5.2, data.md). Coordinates are in the 400 × 240 scene box; buttons sit in the top 56 units and the bottom fades into the page.
import type { Season, Time, Weather } from "./palette";

export type BuildingStyle =
  | "brick"
  | "brownstone"
  | "stucco"
  | "georgian"
  | "terrace"
  | "tenement"
  | "stone"
  | "modern"
  | "canal"
  | "mediterranean"
  | "ochre"
  | "chalet"
  | "farm"
  | "adobe"
  | "villa";

export type TreeKind = "round" | "pine" | "cypress" | "poplar" | "palm" | "cactus" | "eucalyptus" | "olive" | "blossom" | "plane";

export type Ridge = { shape: "hills" | "mountains" | "mesas" | "flat" | "crag"; heights: number[] };

export type SceneSpec = {
  time: Time;
  weather: Weather;
  season: Season;
  light: { x: number; y: number }; // sun or moon
  clouds?: [x: number, y: number, scale: number][];
  far?: Ridge;
  mid?: Ridge;
  // [x, width, height] per building, standing on `base`.
  buildings?: { style: BuildingStyle; base: number; layer: "far" | "mid" | "near"; blocks: [x: number, w: number, h: number][] }[];
  water?: { y: number; boats?: { kind: "sail" | "punt"; x: number; y: number }[] };
  quay?: { y: number; h: number }; // strip of land between water and buildings
  ground?: Ridge & { pattern?: "fields" | "vineyard" | "walls" };
  trees?: { kind: TreeKind; base: number; size: number; layer: "mid" | "near"; xs: number[] }[];
  birds?: [x: number, y: number];
  rainbow?: boolean;
  bikes?: [x: number, y: number][];
  lamps?: [x: number, y: number][];
  tramWires?: number; // y of overhead tram wires
};

const MIT: SceneSpec = {
  time: "sunset",
  weather: "clear",
  season: "autumn",
  light: { x: 120, y: 112 },
  clouds: [[300, 70, 1.1]],
  far: { shape: "flat", heights: [128, 126, 128, 127] },
  buildings: [{ style: "brick", base: 140, layer: "far", blocks: [[30, 46, 30], [80, 30, 44], [170, 64, 26], [240, 38, 38], [300, 70, 30]] }],
  water: { y: 140, boats: [{ kind: "sail", x: 210, y: 166 }, { kind: "sail", x: 300, y: 178 }] },
  ground: { shape: "hills", heights: [196, 192, 198, 194] },
  trees: [{ kind: "round", base: 200, size: 26, layer: "near", xs: [30, 350] }],
  birds: [250, 88],
};

const COLUMBIA: SceneSpec = {
  time: "morning",
  weather: "snow",
  season: "winter",
  light: { x: 200, y: 84 },
  buildings: [
    { style: "brownstone", base: 150, layer: "far", blocks: [[0, 50, 70], [54, 40, 86], [98, 60, 64], [250, 44, 80], [298, 52, 70], [354, 46, 90]] },
    { style: "brownstone", base: 182, layer: "mid", blocks: [[10, 36, 58], [50, 40, 70], [94, 34, 54], [266, 40, 62], [310, 36, 74], [350, 44, 56]] },
  ],
  ground: { shape: "flat", heights: [152, 152, 152, 152] },
  trees: [{ kind: "plane", base: 196, size: 24, layer: "near", xs: [150, 238] }],
  lamps: [[190, 196], [212, 196]],
};

const BERKELEY: SceneSpec = {
  time: "sunset",
  weather: "fog",
  season: "summer",
  light: { x: 300, y: 118 },
  far: { shape: "hills", heights: [118, 96, 110, 88, 104, 120] },
  water: { y: 136, boats: [{ kind: "sail", x: 330, y: 160 }] },
  mid: { shape: "hills", heights: [150, 140, 156, 170, 186, 196] },
  buildings: [{ style: "villa", base: 152, layer: "mid", blocks: [[40, 18, 10], [74, 16, 9], [104, 20, 10]] }],
  trees: [{ kind: "eucalyptus", base: 176, size: 30, layer: "near", xs: [24, 150, 196] }],
};

const DUKE: SceneSpec = {
  time: "afternoon",
  weather: "clear",
  season: "spring",
  light: { x: 290, y: 80 },
  clouds: [[110, 74, 0.9]],
  far: { shape: "hills", heights: [130, 124, 128, 122, 130] },
  trees: [
    { kind: "pine", base: 156, size: 34, layer: "mid", xs: [12, 34, 58, 330, 352, 376, 396] },
    { kind: "blossom", base: 196, size: 26, layer: "near", xs: [70, 320] },
  ],
  buildings: [{ style: "stone", base: 170, layer: "mid", blocks: [[110, 36, 40], [148, 52, 30], [202, 36, 40], [240, 40, 30]] }],
  ground: { shape: "flat", heights: [180, 182, 180, 182] },
};

const PURDUE: SceneSpec = {
  time: "noon",
  weather: "cloudy",
  season: "summer",
  light: { x: 200, y: 66 },
  clouds: [[80, 82, 1.6], [300, 72, 1.9], [190, 100, 1.1]],
  far: { shape: "flat", heights: [146, 146, 146, 146] },
  buildings: [
    { style: "brick", base: 150, layer: "mid", blocks: [[150, 50, 22], [204, 30, 30], [238, 56, 20]] },
    { style: "farm", base: 158, layer: "mid", blocks: [[40, 30, 18]] },
  ],
  ground: { shape: "flat", heights: [156, 158, 156, 158], pattern: "fields" },
  trees: [{ kind: "round", base: 162, size: 20, layer: "mid", xs: [110, 320, 350] }],
};

const ASU: SceneSpec = {
  time: "dusk",
  weather: "clear",
  season: "summer",
  light: { x: 90, y: 92 },
  far: { shape: "mesas", heights: [126, 108, 132, 116, 128] },
  buildings: [{ style: "adobe", base: 170, layer: "mid", blocks: [[150, 44, 18], [198, 30, 24], [232, 50, 16]] }],
  ground: { shape: "flat", heights: [172, 170, 172, 170] },
  trees: [
    { kind: "palm", base: 172, size: 34, layer: "mid", xs: [130, 292] },
    { kind: "cactus", base: 196, size: 30, layer: "near", xs: [40, 352] },
  ],
};

const LSE: SceneSpec = {
  time: "afternoon",
  weather: "rain",
  season: "autumn",
  light: { x: 330, y: 70 },
  clouds: [[70, 66, 1.8], [230, 60, 2], [360, 84, 1.4]],
  buildings: [
    { style: "terrace", base: 176, layer: "mid", blocks: [[0, 34, 70], [36, 32, 78], [70, 34, 70], [262, 34, 74], [298, 32, 82], [332, 34, 70], [368, 34, 76]] },
  ],
  ground: { shape: "flat", heights: [176, 176, 176, 176] },
  lamps: [[120, 190], [280, 190]],
  trees: [{ kind: "plane", base: 192, size: 22, layer: "near", xs: [190] }],
};

const IMPERIAL: SceneSpec = {
  time: "morning",
  weather: "clear",
  season: "spring",
  light: { x: 110, y: 78 },
  clouds: [[300, 76, 1.1]],
  buildings: [{ style: "stucco", base: 168, layer: "mid", blocks: [[200, 40, 64], [242, 40, 64], [284, 40, 64], [326, 40, 64], [368, 40, 64]] }],
  ground: { shape: "hills", heights: [168, 164, 170, 168] },
  trees: [
    { kind: "blossom", base: 176, size: 30, layer: "mid", xs: [36, 90, 150] },
    { kind: "round", base: 200, size: 22, layer: "near", xs: [118] },
  ],
  birds: [210, 80],
};

const UCL: SceneSpec = {
  time: "dusk",
  weather: "clear",
  season: "autumn",
  light: { x: 200, y: 76 },
  buildings: [
    { style: "georgian", base: 166, layer: "mid", blocks: [[0, 40, 64], [42, 40, 64], [84, 40, 64], [276, 40, 64], [318, 40, 64], [360, 40, 64]] },
  ],
  ground: { shape: "flat", heights: [166, 166, 166, 166] },
  trees: [{ kind: "plane", base: 186, size: 30, layer: "near", xs: [150, 200, 250] }],
  lamps: [[128, 188], [272, 188]],
};

const WARWICK: SceneSpec = {
  time: "morning",
  weather: "clear",
  season: "summer",
  light: { x: 300, y: 76 },
  clouds: [[110, 70, 1.2]],
  far: { shape: "hills", heights: [134, 128, 136, 126, 132] },
  buildings: [{ style: "modern", base: 150, layer: "mid", blocks: [[60, 60, 20], [124, 36, 30], [250, 70, 18]] }],
  water: { y: 152 },
  ground: { shape: "hills", heights: [182, 176, 186, 178] },
  trees: [{ kind: "round", base: 152, size: 18, layer: "mid", xs: [30, 180, 210, 350] }],
  birds: [200, 70],
};

const EDINBURGH: SceneSpec = {
  time: "dusk",
  weather: "wind",
  season: "winter",
  light: { x: 120, y: 74 },
  clouds: [[260, 66, 1.5], [360, 90, 1.1]],
  far: { shape: "crag", heights: [150, 128, 96, 104, 138, 150] },
  buildings: [{ style: "tenement", base: 180, layer: "mid", blocks: [[10, 36, 74], [48, 30, 86], [80, 36, 70], [270, 34, 80], [306, 30, 90], [338, 40, 72]] }],
  ground: { shape: "flat", heights: [180, 180, 180, 180] },
  lamps: [[160, 194], [230, 194]],
};

const OXFORD: SceneSpec = {
  time: "dawn",
  weather: "fog",
  season: "spring",
  light: { x: 260, y: 104 },
  buildings: [{ style: "stone", base: 150, layer: "far", blocks: [[20, 40, 40], [62, 30, 52], [94, 50, 36], [320, 40, 44], [362, 36, 36]] }],
  water: { y: 152, boats: [{ kind: "punt", x: 180, y: 172 }] },
  ground: { shape: "hills", heights: [198, 192, 200, 196] },
  trees: [{ kind: "poplar", base: 154, size: 32, layer: "mid", xs: [160, 196, 232, 290] }],
};

// IE Business School and IE University: one institution, one shared scene (decision 2026-11-12).
const IE: SceneSpec = {
  time: "afternoon",
  weather: "clear",
  season: "summer",
  light: { x: 90, y: 70 },
  far: { shape: "hills", heights: [140, 130, 138, 126, 136] },
  buildings: [{ style: "modern", base: 168, layer: "mid", blocks: [[150, 30, 80], [184, 44, 56], [232, 30, 92], [266, 50, 48]] }],
  ground: { shape: "flat", heights: [168, 170, 168, 170] },
  trees: [{ kind: "olive", base: 190, size: 30, layer: "near", xs: [50, 110, 350] }],
};

const ESADE: SceneSpec = {
  time: "morning",
  weather: "clear",
  season: "spring",
  light: { x: 310, y: 72 },
  water: { y: 120 },
  mid: { shape: "hills", heights: [124, 132, 150, 176, 200] },
  buildings: [
    { style: "mediterranean", base: 136, layer: "mid", blocks: [[16, 26, 14], [46, 20, 18]] },
    { style: "mediterranean", base: 156, layer: "mid", blocks: [[70, 30, 16], [104, 22, 20], [130, 28, 14]] },
    { style: "mediterranean", base: 178, layer: "mid", blocks: [[180, 30, 16], [214, 24, 20]] },
  ],
  trees: [
    { kind: "cypress", base: 140, size: 24, layer: "mid", xs: [8, 60] },
    { kind: "olive", base: 200, size: 28, layer: "near", xs: [290, 340] },
  ],
  birds: [230, 82],
};

const EADA: SceneSpec = {
  time: "night",
  weather: "clear",
  season: "summer",
  light: { x: 300, y: 76 },
  water: { y: 158 },
  buildings: [{ style: "mediterranean", base: 158, layer: "mid", blocks: [[0, 30, 40], [32, 40, 56], [74, 26, 44], [102, 46, 62], [150, 30, 40], [182, 36, 50], [220, 28, 36]] }],
  trees: [{ kind: "palm", base: 160, size: 30, layer: "mid", xs: [258, 286, 316] }],
  lamps: [[340, 160], [380, 160]],
};

const DELFT: SceneSpec = {
  time: "afternoon",
  weather: "cloudy",
  season: "spring",
  light: { x: 330, y: 72 },
  clouds: [[90, 66, 1.6], [240, 74, 1.8], [360, 92, 1.2]],
  buildings: [
    {
      style: "canal",
      base: 162,
      layer: "mid",
      blocks: [[20, 26, 52], [48, 22, 60], [72, 28, 48], [102, 24, 56], [128, 26, 50], [244, 26, 54], [272, 22, 62], [296, 28, 48], [326, 24, 58], [352, 28, 50]],
    },
  ],
  water: { y: 162 },
  quay: { y: 162, h: 8 },
  trees: [{ kind: "round", base: 166, size: 20, layer: "mid", xs: [168, 208] }],
  bikes: [[170, 166], [194, 166]],
};

const TRINITY: SceneSpec = {
  time: "afternoon",
  weather: "rain",
  season: "autumn",
  light: { x: 120, y: 80 },
  clouds: [[200, 62, 1.8], [340, 70, 1.5]],
  rainbow: true,
  buildings: [{ style: "georgian", base: 152, layer: "mid", blocks: [[0, 44, 56], [46, 44, 56], [92, 44, 56], [138, 44, 56], [184, 44, 56]] }],
  water: { y: 152 },
  quay: { y: 152, h: 6 },
  trees: [{ kind: "round", base: 158, size: 22, layer: "mid", xs: [252, 300, 352] }],
};

const ETH: SceneSpec = {
  time: "morning",
  weather: "clear",
  season: "winter",
  light: { x: 90, y: 70 },
  far: { shape: "mountains", heights: [120, 84, 110, 70, 104, 80, 118] },
  water: { y: 140 },
  buildings: [{ style: "ochre", base: 176, layer: "mid", blocks: [[200, 40, 26], [244, 34, 32], [282, 44, 24]] }],
  ground: { shape: "hills", heights: [178, 172, 176, 174] },
  trees: [{ kind: "pine", base: 196, size: 30, layer: "near", xs: [40, 66, 350, 376] }],
};

const HSG: SceneSpec = {
  time: "afternoon",
  weather: "clear",
  season: "summer",
  light: { x: 120, y: 74 },
  clouds: [[290, 72, 1.3]],
  far: { shape: "mountains", heights: [130, 112, 124, 104, 120, 132] },
  mid: { shape: "hills", heights: [160, 140, 150, 136, 154] },
  buildings: [
    { style: "chalet", base: 152, layer: "mid", blocks: [[90, 26, 14], [260, 30, 16]] },
    { style: "farm", base: 172, layer: "near", blocks: [[170, 34, 18]] },
  ],
  ground: { shape: "hills", heights: [186, 178, 184, 176], pattern: "walls" },
  trees: [{ kind: "round", base: 160, size: 16, layer: "mid", xs: [40, 140, 320, 360] }],
};

const EPFL: SceneSpec = {
  time: "sunset",
  weather: "clear",
  season: "autumn",
  light: { x: 240, y: 102 },
  far: { shape: "mountains", heights: [112, 90, 104, 80, 96, 110] },
  water: { y: 128, boats: [{ kind: "sail", x: 120, y: 150 }] },
  ground: { shape: "hills", heights: [160, 168, 180, 196], pattern: "vineyard" },
  buildings: [{ style: "villa", base: 168, layer: "near", blocks: [[60, 24, 14]] }],
  trees: [{ kind: "poplar", base: 196, size: 30, layer: "near", xs: [320, 350] }],
};

const HEC: SceneSpec = {
  time: "morning",
  weather: "fog",
  season: "autumn",
  light: { x: 280, y: 84 },
  trees: [
    { kind: "round", base: 150, size: 30, layer: "mid", xs: [10, 50, 90, 130, 270, 310, 350, 390] },
    { kind: "poplar", base: 192, size: 30, layer: "near", xs: [30, 370] },
  ],
  water: { y: 152 },
  ground: { shape: "hills", heights: [200, 194, 198, 196] },
  birds: [180, 96],
};

const BOCCONI: SceneSpec = {
  time: "dusk",
  weather: "fog",
  season: "winter",
  light: { x: 300, y: 78 },
  buildings: [
    { style: "ochre", base: 172, layer: "mid", blocks: [[0, 60, 64], [62, 50, 72], [114, 56, 60], [260, 60, 66], [322, 50, 74], [374, 40, 60]] },
  ],
  ground: { shape: "flat", heights: [172, 172, 172, 172] },
  tramWires: 120,
  lamps: [[190, 190], [214, 190]],
};

// Keys are university names exactly as in supabase/seed/universities.csv.
export const sceneSpecs: Record<string, SceneSpec> = {
  "Massachusetts Institute of Technology": MIT,
  "Columbia University": COLUMBIA,
  "University of California, Berkeley": BERKELEY,
  "Duke University": DUKE,
  "Purdue University": PURDUE,
  "Arizona State University": ASU,
  "London School of Economics": LSE,
  "Imperial College London": IMPERIAL,
  "University College London": UCL,
  "University of Warwick": WARWICK,
  "University of Edinburgh": EDINBURGH,
  "University of Oxford": OXFORD,
  "IE Business School": IE,
  "IE University": IE,
  ESADE: ESADE,
  "EADA Business School": EADA,
  "Delft University of Technology": DELFT,
  "Trinity College Dublin": TRINITY,
  "ETH Zurich": ETH,
  "University of St. Gallen": HSG,
  EPFL: EPFL,
  "HEC Paris": HEC,
  "Università Bocconi": BOCCONI,
};

// Universities that share one scene and one color on purpose (same institution).
export const sharedScenes: string[][] = [["IE Business School", "IE University"]];

// For a university added later without its own scene.
export const genericSpec: SceneSpec = {
  time: "afternoon",
  weather: "clear",
  season: "summer",
  light: { x: 200, y: 84 },
  clouds: [[110, 70, 1], [310, 64, 1.1]],
  far: { shape: "hills", heights: [130, 118, 128, 116, 126] },
  mid: { shape: "hills", heights: [160, 150, 158, 148, 156] },
  trees: [
    { kind: "pine", base: 186, size: 30, layer: "near", xs: [50] },
    { kind: "round", base: 186, size: 24, layer: "near", xs: [340] },
  ],
};

export function sceneSpecFor(university: string): SceneSpec {
  return sceneSpecs[university] ?? genericSpec;
}
