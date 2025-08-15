socket.emit("message", "Hello!"); // send
socket.on("message", data => console.log(data)); // receive

	