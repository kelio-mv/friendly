import { useState } from "react";
import Modal from "./Modal";

function Install(props) {
  const [isIPhone, setIsIPhone] = useState(null);

  return (
    <Modal open={true} header="Instalar o Friendly" close={props.close} center={isIPhone === null}>
      {isIPhone === null ? (
        <>
          <p className="install__question">Qual dispositivo você está usando?</p>
          <button className="btn btn--primary" onClick={() => setIsIPhone(false)}>
            Android
          </button>
          <button className="btn btn--primary" onClick={() => setIsIPhone(true)}>
            iPhone
          </button>
        </>
      ) : (
        <>
          <p>1. Abra o menu do seu navegador, conforme na figura abaixo.</p>
          <img src={`menu_${isIPhone ? "iphone" : "android"}.png`} />
          <p>2. Clique em: Adicionar à {isIPhone ? "Tela de Início" : "tela inicial"}.</p>
          <p>3. Após concluir o processo, feche o navegador.</p>
          <p>
            Pronto, você já pode abrir o Friendly pela tela inicial do seu dispositivo. &#x1F389;
          </p>
        </>
      )}
    </Modal>
  );
}

export default Install;
