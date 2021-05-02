let socket = io();
let videos = document.getElementById('videos');

socket.on('refreshVid', sure => {
	location.reload();
});

function deleteVideo(Boolean) {
	document.getElementById(Boolean).style.display = 'none';
}

socket.on('request', (username, url, pfp, color, time) => {
	videos.innerHTML = `<iframe width="500" height="300" src="https://www.youtube.com/embed/${url}?autoplay=1"></iframe>`;
});
