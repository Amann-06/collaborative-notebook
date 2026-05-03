import { useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

const CreateRoom = () => {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const createRoom = async () => {
    try {
      const res = await fetch("http://localhost:3000/create-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      socket.emit("room", data.id);
      navigate(`/room/${data.id}`);
    } catch (err) {
      console.error(err);
    }
  };

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