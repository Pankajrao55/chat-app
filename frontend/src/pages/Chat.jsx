import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import StatsModal from "../components/StatsModal.jsx";
import api from "../utils/axios.js";
import { useSocket } from "../context/SocketContext.jsx";

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const { socket } = useSocket();

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await api.get("/messages/unread-counts");
        setUnreadCounts(data.unreadCounts);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUnread();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      // If that conversation is already open, ChatWindow handles read-state itself
      setSelectedUser((current) => {
        if (current?._id === message.sender) return current;
        setUnreadCounts((prev) => ({
          ...prev,
          [message.sender]: (prev[message.sender] || 0) + 1,
        }));
        return current;
      });
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setUnreadCounts((prev) => ({ ...prev, [user._id]: 0 }));
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-surface">
      <Sidebar
        selectedUser={selectedUser}
        setSelectedUser={handleSelectUser}
        onOpenStats={() => setShowStats(true)}
        mobileHidden={!!selectedUser}
        unreadCounts={unreadCounts}
      />
      <div className={`${selectedUser ? "flex" : "hidden md:flex"} flex-1`}>
        <ChatWindow selectedUser={selectedUser} onBack={() => setSelectedUser(null)} />
      </div>
      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
    </div>
  );
};

export default Chat;
