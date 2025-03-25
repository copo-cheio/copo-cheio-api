// Uncomment these imports to begin using these cool features!

import { AuthenticationBindings, authenticate } from "@loopback/authentication";
import { inject } from "@loopback/core";
import { repository } from "@loopback/repository";
import { post, requestBody } from "@loopback/rest";
import { UserProfile } from "@loopback/security";

import {
  EventRepository,
  FavoriteRepository,
  PlaceRepository,
  UserRepository,
} from "../../repositories";
import { ActivityService, EventService } from "../../services";
import { PlaceService } from "../../services/place.service";

// import {inject} from '@loopback/core';

export class ActivityV2Controller {
  constructor(
    @inject(AuthenticationBindings.CURRENT_USER, { optional: true })
    private currentUser: UserProfile, // Inject the current user profile
    @inject("services.EventService")
    protected eventService: EventService,
    @inject("services.PlaceService")
    protected placeService: PlaceService,
    @inject("services.ActivityService")
    protected activityService: ActivityService,
    @repository(EventRepository)
    public eventRepository: EventRepository,
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(FavoriteRepository)
    public favoriteRepository: FavoriteRepository
  ) {}

  @post("/app/favorite")
  @authenticate("firebase")
  async toggleFavorites(
    @requestBody({
      content: {},
    })
    data: any
  ) {
    await this.activityService.toggleFavorites(this.currentUser.id, data);
    return this.userRepository.getFullFavorites(this.currentUser.id);
  }
  @post("/app/share")
  @authenticate("firebase")
  async share(
    @requestBody({
      content: {},
    })
    data: any
  ) {
    await this.activityService.share(this.currentUser.id, data);
  }
  @post("/app/search")
  @authenticate("firebase")
  async search(
    @requestBody({
      content: {},
    })
    data: any
  ) {
    await this.activityService.search(this.currentUser.id, data);
  }
  @post("/v2/activity/geo-location")
  @authenticate("firebase")
  async updateGeoLocation(
    @requestBody({
      content: {},
    })
    data: any
  ) {
    const { latitude, longitude } = data;
    if (latitude && longitude && this.currentUser.id) {
      await this.userRepository.updateById(this.currentUser.id, {
        latitude,
        longitude,
      });
    }
    // await this.activityService.search(this.currentUser.id, data);
  }
}
