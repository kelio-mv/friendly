import { useState } from "react";
import Icon from "./Icon";
import "./TextField.scss";

function TextField(props) {
  const [hideContent, setHideContent] = useState(props.type === "password");

  return (
    <div className="text-field">
      <input
        type={hideContent ? "password" : "text"}
        className={`text-field__input ${props.modalChild ? "text-field__input--modal-child" : ""}`}
        placeholder={props.placeholder}
        value={props.value}
        onChange={(e) => {
          const value = e.target.value;
          props.onChange(props.type === "username" ? value.replace(/[^a-zA-Z0-9_]/g, "") : value);
        }}
        minLength={props.validateLength ? (props.type === "username" ? 3 : 6) : null}
        maxLength={props.validateLength ? 16 : null}
        required
      />
      {props.type === "password" && (
        <div className="text-field__visibility">
          <Icon
            name={`visibility${hideContent ? "" : "_off"}`}
            onClick={() => setHideContent(!hideContent)}
            dimmed
          />
        </div>
      )}
    </div>
  );
}

export default TextField;
