import React, { Component } from "react";
import "./App.css";
import {
  getEvents,
  getCategoryTimes,
  Event,
  sumDuration,
  getDaySums,
  getStartDate
} from "./calendar";
import { sum, range } from "lodash";
import moment from "moment";

interface EventsProps {
  events: Event[];
}

interface State extends EventsProps {
  weeksToAdd: number;
  isLoading: boolean;
}

const CategoryTable = (props: EventsProps) => (
  <table>
    <tbody>
      <tr>
        <th>Category</th>
        <th>M</th>
        <th>T</th>
        <th>W</th>
        <th>R</th>
        <th>F</th>
        <th>Sum</th>
      </tr>
      {getCategoryTimes(props.events).map(data => (
        <tr key={data.category}>
          <td>{data.category}</td>
          {data.hoursByDay.map((day: any, index: number) => (
            <td key={index}>{day.hours}</td>
          ))}
          <td>{sum(data.hoursByDay.map((day: any) => day.hours))}</td>
        </tr>
      ))}
      <tr>
        <td>Total excluding 'None'</td>
        {getDaySums(props.events).map((day: any, index: number) => (
          <td key={index}>{day.hours}</td>
        ))}
        <td>
          {sumDuration(
            props.events.filter(event => event.categories.length > 0)
          )}
        </td>
      </tr>
    </tbody>
  </table>
);

interface TableWithHeaderProps extends EventsProps {
  header: string;
}

const TableWithHeader = (props: TableWithHeaderProps) => (
  <div>
    <h3>{props.header}:</h3>
    <CategoryTable events={props.events} />
    <hr />
  </div>
);

const EventsArea = (props: EventsProps) => (
  <div>
    <TableWithHeader header="Total Time" events={props.events} />
    <TableWithHeader
      header="Total Free Time"
      events={props.events.filter(event => event.showAs !== "busy")}
    />
    <TableWithHeader
      header="Total Free Time Remaining"
      events={props.events
        .filter(event => event.showAs !== "busy")
        .filter(event => moment(event.start.dateTime).isAfter(moment()))}
    />
    <div>
      <h3>Events used in analysis:</h3>
      {range(0, 6).map(number =>
        props.events
          .filter(event => moment(event.start.dateTime).isoWeekday() === number)
          .map((event, index) => (
            <li key={index}>
              {number}: {event.subject}
            </li>
          ))
      )}
    </div>
  </div>
);

class App extends Component {
  state: State = {
    events: [],
    weeksToAdd: 0,
    isLoading: false
  };

  async updateEvents() {
    this.setState(
      {
        isLoading: true
      },
      async () => {
        const events = await getEvents(this.state.weeksToAdd);
        this.setState({
          events,
          isLoading: false
        });
      }
    );
  }

  createUpdateWeekFunc(weeksToAdd: number) {
    return () => {
      const newWeeksToAdd = this.state.weeksToAdd + weeksToAdd;
      this.setState(
        {
          weeksToAdd: newWeeksToAdd
        },
        this.updateEvents
      );
    };
  }

  async componentDidMount() {
    this.updateEvents();
  }

  render() {
    return (
      <div className="App">
        <h1>
          Week of {getStartDate(this.state.weeksToAdd).format("MM/DD/YYYY")}
        </h1>
        <div>
          <button onClick={this.createUpdateWeekFunc(-1)}>Prev</button>
          <button onClick={this.createUpdateWeekFunc(1)}>Next</button>
        </div>
        {!this.state.isLoading ? (
          <EventsArea events={this.state.events} />
        ) : (
          <div>Loading...</div>
        )}
      </div>
    );
  }
}

export default App;
