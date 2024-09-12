import { /* inject, */ BindingScope,inject,injectable} from "@loopback/core";
import {repository} from "@loopback/repository";
import {Event,EventInstance} from "../models";
import {
  EventInstanceRepository,
  EventRepository,
  PlaceRepository,
} from "../repositories";
import {getDistanceFromLatLonInKm} from "../utils/query";
import {AddressService} from "./address.service";

@injectable({ scope: BindingScope.TRANSIENT })
export class EventService {
  constructor(
    @repository(EventRepository) public eventRepository: EventRepository,
    @repository(EventInstanceRepository)
    public eventInstanceRepository: EventInstanceRepository,
    @repository(PlaceRepository)
    public placeRepository: PlaceRepository,
    @inject("services.AddressService")
    protected addressService: AddressService
  ) {}

  /*
   * Add service methods here
   */

  async upcomming() {}
  async ongoing() {}

  async findUpcomingNearbyEvents(
    // @param.query.number('latitude')
    userLatitude: number,
    // @param.query.number('longitude')
    userLongitude: number,
    // @param.query.number('radius')
    radius: number = 10 // Default radius in kilometers
  ): Promise<EventInstance[]> {
    const currentDateTime = new Date().toISOString(); // Get current time

    // Fetch all upcoming events
    const upcomingEvents = await this.eventInstanceRepository.find({
      where: {
        startDate: { gt: currentDateTime }, // Filter only future events
      },
      include: [{ relation: "event" ,scope:{include:[{relation:"address"}]} }], // Include related Event details
    });

    // Filter the events based on proximity (calculate distance using Haversine)
    const nearbyEvents = upcomingEvents.filter((event:any) => {
      const distance = getDistanceFromLatLonInKm(
        userLatitude,
        userLongitude,
        event?.event?.address?.latitude,
        event?.event?.address?.longitude
      );
      return distance <= radius; // Return events within the specified radius
    });

    return nearbyEvents;
  }
  async createRecurringInstances(
    event: Event,
    recurrenceType: string,
    recurrenceEndDate: string | undefined
  ) {
    const eventInstances = [];
    const startDate = new Date(event.startDate);
    const recurrenceEnd = recurrenceEndDate
      ? new Date(recurrenceEndDate)
      : new Date();

    // Frequency calculation (e.g., 7 days for weekly, 14 days for biweekly, etc.)
    const recurrenceInterval = {
      daily: 1,
      weekly: 7,
      biweekly: 14,
    }[recurrenceType];

    if (!recurrenceInterval) return; // If the event is not recurring, exit.

    let currentDate = new Date(startDate);

    // Generate event instances until the recurrence end date
    while (currentDate <= recurrenceEnd) {
      // Create event instance
      const eventInstance = new EventInstance({
        startDate: currentDate.toISOString(),
        latitude: 0, // Adjust based on actual event location logic
        longitude: 0, // Adjust based on actual event location logic
        eventId: event.id!,
      });

      eventInstances.push(eventInstance);

      // Move the date forward by the recurrence interval (e.g., 7 days for weekly)
      currentDate.setDate(currentDate.getDate() + recurrenceInterval);
    }

    // Save all event instances in bulk
    await this.eventInstanceRepository.createAll(eventInstances);
  }

  async createEvent(eventData: Partial<any>): Promise<Event> {
    const address = await this.addressService.findOrCreate(
      eventData.address,
      eventData.coordinates
    );
    const place = await this.placeRepository.findOne({
      where: { addressId: address.id },
    });

    delete eventData.address;
    delete eventData.coordinates;

    eventData.addressId = address.id;
    eventData.placeId = place?.id || "adc41def-3c60-4995-8365-f2a8a1990f96";
    eventData.tagIds = eventData.tagIds || [];
    eventData.type = eventData.recurrenceType == "none" ? "once" : "repeat";
    eventData.coverId =
      eventData.coverId || "00000000-0000-0000-0000-000000000001";
    eventData.scheduleId =
      eventData.scheduleId || "6f8f032c-3761-4012-a4cb-2f1bd81ba741";
    eventData.playlistId =
      eventData.playlistId || "f0fcb028-b31d-4091-9801-7bfeab412ba0";
    // Create the main event
    const event = await this.eventRepository.create(eventData);

    // Handle recurrence logic
    if (eventData.recurrenceType && eventData.recurrenceType !== "none") {
      await this.createRecurringInstances(
        event,
        eventData.recurrenceType,
        eventData.recurrenceEndDate
      );
    }

    return event;
  }
  async edit(id: string, eventData: Partial<any>): Promise<Event> {
    if (!eventData.addressId) {
      const address = await this.addressService.findOrCreate(
        eventData.address,
        eventData.coordinates
      );
      eventData.addressId = address.id;
    }
    if (!eventData.placeId) {
      const place = await this.placeRepository.findOne({
        where: { addressId: eventData.addressId },
      });
      eventData.placeId = place?.id || "adc41def-3c60-4995-8365-f2a8a1990f96";
    }

    //  let event:any = await this.eventRepository.findById(id)
    delete eventData.address;
    delete eventData.coordinates;
    let event: any = await this.eventRepository.updateById(id, eventData);


    return event;
  }
  // Controller method to handle event creation
  /*
  @post('/events')
  async createEvent(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: {type: 'string'},
              description: {type: 'string'},
              startDate: {type: 'string'},
              endDate: {type: 'string'},
              recurrenceType: {type: 'string'},
              recurrenceEndDate: {type: 'string'},
            },
            required: ['name', 'startDate', 'recurrenceType'],
          },
        },
      },
    })
    eventData: Partial<Event>,
  ): Promise<Event> {
    // Create the main event
    const event = await this.eventRepository.create(eventData);

    // Handle recurrence logic
    if (eventData.recurrenceType && eventData.recurrenceType !== 'none') {
      await this.createRecurringInstances(
        event,
        eventData.recurrenceType,
        eventData.recurrenceEndDate,
      );
    }

    return event;
  }*/
}
