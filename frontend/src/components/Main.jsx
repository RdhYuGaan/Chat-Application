import React, { useState, useEffect } from "react";
import Login from "./Login";
import Chat from "./Chat";

const Main = ({ socket }) => {
  const [newUser, setNewUser] = useState("");
  const [user, setUser] = useState({});
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("users", (users) => {
      const messageArr = [];
      for (const { userId, username } of users) {
        const newMessage = { type: "userStatus", userId, username };
        messageArr.push(newMessage);
      }
      setMessages((prevMessages) => [...prevMessages, ...messageArr]);
      setUsers(users);
    });

    socket.on("session", ({ userId, username }) => {
      setUser({ userId, username });
    });

    socket.on("user connected", ({ userId, username }) => {
      const newMessage = { type: "userStatus", userId, username };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on("new message", ({ userId, username, message }) => {
      const newMessage = {
        type: "message",
        userId: userId,
        username,
        message,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off("users");
      socket.off("session");
      socket.off("user connected");
      socket.off("new message");
    };
  }, [socket]);

  const handleChange = ({ currentTarget: input }) => {
    setNewUser(input.value);
  };

  const logNewUser = () => {
    socket.auth = { username: newUser };
    socket.connect();
  };

  const sendMessage = () => {
    if (!message.trim()) return; // Prevent empty messages
    socket.emit("new message", message);
    const newMessage = {
      type: "message",
      userId: user.userId,
      username: user.username,
      message,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessage(""); // Clear input field
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-900">
      {user.userId ? (
        <Chat
          user={user}
          message={message}
          messages={messages}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      ) : (
        <Login newUser={newUser} handleChange={handleChange} logNewUser={logNewUser} />
      )}
    </div>
  );
};

export default Main;
