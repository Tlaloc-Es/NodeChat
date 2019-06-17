import express from 'express'
import http from 'http'
import io from 'socket.io'

const app = express()
const server = http.createServer(app)
const ioServer = io(server)
require('./chat/chatSocket')(ioServer)

const port = 3000
const viewsFolder = __dirname.concat('/views')

app.use('/public', express.static('public'))

app.get('/', function (req, res) {
  res.sendFile(viewsFolder + '/index.html')
})

app.get('/room', function (req, res) {
  res.sendFile(viewsFolder + '/room.html')
})

server.listen(port, function () {
  console.log('listening on *:3000')
})
