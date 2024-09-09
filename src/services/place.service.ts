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
    let eventId = "c4e47c95-7e36-4d37-8f6f-415148cecdca"
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
