import React from 'react';

interface FiveStringsGuitarProps {
  chord?: string[];
}

const FiveStringsGuitar: React.FC<FiveStringsGuitarProps> = ({ chord }) => {
  // Definición de las cuerdas con sus notas de inicio y grosor
  const strings = [
    { startNote: 'D4', thickness: 4, octave: 4 },
    { startNote: 'A4', thickness: 3, octave: 4 },
    { startNote: 'E5', thickness: 2.5, octave: 5 },  // Cambiado de E4 a E5
    { startNote: 'A5', thickness: 2, octave: 5 },
    { startNote: 'D6', thickness: 1.5, octave: 6 }   // Cambiado de D5 a D6
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
    const usedNotes = new Set<string>();
    
    if (!chord || chord.length === 0) return highlightedPositions; // Si no hay acorde, no resaltar nada

    // Para cada nota del acorde, encontrar su posición más a la izquierda
    for (const chordNote of chord) {
      if (usedNotes.has(chordNote)) continue; // Ya procesamos esta nota
      
      let leftmostPosition: { stringIndex: number; fret: number } | null = null;
      
      // Buscar en todos los trastes (de izquierda a derecha)
      for (let fret = 0; fret < 14; fret++) {
        // Buscar en todas las cuerdas para este traste
        for (let stringIndex = 0; stringIndex < strings.length; stringIndex++) {
          const note = getNoteAtFret(strings[stringIndex].startNote, fret);
          
          if (note === chordNote) {
            leftmostPosition = { stringIndex, fret };
            break; // Encontramos la primera aparición en este traste
          }
        }
        
        if (leftmostPosition) break; // Ya encontramos la posición más a la izquierda
      }
      
      if (leftmostPosition) {
        highlightedPositions.add(`${leftmostPosition.stringIndex}-${leftmostPosition.fret}`);
        usedNotes.add(chordNote);
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