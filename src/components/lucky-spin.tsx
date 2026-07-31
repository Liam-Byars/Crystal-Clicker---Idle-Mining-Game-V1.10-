'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface SpinPrize {
  label: string;
  icon: string;
  color: string;
  weight: number; // Higher = more common
  getReward: () => { type: 'crystals' | 'prestige' | 'mult' | 'golden' | 'auto'; value: number; description: string };
}

const PRIZES: SpinPrize[] = [
  { label: 'Jackpot', icon: '💰', color: '#fbbf24', weight: 2, getReward: () => ({ type: 'crystals', value: 0, description: 'JACKPOT! 5 minutes of auto-income!' }) },
  { label: 'Small Crystal', icon: '💎', color: '#a855f7', weight: 30, getReward: () => ({ type: 'crystals', value: 500, description: '+500 Crystals' }) },
  { label: 'Medium Crystal', icon: '🔶', color: '#f97316', weight: 20, getReward: () => ({ type: 'crystals', value: 5000, description: '+5,000 Crystals' }) },
  { label: 'Large Crystal', icon: '⭐', color: '#eab308', weight: 10, getReward: () => ({ type: 'crystals', value: 50000, description: '+50,000 Crystals' }) },
  { label: 'Auto Boost', icon: '⚙️', color: '#22d3ee', weight: 15, getReward: () => ({ type: 'auto', value: 30, description: '+30s Double Auto Rate' }) },
  { label: 'Click Boost', icon: '⚔️', color: '#ec4899', weight: 15, getReward: () => ({ type: 'mult', value: 30, description: '+30s Double Click Power' }) },
  { label: 'Golden Rush', icon: '🌟', color: '#fbbf24', weight: 8, getReward: () => ({ type: 'golden', value: 1, description: 'Guaranteed Golden Crystal!' }) },
];

const TOTAL_WEIGHT = PRIZES.reduce((s, p) => s + p.weight, 0);
const SPIN_COOLDOWN = 30 * 60 * 1000; // 30 minutes
const STORAGE_KEY = 'crystal_clicker_spin_cd';

function pickPrize(): number {
  let r = Math.random() * TOTAL_WEIGHT;
  for (let i = 0; i < PRIZES.length; i++) {
    r -= PRIZES[i].weight;
    if (r <= 0) return i;
  }
  return 0;
}

function getCooldownRemaining(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    return Math.max(0, Number(raw) - Date.now());
  } catch { return 0; }
}

interface LuckySpinProps {
  open: boolean;
  onClose: () => void;
  onReward: (reward: { type: string; value: number; description: string }) => void;
  crystals: number;
  autoRate: number;
}

export function LuckySpin({ open, onClose, onReward, crystals, autoRate }: LuckySpinProps) {
  const [spinning, setSpinning] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState(-1);
  const [cooldownMs, setCooldownMs] = useState(() => getCooldownRemaining());
  const [result, setResult] = useState<{ prize: SpinPrize; reward: ReturnType<SpinPrize['getReward']> } | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const cooldownIv = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    cooldownIv.current = setInterval(() => {
    }, 1000);
    return () => { if (cooldownIv.current) clearInterval(cooldownIv.current); };
  }, [open]);

  const onCooldown = cooldownMs > 0;
  const canSpin = !spinning && !onCooldown;

  const doSpin = useCallback(() => {
    if (!canSpin) return;
    setSpinning(true);
    setResult(null);
    const idx = pickPrize();
    setPrizeIndex(idx);
    // Calculate rotation: 5-8 full spins + land on the prize segment
    const segmentAngle = 360 / PRIZES.length;
    const targetAngle = idx * segmentAngle + segmentAngle / 2;
    const fullSpins = (5 + Math.floor(Math.random() * 4)) * 360;
    const totalDeg = fullSpins + (360 - targetAngle); // Rotate clockwise to land on prize

    if (wheelRef.current) {
      wheelRef.current.style.setProperty('--spin-deg', `${totalDeg}deg`);
      wheelRef.current.style.setProperty('--spin-duration', '4s');
      wheelRef.current.classList.remove('spin-wheel-anim');
      // Force reflow
      void wheelRef.current.offsetWidth;
      wheelRef.current.classList.add('spin-wheel-anim');
    }

    setTimeout(() => {
      const prize = PRIZES[idx];
      let reward = prize.getReward();
      // Jackpot: give 5 minutes of auto-income worth of crystals
      if (prize.label === 'Jackpot') {
        const jackpot = Math.max(autoRate * 300, 1000); // 5 min of auto * some multiplier
        reward = { type: 'crystals', value: jackpot, description: `JACKPOT! +${jackpot.toLocaleString()} Crystals!` };
      }
      setResult({ prize, reward });
      onReward(reward);
      try { localStorage.setItem(STORAGE_KEY, String(Date.now() + SPIN_COOLDOWN)); } catch { /* ignore */ }
      setCooldownMs(SPIN_COOLDOWN);
      setSpinning(false);
    }, 4200);
  }, [canSpin, onReward, autoRate]);

  const cooldownStr = onCooldown
    ? `${Math.floor(cooldownMs / 60000)}:${String(Math.floor((cooldownMs % 60000) / 1000)).padStart(2, '0')}`
    : '';

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !spinning) onClose(); }}>
      <DialogContent className="bg-gray-900 border-yellow-700/40 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center text-yellow-300">
            🎰 Lucky Spin
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Spin once every 30 minutes for a chance to win big!
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-4">
          {/* Wheel */}
          <div className="relative w-56 h-56 sm:w-64 sm:h-64">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 text-yellow-400 text-2xl drop-shadow-lg">
              ▼
            </div>
            {/* Wheel */}
            <div
              ref={wheelRef}
              className={`w-full h-full rounded-full border-4 border-yellow-600/60 overflow-hidden ${!spinning ? 'spin-glow' : ''}`}
            >
              <div
                className="w-full h-full"
                style={{
                  background: `conic-gradient(
                    ${PRIZES.map((p, i) => {
                      const start = (i / PRIZES.length) * 360;
                      const end = ((i + 1) / PRIZES.length) * 360;
                      return `${p.color} ${start}deg ${end}deg`;
                    }).join(', ')}
                  )`,
                }}
              >
                {/* Segment labels */}
                {PRIZES.map((p, i) => {
                  const angle = (i / PRIZES.length) * 360 + (360 / PRIZES.length) / 2;
                  const rad = (angle - 90) * (Math.PI / 180);
                  const radius = 38; // %
                  const x = 50 + radius * Math.cos(rad);
                  const y = 50 + radius * Math.sin(rad);
                  return (
                    <div
                      key={i}
                      className="absolute text-lg"
                      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      {p.icon}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Result */}
          {result && !spinning && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-2">
              <div className="text-3xl mb-1">{result.prize.icon}</div>
              <div className="text-sm font-bold text-yellow-300">{result.prize.label}</div>
              <div className="text-xs text-gray-300 mt-1">{result.reward.description}</div>
            </div>
          )}

          {/* Spin Button */}
          <Button
            className={`w-full h-12 font-medium text-base rounded-xl transition-all ${
              canSpin
                ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white shadow-lg shadow-yellow-500/20 cursor-pointer'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!canSpin}
            onClick={doSpin}
          >
            {spinning ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-yellow-300 rounded-full animate-spin" />
                Spinning...
              </span>
            ) : onCooldown ? (
              `⏳ Cooldown ${cooldownStr}`
            ) : (
              '🎰 Spin! (Free)'
            )}
          </Button>

          <Separator className="bg-gray-800/50" />

          {/* Prize List */}
          <div className="w-full space-y-1.5">
            <p className="text-xs text-gray-500 text-center mb-2">Possible Prizes</p>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {PRIZES.map((p) => (
                <div key={p.label} className="flex items-center gap-2 text-gray-400 bg-gray-800/40 rounded-lg px-2.5 py-1.5">
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
