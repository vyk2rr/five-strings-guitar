import React, { useState, useEffect } from 'react';
import type { tChord } from '../PianoBase/PianoBase.types';

interface FiveStringsGuitarProps {
  chord?: tChord;
  // This callback will be called with notes that couldn't be placed on the guitar.
  onUnassignedNotes?: (notes: string[]) => void;
}

const FiveStringsGuitar: React.FC<FiveStringsGuitarProps> = ({
  chord,
  onUnassignedNotes,
}) => {
  const [highlightedPositions, setHighlightedPositions] = useState(new Set<string>());

  const strings = [
    { startNote: 'D4', thickness: 4, octave: 4 },
    { startNote: 'A4', thickness: 3, octave: 4 },
    { startNote: 'E5', thickness: 2.5, octave: 5 },
    { startNote: 'A5', thickness: 2, octave: 5 },
    { startNote: 'D6', thickness: 1.5, octave: 6 }
  ];

  const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const getNoteAtFret = (startNote: string, fret: number) => {
    const noteOnly = startNote.replace(/\d+/, '');
    const octave = parseInt(startNote.match(/\d+/)?.[0] || '4');
    const startIndex = chromaticNotes.indexOf(noteOnly);
    const totalSemitones = startIndex + fret;
    const newNoteIndex = totalSemitones % 12;
    const newOctave = octave + Math.floor(totalSemitones / 12);
    return chromaticNotes[newNoteIndex] + newOctave;
  };

  useEffect(() => {
    const newHighlightedPositions = new Set<string>();
    const usedStrings = new Set<number>();
    const unassigned: string[] = [];

    if (!chord || chord.length === 0) {
      setHighlightedPositions(new Set<string>());
      onUnassignedNotes?.([]); // Report that there are no unassigned notes
      return;
    }

    // Use a copy of the chord to avoid potential mutation issues
    const chordToProcess = [...chord];

    for (const chordNote of chordToProcess) {
      let assigned = false;
      outerLoop:
      for (let fret = 0; fret < 14; fret++) {
        for (let stringIndex = 0; stringIndex < strings.length; stringIndex++) {
          if (usedStrings.has(stringIndex)) continue;

          const noteAtFret = getNoteAtFret(strings[stringIndex].startNote, fret);
          if (noteAtFret === chordNote) {
            newHighlightedPositions.add(`${stringIndex}-${fret}`);
            usedStrings.add(stringIndex);
            assigned = true;
            break outerLoop;
          }
        }
      }
      if (!assigned) {
        unassigned.push(chordNote);
      }
    }

    setHighlightedPositions(newHighlightedPositions);
    // Call the callback with the list of unassigned notes
    onUnassignedNotes?.(unassigned);

  }, [chord, onUnassignedNotes]); // Add onUnassignedNotes to dependency array

  const stringHeight = 60;
  const fretWidth = 80;
  const totalWidth = fretWidth * 14;
  const totalHeight = stringHeight * 5;

  return (
    <svg width={totalWidth} height={totalHeight}>
      {strings.map((string, stringIndex) => (
        <g key={stringIndex}>
          <line
            x1={0}
            y1={stringIndex * stringHeight + stringHeight / 2}
            x2={totalWidth}
            y2={stringIndex * stringHeight + stringHeight / 2}
            stroke="black"
            strokeWidth={string.thickness}
          />
          {Array.from({ length: 14 }, (_, fret) => {
            const note = getNoteAtFret(string.startNote, fret);
            const isHighlighted = highlightedPositions.has(`${stringIndex}-${fret}`);
            const x = fret * fretWidth + fretWidth / 2;
            const y = stringIndex * stringHeight + stringHeight / 2;

            return (
              <g key={fret}>
                <circle
                  cx={x}
                  cy={y}
                  r={15}
                  fill={isHighlighted ? 'yellow' : 'white'}
                  stroke="black"
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
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

export default FiveStringsGuitar;