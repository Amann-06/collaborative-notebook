const express = require('express');
const app = express();
const cors = require('cors');
const server = require('http').Server(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  }
});
const mongoose = require('mongoose');
const PORT = 3000;
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"]
}));
mongoose.connect('mongodb://127.0.0.1:27017/Clip')
.then(() => console.log('Connected to Database'))
.catch((err) => console.log(`Failed to connect to Database ${err}`));

io.on('connection',(socket)=>{
    console.log('User connected');
    const count = io.engine.clientsCount;
    io.emit("userCount",count);
    socket.on('disconnect',()=>{
        const count = io.engine.clientsCount;
        console.log('User disconnected');
        io.emit("userCount",count);
    })

    socket.on('room',(room)=>{
        socket.join(room);
        socket.room = room;
    })

    socket.on('add-note',({roomId,note})=>{
        console.log("Note received : ", note);
        socket.to(roomId).emit('add-note', note);
    });
    socket.on("move-note",({ roomId, id, x, y })=>{
        socket.to(roomId).emit("move-note",{id,x,y});
    })
    socket.on("mouse-position",({ roomId, id, x, y })=>{
        socket.to(roomId).emit("mouse-move",{id,x,y});
    })
    socket.on("draw-start", (data) => {
        socket.to(data.roomId).emit("draw-start", data);
    });

    socket.on("draw-move", (data) => {
        socket.to(data.roomId).emit("draw-move", data);
    });

    socket.on("draw-end", (roomId) => {
        socket.to(roomId).emit("draw-end");
    });
})

app.use('/socket.io/',(req,res,next)=>{
    next();
})

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    }
});

const NoteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    day : {
        type : String , 
        required : true
    },
    date : {
        type : String , 
        required : true       
    },
    month : {
        type : String , 
        required : true
    },
    year : {
        type : String , 
        required : true
    },
    note : {
        type : String
    }
})

app.get('/',(req,res)=>{
    res.send('Hello from server');
})

app.post('/user/set-note',(req,res)=>{

})

app.get('/user/get-notes',(req,res)=>{

})

let rooms = {};

app.post('/create-room', (req, res) => {
  const { password } = req.body;
  let id;
  let attempts = 0;
  do {
    id = Math.floor(Math.random() * 90000) + 10000;
    attempts++;
    if (attempts > 1000) {
      return res.status(500).json({ message: "Unable to generate unique ID" });
    }
  } while (rooms[id]);
  rooms[id] = {
    password,
    users: []
  };
  res.json({ message: "Room created", id });
});

app.post('/join-room',(req,res)=>{
  const {id,password} = req.body;
  const room = rooms[id];
  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }
  if (room.password !== password) {
    return res.status(401).json({ message: "Wrong password" });
  }
  res.json({ message: "Room joined", id });
})
server.listen(PORT,()=>console.log('Server running at port : ' + PORT))


