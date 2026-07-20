import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

/**
 * Simple session + disk cache so menu/DSR APIs are not hit on every navigation.
 */
@Injectable({ providedIn: 'root' })
export class ApiCacheService {
  private memory = new Map<string, any>();

  constructor(private storage: Storage) {}

  private async ensureStorage() {
    try {
      await this.storage.create();
    } catch (e) { }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.memory.has(key)) {
      return this.memory.get(key) as T;
    }
    await this.ensureStorage();
    const value = await this.storage.get(key);
    if (value != null) {
      this.memory.set(key, value);
      return value as T;
    }
    return null;
  }

  async set(key: string, value: any): Promise<void> {
    this.memory.set(key, value);
    await this.ensureStorage();
    await this.storage.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.memory.delete(key);
    await this.ensureStorage();
    await this.storage.remove(key);
  }

  /** Clear app API caches (call on logout). Keeps login session keys untouched. */
  async clearApiCaches(): Promise<void> {
    const keys = [
      'cache_homescreen',
      'cache_profile',
      'cache_dsr_towns',
      'cache_dsr_dates',
      'cache_dsr_customers'
    ];
    for (const key of keys) {
      await this.remove(key);
    }
    // also clear any town-specific customer keys held in memory
    for (const key of Array.from(this.memory.keys())) {
      if (key.startsWith('cache_')) {
        await this.remove(key);
      }
    }
  }

  homescreenKey(userId: any) {
    return `cache_homescreen_${userId}`;
  }

  profileKey(userId: any) {
    return `cache_profile_${userId}`;
  }

  townsKey(userId: any) {
    return `cache_dsr_towns_${userId}`;
  }

  datesKey(userId: any) {
    return `cache_dsr_dates_${userId}`;
  }

  customersKey(userId: any, town: string) {
    return `cache_dsr_customers_${userId}_${(town || '').toLowerCase()}`;
  }
}
