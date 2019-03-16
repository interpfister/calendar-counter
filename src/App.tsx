import React, { Component } from "react";
import "./App.css";
import {
  getEvents,
  getCategoryTimes,
  Event,
  duration,
  sumDuration
} from "./calendar";
import { sum, range } from "lodash";
import moment from "moment";

interface State {
  events: Event[];
}
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
        <p>
          Total Categorized Hours (excludes "None"):{" "}
          {sumDuration(
            this.state.events.filter(event => event.categories.length > 0)
          )}
        </p>
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
          {getCategoryTimes(this.state.events).map(data => (
            <tr>
              <td>{data.category}</td>
              {data.hoursByDay.map((day: any) => (
                <td>{day.hours}</td>
              ))}
              <td>{sum(data.hoursByDay.map((day: any) => day.hours))}</td>
            </tr>
          ))}
        </table>
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
    );
  }
}

export default App;
