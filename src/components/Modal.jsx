import "./Modal.scss";

function Modal(props) {
  return (
    props.open && (
      <div className="modal" onClick={props.close}>
        <div className="modal__content" onClick={(e) => e.stopPropagation()}>
          <div className="modal__header">{props.header}</div>
          <div className={`modal__body ${props.center ? "modal__body--center" : ""}`}>
            {props.children}
          </div>
          {props.footer && <div className="modal__footer">{props.footer}</div>}
        </div>
      </div>
    )
  );
}

export default Modal;
