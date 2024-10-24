import {inject} from "@loopback/core";
import {repository} from "@loopback/repository";
import {EventFullQuery} from "../blueprints/event.blueprint";
import {
  ContactsRepository,
  EventRepository,
  ImageRepository,
  PlaceRepository,
} from "../repositories";
import {QrFactoryService} from "./qr-factory.service";

export class PlaceService {
  constructor(
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
    @repository(ContactsRepository)
    public contactRepository: ContactsRepository,
    @repository(EventRepository)
    public eventRepository: EventRepository,
    @repository(ImageRepository)
    public imageRepository: ImageRepository,
    @inject("services.QrFactoryService")
    protected qrFactoryService: QrFactoryService
  ) {}



  findOrCreateCheckInQrCode = async (id: string) => {
    // let record = await this.placeRepository.findById(id);
    let image = await this.imageRepository.findOne({
      where: {
        refId: id,
        type: "qr",
      },
    });
    if (!image) {
      await this.qrFactoryService.generateAndUploadQrCode(
        {
          action: "check-in",
          type: "place",
          refId: id,
        },
        id,
        "check-in"
      );
      image = await this.imageRepository.findOne({
        where: {
          refId: id,
          type: "qr",
        },
      });
    }
    return image;
  };
  /**
   * @todo
   * @param placeId
   */
  async findCurrentEvent(placeId: string) {
    /**
     * @todo
     */
    let eventId = "7b8ae7e3-37b0-4c19-b1ab-476426afc730";
    let event = await this.eventRepository.findById(eventId, EventFullQuery);
    return event;
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
