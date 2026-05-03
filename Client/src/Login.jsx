import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom";

const Login = () => {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async() => {
    try{
        const res = await fetch("http://localhost:3000/login",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body : JSON.stringify({email:email,password:password})
        })
        const data = await res.json();
        if(!res.ok){
            console.log("Failed to login");
            return;
        }
        localStorage.setItem("user-email",email);
        navigate("/");
    }catch(err){
        console.log(err);
    }
  }
  return (
    <div>
      <div>
        <input 
            type="email"
            placeholder="Enter your name"
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
        <button onClick={handleSubmit}>Login</button>   
      </div>
    </div>
  )
}

export default Login
