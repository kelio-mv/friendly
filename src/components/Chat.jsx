import { useState, useRef, useEffect, Fragment } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useScrollRestoration from "../useScrollRestoration";
import Icon from "./Icon";
import ProfilePicture from "./ProfilePicture";
import Modal from "./Modal";
import TextArea from "./TextArea";
import credentials from "../credentials";
import socket from "../socket";
import "./Chat.scss";

function Chat(props) {
  const interlocutorId = parseInt(useParams().id);
  const interlocutor = props.users[interlocutorId];
  const chat = props.chats.find((chat) => chat.interlocutorId === interlocutorId);
  const messages = props.messages.filter(
    (message) => message.senderId === interlocutorId || message.receiverId === interlocutorId
  );
  const lastMessage = messages[messages.length - 1];
  const [unviewedMessages, setUnviewedMessages] = useState(0);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const chatBodyRef = useScrollRestoration();
  const scrollDown = useRef(!sessionStorage.getItem(location.key));
  const unviewedElemRef = useRef();

  useEffect(() => {
    const handleDelChat = (_interlocutorId) => {
      if (_interlocutorId === interlocutorId) navigate(-1);
    };
    socket.on("del_chat", handleDelChat);
    return () => socket.off("del_chat", handleDelChat);
  }, []);

  useEffect(() => {
    if (scrollDown.current) {
      const cb = chatBodyRef.current;
      const scrollable = cb.clientHeight < cb.scrollHeight;
      if (scrollable) cb.scrollTo(0, cb.scrollHeight);
      else updateLastViewedMessageId();
    } else {
      updateUnviewedMessages();
    }
  }, [props.messages]);

  useEffect(() => updateUnviewedMessages(), [props.chats]);

  function getMessageDate(message) {
    return message && new Date(message.timestamp * 1000).toDateString();
  }

  function getLocaleMessageDate(message) {
    const now = new Date();
    const date = new Date(message.timestamp * 1000).toLocaleDateString();
    if (date === now.toLocaleDateString()) {
      return "Hoje";
    }
    now.setDate(now.getDate() - 1);
    if (date === now.toLocaleDateString()) {
      return "Ontem";
    }
    return date;
  }

  function onScroll() {
    const cb = chatBodyRef.current;
    const lc = cb.lastElementChild;
    const cbpb = parseInt(getComputedStyle(cb).paddingBottom);
    const isLastMessageVisible =
      cb.clientHeight + cb.scrollTop > cb.scrollHeight - cbpb - lc.clientHeight;

    if (isLastMessageVisible) updateLastViewedMessageId();
    scrollDown.current = isLastMessageVisible;
  }

  function updateLastViewedMessageId() {
    if (lastMessage && lastMessage.id !== chat.lastViewedMessageId) {
      props.setLastViewedMessageId(interlocutorId, lastMessage.id);
      socket.emit("edit_chat", interlocutorId, lastMessage.id);
    }
  }

  function updateUnviewedMessages() {
    setUnviewedMessages(messages.filter((message) => message.id > chat.lastViewedMessageId).length);
  }

  function sendMessage(content) {
    socket.emit("create_message", interlocutorId, content, (message) => {
      props.addMessages([message]);
      scrollDown.current = true;
    });
  }

  function openProfile() {
    navigate(`/profile/${interlocutorId}`);
  }

  function deleteChat() {
    socket.emit("del_chat", interlocutorId);
    setDeleteConfirmation(false);
  }

  return (
    <div className="flex-page">
      <div className="top-bar" style={{ padding: "5px 0.875rem" }}>
        <Icon name="arrow_back" onClick={() => navigate(-1)} invert />
        <ProfilePicture src={interlocutor.profilePicture} size={48} onClick={openProfile} />
        <p className="chat__username" onClick={openProfile}>
          @{interlocutor.username}
        </p>
        <div className="top-bar__grow"></div>
        <Icon name="delete" onClick={() => setDeleteConfirmation(true)} invert />
      </div>

      <div className="chat__body" ref={chatBodyRef} onScroll={onScroll}>
        {messages.map((message, i) => {
          const messageDate = getMessageDate(message);
          const prevMessageDate = getMessageDate(messages[i - 1]);
          const displayDate = messageDate !== prevMessageDate;
          return (
            <Fragment key={message.id}>
              {displayDate && <p className="chat__date">{getLocaleMessageDate(message)}</p>}
              <Message {...message} />
            </Fragment>
          );
        })}
      </div>

      <TextArea
        placeholder="Mensagem..."
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
  const fromMe = props.senderId === credentials.userId;
  const time = new Date(props.timestamp * 1000).toTimeString().substring(0, 5);

  return (
    <div className={`message ${fromMe ? "message--from-me" : ""}`}>
      <p className="message__content">{props.content}</p>
      <p className="message__time">{time}</p>
    </div>
  );
}

export default Chat;
