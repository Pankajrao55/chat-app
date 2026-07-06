import { useEffect, useState } from "react";
import { Search, LogOut, BarChart3, MessageCircle } from "lucide-react";
import api from "../utils/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";

const Sidebar = ({ selectedUser, setSelectedUser, onOpenStats, mobileHidden, unreadCounts = {} }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { authUser, logout } = useAuth();
  const { onlineUsers } = useSocket();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users");
        setUsers(data.users);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  const isOnline = (userId) => onlineUsers.includes(userId);

  return (
    <div
      className={`${
        mobileHidden ? "hidden md:flex" : "flex"
      } w-full md:w-[300px] flex-col bg-surface-panel border-r border-white/5 h-full`}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center">
            <MessageCircle className="text-accent-teal" size={16} />
          </div>
          <span className="font-display font-bold text-ink-primary text-sm">
            ChatSphere
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenStats}
            title="My Stats"
            className="p-2 rounded-lg hover:bg-white/5 text-ink-muted hover:text-accent-teal transition"
          >
            <BarChart3 size={17} />
          </button>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 rounded-lg hover:bg-white/5 text-ink-muted hover:text-danger transition"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people..."
            className="w-full bg-surface-elevated border border-white/5 rounded-xl pl-9 pr-3 py-2 text-sm text-ink-primary placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent-teal/30 transition"
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {loading && (
          <p className="text-center text-ink-faint text-xs mt-6">Loading contacts...</p>
        )}
        {!loading && filteredUsers.length === 0 && (
          <p className="text-center text-ink-faint text-xs mt-6">No contacts found</p>
        )}
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl mb-1 transition text-left ${
              selectedUser?._id === user._id
                ? "bg-accent-teal/10 border border-accent-teal/20"
                : "hover:bg-white/5 border border-transparent"
            }`}
          >
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent-teal to-accent-cyan flex items-center justify-center text-surface font-semibold text-sm font-display">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              {isOnline(user._id) && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-online border-2 border-surface-panel animate-breathe" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-primary truncate">
                {user.fullName}
              </p>
              <p className="text-xs text-ink-faint truncate">
                {isOnline(user._id) ? (
                  <span className="text-online">Online</span>
                ) : (
                  "Offline"
                )}
              </p>
            </div>
            {unreadCounts[user._id] > 0 && (
              <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-accent-teal text-surface text-[11px] font-bold flex items-center justify-center">
                {unreadCounts[user._id] > 99 ? "99+" : unreadCounts[user._id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Current user footer */}
      <div className="p-3 border-t border-white/5 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-teal to-accent-cyan flex items-center justify-center text-surface font-display font-semibold text-sm">
          {authUser?.fullName?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-ink-primary font-medium truncate">
            {authUser?.fullName}
          </p>
          <p className="text-xs text-online">Online</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
