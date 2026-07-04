'use client';

import React from 'react';
import { useGameStore, AREAS, type Area } from '@/stores';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lock, MapPin } from 'lucide-react';

function fmtReq(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 1e6) return (n / 1e3).toFixed(0) + 'K';
  if (n < 1e9) return (n / 1e6).toFixed(0) + 'M';
  return (n / 1e9).toFixed(0) + 'B';
}

function AreaCard({ area, isCurrent, isUnlocked, progress }: {
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
    <Card
      onClick={handleClick}
      className={`
        relative overflow-hidden transition-all duration-200 min-w-[220px] sm:min-w-0 flex-shrink-0
        ${isCurrent
          ? 'border-2 border-cyan-500/60 bg-gray-800/80 shadow-lg shadow-cyan-500/10 cursor-default'
          : isUnlocked
            ? 'border border-gray-700/60 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70 cursor-pointer hover:shadow-md'
            : 'border border-gray-800/40 bg-gray-900/60 cursor-not-allowed opacity-70'
        }
      `}
    >
      {isCurrent && (
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{ background: `linear-gradient(135deg, transparent 40%, ${area.glowColor})` }}
        />
      )}

      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{area.icon}</span>
            <div>
              <h3 className={`text-sm font-semibold leading-tight ${isCurrent ? 'text-cyan-300' : 'text-gray-200'}`}>
                {area.name}
              </h3>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {area.flag} {area.location}
              </p>
            </div>
          </div>
          {!isUnlocked && (
            <Lock className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1" />
          )}
        </div>

        {/* Gem type */}
        <Badge
          variant="outline"
          className={`text-[10px] px-2 py-0 mb-2 ${
            isCurrent
              ? 'border-cyan-700/50 text-cyan-300 bg-cyan-900/30'
              : 'border-gray-700/50 text-gray-400 bg-gray-800/50'
          }`}
        >
          {area.gem}
        </Badge>

        {/* Description */}
        <p className="text-[11px] text-gray-500 leading-snug mb-3 line-clamp-2">
          {area.description}
        </p>

        {/* Status */}
        {isUnlocked ? (
          <div className="flex items-center gap-1.5">
            {isCurrent && (
              <Badge className="bg-cyan-600/30 text-cyan-300 border-cyan-700/40 text-[10px] px-2 py-0">
                Mining Here
              </Badge>
            )}
            {!isCurrent && (
              <span className="text-[10px] text-gray-500">Click to switch</span>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-500">
                Earn {fmtReq(area.unlockAt)} total to unlock
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                {Math.min(progress * 100, 100).toFixed(0)}%
              </span>
            </div>
            <Progress
              value={Math.min(progress * 100, 100)}
              className="h-1.5 bg-gray-800"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function WorldMap() {
  const currentArea = useGameStore(s => s.currentArea);
  const unlockedAreas = useGameStore(s => s.unlockedAreas);
  const totalEarned = useGameStore(s => s.totalEarned);

  return (
    <div className="h-full flex flex-col">
      <div className="px-1 pb-3">
        <h2 className="text-lg font-bold text-gray-200 mb-1">Mining Areas</h2>
        <p className="text-xs text-gray-500">
          Unlock new areas by earning more crystals. All upgrades stack globally.
        </p>
      </div>

      {/* Mobile: horizontal scroll, Desktop: grid */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-[calc(100vh-420px)] lg:h-[calc(100vh-380px)]">
          {/* Mobile: horizontal scroll */}
          <div className="flex gap-3 pb-4 pr-3 lg:hidden overflow-x-auto">
            {AREAS.map(area => (
              <AreaCard
                key={area.id}
                area={area}
                isCurrent={currentArea === area.id}
                isUnlocked={unlockedAreas.includes(area.id)}
                progress={area.unlockAt > 0 ? totalEarned / area.unlockAt : 1}
              />
            ))}
          </div>

          {/* Desktop: grid */}
          <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-3 pb-4 pr-3">
            {AREAS.map(area => (
              <AreaCard
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
    </div>
  );
}