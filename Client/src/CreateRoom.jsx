import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

const CreateRoom = () => {
  const [password, setPassword] = useState("");
  // const [checked, setChecked] = useState(false);
  const navigate = useNavigate();
  const [user,setUser] = useState({});
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
  const createRoom = async () => {
    try {
      const res = await fetch("http://localhost:3000/create-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({password : password , userId : user.id}),
      });
      const data = await res.json();
      socket.emit("room", data.id);
      navigate(`/room/${data.id}`);
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    getUserInfo();
  }, []);

  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <div className='flex p-10 rounded-lg flex-col gap-5 justify-center items-center border shadow-md'>
        <h1 className='font-semibold text-lg mb-5'>Create Room</h1>
        <input
          type="text"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-b p-1 outline-none"
        />

        <button
          onClick={createRoom}
          className="border shadow-sm rounded-md bg-green-500 text-white font-semibold py-2 px-6"
        >
          Create Room
        </button>
      </div>
    </div>
  );
};

export default CreateRoom;