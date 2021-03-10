let socket = io();
let chat = document.getElementById("chat");

socket.on('chat', (username, message, color, roles, time) => {
  let item = document.createElement('li');

  if (roles === null) {
    item.innerHTML = `<h3><span style="color: ${color}">${username}</span>: ${message}<span class="time"> (${time})</span></h3>`;
    chat.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  }

  else {
    item.innerHTML = `<h3><img src="${roles}" class="badge"><span style="color: ${color}"> ${username}</span>: ${message}<span class="time"> (${time})</span></h3>`;
    chat.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  }
})