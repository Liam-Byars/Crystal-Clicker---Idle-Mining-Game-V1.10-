// Safe math utilities for preventing JS number overflow in clicker game
// Uses log10-based arithmetic for numbers that would exceed Number.MAX_VALUE

/** Log10 of the safe cap for the mantissa part */
export const SAFE_LOG = 280; // mantissa is kept below 1e280

/** Add two numbers in log10 space: log10(10^a + 10^b) */
export function logAdd(a: number, b: number): number {
  if (!isFinite(a)) return isFinite(b) ? b : 400;
  if (!isFinite(b)) return a;
  if (a < -300) return b;
  if (b < -300) return a;
  if (a < b) { const t = a; a = b; b = t; }
  const diff = a - b;
  if (diff > 40) return a; // b is negligible (< 1e-40 relative)
  return a + Math.log10(1 + Math.pow(10, -diff));
}

/** Subtract in log10 space: log10(10^a - 10^b), assumes a >= b */
export function logSub(a: number, b: number): number {
  if (!isFinite(a) || !isFinite(b)) return isFinite(a) ? a : 400;
  if (a <= b) return -Infinity;
  const diff = a - b;
  if (diff > 40) return a; // b is negligible
  return a + Math.log10(1 - Math.pow(10, -diff));
}

/** Convert a JS number to log10, handling Infinity and edge cases */
export function toLog(n: number): number {
  if (!isFinite(n)) return 400; // treat Infinity as 1e400
  if (n <= 0) return -Infinity;
  return Math.log10(n);
}

/** Split a total log10 value into (mantissa, exp) where mantissa < 1e280 */
export function splitLog(totalLog: number): { value: number; exp: number } {
  if (!isFinite(totalLog)) return { value: 1, exp: 0 };
  if (totalLog <= -300) return { value: 0, exp: 0 };
  if (totalLog <= SAFE_LOG) {
    return { value: Math.pow(10, Math.max(0, totalLog)), exp: 0 };
  }
  const exp = Math.floor(totalLog / SAFE_LOG) * SAFE_LOG;
  const remainder = totalLog - exp;
  return { value: Math.pow(10, Math.max(0, remainder)), exp };
}

/** Safe add: add an amount to a (value, exp) pair */
export function safeAdd(currentValue: number, currentExp: number, addend: number): { value: number; exp: number } {
  const currentLog = toLog(currentValue) + currentExp;
  const addendLog = toLog(addend);
  const newLog = logAdd(currentLog, addendLog);
  return splitLog(newLog);
}

/** Safe subtract: subtract an amount from a (value, exp) pair */
export function safeSub(currentValue: number, currentExp: number, subtrahend: number): { value: number; exp: number } {
  const currentLog = toLog(currentValue) + currentExp;
  const subLog = toLog(subtrahend);
  const newLog = logSub(currentLog, subLog);
  return splitLog(newLog);
}

/** Can we afford a cost given our (value, exp) balance? */
export function canAfford(value: number, exp: number, cost: number): boolean {
  if (!isFinite(cost)) {
    // cost is Infinity - compare in log space
    // Our effective log = toLog(value) + exp, cost is effectively ~400+
    return (toLog(value) + exp) >= 300; // if we're also extremely large
  }
  if (exp > 0) {
    // We're in overflow mode, compare in log space
    return (toLog(value) + exp) >= toLog(cost);
  }
  // Normal mode - cost could still be Infinity
  if (!isFinite(cost)) return false;
  return value >= cost;
}

/** Get upgrade cost in log10 space (never overflows) */
export function getUpgradeCostLog(baseCost: number, costMultiplier: number, level: number): number {
  return Math.log10(baseCost) + level * Math.log10(costMultiplier);
}

/** Get the max number of upgrades affordable in log space */
export function getMaxBuyCountLog(
  baseCost: number, costMultiplier: number, level: number,
  moneyValue: number, moneyExp: number, maxLevel?: number
): number {
  const cap = maxLevel ? maxLevel - level : 10000;
  if (cap <= 0) return 0;

  const moneyLog = toLog(moneyValue) + moneyExp;
  const cmLog = Math.log10(costMultiplier);
  const firstCostLog = Math.log10(baseCost) + level * cmLog;

  if (moneyLog < firstCostLog) return 0;

  if (cmLog === 0) {
    // All costs are the same
    // Total = baseCost * cm^level * n
    // log(total) = firstCostLog + log(n)
    // Need: firstCostLog + log(n) <= moneyLog
    // n <= 10^(moneyLog - firstCostLog)
    return Math.min(cap, Math.floor(Math.pow(10, moneyLog - firstCostLog)));
  }

  // Total cost of n items ≈ baseCost * cm^level * (cm^n - 1) / (cm - 1)
  // For large n: log ≈ firstCostLog + n*cmLog - log10(cm-1)
  // Solve: firstCostLog + n*cmLog - log10(cm-1) <= moneyLog
  // n <= (moneyLog - firstCostLog + log10(cm-1)) / cmLog
  const approxN = Math.floor((moneyLog - firstCostLog + Math.log10(costMultiplier - 1)) / cmLog);
  return Math.max(0, Math.min(cap, approxN));
}

/** Get total cost of buying n upgrades in log space */
export function getTotalCostNLog(
  baseCost: number, costMultiplier: number, level: number, n: number
): number {
  if (n <= 0) return -Infinity;
  const cmLog = Math.log10(costMultiplier);
  const firstCostLog = Math.log10(baseCost) + level * cmLog;

  if (cmLog === 0) {
    return firstCostLog + Math.log10(n);
  }

  if (n <= 50) {
    let totalLog = -Infinity;
    for (let i = 0; i < n; i++) {
      totalLog = logAdd(totalLog, firstCostLog + i * cmLog);
    }
    return totalLog;
  }

  // Geometric series approximation
  return firstCostLog + n * cmLog - Math.log10(costMultiplier - 1);
}

/** Cap a potentially infinite number to a safe value */
export function capNum(n: number): number {
  if (!isFinite(n)) return Math.pow(10, SAFE_LOG);
  if (n > Math.pow(10, SAFE_LOG)) return Math.pow(10, SAFE_LOG);
  if (n < 0) return 0;
  return n;
}

/** Safe multiply: returns the log10 of the product, handling overflow */
export function safeMulLog(a: number, b: number): number {
  if (a <= 0 || b <= 0) return -Infinity;
  return toLog(a) + toLog(b);
}
