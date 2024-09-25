import { IAllMPcmProductResponse, IMPcmProduct } from "../models/mPcmProduct";
import { fetchGraphQL } from "../services/fetchGraphQL";

const allMPcmProductQuery = (ids: string[]) => `
{
  allM_PCM_Product(where:	{orderCloudID_anyOf:[${`"${ids.join("\",\"")}"`}]}) {
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

export async function getAllPcmProduct(
  ids: string[]
): Promise<{
    pcmProducts: Partial<IMPcmProduct>[];
}> {
  console.log('TEST_IDS', ids)

  const results: IAllMPcmProductResponse = await fetchGraphQL<IAllMPcmProductResponse>(allMPcmProductQuery(ids));

  console.log('TEST', results)

  return {
    pcmProducts: results.data.allM_PCM_Product.results,
  };
}