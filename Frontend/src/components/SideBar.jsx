import React, { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa6";
import { CiLogout, CiHome } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Baseurl } from "../../services api/baseurl";
import { logout } from "../redux/fetaures/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { reomveSelectedUser, setSelectedUser } from "../redux/fetaures/userSlice";

export const SideBar = ({ socket }) => {
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const [userdata, setUserdata] = useState([]);
  const [search, setSearch] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]); // State for online users

  // Fetch all users from the API
  const fetchUsers = async () => {
    try {
      const resp = await axios.get(`${Baseurl}/api/Auth/getuser`);
      setUserdata(resp.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  // Handle searching/filtering users
  const handleSearch = (value) => {
    setSearch(value);
  };

  // Filter users to exclude the current user and apply the search filter
  const filteredUsers = userdata
    .filter((curUser) => curUser._id !== user._id)
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));

  // Fetch users when the component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle user logout
  const handleLogout = () => {
    dispatch(logout());
    if (socket) {
      socket.disconnect();
    }
    dispatch(reomveSelectedUser());
    navigate("/login");
  };

  // Handle user selection
  const handleUserSelect = (selectedUser) => {
    dispatch(setSelectedUser(selectedUser));
    setSidebarOpen(false);
  };

  // Listen for online users from the socket
  useEffect(() => {
    if (socket) {
      socket.on("getUsers", (users) => {
        setOnlineUsers(users);
      });
    }

    return () => {
      if (socket) {
        socket.off("getUsers");
      }
    };
  }, [socket]);

  // Check if a user is online
  const isUserOnline = (userId) => {
    return onlineUsers.some((onlineUser) => onlineUser.userId === userId);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-0 text-[12px] z-50 p-2 bg-[#F0F2F5] text-black rounded-lg"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
      >
        <FaBars />
      </button>

      {/* Sidebar */}
      <div
        className={`sidebar fixed top-0 left-0 max-h-screen bg-[#FFFFFF] z-10 shadow-lg transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:static md:translate-x-0 md:block w-70 overflow-y-scroll h-screen py-6 px-4`}
      >
       <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between md:mt-0 mt-11">
  {/* Search Bar */}
  <input
    value={search}
    onChange={(event) => handleSearch(event.target.value)}
    type="text"
    placeholder="Search users..."
    className="w-full md:w-2/3 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />

  {/* Dropdown for Logout */}
  <div className="relative font-[sans-serif] mt-4 md:mt-0 md:ml-4">
    <button
      type="button"
      className="flex items-center rounded-full text-[#333] text-sm outline-none"
      onClick={() => setDropdownOpen(!isDropdownOpen)}
    >
      <img
        src={user?.profile}
        className="w-9 h-9 rounded-full"
        alt="Profile"
      />
    </button>

    <ul
      className={`absolute right-0 mt-2 shadow-lg bg-white py-2 z-[1000] min-w-24 w-15 rounded-lg max-h-60 overflow-x-hidden ${
        isDropdownOpen ? "block" : "hidden"
      }`}
    >
      <li className="py-2.5 px-5 gap-[8px] flex items-center hover:bg-gray-100 text-[#333] text-sm cursor-pointer">
        <CiHome />
        Home
      </li>
      <li
        onClick={handleLogout}
        className="py-2.5 px-5 flex gap-[8px] items-center hover:bg-gray-100 text-[#333] text-sm cursor-pointer"
      >
        <CiLogout />
        Logout
      </li>
    </ul>
  </div>
</div>


        {/* User List */}
        <div className="my-8 flex-1">
          <h6 className="text-sm text-gray-700 font-semibold mb-6">Teams</h6>
          <ul className="space-y-6">
            {filteredUsers.map((curUser) => (
              <li
                key={curUser._id}
                onClick={() => handleUserSelect(curUser)}
                className="flex items-center text-sm text-black hover:text-blue-500 cursor-pointer"
              >
                <span className="relative inline-block mr-4">
                  <img
                    src={curUser.profile}
                    className="ml-[13px] rounded-full w-[50px] h-[50px] object-cover"
                    alt="Profile"
                  />
                  {/* Show online status */}
                  {isUserOnline(curUser._id) && (
                    <span className="h-2.5 w-2.5 rounded-full bg-green-600 block absolute bottom-1 right-0"></span>
                  )}
                </span>
                <span className="font-medium">{curUser.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};
