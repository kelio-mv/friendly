import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import socket from "../socket";

function Chats(props) {
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("get_chats");
  }, []);

  return (
    <div className="flex-page">
      <div className="top-bar">
        <Icon name="arrow_back" onClick={() => navigate(-1)} />
        <h1>Conversas</h1>
      </div>
    </div>
  );
}

export default Chats;
