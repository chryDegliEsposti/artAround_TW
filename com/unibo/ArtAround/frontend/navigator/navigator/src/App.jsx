import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Benvenuto in ArtAround Navigator! 💁</h1>
      <p>ArtAround ....descrizione servizio alla spot pubblicita'...</p>
      <h2><a href="/">Vai al Marketplace</a></h2>
      
    </>
  )
}

export default App
