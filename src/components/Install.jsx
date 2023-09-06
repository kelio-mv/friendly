import Modal from "./Modal";
import { useState } from "react";

function Install(props) {
  if (props.open) {
    const [isIphone, setIsIphone] = useState(null);

    return (
      <Modal
        open={true}
        header="Instalar o Friendly"
        close={props.close}
        center={isIphone === null}
      >
        {isIphone === null && (
          <>
            <p className="install__question">Qual dispositivo você está usando?</p>
            <button className="btn btn--primary" onClick={() => setIsIphone(false)}>
              Android
            </button>
            <button className="btn btn--primary" onClick={() => setIsIphone(true)}>
              iPhone
            </button>
          </>
        )}

        {isIphone !== null && (
          <>
            <p>1. Abra o menu do seu navegador, conforme na figura abaixo.</p>
            <img src={`menu_${isIphone ? "iphone" : "android"}.png`} />
            <p>2. Clique em: Adicionar à {isIphone ? "Tela de Início" : "tela inicial"}.</p>
            <p>3. Após concluir o processo, feche o navegador.</p>
            <p>
              Pronto, você já pode abrir o Friendly pela tela inicial do seu dispositivo. &#x1F389;
            </p>
          </>
        )}
      </Modal>
    );
  }
}

export default Install;
