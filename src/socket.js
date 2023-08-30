const socket = io("ws://192.168.1.9:3000", { autoConnect: false, reconnection: false });

socket.onAny((...args) => console.log("Received:", ...args));
socket.onAnyOutgoing((...args) => console.log("Sent:", ...args));

export default socket;
