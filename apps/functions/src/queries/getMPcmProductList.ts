import {
  IAllMPcmProductResponse,
  IMPcmProduct,
} from "../models/mPcmProduct.model";
import { fetchGraphQL } from "../services/fetchGraphQL";

const allMPcmProductQuery = (ids: string[]) => `
{
  allM_PCM_Product(where:	{orderCloudID_anyOf:[${`"${ids.join(
    '","'
  )}"`}]}, first: 100) {
    results {
      orderCloudID
      productName
      productShortDescription
      pCMProductToAsset {
        results {
          urls
        }
      }
    }
  }
}
`;

const singleMPcmProductQuery = (id: string) => `
{
  allM_PCM_Product(where:	{orderCloudID_eq:"${id}"}) {
    results {
      orderCloudID
      productName
      productShortDescription
      pCMProductToAsset {
        results {
          urls
        }
      }
    }
  }
}
`;

export async function getAPcmProduct(
  id: string
): Promise<Partial<IMPcmProduct>> {
  const result: IAllMPcmProductResponse =
    await fetchGraphQL<IAllMPcmProductResponse>(singleMPcmProductQuery(id));

  return result.data.allM_PCM_Product.results[0];
}

export async function getAllPcmProduct(ids: string[]): Promise<{
  pcmProducts: Partial<IMPcmProduct>[];
}> {
  const results: IAllMPcmProductResponse =
    await fetchGraphQL<IAllMPcmProductResponse>(allMPcmProductQuery(ids));

  return {
    pcmProducts: results.data.allM_PCM_Product.results,
  };
}
