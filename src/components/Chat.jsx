import { useState, useRef, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import ProfilePicture from "./ProfilePicture";
import Message from "./Message";
import Modal from "./Modal";
import TextArea from "./TextArea";
import socket from "../socket";

function Chat(props) {
  const interlocutorId = parseInt(useParams().id);
  const interlocutor = props.users[interlocutorId];
  const chat = useMemo(getChat, [props.chats]);
  const messages = useMemo(getMessages, [props.messages]);
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

  function getChat() {
    return props.chats.find((chat) => chat.interlocutorId === interlocutorId);
  }

  function getMessages() {
    return props.messages.filter(
      (message) => message.senderId === interlocutorId || message.receiverId === interlocutorId
    );
  }

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

export default Chat;

// Opção de deletar mensagem
// Exibir datas no chat e na parte superior
// Quando eu mandar mensagem, fz scroll
// Quando receber mensagem, fz scroll se estiver vendo a ultima mensagem, e se não, mostrar unviewed messages
