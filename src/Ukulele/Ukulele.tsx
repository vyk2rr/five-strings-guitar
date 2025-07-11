import React, { useState, useEffect } from 'react';
import type { tChord, tNoteWithOctave } from '../PianoBase/PianoBase.types';

interface UkuleleProps {
  chord?: tChord;
  onUnassignedNotes?: (notes: tChord) => void;
}

type tBestFit = {
  note: tNoteWithOctave;
  fret: number;
};

const strings = [
  { startNote: 'G4', thickness: 4, octave: 4 },
  { startNote: 'C4', thickness: 3, octave: 4 },
  { startNote: 'E4', thickness: 2.5, octave: 4 },
  { startNote: 'A4', thickness: 2, octave: 4 },
];

const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const noteColors: { [key: string]: string } = {
  'C': '#ff9999', // Pastel Red
  'C#': '#ffb399',
  'D': '#ffc999', // Pastel Orange
  'D#': '#ffdd99',
  'E': '#ffff99', // Pastel Yellow
  'F': '#d4ff99',
  'F#': '#b3ff99', // Pastel Green
  'G': '#99ff99',
  'G#': '#99ffb3',
  'A': '#99ffff', // Pastel Cyan
  'A#': '#99ddff',
  'B': '#99b3ff', // Pastel Blue
};

const getNoteColor = (note: string): string => {
  const noteName = note.replace(/\d+/, ''); 
  return noteColors[noteName] || '#ffffff'; 
};

const getNoteAtFret = (startNote: string, fret: number): tNoteWithOctave => {
  const noteOnly = startNote.replace(/\d+/, '');
  const octave = parseInt(startNote.match(/\d+/)?.[0] || '4');
  const startIndex = chromaticNotes.indexOf(noteOnly);
  const totalSemitones = startIndex + fret;
  const newNoteIndex = totalSemitones % 12;
  const newOctave = octave + Math.floor(totalSemitones / 12);
  return (chromaticNotes[newNoteIndex] + newOctave) as tNoteWithOctave;
};

const Ukulele: React.FC<UkuleleProps> = ({
  chord,
  onUnassignedNotes,
}) => {
  const [highlightedPositions, setHighlightedPositions] = useState(new Set<string>());

  useEffect(() => {
    const newHighlightedPositions = new Set<string>();
    const unassignedNotes = new Set(chord ? [...new Set(chord)] : []);
    const assignedNotes = new Set<string>();

    if (!chord || chord.length === 0) {
      setHighlightedPositions(new Set<string>());
      onUnassignedNotes?.([]);
      return;
    }

    for (let stringIndex = 0; stringIndex < strings.length; stringIndex++) {
      let bestFit: tBestFit | null = null;

      for (const chordNote of unassignedNotes) {
        if (assignedNotes.has(chordNote)) continue;

        for (let fret = 0; fret < 14; fret++) {
          const noteAtFret = getNoteAtFret(strings[stringIndex].startNote, fret);
          if (noteAtFret === chordNote) {
            // If this is the first valid note found for this string,
            // or if it's at a lower fret than the current best fit, update it.
            if (!bestFit || fret < bestFit.fret) {
              bestFit = { note: chordNote, fret: fret };
            }
            // Once we find the position for a note on a string, we don't need to check higher frets for it.
            break;
          }
        }
      }

      // If a best-fit note was found for this string after checking all unassigned notes, assign it.
      if (bestFit) {
        newHighlightedPositions.add(`${stringIndex}-${bestFit.fret}`);
        assignedNotes.add(bestFit.note);
        unassignedNotes.delete(bestFit.note);
      }
    }

    setHighlightedPositions(newHighlightedPositions);
    onUnassignedNotes?.(Array.from(unassignedNotes));

  }, [chord, onUnassignedNotes]);

  const stringHeight = 60;
  const fretWidth = 80;
  const topMargin = 20; // Espacio para los inlays
  const totalWidth = fretWidth * 14;
  const totalHeight = stringHeight * 5 + topMargin;

  return (
    <svg width={totalWidth} height={totalHeight}>
      {/* Líneas de contorno superior e inferior */}
      <line
        x1={0}
        y1={topMargin}
        x2={totalWidth}
        y2={topMargin}
        stroke="black"
        strokeWidth="2"
      />
      <line
        x1={0}
        y1={totalHeight}
        x2={totalWidth}
        y2={totalHeight}
        stroke="black"
        strokeWidth="2"
      />

      {/* Dibuja las cuerdas */}
      {strings.map((string, stringIndex) => (
        <g key={`string-${stringIndex}`}>
          <line
            data-testid="string-line"
            x1={0}
            y1={stringIndex * stringHeight + stringHeight / 2 + topMargin}
            x2={totalWidth}
            y2={stringIndex * stringHeight + stringHeight / 2 + topMargin}
            stroke="black"
            strokeWidth={string.thickness}
          />
        </g>
      ))}

      {/* Dibuja las líneas de los trastes */}
      {Array.from({ length: 14 }, (_, i) => {
        // La primera línea (cejuela) es más gruesa
        const isNut = i === 0;
        return (
          <line
            key={`fret-line-${i}`}
            data-testid={isNut ? 'fret-line' : `fret-line-${i}`}
            x1={(i + 1) * fretWidth}
            y1={topMargin}
            x2={(i + 1) * fretWidth}
            y2={totalHeight}
            stroke="black"
            strokeWidth={isNut ? 10 : 1}
          />
        );
      })}

      {/* Dibuja los puntos de referencia del mástil (inlays) en el borde superior */}
      {[3, 5, 7, 9].map(fret => (
        <circle
          key={`inlay-${fret}`}
          cx={fret * fretWidth + fretWidth / 2}
          cy={topMargin / 2}
          r={5}
          fill="#000"
        />
      ))}
      {/* Puntos dobles para el traste 12 */}
      <circle
        key="inlay-12-1"
        cx={12 * fretWidth + fretWidth * (3/8)}
        cy={topMargin / 2}
        r={6}
        fill="#000"
      />
      <circle
        key="inlay-12-2"
        cx={12 * fretWidth + fretWidth * (5/8)}
        cy={topMargin / 2}
        r={6}
        fill="#000"
      />


      {/* Dibuja los marcadores de nota (círculos) */}
      {strings.map((string, stringIndex) => (
        <g key={`notes-${stringIndex}`}>
          {Array.from({ length: 14 }, (_, fret) => {
            const note = getNoteAtFret(string.startNote, fret);
            const isHighlighted = highlightedPositions.has(`${stringIndex}-${fret}`);
            const x = fret * fretWidth + fretWidth / 2;
            const y = stringIndex * stringHeight + stringHeight / 2 + topMargin;
            const noteColor = getNoteColor(note);

            return (
              <g key={fret} data-testid={`note-marker-${stringIndex}-${fret}-${note}`}>
                {/* Círculo de fondo para el "outline" de color */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHighlighted ? 25 : 16}
                  fill={isHighlighted ? noteColor : 'white'}
                  stroke="black"
                  strokeWidth={isHighlighted ? 2 : 1}
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={isHighlighted ? "17" : "14"}
                  fill="black"
                  fontFamily="Arial, sans-serif"
                >
                  {note}
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
};

export default Ukulele;