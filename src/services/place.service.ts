import {repository} from "@loopback/repository";
import {EventFullQuery} from '../blueprints/event.blueprint';
import {EventRepository,PlaceRepository} from "../repositories";

export class PlaceService {
  constructor(
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
    @repository(EventRepository)
    public eventRepository: EventRepository,
  ) {}

  /**
   * @todo
   * @param placeId
   */
  async findCurrentEvent(placeId:string) {
    /**
     * @todo
     */
    let eventId = "7b8ae7e3-37b0-4c19-b1ab-476426afc730"
    let event = await this.eventRepository.findById(eventId,EventFullQuery)
    return event
  }
  async findOpenPlaces(dayOfWeek: number, time: string) {
    const places = await this.placeRepository.find({
      include: [
        {
          relation: "openHours",
          scope: {
            where: {
              and: [
                { dayOfWeek: dayOfWeek },
                {
                  or: [
                    {
                      and: [
                        { openTime: { lte: time } },
                        { closeTime: { gte: time } },
                      ],
                    },
                    {
                      and: [
                        { openTime: { lte: time } },
                        { closeTime: { lt: "04:00:00" } },
                      ],
                    }, // Assuming a bar could close before 4 AM.
                  ],
                },
              ],
            },
          },
        },
      ],
    });
    return places;
  }
}
