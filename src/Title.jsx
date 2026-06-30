import developersLogo from './assets/developers_logo.png'

function Title() {
  return (
    <header>
      <h1>Powered by Sefaria Dashboard</h1>
      <img src={developersLogo} alt="Sefaria Developers logo" />
      <a href="https://developers.sefaria.org" target="_blank" rel="noreferrer">
        developers.sefaria.org
      </a>
    </header>
  )
}

export default Title
