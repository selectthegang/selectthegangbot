let socket = io();

socket.on('refresh', sure => {
  location.reload();
});