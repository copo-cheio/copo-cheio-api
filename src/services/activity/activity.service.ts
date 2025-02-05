import {/* inject, */ BindingScope, inject, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {BalconyFullQuery} from '../../blueprints/balcony.blueprint';
import {PlaceQueryFull} from '../../blueprints/place.blueprint';
import {
  ActivityRepository,
  BalconyRepository,
  EventRepository,
  PlaceRepository,
} from '../../repositories/v1';
import {PlaceService} from '../place.service';
import {
  PUSH_NOTIFICATION_SUBSCRIPTIONS,
  PushNotificationService,
} from '../push-notification.service';

const SUBSCRIPTIONS = PUSH_NOTIFICATION_SUBSCRIPTIONS.checkIn;

@injectable({scope: BindingScope.TRANSIENT})
export class ActivityService {
  constructor(
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
    @repository(EventRepository)
    public eventRepository: EventRepository,
    @repository(ActivityRepository)
    public activityRepository: ActivityRepository,
    @repository(BalconyRepository)
    public balconyRepository: BalconyRepository,
    @inject('services.PlaceService')
    protected placeService: PlaceService,
    @inject('services.PushNotificationService')
    protected pushNotificationService: PushNotificationService,
  ) {}

  /**
   * Check In
   * A user can check in on one place/event as user or staff, he might also have a job to do
   * @process - view check in diagram
   * @param {userId}
   */
  async checkIn(
    userId: string,
    placeId: string,
    role: string = 'user',
    config: any = {},
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
        action: 'check-in',
        complete: false,

        role: role || 'user',
      };
      if (config?.balconyId) {
        payload.balconyId = config.balconyId;
      }
      if (config?.job) {
        payload.job = config.job;
      }

      checkIn = await this.activityRepository.findOne({where: payload});
      if (checkIn) {
        await this.unsubscribePushNotifications(
          userId,
          role,
          placeId,
          eventId,
          balconyId,
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
        balconyId,
      );

      menu = await this.balconyRepository.findById(
        payload.balconyId || place.balconies[0].id,
        BalconyFullQuery,
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
    balconyId: string,
  ) {
    for (const subscription of SUBSCRIPTIONS[role]) {
      await this.pushNotificationService.subscribeToTopic(
        userId,
        subscription(placeId, eventId, balconyId),
      );
    }
  }
  async unsubscribePushNotifications(
    userId: string,
    role: string,
    placeId: string,
    eventId: string,
    balconyId: string,
  ) {
    for (const subscription of SUBSCRIPTIONS[role]) {
      await this.pushNotificationService.unSubscribeFromTopic(
        userId,
        subscription(placeId, eventId, balconyId),
      );
    }
  }

  async checkOut(params: any = {}) {
    return {};
  }
}
