import { useState } from "react";

function Install(props) {
  const [isIphone, setIsIphone] = useState(null);

  return (
    <div className="flex-page">
      <div className="top-bar">
        <img src="back.svg" onClick={props.close} />
        <h1>Instalar o app</h1>
      </div>
      <div className={`install ${isIphone === null ? "install--center" : ""}`}>
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
            <p style={{ marginBottom: "1rem" }}>3. Após concluir o processo, feche o navegador.</p>
            <p>
              Pronto, você já pode abrir o Friendly pela tela inicial do seu dispositivo. &#x1F389;
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Install;
