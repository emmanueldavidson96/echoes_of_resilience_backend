// XP and level scaling helper
// Level thresholds (total XP required to reach the level)
// Level 1: 0, Level 2: 300, Level 3: 500, Level 4: 1000, then +500 per level thereafter
const LEVEL_THRESHOLDS = [0, 300, 500, 1000];
const STEP_AFTER_BASE = 500;

export const getThresholdForLevel = (level = 1) => {
  if (level <= 1) return 0;
  if (level <= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[level - 1];
  const extraLevels = level - LEVEL_THRESHOLDS.length;
  return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + STEP_AFTER_BASE * extraLevels;
};

export const getLevelFromXP = (xp = 0) => {
  const safeXP = Math.max(0, xp);
  let level = 1;
  while (safeXP >= getThresholdForLevel(level + 1)) {
    level += 1;
  }
  const currentThreshold = getThresholdForLevel(level);
  const nextThreshold = getThresholdForLevel(level + 1);
  return { level, currentThreshold, nextThreshold };
};

export default getLevelFromXP;
