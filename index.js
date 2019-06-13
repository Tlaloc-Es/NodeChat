const express = require('express')
const http = require('http');
const io = require('socket.io');
const socketioWildcard = require('socketio-wildcard')();

const app = express()
const server = http.createServer(app)
const ioServer = io(server)

const port = 3000
const viewsFolder = __dirname + '/views'

ioServer.use(socketioWildcard);
app.use('/public', express.static('public'))

app.get('/', function(req, res){
  res.sendFile(viewsFolder + '/index.html');
});

app.get('/room', function(req, res){
  res.sendFile(viewsFolder + '/room.html');
});

server.listen(port, function(){
  console.log('listening on *:3000');
});

ioServer.on('connection', function(socket){
    console.log('A user connected');
    
    socket.on('disconnect', function(){
      console.log('User disconnected');
    });
    
    socket.on('chat message', function(msg){
        console.log(`Mensaje enviado:  ${msg}`)
    });

    socket.on('*', function(packet){
      let room = packet.data[0];
      let msg = packet.data[1];
      console.log(`Sala ${room} - Mensaje ${msg}`)
      ioServer.emit(room, msg);
    });
    
});

