import type { tChord, tNoteWithOctave } from "../PianoBase/PianoBase.types";
// Función para incrementar la octava de una nota, e.g. "D4" con shiftOctave("D4", 1) => "D5"
export function shiftOctave(note: tNoteWithOctave, shift: number): tNoteWithOctave {
  const noteBase = note.slice(0, -1);
  const octaveNumber = parseInt(note.slice(-1));
  return (noteBase + (octaveNumber + shift).toString()) as tNoteWithOctave;
}

export function spreadVoicingUkulele(chord: tChord): tChord {
  if (chord.length === 3) {
    // Triada: asignar una nota repetida o inversión
    const [i1, i2, i3] = chord;
    return [
      i1,              // cuerda 1 (G4)
      i2,              // cuerda 2 (C4)
      i3,              // cuerda 3 (E4)
      shiftOctave(i1, 1), // cuerda 4 (A4), repite tónica una octava arriba
    ];
  } else if (chord.length === 4) {
    // Cuatriada: cada nota en una cuerda
    const [i1, i2, i3, i4] = chord;
    return [
      i1, // G4
      i2, // C4
      i3, // E4
      i4, // A4
    ];
  }
  // Si el acorde tiene otra cantidad de notas, o no es lo esperado, se puede retornar tal cual:
  console.warn(`spreadVoicingUkulele: Unsupported chord size (${chord.length}). Returning the chord unchanged.`);
  return chord;
}