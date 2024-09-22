import {inject} from "@loopback/core";
import {repository} from "@loopback/repository";
import {post,requestBody} from "@loopback/rest";
import {UserRepository} from "../repositories";
import {AuthService} from "../services";

export class AuthController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject("services.AuthService")
    private authService: AuthService
  ) {}

  @post("/auth/google")
  async googleAuth(
    @requestBody({
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              token: { type: "string" },
            },
            required: ["token"],
          },
        },
      },
    })
    body: {
      token: string;
    }
  ) {
    try {
      // Verify the Firebase ID token
      const decodedToken = await this.authService.verifyIdToken(body.token);

      // Handle user authentication here (e.g., create or retrieve a user in your DB)
      console.log("Authenticated user:", decodedToken);

      // Example: return user information
      return {
        message: "User authenticated",
        userId: decodedToken.uid,
        email: decodedToken.email,
      };
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  }
}
