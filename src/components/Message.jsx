import storage from "../storage";

function Message(props) {
  const fromMe = props.userId === storage.userId;
  const time = getTime();

  function getTime() {
    // useMemo?
    const date = new Date(props.timestamp * 1000);
    const [hours, minutes] = [date.getHours(), date.getMinutes()].map((v) => ("0" + v).slice(-2));
    return hours + ":" + minutes;
  }

  return (
    <div className={`message ${fromMe ? "message--from-me" : ""}`}>
      <span className="message__content">{props.content}</span>
      <span className="message__time">{time}</span>
    </div>
  );
}

export default Message;
