let socket = io();
let card = document.getElementById("leaderboard");
let iteminfo = document.getElementById("items");

socket.on('board', (username, points) => {
  let item = document.createElement('li');
  item.textContent = `${username} - ${points}pts`;
  card.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
})
socket.on('item', (name, price) => {
  let info = document.createElement('li');
  info.textContent = `${name} - ${price}pts`;
  iteminfo.appendChild(info);
});
socket.on('error', (info) => {
  let item = document.createElement('li');
  item.textContent = info;
  card.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
})
function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
let channel = getParameterByName('channel');
socket.emit('info', channel)