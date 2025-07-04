import React, { useState, useEffect } from 'react';
import type { tChord, tNoteWithOctave } from '../PianoBase/PianoBase.types';

interface FiveStringsGuitarProps {
  chord?: tChord;
  onUnassignedNotes?: (notes: tChord) => void;
}

type tBestFit = {
  note: tNoteWithOctave;
  fret: number;
};

const strings = [
  { startNote: 'D4', thickness: 4, octave: 4 },
  { startNote: 'A4', thickness: 3, octave: 4 },
  { startNote: 'E5', thickness: 2.5, octave: 5 },
  { startNote: 'A5', thickness: 2, octave: 5 },
  { startNote: 'D6', thickness: 1.5, octave: 6 }
];

const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const getNoteAtFret = (startNote: string, fret: number): tNoteWithOctave => {
  const noteOnly = startNote.replace(/\d+/, '');
  const octave = parseInt(startNote.match(/\d+/)?.[0] || '4');
  const startIndex = chromaticNotes.indexOf(noteOnly);
  const totalSemitones = startIndex + fret;
  const newNoteIndex = totalSemitones % 12;
  const newOctave = octave + Math.floor(totalSemitones / 12);
  return (chromaticNotes[newNoteIndex] + newOctave) as tNoteWithOctave;
};

const FiveStringsGuitar: React.FC<FiveStringsGuitarProps> = ({
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