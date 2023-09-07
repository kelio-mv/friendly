import Modal from "./Modal";
import Icon from "./Icon";

function Share(props) {
  return (
    <Modal open={props.open} header="Compartilhar" close={props.close} center>
      <p>
        Ao compartilhar o Friendly, você nos ajuda a formar uma comunidade maior e ainda mais
        incrível <Icon name="favorite" inline />
      </p>
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
    </Modal>
  );
}

export default Share;
