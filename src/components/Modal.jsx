import "./Modal.scss";

function Modal(props) {
  return (
    props.open && (
      <div className="modal">
        <div className="modal__content">
          <div className="modal__header">{props.header}</div>
          <div className="modal__body">{props.children}</div>
          <div className="modal__footer">{props.footer}</div>
        </div>
      </div>
    )
  );
}

export default Modal;
