// Uncomment these imports to begin using these cool features!

import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get, param, post, requestBody} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {EventsQuery} from '../../blueprints/event.blueprint';
import {PlacesQuery} from '../../blueprints/place.blueprint';
import {
  EventRepository,
  FavoriteRepository,
  PlaceRepository,
  UserRepository,
} from '../../repositories';
import {EventService} from '../../services';
import {PlaceService} from '../../services/place.service';

// import {inject} from '@loopback/core';

export class AppController {
  constructor(
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private currentUser: UserProfile, // Inject the current user profile
    @inject('services.EventService')
    protected eventService: EventService,
    @inject('services.PlaceService')
    protected placeService: PlaceService,
    @repository(EventRepository)
    public eventRepository: EventRepository,
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(FavoriteRepository)
    public favoriteRepository: FavoriteRepository,
  ) {}

  /* ********************************** */
  /*             TODAY PAGE             */
  /* ********************************** */

  /**
   * Finds ongoing events and open places
   * @returns
   */
  @get('/app/today')
  async getTodayPageData(
    @param.query.number('radius') radius: number = 100000000000000000000,
    @param.query.number('latitude') latitude: number = 38.64239,
    @param.query.number('longitude') longitude: number = -9.19569,
  ): Promise<any> {
    const nextEvents = () =>
      this.eventService.findUpcomingNearbyEvents(latitude, longitude, radius);
    const nearbyPlaces = () =>
      this.placeService.findNearbyPlaces(latitude, longitude, 'all');
    const result = await Promise.all([nextEvents(), nearbyPlaces()]);

    return {
      events: result[0],
      places: result[1],
    };
  }

  /* ********************************** */
  /*            EXPLORE PAGE            */
  /* ********************************** */
  @get('/events/nearby')
  async findNearbyPlaces(
    @param.query.number('lat') lat: number,
    @param.query.number('lon') lon: number,
  ) {
    const results = await this.eventRepository.findByDistance(lat, lon);

    const _filter = {
      ...EventsQuery,
      where: {
        or: results.map((r: any) => {
          return {id: r.id};
        }),
      },
      sort: ['distance DESC'],
    };
    return this.eventRepository.find(_filter);
  }

  /* ********************************** */
  /*            UPCOMING PAGE           */
  /* ********************************** */
  @get('/app/upcoming')
  async findUpcoming(
    @param.query.number('latitude') latitude: number,
    @param.query.number('longitude') longitude: number,
  ) {
    const results: any = await this.eventRepository.findNearUpcoming(
      latitude,
      longitude,
    );

    const _filter = {
      ...EventsQuery,
      where: {
        or: results.map((r: any) => {
          return {id: r.eventid};
        }),
      },
      sort: ['startdate ASC'],
    };
    return this.eventRepository.find(_filter);
  }

  /* ********************************** */
  /*           FAVORITES PAGE           */
  /* ********************************** */
  @get('/app/favorites')
  @authenticate('firebase')
  async findFavorites() {
    const favorites = await this.userRepository.getFavorites(
      this.currentUser.id,
    );
    if (favorites.events.length > 0) {
      favorites.events = await this.eventRepository.findAll({
        ...EventsQuery,
        where: {id: {inq: favorites.events}},
      });
    }
    if (favorites.places.length > 0) {
      favorites.places = await this.placeRepository.findAll({
        ...PlacesQuery,
        where: {id: {inq: favorites.places}},
      });
    }
    return favorites;
    // const results: any = await this.eventRepository.findNearUpcoming(
    //   latitude,
    //   longitude
    // );

    // const _filter = {
    //   ...EventsQuery,
    //   where: {
    //     or: results.map((r: any) => {
    //       return { id: r.eventid };
    //     }),
    //   },
    //   sort: ["startdate ASC"],
    // };
    // return this.eventRepository.find(_filter);
  }
  @post('/app/favorite')
  @authenticate('firebase')
  async toggleFavorites(
    @requestBody({
      content: {},
    })
    data: any,
  ) {
    let favorites = await this.userRepository.getFavorites(this.currentUser.id);
    const payload: any = {
      userId: this.currentUser.id,
    };
    payload[data.type + 'Id'] = data.id;
    if (favorites[data.type + 's'].indexOf(data.id) > -1) {
      await this.favoriteRepository.deleteAllHard(payload);
    } else {
      await this.favoriteRepository.create(payload);
    }

    favorites = await this.userRepository.getFavorites(this.currentUser.id);

    if (favorites.events.length > 0) {
      favorites.events = await this.eventRepository.findAll({
        ...EventsQuery,
        where: {id: {inq: favorites.events}},
      });
    }
    if (favorites.places.length > 0) {
      favorites.places = await this.placeRepository.findAll({
        ...PlacesQuery,
        where: {id: {inq: favorites.places}},
      });
    }
    return favorites;
    // const results: any = await this.eventRepository.findNearUpcoming(
    //   latitude,
    //   longitude
    // );

    // const _filter = {
    //   ...EventsQuery,
    //   where: {
    //     or: results.map((r: any) => {
    //       return { id: r.eventid };
    //     }),
    //   },
    //   sort: ["startdate ASC"],
    // };
    // return this.eventRepository.find(_filter);
  }
}
