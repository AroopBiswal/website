import { useState } from 'react'
import './Intro.css'

function Intro() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Hi! I'm Aroop</h1>
      <h1>I'm a Software Engineer</h1>
    </>
  )
}

export default Intro
