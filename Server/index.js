const express = require('express');
const app = express();
const cors = require('cors');
const server = require('http').Server(app);
const mongoose = require('mongoose');
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    }
});
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

    socket.on('room', async ({ roomId, userId }) => {
        const room = rooms[roomId];
        if (!room) return;

        if (!room.users.includes(userId)) {
            return;
        }

        socket.join(roomId);
    });

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

const User = mongoose.model("User",userSchema);

app.get('/',(req,res)=>{
    res.send('Server is running...');
})

app.post('/signup',async(req,res)=>{
    const {username,email,password} = req.body;
    try{
        const user = await User.findOne({email : email});
        if(user){
            return res.status(400).json({message:"User already exisits"});
        }
        const new_user = new User({
            name:username,
            email:email,
            password:password
        });
        await new_user.save();
        res.json({message:"signup successfull"});
    }catch(err){
        console.log(err);
    }
})

app.post('/login',async(req,res)=>{
    const {email,password} = req.body;
    try{
        const user = await User.findOne({email:email});
        if(!user){
            return res.status(400).json({message:"User doesn't exists"});
        }
        if(user.password !== password)return res.status(400).json({message:"Password incorrect"});
        res.json({message : "login successfull",username : user.name});
    }catch(err){
        console.log(err);
    }
})

let rooms = {};

app.post('/create-room', (req, res) => {
  const { password , userId } = req.body;
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
  const room = rooms[id];
  if(!room.users.includes(userId))room.users.push(userId);
  res.json({ message: "Room created", id });
});

app.post('/join-room',(req,res)=>{
  const {id,password,userId} = req.body;
  const room = rooms[id];
  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }
  if (room.password !== password) {
    return res.status(401).json({ message: "Wrong password" });
  }
  if(!room.users.includes(userId))room.users.push(userId);
  res.json({ message: "Room joined", id });
})

app.post('/authenticated-user',(req,res)=>{
  const { userId, roomId } = req.body;
  const room = rooms[roomId];
  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }
  if (!room.users.includes(userId)) {
    return res.status(403).json({ message: "Invalid user" });
  }
  return res.json({ message: "valid" });
})

app.post('/getUser-info',async(req,res)=>{
    const {email} = req.body;
    const user = await User.findOne({email:email});
    if(!user)return res.status(400).json({message : "User doesnt exists"});
    res.json({message : "user info fetched successfully" , userId : user._id , username : user.name});
})


server.listen(PORT,()=>console.log('Server running at port : ' + PORT))


