function ModalButton(props) {
  return (
    <div
      className={`modal__btn ${props.disabled ? "modal__btn--disabled" : ""}`}
      onClick={() => !props.disabled && props.onClick()}
    >
      {props.children}
    </div>
  );
}

export default ModalButton;
