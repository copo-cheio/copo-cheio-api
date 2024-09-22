import {inject} from "@loopback/core";
import {MiddlewareSequence,RequestContext} from "@loopback/rest";
import {AuthService} from "../services";
// import {FirebaseService} from './services/firebase/firebase.service';

export class MySequence extends MiddlewareSequence {
  @inject("services.AuthService")
  private authService: AuthService;

  async handle(context: RequestContext): Promise<void> {
    const { request } = context;
    const authHeader = request.headers["authorization"];

    if (authHeader) {
      const idToken = authHeader.split(" ")[1]; // Authorization: Bearer <ID_TOKEN>
      try {
        await this.authService.verifyIdToken(idToken);
      } catch (error) {
        throw new Error("Authentication failed");
      }
    }

    await super.handle(context);
  }
}
