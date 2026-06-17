import apiClient from '../network/apiClient';
import { MasterApiReference } from '../api/MasterApiReference';
import { ApiResponse, GetMastersResponse, MasterDataItem } from '../network/apiTypes';

export async function getMasters(
  masterDataCode: string,
  options?: { searchWord?: string; code?: string; pageSize?: number }
): Promise<MasterDataItem[]> {
  const response = await apiClient.post<ApiResponse<GetMastersResponse>>(
    MasterApiReference.GetMasters,
    {
      masterDataCode,
      searchWord: options?.searchWord ?? null,
      code: options?.code ?? null,
      pageSize: options?.pageSize ?? 100,
      pageNumber: 1,
      languageId: 1,
    }
  );

  return response.data.data?.items ?? [];
}
