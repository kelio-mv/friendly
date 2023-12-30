import storage from "./storage";

const socket = io("wss://friendly2.glitch.me", {
  autoConnect: false,
  auth: (cb) => {
    const { username, password, signUp } = storage;
    cb({ username, password, signUp });
  },
});

export default socket;

socket.onAny((...args) => console.log("Received:", ...args));
socket.onAnyOutgoing((...args) => console.log("Sent:", ...args));
