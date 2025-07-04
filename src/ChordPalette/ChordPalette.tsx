import React, { useState, useCallback } from "react";
import type { tChordWithName, tNote, tOctaveRange, tChord } from "../PianoBase/PianoBase.types";
// Importar simplifyNoteName
import { generateChordsForNote, filterChords, getChordColor, simplifyNoteName } from "./ChordPalette.utils";
import "./chordPalette.css";

type ChordPaletteParams = {
  currentChord: tChord;
  setCurrentChord: (chord: tChord) => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  octave: tOctaveRange;
};

interface tChordPaletteProps {
  params?: ChordPaletteParams; // Hacer params opcional
  showNotes?: boolean;
  showName?: boolean;
  debug?: boolean;
}

export default function ChordPalette({
  params, // params puede ser undefined
  showNotes = true,
  showName = true,
  debug = false
}: tChordPaletteProps) {
  // Valores por defecto para params y sus propiedades
  const defaultOctave: tOctaveRange = 4; // Ejemplo de octava por defecto
  const defaultSetChord = () => {
    // console.warn("ChordPalette: setCurrentChord not provided, using no-op default.");
  };
  const defaultSetColor = () => {
    // console.warn("ChordPalette: setCurrentColor not provided, using no-op default.");
  };

  const {
    currentChord = [], // Valor por defecto si currentChord no está en params
    setCurrentChord = defaultSetChord,
    currentColor = "#cccccc", // Valor por defecto si currentColor no está en params
    setCurrentColor = defaultSetColor,
    octave = defaultOctave // Valor por defecto si octave no está en params
  } = params || {}; // Si params es undefined, usar un objeto vacío para la desestructuración

  const notes: tNote[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const [showInversions, setShowInversions] = useState<boolean>(false);
  const [selectedChordId, setSelectedChordId] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");

  const handleChordClick = useCallback((chord: tChordWithName) => {
    setCurrentChord(chord.chord);
    const baseNoteForColor = simplifyNoteName(chord.chord[0]);
    setCurrentColor(
      getChordColor(
        baseNoteForColor,
        chord.quality,
        chord.chord
      )
    );
    setSelectedChordId(chord.id);
  }, [setCurrentChord, setCurrentColor, setSelectedChordId]);

  // Drag and drop handlers
  const handleDragStart = (event: React.DragEvent, chord: tChordWithName) => {
    event.dataTransfer.setData('application/json', JSON.stringify(chord));
  };

  return (
    <>
      <button onClick={() => setShowInversions(prev => !prev)}>
        {showInversions ? "Ocultar inversiones" : "Mostrar inversiones"}
      </button>

      <div className="search-container">
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter chords (e.g. 'C', 'C E', 'C-E')"
          className="chord-search"
        />
      </div>

      {debug && (
        <>
          <h3>Debug Info</h3>
          currentChord: {currentChord.join(", ")}<br />
          currentColor: {currentColor}<br />
          showInversions: {showInversions ? "si" : "no"}<br />
          selectedChordId: {selectedChordId}<br />
          searchFilter: {searchFilter}<br />
        </>
      )}
      <div className="chord-columns">
        {notes.map(note => {
          const chordsForNote: tChordWithName[] = generateChordsForNote(note, octave);
          const filteredChords = filterChords(chordsForNote, searchFilter)
            .filter(chord => showInversions || !chord.id.includes('_inv'));

          // Solo mostrar la columna si tiene acordes que coincidan con el filtro
          if (filteredChords.length === 0 && searchFilter) return null;

          return (
            <div key={note} className="chord-column">
              <h2>{note} Chords</h2>
              {filteredChords.map(chord => {
                const isInvestment = chord.id.includes('_inv'); // Mantener para la clase CSS 'inverted'
                // La nota base para el color será la nota más grave de la formación actual del acorde.
                const baseNoteForColor = simplifyNoteName(chord.chord[0]);
                return (
                  <button
                    key={chord.id}
                    onClick={() => handleChordClick(chord)}
                    // Usar 'background' para soportar linear-gradient
                    style={{
                      background: getChordColor(
                        baseNoteForColor,
                        chord.quality,
                        chord.chord // Siempre pasar las notas del acorde para el degradado
                      )
                    }}
                    className={`chord-button ${isInvestment ? 'inverted' : ''} ${selectedChordId === chord.id ? 'selected' : ''}`}
                    draggable
                    onDragStart={e => handleDragStart(e, chord)}
                  >
                    {showName ? <div className="chord-name">{chord.name}</div> : ''}
                    {showNotes ? <div className="chord-notes">{chord.displayNotes}</div> : ''}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}