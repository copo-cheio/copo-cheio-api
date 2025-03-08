/* @injectable({scope: BindingScope.TRANSIENT})
export class InstanceService {
  constructor(/* Add @inject to inject parameters *) {}

  /*
   * Add service methods here
   *
}
 */
import {repository} from '@loopback/repository';
import moment from 'moment';
import {
  EventInstanceRepository,
  EventRepository,
  OpeningHoursRepository,
  PlaceRepository,
} from '../repositories';
import {PlaceInstanceRepository} from '../repositories/v1/place-instance.repository';

export class InstanceService {
  constructor(
    @repository('PlaceRepository') private placeRepo: PlaceRepository,
    @repository('OpeningHoursRepository')
    private openingHoursRepo: OpeningHoursRepository,
    @repository('PlaceInstanceRepository')
    private placeInstanceRepo: PlaceInstanceRepository,

    @repository('EventRepository') private eventRepo: EventRepository,
    @repository('EventInstanceRepository')
    private eventInstanceRepo: EventInstanceRepository,
  ) {}

  async syncPlaceInstances(placeId: string, effectiveDate: Date) {
    const openingHours = await this.openingHoursRepo.find({where: {placeId}});
    const placeInstances = await this.placeInstanceRepo.find({
      where: {placeId},
    });

    // Map openingHours to a dictionary for easier comparison
    const newHoursMap = new Map<number, {open: string; close: string}>();
    for (const oh of openingHours) {
      newHoursMap.set(oh.dayofweek, {open: oh.openhour, close: oh.closehour});
    }

    // Step 1: Update existing PlaceInstances
    for (const instance of placeInstances) {
      const newHours = newHoursMap.get(instance.dayofweek);

      if (newHours) {
        // If hours changed, update
        const newStart = moment(instance.date)
          .set({
            hour: parseInt(newHours.open.split(':')[0]),
            minute: parseInt(newHours.open.split(':')[1]),
          })
          .toDate();

        const newEnd = moment(instance.date)
          .set({
            hour: parseInt(newHours.close.split(':')[0]),
            minute: parseInt(newHours.close.split(':')[1]),
          })
          .toDate();

        if (
          instance.startDate.getTime() !== newStart.getTime() ||
          instance.endDate.getTime() !== newEnd.getTime()
        ) {
          instance.startDate = newStart;
          instance.endDate = newEnd;
          await this.placeInstanceRepo.update(instance);
        }
      } else {
        // Step 2: Remove instances if no longer open
        await this.placeInstanceRepo.delete(instance);
      }
    }

    // Step 3: Add new instances for added opening days
    for (const [dayOfWeek, hours] of newHoursMap) {
      const existingInstances = placeInstances.some(
        pi => pi.dayofweek === dayOfWeek,
      );

      if (!existingInstances) {
        const today = moment(effectiveDate);
        for (let i = 0; i < 100; i++) {
          const instanceDate = today
            .clone()
            .add(i, 'weeks')
            .day(dayOfWeek)
            .startOf('day')
            .toDate();
          const startDate = moment(instanceDate)
            .set({
              hour: parseInt(hours.open.split(':')[0]),
              minute: parseInt(hours.open.split(':')[1]),
            })
            .toDate();

          const endDate = moment(instanceDate)
            .set({
              hour: parseInt(hours.close.split(':')[0]),
              minute: parseInt(hours.close.split(':')[1]),
            })
            .toDate();

          await this.placeInstanceRepo.create({
            dayofweek: dayOfWeek,
            date: instanceDate,
            startDate,
            endDate,
            active: true,
            placeId,
          });
        }
      }
    }
  }

  async generateEventInstances(eventId: string) {
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new Error('Event not found');

    const {placeId, recurrenceType, startDate, endDate, recurrenceEndDate} =
      event;
    const place: any = await this.placeRepo.findById(event.placeId, {
      include: [{relation: 'address'}],
    });
    const today = moment().startOf('day'); // Get today at 00:00:00

    // Fetch only future event instances for this place & recurrence type
    const existingInstances = await this.eventInstanceRepo.find({
      where: {
        placeId,
        eventId,
        date: {gt: today.toDate()}, // Only get instances in the future
      },
    });

    const datesToGenerate: Date[] = [];
    const instanceStartDate = moment.max(moment(startDate), today); // Ensure we start from today or later

    if (recurrenceType === 'daily') {
      // Generate next 100 days but exclude existing ones
      for (let i = 0; i < 100; i++) {
        const instanceDate = instanceStartDate
          .clone()
          .add(i, 'days')
          .startOf('day')
          .toDate();

        if (
          !existingInstances.some(ei =>
            moment(ei.date).isSame(instanceDate, 'day'),
          )
        ) {
          datesToGenerate.push(instanceDate);
        }
      }
    } else if (recurrenceType === 'weekly') {
      const weekday = moment(startDate).day(); // Get day of the week (0 = Sunday, 1 = Monday, etc.)

      for (let i = 0; i < 100; i++) {
        const instanceDate = instanceStartDate
          .clone()
          .add(i * 7, 'days')
          .startOf('day')
          .toDate();

        if (
          !existingInstances.some(ei =>
            moment(ei.date).isSame(instanceDate, 'day'),
          )
        ) {
          datesToGenerate.push(instanceDate);
        }
      }
    } else if (recurrenceType === 'none') {
      // Single event, only create if not already exists in the future
      const eventDate = moment(startDate).startOf('day').toDate();

      if (
        moment(eventDate).isAfter(today) &&
        !existingInstances.some(ei => moment(ei.date).isSame(eventDate, 'day'))
      ) {
        datesToGenerate.push(eventDate);
      }
    }

    // Create new event instances only for future dates
    for (const date of datesToGenerate) {
      await this.eventInstanceRepo.create({
        latitude: place.address.latitude,
        longitude: place.address.longitude,
        date,
        startDate: moment(date)
          .set({
            hour: moment(startDate).hour(),
            minute: moment(startDate).minute(),
          })
          .toDate(),
        endDate: moment(date)
          .set({
            hour: moment(endDate).hour(),
            minute: moment(endDate).minute(),
          })
          .toDate(),
        placeId,
        eventId,
      });
    }

    return `Created ${datesToGenerate.length} new future event instances`;
  }
}
/* 🔹 How It Works
Fetches all OpeningHours for a place.
Checks for changes against PlaceInstance records.
Updates existing instances if hours changed.
Deletes instances for days that are no longer open.
Creates new instances for new opening days for the next 100 weeks.


🔹 Example Scenarios
✅ Scenario 1: Change Monday closing time from 22:00 to 21:00
Finds all PlaceInstance records for Monday.
Updates their endDate to 21:00.
✅ Scenario 2: Remove Sundays from schedule
Finds all PlaceInstance records for Sundays.
Deletes them.
✅ Scenario 3: Add Saturdays (22:00 - 04:00 Sunday)
Creates 100 new PlaceInstance records for Saturdays.

 */

/*
🔹 How It Works
Fetches the event by eventId.
Retrieves existing event instances for that placeId.
Determines missing event instances based on recurrenceType:
Daily → Generates for next 100 days, skipping existing ones.
Weekly → Generates for next 100 weeks, ensuring no duplicate weekdays.
Single event → Creates only if no event of that type exists on that date.
Creates only the missing EventInstance records.
🔹 Usage Example
Call generateEventInstances(eventId) after creating a new event:

typescript
Copy
Edit
await eventService.generateEventInstances("event-id");
🔹 Example Scenarios
✅ Scenario 1: Creating a daily event at Place X
Creates 100 instances but skips the first 50 if they already exist.
Ensures no overlapping daily events at placeId = X.
✅ Scenario 2: Creating a weekly event on Mondays
Checks if placeId = X already has a Monday event.
If yes, skips Mondays where an event exists.
Otherwise, creates 100 weekly instances.
✅ Scenario 3: Creating a one-time event on 10th March 2025
Checks if another single event exists at placeId = X on 10/03/2025.
If not, creates one instance.
🔹 Next Steps
Integrate with the controller to call generateEventInstances(eventId) after event creation.
Optimize bulk insert if handling large datasets.
Extend to support biweekly events if needed.
Would you like any modifications? 🚀
*/
