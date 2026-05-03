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
    <div>
      <input
        type="text"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-1 outline-none"
      />

      <button
        onClick={createRoom}
        className="border px-5 py-2 bg-gray-100"
      >
        Create Room
      </button>
    </div>
  );
};

export default CreateRoom;