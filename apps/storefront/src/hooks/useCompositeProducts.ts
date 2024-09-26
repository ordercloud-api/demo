import { useAuthQuery, useOrderCloudContext } from "@rwatt451/ordercloud-react";
import axios, { AxiosRequestConfig } from "axios";
import {
  DefaultError,
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  ListPageWithFacets,
  OrderCloudError,
  RequiredDeep,
} from "ordercloud-javascript-sdk";
import { MIDDLEWARE_BASE_API_URL } from "../constants";

export const makeQueryString = (params: ServiceListOptions | undefined) => {
  if (!params) return;
  return `${Object.entries(params)
    .filter(([, val]: [string, any]) => {
      return typeof val === "object"
        ? Boolean(val.length) || Boolean(Object.values(val).length)
        : Boolean(val);
    })
    .map(([key, val]: [string, any]) => {
      /**
       * TODO: Figure out a more dynamic way of checking the openapi spec for
       * identifying how to parse object values into the query string. Right now
       * we know that searchOn & sortBy are supposed have 1 key - but there could
       * be others (right now, or in the future)
       */
      if (key === "filters") {
        return Object.entries(val)
          .filter(([fkey, fval]: [string, any]) => {
            return fkey.length && fval.length;
          })
          .map(([fkey, fval]: [string, any]) => {
            return `${fkey}=${encodeURIComponent(fval)}`;
          })
          .join("&");
      } else {
        if (
          typeof val === "object" &&
          (key === "searchOn" || key === "sortBy")
        ) {
          return `${key}=${val.map(encodeURIComponent).join(",")}`;
        } else if (typeof val === "object") {
          return val
            .map((v: any) => {
              return `${key}=${encodeURIComponent(v)}`;
            })
            .join("&");
        } else {
          return `${key}=${encodeURIComponent(val)}`;
        }
      }
    })
    .join("&")}`;
};

export type ServiceListOptions = {
  [key: string]: ServiceListOptions | string | undefined;
};

export type UseOcQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> = Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, "enabled"> & {
  disabled?: boolean;
};

export function useOcCompositeProducts<TData>(
  listOptions?: ServiceListOptions
) {
  // const { listOperation } = useOperations(resource);
  // if(!listOperation) throwOperationNotFoundError("List", resource)
  const queryString = makeQueryString(listOptions);
  const { token, isAuthenticated, baseApiUrl } = useOrderCloudContext();

  const url = "/products" + (queryString ? `?${queryString}` : "");

  const axiosRequest: AxiosRequestConfig = {
    method: "GET",
    baseURL: MIDDLEWARE_BASE_API_URL,    
    headers: { Authorization: `Bearer ${token}`, 'x-oc-base-url': baseApiUrl, 'Access-Control-Allow-Origin': '*' },
  };

  return useAuthQuery({
    queryKey: ["composite.products", listOptions],
    queryFn: async () => {
      const resp = await axios.get<ListPageWithFacets<TData>>(
        url,
        axiosRequest
      );
      return resp.data;
    },
    disabled: !isAuthenticated,
  }) as UseQueryResult<
    RequiredDeep<ListPageWithFacets<TData>>,
    OrderCloudError
  >;
}

export function useOcCompositeProduct<TData>(
  productId: string
) {
  // const { listOperation } = useOperations(resource);
  // if(!listOperation) throwOperationNotFoundError("List", resource)
  const { token, isAuthenticated, baseApiUrl } = useOrderCloudContext();

  const url = `/products/${productId}`;

  const axiosRequest: AxiosRequestConfig = {
    method: "GET",
    baseURL: MIDDLEWARE_BASE_API_URL,    
    headers: { Authorization: `Bearer ${token}`, 'x-oc-base-url': baseApiUrl, 'Access-Control-Allow-Origin': '*' },
  };

  return useAuthQuery({
    queryKey: ["composite.product", productId],
    queryFn: async () => {
      const resp = await axios.get<TData>(
        url,
        axiosRequest
      );
      return resp.data;
    },
    disabled: !isAuthenticated,
  }) as UseQueryResult<
    RequiredDeep<TData>,
    OrderCloudError
  >;
}

export default useOcCompositeProducts;
