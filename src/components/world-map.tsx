'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, AREAS, type Area } from '@/stores';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Lock, MapPin, Navigation, Search, Filter } from 'lucide-react';

function fmtReq(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 1e6) return (n / 1e3).toFixed(0) + 'K';
  if (n < 1e9) return (n / 1e6).toFixed(0) + 'M';
  if (n < 1e12) return (n / 1e9).toFixed(0) + 'B';
  if (n < 1e15) return (n / 1e12).toFixed(0) + 'T';
  // AA-ZZ double-letter suffixes (676 tiers, each 1000x)
  const exp = Math.floor(Math.log10(n));
  const tier = Math.floor((exp - 15) / 3);
  if (tier >= 0 && tier < 676) {
    const first = String.fromCharCode(65 + Math.floor(tier / 26));
    const second = String.fromCharCode(65 + (tier % 26));
    const divisor = Math.pow(10, 15 + tier * 3);
    return (n / divisor).toFixed(1) + first + second;
  }
  return n.toExponential(1);
}

type FilterMode = 'all' | 'unlocked' | 'locked' | 'next';

const FILTER_OPTIONS: { value: FilterMode; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unlocked', label: 'Unlocked' },
  { value: 'locked', label: 'Locked' },
  { value: 'next', label: 'Next 5' },
];

function MineCard({
  area,
  isCurrent,
  isUnlocked,
  progress,
  mineIndex,
}: {
  area: Area;
  isCurrent: boolean;
  isUnlocked: boolean;
  progress: number;
  mineIndex: number;
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
      {/* Icon + Active badge + Mine # */}
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
        <div className="flex items-center gap-1">
          <span className="text-[8px] text-gray-600 font-mono">#{mineIndex + 1}</span>
          {isCurrent && (
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 flex items-center gap-0.5">
              <Navigation className="w-2.5 h-2.5" />
              Active
            </span>
          )}
        </div>
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
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');

  const filteredAreas = useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    let result = AREAS.map((area, index) => ({ area, index }));

    // Apply search filter
    if (searchLower) {
      result = result.filter(({ area, index }) =>
        area.name.toLowerCase().includes(searchLower) ||
        area.location.toLowerCase().includes(searchLower) ||
        area.gem.toLowerCase().includes(searchLower) ||
        String(index + 1).includes(searchLower)
      );
    }

    // Apply status filter
    if (filter === 'unlocked') {
      result = result.filter(({ area }) => unlockedAreas.includes(area.id));
    } else if (filter === 'locked') {
      result = result.filter(({ area }) => !unlockedAreas.includes(area.id));
    } else if (filter === 'next') {
      // Show current + next 4 locked mines
      const currentIdx = result.findIndex(({ area }) => area.id === currentArea);
      if (currentIdx >= 0) {
        const lockedAfter = result.filter(({ area }) => !unlockedAreas.includes(area.id));
        const nextLocked = lockedAfter.slice(0, 4);
        const current = result[currentIdx];
        const currentInNext = nextLocked.some(n => n.area.id === current.area.id);
        result = currentInNext ? nextLocked : [current, ...nextLocked];
      } else {
        result = result.filter(({ area }) => !unlockedAreas.includes(area.id)).slice(0, 5);
      }
    }

    return result;
  }, [search, filter, unlockedAreas, currentArea]);

  const unlockedCount = unlockedAreas.length;
  const totalCount = AREAS.length;

  return (
    <div className="h-full flex flex-col">
      <div className="px-1 pb-2 sm:pb-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-gray-200">Mining Map</h2>
          <span className="text-[11px] text-gray-500">
            {unlockedCount}/{totalCount} mines
          </span>
        </div>

        {/* Search bar */}
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <Input
            placeholder="Search mines, locations, gems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 pr-3 text-xs bg-gray-900/50 border-gray-700/50 text-gray-200 placeholder:text-gray-600"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3 h-3 text-gray-500" />
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`
                text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors
                ${filter === opt.value
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-gray-500 hover:text-gray-300 border border-transparent hover:border-gray-700/50'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-1 pb-8">
          {filteredAreas.map(({ area, index }) => (
            <MineCard
              key={area.id}
              area={area}
              isCurrent={currentArea === area.id}
              isUnlocked={unlockedAreas.includes(area.id)}
              progress={area.unlockAt > 0 ? totalEarned / area.unlockAt : 1}
              mineIndex={index}
            />
          ))}
          {filteredAreas.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-600 text-sm">
              {search ? `No mines matching "${search}"` : 'No mines in this category'}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
