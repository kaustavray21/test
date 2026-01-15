// constants.js

const TILE = 30;
const ROWS = 29;
const COLS = 29;
const SPEED = 3;

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
  SLOW: 6, // New: Slows ghosts
  DRILL: 7, // New: Eat walls
  BOOST: 8, // New: Speed up Pacman
};

// Visual Configuration for Powerups
const POWERUP_ICONS = [" ", "M", "F", "P", "T", "S", "W", "D", "B"];
// W = Web (Slow), D = Drill, B = Boost

const POWERUP_COLORS = [
  "",
  "#0000ff", // Magnet (Blue)
  "#00ffff", // Freeze (Cyan)
  "#ff0000", // Pyro (Red)
  "#ffffff", // Tornado (White)
  "#C0C0C0", // Titanium (Silver)
  "#8A2BE2", // Slow (Violet)
  "#8B4513", // Drill (Brown)
  "#FFFF00", // Boost (Yellow)
];

// Ghost Configuration
const GHOST_CONFIG = [
  { color: "#FF0000", type: "chase" },
  { color: "#FFB8FF", type: "ambush" },
  { color: "#00FFFF", type: "patrol" },
  { color: "#FFB852", type: "random" },
];
