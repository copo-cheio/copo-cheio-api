// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get,param} from '@loopback/rest';
import {EventsQuery} from '../blueprints/event.blueprint';
import {EventRepository} from '../repositories';
import {EventService} from '../services';
import {PlaceService} from '../services/place.service';

// import {inject} from '@loopback/core';


export class AppController {
  constructor(
    @inject("services.EventService")
    protected eventService: EventService,
    @inject("services.PlaceService")
    protected placeService: PlaceService,
    @repository(EventRepository)
    public eventRepository: EventRepository,
  ) {}

  /* ********************************** */
  /*             TODAY PAGE             */
  /* ********************************** */

  /**
   * Finds ongoing events and open places
   * @returns
   */
  @get("/app/today")
  async getTodayPageData(
    @param.query.number("radius") radius:number = 100000000000000000000,
    @param.query.number("latitude") latitude: number =38.64239,
    @param.query.number("longitude") longitude: number =-9.19569
  ): Promise<any> {

    const nextEvents =  ()=> this.eventService.findUpcomingNearbyEvents(
      latitude,longitude,radius
    );
    const nearbyPlaces = ()=>  this.placeService.findNearbyPlaces(latitude,longitude,"all");
    const result = await Promise.all([nextEvents(),nearbyPlaces()])

    return {
      events:result[0],
      places:result[1]
    }
  }

  /* ********************************** */
  /*            EXPLORE PAGE            */
  /* ********************************** */
  @get("/events/nearby")
  async findNearbyPlaces(
    @param.query.number("lat") lat: number,
    @param.query.number("lon") lon: number
  ) {
    const results = await this.eventRepository.findByDistance(lat, lon);

    const _filter = {
      ...EventsQuery,
      where: {
        or: results.map((r: any) => {
          return { id: r.id };
        }),
      },
      sort: ["distance DESC"],
    };
    return this.eventRepository.find(_filter);
  }

}
