import Modal from "./Modal";

function Share(props) {
  return (
    <Modal open={props.open} header="Compartilhar" close={props.close}>
      <div style={{ textAlign: "center" }}>
        <p>
          Ao compartilhar o Friendly, você nos ajuda a formar uma comunidade maior e ainda mais
          incrível.
        </p>
        <br />
        <button
          className="btn btn--primary"
          onClick={() => {
            navigator.share({
              title: "Friendly",
              text: "Junte-se à melhor comunidade da internet",
              url: "https://kelio-mv.github.io/friendly/",
            });
          }}
        >
          Compartilhar
        </button>
      </div>
    </Modal>
  );
}

export default Share;
