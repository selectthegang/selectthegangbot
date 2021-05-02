let socket = io();
let chat = document.getElementById('chat');
let loader = document.getElementById('loader');
let waiting = document.getElementById('waiting');

waiting.innerText = `waiting for messages`;

function hideLoader() {
	loader.style.display = 'none';

	waiting.style.display = 'none';
}

socket.on('chat', (username, message, color, time, pfp, id, verified) => {
	let item = document.createElement('li');
	let code;

	if (verified === true) {
		code = `<div class="message" id="${id}"><span class="closebtn" onclick="deleteMessage(this.parentElement.id)">&times;</span><img class="profilePic" src="${pfp}"><img class="verified" src="https://i.ibb.co/HpdyNFc/unnamed-removebg-preview.png"><p>${message}</p><span class="username" style="color: ${color};">${username}</span><span class="timeStampRight">${time}</span></div>`;
	} else {
		code = `<div class="message" id="${id}"><span class="closebtn" onclick="deleteMessage(this.parentElement.id)">&times;</span><img class="profilePic" src="${pfp}"><p>${message}</p><span class="username" style="color: ${color};">${username}</span><span class="timeStampRight">${time}</span></div>`;
	}

	hideLoader();
	item.innerHTML = code;
	chat.appendChild(item);

	window.scrollTo(0, document.body.scrollHeight);
});

socket.on('refresh', sure => {
	location.reload();
});

socket.on('redirect', url => {
	window.location.href = url;
});

function deleteMessage(Boolean) {
	document.getElementById(Boolean).style.display = 'none';
	socket.emit('remove', Boolean);
}
