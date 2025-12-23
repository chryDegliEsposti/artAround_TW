import { useState } from 'react'

import Navbar from './components/Navbar.jsx'
import Content from './components/Content.jsx'
import Controller from './components/Controller.jsx'  


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1 className="text-3xl font-bold underline">Benvenuto in ArtAround Navigator! 💁</h1>
      <p>ArtAround ....descrizione servizio alla spot pubblicita'...</p>
      <h2><a href="/">Vai al Marketplace</a></h2>
      <Navbar/> 
      <Content/> 
      <Controller/> 
    </>
  )
}

export default App
