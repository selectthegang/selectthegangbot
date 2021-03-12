let socket = io();
let chat = document.getElementById("chat");
let playlist = document.getElementById("playlist");
let loader = document.getElementById("loader");
let line = document.getElementById("line");
let waiting = document.getElementById("waiting");

line.style.display = 'none';
waiting.innerText = `waiting for new messages...`;

function hideLoader() {
  loader.style.display = 'none';
  waiting.style.display = 'none';
  line.style.display = 'block';
}

socket.on('chat', (username, message, color, time, pfp) => {

  let item = document.createElement('li');

  item.innerHTML = `<div class="container"><img src="${pfp}" alt="${username}"><span style="color: ${color}; font-weight: bold;">${username}</span><p>${message}</p><span class="time-right">${time} (UTC)</span></div>`;

  hideLoader();

  chat.appendChild(item);

  window.scrollTo(0, document.body.scrollHeight);

});

socket.on('refresh', (sure) => {
  location.reload();
});

socket.on('request', (username, title, url, pfp, color, time) => {
  let item = document.createElement('li');

  item.innerHTML = `<div class="container"><img src="${pfp}" alt="${username}"><span style="color: ${color}; font-weight: bold;">${username}</span><p>${title}</p><button class="playvideo" onclick="window.open('${url}');">Play Video</button><span class="time-right">${time} (UTC)</span></div>`;

  hideLoader();

  playlist.appendChild(item);

  window.scrollTo(0, document.body.scrollHeight);

});