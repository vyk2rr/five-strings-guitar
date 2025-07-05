import { useState, useCallback, useMemo } from "react";
import PianoBase from "./PianoBase/PianoBase";
import type { tChord, tChordWithName, tNoteName } from "./PianoBase/PianoBase.types";
import { generateChordsForNote, getChordColor } from "./ChordPalette/ChordPalette.utils";
import FiveStringsGuitar from "./FiveStringsGuitar/FiveStringsGuitar";
import { spreadVoicing } from "./FiveStringsGuitar/FiveStringsGuitar.utils";

const ALL_NOTES: tNoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function App() {
  // Convert 'note' to a state variable
  const [note, setNote] = useState<tNoteName>("D");
  const octave = 4; // Octava base
  
  // 'chords' will now be recalculated automatically whenever 'note' changes
  const chords = generateChordsForNote(note, octave);
  
  // Guardar el objeto completo del acorde seleccionado
  const [selectedChordInfo, setSelectedChordInfo] = useState<tChordWithName | null>(null);
  // State to hold notes that couldn't be assigned to the guitar
  const [unassignedNotes, setUnassignedNotes] = useState<tChord>([]);
  const voicedChord = useMemo(() => {
    if (!selectedChordInfo) {
      return [];
    }
    return spreadVoicing(selectedChordInfo.chord);
  }, [selectedChordInfo]);
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
  }, []);

  const handleChordClick = (chordItem: tChordWithName) => {
    setSelectedChordInfo(chordItem);
  };

  // Handler for the new dropdown
  const handleNoteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setNote(event.target.value as tNoteName);
    setSelectedChordInfo(null); // Reset selected chord when the root note changes
  };

  return (
    <div>
      <div className="piano-container">
        <PianoBase
          highlightOnThePiano={voicedChord}
          errorNotes={unassignedNotes}
          octaves={4}
        />
      </div>

      {selectedChordInfo && <h2>{selectedChordInfo.name} — ({voicedChord.join(", ")})</h2>}

      <FiveStringsGuitar
        chord={voicedChord}
        onUnassignedNotes={handleUnassignedNotes}
      />

      {/* The new dropdown to select the note */}
      <div style={{ margin: '20px 0', fontSize: '1.2rem' }}>
        <label htmlFor="note-select" style={{ marginRight: '10px', fontWeight: 'bold' }}>
          Nota Raíz: 
        </label>
        <select 
          id="note-select" 
          value={note} 
          onChange={handleNoteChange}
          style={{
            padding: '8px',
            fontSize: '1.1rem',
            borderRadius: '8px',
            border: '1px solid #ccc'
          }}
        >
          {ALL_NOTES.map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      <div>
        {chords.map((chordItem) => {
          const isSelected = selectedChordInfo?.id === chordItem.id;
          return (
            <button
              key={chordItem.id}
              style={{
                background: getChordColor(
                  chordItem.rootNote,
                  chordItem.quality,
                  chordItem.chord
                ),
                transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 0.2s ease',
                border: isSelected ? '2px solid black' : '1px solid grey',
                fontWeight: isSelected ? 'bold' : 'normal',
                padding: '8px 16px',
                margin: '4px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onClick={() => handleChordClick(chordItem)}
            >
              {chordItem.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default App;
