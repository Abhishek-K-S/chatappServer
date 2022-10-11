const express = require('express');
const app = express();
const server = require("http").createServer(app);
const cors = require('cors')
const io = require("socket.io")(server, {cors: {origin: "*"}});
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const {addUser, removeUser, getUser} = require('./helper.js')
const Room = require('./Models/Room.js');
const Message = require('./Models/Message.js');
const authRoutes = require('./routes/AuthRoutes.js');

const PORT = process.env.PORT || 4500
const mongo = 'mongodb://localhost:27017/udemy_chatApp';
const corsOptions = {
    origin: ['https://localhost:3000',"https://192.168.101.5:3000"],
    credentials: true, 
    optionSuccessStatus: 200
    
}

app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser())

app.use(authRoutes);

mongoose.connect(mongo, { useNewUrlParser: true , useUnifiedTopology: true } ).then(()=>{
    console.log("mongoose is connected");
})

app.get('/set-cookies', (req, res) =>{
    res.cookie('username', "Abhi");
    res.cookie('isAuthenticated', true, {httpOnly: true});
    res.send("cookies are set");
})

app.get('/get-cookies', (req, res) =>{
    const cookies = req.cookies;
    console.log(cookies);
    res.json(cookies);
})

server.listen(PORT, () => {
    console.log(`server running at port ${PORT}`);
});

io.on('connection' , (socket) => {
    console.log(socket.id);
    Room.find().then((result) =>{
        socket.emit('loadRooms', result)
    })
    
    socket.on('create-room', ({name})=>{
        console.log(name)
        const room = new Room({name});
        room.save().then((result) =>{
            io.emit('roomCreated', result)
        })
    })

    socket.on('join-room', ({name, room_id, user_id}) =>{
        const {error, user} = addUser({socket_id: socket.id,
            name,
            room_id,
            user_id
        });
        socket.join(room_id);
        if(error) console.log('Join error', error);
        //send previous messages
        Message.find({room_id}).then((messages)=>{
            socket.emit('loadMessages', messages);
            console.log('all messages : ', messages);
        });
        
        
    })

    socket.on('sendMessage', ({message, room_id} , callback)=>{
        const user = getUser({socket_id: socket.id});
        if(user){
            const msgToStore = {
                name: user.name,
                user_id: user.user_id,
                room_id, 
                text: message
            }
            
            const msg = new Message(msgToStore);
            msg.save().then((result) =>{
                io.to(room_id).emit('message', msgToStore);
                callback();
            })
        }

    })

    socket.on('disconnect', () =>{
        removeUser({socket_id: socket.id});
        console.log(`${socket.id} disconnected`);
    })

    // socket.onAny((event, ...args)=>{
    //     console.log(event, args)
    // })
})

