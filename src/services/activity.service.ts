import { /* inject, */ BindingScope,inject,injectable} from "@loopback/core";
import {repository} from "@loopback/repository";
import {BalconyFullQuery} from "../blueprints/balcony.blueprint";
import {PlaceQueryFull} from "../blueprints/place.blueprint";
import {
  ActivityRepository,
  BalconyRepository,
  EventRepository,
  PlaceRepository,
} from "../repositories";
import {PlaceService} from "./place.service";

@injectable({ scope: BindingScope.TRANSIENT })
export class ActivityService {
  constructor(
    /* Add @inject to inject parameters */

    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
    @repository(EventRepository)
    public eventRepository: EventRepository,
    @repository(ActivityRepository)
    public activityRepository: ActivityRepository,
    @repository(BalconyRepository)
    public balconyRepository: BalconyRepository,
    @inject("services.PlaceService")
    protected placeService: PlaceService
  ) {}

  /*
   * Add service methods here
   */
  async checkIn(
    userId: string,
    placeId: string,
    role: string,
    config: any = {}
  ) {
    try {
      // let {userId,placeId,eventId } = params;
      let place: any;
      let event: any;
      let checkIn: any;
      let shoppingCart: any;
      let menu: any;

      place = await this.placeRepository.findById(placeId, PlaceQueryFull);
      event = await this.placeService.findCurrentEvent(placeId);
      let eventId = event.id;

      const payload: any = {
        // type: "on",
        userId,
        placeId,
        eventId,
        action: "check-in",
        complete: false,
        job: config?.job,
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
        await this.activityRepository.updateById(checkIn.id, {
          complete: true,
        });
      }

      checkIn = await this.activityRepository.create(payload);

      menu = await this.balconyRepository.findById(
        place.balconies[0].id,
        BalconyFullQuery
      );

      return {
        checkIn,
        place,
        event,
        refId: checkIn.id,
        balcony:menu,
        menu: menu.menu,
      };
    } catch (ex) {
      throw ex;
    }
  }

  async checkOut(params: any = {}) {
    return {};
  }
}
