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
  const [unviewedMessages, setUnviewedMessages] = useState(0);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const chatBodyRef = useRef();
  const scrollDown = useRef(true);
  const messagesLength = useRef(messages.length);
  const unviewedElemRef = useRef();
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
    // We need the previous sibling because this is run after the update.
    // Maybe i should have comments as a state that is only updated after running this
    const difference = messages.length - messagesLength.current;
    const cb = chatBodyRef.current;
    const lc = cb.lastElementChild;
    const ps = lc.previousElementSibling;
    messagesLength.current = messages.length;

    if (difference > 0) {
      if (scrollDown.current) {
        cb.scrollTo(0, cb.scrollHeight);
        scrollDown.current = false;
      } else if (
        cb.clientHeight + cb.scrollTop >
        cb.scrollHeight - lc.offsetHeight - ps.offsetHeight
      ) {
        cb.scrollTo(0, cb.scrollHeight);
      } else {
        setUnviewedMessages((pum) => pum + difference);
      }
    }
  }, [props.messages]);

  function onScroll() {
    const cb = chatBodyRef.current;
    const lc = cb.lastElementChild;
    if (cb.clientHeight + cb.scrollTop > cb.scrollHeight - lc.offsetHeight) {
      setUnviewedMessages(0);
    }
  }

  function sendMessage(content) {
    socket.emit("create_message", interlocutorId, content, (message) => {
      props.addMessages([message]);
      scrollDown.current = true;
    });
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
      <div className="chat__body" ref={chatBodyRef} onScroll={onScroll}>
        {messages.map((message) => (
          <Message key={message.id} {...message} />
        ))}
      </div>

      <TextArea
        placeholder="Mensagem..."
        maxLength="500"
        onHeightChange={(height) => {
          unviewedElemRef.current.style.transform = `translateY(-${height})`;
        }}
        send={sendMessage}
      />

      <div
        className="unviewed"
        ref={unviewedElemRef}
        style={unviewedMessages === 0 ? { display: "none" } : {}}
      >
        {unviewedMessages}
      </div>

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

// Exibir datas no chat e na parte superior da tela
// Alinhar hora com pseudo element
// Exibir número de novas mensagens nos chats e destacar mensagens não visualizadas
