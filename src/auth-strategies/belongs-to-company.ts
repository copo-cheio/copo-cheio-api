import {MiddlewareSequence,RequestContext} from "@loopback/rest";

export class belongsToCompany extends MiddlewareSequence {
  async handle(context: RequestContext): Promise<void> {
    const { request } = context;

    if (request.method === "POST" && request.path.startsWith("/admin")) {
      console.log("Admin POST request intercepted:", request.body);

      request.body.companyId = "f0eeff9a-4a59-48b7-a1e4-17ddd608b145";
      // Implement additional logic here (e.g., authentication)
      // Example: throw an error if unauthorized
      // if (!request.user || !request.user.isAdmin) {
      //   throw new HttpErrors.Forbidden('Access denied');
      // }
    }

    await super.handle(context);
  }
}
