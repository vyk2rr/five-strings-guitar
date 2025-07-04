import { useState } from "react";
import PianoBase from "./PianoBase/PianoBase";
import type { tChord } from "./PianoBase/PianoBase.types";
import { generateChordsForNote, getChordColor } from "./ChordPalette/ChordPalette.utils";
import FiveStringsGuitar from "./FiveStringsGuitar/FiveStringsGuitar";
import { spreadVoicing } from "./FiveStringsGuitar/FiveStringsGuitar.utils";

function App() {
  const note = "D"; // Nota base
  const octave = 4; // Octava base
  const chords = generateChordsForNote(note, octave); // Generar acordes para la nota
  const [selectedChord, setSelectedChord] = useState<tChord>([]);

  return (
    <div>
      {/* PianoBase y FiveStringsGuitar reciben el acorde seleccionado */}
      <PianoBase highlightOnThePiano={selectedChord} />
      <FiveStringsGuitar chord={selectedChord} />

      <ul>
        {chords.map((chordItem) => (
          <li key={chordItem.id}>
            <button
              style={{
                background: getChordColor(
                  chordItem.rootNote,
                  chordItem.quality,
                  chordItem.chord
                ),
              }}
              // Al hacer clic, se acomoda el acorde con spreadVoicing
              onClick={() => setSelectedChord(spreadVoicing(chordItem.chord))}
            >
              {chordItem.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
