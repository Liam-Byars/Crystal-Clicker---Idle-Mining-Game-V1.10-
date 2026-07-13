'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore, AREAS, type Area } from '@/stores';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lock, MapPin, ChevronRight } from 'lucide-react';

function fmtReq(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 1e6) return (n / 1e3).toFixed(0) + 'K';
  if (n < 1e9) return (n / 1e6).toFixed(0) + 'M';
  return (n / 1e9).toFixed(0) + 'B';
}

function AreaNode({
  area,
  isCurrent,
  isUnlocked,
  progress,
  isLast,
  side,
}: {
  area: Area;
  isCurrent: boolean;
  isUnlocked: boolean;
  progress: number;
  isLast: boolean;
  side: 'left' | 'right';
}) {
  const switchArea = useGameStore(s => s.switchArea);

  const handleClick = () => {
    if (isUnlocked && !isCurrent) switchArea(area.id);
  };

  return (
    <div className="relative flex" style={{ minHeight: isLast ? '80px' : '96px' }}>
      {/* Center vertical line (runs behind everything) */}
      {!isLast && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 z-0"
          style={{
            background: isUnlocked
              ? 'linear-gradient(to bottom, rgba(34,211,238,0.25), rgba(100,116,139,0.1))'
              : 'rgba(75,85,99,0.1)',
            top: '24px',
          }}
        />
      )}

      {/* Center node dot */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 z-10">
        <motion.div
          className={`
            w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg sm:text-xl
            border-2 flex-shrink-0
            ${isCurrent
              ? 'border-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.5)] bg-gray-800'
              : isUnlocked
                ? 'border-gray-500/80 bg-gray-800/90'
                : 'border-gray-700/50 bg-gray-900/80 opacity-40'
            }
          `}
          animate={isCurrent ? { scale: [1, 1.06, 1] } : {}}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {isUnlocked ? area.icon : <Lock className="w-3.5 h-3.5 text-gray-600" />}
        </motion.div>
        {isCurrent && (
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-ping" />
        )}
      </div>

      {/* LEFT side card */}
      {side === 'left' && (
        <div className="w-[calc(50%-28px)] pr-3 flex items-start pt-1">
          <div
            onClick={handleClick}
            className={`
              w-full p-3 rounded-xl border transition-all duration-200
              ${isCurrent
                ? 'border-cyan-500/40 bg-cyan-950/25 shadow-md shadow-cyan-500/5'
                : isUnlocked
                  ? 'border-gray-700/30 bg-gray-800/35 hover:bg-gray-800/55 hover:border-gray-600/40 cursor-pointer'
                  : 'border-gray-800/20 bg-gray-900/20 opacity-50 cursor-not-allowed'
              }
            `}
          >
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <h3 className={`text-sm font-semibold truncate ${isCurrent ? 'text-cyan-300' : 'text-gray-200'}`}>
                {area.name}
              </h3>
              {isCurrent && (
                <span className="text-[8px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded flex-shrink-0 border border-cyan-500/20">
                  Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {area.flag} {area.location}
              </span>
              <span className="text-gray-700">·</span>
              <span className="text-[11px] text-gray-400 font-medium">{area.gem}</span>
            </div>
            {isUnlocked ? (
              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                {!isCurrent && <ChevronRight className="w-3 h-3" />}
                {isCurrent ? 'Currently mining' : 'Tap to switch'}
              </span>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">Need {fmtReq(area.unlockAt)} total</span>
                  <span className="text-[10px] text-gray-400 font-medium">{Math.min(progress * 100, 100).toFixed(0)}%</span>
                </div>
                <Progress value={Math.min(progress * 100, 100)} className="h-1 bg-gray-800" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* RIGHT side spacer (when card is on left) or card (when on right) */}
      <div className="w-[calc(50%-28px)] pl-3 flex items-start pt-1">
        {side === 'right' ? (
          <div
            onClick={handleClick}
            className={`
              w-full p-3 rounded-xl border transition-all duration-200
              ${isCurrent
                ? 'border-cyan-500/40 bg-cyan-950/25 shadow-md shadow-cyan-500/5'
                : isUnlocked
                  ? 'border-gray-700/30 bg-gray-800/35 hover:bg-gray-800/55 hover:border-gray-600/40 cursor-pointer'
                  : 'border-gray-800/20 bg-gray-900/20 opacity-50 cursor-not-allowed'
              }
            `}
          >
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <h3 className={`text-sm font-semibold truncate ${isCurrent ? 'text-cyan-300' : 'text-gray-200'}`}>
                {area.name}
              </h3>
              {isCurrent && (
                <span className="text-[8px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded flex-shrink-0 border border-cyan-500/20">
                  Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {area.flag} {area.location}
              </span>
              <span className="text-gray-700">·</span>
              <span className="text-[11px] text-gray-400 font-medium">{area.gem}</span>
            </div>
            {isUnlocked ? (
              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                {!isCurrent && <ChevronRight className="w-3 h-3" />}
                {isCurrent ? 'Currently mining' : 'Tap to switch'}
              </span>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">Need {fmtReq(area.unlockAt)} total</span>
                  <span className="text-[10px] text-gray-400 font-medium">{Math.min(progress * 100, 100).toFixed(0)}%</span>
                </div>
                <Progress value={Math.min(progress * 100, 100)} className="h-1 bg-gray-800" />
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function WorldMap() {
  const currentArea = useGameStore(s => s.currentArea);
  const unlockedAreas = useGameStore(s => s.unlockedAreas);
  const totalEarned = useGameStore(s => s.totalEarned);

  return (
    <div className="h-full flex flex-col">
      <div className="px-1 pb-3">
        <h2 className="text-lg font-bold text-gray-200 mb-1">Mining Journey</h2>
        <p className="text-xs text-gray-500">
          Travel the world mining rare gems. Unlock new areas as you earn.
        </p>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="py-2 pb-8 max-w-md mx-auto px-2">
          {AREAS.map((area, index) => (
            <AreaNode
              key={area.id}
              area={area}
              isCurrent={currentArea === area.id}
              isUnlocked={unlockedAreas.includes(area.id)}
              progress={area.unlockAt > 0 ? totalEarned / area.unlockAt : 1}
              isLast={index === AREAS.length - 1}
              side={index % 2 === 0 ? 'left' : 'right'}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}