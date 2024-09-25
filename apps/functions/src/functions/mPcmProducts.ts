import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getAllPcmProduct } from "../queries/getMPcmProductList";

export async function listMeProducts(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  const ocApiUrl = "https://useast-sandbox.ordercloud.io";
  const token = request.headers.get("token");
  const search = request.query.get("search");
  const searchOn = request.query.get("searchOn");
  const page = request.query.get("page");
  const pageSize = request.query.get("pageSize");
  const filters = request.query.get("filters");

  let url = `${ocApiUrl}/v1/me/products`;
  if (search != null) url += `?search=${search}`;
  if (search != null && searchOn !== null) url += `&searchOn=${searchOn}`;
  if (search != null && page !== null) {
    url += `&page=${page}`;
  } else if (page != null) {
    url += `page=${page}`;
  }
  if ((search != null || page != null) && pageSize != null) {
    url += `&pageSize=${pageSize}`;
  } else if (search == null && page == null && pageSize != null) {
    url += `pageSize=${pageSize}`;
  }
  if (
    (search != null || searchOn != null || page != null || pageSize != null) &&
    filters != null
  ) {
    url += `&filters=${filters}`;
  }

  const ocListPage = await (await fetch(`${url}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  })).json();

  const listPageIds: string[] = ocListPage.Items.map(x => String(x.ID));
  const response = await getAllPcmProduct(listPageIds);

  console.log('TEST RESPONSE', JSON.stringify(response.pcmProducts));

  return { body: JSON.parse(JSON.stringify(response.pcmProducts)) };
}

app.http("products", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: listMeProducts,
});
