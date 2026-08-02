// ====== Shared API Types ======
// Request/response shapes for the clicker game API endpoints.
// Platform-independent — used by both web and mobile clients.

// ====== Save Endpoint ======
// POST /api/clicker/save

export interface SaveRequest {
  userId: string;
  crystals: number;
  crystalsExp?: number;
  totalClicks: number;
  totalEarned: number;
  totalEarnedExp?: number;
  clickPower: number;
  multiplier: number;
  autoRate: number;
  prestige: number;
  prestigePoints: number;
  upgrades: unknown[];
  achievements: unknown[];
  goldenClicks: number;
  totalCrits?: number;
  maxCombo: number;
  lastOnlineTime?: number;
  totalEvents?: number;
  currentArea?: string;
  unlockedAreas?: string[];
}

export interface SaveResponse {
  success: boolean;
  error?: string;
}

// ====== Load Endpoint ======
// GET /api/clicker/load?userId=xxx

export interface LoadResponse {
  success: boolean;
  error?: string;
  data: Record<string, unknown> | null;
  ownedPremiumItems?: string[];
}

// ====== Premium Endpoint ======
// GET /api/clicker/premium?userId=xxx
// POST /api/clicker/premium

export interface PremiumPurchaseRequest {
  userId: string;
  itemId: string;
}

export interface PremiumPurchaseResponse {
  success: boolean;
  error?: string;
  alreadyOwned?: boolean;
  itemId?: string;
  itemName?: string;
  price?: number;
}

export interface PremiumItemResponse {
  success: boolean;
  error?: string;
  ownedItems: string[];
}
