import {
  app,
  HttpRequest,
  HttpResponse,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getAllPcmProduct } from "../queries/getMPcmProductList";

export async function listMeProducts(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  const ocApiUrl = request.headers.get("x-oc-base-url");
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    const response = new HttpResponse({status: 401, jsonBody: {message: "Inavlid or expired token"}});
    return response;
  }

  const queryString = request.query.toString();
  const url = `${ocApiUrl}/v1/me/products${queryString.length ? `?${queryString}` : ''}`;

  const ocListPage = await (await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": authHeader
    },
  })).json();

  const listPageIds: string[] = ocListPage.Items.map(x => String(x.ID));
  const response = await getAllPcmProduct(listPageIds);
  const modifiedListPageItems = ocListPage.Items.map(item => {
    const mPcmPrdouct = response.pcmProducts.find(x => x.orderCloudID == item.ID)

    return {
      ...item,
      xp: {
        ...item.xp,
        ContentHub: mPcmPrdouct
      }
    }
  })

  return { jsonBody: {Meta: ocListPage.Meta, Items: modifiedListPageItems} };
}

app.http("products", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: listMeProducts,
});
