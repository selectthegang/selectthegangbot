let socket = io();
let chat = document.getElementById("chat");

socket.on('chat', (username, message, color, roles, time) => {
  let item = document.createElement('li');

  if (roles === null) {
    item.innerHTML = `<h3><span class="time">${time}</span><span style="color: ${color}">${username}</span>: ${message}</h3>`;
    chat.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  }

  else {
    item.innerHTML = `<h3><span class="time">${time}</span><img src="${roles}" class="badge"><span style="color: ${color}"> ${username}</span>: ${message}</h3>`;
    chat.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  }
})

socket.on('refresh', (sure) => {
  location.reload();
});

socket.on('request', (username, url, video, image) => {
  let item = document.createElement('li');

  item.innerHTML = `<h3>${username}: ${video}<h3><img src="${image}" onclick='window.open("${url}")' class="thumbnail"><span class="close" onclick="this.parentElement.style.display='none';">Close</span>`;
  videos.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});