import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext(null);

const SOCKET_URL =
  window.location.hostname === "localhost" ? "http://localhost:5000" : "/";

export const SocketProvider = ({ children }) => {
  const { authUser } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!authUser) {
      setSocket((prev) => {
        if (prev) prev.disconnect();
        return null;
      });
      return;
    }

    const newSocket = io(SOCKET_URL, {
      query: { userId: authUser._id },
      withCredentials: true,
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [authUser?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
