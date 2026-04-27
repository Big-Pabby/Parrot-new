import { useMutation, useQuery } from "@tanstack/vue-query";
import { computed, unref, type Ref } from "vue";
import { api } from "~/lib/service";
import type { Business, BusinessOffer } from "../types";
import type { ProductPaginatedResponse } from "../types/product";
import type { EmployeePaginatedResponse } from "../types/employee";
import type { MediaFile } from "../types";

export interface UploadMediaResponse {
  url: string;
  location?: string;
  path?: string;
}

export const useUploadMedia = () => {
  const uploadFile = async (file: File): Promise<MediaFile> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<MediaFile>(
      "/media/upload",
      formData,
    );
    return response.data;
  };

  const uploadMultiple = async (
    files: File[],
  ): Promise<MediaFile[]> => {
    const results: MediaFile[] = [];
    for (const file of files) {
      const result = await uploadFile(file);
      results.push(result);
    }
    return results;
  };

  return { uploadFile, uploadMultiple };
};

export interface PublicReviewPayload {
  businessId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfExperience: string;
  experienceSummary: string;
  rating: Record<string, number>;
  files: Array<{ url: string }>;
  productIds: string[];
  employeeIds: string[];
  mentions: string[];
}

export interface ReviewSubmitResponse {
  success: boolean;
  message: string;
  reviewId?: string;
}

export const useSubmitPublicReview = () => {
  return useMutation<ReviewSubmitResponse, Error, PublicReviewPayload>({
    mutationFn: (payload: PublicReviewPayload) =>
      api.post<ReviewSubmitResponse>("/review/public", payload),
  });
};

export interface BusinessApiResponseData {
  fullBusinessProfile: Business;
  businessOffer: BusinessOffer | null;
}

export const UseGetBusiness = (username: string) => {
  const businessQuery = useQuery({
    queryKey: ["business", username],
    queryFn: () =>
      api.get<BusinessApiResponseData>(
        `/business/username?username=${username}`,
      ),
    enabled: !!username,
  });

  return {
    businessData: computed(() => businessQuery.data.value?.data),
    isLoading: businessQuery.isLoading,
    error: businessQuery.error,
  };
};

export const UseGetProductsByBusiness = (
  businessId: string | Ref<string | undefined>,
  search?: Ref<string>,
  page?: Ref<number>,
  limit?: Ref<number>,
) => {
  return useQuery({
    queryKey: ["products", "business", businessId, search, page, limit],
    queryFn: () => {
      const params = new URLSearchParams();
      if (unref(search)) params.append("search", String(unref(search)));
      if (unref(page)) params.append("page", String(unref(page)));
      if (unref(limit)) params.append("limit", String(unref(limit)));

      const queryString = params.toString();
      const url = `/api/product/business/${unref(businessId)}${queryString ? `?${queryString}` : ""}`;
      return api.get<ProductPaginatedResponse>(url);
    },
    enabled: !!unref(businessId),
  });
};

export const UseGetEmployeesByBusiness = (
  businessId: string | Ref<string | undefined>,
  search?: Ref<string>,
  page?: Ref<number>,
  limit?: Ref<number>,
) => {
  return useQuery({
    queryKey: ["employees", "business", businessId, search, page, limit],
    queryFn: () => {
      const params = new URLSearchParams();
      if (unref(search)) params.append("search", String(unref(search)));
      if (unref(page)) params.append("page", String(unref(page)));
      if (unref(limit)) params.append("limit", String(unref(limit)));

      const queryString = params.toString();
      const url = `/api/employee/${unref(businessId)}/employee${queryString ? `?${queryString}` : ""}`;
      return api.get<EmployeePaginatedResponse>(url);
    },
    enabled: !!unref(businessId),
  });
};
