import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import "./TextArea.scss";

function TextArea(props) {
  const [content, setContent] = useState("");
  const textareaRef = useRef();

  useEffect(() => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
    props.onHeightChange(textarea.style.height);
  }, [content]);

  function onKeyDown(e) {
    if ("ontouchstart" in document.documentElement) return;
    // Send the content when a desktop user presses Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (content.trim()) send();
    }
  }

  function send() {
    props.send(content.trim());
    setContent("");
    textareaRef.current.focus();
  }

  return (
    <div className="text-area">
      <textarea
        className="text-area__textarea"
        ref={textareaRef}
        placeholder={props.placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows="1"
        maxLength="1000"
        onKeyDown={onKeyDown}
      />
      <Icon name="send" onClick={send} disabled={!content.trim()} />
    </div>
  );
}

export default TextArea;
