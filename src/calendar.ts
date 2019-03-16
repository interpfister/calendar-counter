import { getUrl } from "./api";
import moment from "moment";
import { sum, uniq, range } from "lodash";

interface DateTime {
  dateTime: string;
  timeZone: string;
}

export interface Event {
  isAllDay: boolean;
  subject: string;
  showAs: string;
  categories: string[];
  start: DateTime;
  end: DateTime;
}

const getStartDate = () => {
  const currentDayNumber = moment().isoWeekday();
  const weekStartDay = 1;

  if (currentDayNumber < 6) {
    // if it's still the current workweek, start on Monday
    return moment()
      .isoWeekday(weekStartDay)
      .startOf("day");
  } else {
    // otherwise, give me *next week's* instance of that same day
    return moment()
      .add(1, "weeks")
      .isoWeekday(weekStartDay)
      .startOf("day");
  }
};

export const getEvents = async () => {
  const startDate = getStartDate();
  const events = (await getUrl(
    `https://graph.microsoft.com/v1.0/me/calendarview?$top=200&startdatetime=${startDate.toISOString()}&enddatetime=${startDate
      .add(5, "days") //add five days to capture through midnight Friday
      .toISOString()}`
  )) as Event[];
  const filteredEvents = events.filter(event => !event.isAllDay);
  console.log(filteredEvents);
  return filteredEvents;
};

export const duration = (event: Event) => {
  return moment(event.end.dateTime).diff(
    moment(event.start.dateTime),
    "hours",
    true
  );
};

export const sumDuration = (events: Event[]) => sum(events.map(duration));

export const freeTimeRemaining = (events: Event[]) => {
  const busyEventsAfterNow = events
    .filter(event => event.showAs === "busy")
    .filter(event => moment(event.start.dateTime).isAfter(moment()));
  const remainingBusyTime = sumDuration(busyEventsAfterNow);
  //const totalTimeRemaining =
};

export const getCategoryTimes = (events: Event[]) => {
  const categories: string[] = uniq(
    events.map(event =>
      event.categories.length > 0 ? event.categories[0] : "None"
    )
  );
  const sums = categories.map(category => {
    const categoryEvents = events.filter(event =>
      category === "None"
        ? event.categories.length <= 0
        : event.categories[0] === category
    );
    const hoursByDay = range(1, 6).map((number: Number) => {
      return {
        number,
        hours: sumDuration(
          categoryEvents.filter(
            event => moment(event.start.dateTime).isoWeekday() === number
          )
        )
      };
    });

    return {
      category,
      hoursByDay
    };
  });
  return sums;
};
