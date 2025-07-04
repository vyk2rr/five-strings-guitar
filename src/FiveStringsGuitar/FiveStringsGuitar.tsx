import React from 'react';

interface FiveStringsGuitarProps {
  chord?: string[];
}

const FiveStringsGuitar: React.FC<FiveStringsGuitarProps> = ({ chord }) => {
  // Definición de las cuerdas con sus notas de inicio y grosor
  const strings = [
    { startNote: 'D4', thickness: 4, octave: 4 },
    { startNote: 'A4', thickness: 3, octave: 4 },
    { startNote: 'E5', thickness: 2.5, octave: 5 }, 
    { startNote: 'A5', thickness: 2, octave: 5 },
    { startNote: 'D6', thickness: 1.5, octave: 6 } 
  ];

  // Notas cromáticas para calcular las notas de cada traste
  const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Función para obtener la nota en un traste específico
  const getNoteAtFret = (startNote: string, fret: number) => {
    const noteOnly = startNote.replace(/\d+/, '');
    const octave = parseInt(startNote.match(/\d+/)?.[0] || '4');
    
    const startIndex = chromaticNotes.indexOf(noteOnly);
    const totalSemitones = startIndex + fret;
    
    const newNoteIndex = totalSemitones % 12;
    const newOctave = octave + Math.floor(totalSemitones / 12);
    
    return chromaticNotes[newNoteIndex] + newOctave;
  };

  // Calcular qué posiciones deben ser resaltadas (solo la aparición más a la izquierda de cada nota)
  const getHighlightedPositions = () => {
    const highlightedPositions = new Set<string>();
    const usedStrings = new Set<number>(); // Para no permitir más de una nota por cuerda

    if (!chord || chord.length === 0) return highlightedPositions;

    // Para cada nota del acorde, buscar su posición más a la izquierda en cuerdas disponibles
    for (const chordNote of chord) {
      // Explorar cada traste
      outerLoop:
      for (let fret = 0; fret < 14; fret++) {
        // Explorar cuerdas en orden
        for (let stringIndex = 0; stringIndex < strings.length; stringIndex++) {
          // Si esta cuerda ya se usó, continuar con la siguiente
          if (usedStrings.has(stringIndex)) continue;

          const noteAtFret = getNoteAtFret(strings[stringIndex].startNote, fret);
          if (noteAtFret === chordNote) {
            // Marcar la posición
            highlightedPositions.add(`${stringIndex}-${fret}`);
            // Marcar la cuerda como usada
            usedStrings.add(stringIndex);
            // Dejar de buscar esta nota
            break outerLoop;
          }
        }
      }
    }

    return highlightedPositions;
  };

  const highlightedPositions = getHighlightedPositions();

  const stringHeight = 60; // Altura de cada cuerda
  const fretWidth = 80; // Ancho de cada traste
  const totalWidth = fretWidth * 14; // 14 trastes
  const totalHeight = stringHeight * 5; // 5 cuerdas

  return (
    <svg width={totalWidth} height={totalHeight}>
      {strings.map((string, stringIndex) => (
        <g key={stringIndex}>
          {/* Dibujar la cuerda */}
          <line
            x1={0}
            y1={stringIndex * stringHeight + stringHeight / 2}
            x2={totalWidth}
            y2={stringIndex * stringHeight + stringHeight / 2}
            stroke="black"
            strokeWidth={string.thickness}
          />
          
          {/* Dibujar los trastes y círculos con notas */}
          {Array.from({ length: 14 }, (_, fret) => {
            const note = getNoteAtFret(string.startNote, fret);
            const isHighlighted = highlightedPositions.has(`${stringIndex}-${fret}`);
            const x = fret * fretWidth + fretWidth / 2;
            const y = stringIndex * stringHeight + stringHeight / 2;
            
            return (
              <g key={fret}>
                {/* Círculo */}
                <circle
                  cx={x}
                  cy={y}
                  r={15}
                  fill={isHighlighted ? 'yellow' : 'white'}
                  stroke="black"
                  strokeWidth={1}
                />
                
                {/* Texto con la nota */}
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