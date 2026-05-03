import React, { useRef, useState, useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import Note from './components/Note.jsx'
import io from "socket.io-client";
const socket = io("http://localhost:3000");
const Home = () => {
  const ContainerRef = useRef();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [validUser,setValidUser] = useState(false);  
  const [checked, setChecked] = useState(false);
  const canvasRef = useRef();
  const [context , setContext] = useState(null);
  const [notes, setNotes] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [userCnt,setUserCnt] = useState(0);
  const [user,setUser] = useState({});
  const [users,setUsers] = useState([]);
  const [drawMode, setDrawMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [eraseMode, setEraseMode] = useState(false);
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
      console.log(username);
      console.log(newUser.id);
      setUser(newUser);
    }catch(err){ 
      console.log(err);
    }
  } 
  const checkValid = async()=>{
    try{
      const res = await fetch("http://localhost:3000/authenticated-user",{
        method : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({userId: user.id, roomId: roomId}),
      })
      if(res.ok){
        setValidUser(true);
      }else{
        navigate('/join-room')
      }
    }catch(err){
      console.log(err);
    }
  }
  const getMousePosition = (e) =>{
    const rect = ContainerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
  const draw = (e) =>{
    if(context){
      const { x, y } = getMousePosition(e);
      context.lineWidth = 2;
      context.lineCap = "round";
      context.strokeStyle = "black";
        if (eraseMode) {
          context.globalCompositeOperation = "destination-out";
          context.lineWidth = 20;
        } else {
          context.globalCompositeOperation = "source-over";
          context.strokeStyle = "black";
          context.lineWidth = 2;
        }
      context.lineTo(x,y);
      socket.emit("draw-move", {roomId, x, y, erase: eraseMode });
      context.stroke();
    }
  }

  const onMouseDownDraw = (e) => {
    if (e.button !== 0 || (!drawMode && !eraseMode) || !context) return;
    const { x, y } = getMousePosition(e);
    context.beginPath();
    context.moveTo(x, y);
    socket.emit("draw-start", {roomId, x, y, erase: eraseMode });
    setIsDrawing(true);  
  };

  const onMouseMoveDraw = (e) => {
     if ((!drawMode && !eraseMode) || !isDrawing) return;
     draw(e);
  };

  const onMouseUp = () => {
    if (!isDrawing) return;
    socket.emit("draw-end",{roomId});
    setIsDrawing(false);
  };
  const handleDrop = (e) => {
    e.preventDefault()
    const type = e.dataTransfer.getData("note")
    if (type !== "new") return
    const rect = ContainerRef.current.getBoundingClientRect()
    const NOTE_SIZE = 250
    const x = e.clientX - rect.left - NOTE_SIZE / 2
    const y = e.clientY - rect.top - NOTE_SIZE / 2
    const newNote = {
      id: Date.now(),
      x,
      y
    }
    setNotes((prev) => [...prev, newNote])
    socket.emit("add-note", {note : newNote,roomId})
  }
  const handleDragOver = (e) => {
    e.preventDefault()
  }
  const lastEmit = useRef(0);;
      const handleMouseMove = (e) => {
        const now = Date.now();
        if (now - lastEmit.current > 50) {
          socket.emit("mouse-position", {
            id:socket.id,
            x: e.clientX,
            y: e.clientY,
            roomId
          });
          lastEmit.current = now;
        }
    };
  useEffect(() => {
    const handleKeyDown = (e) => {
      const active = document.activeElement
      if (
        active &&
        (active.tagName === "TEXTAREA" ||
          active.tagName === "INPUT" ||
          active.isContentEditable)
      ) {
        return
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId !== null) {
        setNotes((prev) => prev.filter((n) => n.id !== selectedId))
        setSelectedId(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectedId])
  useEffect(()=>{
    socket.on('connect',()=>{
      console.log('connecting to server');
    });
    socket.on('add-note', (note) => {
      if (!note || !note.id) return
      setNotes((prev) => {
        const exists = prev.some(n => n.id === note.id)
        if (exists) return prev
        return [...prev, note]
      })
    })
    socket.on("userCount",(count)=>{
      setUserCnt(count);
    });
    socket.on("move-note",({id,x,y})=>{
      setNotes(prev=>
        prev.map(note=>note.id === id ? {...note,x,y} : note)
      )
    })
    socket.on("mouse-move",({id,x,y})=>{
      setUsers(prev => {
        const exists = prev.find(u => u.id === id);

        if (exists) {
          return prev.map(u => u.id === id ? { ...u, x, y } : u);
        } else {
          return [...prev, { id, x, y }];
        }
      });
    })
    return () => {
      socket.off("add-note");
      socket.off("connect");
      socket.off("userCount");
      socket.off("move-note");
      socket.off("mouse-move");
    };
  },[])
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const rect = ContainerRef.current.getBoundingClientRect();
      if (canvas) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);
  useEffect(() => {
    if (!context) return;

    const handleStart = ({ x, y, erase }) => {
      context.beginPath();

      if (erase) {
        context.globalCompositeOperation = "destination-out";
      } else {
        context.globalCompositeOperation = "source-over";
      }

      context.moveTo(x, y);
    };

    const handleMove = ({ x, y, erase }) => {
      context.lineWidth = erase ? 20 : 2;

      if (erase) {
        context.globalCompositeOperation = "destination-out";
      } else {
        context.globalCompositeOperation = "source-over";
        context.strokeStyle = "black";
      }

      context.lineTo(x, y);
      context.stroke();
    };

    const handleEnd = () => {
      context.beginPath();
      context.globalCompositeOperation = "source-over";
    };

    socket.on("draw-start", handleStart);
    socket.on("draw-move", handleMove);
    socket.on("draw-end", handleEnd);

    return () => {
      socket.off("draw-start", handleStart);
      socket.off("draw-move", handleMove);
      socket.off("draw-end", handleEnd);
    };
  }, [context]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      setContext(ctx);
    }
  }, []);
  useEffect(() => {
  if (roomId) {
    socket.emit("room", roomId);
  }
}, [roomId]);
  useEffect(() => {
    getUserInfo();
  }, []);

useEffect(() => {
  if (user.id && roomId && !checked) {
    checkValid();
    setChecked(true);
  }
}, [user, roomId, checked]);
  return (
    <div className='flex flex-col h-screen'>
      <div className='h-14 px-2 items-center flex gap-10 bg-red-100'>
        <p className='font-semibold'>Room : {roomId}</p>
        <p>User : {userCnt}</p>
        <p>{user.name}</p>
      </div>

      <div className='flex flex-1'>
        <div
          ref={ContainerRef}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedId(null)
            }
            onMouseDownDraw(e)
          }}
          onMouseMove={onMouseMoveDraw}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className='flex-1 relative'
          style={{
            backgroundColor: '#f4f4f4',
            backgroundImage: `
              linear-gradient(#ddd 1px, transparent 1px),
              linear-gradient(90deg, #ddd 1px, transparent 1px)
            `,
            backgroundSize: '10px 10px'
          }}
        >
        <canvas
          ref={canvasRef}
          className='absolute inset-0 pointer-events-none'
        />
        {users.map(u => (
          <div
            key={u.id}
            className={`p-1 bg-blue-200 text-xs rounded z-40 ${u.id !== socket.id ? 'visible' : 'hidden'}`}
            style={{
              position: "absolute",
              top: u.y,
              left: u.x,
              zIndex:50
            }}
          >
            {u.id}
          </div>
        ))}

          {notes.map((note) => (
            <Note
              id={note.id}
              key={note.id}
              ContainerRef={ContainerRef}
              initialPosition={{ x: note.x, y: note.y }}
              isSelected={selectedId === note.id}
              onSelect={() => setSelectedId(note.id)}
              onMove={(x, y) => {
                setNotes(prev =>
                  prev.map(n =>
                    n.id === note.id ? { ...n, x, y } : n
                  )
                );
                socket.emit("move-note", { roomId, id: note.id, x, y });
              }}
            />
          ))}
        </div>
        {/* SideBar */}
        <div className='bg-white/30 backdrop-blur-md border left-2.5 top-1/2 p-0.5 -translate-y-1/2 border-white/30 rounded-lg shadow-lg absolute flex items-center flex-col gap-1 justify-center'>
          <div
            draggable
            onDragStart={(e) => e.dataTransfer.setData("note", "new")}
            className='flex p-1 items-center bg-transparent justify-center cursor-grab'
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </div>
          <div 
            onClick={() => {
              setDrawMode(prev => !prev)
              setEraseMode(false)
            }}
            className={`cursor-pointer rounded-lg  p-1 ${drawMode?'text-blue-700 shadow-sm bg-blue-200':'text-black'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
          </div>
          <div className='p-1 cursor-pointer'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
          <div className='p-1 cursor-pointer text-lg font-semibold'>T</div>
          <div
          onClick={() => {
            setEraseMode(prev => !prev)
            setDrawMode(false)}}
          className={`p-1 cursor-pointer rounded-lg ${
            eraseMode ? "bg-red-200 text-red-700" : "text-black"
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.24 3.56a2 2 0 0 1 2.83 0l1.37 1.37a2 2 0 0 1 0 2.83l-9.9 9.9a2 2 0 0 1-1.42.59H5a2 2 0 0 1-2-2v-4.12a2 2 0 0 1 .59-1.42l9.9-9.9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 6l4 4" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home