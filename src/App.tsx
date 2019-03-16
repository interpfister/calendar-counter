import React, { Component } from "react";
import "./App.css";
import {
  getEvents,
  getCategoryTimes,
  Event,
  duration,
  sumDuration
} from "./calendar";

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
        <p>Event Count: {this.state.events && this.state.events.length}</p>
        <table>
          {this.state.events &&
            getCategoryTimes(this.state.events).map(data => (
              <tr>
                <td>{data.category}</td>
                <td>{data.hours} hours</td>
              </tr>
            ))}
        </table>
        <p>
          Total Categorized Hours (excludes "None"):{" "}
          {sumDuration(
            this.state.events.filter(event => event.categories.length > 0)
          )}
        </p>
        <table>
          {this.state.events.map(event => (
            <tr key={(event as any)["@odata.etag"]}>
              <td>{event.subject}</td>
              <td>{duration(event)}</td>
            </tr>
          ))}
        </table>
      </div>
    );
  }
}

export default App;
