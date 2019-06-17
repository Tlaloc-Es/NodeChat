
exports = module.exports = function (ioServer) {
  ioServer.on('connection', function (socket) {
    console.log('A user connected')

    socket.on('create or join', function (room) {
      console.log('create or join to room ', room)

      let myRoom = ioServer.sockets.adapter.rooms[room] || { length: 0 }
      let numClients = myRoom.length

      console.log(room, ' has ', numClients, ' clients')

      if (numClients === 0) {
        console.log('send created')
        socket.join(room)
        socket.emit('created', room)
      } else if (numClients === 1) {
        console.log('send joined')
        socket.join(room)
        socket.emit('joined', room)
      }
    })

    socket.on('ready', function (room) {
      console.log('ready')
      socket.broadcast.to(room).emit('ready')
    })

    socket.on('candidate', function (event) {
      console.log('candidate')
      socket.broadcast.to(event.room).emit('candidate', event)
    })

    socket.on('offer', function (event) {
      console.log('offer')
      socket.broadcast.to(event.room).emit('offer', event.sdp)
    })

    socket.on('answer', function (event) {
      console.log('answer')
      socket.broadcast.to(event.room).emit('answer', event.sdp)
    })

    socket.on('trabajo', function (msg) {
      console.log(`Sala trabajo - Mensaje ${msg}`)
      ioServer.emit('trabajo', msg)
    })
  })
}
