const socket = io("ws://localhost:3000", { autoConnect: false, reconnection: false });

socket.onAny((...args) => console.log("Received:", ...args));
socket.onAnyOutgoing((...args) => console.log("Sent:", ...args));

export default socket;
