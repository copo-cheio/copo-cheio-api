export const getDifferenceInDateTimeString = (s: any, e: any) => {
  let mins = 0;
  s = s.split(':').map(t => Number(t));
  e = e.split(':').map(t => Number(t));

  s = s[0] * 60 + s[1];
  e = e[0] * 60 + e[1];

  if (s == e) {
    mins = 24 * 60;
  } else if (s < e) {
    mins = e - s;
  } else {
    mins = 24 * 60 - s + e;
  }
  return {startMinutes: s, mins};
};
export const eventDateDifferenceInMinutes = (date: any = {}) => {
  let mins = 0;
  let startMinutes = 0;
  let jump = 0;
  if (date?.frequency == 'weekly') {
    jump = 24 * 60 * 7;
    const diff = getDifferenceInDateTimeString(date.start, date.end);
    mins = diff.mins;
    startMinutes = diff.startMinutes;
  } else if (date.frequency == 'none') {
    jump = -1;
    // @ts-ignore
    const diff: any = Math.abs(new Date(date.end) - new Date(date.start));
    mins = diff / 60 / 1000;

    startMinutes =
      new Date(date.start).getHours() * 60 + new Date(date.start).getMinutes();
  } else if (date.frequency == 'daily') {
    jump = 24 * 60;
    const diff = getDifferenceInDateTimeString(date.start, date.end);
    mins = diff.mins;
    startMinutes = diff.startMinutes;
  }
  return {mins, jump, startMinutes};
};

export function getNextWeekday(weekday) {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  const daysToAdd = (weekday - currentDay + 7) % 7 || 7; // Ensure it's always next week
  const nextDate = new Date();
  nextDate.setDate(today.getDate() + daysToAdd);

  return nextDate;
}
export function getNextDay() {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  const nextDate = new Date();
  nextDate.setDate(today.getDate() + 1);

  return nextDate;
}

export function extractEventDate(date: any = {}) {
  const {mins, jump, startMinutes} = eventDateDifferenceInMinutes(date);
  let start: any;
  let end: any;
  let day: any;
  const jumps: any = [];
  if (date.frequency == 'weekly') {
    start = getNextWeekday(date.weekday);
    start.setHours(0, 0, 0);
    start.setMinutes(startMinutes);
    end = addMinutesToDate(
      new Date(getNextWeekday(date.weekday).setHours(0, 0, 0)),
      startMinutes + mins,
    );

    day = getNextWeekday(date.weekday);
    day.setHours(0, 0, 0);

    const jumpMap = {
      start: new Date(start),
      end: new Date(end),
      date: new Date(day),
    };
    for (let i = 1; i < 10; i++) {
      console.log(jumpMap);
      jumps.push({
        start: new Date(jumpMap.start).toISOString(),
        end: new Date(jumpMap.end).toISOString(),
        date: new Date(jumpMap.date).toISOString(),
      });
      jumpMap.start = addMinutesToDate(jumpMap.start, i * 7 * 24 * 60);
      jumpMap.end = addMinutesToDate(jumpMap.end, i * 7 * 24 * 60);
      jumpMap.date = addMinutesToDate(jumpMap.date, i * 7 * 24 * 60);
    }
  } else if (date.frequency == 'daily') {
    start = new Date();
    start.setHours(0, 0, 0);
    start.setMinutes(startMinutes);
    end = addMinutesToDate(new Date(start.toISOstring()), mins);
    day = new Date(start);
    day.setHours(0, 0, 0);
    start = addMinutesToDate(day, 24 * 60);
    end = addMinutesToDate(day, 24 * 60);
    const jumpMap = {
      start: new Date(start.toISOString()),
      end: new Date(start.toISOString()),
      date: new Date(day.toISOString()),
    };
    for (let i = 1; i < 10; i++) {
      jumps.push({
        start: jumpMap.start.toISOString(),
        end: jumpMap.end.toISOString(),
        date: jumpMap.date.toISOString(),
      });
      jumpMap.start = addMinutesToDate(jumpMap.start, i * 7 * 24 * 60);

      jumpMap.end = addMinutesToDate(jumpMap.end, i * 7 * 24 * 60);
      jumpMap.date = addMinutesToDate(jumpMap.date, i * 7 * 24 * 60);
    }
  } else {
    start = new Date(date.start);
    start.setSeconds(0);
    end = new Date(date.end);
    end.setSeconds(0);
    day = new Date(date.start);
    day.setHours(0, 0, 0);
    day.setSeconds(0);
    jumps.push({
      start,
      end,
      date: day,
    });
  }

  return {
    start,
    end,
    date: day,
    jumps,
  };
}

export function addMinutesToDate(date: any, minutes: number) {
  date = new Date();
  return new Date(date.getTime() + minutes * 60000);
}

export function getNextSameWeekdayOrThisWeek(dateString: string): Date {
  const givenDate = new Date(dateString);
  const targetWeekday = givenDate.getDay(); // Get weekday of the given date (0 = Sunday, 6 = Saturday)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of the day

  const daysUntilNext = (targetWeekday - today.getDay() + 7) % 7;

  // If the target weekday is later this week, return that date, otherwise return next week's
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + (daysUntilNext || 7));
  nextDate.setHours(givenDate.getHours(), givenDate.getMinutes(), 0, 0);

  return nextDate;
}

export function getNextYearDate(years = 2) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize time to midnight
  const endDate = new Date(today);
  endDate.setFullYear(today.getFullYear() + years); // Set end date (2 years ahead)
  return endDate;
}
