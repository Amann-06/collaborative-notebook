import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const JoinRoom = () => {
  return (
    <div className="flex justify-center items-center h-screen w-screen">
        <div className='flex px-8 py-12 rounded-lg flex-col gap-5 justify-center items-center border shadow-md'>
          <h1 className='font-semibold mb-5 text-lg'>Room</h1>
            <Link to="/join-room" className='border font-semibold rounded-md shadow-sm p-2 w-40 flex justify-between items-center transition-colors hover:bg-gray-100'>
              Join a room
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link to="/create-room" className='border font-semibold rounded-md shadow-sm p-2 w-40 flex justify-between items-center transition-colors hover:bg-gray-100'>
              Create a room
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
        </div>
    </div>
  )
}

export default JoinRoom
