'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore, AREAS, type Area } from '@/stores';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lock, MapPin, Navigation } from 'lucide-react';

function fmtReq(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 1e6) return (n / 1e3).toFixed(0) + 'K';
  if (n < 1e9) return (n / 1e6).toFixed(0) + 'M';
  if (n < 1e12) return (n / 1e9).toFixed(0) + 'B';
  if (n < 1e15) return (n / 1e12).toFixed(0) + 'T';
  // Extended suffixes AA, AB, AC...
  if (n < 1e18) return (n / 1e15).toFixed(1) + 'AA';
  if (n < 1e21) return (n / 1e18).toFixed(1) + 'AB';
  if (n < 1e24) return (n / 1e21).toFixed(1) + 'AC';
  if (n < 1e27) return (n / 1e24).toFixed(1) + 'AD';
  if (n < 1e30) return (n / 1e27).toFixed(1) + 'AE';
  if (n < 1e33) return (n / 1e30).toFixed(1) + 'AF';
  if (n < 1e36) return (n / 1e33).toFixed(1) + 'AG';
  if (n < 1e39) return (n / 1e36).toFixed(1) + 'AH';
  if (n < 1e42) return (n / 1e39).toFixed(1) + 'AI';
  if (n < 1e45) return (n / 1e42).toFixed(1) + 'AJ';
  if (n < 1e48) return (n / 1e45).toFixed(1) + 'AK';
  if (n < 1e51) return (n / 1e48).toFixed(1) + 'AL';
  return (n / 1e51).toFixed(1) + 'AM';
}

function MineCard({
  area,
  isCurrent,
  isUnlocked,
  progress,
}: {
  area: Area;
  isCurrent: boolean;
  isUnlocked: boolean;
  progress: number;
}) {
  const switchArea = useGameStore(s => s.switchArea);

  const handleClick = () => {
    if (isUnlocked && !isCurrent) switchArea(area.id);
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={!isUnlocked}
      className={`
        relative w-full text-left rounded-xl border p-2.5 sm:p-3 transition-all duration-200
        ${isCurrent
          ? 'border-cyan-500/50 bg-cyan-950/30 shadow-lg shadow-cyan-500/10 cursor-default'
          : isUnlocked
            ? 'border-gray-700/30 bg-gray-800/40 hover:bg-gray-700/50 hover:border-gray-500/40 cursor-pointer active:scale-[0.97]'
            : 'border-gray-800/20 bg-gray-900/20 opacity-40 cursor-not-allowed'
        }
      `}
      whileTap={isUnlocked && !isCurrent ? { scale: 0.96 } : undefined}
    >
      {/* Icon + Active badge */
      <div className="flex items-start justify-between mb-1.5">
        <div className={`
          w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0
          ${isCurrent
            ? 'bg-cyan-500/15 border border-cyan-500/30'
            : isUnlocked
              ? 'bg-gray-700/40'
              : 'bg-gray-800/40'
          }
        `}>
          {isUnlocked ? area.icon : <Lock className="w-4 h-4 text-gray-600" />}
        </div>
        {isCurrent && (
          <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 flex items-center gap-0.5">
            <Navigation className="w-2.5 h-2.5" />
            Active
          </span>
        )}
      </div>

      {/* Mine name */}
      <h3 className={`text-xs sm:text-sm font-semibold truncate mb-0.5 ${isCurrent ? 'text-cyan-300' : 'text-gray-200'}`}>
        {area.name}
      </h3>

      {/* Location + gem */}
      <div className="flex items-center gap-1 mb-1.5">
        <span className="text-[10px] sm:text-[11px] text-gray-500 flex items-center gap-0.5 truncate">
          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
          {area.flag} {area.location}
        </span>
      </div>
      <div className="text-[10px] sm:text-[11px] text-gray-400 font-medium mb-2 truncate">
        {area.gem}
      </div>

      {/* Status */}
      {isUnlocked ? (
        <div className="text-[10px] text-gray-500">
          {isCurrent ? '✦ Currently mining' : '→ Tap to travel'}
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] text-gray-500">Need {fmtReq(area.unlockAt)} total</span>
            <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium">{Math.min(progress * 100, 100).toFixed(0)}%</span>
          </div>
          <Progress value={Math.min(progress * 100, 100)} className="h-1 bg-gray-800" />
        </div>
      )}

      {/* Current mine glow effect */}
      {isCurrent && (
        <div className="absolute inset-0 rounded-xl pointer-events-none border border-cyan-400/20 animate-pulse" />
      )}
    </motion.button>
  );
}

export function WorldMap() {
  const currentArea = useGameStore(s => s.currentArea);
  const unlockedAreas = useGameStore(s => s.unlockedAreas);
  const totalEarned = useGameStore(s => s.totalEarned);

  return (
    <div className="h-full flex flex-col">
      <div className="px-1 pb-2 sm:pb-3">
        <h2 className="text-lg font-bold text-gray-200 mb-0.5">Mining Map</h2>
        <p className="text-[11px] text-gray-500">
          Tap an unlocked mine to travel there. Earn more to unlock new locations.
        </p>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-1 pb-8">
          {AREAS.map((area) => (
            <MineCard
              key={area.id}
              area={area}
              isCurrent={currentArea === area.id}
              isUnlocked={unlockedAreas.includes(area.id)}
              progress={area.unlockAt > 0 ? totalEarned / area.unlockAt : 1}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
