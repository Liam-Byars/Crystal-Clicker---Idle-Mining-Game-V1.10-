// Mine Generator for Crystal Clicker
// Generates 300 additional mining areas and their upgrades
// This file is self-contained and exports typed arrays matching gameStore.ts interfaces

// ====== Type Imports ======
interface Area {
  id: string;
  name: string;
  location: string;
  flag: string;
  gem: string;
  description: string;
  icon: string;
  unlockAt: number;
  gradient: string;
  glowColor: string;
  bgAccent: string;
}

interface Upgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseCost: number;
  costMultiplier: number;
  level: number;
  effect: 'clickPower' | 'autoRate' | 'multiplier' | 'goldenChance' | 'critChance';
  value: number;
  maxLevel?: number;
}

// ====== Constants ======
const TOTAL_MINES = 300;
const EXPONENT_START = 49;
const EXPONENT_END = 300;
const EXPONENT_RANGE = EXPONENT_END - EXPONENT_START;

// ====== Theme Data ======
// Each theme has pools of names, locations, gems, icons, descriptions
// Theme boundaries: Deep Space (0-36), Galactic Core (37-76), Intergalactic (77-126),
// Dimensional (127-176), Cosmic Horror (177-226), Abstract (227-276), Beyond (277+)

const THEMES = {
  deepSpace: {
    names: [
      'Andromeda Spiral', 'Triangulum Depths', 'Whirlpool Galaxy', 'Sombrero Nebula',
      'Pinwheel Galaxy', 'Centaurus A Core', 'Barnard\'s Loop', 'Veil Nebula Heart',
      'Horsehead Nebula', 'Eagle Nebula Spire', 'Crab Nebula Pulsar', 'Ring Nebula Eye',
      'Carina Nebula Core', 'Orion Arm Depths', 'Perseus Arm Rift', 'Sagittarius Arm Flow',
      'Cygnus X-1 Field', 'Vela Supernova', 'Cassiopeia A Remnant', 'Gum Nebula Expanse',
      'North America Nebula', 'Pelican Nebula Wing', 'Rosette Nebula Center', 'Flame Nebula Core',
      'Monkey Head Nebula', 'Tarantula Nebula Web', 'Lagoon Nebula Shore', 'Omega Nebula Peak',
      'Trifid Nebula Fork', 'Helix Nebula Eye', 'Cat\'s Eye Nebula', 'Dumbbell Nebula Glow',
      'Saturn Nebula Ring', 'Bug Nebula Wings', 'Ant Nebula Core', 'Butterfly Nebula Wing',
    ],
    locations: [
      'Andromeda Galaxy', 'Triangulum Galaxy', 'Whirlpool Galaxy', 'Virgo Cluster',
      'Sombrero Galaxy', 'Centaurus A', 'Orion Arm', 'Perseus Arm',
      'Sagittarius Arm', 'Cygnus Arm', 'Local Bubble', 'Gould Belt',
      'Orion Nebula', 'Carina Nebula', 'Eagle Nebula', 'Crab Nebula',
      'Ring Nebula', 'Veil Nebula', 'Helix Nebula', 'Cat\'s Eye Nebula',
    ],
    gems: [
      'Andromedite', 'Triangulum Crystal', 'Whirlpool Quartz', 'Sombrero Sapphire',
      'Pinwheel Opal', 'Centaurite', 'Barnard Gem', 'Veil Emerald',
      'Horsehead Ruby', 'Eagle Crystal', 'Crab Pulsar Gem', 'Ring Diamond',
      'Carina Fire Opal', 'Orion Arm Crystal', 'Perseus Garnet', 'Sagittarius Topaz',
      'Cygnus Sapphire', 'Vela Amethyst', 'Cassiopeia Diamond', 'Gum Pearl',
    ],
    icons: [
      '🌌', '🌀', '✨', '💫', '⭐', '🌟', '🔮', '💎',
      '💠', '⚡', '🪐', '☄️', '🌌', '🌀', '✨', '💫',
      '⭐', '🌟', '🔮', '💎',
    ],
    descs: [
      'Crystals born in the spiral arms of a distant galaxy',
      'Stellar remnants compressed into luminous gems',
      'Nebular dust condensed over millions of years',
      'Pulsar radiation forging exotic crystalline structures',
      'Quasar emissions crystallized at the edge of visibility',
      'Supernova remnants yielding impossibly dense gems',
      'Dark nebulae hiding veins of unknown crystal',
      'Stellar nursery gems still warm from formation',
      'Binary star system producing synchronized crystal growth',
      'Cosmic ray bombardment creating unique gem matrices',
    ],
  },
  galacticCore: {
    names: [
      'Sagittarius A* Perimeter', 'Galactic Bar Depths', 'Nuclear Star Cluster',
      'Supermassive Core Rift', 'Accretion Disk Shards', 'Magnetar Field Forge',
      'Galactic Center Pulse', 'Core Winding Spire', 'Central Bulge Crystal Cavern',
      'Stellar Black Hole Ring', 'Gravitational Lens Vein', 'Sgr A* Event Shell',
      'Galactic Nucleus Heart', 'Core Stream Crystal Flow', 'Magnetar Storm Gemfield',
      'Supermassive Anomaly', 'Nuclear Reaction Crystals', 'Core Collapse Remnant',
      'Gravitational Well Depths', 'Galactic Rotation Hub', 'Inner Bar Crystal Lode',
      'Central Mass Extractor', 'Core Magnetic Thread', 'Sagittarius Stream Crystal',
      'Nuclear Furnace Gems', 'Accretion Shock Crystal', 'Core Plasma Crystal',
      'Galactic Anchor Point', 'Supermassive Ring Shard', 'Magnetar Pulse Crystal',
      'Core Singularity Gem', 'Galactic Pivot Crystal', 'Nuclear Bulge Opal',
      'Central Void Crystal', 'Sgr A* Corona Gem', 'Core Dynamo Crystal',
      'Galactic Heart Gem', 'Supermassive Crown Crystal',
    ],
    locations: [
      'Galactic Center', 'Sagittarius A*', 'Nuclear Bulge', 'Galactic Bar',
      'Supermassive Core', 'Accretion Disk', 'Magnetar Field', 'Core Winding',
      'Central Bulge', 'Stellar Graveyard', 'Dark Matter Halo', 'Core Stream',
    ],
    gems: [
      'Graviton Crystal', 'Singularity Gem', 'Accretion Diamond', 'Magnetar Shard',
      'Core Plasma Gem', 'Nuclear Crystal', 'Supermassive Opal', 'Event Horizon Ruby',
      'Dark Matter Crystal', 'Core Remnant Gem', 'Gravitational Lens Sapphire', 'Plasma Diamond',
      'Magnetar Emerald', 'Galactic Nucleus Crystal', 'Core Anomaly Gem',
    ],
    icons: [
      '🌀', '⚫', '🔴', '🟤', '⚡', '💫', '🕳️', '🔥',
      '💥', '⚛️', '🌀', '⚫', '🔴', '🟤', '⚡', '💫',
    ],
    descs: [
      'Crystals formed in the gravitational maelstrom of the galactic center',
      'Supermassive black hole accretion disk yielding impossible gems',
      'Magnetar magnetic fields forging exotic crystalline matter',
      'Dark matter concentrations crystallized by extreme gravity',
      'Nuclear reactions in the core producing trans-stellar gems',
      'Gravitational lensing revealing crystal veins in spacetime',
      'Stellar remnants orbiting the core compressed into gems',
      'Accretion shock waves creating unique crystal formations',
    ],
  },
  intergalactic: {
    names: [
      'Virgo Supercluster Core', 'Great Attractor Depths', 'Laniakea Heart',
      'Cosmic Web Junction', 'Boötes Void Edge', 'Sloan Great Wall Crystal',
      'Perseus-Pisces Filament', 'Shapley Supercluster', 'Hydra-Centaurus Ridge',
      'Pisces-Cetus Wall Vein', 'Sculptor Void Crystal', 'Coma Cluster Core',
      'Norma Cluster Gemfield', 'Hercules Supercluster', 'Leo Supercluster Rift',
      'Ursa Major Filament', 'Cetus Void Crystal', 'Eridanus Void Depths',
      'Microscopium Void Gem', 'Canes Venatici Cluster', 'Fornax Cluster Crystal',
      'Centaurus Wall Spine', 'Pavo-Indus Supercluster', 'Shapley Attractor Core',
      'Virgo Filament Crystal', 'Great Wall Extension', 'Boötes Void Center',
      'Cosmic Web Node', 'Intergalactic Bridge Crystal', 'Void Wall Gemfield',
      'Supercluster Remnant', 'Filament Junction Crystal', 'Cluster Core Diamond',
      'Void Boundary Gem', 'Cosmic Thread Crystal', 'Web Spine Sapphire',
      'Galaxy Stream Crystal', 'Void Ocean Ruby', 'Filament End Crystal',
    ],
    locations: [
      'Virgo Supercluster', 'Laniakea', 'Great Attractor', 'Cosmic Web',
      'Boötes Void', 'Sloan Great Wall', 'Shapley Supercluster', 'Perseus-Pisces',
      'Hydra-Centaurus', 'Intergalactic Void', 'Coma Cluster', 'Norma Cluster',
    ],
    gems: [
      'Void Crystal', 'Filament Gem', 'Web Sapphire', 'Cluster Diamond',
      'Supercluster Ruby', 'Void Opal', 'Cosmic Thread Crystal', 'Wall Emerald',
      'Attractor Garnet', 'Bridge Crystal', 'Node Diamond', 'Rift Sapphire',
      'Stream Topaz', 'Void Pearl', 'Filament Amethyst',
    ],
    icons: [
      '🌑', '🕸️', '🌌', '🔮', '💎', '⚫', '💫', '✨',
      '🪐', '🌀', '🌑', '🕸️', '🌌', '🔮', '💎', '⚫',
    ],
    descs: [
      'Crystals drifting in the vast emptiness between galaxies',
      'Cosmic web filaments laced with crystalline structures',
      'Galaxy clusters harboring rare intergalactic gems',
      'Void boundaries where crystallized dark energy forms',
      'Supercluster collisions forging super-dense crystal deposits',
      'Filament junctions concentrating exotic matter into gems',
      'Ancient voids containing primordial crystal formations',
      'Intergalactic bridges with crystallized plasma strands',
    ],
  },
  dimensional: {
    names: [
      'Dimensional Rift Alpha', 'Parallel Universe Echo', 'Timeline Branch Crystal',
      'Brane Collision Vein', 'String Theory Gemfield', 'Quantum Foam Crystal',
      'Multiverse Junction', 'Phase Space Diamond', 'Hilbert Space Ruby',
      'Minkowski Spacetime Gem', 'Wormhole Tunnel Crystal', 'Quantum Entangle Gem',
      'Dimension Fold Sapphire', 'Reality Shimmer Opal', 'Probability Crystal Vein',
      'Eigenstate Diamond', 'Superposition Gem', 'Quantum Tunnel Crystal',
      'Brane World Sapphire', 'Membrane Crystal Field', 'Extra Dimension Crystal',
      'Calabi-Yau Gem', 'Compactified Dimension Ruby', 'String Resonance Crystal',
      'Multiverse Core Diamond', 'Timeline Convergence Gem', 'Reality Anchor Crystal',
      'Dimension Barrier Sapphire', 'Quantum Fluctuation Gem', 'Phase Transition Crystal',
      'Brane Tear Diamond', 'Spacetime Fabric Gem', 'Dimension Weave Crystal',
      'Quantum Decoherence Ruby', 'Reality Fork Sapphire', 'Timeline Merge Gem',
      'Multiverse Echo Crystal', 'Dimensional Rift Omega', 'Reality Core Diamond',
    ],
    locations: [
      'Dimensional Rift', 'Parallel Universe', 'Multiverse', 'Brane Space',
      'Quantum Realm', 'Phase Space', 'Wormhole', 'Spacetime Fabric',
      'Extra Dimensions', 'Reality Boundary', 'Timeline Branch', 'Quantum Foam',
    ],
    gems: [
      'Dimension Crystal', 'Brane Gem', 'Quantum Diamond', 'Timeline Ruby',
      'Multiverse Sapphire', 'Phase Crystal', 'String Resonance Gem', 'Reality Opal',
      'Eigenstate Diamond', 'Superposition Gem', 'Wormhole Crystal', 'Quantum Emerald',
      'Dimensional Fold Gem', 'Probability Crystal', 'Hilbert Diamond',
    ],
    icons: [
      '🌀', '🔮', '♾️', '🔀', '🌀', '💎', '⚡', '🌌',
      '💫', '🔮', '♾️', '🔀', '🌀', '💎', '⚡', '🌌',
    ],
    descs: [
      'Crystals existing simultaneously in multiple dimensions',
      'Brane collision zones producing gems from colliding realities',
      'Quantum superposition gems that exist until observed',
      'Wormhole-extracted crystals from parallel timelines',
      'String theory vibrations crystallized into physical form',
      'Phase space regions where probability becomes solid crystal',
      'Extra-dimensional gem formations beyond 3D perception',
      'Reality boundary crystals at the edge of existence',
    ],
  },
  cosmicHorror: {
    names: [
      'Azathoth\'s Dream Crystal', 'Yog-Sothoth Gate Gem', 'Nyarlathotep Crawling Chaos',
      'Cthulhu Tomb Crystal', 'Shoggoth Pit Gem', 'Elder Thing Relic',
      'Y\'ha-nthlei Deep Crystal', 'R\'lyeh Sunken Gem', 'Carcosa Pale Crystal',
      'Hastur Yellow Sign Gem', 'Tindalos Angular Crystal', 'Yith Gem Vault',
      'Mi-Go Mining Outpost', 'Dark Young Crystal Grove', 'Shamballah Hidden Gem',
      'Kadath Crystal Peak', 'Unknown Kadath Gem', 'Plateau of Leng Crystal',
      'Nameless City Gem', 'Cyclopean Ruins Crystal', 'Non-Euclidean Gem Cavern',
      'Eldritch Void Crystal', 'Incomprehensible Depth Gem', 'Madness Vein Crystal',
      'Whispering Shadow Gem', 'Abyssal Horror Crystal', 'Primordial Entity Gem',
      'Void God\'s Tear Crystal', 'Omniscient Terror Gem', 'Cosmic Dread Crystal',
      'Unspeakable Void Gem', 'Eternal Nightmare Crystal', 'Ancient Horror Gem',
      'Chaos Entity Crystal', 'Void Whisper Gem', 'Reality Fracture Crystal',
      'Infinite Madness Gem', 'Abomination Core Crystal', 'Beyond Sanity Gem',
    ],
    locations: [
      'The Void Beyond', 'Eldritch Realm', 'R\'lyeh', 'Carcosa',
      'Unknown Kadath', 'The Dreamlands', 'Plateau of Leng', 'Y\'ha-nthlei',
      'Abyssal Depths', 'The Nameless City', 'Non-Euclidean Space', 'The Outer Dark',
    ],
    gems: [
      'Madness Crystal', 'Void Gem', 'Eldritch Diamond', 'Horror Ruby',
      'Chaos Sapphire', 'Dread Opal', 'Whisper Gem', 'Abyssal Crystal',
      'Terror Diamond', 'Nightmare Emerald', 'Entity Gem', 'Fracture Crystal',
      'Shadow Ruby', 'Primordial Gem', 'Sanity Crystal',
    ],
    icons: [
      '👁️', '🐙', '🌀', '🔮', '💀', '🌑', '⛔', '🫀',
      '🕳️', '👁️', '🐙', '🌀', '🔮', '💀', '🌑', '⛔',
    ],
    descs: [
      'Crystals that whisper forbidden knowledge to those who hold them',
      'Gems formed in the non-Euclidean geometry of elder realms',
      'Crystallized fragments of cosmic entities\' dreams',
      'Gems that exist in angles impossible for mortal perception',
      'Crystals from cities built before the dawn of time',
      'Void-matter gems that drive lesser minds to madness',
      'Crystallized entropy from dying universes beyond our own',
      'Gems pulsing with the heartbeat of sleeping cosmic horrors',
    ],
  },
  abstract: {
    names: [
      'Gödel\'s Incompleteness Gem', 'Riemann Zeta Crystal', 'Euler\'s Identity Diamond',
      'Fibonacci Spiral Crystal', 'Golden Ratio Gem', 'Prime Number Void Crystal',
      'Infinity Prism Gem', 'Zero Point Crystal', 'Pi Dimension Sapphire',
      'Euler-Mascheroni Gem', 'Cantor Set Crystal', 'Mandelbrot Fractal Gem',
      'Julia Set Crystal', 'Feigenbaum Constant Gem', 'Aleph Null Crystal',
      'Aleph One Sapphire', 'Continuum Hypothesis Gem', 'Poincaré Conjecture Crystal',
      'Fermat\'s Last Theorem Gem', 'Four Color Crystal', 'Gödel Number Diamond',
      'Turing Machine Crystal', 'Von Neumann Gem', 'Bayes\' Theorem Crystal',
      'Shannon Entropy Gem', 'Maxwell\'s Demon Crystal', 'Schrödinger\'s Cat Gem',
      'Heisenberg Uncertainty Crystal', 'Planck Scale Diamond', 'String Landscape Gem',
      'Calabi-Yau Manifold Crystal', 'M-Theory Brane Gem', 'AdS/CFT Crystal',
      'Holographic Principle Gem', 'Noether\'s Theorem Crystal', 'Lagrange Point Diamond',
      'Hamiltonian Gem', 'Feynman Path Crystal', 'Wick Rotation Gem',
      'Renormalization Crystal', 'Asymptotic Freedom Gem', 'Platonic Ideal Crystal',
    ],
    locations: [
      'Mathematical Plane', 'Abstract Space', 'Conceptual Realm', 'Idea Space',
      'Logical Domain', 'Theorem Space', 'Axiom Field', 'Proof Universe',
      'Hilbert Space', 'Phase Space', 'State Space', 'Configuration Space',
    ],
    gems: [
      'Infinity Gem', 'Zero Crystal', 'Pi Diamond', 'Euler Gem',
      'Fibonacci Crystal', 'Prime Opal', 'Fractal Sapphire', 'Aleph Ruby',
      'Theorem Crystal', 'Axiom Diamond', 'Proof Gem', 'Logic Crystal',
      'Concept Gem', 'Abstract Emerald', 'Ideal Crystal',
    ],
    icons: [
      '∞', 'π', '∑', '∏', '∫', '√', 'Δ', 'Ω',
      'λ', 'φ', 'ε', 'θ', '∞', 'π', '∑', '∏',
    ],
    descs: [
      'Crystals crystallized from pure mathematical truth',
      'Fractal gems with infinite surface area and zero volume',
      'Gems existing in the space between mathematical concepts',
      'Crystals formed from the fabric of logic itself',
      'Prime number crystals that can never be factored',
      'Infinity gems containing more than any finite number',
      'Conceptual crystals that embody abstract ideas',
      'Gems from the boundary between computable and uncomputable',
    ],
  },
  beyond: {
    names: [
      'Omnipresence Crystal', 'Omniscience Gem', 'Omnipotence Diamond',
      'Absolute Infinity Core', 'Eternal Now Crystal', 'Boundless Expanse Gem',
      'Ultimate Reality Diamond', 'Supreme Being Crystal', 'Alpha and Omega Gem',
      'Endless Recursion Crystal', 'Infinite Regress Gem', 'Ultimate Cause Crystal',
      'Final Frontier Diamond', 'Last Horizon Gem', 'Absolute End Crystal',
      'Totality Core Gem', 'Everything Crystal', 'All-Encompassing Diamond',
      'Supreme Unity Gem', 'Final Unity Crystal', 'Cosmic Apex Diamond',
      'Ultimate Singularity Gem', 'Absolute Zero Crystal', 'Infinite Being Gem',
      'Eternal Existence Crystal', 'Timeless Gem', 'Spaceless Diamond',
      'Causeless Cause Crystal', 'Unmoved Mover Gem', 'Prime Mover Crystal',
      'First Cause Diamond', 'Absolute One Gem', 'Supreme Entity Crystal',
      'Ultimate Truth Diamond', 'Final Answer Crystal', 'Last Question Gem',
      'Omega Point Crystal', 'Eschaton Diamond', 'Telos Gem',
      'Absolute Finality Crystal', 'Beyond Beyond Gem', 'The Last Crystal',
    ],
    locations: [
      'Beyond Existence', 'The Absolute', 'Omniverse', 'Totality',
      'The Everything', 'Supreme Reality', 'Eternal Realm', 'Infinite Domain',
      'Ultimate Horizon', 'Final Frontier', 'The End', 'Beyond The End',
    ],
    gems: [
      'Omniscience Crystal', 'Omnipotence Gem', 'Eternity Diamond', 'Infinity Crystal',
      'Absolute Gem', 'Totality Sapphire', 'Supreme Ruby', 'Ultimate Emerald',
      'Final Diamond', 'Beyond Gem', 'Omega Crystal', 'Telos Sapphire',
      'Apex Diamond', 'Zenith Gem', 'Pinnacle Crystal',
    ],
    icons: [
      '🔮', '👁️', '♾️', '🌟', '💫', '✨', '⭐', '☀️',
      '🌟', '💫', '✨', '⭐', '☀️', '🔮', '👁️', '♾️',
    ],
    descs: [
      'Crystals that exist at the boundary of all possible realities',
      'Gems embodying the concept of absolute infinity itself',
      'Crystals from beyond the final frontier of existence',
      'Gems that contain all knowledge across all possible universes',
      'Crystals at the absolute end of time and space',
      'Gems from the omniverse encompassing everything that could ever be',
      'Crystals at the apex of all possible hierarchies of infinity',
      'The final gems before the concept of gems ceases to have meaning',
    ],
  },
} as const;

type ThemeKey = keyof typeof THEMES;

// ====== Color Palettes ======
const COLOR_PALETTES = [
  // Purple/Violet
  { gradient: 'from-purple-500 via-violet-600 to-purple-800', glow: 'rgba(168, 85, 247, 0.5)', bg: 'bg-purple-950/20' },
  { gradient: 'from-violet-400 via-purple-600 to-indigo-800', glow: 'rgba(167, 139, 250, 0.5)', bg: 'bg-violet-950/20' },
  { gradient: 'from-fuchsia-500 via-purple-700 to-violet-900', glow: 'rgba(217, 70, 239, 0.5)', bg: 'bg-fuchsia-950/20' },
  // Red/Orange
  { gradient: 'from-red-500 via-orange-600 to-red-800', glow: 'rgba(239, 68, 68, 0.5)', bg: 'bg-red-950/20' },
  { gradient: 'from-orange-400 via-red-500 to-rose-700', glow: 'rgba(251, 146, 60, 0.5)', bg: 'bg-orange-950/20' },
  { gradient: 'from-rose-400 via-pink-600 to-red-900', glow: 'rgba(244, 114, 182, 0.5)', bg: 'bg-rose-950/20' },
  // Green/Teal
  { gradient: 'from-emerald-400 via-teal-600 to-green-800', glow: 'rgba(52, 211, 153, 0.5)', bg: 'bg-emerald-950/20' },
  { gradient: 'from-teal-400 via-cyan-600 to-emerald-800', glow: 'rgba(45, 212, 191, 0.5)', bg: 'bg-teal-950/20' },
  { gradient: 'from-green-400 via-lime-600 to-emerald-800', glow: 'rgba(74, 222, 128, 0.5)', bg: 'bg-green-950/20' },
  // Cyan/Blue
  { gradient: 'from-cyan-400 via-sky-600 to-blue-800', glow: 'rgba(34, 211, 238, 0.5)', bg: 'bg-cyan-950/20' },
  { gradient: 'from-sky-400 via-cyan-600 to-teal-800', glow: 'rgba(56, 189, 248, 0.5)', bg: 'bg-sky-950/20' },
  { gradient: 'from-blue-400 via-indigo-600 to-slate-800', glow: 'rgba(96, 165, 250, 0.5)', bg: 'bg-blue-950/20' },
  // Yellow/Amber
  { gradient: 'from-yellow-300 via-amber-500 to-orange-700', glow: 'rgba(253, 224, 71, 0.5)', bg: 'bg-yellow-950/20' },
  { gradient: 'from-amber-400 via-yellow-500 to-amber-700', glow: 'rgba(251, 191, 36, 0.5)', bg: 'bg-amber-950/20' },
  { gradient: 'from-lime-300 via-yellow-500 to-amber-700', glow: 'rgba(163, 230, 53, 0.5)', bg: 'bg-lime-950/20' },
  // Pink/Fuchsia
  { gradient: 'from-pink-400 via-fuchsia-500 to-purple-700', glow: 'rgba(244, 114, 182, 0.5)', bg: 'bg-pink-950/20' },
  { gradient: 'from-fuchsia-400 via-pink-600 to-rose-800', glow: 'rgba(232, 121, 249, 0.5)', bg: 'bg-fuchsia-950/20' },
  { gradient: 'from-rose-300 via-pink-500 to-fuchsia-700', glow: 'rgba(253, 164, 175, 0.5)', bg: 'bg-rose-950/20' },
  // Dark/Mysterious
  { gradient: 'from-slate-500 via-gray-700 to-slate-900', glow: 'rgba(148, 163, 184, 0.4)', bg: 'bg-slate-950/30' },
  { gradient: 'from-zinc-500 via-neutral-700 to-zinc-900', glow: 'rgba(161, 161, 170, 0.4)', bg: 'bg-zinc-950/30' },
  { gradient: 'from-gray-600 via-slate-800 to-gray-950', glow: 'rgba(107, 114, 128, 0.4)', bg: 'bg-gray-950/30' },
  // Special
  { gradient: 'from-white via-gray-200 to-slate-400', glow: 'rgba(255, 255, 255, 0.6)', bg: 'bg-white/10' },
  { gradient: 'from-amber-200 via-yellow-100 to-white', glow: 'rgba(253, 230, 138, 0.7)', bg: 'bg-amber-950/10' },
  { gradient: 'from-cyan-200 via-teal-300 to-emerald-400', glow: 'rgba(153, 246, 228, 0.6)', bg: 'bg-cyan-950/10' },
];

// ====== Utility Functions ======

/** Get theme key for a given mine index (0-299) */
function getThemeKey(index: number): ThemeKey {
  if (index < 37) return 'deepSpace';
  if (index < 77) return 'galacticCore';
  if (index < 127) return 'intergalactic';
  if (index < 177) return 'dimensional';
  if (index < 227) return 'cosmicHorror';
  if (index < 277) return 'abstract';
  return 'beyond';
}

/** Get theme-local index (0-based within the theme) */
function getThemeLocalIndex(index: number): number {
  if (index < 37) return index;
  if (index < 77) return index - 37;
  if (index < 127) return index - 77;
  if (index < 177) return index - 127;
  if (index < 227) return index - 177;
  if (index < 277) return index - 227;
  return index - 277;
}

/** Generate unlockAt value with slightly non-linear scaling */
function generateUnlockAt(index: number): number {
  // Non-linear: use a slight curve so early mines are closer together
  // and later mines spread out more
  const t = index / (TOTAL_MINES - 1); // 0 to 1
  // Apply a slight power curve (cubic) for non-linearity
  const curved = Math.pow(t, 1.15);
  const exponent = EXPONENT_START + curved * EXPONENT_RANGE;
  const raw = Math.pow(10, Math.min(exponent, 300)); // Cap at 10^300 (JS safe)
  return raw;
}

/** Format a large number for description text */
function formatNumber(n: number): string {
  const exp = Math.floor(Math.log10(n));
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const doubleLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (exp < 3) return n.toFixed(0);
  if (exp < 15) {
    const si = Math.floor((exp - 3) / 3);
    return (n / Math.pow(1000, si + 1)).toFixed(1) + suffixes[si + 1];
  }
  const dlIdx = Math.floor((exp - 15) / 3);
  const first = Math.floor(dlIdx / 26);
  const second = dlIdx % 26;
  if (first >= 26) return 'ZZ+';
  const letter1 = doubleLetters[first];
  const letter2 = doubleLetters[second];
  const divisor = Math.pow(10, 15 + dlIdx * 3);
  return (n / divisor).toFixed(1) + letter1 + letter2;
}

/** Cycle through a themed array with wrapping */
function pickFrom<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length];
}

/** Generate a unique snake_case id from a name */
function nameToId(name: string, index: number): string {
  // Convert name to snake_case, ensure uniqueness with index suffix
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 40); // Limit length
  return `gen_${index}_${base}`;
}

/** Calculate upgrade values based on mine index */
function getUpgradeValues(index: number): {
  clickPower: number;
  autoRate: number;
  resonance: number;
  luckValue: number;
  ultimate: number;
} {
  // Values grow exponentially - roughly 10x every ~20 mines
  // Starting from the last hand-crafted mine values:
  // clickPower: 2e24, autoRate: 1e24, resonance: 5e13, ultimate: 1e14
  const growthFactor = Math.min(Math.pow(10, (index / TOTAL_MINES) * (Math.log10(1e2040 / 1e14))), 1e280);
  const baseClick = 2e24;
  const baseAuto = 1e24;
  const baseResonance = 5e13;
  const baseUltimate = 1e14;

  return {
    clickPower: baseClick * growthFactor,
    autoRate: baseAuto * growthFactor,
    resonance: baseResonance * growthFactor,
    luckValue: Math.max(0.00005, 0.0003 * Math.pow(0.98, index)),
    ultimate: baseUltimate * growthFactor,
  };
}

// ====== Main Generation ======

function generateAreas(): Area[] {
  const areas: Area[] = [];

  for (let i = 0; i < TOTAL_MINES; i++) {
    const themeKey = getThemeKey(i);
    const theme = THEMES[themeKey];
    const localIdx = getThemeLocalIndex(i);
    const unlockAt = generateUnlockAt(i);
    const palette = COLOR_PALETTES[i % COLOR_PALETTES.length];

    const name = pickFrom(theme.names, localIdx);
    const id = nameToId(name, i);

    areas.push({
      id,
      name,
      location: pickFrom(theme.locations, localIdx),
      flag: pickFrom(theme.icons, localIdx),
      gem: pickFrom(theme.gems, localIdx),
      description: pickFrom(theme.descs, localIdx),
      icon: pickFrom(theme.icons, localIdx),
      unlockAt,
      gradient: palette.gradient,
      glowColor: palette.glow,
      bgAccent: palette.bg,
    });
  }

  return areas;
}

function generateUpgrades(areas: Area[]): Record<string, Upgrade[]> {
  const result: Record<string, Upgrade[]> = {};

  for (let i = 0; i < areas.length; i++) {
    const area = areas[i];
    const values = getUpgradeValues(i);
    const unlockAt = area.unlockAt;
    const isGoldenLuck = i % 2 === 0;
    const luckEffect = isGoldenLuck ? 'goldenChance' as const : 'critChance' as const;
    const luckName = isGoldenLuck ? 'Golden Fortune' : 'Critical Fortune';
    const luckDesc = isGoldenLuck
      ? `+${(values.luckValue * 100).toFixed(4)}% golden chance per level`
      : `+${(values.luckValue * 100).toFixed(4)}% crit chance per level`;
    const luckMaxLevel = Math.max(5, 25 - Math.floor(i / 60));

    const clickVal = values.clickPower;
    const autoVal = values.autoRate;
    const resVal = values.resonance;
    const ultVal = values.ultimate;

    const pickDesc = `+${formatNumber(clickVal)} click power per level`;
    const drillDesc = `+${formatNumber(autoVal)} crystals/sec`;
    const resDesc = `x${formatNumber(resVal)} multiplier per level`;
    const ultDesc = `x${formatNumber(ultVal)} multiplier per level`;

    result[area.id] = [
      {
        id: `${area.id}_pick`,
        name: `${area.gem} Pick`,
        description: pickDesc,
        icon: '🔨',
        baseCost: unlockAt * 0.1,
        costMultiplier: 1.6,
        level: 0,
        effect: 'clickPower',
        value: clickVal,
        maxLevel: 2000,
      },
      {
        id: `${area.id}_drill`,
        name: `${area.gem} Drill`,
        description: drillDesc,
        icon: '⚙️',
        baseCost: unlockAt * 0.2,
        costMultiplier: 1.6,
        level: 0,
        effect: 'autoRate',
        value: autoVal,
        maxLevel: 2000,
      },
      {
        id: `${area.id}_resonance`,
        name: `${area.gem} Resonance`,
        description: resDesc,
        icon: '🎵',
        baseCost: unlockAt * 0.3,
        costMultiplier: 1.8,
        level: 0,
        effect: 'multiplier',
        value: resVal,
        maxLevel: 2000,
      },
      {
        id: `${area.id}_luck`,
        name: luckName,
        description: luckDesc,
        icon: '🍀',
        baseCost: unlockAt * 2.5,
        costMultiplier: 2.0,
        level: 0,
        effect: luckEffect,
        value: values.luckValue,
        maxLevel: luckMaxLevel,
      },
      {
        id: `${area.id}_ultimate`,
        name: `${area.name} Core`,
        description: ultDesc,
        icon: area.icon,
        baseCost: unlockAt * 5,
        costMultiplier: 2.5,
        level: 0,
        effect: 'multiplier',
        value: ultVal,
        maxLevel: 2000,
      },
    ];
  }

  return result;
}

// ====== Generate and Export ======
const _areas = generateAreas();
const _upgrades = generateUpgrades(_areas);

export const GENERATED_AREAS: Area[] = _areas;
export const GENERATED_UPGRADES: Record<string, Upgrade[]> = _upgrades;
