import Constants from 'expo-constants';

const API_BASE = Constants.expoConfig?.extra?.apiBase || 'http://localhost:3000';

export const api = {
  async loadGame(userId: string): Promise<Record<string, unknown>> {
    const res = await fetch(`${API_BASE}/api/clicker/load?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to load');
    return res.json();
  },

  async saveGame(data: Record<string, unknown>): Promise<void> {
    await fetch(`${API_BASE}/api/clicker/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async purchasePremium(userId: string, itemId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/api/clicker/premium`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, itemId }),
    });
    return res.ok;
  },
};
