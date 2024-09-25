import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getAllPcmProduct } from "../queries/getMPcmProductList";

export async function listMPcmProducts(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const response = await getAllPcmProduct(request.query.get('ids').split(','))

    return { body: JSON.parse(JSON.stringify(response.pcmProducts)) };
};

app.http('mPcmProducts', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: listMPcmProducts
});
