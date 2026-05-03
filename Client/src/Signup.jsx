import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [username,setUsername] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async () => {
    try{
        const res = await fetch("http://localhost:3000/signup",{
            method:"POST",
            headers: {
                "Content-Type": "application/json",
            },
            body : JSON.stringify({username : username , email : email , password : password})
        });
        if(!res.ok){
            const data = await res.json(); 
            console.log("Failed to Signup",data.message);
            return;
        }
        localStorage.setItem("user-email",email);
        navigate('/');
    }catch(err){
        console.log(err);
    }
  }
  return (
    <div>
      <div>
        <input 
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            className="border p-1 outline-none"
        />        
        <input 
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="border p-1 outline-none"
        />        
        <input 
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="border p-1 outline-none"
        />
        <button 
            onClick={handleSubmit}
            className="border p-1"
        >Signup</button>        
      </div>
    </div>
  )
}

export default Signup
