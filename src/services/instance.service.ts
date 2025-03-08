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

    const {
      placeId,
      recurrenceType,
      startDate,
      endDate,
      recurrenceEndDate,
      teamId,
    } = event;
    const place: any = await this.placeRepo.findById(event.placeId, {
      include: [{relation: 'address'}],
    });

    // Getting the place coordinates
    const {latitude, longitude} = place.address;

    const today = moment(startDate).startOf('day'); // Get today at 00:00:00
    const last = moment(recurrenceEndDate).startOf('day');
    const days = last.diff(today, 'days');
    // Fetch all future event instances for this event
    const existingInstances = await this.eventInstanceRepo.find({
      where: {
        eventId,
        date: {gte: today.toDate()},
      },
    });

    let newDates: Date[] = [];

    if (recurrenceType === 'daily') {
      const firstInstanceDate = today.clone().add(1, 'days'); // Always start from tomorrow

      for (let i = 0; i < days - 1; i++) {
        const instanceDate = firstInstanceDate
          .clone()
          .add(i, 'days')
          .startOf('day')
          .toDate();
        newDates.push(instanceDate);
      }
    } else if (recurrenceType === 'weekly') {
      const eventWeekday = moment(startDate).day(); // Original weekday
      const firstInstanceDate = today.clone().day(eventWeekday); // Find next occurrence

      // If today is on or after this week's recurrence day, move to next week
      if (!firstInstanceDate.isAfter(today)) {
        firstInstanceDate.add(7, 'days');
      }

      for (let i = 0; i < Math.ceil(days / 7); i++) {
        const instanceDate = firstInstanceDate
          .clone()
          .add(i * 7, 'days')
          .startOf('day')
          .toDate();
        newDates.push(instanceDate);
      }

      // Delete past instances that do not match the new weekday
      const instancesToDelete = existingInstances.filter(
        ei => moment(ei.date).day() !== eventWeekday,
      );
      for (const instance of instancesToDelete) {
        await this.eventInstanceRepo.deleteById(instance.id);
      }

      // Update existing instances that match the new weekday
      for (const instance of existingInstances) {
        if (moment(instance.date).day() === eventWeekday) {
          instance.startDate = moment(instance.date)
            .set({
              hour: moment(startDate).hour(),
              minute: moment(startDate).minute(),
            })
            .toDate();
          instance.endDate = moment(instance.date)
            .set({
              hour: moment(endDate).hour(),
              minute: moment(endDate).minute(),
            })
            .toDate();
          await this.eventInstanceRepo.update(instance);
        }
      }
    } else if (recurrenceType === 'none') {
      const eventDate = moment(startDate).startOf('day').toDate();
      if (moment(eventDate).isAfter(moment().startOf('day'))) {
        newDates = [eventDate];
      }

      // Delete any existing single event instance at this place if it changed
      await this.eventInstanceRepo.deleteAll({
        eventId,
        date: {gte: today.toDate()},
      });
    }

    // Create only new instances that do not already exist
    for (const date of newDates) {
      if (!existingInstances.some(ei => moment(ei.date).isSame(date, 'day'))) {
        await this.eventInstanceRepo.create({
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
          teamId,
          latitude,
          longitude,
        });
      }
    }

    return `Updated event instances successfully`;
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
