import React from "react";
import io from "socket.io-client";
import moment from "moment";

const SERVER_URL = process.env.REACT_APP_SERVER_UR || 'localhost:5000';
console.log(SERVER_URL);

class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      message: '',
      messages: [],
      serverStatus: 'sphere red'
    };
    this.messageStore = {};

    const socket = io(SERVER_URL);

    socket.on('RECEIVE_MESSAGE', (message) => {
      console.log('RECEIVE_MESSAGE', message);
      addMessage(message);
    });
    socket.on('MISSED_MESSAGES', (messages) => {
      addMessages(messages);
    });
    socket.on('disconnect', () => {
      this.setServerState(false);
    });
    socket.on('connect', () => {
      this.setServerState(true);
    });

    const addMessages = messages => {
      messages = messages.filter(message => this.checkMessageExists(message));
      this.setState({messages: [...messages, ...this.state.messages]});
    };

    const addMessage = message => {
      if (!this.checkMessageExists(message)) {
        return;
      }
      this.setState({messages: [...this.state.messages, message]});
    };

    this.sendMessage = (ev) => {
      ev.preventDefault();
      socket.emit('SEND_MESSAGE', {
        author: this.state.username,
        message: this.state.message
      });
      this.setState({message: ''});
    };
  }

  checkMessageExists (message) {
    const key = stringifyMessage(message);
    if (this.messageStore[key]) {
      // We've already been given this message
      return;
    }
    this.messageStore[key] = true;
    return true;
  }

  setServerState (serverState) {
    console.log(serverState);
    if (!serverState) {
      return this.setState({ serverStatus: 'sphere red' });
    }
    return this.setState({ serverStatus: 'sphere green' });
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-10">
            <div className="card">
              <div className="card-body">
                <div className="card-title inline">Global Chat</div>
                <span className={this.state.serverStatus}></span>
                <hr/>
                <div className="messages">
                  {this.state.messages.map(message => {
                    return (
                      <div>{moment(message.created).format('h:mm:ss')} - {message.author}: {message.message}</div>
                    )
                  })}
                </div>

              </div>
              <div className="card-footer">
                <input type="text" placeholder="Username" value={this.state.username}
                       onChange={ev => this.setState({username: ev.target.value})} className="form-control"/>
                <br/>
                <input type="text" placeholder="Message" className="form-control" value={this.state.message}
                       onChange={ev => this.setState({message: ev.target.value})}/>
                <br/>
                <button onClick={this.sendMessage} className="btn btn-primary form-control">Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Chat;

function stringifyMessage(message) {
  return message.created + message.author;
}