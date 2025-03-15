import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react'


import { SideBar } from '../components/SideBar'
import { Chat } from '../components/Chat'
import { useSelector } from 'react-redux';
 import { io } from 'socket.io-client';
import { Baseurl } from '../../services api/baseurl';

export default function Home() {
  const { user ,isAuthenticated} = useSelector((state) => state.auth);
  const [socket, setSocket] = useState(null); // State for socket connection
 
  const navigate = useNavigate();
  useEffect(() => {
    const newSocket = io(Baseurl); // Connect to the backend
    setSocket(newSocket);

    // Emit the userId to the server
    if (user && user._id) {
      newSocket.emit('AddUserSocket', user._id);
    }

    // Cleanup on component unmount
    return () => newSocket.close();
  }, [user]);

  useEffect(() => { 
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  return (
    <section className="section bg-[url('https://w0.peakpx.com/wallpaper/744/548/HD-wallpaper-whatsapp-ma-doodle-pattern-thumbnail.jpg')] bg-gray-200 bg-center opacity-100">
      <div className="flex md:flex-row flex-col">
        {/* Sidebar */}
        <div
          className="basis-[25%] h-[100vh] md:bg-[#FFFFFF]  bg-[#FFFFFF] overflow-y-auto "
          
        >
          <SideBar socket={socket}/>
        </div>

        {/* Chat Section */}
        <div
          className="basis-[75%] h-[100vh] overflow-y-auto"
         
        >
          <Chat  socket={socket}/>
        </div>
      </div>
    </section>
  );
}

