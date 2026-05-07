import React, { useState,useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import io from "socket.io-client";
const socket = io("http://localhost:3000");
const JoiningRoom = () => {
  const [roomId,setRoomId] = useState("");
  const [user,setUser] = useState({});
//   const [checked, setChecked] = useState(false);
  const [roomPassword,setRoomPassword] = useState("");
  const [showPassword,setShowPassword] = useState(false);
  const navigate = useNavigate();
    const getUserInfo = async() => {
    const email = localStorage.getItem("user-email");
    try{
      const res = await fetch("http://localhost:3000/getUser-info",{
        method:"POST",
        headers: {
          "Content-Type": "application/json",
        },
        body : JSON.stringify({email:email})
      })
      if(!res.ok){
        console.log("Failed to fecth user data");
        return;
      }
      const data = await res.json();
      const username = data.username;
      const userId = data.userId;
      const newUser = {
        id : userId,
        name : username,
        email : email
      }
      setUser(newUser);
    }catch(err){ 
      console.log(err);
    }
  } 
  const handleJoin = async () => {
    if (!roomId || !roomPassword) return;
    try{
        const res = await fetch("http://localhost:3000/join-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: roomId, password: roomPassword ,userId:user.id}),
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/room/${roomId}`);
      } else {
        alert(data.message); 
      }
    }catch(err){
        console.log(err);
    }
  };
    useEffect(() => {
    getUserInfo();
    }, []);

  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <div className='flex p-10 rounded-lg flex-col gap-5 justify-center items-center border shadow-md'>
        <h1 className='font-semibold text-lg mb-5'>Join Room</h1>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="border-b p-1 pr-6 outline-none"
        />
        <div className='relative'>
          <input
          type= {showPassword ? 'text' : 'password'}
          placeholder='Enter Room Password'
          value={roomPassword}
          onChange={(e)=>setRoomPassword(e.target.value)}
          className='border-b p-1 pr-6 outline-none'
          />
          {
            showPassword ? 
            <svg onClick={()=>setShowPassword(false)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 absolute bottom-1 right-0 transition-colors text-gray-500 cursor-pointer hover:text-black/70 hover:scale-95">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg> :
            <svg onClick={()=>setShowPassword(true)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 absolute bottom-1 right-0 transition-colors text-gray-500 cursor-pointer hover:text-black/70 hover:scale-95">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          }
        </div>
        <button
          onClick={handleJoin}
          className='border shadow-sm rounded-md bg-green-500 text-white font-semibold p-2 w-32'
        >
          Join Room
        </button>

      </div>
    </div>
  )
}

export default JoiningRoom
