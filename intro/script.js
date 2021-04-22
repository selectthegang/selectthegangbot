let socket = io();

socket.on('refresh', sure => {
  location.reload();
});

socket.on('redirect', url => {
	window.location.href = url;
});