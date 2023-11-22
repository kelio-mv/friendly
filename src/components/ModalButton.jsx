function ModalButton(props) {
  return (
    <div
      className={`modal__btn ${props.disabled ? "modal__btn--disabled" : ""}`}
      onClick={() => {
        if (!props.disabled) props.onClick();
      }}
    >
      {props.children}
    </div>
  );
}

export default ModalButton;

// Talvez esse componente não seja tão relevante
// Observe o modal__btn no componente Home
