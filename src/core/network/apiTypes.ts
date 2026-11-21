export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  succeeded: boolean;
  data: T | null;
  message: string | null;
  errors: ApiError[];
}

/**
 * Unwraps `ApiResponse<T>.data` for endpoints that must return a payload on success.
 * A null payload means the API broke its contract — throw so the screen shows its error
 * state instead of crashing later on a null property access.
 * List endpoints should use `?? []`, boolean endpoints `?? false`, instead of this helper.
 */
export function requireApiData<T>(response: ApiResponse<T>, context: string): T {
  if (response.data == null) {
    throw new Error(`${context}: empty response from server`);
  }
  return response.data;
}

export interface MasterDataItem {
  id: string;
  name: string;
  code: string;
  sortOrder: number;
}

export interface GetMastersResponse {
  items: MasterDataItem[];
  totalCount: number;
}
