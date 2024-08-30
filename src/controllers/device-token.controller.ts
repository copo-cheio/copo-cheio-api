import {authenticate} from "@loopback/authentication";
import {inject} from "@loopback/core";
import {repository} from "@loopback/repository";
import {
  del,
  get,
  param,
  post,
  Request,
  requestBody,
  RestBindings,
} from "@loopback/rest";
import {FirebaseAuthHelper} from "../auth-strategies/firebase-strategy";
import {sendNotification} from "../firebase-config";
import {DeviceToken} from "../models";
import {DeviceTokenRepository} from "../repositories";
// import {sendNotification} from '../utils/notifications';

export class DeviceTokenController {
  constructor(
    @inject(RestBindings.Http.REQUEST) private req: Request,
    @repository(DeviceTokenRepository)
    public deviceTokenRepository: DeviceTokenRepository
  ) {}

  @post("/device-tokens")
  async createToken(
    @requestBody() deviceToken: DeviceToken
  ): Promise<DeviceToken> {
    const userId = await FirebaseAuthHelper.getAuthenticatedUser(this.req);
    if (userId) {
      const record = await this.deviceTokenRepository.findOne({
        where: {
          userId,
        },
      });
      if (record) {
        await this.deviceTokenRepository.updateById(record.id, deviceToken);
        return this.deviceTokenRepository.findById(record.id);
      } else {
        deviceToken.userId = userId;
      }
    }
    return this.deviceTokenRepository.create(deviceToken);
  }

  @get("/device-tokens/{id}")
  async findTokenById(
    @param.path.string("id") id: string
  ): Promise<DeviceToken> {
    return this.deviceTokenRepository.findById(id);
  }

  @del("/device-tokens/{id}")
  async deleteToken(@param.path.string("id") id: string): Promise<void> {
    await this.deviceTokenRepository.deleteById(id);
  }

  @authenticate("firebase")
  @get("/device-tokens/test/{id}")
  async testDeviceTokenNotification(
    @param.path.string("id") id: string
  ): Promise<any> {
    return sendNotification(id, {
      body: "body" + this.req.params.__auth__,
      title: "title",
    });
  }
}
