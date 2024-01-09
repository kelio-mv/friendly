function Form(props) {
  return (
    <form
      id={props.id}
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit();
      }}
    >
      <div className={`form__content ${props.className || ""}`}>{props.children}</div>
      {props.id && <input type="submit" style={{ display: "none" }} />}
    </form>
  );
}

export default Form;
