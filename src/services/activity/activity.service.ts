import { /* inject, */ BindingScope,inject,injectable} from "@loopback/core";
import {repository} from "@loopback/repository";
import {BalconyFullQuery} from "../../blueprints/balcony.blueprint";
import {PlaceQueryFull} from "../../blueprints/place.blueprint";
import {
  ActivityRepository,
  ActivityV2Repository,
  BalconyRepository,
  EventRepository,
  FavoriteRepository,
  PlaceRepository,
  UserRepository,
} from "../../repositories";
import {PlaceService} from "../place.service";
import {
  PUSH_NOTIFICATION_SUBSCRIPTIONS,
  PushNotificationService,
} from "../push-notification.service";

const SUBSCRIPTIONS = PUSH_NOTIFICATION_SUBSCRIPTIONS.checkIn;

@injectable({ scope: BindingScope.TRANSIENT })
export class ActivityService {
  constructor(
    @repository("PlaceRepository")
    public placeRepository: PlaceRepository,
    @repository("EventRepository")
    public eventRepository: EventRepository,
    @repository("UserRepository")
    public userRepository: UserRepository,
    @repository("ActivityRepository")
    public activityRepository: ActivityRepository,
    @repository("ActivityV2Repository")
    public activityV2Repository: ActivityV2Repository,
    @repository("BalconyRepository")
    public balconyRepository: BalconyRepository,
    @repository("FavoriteRepository")
    public favoriteRepository: FavoriteRepository,
    @inject("services.PlaceService")
    protected placeService: PlaceService,
    @inject("services.PushNotificationService")
    protected pushNotificationService: PushNotificationService
  ) {}

  /* ************* Search Management ************ */
  async search(userId: string, data: { type: string; keyword: string,tagIds:string[] }) {
    const activityPayload = {
      app: "user",
      userId,
      action: `search--${data.type}`,
      keyword:(data?.keyword || "").trim().toLowerCase(),
      tagIds:data?.tagIds || []
    };


    if(!activityPayload?.keyword && !activityPayload?.tagIds?.length ) return

    const lastKnowCoordinates = await this.getLastKnownCoordinates(
      userId
    );
    this.activityV2Repository.create({
      ...activityPayload,
      ...lastKnowCoordinates,
    });
  }
  /* ************* Share Management ************* */
  async share(userId: string, data: { type: string; id: string }) {
    const activityPayload = {
      app: "user",
      userId,
      action: `share--${data.type}`,
      referenceId:data.id
    };
    const recordRepository = data.type =='event'
      ? this.eventRepository
      : this.placeRepository;
    const record = await recordRepository.findById(
      data.id
    );
    const lastKnowCoordinates = await this.getLastKnownCoordinates(
      userId
    );
    this.activityV2Repository.create({
      ...activityPayload,
      ...lastKnowCoordinates,
      tagIds: record.tagIds || [],
    });
  }

  /* ************ Favorites Management *********** */
  async toggleFavorites(userId: string, data: { type: string; id: string }) {
    const favorites = await this.userRepository.getFavorites(userId);
    const modelKey = `${data.type}Id`;
    const favoriteKey = `${data.type}s`;

    const payload = { userId, [modelKey]: data.id };
    const activityPayload = {
      app: "user",
      userId,
      action: `favorite--${data.type}`,
    };

    favorites[favoriteKey].includes(data.id)
      ? await this.removeFromFavorites(payload, activityPayload)
      : await this.addToFavorites(payload, activityPayload);
  }

  private async getFavoriteId(favoritesPayload: {
    userId?: string;
    placeId?: string;
    eventId?: string;
  }) {
    const favorite = await this.favoriteRepository.findOne({
      where: { deleted: false, ...favoritesPayload },
    });
    return favorite?.id;
  }

  private async removeFromFavorites(
    favoritesPayload: any,
    activityPayload: any
  ) {
    const favoriteId = await this.getFavoriteId(favoritesPayload);
    if (!favoriteId) return;

    await this.favoriteRepository.deleteById(favoriteId);
    const activity = await this.activityV2Repository.findOne({
      where: { deleted: false, referenceId: favoriteId, ...activityPayload },
    });
    if (activity?.id) await this.activityV2Repository.deleteById(activity.id);
  }

  private async addToFavorites(favoritesPayload: any, activityPayload: any) {
    if (await this.getFavoriteId(favoritesPayload)) return;

    const favorite = await this.favoriteRepository.create(favoritesPayload);
    const recordRepository = favoritesPayload?.eventId
      ? this.eventRepository
      : this.placeRepository;
    const record = await recordRepository.findById(
      favoritesPayload?.eventId || favoritesPayload.placeId
    );

    if (!activityPayload?.userId) return;
    const lastKnowCoordinates = await this.getLastKnownCoordinates(
      activityPayload.userId
    );

    this.activityV2Repository.create({
      ...activityPayload,
      referenceId: favorite.id,
      ...lastKnowCoordinates,
      tagIds: record.tagIds || [],
    });
  }

  /* ************ Check-in & Check-out *********** */
  async checkInV2(
    app: string,
    userId: string,
    type: string,
    referenceId: string
  ) {
    this.trackCheckActivity("check-in--", app, userId, type, referenceId);
  }

  async checkOutV2(
    app: string,
    userId: string,
    type: string,
    referenceId: string
  ) {
    this.trackCheckActivity("check-out--", app, userId, type, referenceId);
  }

  private async trackCheckActivity(
    signature: string,
    app: string,
    userId: string,
    type: string,
    referenceId: string
  ) {
    const lastKnowCoordinates = await this.getLastKnownCoordinates(userId);
    this.activityV2Repository.create({
      app,
      userId,
      action: `${signature}${type}`,
      referenceId,
      ...lastKnowCoordinates,
    });
  }

  private async getLastKnownCoordinates(userId: string) {
    const user = await this.userRepository.findById(userId);
    return {
      latitude: user?.latitude || 0.0,
      longitude: user?.longitude || 0.0,
    };
  }

  /* ********** Notifications ********* */
  async subscribeToPushNotifications(
    userId: string,
    role: string,
    placeId: string,
    eventId: string,
    balconyId: string
  ) {
    for (const subscription of SUBSCRIPTIONS[role]) {
      await this.pushNotificationService.subscribeToTopic(
        userId,
        subscription(placeId, eventId, balconyId)
      );
    }
  }

  async unsubscribePushNotifications(
    userId: string,
    role: string,
    placeId: string,
    eventId: string,
    balconyId: string
  ) {
    for (const subscription of SUBSCRIPTIONS[role]) {
      await this.pushNotificationService.unSubscribeFromTopic(
        userId,
        subscription(placeId, eventId, balconyId)
      );
    }
  }


  /* ********************************** */
  /*       V1 deprecated functions      */
  /* ********************************** */
  async checkIn(
    userId: string,
    placeId: string,
    role: string = "user",
    config: any = {}
  ) {
    try {
      const place = await this.placeRepository.findById(
        placeId,
        PlaceQueryFull
      );
      const event = await this.placeService.findCurrentEvent(placeId);
      const eventId = event.id;
      const balconyId = config.balconyId || place.balconies[0].id;

      const payload:any = {
        userId,
        placeId,
        eventId,
        action: "check-in",
        complete: false,
        role,
      };
      if (config?.balconyId) payload.balconyId = config.balconyId;
      if (config?.job) payload.job = config.job;

      let checkIn = await this.activityRepository.findOne({ where: payload });
      if (checkIn) {
        await this.unsubscribePushNotifications(
          userId,
          role,
          placeId,
          eventId,
          balconyId
        );
        await this.activityRepository.updateById(checkIn.id, {
          complete: true,
        });
      }

      checkIn = await this.activityRepository.create(payload);
      await this.subscribeToPushNotifications(
        userId,
        role,
        placeId,
        eventId,
        balconyId
      );
      const menu:any = await this.balconyRepository.findById(
        payload.balconyId,
        BalconyFullQuery
      );

      return {
        checkIn,
        place,
        event,
        refId: checkIn.id,
        balcony: menu,
        menu: menu?.menu,
      };
    } catch (ex) {
      throw ex;
    }
  }
  async checkOut(params: any = {}) {
    return {};
  }
}
