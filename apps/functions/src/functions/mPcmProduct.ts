import {
  app,
  HttpRequest,
  HttpResponse,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getAPcmProduct } from "../queries/getMPcmProductList";

export async function getMeProduct(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  const ocApiUrl = request.headers.get("x-oc-base-url");
  const authHeader = request.headers.get("Authorization");
  const productId = request.params.productId;

  if (!authHeader) {
    const response = new HttpResponse({status: 401, jsonBody: {message: "Inavlid or expired token"}});
    return response;
  }

  const url = `${ocApiUrl}/v1/me/products/${productId}`;

  const ocProduct = await (await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": authHeader
    },
  })).json();


  const response = await getAPcmProduct(productId);
  return {jsonBody: {
    ...ocProduct,
    xp: {
      ...ocProduct.xp,
      ContentHub: response
    }
  }}
}

app.http("getProduct", {
  methods: ["GET"],
  route: "products/{productId}",
  authLevel: "anonymous",
  handler: getMeProduct,
});
