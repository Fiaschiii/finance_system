// Tela de carregamento com o mesmo ícone da aba do navegador (public/favicon.svg).
// Fica por baixo do cabeçalho, que continua visível e clicável.
function AppLoader({ visible }) {
  return (
    <div className={`app-loader${visible ? '' : ' app-loader--hidden'}`} aria-hidden={!visible}>
      <div className="app-loader__mark">
        <span className="app-loader__ring" />
        <img className="app-loader__logo" src="/favicon.svg" alt="" width="56" height="56" />
      </div>
      {visible && (
        <p className="app-loader__text" role="status">
          Carregando…
        </p>
      )}
    </div>
  )
}

export default AppLoader
