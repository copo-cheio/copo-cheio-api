import {/* inject, */ BindingScope, inject, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {BaseEventsQuery, EventsQuery} from '../blueprints/event.blueprint';
import {ExtendQueryFilterWhere} from '../blueprints/shared/query-filter.interface';
import {Event, EventInstance} from '../models';
import {
  ContactsRepository,
  EventInstanceRepository,
  EventRepository,
  PlaceRepository,
  PlaylistRepository,
} from '../repositories';
import {transactionWrapper} from '../shared/database';
import {getDistanceFromLatLonInKm} from '../utils/query';
import {AddressService} from './address.service';

@injectable({scope: BindingScope.TRANSIENT})
export class EventService {
  constructor(
    @repository('EventRepository') public eventRepository: EventRepository,
    @repository('ContactsRepository')
    public contactRepository: ContactsRepository,
    @repository('PlaylistRepository')
    public playlistRepository: PlaylistRepository,
    @repository('EventInstanceRepository')
    public eventInstanceRepository: EventInstanceRepository,
    @repository('PlaceRepository')
    public placeRepository: PlaceRepository,
    @inject('services.AddressService')
    protected addressService: AddressService,
  ) {}

  /*
   * Add service methods here
   */

  async queryLoop(callbackFn: any) {
    const eventIds: any = [];
    let keepRunning = true;
    const records: any = [];
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

  async getDistinctEventIds(mode: string = 'upcoming') {
    const startDate = new Date().toISOString();
    const params = [startDate];
    const query = `SELECT DISTINCT ON (eventid) id,eventid, endDate,startDate, latitude,longitude
FROM eventinstance WHERE endDate >= $i AND startDate >= $i
ORDER BY eventid,startdate ASC;
`;

    const distinctEventsIds =
      await this.eventInstanceRepository.dataSource.execute(query, params);
    const distinctEventsInstanceIds = distinctEventsIds.map(
      (deid: any) => deid.id,
    );
    return this.eventInstanceRepository.findAll({
      where: {
        id: distinctEventsInstanceIds,
      },
      order: ['startDate ASC'],
      include: [
        {
          relation: 'event',
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
    const query = `SELECT DISTINCT ON (eventid) id,eventid, endDate,startDate, latitude,longitude
    FROM eventinstance WHERE startDate >= $1 and deleted = false
    ORDER BY eventid,startDate ASC;`;
    const queryOngoing = `SELECT DISTINCT ON (eventid) id,eventid, endDate,startDate, latitude,longitude
    FROM eventinstance WHERE startDate <= $1  and endDate >= $1 and deleted = false
    ORDER BY eventid,startDate ASC;`;

    const distinctEventsIds =
      await this.eventInstanceRepository.dataSource.execute(query, params);
    const distinctOngoingEventsIds =
      await this.eventInstanceRepository.dataSource.execute(
        queryOngoing,
        params,
      );

    const distinctOngoing = distinctOngoingEventsIds
      /*        .filter(
            (e: any) =>
              distinctOngoingEventInstanceIds.indexOf(e.eventid) == -1,
          ) */
      .map((deid: any) => deid.eventid);

    const distinctUpcomingEventInstanceIds = distinctEventsIds
      .filter((e: any) => distinctOngoing.indexOf(e.eventid) == -1)
      .map((e: any) => e.id);

    return this.eventInstanceRepository.findAll({
      where: {
        id: {inq: distinctUpcomingEventInstanceIds},
      },
      order: ['startDate ASC'],
      include: [
        {
          relation: 'event',
          scope: {
            ...BaseEventsQuery,
          },
        },
      ],
    });
  }
  async ongoing() {
    const startDate = new Date().toISOString();
    const params = [startDate];

    const query = `SELECT DISTINCT ON (eventid) id,eventid, endDate,startDate, latitude,longitude
    FROM eventinstance WHERE startDate <= $1  and endDate >= $1 and deleted = false
    ORDER BY eventid,startDate ASC;`;

    const distinctEventsIds =
      await this.eventInstanceRepository.dataSource.execute(query, params);
    console.log({ongoing: distinctEventsIds});
    const distinctEventsInstanceIds = distinctEventsIds.map(e => e.id);
    if (distinctEventsInstanceIds.length > 0) {
      return this.eventInstanceRepository.findAll({
        where: {
          id: {inq: distinctEventsInstanceIds},
        },
        order: ['startDate ASC'],
        include: [
          {
            relation: 'event',
            scope: {
              ...BaseEventsQuery,
            },
          },
        ],
      });
    }
    return [];
    /*     const currentDateTime = new Date(); //.toISOString();
    const callbackFn = (eventIds: any = []) =>
      this.eventInstanceRepository.findOne({
        where: {
          startDate: {lte: currentDateTime},
          endDate: {gte: currentDateTime},
          eventId: {nin: eventIds},
        },

        order: ['startDate ASC'],
        include: [
          {
            relation: 'event',
            scope: {
              ...EventsQuery,
            },
          },
        ],
      });
    return this.queryLoop(callbackFn); */
  }

  async findUpcomingNearbyEvents(
    // @param.query.number('latitude')
    userLatitude: number,
    // @param.query.number('longitude')
    userLongitude: number,
    // @param.query.number('radius')
    radius: number = 100000000000000, // Default radius in kilometers
  ): Promise<EventInstance[]> {
    const upcomingEvents = await this.upcomming();
    // Filter the events based on proximity (calculate distance using Haversine)
    const nearbyEvents = upcomingEvents.filter((event: any) => {
      const distance = getDistanceFromLatLonInKm(
        userLatitude,
        userLongitude,
        event?.event?.address?.latitude || event?.latitude,
        event?.event?.address?.longitude || event?.longitude,
      );

      return distance <= radius; // Return events within the specified radius
    });

    return nearbyEvents;
  }

  async createInstance(event: Event) {
    return this.createOrUpdateRecurringInstances(
      event,
      'none',
      event.endDate.toISOString(),
    );
  }

  async parseEventInstanceData(
    event: Event,
    recurrenceType: string,
    recurrenceEndDate: string | Date | undefined,
  ) {
    // const eventInstances = [];
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const recurrenceEnd = recurrenceEndDate
      ? new Date(recurrenceEndDate)
      : new Date(event.endDate);

    // Frequency calculation (e.g., 7 days for weekly, 14 days for biweekly, etc.)
    const RECURRENCE_INTERVALS = ['none', 'daily', 'weekly', 'biweekly'];
    const recurrenceInterval = {
      none: 1000000,
      daily: 1,
      weekly: 7,
      biweekly: 14,
    }[recurrenceType];

    if (RECURRENCE_INTERVALS.indexOf(recurrenceType) == -1) return {}; // If the event is not recurring, exit.

    const currentStartDate = new Date(startDate);
    const currentEndDate = new Date(endDate);

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
      latitude: parseFloat('' + address.latitude),
      longitude: parseFloat('' + address.longitude),
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
        '-' +
        startDay.getMonth() +
        '-' +
        startDay.getDate();
      return {
        id: eI.id,
        startDay: startDay,
        data: eI,
      };
    });
  }
  async createRecurringInstances(
    event: Event,
    recurrenceType: string,
    recurrenceEndDate: string | Date | undefined,
  ) {
    const eventInstances = [];
    const newEventInstances = [];
    const updateEventInstances: any = [];
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
                gte: event.startDate, //.toISOString(),
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
      },
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
      recurrenceEndDate,
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
      const eventInstance: any = {
        startDate: currentStartDate.toISOString(),
        endDate: currentEndDate.toISOString(),
        latitude: coordinates.latitude, // Adjust based on actual event location logic
        longitude: coordinates.longitude, // Adjust based on actual event location logic
        eventId: event.id!,
      };

      const newStartDate = this.parseStartDates([eventInstance])[0];
      const hasRecord = currentEventInstances.find(
        (cEI: any) => cEI.startDay == newStartDate.startDay,
      );

      if (hasRecord) {
        eventInstance.id = hasRecord.id;
        eventInstance.deleted = false;
        updateEventInstances.push(eventInstance);
        deleteEventInstances.splice(
          deleteEventInstances.indexOf(hasRecord.id),
          1,
        );
      } else {
        newEventInstances.push(eventInstance);
      }

      eventInstances.push(eventInstance);

      // Move the date forward by the recurrence interval (e.g., 7 days for weekly)
      currentStartDate.setDate(currentStartDate.getDate() + recurrenceInterval);
      currentEndDate.setDate(currentEndDate.getDate() + recurrenceInterval);
    }

    // Save all event instances in bulk
    //await this.eventInstanceRepository.createAll(eventInstances);
    if (newEventInstances.length > 0) {
      await this.eventInstanceRepository.createAll(newEventInstances);
    }
    // Update existing instances so it doesnt loose dats
    for (const updateInstance of updateEventInstances) {
      const id = updateInstance.id;
      delete updateInstance.id;

      await this.eventInstanceRepository.forceUpdateById(id, updateInstance);
    }
    // Delete all the prev instances
    for (const deleteInstanceId of deleteEventInstances) {
      await this.eventInstanceRepository.deleteIfExistsById(deleteInstanceId);
    }
  }

  async createOrUpdateRecurringInstances(
    event: Event,
    recurrenceType: string,
    recurrenceEndDate: string | Date | undefined,
  ) {
    return this.createRecurringInstances(
      event,
      recurrenceType,
      recurrenceEndDate,
    );
  }

  async createEvent(eventData: Partial<any>): Promise<Event> {
    return transactionWrapper(
      this.eventRepository,
      async (transaction: any) => {
        let place: any;
        let address: any;
        let playlist: any;
        const contacts: any = eventData?.contacts || {};

        if (eventData.placeId) {
          place = await this.placeRepository.findById(eventData.placeId);
          address = await this.addressService.findById(place.addressId);
        } else {
          address = await this.addressService.findOrCreate(
            eventData.address,
            eventData.coordinates,
          );
          place = await this.placeRepository.findOne({
            where: {addressId: address.id},
          });
        }
        if (!eventData.playlistId) {
          playlist = await this.playlistRepository.create({
            name: 'Playlist',
            description: '',
            url: '',
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
        eventData.type = eventData.recurrenceType == 'none' ? 'once' : 'repeat';
        eventData.coverId =
          eventData.coverId || '00000000-0000-0000-0000-000000000001';
        eventData.scheduleId =
          eventData.scheduleId || '6f8f032c-3761-4012-a4cb-2f1bd81ba741';

        const event: any = await this.eventRepository.create(eventData);

        // Handle recurrence logic
        if (eventData.recurrenceType && eventData.recurrenceType !== 'none') {
          await this.createRecurringInstances(
            event,
            eventData.recurrenceType,
            eventData.recurrenceEndDate,
          );
        } else {
          await this.createInstance(event);
        }

        await this.contactRepository.createRecord(event.id, contacts);

        return event;
      },
    );
  }
  async edit(id: string, eventData: Partial<any>): Promise<Event> {
    return transactionWrapper(
      this.eventRepository,
      async (transaction: any) => {
        const currentEvent: any = this.eventRepository.findById(id);
        const currentPlace: any = this.placeRepository.findById(
          currentEvent.placeId,
        );

        eventData.addressId = currentPlace.addressId;
        if (eventData.placeId && eventData.placeId !== currentEvent.placeId) {
          const newPlace: any = this.placeRepository.findById(
            eventData.placeId,
          );
          eventData.addressId = newPlace.addressId;
        }

        delete eventData.address;
        delete eventData.coordinates;

        await this.eventRepository.updateById(id, eventData);
        const event = await this.eventRepository.findById(id);

        if (
          eventData.recurrenceType ||
          eventData.recurrenceEndDate ||
          eventData.startDate ||
          eventData.endDate
        ) {
          await this.createOrUpdateRecurringInstances(
            event,
            event.recurrenceType,
            event.recurrenceEndDate,
          );
        }

        return event;
      },
    );
  }

  async getManagerEventsWhichAreOrWillOpenToday(filter: any = []) {
    const now = new Date(); //.toISOString(); // Get current date in ISO format

    let ongoing = [];
    let ongoingInstancesIds = [];
    const events = await this.eventRepository.findAll(
      ExtendQueryFilterWhere({}, [...filter, {deleted: false}, {live: true}]),
    );
    const ongoingInstances = await this.eventInstanceRepository.findAll({
      where: {
        and: [
          {eventId: {inq: events.map((p: any) => p.id)}},
          {startDate: {lte: now}}, // PlaceInstance.date >= now
          {endDate: {gte: now}}, // PlaceInstance.endDate <= now
          {deleted: false},
        ],
      },
    });

    ongoing = ongoingInstances; //.filter((place: any) => place?.instances?.[0]);
    ongoingInstancesIds = [...ongoing.map((place: any) => place.id)];

    let upcoming = [];

    const upcomingTodayInstances = await this.eventInstanceRepository.findAll({
      where: {
        and: [
          {id: {nin: ongoingInstancesIds}},
          {startDate: {gte: now}}, // PlaceInstance.date >= now
          {endDate: {lte: now}}, // PlaceInstance.endDate <= now
          {deleted: false},
        ],
      },
    });
    upcoming = upcomingTodayInstances;

    return {
      ongoing: ongoing.length,
      today: upcoming.length,
      total: ongoingInstances.length + upcomingTodayInstances.length,
      ongoingFull: ongoing,
      upcomingFull: upcoming,
    };
  }
}
