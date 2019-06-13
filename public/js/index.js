window.onload = () => {
    const button = document.querySelector('#chatButton');
    const chatList = document.querySelector('#chatList');

    button.addEventListener('click', (evt) => {
        let chat = chatList.value;
        window.location.href = `room/?id=${chat}`;
    })
}