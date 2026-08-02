import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async getUserId(): Promise<string | null> {
    return AsyncStorage.getItem('user_id');
  },

  async setUserId(id: string): Promise<void> {
    await AsyncStorage.setItem('user_id', id);
  },

  async getLocalSave(userId: string): Promise<string | null> {
    return AsyncStorage.getItem(`crystal_clicker_save_${userId}`);
  },

  async setLocalSave(userId: string, data: string): Promise<void> {
    await AsyncStorage.setItem(`crystal_clicker_save_${userId}`, data);
  },

  async getDaily(userId: string): Promise<string | null> {
    return AsyncStorage.getItem(`crystal_clicker_daily_${userId}`);
  },

  async setDaily(userId: string, data: string): Promise<void> {
    await AsyncStorage.setItem(`crystal_clicker_daily_${userId}`, data);
  },
};
