import { useState, useCallback } from "react";
import PianoBase from "./PianoBase/PianoBase";
import type { tChord, tChordWithName } from "./PianoBase/PianoBase.types";
import { generateChordsForNote, getChordColor } from "./ChordPalette/ChordPalette.utils";
import FiveStringsGuitar from "./FiveStringsGuitar/FiveStringsGuitar";
import { spreadVoicing } from "./FiveStringsGuitar/FiveStringsGuitar.utils";

function App() {
  const note = "D"; // Nota base
  const octave = 4; // Octava base
  const chords = generateChordsForNote(note, octave); // Generar acordes para la nota
  const [selectedChord, setSelectedChord] = useState<tChord>([]);
  // State to hold notes that couldn't be assigned to the guitar
  const [unassignedNotes, setUnassignedNotes] = useState<tChord>([]);

  // Memoized callback to prevent infinite loops.
  // It only updates the state if the new array of unassigned notes is different from the current one.
  const handleUnassignedNotes = useCallback((newUnassigned: tChord) => {
    setUnassignedNotes(currentUnassigned => {
      if (currentUnassigned.length === newUnassigned.length &&
          currentUnassigned.every((note, index) => note === newUnassigned[index])) {
        return currentUnassigned; // Return the same state to prevent re-render
      }
      return newUnassigned; // Update state only when it has changed
    });
  }, []); // Empty dependency array is correct here.

  const handleChordClick = (chordItem: tChordWithName) => {
    const voicedChord = spreadVoicing(chordItem.chord);
    setSelectedChord(voicedChord);
  };

  return (
    <div>
      {/* PianoBase now receives the unassigned notes to highlight them as errors */}
      <PianoBase
        highlightOnThePiano={selectedChord}
        errorNotes={unassignedNotes}
        octaves={4}
      />
      {/* FiveStringsGuitar receives the callback to report unassigned notes */}
      <FiveStringsGuitar
        chord={selectedChord}
        onUnassignedNotes={handleUnassignedNotes}
      />


<div>
unassignedNotes: {unassignedNotes.join(", ")}
</div>

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
              onClick={() => handleChordClick(chordItem)}
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
