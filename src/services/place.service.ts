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
    // let eventId = "7b8ae7e3-37b0-4c19-b1ab-476426afc730";
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
    for (const openingHour of openingHoursList) {
      const record = await this.openingHoursRepository.findOne({
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
      if (record) {
        await this.openingHoursRepository.updateById(record.id, payload);
      } else {
        await this.openingHoursRepository.create(payload);
      }
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
}
