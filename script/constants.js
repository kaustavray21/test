// constants.js

const TILE = 30; // Increased from 20 for better visibility
const ROWS = 29;
const COLS = 29;
const SPEED = 3; // Increased from 2 to match TILE size

// Game Object Types
const TYPES = {
  EMPTY: 0,
  WALL: 1,
  DOT: 2,
  POWER_PELLET: 3,
};

// Powerup IDs
const POWERUPS = {
  NONE: 0,
  MAGNET: 1,
  FREEZE: 2,
  PYRO: 3,
  TORNADO: 4,
  TITANIUM: 5,
};

// Visual Configuration for Powerups
const POWERUP_ICONS = [" ", "M", "F", "P", "T", "S"];
const POWERUP_COLORS = [
  "",
  "#0000ff", // Magnet
  "#00ffff", // Freeze
  "#ff0000", // Pyro
  "#ffffff", // Tornado
  "#C0C0C0", // Titanium
];

// Ghost Configuration
const GHOST_CONFIG = [
  { color: "#FF0000", type: "chase" },
  { color: "#FFB8FF", type: "ambush" },
  { color: "#00FFFF", type: "patrol" },
  { color: "#FFB852", type: "random" },
];

// NOTE: MAP_TEMPLATE has been removed because maps are now
// generated randomly by generateRandomMap() in utils.js
