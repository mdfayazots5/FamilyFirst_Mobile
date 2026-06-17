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
