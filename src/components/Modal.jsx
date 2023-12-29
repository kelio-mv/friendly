import "./Modal.scss";

function Modal(props) {
  if (!props.open) return;

  return (
    <div className="modal" onMouseDown={props.close}>
      <div className="modal__content" onMouseDown={(e) => e.stopPropagation()}>
        <header className="modal__header">{props.header}</header>
        <div className={`modal__body ${props.center ? "modal__body--center" : ""}`}>
          {props.children}
        </div>
        {(props.footer || props.center) && (
          <footer className="modal__footer">{props.footer}</footer>
        )}
      </div>
    </div>
  );
}

export default Modal;
