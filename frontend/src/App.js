import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
// eslint-disable-next-line no-unused-vars
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";
import { DateTime } from "luxon";
import Axios from "axios";
import "./App.css";

function App() {
  const [usernameInput, setUsernameInput] = useState(null);
  const [username, setUsername] = useState(null);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [messageHistory, setMessageHistory] = useState([]);

  const { sendMessage, lastMessage } = useWebSocket(
    process.env.REACT_APP_WEBSOCKET_API_URL
  );

  const handleUsernameChange = (value) => {
    setUsernameInput(value);
  };

  const handleMessageChange = (value) => {
    setCurrentMessage(value);
  };

  const handleUsernameSend = () => {
    setUsername(usernameInput);
  };

  const handleSendMessage = () => {
    sendMessage(
      JSON.stringify({
        action: "sendmessage",
        message: currentMessage,
        sender: username,
      })
    );

    setCurrentMessage("");
  };

  const getPreviousMessages = async () => {
    const url = process.env.REACT_APP_MESSAGE_API_URL + "/messages";

    await Axios.get(url).then((response) => {
      setMessageHistory(response.data);
    });
  };

  useEffect(() => {
    getPreviousMessages();
  }, []);

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(JSON.parse(lastMessage.data)));
    }
  }, [lastMessage, setMessageHistory]);

  return (
    <div className="background">
      <div className="container">
        {!username && (
          <MessageInput
            className="form"
            attachButton={false}
            placeholder="Enter your username"
            value={usernameInput}
            onChange={handleUsernameChange}
            onSend={handleUsernameSend}
          />
        )}
        {username && (
          <MainContainer className="paper">
            <ChatContainer>
              <MessageList>
                {messageHistory.map((data) => (
                  <Message
                    key={data.id}
                    model={{
                      message: data.message,
                      direction:
                        data.sentBy !== username.toLowerCase()
                          ? "incoming"
                          : "outgoing",
                      position: "single",
                    }}
                  >
                    <Message.Footer
                      sender={data.sentBy}
                      sentTime={DateTime.fromMillis(
                        data.sentAt
                      ).toLocaleString()}
                    />
                  </Message>
                ))}
              </MessageList>
              <MessageInput
                attachButton={false}
                placeholder="Type message here"
                value={currentMessage}
                onChange={handleMessageChange}
                onSend={handleSendMessage}
              />
            </ChatContainer>
          </MainContainer>
        )}
      </div>
    </div>
  );
}

export default App;
