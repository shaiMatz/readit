import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export type HNItemType = 'story' | 'comment' | 'ask' | 'job' | 'poll';

export interface HNItem {
  id: number;
  type: HNItemType;
  title?: string;
  url?: string;
  score?: number;
  by?: string;
  time?: number;
  /** Comment count */
  descendants?: number;
  kids?: number[];
  text?: string;
  deleted?: boolean;
  dead?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = 'https://hacker-news.firebaseio.com/v0';
export const PAGE_SIZE = 20;

const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [500, 1_000, 2_000] as const;

// ─── Retry-aware Axios instance ──────────────────────────────────────────────

/** Extend Axios config to track per-request retry count. */
interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
}

function createHNClient(): AxiosInstance {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 10_000,
    headers: { Accept: 'application/json' },
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RetryConfig | undefined;
      if (!config) return Promise.reject(error);

      config._retryCount = config._retryCount ?? 0;

      const isNetworkError =
        error.code === 'ECONNABORTED' ||
        error.code === 'ERR_NETWORK' ||
        !error.response;

      const isServerError =
        error.response !== undefined && error.response.status >= 500;

      const shouldRetry =
        config._retryCount < MAX_RETRIES && (isNetworkError || isServerError);

      if (!shouldRetry) return Promise.reject(error);

      config._retryCount += 1;
      const delayMs = RETRY_DELAYS_MS[config._retryCount - 1] ?? 2_000;

      await new Promise<void>((resolve) => setTimeout(resolve, delayMs));

      return client(config);
    },
  );

  return client;
}

const hnClient = createHNClient();

// ─── API Functions ────────────────────────────────────────────────────────────

/** Fetch up to 500 top story IDs. */
export async function fetchTopStoryIds(): Promise<number[]> {
  const { data } = await hnClient.get<number[]>('/topstories.json');
  return data;
}

/**
 * Fetch a single item. Returns null if the item is missing or dead.
 * Never throws — individual 404s are swallowed so Promise.all keeps working.
 */
export async function fetchItem(id: number): Promise<HNItem | null> {
  try {
    const { data } = await hnClient.get<HNItem | null>(`/item/${id}.json`);
    return data;
  } catch {
    return null;
  }
}

/**
 * Fetch a page of items given the full ID array.
 * @param ids   Full ordered list of story IDs (from fetchTopStoryIds)
 * @param page  0-based page index
 * @param size  Items per page (default PAGE_SIZE)
 */
export async function fetchPage(
  ids: number[],
  page: number,
  size: number = PAGE_SIZE,
): Promise<HNItem[]> {
  const start = page * size;
  const slice = ids.slice(start, start + size);
  const results = await Promise.all(slice.map(fetchItem));
  return results.filter(
    (item): item is HNItem =>
      item !== null && !item.deleted && !item.dead,
  );
}

