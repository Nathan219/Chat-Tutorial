import React from "react";
import io from "socket.io-client";
import moment from "moment";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'localhost:5000';
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

    /**
     * Adds multiple messages to the beginning of the list.  Used when loading missed messages
     *
     * @param {Object[]} messages
     * @param {Object} messages.author
     * @param {Object} messages.created
     * @param {Object} messages.message
     */
    const addMessages = messages => {
      messages = messages.filter(message => this.isUniqueMessage(message));
      this.setState({messages: [...messages, ...this.state.messages]});
    };

    /**
     * Adds a single message to the list
     *
     * @param {Object} message
     * @param {Object} message.author
     * @param {Object} message.created
     * @param {Object} message.message
     */
    const addMessage = message => {
      if (!this.isUniqueMessage(message)) {
        return;
      }
      this.setState({messages: [...this.state.messages, message]});
    };

    /**
     * Send the current message to the socket server
     * @param ev
     */
    this.sendMessage = (ev) => {
      ev.preventDefault();
      socket.emit('SEND_MESSAGE', {
        author: this.state.username,
        message: this.state.message
      });
      this.setState({message: ''});
    };
  }

  /**
   * Checks the store of messages to see if the one we're trying to add has already been added.
   * If it hasn't been added yet, it's added to it.  Good for use in an Array.filter function
   *
   * @param {Object} message
   * @param {Object} message.author
   * @param {Object} message.created
   * @param {Object} message.message
   *
   * @returns {Boolean} True if the message didn't exist in the store, false if it did.
   */
  isUniqueMessage (message) {
    const key = stringifyMessage(message);
    if (this.messageStore[key]) {
      // We've already been given this message
      return false;
    }
    this.messageStore[key] = true;
    return true;
  }

  setServerState (serverState) {
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