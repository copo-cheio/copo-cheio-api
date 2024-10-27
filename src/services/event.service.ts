import { /* inject, */ BindingScope,inject,injectable} from "@loopback/core";
import {repository} from "@loopback/repository";
import {EventsQuery} from "../blueprints/event.blueprint";
import {Event,EventInstance} from "../models";
import {
  ContactsRepository,
  EventInstanceRepository,
  EventRepository,
  PlaceRepository,
  PlaylistRepository,
} from "../repositories";
import {transactionWrapper} from "../shared/database";
import {getDistanceFromLatLonInKm} from "../utils/query";
import {AddressService} from "./address.service";

@injectable({ scope: BindingScope.TRANSIENT })
export class EventService {
  constructor(
    @repository(EventRepository) public eventRepository: EventRepository,
    @repository(ContactsRepository)
    public contactRepository: ContactsRepository,
    @repository(PlaylistRepository)
    public playlistRepository: PlaylistRepository,
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

  async queryLoop(callbackFn: any) {
    let eventIds: any = [];
    let keepRunning = true;
    let records: any = [];
    let i = 0;
    while (keepRunning) {
      if (i >= 100) break;
      i++;
      try {
        const record = await callbackFn(eventIds);
        if (record) {
          record.event.startDate = record.startDate;
          record.event.endDate = record.endDate;
          records.push(record);
          eventIds.push(record.eventId);
        } else {
          keepRunning = false;
        }
      } catch (ex) {
        keepRunning = false;
      }
    }
    return records;
  }

  async getDistinctEventIds(mode: string = "upcoming") {
    const startDate = new Date().toISOString();
    const params = [startDate];
    const query = `SELECT  id , eventid 
FROM (
  SELECT  id , eventid , startDate, ROW_NUMBER() OVER (PARTITION BY eventid ORDER BY startDate) as row_num
  FROM EventInstance
) subquery
WHERE row_num = 1 AND  startDate >= ?
ORDER BY startDate;`;

    const distinctEventsIds = await this.eventInstanceRepository.dataSource.execute(
      query,
      params
    );
    const distinctEventsInstanceIds = distinctEventsIds.map(
      (deid: any) => deid.id
    );
    return await this.eventInstanceRepository.findAll({
      where: {
        id: distinctEventsInstanceIds,
      },
      order: ["startDate ASC"],
      include: [
        {
          relation: "event",
          scope: {
            ...EventsQuery,
          },
        },
      ],
    });
  }
  async upcomming() {
    const startDate = new Date().toISOString();
    const params = [startDate];
    const query = `SELECT  id , eventid 
  FROM (
    SELECT  id , eventid , startDate, ROW_NUMBER() OVER (PARTITION BY eventid ORDER BY startDate) as row_num
    FROM EventInstance
  ) subquery
  WHERE row_num = 1 AND  startDate >= $1
  ORDER BY startDate`;

    const distinctEventsIds = await this.eventInstanceRepository.dataSource.execute(
      query,
      params
    );
    const distinctEventsInstanceIds = distinctEventsIds.map(
      (deid: any) => deid.id
    );
    return this.eventInstanceRepository.findAll({
      where: {
        id: { inq: distinctEventsInstanceIds },
      },
      order: ["startDate ASC"],
      include: [
        {
          relation: "event",
          scope: {
            ...EventsQuery,
          },
        },
      ],
    }); // const currentDateTime = new Date().toISOString();
    // const callbackFn = (eventIds: any = []) =>
    //   this.eventInstanceRepository.findOne({
    //     where: {
    //       startDate: { gte: currentDateTime },
    //       eventId: { nin: eventIds },
    //     },

    //     order: ["startDate ASC"],
    //     include: [
    //       {
    //         relation: "event",
    //         scope: {
    //           ...EventsQuery,
    //         },
    //       },
    //     ],
    //   });

    // return await this.queryLoop(callbackFn);
  }
  async ongoing() {
    const currentDateTime = new Date().toISOString();
    const callbackFn = (eventIds: any = []) =>
      this.eventInstanceRepository.findOne({
        where: {
          startDate: { lte: currentDateTime },
          endDate: { gte: currentDateTime },
          eventId: { nin: eventIds },
        },

        order: ["startDate ASC"],
        include: [
          {
            relation: "event",
            scope: {
              ...EventsQuery,
            },
          },
        ],
      });
    return this.queryLoop(callbackFn);
  }

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
      include: [
        { relation: "event", scope: { include: [{ relation: "address" }] } },
      ], // Include related Event details
    });

    // Filter the events based on proximity (calculate distance using Haversine)
    const nearbyEvents = upcomingEvents.filter((event: any) => {
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

  async createInstance(event: Event) {
    return await this.createOrUpdateRecurringInstances(
      event,
      "none",
      event.endDate.toISOString()
    );
  }

  async parseEventInstanceData(
    event: Event,
    recurrenceType: string,
    recurrenceEndDate: string | undefined
  ) {
    // const eventInstances = [];
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const recurrenceEnd = recurrenceEndDate
      ? new Date(recurrenceEndDate)
      : new Date(event.endDate);

    // Frequency calculation (e.g., 7 days for weekly, 14 days for biweekly, etc.)
    const RECURRENCE_INTERVALS = ["none", "daily", "weekly", "biweekly"];
    const recurrenceInterval = {
      none: 1000000,
      daily: 1,
      weekly: 7,
      biweekly: 14,
    }[recurrenceType];

    if (RECURRENCE_INTERVALS.indexOf(recurrenceType) == -1) return {}; // If the event is not recurring, exit.

    let currentStartDate = new Date(startDate);
    let currentEndDate = new Date(endDate);

    currentStartDate.setSeconds(0);
    currentStartDate.setMilliseconds(0);
    currentEndDate.setSeconds(0);
    currentEndDate.setMilliseconds(0);
    recurrenceEnd.setSeconds(0);
    recurrenceEnd.setMilliseconds(0);
    recurrenceEnd.setDate(recurrenceEnd.getDate() + 1);

    const place = await this.placeRepository.findById(event.placeId);
    const address = await this.addressService.findById(place.addressId);


    const coordinates = {
      latitude: parseFloat("" + address.latitude),
      longitude: parseFloat("" + address.longitude),
    };

    return {
      coordinates,
      currentEndDate,
      currentStartDate,
      currentRecurrenceEndDate: recurrenceEnd,
      recurrenceInterval,
    };
  }

  parseStartDates(data: any = []) {
    return data.map((eI: any) => {
      let startDay: any = new Date(eI.startDate);
      startDay =
        startDay.getFullYear() +
        "-" +
        startDay.getMonth() +
        "-" +
        startDay.getDate();
      return {
        id: eI.id,
        startDay: startDay,
        data:eI
      };
    });
  }
  async createRecurringInstances(
    event: Event,
    recurrenceType: string,
    recurrenceEndDate: string | undefined
  ) {
    const eventInstances = [];
    const newEventInstances = [];
    const updateEventInstances:any  = [];
    let deleteEventInstances = [];

    let currentEventInstances: any = await this.eventInstanceRepository.findAll(
      {
        where: {
          and: [
            {
              eventId: event.id,
            },
            {
              startDate: {
                gte: event.startDate.toISOString(),
              },
            },
            {
              or: [
                {
                  deleted: true,
                },
                {
                  deleted: false,
                },
              ],
            },
          ],
        },
      }
    );
    currentEventInstances = this.parseStartDates(currentEventInstances);
    deleteEventInstances = currentEventInstances.map((e: any) => e.id);

    const {
      coordinates,
      currentEndDate,
      currentStartDate,
      currentRecurrenceEndDate,
      recurrenceInterval,
    }: any = await this.parseEventInstanceData(
      event,
      recurrenceType,
      recurrenceEndDate
    );

    while (currentEndDate < currentRecurrenceEndDate) {
      // Create event instance
      // const eventInstance = new EventInstance({
      //   startDate: currentStartDate.toISOString(),
      //   endDate: currentEndDate.toISOString(),
      //   latitude: coordinates.latitude, // Adjust based on actual event location logic
      //   longitude: coordinates.longitude, // Adjust based on actual event location logic
      //   eventId: event.id!,
      //   deleted:false
      // });
      const eventInstance:any ={
        startDate: currentStartDate.toISOString(),
        endDate: currentEndDate.toISOString(),
        latitude: coordinates.latitude, // Adjust based on actual event location logic
        longitude: coordinates.longitude, // Adjust based on actual event location logic
        eventId: event.id!,

      }

      let newStartDate = this.parseStartDates([eventInstance])[0];
      let hasRecord = currentEventInstances.find(
        (cEI: any) => cEI.startDay == newStartDate.startDay
      );

      if (hasRecord) {

        eventInstance.id = hasRecord.id;
        eventInstance.deleted = false;
        updateEventInstances.push(eventInstance);
        deleteEventInstances.splice(
          deleteEventInstances.indexOf(hasRecord.id),
          1
        );
      } else {
        newEventInstances.push(eventInstance);
      }

      eventInstances.push(eventInstance);

      // Move the date forward by the recurrence interval (e.g., 7 days for weekly)
      currentStartDate.setDate(currentStartDate.getDate() + recurrenceInterval);
      currentEndDate.setDate(currentEndDate.getDate() + recurrenceInterval);

    }

    console.log(" ");
    console.log(" ");
    console.log("will create ", newEventInstances.length);
    console.log("will update ", updateEventInstances.length);
    console.log("will delete ", deleteEventInstances.length);
    console.log(" ");
    console.log(" ");
    // Save all event instances in bulk
    //await this.eventInstanceRepository.createAll(eventInstances);
    if (newEventInstances.length > 0) {
      await this.eventInstanceRepository.createAll(newEventInstances);
    }
    // Update existing instances so it doesnt loose dats
    for (let updateInstance of updateEventInstances) {
      let id = updateInstance.id;
      delete updateInstance.id;
      console.log('update',{id,updateInstance})
      await this.eventInstanceRepository.forceUpdateById(id,updateInstance)
      // await this.eventInstanceRepository.updateAll( updateInstance,{and: [{id}, {or:[{deleted:true},{deleted:false}]}]});
    }
    // Delete all the prev instances
    for (let deleteInstanceId of deleteEventInstances) {
      await this.eventInstanceRepository.deleteIfExistsById(deleteInstanceId);
    }
  }

  async createOrUpdateRecurringInstances(
    event: Event,
    recurrenceType: string,
    recurrenceEndDate: string | undefined
  ) {
    return this.createRecurringInstances(
      event,
      recurrenceType,
      recurrenceEndDate
    );
  }

  async createEvent(eventData: Partial<any>): Promise<Event> {
    return transactionWrapper(
      this.eventRepository,
      async (transaction: any) => {
        let place: any;
        let address: any;
        let playlist: any;
        let contacts: any = eventData?.contacts || {};

        if (eventData.placeId) {
          place = await this.placeRepository.findById(eventData.placeId);
          address = await this.addressService.findById(place.addressId);
        } else {
          address = await this.addressService.findOrCreate(
            eventData.address,
            eventData.coordinates
          );
          place = await this.placeRepository.findOne({
            where: { addressId: address.id },
          });
        }
        if (!eventData.playlistId) {
          playlist = await this.playlistRepository.create({
            name: "Playlist",
            description: "",
            url: "",
            tagIds: [],
          });

          eventData.playlistId = playlist.id;
        }

        delete eventData.address;
        delete eventData.coordinates;
        delete eventData.contacts;

        eventData.addressId = address.id;
        eventData.placeId = place?.id; //|| "adc41def-3c60-4995-8365-f2a8a1990f96";
        eventData.tagIds = eventData.tagIds || [];
        eventData.type = eventData.recurrenceType == "none" ? "once" : "repeat";
        eventData.coverId =
          eventData.coverId || "00000000-0000-0000-0000-000000000001";
        eventData.scheduleId =
          eventData.scheduleId || "6f8f032c-3761-4012-a4cb-2f1bd81ba741";

        const event: any = await this.eventRepository.create(eventData);

        // Handle recurrence logic
        if (eventData.recurrenceType && eventData.recurrenceType !== "none") {
          await this.createRecurringInstances(
            event,
            eventData.recurrenceType,
            eventData.recurrenceEndDate
          );
        } else {
          await this.createInstance(event);
        }

        await this.contactRepository.createRecord(event.id, contacts);

        return event;
      }
    );
  }
  async edit(id: string, eventData: Partial<any>): Promise<Event> {
    return transactionWrapper(
      this.eventRepository,
      async (transaction: any) => {
        let currentEvent: any = this.eventRepository.findById(id);
        let currentPlace: any = this.placeRepository.findById(
          currentEvent.placeId
        );

        eventData.addressId = currentPlace.addressId;
        if (eventData.placeId && eventData.placeId !== currentEvent.placeId) {
          let newPlace: any = this.placeRepository.findById(eventData.placeId);
          eventData.addressId = newPlace.addressId;
        }

        delete eventData.address;
        delete eventData.coordinates;

        await this.eventRepository.updateById(id, eventData);
        let event = await this.eventRepository.findById(id);

        if (
          eventData.recurrenceType ||
          eventData.recurrenceEndDate ||
          eventData.startDate ||
          eventData.endDate
        ) {
          await this.createOrUpdateRecurringInstances(
            event,
            event.recurrenceType,
            event.recurrenceEndDate
          );
        }

        return event;
      }
    );
  }
}
