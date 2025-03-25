import { /* inject, */ BindingScope, inject, injectable } from "@loopback/core";
import { repository } from "@loopback/repository";
import { BalconyFullQuery } from "../../blueprints/balcony.blueprint";
import { PlaceQueryFull } from "../../blueprints/place.blueprint";
import {
  ActivityRepository,
  ActivityV2Repository,
  BalconyRepository,
  EventRepository,
  FavoriteRepository,
  PlaceRepository,
  UserRepository,
} from "../../repositories";
import { PlaceService } from "../place.service";
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

  /* ********************************** */
  /*                 V2                 */
  /* ********************************** */

  /* ************ Favorites *********** */
  async toggleFavorites(userId, data: any = {}) {
    let favorites = await this.userRepository.getFavorites(userId);
    let modelKey = data?.type + "Id";
    let favoriteKey = data.type + "s";

    const payload: any = {
      userId,
    };
    payload[modelKey] = data.id;
    const activityPayload: any = {
      app: "user",
      userId,
      action: "favorite--" + data.type,
    };

    if (favorites[favoriteKey].indexOf(data.id) > -1) {
      //await this.favoriteRepository.deleteAll(payload);
      await this.removeFromFavorites(payload, activityPayload);
    } else {
      await this.addToFavorites(payload, activityPayload);
    }
  }

  private async getFavoriteId(
    favoritesPayload: {
      userId?: string;
      placeId?: string;
      eventId?: string;
    } = {}
  ) {
    const favorite = await this.favoriteRepository.findOne({
      where: {
        and: [
          { deleted: false },
          ...Object.entries(favoritesPayload).map(([key, value]) => ({
            [key]: value,
          })),
        ],
      },
    });
    return favorite?.id;
  }

  private async removeFromFavorites(
    favoritesPayload: any = {},
    activityPayload: any = {}
  ) {
    const favoriteId = await this.getFavoriteId(favoritesPayload);
    if (!favoriteId) return;
    await this.favoriteRepository.deleteById(favoriteId);

    const activity = await this.activityV2Repository.findOne({
      where: {
        and: [
          { deleted: false },
          { referenceId: favoriteId },
          ...Object.entries(activityPayload).map(([key, value]) => ({
            [key]: value,
          })),
        ],
      },
    });
    if (!activity?.id) return;
    await this.activityV2Repository.deleteById(activity?.id);
  }
  private async addToFavorites(
    favoritesPayload: any = {},
    activityPayload: any = {}
  ) {
    let favoriteId = await this.getFavoriteId(favoritesPayload);
    if (favoriteId) return;
    const favorite = await this.favoriteRepository.create(favoritesPayload);
    const referenceId = favorite.id;
    const recordRepository = favoritesPayload?.eventId
      ? this.eventRepository
      : this.placeRepository;
    const recordId = favoritesPayload?.eventId || favoritesPayload.placeId;
    const record = await recordRepository.findById(recordId);
    if (!activityPayload?.userId) return;
    const lastKnowCoordinates = await this.lastKnowCoordinates(
      activityPayload.userId
    );

    this.activityV2Repository.create({
      ...activityPayload,
      referenceId,
      ...lastKnowCoordinates,
      tagIds: record.tagIds || [],
    });
  }

  /* ******** Check in and out ******** */
  checkInV2(app, userId, type, referenceId) {
    const signature = "check-in--";
    this.checkV2(signature, app, userId, type, referenceId);
  }
  checkOutV2(app, userId, type, referenceId) {
    const signature = "check-out--";
    this.checkV2(signature, app, userId, type, referenceId);
  }

  /* ************* Helpers ************ */
  private async lastKnowCoordinates(userId) {
    let latitude: string | number = 0.0;
    let longitude: string | number = 0.0;
    if (userId) {
      const user = await this.userRepository.findById(userId);
      latitude = user?.latitude || 0.0;
      longitude = user?.longitude || 0.0;
    }
    return { latitude, longitude };
  }
  private async checkV2(signature, app, userId, type, referenceId) {
    const lastKnowCoordinates = await this.lastKnowCoordinates(userId);
    const action = signature + type;
    this.activityV2Repository.create({
      app,
      userId,
      action,
      referenceId,
      ...lastKnowCoordinates,
    });
  }

  /* ********************************** */
  /*                 V1                 */
  /* ********************************** */

  /**
   * Check In
   * A user can check in on one place/event as user or staff, he might also have a job to do
   * @process - view check in diagram
   * @param {userId}
   */
  async checkIn(
    userId: string,
    placeId: string,
    role: string = "user",
    config: any = {}
  ) {
    try {
      // let {userId,placeId,eventId } = params;
      let place: any;
      let event: any;
      let checkIn: any;
      let menu: any;

      place = await this.placeRepository.findById(placeId, PlaceQueryFull);
      event = await this.placeService.findCurrentEvent(placeId);

      const eventId = event.id;
      const balconyId = config.balconyId || place.balconies[0].id;

      const payload: any = {
        // type: "on",
        userId,
        placeId,
        eventId,
        action: "check-in",
        complete: false,

        role: role || "user",
      };
      if (config?.balconyId) {
        payload.balconyId = config.balconyId;
      }
      if (config?.job) {
        payload.job = config.job;
      }

      checkIn = await this.activityRepository.findOne({ where: payload });
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

      menu = await this.balconyRepository.findById(
        payload.balconyId || place.balconies[0].id,
        BalconyFullQuery
      );

      return {
        checkIn,
        place,
        event,
        refId: checkIn.id,
        balcony: menu,
        menu: menu.menu,
      };
    } catch (ex) {
      throw ex;
    }
  }

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

  async checkOut(params: any = {}) {
    return {};
  }
}
