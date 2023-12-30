import credentials from "./credentials";

const socket = io("wss://friendly2.glitch.me", {
  autoConnect: false,
  auth: credentials.send,
});

export default socket;

// socket.onAny((...args) => console.log("Received:", ...args));
// socket.onAnyOutgoing((...args) => console.log("Sent:", ...args));
