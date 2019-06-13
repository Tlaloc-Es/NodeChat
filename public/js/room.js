window.onload = () => {
    const socket = io();
    const form = document.querySelector("form");
    const inputChat = document.querySelector("#inputChat");
    const chat = document.querySelector("#chat");
    let url = new URL(window.location.href);
    const idChat = url.searchParams.get("id");

    socket.on(idChat, (msg) => {
        let node = document.createElement('li');
        node.innerHTML = msg;
        chat.appendChild(node);
    });

    form.addEventListener('submit', (evt) => {
        evt.preventDefault();
        socket.emit(idChat, inputChat.value);
        inputChat.value = "";
        return false;
    });
}