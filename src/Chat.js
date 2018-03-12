import React from "react";
import io from "socket.io-client";
const SERVER_URL = process.env.SERVER_URL || 'localhost:5000'

class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      message: '',
      messages: [],
      serverStatus: 'sphere red'
    };
    const messageStore = {};

    const socket = io(SERVER_URL);

    socket.on('RECEIVE_MESSAGE', (data) => {
      addMessage(data);
    });
    socket.on('disconnect', () => {
      this.setServerState(false);
    });
    socket.on('connect', () => {
      this.setServerState(true);
    });

    const addMessage = data => {
      console.log(data);
      if (messageStore[stringifyMessage(data)]) {
        // We've already been given this message
        return;
      }
      messageStore[stringifyMessage(data)] = true;
      this.setState({messages: [...this.state.messages, data].sort((a, b) => {
        return a.created > b.created
      })});
      console.log(this.state.messages);
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
                      <div>{new Date(message.created).getTime()} - {message.author}: {message.message}</div>
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