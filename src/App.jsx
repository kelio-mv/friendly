import React from "react";
import Home from "./components/Home";
import Feed from "./components/Feed";
import Sidebar from "./components/Sidebar";
import Post from "./components/Post";
import NewPost from "./components/NewPost";
import Settings from "./components/Settings";
import Modal from "./components/Modal";
import storage from "./storage";
import socket from "./socket";
import "./App.scss";

class App extends React.Component {
  state = {
    display: "Home",
    modal: null,
    users: {},
    posts: [],
    postId: null,
  };
  postBodyRef = React.createRef();

  componentDidMount() {
    socket.on("set_user", (userId, user) => {
      storage.userId = userId;
      this.setState({ users: { [userId]: user } });
    });

    socket.on("add_users", (users) => {
      this.setState({ users: { ...this.state.users, ...users } });
    });

    socket.on("add_posts", (posts) => {
      this.setState({ posts: [...this.state.posts, ...posts] });
      this.requestMissingUsers(posts);
    });

    socket.on("add_comment", (postId, comment) => {
      const posts = [...this.state.posts];
      let callback;

      if (postId === this.state.postId) {
        const pb = this.postBodyRef.current;
        const lc = pb.lastElementChild;

        if (pb.clientHeight + pb.scrollTop > pb.scrollHeight - lc.offsetHeight) {
          callback = () => pb.scrollTo(0, pb.scrollHeight);
        }
      }

      posts[postId].comments.push(comment);
      this.setState({ posts }, callback);
      this.requestMissingUsers([comment]);
    });

    socket.on("post_response", (post) => {
      this.setState({
        display: "Post",
        posts: [...this.state.posts, post],
        postId: this.state.posts.length,
      });
    });

    socket.on("comment_response", (postId, comment) => {
      // would this break if the user receives the message after leaving the post?
      const posts = [...this.state.posts];
      const pb = this.postBodyRef.current;
      posts[postId].comments.push(comment);
      this.setState({ posts }, () => pb.scrollTo(0, pb.scrollHeight));
    });

    socket.on("disconnect", () => {
      if (this.state.display !== "Home") {
        this.setState({ display: "Home", users: {}, posts: [], postId: null });
      }
    });
  }

  requestMissingUsers(articles) {
    const { users } = this.state;
    const missingUsers = new Set();

    articles.forEach((article) => {
      // if (!article) return;
      if (!(article.uid in users)) {
        missingUsers.add(article.uid);
      }
      if ("comments" in article) {
        article.comments.forEach((comment) => {
          // if (!comment) return;
          if (!(comment.uid in users)) {
            missingUsers.add(comment.uid);
          }
        });
      }
    });
    if (missingUsers.size > 0) {
      socket.emit("get_users", Array.from(missingUsers));
    }
  }

  render() {
    const { display, modal, users, posts, postId } = this.state;
    const { postBodyRef } = this;

    return (
      <>
        {display === "Home" && (
          <Home onAuth={() => this.setState({ display: "Feed" }, () => socket.emit("ready"))} />
        )}

        {display === "Feed" && (
          <Feed
            {...{ users, posts }}
            openSidebar={() => this.setState({ modal: "Sidebar" })}
            openNewPost={() => this.setState({ display: "NewPost" })}
            openPost={(postId) => this.setState({ display: "Post", postId })}
          />
        )}

        {display === "Post" && (
          <Post
            {...{ users, postId, postBodyRef }}
            post={posts[postId]}
            close={() => this.setState({ display: "Feed", postId: null })}
          />
        )}

        {display === "NewPost" && <NewPost discard={() => this.setState({ display: "Feed" })} />}

        {display === "Settings" && (
          <Settings user={users[storage.userId]} close={() => this.setState({ display: "Feed" })} />
        )}

        <Sidebar
          open={modal === "Sidebar"}
          close={() => this.setState({ modal: null })}
          user={users[storage.userId]}
          openInstall={() => this.setState({ modal: "Install" })}
          openSettings={() => this.setState({ display: "Settings", modal: null })}
          logout={() => {
            socket.close();
            storage.deleteCredentials();
            this.setState({ display: "Home", modal: null });
          }}
        />

        <Modal
          open={modal === "Install"}
          header="Instalar o app"
          close={() => this.setState({ modal: null })}
        >
          <div className="install">
            <ol>
              <li>Abra o menu do seu navegador.</li>
              <li>Clique em Adicionar à tela inicial.</li>
              <li>Feche o seu navegador.</li>
              <li>Abra o Friendly pela tela inicial.</li>
            </ol>
            <p>Caso seu navegador não tenha essa função, use o Chrome ou o Safari.</p>
          </div>
        </Modal>
      </>
    );
  }
}

export default App;

/*
Terminar Sidebar
Exibir número de novos comentários
Implementar sqlite
Carregamento dinâmico de posts e comentários
Mensagens privadas
Duração dos posts
Exclusão de contas inativas
Adicionar aviso de "estado de desenvolvimento" e convite de feedback

Instalar


*/

/*
<a href="https://www.flaticon.com/free-icons/talking" title="talking icons">Talking icons created by Freepik - Flaticon</a>

Design experimental para tela de configurações:
- Remover imagem de perfil e botão salvar do Modal e deixar no meio da tela
- Imagem será atualizada na confirmação do servidor
- Remover username do input e colocar na tela inicial
- Colocar senha em formato de asteriscos na tela inicial
- Colocar botões de editar em formato de lápis com círculo de fundo
- Se o design não ficar bom: Padronizar Sidebar e Settings

Desconectado:
- 45s após apagar a tela automaticamente
- 3m40s após apagar a tela propositalmente
- Instantaneamente ao faltar memória ram (acontece tbm com apps)
- No caso de falta de ram, não é possível reconectar, pois o processo é finalizado
- A solução é salvar o que se está aberto em localStorage, e ao invés de reconectar, reiniciar o app
*/
