import React, { useState,useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import io from "socket.io-client";
const socket = io("http://localhost:3000");
const JoiningRoom = () => {
  const [roomId,setRoomId] = useState("");
  const [user,setUser] = useState({});
//   const [checked, setChecked] = useState(false);
  const [roomPassword,setRoomPassword] = useState("");
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
        
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="border p-2 outline-none"
        />
        <input
        type='text'
        placeholder='Enter Room Password'
        value={roomPassword}
        onChange={(e)=>setRoomPassword(e.target.value)}
        className='border p-2 outline-none'
        />
        <button
          onClick={handleJoin}
          className='border shadow-sm p-2 w-32'
        >
          Join Room
        </button>

      </div>
    </div>
  )
}

export default JoiningRoom
