import { useState } from "react";
import Icon from "./Icon";
import "./TextField.scss";

function TextField(props) {
  const [showPassword, setShowPassword] = useState(false);
  const maxLength = ["username", "password"].includes(props.type) ? 16 : null;

  return (
    <div className="text-field">
      <input
        type={props.type === "password" && !showPassword ? "password" : "text"}
        className={`text-field__input ${props.modalChild ? "text-field__input--modal-child" : ""}`}
        placeholder={props.placeholder}
        value={props.value}
        onChange={(e) => {
          let value = e.target.value;
          if (props.type === "username") {
            value = value.replace(/[^a-zA-Z0-9_]/g, "");
          }
          props.onChange(value);
        }}
        maxLength={maxLength}
      />
      {props.type === "password" && (
        <div className="text-field__visibility">
          <Icon
            name={`visibility${showPassword ? "_off" : ""}`}
            onClick={() => setShowPassword(!showPassword)}
            dimmed
          />
        </div>
      )}
    </div>
  );
}

export default TextField;
