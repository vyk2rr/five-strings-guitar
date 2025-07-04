import type { tChord, tNoteWithOctave } from "../PianoBase/PianoBase.types";
// Función para incrementar la octava de una nota, e.g. "D4" con shiftOctave("D4", 1) => "D5"
export function shiftOctave(note: tNoteWithOctave, shift: number): tNoteWithOctave {
  const noteBase = note.slice(0, -1);
  const octaveNumber = parseInt(note.slice(-1));
  return (noteBase + (octaveNumber + shift).toString()) as tNoteWithOctave;
}

export function spreadVoicing(chord: tChord): tChord {
  if (chord.length === 3) {
    // Triada
    const [i1, i2, i3] = chord;
    return [
      // Mano izquierda
      i1,         // primera nota
      i3,         // tercera nota
      // Mano derecha
      shiftOctave(i2, 1),
      shiftOctave(i3, 1),
      shiftOctave(i1, 2),
    ];
  } else if (chord.length === 4) {
    // Cuatriada
    const [i1, i2, i3, i4] = chord;
    return [
      // Mano izquierda
      i1,         // primera nota
      i3,         // tercera nota
      // Mano derecha
      shiftOctave(i2, 1),
      shiftOctave(i4, 1),
      shiftOctave(i3, 1),
      shiftOctave(i1, 2),
    ];
  }
  // Si el acorde tiene otra cantidad de notas, o no es lo esperado, se puede retornar tal cual:
  console.warn(`spreadVoicing: Unsupported chord size (${chord.length}). Returning the chord unchanged.`);
  return chord;
}