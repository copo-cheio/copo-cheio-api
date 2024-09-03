import {repository} from "@loopback/repository";
import {PlaceRepository} from "../repositories";

export class BarService {
  constructor(
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository
  ) {}
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
