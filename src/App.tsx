import React, { Component } from "react";
import "./App.css";
import {
  getEvents,
  getCategoryTimes,
  Event,
  duration,
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
      <tr>
        <td>{data.category}</td>
        {data.hoursByDay.map((day: any) => (
          <td>{day.hours}</td>
        ))}
        <td>{sum(data.hoursByDay.map((day: any) => day.hours))}</td>
      </tr>
    ))}
    <tr>
      <td>Total</td>
      {getDaySums(props.events).map((day: any) => (
        <td>{day.hours}</td>
      ))}
      <td>
        {sumDuration(props.events.filter(event => event.categories.length > 0))}
      </td>
    </tr>
  </table>
);

const TableWithTotal = (props: EventsProps) => (
  <div>
    <p>
      Total Categorized Hours (excludes "None"):{" "}
      {sumDuration(props.events.filter(event => event.categories.length > 0))}
    </p>
    <CategoryTable events={props.events} />
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
        <h3>All Hours:</h3>
        <TableWithTotal events={this.state.events} />
        <hr />
        <h3>Total Free Time</h3>
        <TableWithTotal
          events={this.state.events.filter(event => event.showAs !== "busy")}
        />
        <hr />
        <div>
          <h3>Events used in analysis:</h3>
          {range(0, 6).map(number =>
            this.state.events
              .filter(
                event => moment(event.start.dateTime).isoWeekday() === number
              )
              .map(event => (
                <li>
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
