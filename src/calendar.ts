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

export const getStartDate = (weeksToAdd: number) => {
  const weekStartDay = 1;
  return moment()
    .add(weeksToAdd, "weeks")
    .isoWeekday(weekStartDay)
    .startOf("day");
};

export const getEvents = async (weeksToAdd: number) => {
  const startDate = getStartDate(weeksToAdd);
  const events = (await getUrl(
    `https://graph.microsoft.com/v1.0/me/calendarview?$top=200&startdatetime=${startDate.toISOString()}&enddatetime=${startDate
      .add(5, "days") //add five days to capture through midnight Friday
      .toISOString()}`
  )) as Event[];
  const filteredEvents = events.filter(event => !event.isAllDay);
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

export const getCategoryTimes = (events: Event[]) => {
  const categories: string[] = uniq(
    events
      .filter(event => event.categories.length > 0)
      .map(event => event.categories[0])
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
            event =>
              moment(event.start.dateTime)
                .add(moment().utcOffset(), "minutes") //Adjust to browser local timezone
                .isoWeekday() === number
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

export const getDaySums = (events: Event[]) => {
  const eventsWithCategory = events.filter(
    event => event.categories.length > 0
  );

  return range(1, 6).map((number: Number) => {
    return {
      number,
      hours: sumDuration(
        eventsWithCategory.filter(
          event => moment(event.start.dateTime).isoWeekday() === number
        )
      )
    };
  });
};
