import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import ProfilePicture from "./ProfilePicture";
import Modal from "./Modal";
import TextArea from "./TextArea";
import storage from "../storage";
import socket from "../socket";
import "./Chat.scss";

function Chat(props) {
  const interlocutorId = parseInt(useParams().id);
  const interlocutor = props.users[interlocutorId];
  const chat = props.chats.find((chat) => chat.interlocutorId === interlocutorId);
  const messages = props.messages.filter(
    (message) => message.senderId === interlocutorId || message.receiverId === interlocutorId
  );
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const chatBodyRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (chat) {
      const fetchedMessages = messages.map((message) => message.id);
      socket.emit("get_messages", interlocutorId, fetchedMessages);
    }
    const handleDelChat = (_interlocutorId) => {
      if (_interlocutorId === interlocutorId) navigate(-1);
    };
    socket.on("del_chat", handleDelChat);
    return () => socket.off("del_chat", handleDelChat);
  }, []);

  useEffect(() => {
    const cb = chatBodyRef.current;
    cb.scrollTo(0, cb.scrollHeight);
  }, [messages]);

  function sendMessage(content) {
    socket.emit("create_message", interlocutorId, content);
    if (!chat) socket.emit("create_chat", interlocutorId);
  }

  function deleteChat() {
    socket.emit("del_chat", interlocutorId);
    setDeleteConfirmation(false);
  }

  return (
    <div className="flex-page">
      <div className="top-bar" style={{ padding: "5px 0.875rem" }}>
        <Icon name="arrow_back" onClick={() => navigate(-1)} />
        <ProfilePicture src={interlocutor.profilePicture} size={48} />
        <p className="chat__username">@{interlocutor.username}</p>
        <div className="top-bar__grow"></div>
        <Icon name="delete" onClick={() => setDeleteConfirmation(true)} />
      </div>
      <div className="chat__body" ref={chatBodyRef}>
        {messages.map((message) => (
          <Message key={message.id} {...message} />
        ))}
      </div>

      <TextArea
        placeholder="Mensagem..."
        maxLength="500"
        onHeightChange={() => {}}
        send={sendMessage}
      />

      <Modal
        open={deleteConfirmation}
        header="Confirmar exclusão"
        footer={
          <button className="modal__btn" onClick={deleteChat}>
            Sim
          </button>
        }
        close={() => setDeleteConfirmation(null)}
      >
        Você tem certeza que deseja apagar esta conversa?
      </Modal>
    </div>
  );
}

function Message(props) {
  const fromMe = props.senderId === storage.userId;
  const time = new Date(props.timestamp * 1000).toTimeString().substring(0, 5);

  return (
    <div className={`message ${fromMe ? "message--from-me" : ""}`}>
      <span className="message__content">{props.content}</span>
      <span className="message__time">{time}</span>
    </div>
  );
}

export default Chat;

// Opção de deletar mensagem
// Exibir datas no chat e na parte superior
// Quando eu mandar mensagem, fz scroll
// Quando receber mensagem, fz scroll se estiver vendo a ultima mensagem, e se não, mostrar unviewed messages
// Alinhar hora com pseudo element
// Criar componente para unviewed messages e botão scroll down
