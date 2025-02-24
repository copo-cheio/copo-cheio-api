import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {EventFullQuery} from '../blueprints/event.blueprint';
import {BasePlacesQuery, PlacesQuery} from '../blueprints/place.blueprint';
import {
  ContactsRepository,
  EventInstanceRepository,
  EventRepository,
  ImageRepository,
  OpeningHoursRepository,
  PlaceRepository,
} from '../repositories';
import {PlaceInstanceRepository} from '../repositories/v1/place-instance.repository';
import {QrFactoryService} from './qr-factory.service';

export class PlaceService {
  constructor(
    @repository('PlaceRepository')
    public placeRepository: PlaceRepository,
    @repository('ContactsRepository')
    public contactRepository: ContactsRepository,
    @repository('EventRepository')
    public eventRepository: EventRepository,
    @repository('EventInstanceRepository')
    public eventInstanceRepository: EventInstanceRepository,
    @repository('PlaceInstanceRepository')
    public placeInstanceRepository: PlaceInstanceRepository,
    @repository('ImageRepository')
    public imageRepository: ImageRepository,
    @repository('OpeningHoursRepository')
    public openingHoursRepository: OpeningHoursRepository,
    @inject('services.QrFactoryService')
    protected qrFactoryService: QrFactoryService,
  ) {}

  findOrCreateCheckInQrCode = async (id: string) => {
    // let record = await this.placeRepository.findById(id);
    let image = await this.imageRepository.findOne({
      where: {
        refId: id,
        type: 'qr',
      },
    });
    if (!image) {
      await this.qrFactoryService.generateAndUploadQrCode(
        {
          action: 'check-in',
          type: 'place',
          refId: id,
        },
        id,
        'check-in',
      );
      image = await this.imageRepository.findOne({
        where: {
          refId: id,
          type: 'qr',
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
    const events = await this.eventRepository.findAll({
      where: {placeId, deleted: false},
    });
    const instance: any = await this.eventInstanceRepository.findOne({
      order: ['startDate DESC'],
      where: {
        and: [
          {eventId: {inq: events.map((e: any) => e.id) || []}},
          {
            endDate: {
              gte: new Date().toDateString(),
            },
          },
        ],
      },
    });
    // let eventId = '7b8ae7e3-37b0-4c19-b1ab-476426afc730';
    let event: any = {};
    if (instance?.eventId) {
      event = await this.eventRepository.findById(
        instance.eventId,
        EventFullQuery,
      );
    }
    return event;
  }

  async findNearbyPlaces(latitude: number, longitude: number, mode = 'all') {
    const query = `SELECT
    	place.id,
    	place.addressid,
    	address.latitude,
    	address.longitude,
    	(6371 * ACOS(
            COS(RADIANS($1)) * COS(RADIANS(address.latitude)) *
            COS(RADIANS(address.longitude) - RADIANS($2)) +
            SIN(RADIANS($1)) * SIN(RADIANS(address.latitude))
        )) AS distance_km
      FROM place
      INNER JOIN address
      ON  place.addressid::text = address.id::text
      ORDER BY
        distance_km ASC;`;

    const params = [latitude, longitude];
    const nearbyPlaces = await this.placeRepository.dataSource.execute(
      query,
      params,
    );

    const placeDistanceMap: any = {};
    for (const place of nearbyPlaces) {
      placeDistanceMap[place.id] = place.distance_km;
    }
    let result: any = nearbyPlaces;
    if (mode == 'all') {
      result = await this.placeRepository.findAll({
        ...PlacesQuery,
        where: {id: {inq: nearbyPlaces.map((np: any) => np.id)}},
      });
    } else if (mode == 'open') {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const time = [today.getHours(), today.getMinutes(), 0]
        .map((t: any) => {
          t = '' + t;
          if (t.length < 1) {
            t = '0' + t;
          }
        })
        .join(':');
      result = await this.placeRepository.findAll({
        ...BasePlacesQuery,
        include: [
          ...BasePlacesQuery.include,
          {
            relation: 'openHours',
            scope: {
              where: {
                and: [
                  {dayOfWeek: dayOfWeek},
                  {active: true},
                  {
                    or: [
                      {
                        and: [
                          {openTime: {lte: time}},
                          {closeTime: {gte: time}},
                        ],
                      },
                      {
                        and: [
                          {openTime: {lte: time}},
                          {closeTime: {lt: '09:00:00'}},
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
    }
    return result
      .map((res: any) => {
        return {
          ...res,
          distance_km: placeDistanceMap[res.id],
        };
      })
      .sort((a: any, b: any) => a.distance_km < b.distance_km);
  }

  async findOpenPlaces(dayOfWeek: number, time: string) {
    if (!dayOfWeek) dayOfWeek = new Date().getDay();
    const places = await this.placeRepository.find({
      include: [
        {
          relation: 'openHours',
          scope: {
            where: {
              and: [
                {dayOfWeek: dayOfWeek},
                {active: true},
                {
                  or: [
                    {
                      and: [{openTime: {lte: time}}, {closeTime: {gte: time}}],
                    },
                    {
                      and: [
                        {openTime: {lte: time}},
                        {closeTime: {lt: '09:00:00'}},
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

  /**
   * checks what opening hours are the same
   * updates or creates the rest
   * @param placeId
   * @param openingHoursList
   */
  async updatePlaceOpeningHours(placeId: string, openingHoursList: any[]) {
    // @here

    async function processLoop(
      finnishDate,
      startDay,
      payload,
      openDurationInMinutes,
    ) {
      let count = 0;
      while (finnishDate > startDay) {
        console.log(
          `Iteration ${count}`,
          finnishDate > startDay,
          finnishDate,
          startDay,
        );
        count++;
        if (count > 200) throw new Error('Reached max iterations ');
        startDay = await createOrUpdatePlaceInstance(
          payload,
          startDay,
          openDurationInMinutes,
        ); // Waits for the async function to complete before continuing
      }
      return true;
    }

    const createOrUpdatePlaceInstance = async (
      payload: any,
      startDay,
      openDurationInMinutes,
    ) => {
      const record = await this.placeInstanceRepository.findOne({
        where: {
          and: [
            {
              placeId: payload.placeId,
              date: startDay,
            },
          ],
        },
      });
      const startDate = new Date(startDay);
      startDate.setHours(Number(payload.openhour.split(':')[0]));
      startDate.setMinutes(Number(payload.openhour.split(':')[1]));
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + openDurationInMinutes);
      const placeInstancePayload: any = {
        dayofweek: payload.dayofweek,
        placeId: payload.placeId,
        date: new Date(startDay),
        active: payload.active,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };
      if (!record) {
        await this.placeInstanceRepository.create(placeInstancePayload);
      } else {
        await this.placeInstanceRepository.updateById(
          record.id,
          placeInstancePayload,
        );
      }
      /*    return new Promise(resolve => setTimeout(() => {
          console.log('Async task done');
          resolve();
      }, 1000)); */

      startDay.setDate(startDay.getDate() + 7);
      return startDay;
    };

    for (const openingHour of openingHoursList) {
      let record = await this.openingHoursRepository.findOne({
        where: {
          dayofweek: openingHour.dayofweek,
          placeId,
        },
      });

      const payload: any = {
        dayofweek: openingHour.dayofweek,
        openhour: openingHour.openhour || openingHour.from || '00:00',
        closehour: openingHour.closehour || openingHour.to || '00:00',
        active: !openingHour.open && !openingHour.active ? false : true,
        placeId: placeId,
      };
      const openDurationInMinutes = this.getOpenDurationInMinutes(
        payload.openhour,
        payload.closehour,
      );
      const startDay = this.getStartDay(payload.dayofweek);
      if (record) {
        await this.openingHoursRepository.updateById(record.id, payload);
      } else {
        record = await this.openingHoursRepository.create(payload);
      }
      // Update next 2 years
      const finnishDate = new Date(startDay);
      finnishDate.setFullYear(finnishDate.getFullYear() + 2);

      // @ts-ignore
      processLoop(finnishDate, startDay, payload, openDurationInMinutes);
    }
  }
  async getTodayOpeningHours(placeId: string) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const dayofweek = new Date().getDay();
    const prevdayofweek = yesterday.getDay();
    let hours: any = new Date().getHours();
    let minutes: any = new Date().getMinutes();
    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;

    const time = [hours, minutes, '00'].join(':');

    const query = `
    SELECT * from openinghours WHERE
      ( openhour > closehour and closehour != '00:00' and (
        (openhour <= $1 and dayofweek = $2 ) or (closehour >= $1 and dayofweek = $3 )))
      OR
      ( ((openhour < closehour and closehour != '00:00' and closehour > $1) OR closehour='00:00') AND openhour <= $1  AND dayofweek = $2 )
      AND deleted = false
      AND placeId = $4
    `;

    const params = [time, dayofweek, prevdayofweek, placeId];

    return this.placeRepository.dataSource.execute(query, params);
  }

  async getTodayActiveHours(placeId: string) {
    /*
    function getEventTimes(schedule) {
      if (schedule.length == 0) {
        const today = new Date();
        const eventDate = new Date(today);
        const startDate = new Date(today);
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 1); // Next event day
        endDate.setHours(0, 0, 0, 0); // Reset time
        startDate.setDate(today.getDate() - 1); // Next event day
        startDate.setHours(0, 0, 0, 0); // Reset time

        return {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        };
      }
      const today = new Date();
      const dayOfWeek = today.getDay(); // Current day of the week (0 = Sunday, 6 = Saturday)
      const eventDay = schedule.dayofweek; // Day of the event (6 = Saturday)

      // Calculate the next event date
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + ((eventDay - dayOfWeek + 7) % 7)); // Next event day
      eventDate.setHours(0, 0, 0, 0); // Reset time

      // Set start time
      const [openHour, openMinute] = (schedule.openhour || '00:00')
        .split(':')
        .map(Number);
      const startTime = new Date(eventDate);
      startTime.setHours(openHour, openMinute, 0, 0);

      // Set end time
      const [closeHour, closeMinute] = (schedule.closehour || '00:00')
        .split(':')
        .map(Number);
      const endTime = new Date(eventDate);
      endTime.setHours(closeHour, closeMinute, 0, 0);

      return {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
      };
    }
    const openingHours = await this.getTodayOpeningHours(placeId);

    return getEventTimes(openingHours?.[0] || openingHours);
    */
    const s = new Date();
    const e = new Date();
    const startDate = new Date(s.setDate(s.getDate() - 1)); // Next event day
    const endDate = new Date(e.setDate(e.getDate() + 1)); // Next event day

    return {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    };
  }

  getOpenDurationInMinutes(openhour, closehour) {
    // Convert HH:mm to minutes since midnight
    const timeToMinutes = time => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const openMinutes = timeToMinutes(openhour);
    const closeMinutes = timeToMinutes(closehour);

    if (openMinutes === closeMinutes) {
      return 24 * 60; // 24 hours in minutes
    } else if (closeMinutes < openMinutes) {
      return 1440 - openMinutes + closeMinutes; // Minutes until midnight + minutes from midnight
    } else {
      return closeMinutes - openMinutes; // Normal case: time difference
    }
  }

  getStartDay(dayofweek) {
    const now = new Date();
    const todayWeekday = now.getDay(); // Get current day of week (0 = Sunday, 6 = Saturday)

    // Calculate days until the next occurrence of the given dayofweek
    const daysUntilNext = (dayofweek - todayWeekday + 7) % 7;
    const nextDate = new Date(now);

    // If it's today, return today at 00:00, otherwise set to the next occurrence
    if (daysUntilNext === 0) {
      nextDate.setHours(0, 0, 0, 0);
    } else {
      nextDate.setDate(now.getDate() + daysUntilNext);
      nextDate.setHours(0, 0, 0, 0);
    }

    return nextDate;
  }

  async getManagerPlacesWhichAreOrWillOpenToday() {
    const now = new Date(); // Get current date in ISO format

    let ongoing = [];
    let ongoingInstancesIds = [];
    const places = await this.placeRepository.findAll();
    const ongoingInstances = await this.placeInstanceRepository.findAll({
      where: {
        and: [
          {placeId: {inq: places.map((p: any) => p.id)}},
          {startDate: {lte: now}}, // PlaceInstance.date >= now
          {endDate: {gte: now}}, // PlaceInstance.endDate <= now
          {deleted: false},
        ],
      },
    });

    ongoing = ongoingInstances; //.filter((place: any) => place?.instances?.[0]);
    ongoingInstancesIds = [...ongoing.map((place: any) => place.id)];

    let upcoming = [];

    const upcomingTodayInstances = await this.placeInstanceRepository.findAll({
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
