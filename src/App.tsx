import FiveStringsGuitar from "./FiveStringsGuitar/FiveStringsGuitar"
import PianoBase from "./PianoBase/PianoBase"

function App() {
  return (
    <div>
      <PianoBase highlightOnThePiano={['D4', 'A4', 'F#5', 'A5', 'D6']}/>
      <FiveStringsGuitar chord={['D4', 'A4', 'F#5', 'A5', 'D6']} />
    </div>
  )
}

export default App
