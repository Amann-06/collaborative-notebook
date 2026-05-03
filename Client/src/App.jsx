import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./Home";
import JoinRoom from "./JoinRoom";
import JoiningRoom from "./JoiningRoom";
import CreateRoom from "./CreateRoom";
import Login from "./Login";
import Signup from "./Signup";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JoinRoom/>}/>
        <Route path="/room/:roomId"  element={<Home/>}/>
        <Route path="/join-room" element={<JoiningRoom/>}/>
        <Route path="/create-room" element={<CreateRoom/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
      </Routes>
    </BrowserRouter>
  )
}