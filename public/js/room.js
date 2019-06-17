window.onload = () => {
  const socket = io() // WSS
  const form = document.querySelector('form')
  const inputChat = document.querySelector('#inputChat')
  const chat = document.querySelector('#chat')
  const localVideo = document.querySelector('#local_video')
  const remoteVideo = document.querySelector('#remote_video')
  const url = new URL(window.location.href)
  const idChat = url.searchParams.get('id')

  const iceServers = {
    'iceServers': [
      { 'urls': 'stun:stun.services.mozilla.com' },
      { 'urls': 'stun:stun.l.google.com:19302' }
    ]
  }

  const streamConstraints = { audio: true, video: true }

  let localStream
  let remoteStream
  let rtcPeerConnection
  let isCaller

  socket.emit('create or join', idChat)

  socket.on(idChat, (msg) => {
    let node = document.createElement('li')
    node.innerHTML = msg
    chat.appendChild(node)
  })

  form.addEventListener('submit', (evt) => {
    evt.preventDefault()
    socket.emit(idChat, inputChat.value)
    inputChat.value = ''
    return false
  })

  // message handlers
  socket.on('created', function (room) {
    console.log('created')
    navigator.mediaDevices.getUserMedia(streamConstraints).then(function (stream) {
      localStream = stream
      localVideo.srcObject = stream
      isCaller = true
    }).catch(function (err) {
      console.log('An error ocurred when accessing media devices', err)
    })
  })

  socket.on('joined', function (room) {
    console.log('joined')
    navigator.mediaDevices.getUserMedia(streamConstraints).then(function (stream) {
      localStream = stream
      localVideo.srcObject = stream
      socket.emit('ready', idChat)
    }).catch(function (err) {
      console.log('An error ocurred when accessing media devices', err)
    })
  })

  socket.on('candidate', function (event) {
    console.log('candidate')
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: event.label,
      candidate: event.candidate
    })
    rtcPeerConnection.addIceCandidate(candidate)
  })

  socket.on('ready', function () {
    console.log('ready')
    if (isCaller) {
      rtcPeerConnection = new RTCPeerConnection(iceServers)
      rtcPeerConnection.onicecandidate = onIceCandidate
      rtcPeerConnection.ontrack = onAddStream
      rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream)
      rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream)
      rtcPeerConnection.createOffer()
        .then(sessionDescription => {
          rtcPeerConnection.setLocalDescription(sessionDescription)
          socket.emit('offer', {
            type: 'offer',
            sdp: sessionDescription,
            room: idChat
          })
        })
        .catch(error => {
          console.log(error)
        })
    }
  })

  socket.on('offer', function (event) {
    console.log('offer')
    if (!isCaller) {
      rtcPeerConnection = new RTCPeerConnection(iceServers)
      rtcPeerConnection.onicecandidate = onIceCandidate
      rtcPeerConnection.ontrack = onAddStream
      rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream)
      rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream)
      rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
      rtcPeerConnection.createAnswer()
        .then(sessionDescription => {
          rtcPeerConnection.setLocalDescription(sessionDescription)
          socket.emit('answer', {
            type: 'answer',
            sdp: sessionDescription,
            room: idChat
          })
        })
        .catch(error => {
          console.log(error)
        })
    }
  })

  socket.on('answer', function (event) {
    console.log('answer')
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
  })

  // handler functions
  function onIceCandidate (event) {
    if (event.candidate) {
      console.log('sending ice candidate')
      socket.emit('candidate', {
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate,
        room: idChat
      })
    }
  }

  function onAddStream (event) {
    remoteVideo.srcObject = event.streams[0]
    remoteStream = event.stream
  }
}
