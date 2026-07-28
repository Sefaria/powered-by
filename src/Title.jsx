import developersLogo from './assets/developers_logo.png'

function Title() {
  return (
    <header style={{ textAlign: 'center' }}>
      <h1>Powered by Sefaria Dashboard</h1>
      <a href="https://developers.sefaria.org" target="_blank" rel="noreferrer">
        <img src={developersLogo} alt="Sefaria Developers logo" />
      </a>
    </header>
  )
}

export default Title
