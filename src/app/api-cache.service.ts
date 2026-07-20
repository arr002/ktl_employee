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
    await this.ensureStorage();
    try {
      const allKeys = await this.storage.keys();
      for (const key of allKeys) {
        if (key.startsWith('cache_') || key.startsWith('draft_dsr_')) {
          await this.remove(key);
        }
      }
    } catch (e) {
      // fallback for older storage without keys()
      for (const key of Array.from(this.memory.keys())) {
        if (key.startsWith('cache_') || key.startsWith('draft_dsr_')) {
          await this.remove(key);
        }
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

  draftKey(userId: any) {
    return `draft_dsr_${userId}`;
  }
}
