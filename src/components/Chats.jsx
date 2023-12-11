import { useNavigate } from "react-router-dom";
import Icon from "./Icon";

function Chats(props) {
  const navigate = useNavigate();

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
