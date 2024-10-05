import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// components
import Navbar from './components/navbar/Navbar'
import Intro from './components/intro/Intro'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar />
      <Intro />
    </>
  )
}

export default App
