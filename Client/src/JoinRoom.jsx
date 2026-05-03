import React from 'react'
import { Link } from 'react-router-dom'

const JoinRoom = () => {
  return (
    <div className="flex justify-center items-center h-screen w-screen">
        <div className='flex p-10 rounded-lg flex-col gap-5 justify-center items-center border shadow-md'>
            <Link to="/join-room" className='border shadow-sm p-2 w-32'>Join a room</Link>
            <Link to="/create-room" className='border shadow-sm p-2 w-32'>Create a room</Link>
        </div>
    </div>
  )
}

export default JoinRoom
