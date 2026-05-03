import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const JoiningRoom = () => {
  const [roomId,setRoomId] = useState("");
  const [roomPassword,setRoomPassword] = useState("");
  const navigate = useNavigate();
  const handleJoin = async () => {
    if (!roomId || !roomPassword) return;
    try{
        const res = await fetch("http://localhost:3000/join-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: roomId, password: roomPassword }),
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
