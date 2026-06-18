import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import { AppConfig } from '../../../core/config/appConfig';
import type { ApiResponse } from '../../../core/network/apiTypes';

export type DocumentCategory =
  | 'Medical' | 'Identity' | 'School' | 'Financial'
  | 'Insurance' | 'Legal' | 'Certificates' | 'Other';

export const CATEGORY_LABELS: Record<number, DocumentCategory> = {
  1: 'Medical', 2: 'Identity', 3: 'School', 4: 'Financial',
  5: 'Insurance', 6: 'Legal', 7: 'Certificates', 8: 'Other',
};

export type ExpiryStatus = 'None' | 'Green' | 'Amber' | 'Red';

export interface VaultDocument {
  documentId: string;
  documentName: string;
  category: number;
  categoryName: string;
  memberId: string;
  memberName: string;
  uploadedByUserId: string;
  uploadDate: string;
  expiryDate?: string;
  expiryStatus: ExpiryStatus;
  thumbnailUrl?: string;
  tags: string[];
  isEmergencyPriority: boolean;
  versionNumber: number;
}

export interface DocumentDetail extends VaultDocument {
  fileUrl: string;
  visibility: number;
  versionHistory: VersionEntry[];
  activeShareLinks: ShareLink[];
}

export interface VersionEntry {
  versionId: string;
  versionNumber: number;
  fileUrl: string;
  uploadedByUserId: string;
  archivedAt: string;
}

export interface ShareLink {
  shareLinkId: string;
  shareUrl: string;
  expiresAt: string;
  allowDownload: boolean;
  isRevoked: boolean;
  lastAccessedAt?: string;
  createdAt: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  expiresAtUtc: string;
}

export interface PaginatedDocuments {
  items: VaultDocument[];
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const DEMO_DOCS: VaultDocument[] = [
  {
    documentId: 'doc-1', documentName: 'Arjun Health Card', category: 1, categoryName: 'Medical',
    memberId: 'm1', memberName: 'Arjun', uploadedByUserId: 'u1',
    uploadDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    expiryDate: undefined, expiryStatus: 'None',
    tags: ['health', 'card'], isEmergencyPriority: true, versionNumber: 1,
  },
  {
    documentId: 'doc-2', documentName: 'Priya Passport', category: 2, categoryName: 'Identity',
    memberId: 'm2', memberName: 'Priya', uploadedByUserId: 'u1',
    uploadDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    expiryDate: new Date(Date.now() + 86400000 * 25).toISOString(),
    expiryStatus: 'Red',
    tags: ['passport', 'travel'], isEmergencyPriority: false, versionNumber: 1,
  },
  {
    documentId: 'doc-3', documentName: 'Arjun School Report 2025', category: 3, categoryName: 'School',
    memberId: 'm1', memberName: 'Arjun', uploadedByUserId: 'u1',
    uploadDate: new Date(Date.now() - 86400000 * 60).toISOString(),
    expiryDate: undefined, expiryStatus: 'None',
    tags: ['school', 'report'], isEmergencyPriority: false, versionNumber: 1,
  },
  {
    documentId: 'doc-4', documentName: 'Family Health Insurance', category: 5, categoryName: 'Insurance',
    memberId: 'm1', memberName: 'Arjun', uploadedByUserId: 'u1',
    uploadDate: new Date(Date.now() - 86400000 * 90).toISOString(),
    expiryDate: new Date(Date.now() + 86400000 * 55).toISOString(),
    expiryStatus: 'Amber',
    tags: ['insurance', 'health'], isEmergencyPriority: true, versionNumber: 2,
  },
  {
    documentId: 'doc-5', documentName: 'Home Loan Agreement', category: 6, categoryName: 'Legal',
    memberId: 'm2', memberName: 'Priya', uploadedByUserId: 'u1',
    uploadDate: new Date(Date.now() - 86400000 * 180).toISOString(),
    expiryDate: new Date(Date.now() + 86400000 * 200).toISOString(),
    expiryStatus: 'Green',
    tags: ['loan', 'property'], isEmergencyPriority: false, versionNumber: 1,
  },
  {
    documentId: 'doc-6', documentName: 'Zara Swimming Certificate', category: 7, categoryName: 'Certificates',
    memberId: 'm3', memberName: 'Zara', uploadedByUserId: 'u1',
    uploadDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    expiryDate: undefined, expiryStatus: 'None',
    tags: ['certificate', 'swimming'], isEmergencyPriority: false, versionNumber: 1,
  },
  {
    documentId: 'doc-7', documentName: 'Salary Slip March 2025', category: 4, categoryName: 'Financial',
    memberId: 'm2', memberName: 'Priya', uploadedByUserId: 'u1',
    uploadDate: new Date(Date.now() - 86400000 * 15).toISOString(),
    expiryDate: undefined, expiryStatus: 'None',
    tags: ['salary', 'payslip'], isEmergencyPriority: false, versionNumber: 1,
  },
  {
    documentId: 'doc-8', documentName: 'Warranty Card — Washing Machine', category: 8, categoryName: 'Other',
    memberId: 'm1', memberName: 'Arjun', uploadedByUserId: 'u1',
    uploadDate: new Date(Date.now() - 86400000 * 45).toISOString(),
    expiryDate: new Date(Date.now() + 86400000 * 365).toISOString(),
    expiryStatus: 'Green',
    tags: ['warranty', 'appliance'], isEmergencyPriority: false, versionNumber: 1,
  },
];

export const VaultRepository = {
  getUploadUrl: async (
    familyId: string,
    fileName: string,
    contentType: string,
    category: number,
  ): Promise<UploadUrlResponse> => {
    if (AppConfig.isDemo) {
      return {
        uploadUrl: 'https://demo-upload.s3.amazonaws.com/family/demo/vault/mock.pdf',
        fileUrl: `https://demo-s3.amazonaws.com/family/${familyId}/vault/${Date.now()}.pdf`,
        expiresAtUtc: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };
    }
    const response = await apiClient.post<ApiResponse<UploadUrlResponse>>(resolvePath(MasterApiReference.Vault.UploadUrl, {
      familyId,
    }), {
      fileName, contentType, category,
    });
    return response.data.data;
  },

  listDocuments: async (
    familyId: string,
    params?: {
      category?: number;
      memberId?: string;
      search?: string;
      expiryStatus?: string;
      page?: number;
      pageSize?: number;
      sortBy?: string;
    },
  ): Promise<PaginatedDocuments> => {
    if (AppConfig.isDemo) {
      let docs = [...DEMO_DOCS];
      if (params?.category) docs = docs.filter(d => d.category === params.category);
      if (params?.memberId) docs = docs.filter(d => d.memberId === params.memberId);
      if (params?.search) {
        const q = params.search.toLowerCase();
        docs = docs.filter(d =>
          d.documentName.toLowerCase().includes(q) ||
          d.tags.some(t => t.toLowerCase().includes(q)) ||
          d.memberName.toLowerCase().includes(q),
        );
      }
      if (params?.expiryStatus === 'expiring-soon') {
        docs = docs.filter(d => d.expiryStatus === 'Red' || d.expiryStatus === 'Amber');
      }
      const page = params?.page ?? 1;
      const pageSize = params?.pageSize ?? 20;
      const start = (page - 1) * pageSize;
      const paginated = docs.slice(start, start + pageSize);
      return {
        items: paginated, totalCount: docs.length,
        totalPages: Math.ceil(docs.length / pageSize),
        hasNextPage: start + pageSize < docs.length,
        hasPreviousPage: page > 1,
      };
    }
    const response = await apiClient.get<ApiResponse<PaginatedDocuments>>(
      resolvePath(MasterApiReference.Vault.Documents, { familyId }),
      { params },
    );
    return response.data.data;
  },

  getDocument: async (familyId: string, documentId: string): Promise<DocumentDetail> => {
    if (AppConfig.isDemo) {
      const doc = DEMO_DOCS.find(d => d.documentId === documentId) ?? DEMO_DOCS[0];
      return {
        ...doc, fileUrl: 'https://demo-s3.amazonaws.com/family/demo/vault/sample.pdf',
        visibility: 2, versionHistory: [], activeShareLinks: [],
      };
    }
    const response = await apiClient.get<ApiResponse<DocumentDetail>>(
      resolvePath(MasterApiReference.Vault.Document, { familyId, documentId }),
    );
    return response.data.data;
  },

  createDocument: async (
    familyId: string,
    data: {
      documentName: string; memberId: string; category: number;
      fileUrl: string; expiryDate?: string; tags?: string[];
      visibility?: number; isEmergencyPriority?: boolean;
    },
  ): Promise<VaultDocument> => {
    if (AppConfig.isDemo) {
      return {
        documentId: `doc-${Date.now()}`, ...data,
        categoryName: CATEGORY_LABELS[data.category] ?? 'Other',
        memberName: 'Demo Member', uploadedByUserId: 'u1',
        uploadDate: new Date().toISOString(),
        expiryStatus: data.expiryDate ? 'Green' : 'None',
        tags: data.tags ?? [], isEmergencyPriority: data.isEmergencyPriority ?? false,
        versionNumber: 1,
      };
    }
    const response = await apiClient.post<ApiResponse<VaultDocument>>(
      resolvePath(MasterApiReference.Vault.Documents, { familyId }),
      data,
    );
    return response.data.data;
  },

  updateDocument: async (
    familyId: string,
    documentId: string,
    data: Partial<{
      documentName: string; expiryDate: string; tags: string[];
      visibility: number; isEmergencyPriority: boolean; newFileUrl: string;
    }>,
  ): Promise<VaultDocument> => {
    if (AppConfig.isDemo) {
      const doc = DEMO_DOCS.find(d => d.documentId === documentId) ?? DEMO_DOCS[0];
      return { ...doc, ...data } as VaultDocument;
    }
    const response = await apiClient.put<ApiResponse<VaultDocument>>(
      resolvePath(MasterApiReference.Vault.Document, { familyId, documentId }),
      data,
    );
    return response.data.data;
  },

  deleteDocument: async (familyId: string, documentId: string): Promise<boolean> => {
    if (AppConfig.isDemo) return true;
    const response = await apiClient.delete<ApiResponse<boolean>>(
      resolvePath(MasterApiReference.Vault.Document, { familyId, documentId }),
    );
    return response.data.data;
  },

  getExpiringDocuments: async (familyId: string): Promise<VaultDocument[]> => {
    if (AppConfig.isDemo) {
      return DEMO_DOCS.filter(d => d.expiryStatus === 'Red' || d.expiryStatus === 'Amber');
    }
    const response = await apiClient.get<ApiResponse<VaultDocument[]>>(
      resolvePath(MasterApiReference.Vault.Expiry, { familyId }),
    );
    return response.data.data;
  },

  getEmergencyDocuments: async (familyId: string): Promise<VaultDocument[]> => {
    if (AppConfig.isDemo) {
      return DEMO_DOCS.filter(d => d.isEmergencyPriority);
    }
    const response = await apiClient.get<ApiResponse<VaultDocument[]>>(
      resolvePath(MasterApiReference.Vault.Emergency, { familyId }),
    );
    return response.data.data;
  },

  createShareLink: async (
    familyId: string,
    documentId: string,
    data: { expiryHours?: number; allowDownload?: boolean },
  ): Promise<ShareLink> => {
    if (AppConfig.isDemo) {
      return {
        shareLinkId: `sl-${Date.now()}`,
        shareUrl: `/vault/share/demo-token-${Date.now()}`,
        expiresAt: new Date(Date.now() + (data.expiryHours ?? 72) * 3600000).toISOString(),
        allowDownload: data.allowDownload ?? false,
        isRevoked: false,
        createdAt: new Date().toISOString(),
      };
    }
    const response = await apiClient.post<ApiResponse<ShareLink>>(
      resolvePath(MasterApiReference.Vault.Share, { familyId, documentId }),
      data,
    );
    return response.data.data;
  },

  revokeShareLink: async (
    familyId: string,
    documentId: string,
    shareLinkId: string,
  ): Promise<boolean> => {
    if (AppConfig.isDemo) return true;
    const response = await apiClient.delete<ApiResponse<boolean>>(
      resolvePath(MasterApiReference.Vault.ShareLink, { familyId, documentId, shareLinkId }),
    );
    return response.data.data;
  },

  getDocumentByShareToken: async (token: string): Promise<DocumentDetail> => {
    if (AppConfig.isDemo) {
      return {
        ...DEMO_DOCS[0],
        fileUrl: 'https://demo-s3.amazonaws.com/family/demo/vault/sample.pdf',
        visibility: 2, versionHistory: [], activeShareLinks: [],
      };
    }
    const response = await apiClient.get<ApiResponse<DocumentDetail>>(
      resolvePath(MasterApiReference.Vault.ShareToken, { token }),
    );
    return response.data.data;
  },
};
