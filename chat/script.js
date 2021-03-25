let socket = io();
let chat = document.getElementById('chat');
let loader = document.getElementById('loader');
let waiting = document.getElementById('waiting');

waiting.innerText = `please wait...`;

function hideLoader() {
  loader.style.display = 'none';

  waiting.style.display = 'none';
}

socket.on('chat', (username, message, color, time, pfp) => {
  let item = document.createElement('li');

  if (color === null) {
    item.innerHTML = `<div class="message"><img class="profilePic" src="${pfp}"><p>${message}</p><span class="username" style="color: black;">${username}</span><span class="timeStampRight">${time}</span></div>`;

    hideLoader();

    chat.appendChild(item);

    window.scrollTo(0, document.body.scrollHeight);
  } else {
    item.innerHTML = `<div class="message"><img class="profilePic" src="${pfp}"><p>${message}</p><span class="username" style="color: ${color};">${username}</span><span class="timeStampRight">${time}</span></div>`;

    hideLoader();

    chat.appendChild(item);

    window.scrollTo(0, document.body.scrollHeight);
  }
});

socket.on('refresh', sure => {
  location.reload();
});

socket.on('request', (username, url, pfp, color, time) => {
  let item = document.createElement('li');

  item.innerHTML = `<div class="message"><img class="profilePic" src="${pfp}"><iframe width="240" height="172" src="https://www.youtube.com/embed/${url}?autoplay=1"> </iframe><span class="timeStampRight">${time}</span></div>`;

  hideLoader();

  chat.appendChild(item);

  window.scrollTo(0, document.body.scrollHeight);
});
