import { useState, useCallback, useMemo } from "react";
import PianoBase from "./PianoBase/PianoBase";
import type { tChord, tChordWithName, tNoteName } from "./PianoBase/PianoBase.types";
import { generateChordsForNote, getChordColor } from "./ChordPalette/ChordPalette.utils";
import FiveStringsGuitar from "./FiveStringsGuitar/FiveStringsGuitar";
import { spreadVoicing } from "./FiveStringsGuitar/FiveStringsGuitar.utils";

const ALL_NOTES: tNoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function FiveStringsGuitarApp() {
  const [note, setNote] = useState<tNoteName>("D");
  const [showInversions, setShowInversions] = useState(false);
  const octave = 4;
  
  const chords = useMemo(() => {
    const allChords = generateChordsForNote(note, octave);
    if (showInversions) {
      return allChords;
    }
    return allChords.filter(chord => !chord.name.includes('('));
  }, [note, octave, showInversions]);
  
  const [selectedChordInfo, setSelectedChordInfo] = useState<tChordWithName | null>(null);
  const [unassignedNotes, setUnassignedNotes] = useState<tChord>([]);
  
  const voicedChord = useMemo(() => {
    if (!selectedChordInfo) return [];
    return spreadVoicing(selectedChordInfo.chord);
  }, [selectedChordInfo]);

  const handleUnassignedNotes = useCallback((newUnassigned: tChord) => {
    setUnassignedNotes(currentUnassigned => {
      if (JSON.stringify(currentUnassigned) === JSON.stringify(newUnassigned)) {
        return currentUnassigned;
      }
      return newUnassigned;
    });
  }, []);

  const handleChordClick = (chordItem: tChordWithName) => {
    setSelectedChordInfo(chordItem);
  };

  const handleNoteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setNote(event.target.value as tNoteName);
    setSelectedChordInfo(null);
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

      {selectedChordInfo && (
        <h1>
          {selectedChordInfo.name} — (
          {voicedChord.map((note, index) => (
            <span key={`${note}-${index}`}>
              {unassignedNotes.includes(note) ? (
                <span className="unassigned-note">{note}</span>
              ) : (
                note
              )}
              {index < voicedChord.length - 1 ? ', ' : ''}
            </span>
          ))}
          )
        </h1>
      )}

      <FiveStringsGuitar
        chord={voicedChord}
        onUnassignedNotes={handleUnassignedNotes}
      />

      <div className="controls-container">
        <label htmlFor="note-select" className="root-note-label">
          Nota Raíz: 
        </label>
        <select 
          id="note-select" 
          value={note} 
          onChange={handleNoteChange}
          className="note-selector"
        >
          {ALL_NOTES.map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <button
          onClick={() => setShowInversions(!showInversions)}
          className="toggle-inversions-button"
          data-inversions-shown={showInversions}
        >
          {showInversions ? 'Ocultar Inversiones' : 'Mostrar Inversiones'}
        </button>
      </div>

      <div className="chord-palette">
        {chords.map((chordItem) => {
          const isSelected = selectedChordInfo?.id === chordItem.id;
          const chordButtonClasses = `chord-button ${isSelected ? 'selected' : ''}`;
          
          return (
            <button
              key={chordItem.id}
              className={chordButtonClasses}
              style={{
                '--chord-bg': getChordColor(
                  chordItem.rootNote,
                  chordItem.quality,
                  chordItem.chord
                ),
              } as React.CSSProperties}
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

export default FiveStringsGuitarApp;
