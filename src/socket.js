const socket = io("ws://localhost:3000", { autoConnect: false, reconnection: false });

export default socket;
