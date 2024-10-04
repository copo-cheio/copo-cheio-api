// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';

import {
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody,
  response,
} from "@loopback/rest";
// import {get} from 'http';

import {authenticate,AuthenticationBindings} from "@loopback/authentication";
import {inject} from "@loopback/core";
import {repository} from "@loopback/repository";
import {UserProfile} from "@loopback/security";
import {Credential} from "../models";
import {CredentialRepository} from "../repositories";
import {PushNotificationService} from "../services/push-notification.service";

// import {inject} from '@loopback/core';

export class NotificationController {
  constructor(
    @inject("services.PushNotificationService")
    private pushNotificationService: PushNotificationService,
    @repository(CredentialRepository)
    public credentialRepository: CredentialRepository,
    @inject(AuthenticationBindings.CURRENT_USER, { optional: true })
    private currentUser: UserProfile // Inject the current user profile
  ) {}

  @post("/push-notification/register-token")
  @authenticate("firebase")
  @response(200, {
    description: "Menu model instance",
    content: {},
  })
  async create(
    @requestBody({
      content: {
        "application/json": {
          schema: getModelSchemaRef(Credential, {
            title: "Register tokden",
            exclude: ["id", "userId", "key"],
          }),
        },
      },
    })
    data: any
  ): Promise<void> {
    return this.pushNotificationService.registerToken(
      this.currentUser.id,
      data.value
    );
  }
  @post("/test/single-notification-with-payload")
  @authenticate("firebase")
  @response(200, {
    description: "Menu model instance",
    content: {},
  })
  async singleNotificationWithPayload(
    @requestBody({
      content: {},
    })
    data: any
  ): Promise<void> {
    const token = data.token;
    delete data.token;
    if(data.notification){

      return this.pushNotificationService.sendPushNotification(token, data.notification,data.data || {});
    }else{
      return this.pushNotificationService.sendDataNotification(token, data.data);

    }
  }

  @get("/test/single-notification/{token}")
  @response(200, {
    description: "testing single token messaing",
    content: {
      "application/json": {
        schema: {},
      },
    },
  })
  async testNotification(
    @param.path.string("token") token: string
  ): Promise<any> {
    // const {token, title, body} = body;
    const title = "test single notification";
    const body = "Body for the single notification";
    // Define notification payload
    // const payload: admin.messaging.Message = {

    // const payload: any = {
    const notification = {
      title: title,
      body: body,
    };

    const data = {
      action: "ORDER_READY",
      payload: {
        id: "29792ea4-5ee2-4fdd-8ccb-5cb30d3c21be",
        status: "READY",
        balcony: {
          id: "bd3d4c7c-858d-4990-8d98-cda21bc3424a",
          name: "Test place balcony #1",
        },
        place: {
          id: "a813bc90-d422-4d60-aa48-1e7d6c69ae8e",
          name: "Test place",
        },
      },
    };
    // };

    // Call Firebase service to send the push notification to a single device
    setTimeout(() => {
      this.pushNotificationService.sendPushNotification(
        token,
        notification,
        data
      );
    }, 5000);
    return await this.pushNotificationService.sendPushNotification(
      token,
      notification,
      data
    );
  }

  @get("/test/multicast-notification-pihh")
  @response(200, {
    description: "testing single token messaing",
    content: {
      "application/json": {
        schema: {},
      },
    },
  })
  async sendMulticastNotificationToMe(): // @param.path.string("tokens") _tokens: string
  Promise<void> {
    const id = "6e6fcbef-886c-486e-8e15-f4ac5e234b5c";
    // const {tokens, title, body} = body;
    const title = "test multicast notification";
    const body = "Body for the multicast notification";
    const devices = await this.credentialRepository.find({
      where: { userId: "6e6fcbef-886c-486e-8e15-f4ac5e234b5c" },
    }); //_tokens.replace(/[\[\]']+/g, "").split(",");
    const tokens = devices.map((device: any) => device.toJSON().value);

    // Define notification payload
    // const payload: any = {
    //} admin.messaging.MessagingPayload = {
    const notification = {
      title: title,
      body: body,
    };
    const data = {
      action: "ORDER_READY",
      payload: {
        orderId: "xxx",
        status: "READY",
        order: {},
      },
    };

    // Call Firebase service to send push notifications to multiple devices
    setTimeout(() => {
      this.pushNotificationService.sendPushNotifications(
        Array.isArray(tokens) ? tokens : [tokens],
        notification,
        data
      );
    }, 5000);
    return this.pushNotificationService.sendPushNotifications(
      Array.isArray(tokens) ? tokens : [tokens],
      notification,
      data
    );
  }

  // Send push notifications to multiple devices
  @get("/test/multicast-notification/{tokens}")
  @response(200, {
    description: "testing single token messaing",
    content: {
      "application/json": {
        schema: {},
      },
    },
  })
  async sendMulticastNotification(
    @param.path.string("tokens") _tokens: string
  ): Promise<void> {
    // const {tokens, title, body} = body;
    const title = "test multicast notification";
    const body = "Body for the multicast notification";
    const tokens = _tokens.replace(/[\[\]']+/g, "").split(",");
    console.log({ tokens, isArray: Array.isArray(tokens), body });
    // Define notification payload
    const payload: any = {
      //} admin.messaging.MessagingPayload = {
      notification: {
        title: title,
        body: body,
      },
      data: {
        action: "NONE",
      },
    };

    // Call Firebase service to send push notifications to multiple devices
    setTimeout(() => {
      this.pushNotificationService.sendPushNotifications(
        Array.isArray(tokens) ? tokens : [tokens],
        payload.notification,
        payload.data
      );
    }, 5000);
    return await this.pushNotificationService.sendPushNotifications(
      Array.isArray(tokens) ? tokens : [tokens],
      payload.notification,
      payload.data
    );
  }
  @get("/test/raw-notification/{token}/{content}")
  @response(200, {
    description: "testing single token messaing",
    content: {
      "application/json": {
        schema: {},
      },
    },
  })
  async sendRawNotification(
    @param.path.string("token") token: string,
    @param.path.string("payload") payload: string
  ): Promise<void> {
    // const {tokens, title, body} = body;
    const title = "test multicast notification";
    const body = "Body for the multicast notification";
    // const tokens = _tokens.replace(/[\[\]']+/g, "").split(",");
    // console.log({ tokens, isArray: Array.isArray(tokens), body });
    // Define notification payload
    // const payload: any = {
    //   //} admin.messaging.MessagingPayload = {
    //   notification: {
    //     title: title,
    //     body: body,
    //   },
    // };

    // Call Firebase service to send push notifications to multiple devices
    const { notification, data } = JSON.parse(payload);
    return await this.pushNotificationService.sendPushNotification(
      token,
      notification || { title, body },
      data || {}
    );
  }
}
