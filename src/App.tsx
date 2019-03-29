import React, { Component } from "react";
import "./App.css";
import {
  getEvents,
  getCategoryTimes,
  Event,
  sumDuration,
  getDaySums
} from "./calendar";
import { sum, range } from "lodash";
import moment from "moment";

interface EventsProps {
  events: Event[];
}

interface State extends EventsProps {}

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

class App extends Component {
  state: State = {
    events: []
  };

  async componentDidMount() {
    const events = await getEvents();
    this.setState({
      events
    });
  }

  render() {
    return (
      <div className="App">
        <TableWithHeader header="Total Time" events={this.state.events} />
        <TableWithHeader
          header="Total Free Time"
          events={this.state.events.filter(event => event.showAs !== "busy")}
        />
        <TableWithHeader
          header="Total Free Time Remaining"
          events={this.state.events
            .filter(event => event.showAs !== "busy")
            .filter(event => moment(event.start.dateTime).isAfter(moment()))}
        />
        <div>
          <h3>Events used in analysis:</h3>
          {range(0, 6).map(number =>
            this.state.events
              .filter(
                event => moment(event.start.dateTime).isoWeekday() === number
              )
              .map((event, index) => (
                <li key={index}>
                  {number}: {event.subject}
                </li>
              ))
          )}
        </div>
      </div>
    );
  }
}

export default App;
