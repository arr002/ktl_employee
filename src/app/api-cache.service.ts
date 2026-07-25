import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { environment } from '../environments/environment';
import { firstValueFrom } from 'rxjs';

export type DraftType = 'dsr' | 'drmt' | 'drmt_popup';

/**
 * Simple session + disk cache so menu/DSR APIs are not hit on every navigation.
 * Drafts are synced to the server API when online, with local fallback.
 */
@Injectable({ providedIn: 'root' })
export class ApiCacheService {
  private memory = new Map<string, any>();
  private url = environment.SERVER_URL;

  constructor(private storage: Storage, private http: HttpClient) {}

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
        if (key.startsWith('cache_') || key.startsWith('draft_dsr_') || key.startsWith('draft_drmt_')) {
          await this.remove(key);
        }
      }
    } catch (e) {
      // fallback for older storage without keys()
      for (const key of Array.from(this.memory.keys())) {
        if (key.startsWith('cache_') || key.startsWith('draft_dsr_') || key.startsWith('draft_drmt_')) {
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

  draftDrmtKey(userId: any) {
    return `draft_drmt_${userId}`;
  }

  draftDrmtPopupKey(userId: any) {
    return `draft_drmt_popup_${userId}`;
  }

  private localDraftKey(type: DraftType, userId: any) {
    if (type === 'dsr') {
      return this.draftKey(userId);
    }
    if (type === 'drmt_popup') {
      return this.draftDrmtPopupKey(userId);
    }
    return this.draftDrmtKey(userId);
  }

  private draftHeaders() {
    return new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    });
  }

  /**
   * Save draft to API (preferred) and mirror locally.
   * Returns savedAt ISO string when possible.
   */
  async saveDraftRemote(userId: any, type: DraftType, draft: any): Promise<string | null> {
    const localKey = this.localDraftKey(type, userId);
    await this.set(localKey, draft);

    try {
      const res: any = await firstValueFrom(
        this.http.post(this.url + 'savedraft', {
          appuser_id: userId,
          type,
          data: draft
        }, { headers: this.draftHeaders() })
      );
      if (res && res.status) {
        return res.savedAt || draft.savedAt || new Date().toISOString();
      }
    } catch (e) {
      // Offline / API not deployed yet — local copy already saved
      console.warn('saveDraftRemote failed, using local only', e);
    }
    return draft.savedAt || new Date().toISOString();
  }

  /**
   * Load draft: try API first, then local. Syncs winner to the other side.
   */
  async getDraftRemote(userId: any, type: DraftType): Promise<any | null> {
    const localKey = this.localDraftKey(type, userId);

    try {
      const res: any = await firstValueFrom(
        this.http.post(this.url + 'getdraft', {
          appuser_id: userId,
          type
        }, { headers: this.draftHeaders() })
      );
      if (res && res.status && res.data) {
        await this.set(localKey, res.data);
        return res.data;
      }
    } catch (e) {
      console.warn('getDraftRemote failed, trying local', e);
    }

    return await this.get(localKey);
  }

  /** Clear draft on API and locally. */
  async clearDraftRemote(userId: any, type: DraftType): Promise<void> {
    const localKey = this.localDraftKey(type, userId);
    await this.remove(localKey);

    try {
      await firstValueFrom(
        this.http.post(this.url + 'cleardraft', {
          appuser_id: userId,
          type
        }, { headers: this.draftHeaders() })
      );
    } catch (e) {
      console.warn('clearDraftRemote failed', e);
    }
  }
}
