const triggerAttackReleaseMock = jest.fn();
const ReverbToDestinationMock = jest.fn();
const synthDisposeMock = jest.fn();
const filterDisposeMock = jest.fn();
const compressorDisposeMock = jest.fn();

const transportMock = {
  bpm: { value: 120 },
  start: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
  cancel: jest.fn(),
  state: 'stopped',
  scheduleOnce: jest.fn((callback) => callback()),
  position: 0,
};

const destinationMock = {
  volume: { value: 0 },
  chain: jest.fn(),
  toDestination: jest.fn(),
};

function allowNewless(Constructor) {
  return function (...args) {
    if (!(this instanceof Constructor)) {
      const instance = new Constructor(...args);
      return instance;
    }
    Constructor.apply(this, args);
  };
}

function Synth(...args) {
  this.dispose = jest.fn();
  this.toDestination = jest.fn(() => this);
  this.connect = jest.fn(() => this);
}

function PolySynth(...args) {
  this.triggerAttackRelease = triggerAttackReleaseMock;
  this.chain = jest.fn(() => this);
  this.connect = jest.fn(() => this);
  this.dispose = jest.fn();
  this.toDestination = jest.fn(() => this);
}

// --- AÑADE ESTA FUNCIÓN ---
function Frequency(note) {
  const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteMatch = note.match(/([A-G]#?)(\d+)/);
  if (!noteMatch) return { transpose: () => ({ toNote: () => 'C4' }) };

  const [, noteName, octaveStr] = noteMatch;
  const octave = parseInt(octaveStr, 10);

  return {
    transpose: jest.fn((interval) => {
      const startIndex = chromatic.indexOf(noteName);
      if (startIndex === -1) return { toNote: () => 'C4' };

      const totalSemitones = startIndex + interval;
      const newNoteIndex = totalSemitones % 12;
      const octaveOffset = Math.floor(totalSemitones / 12);
      const newNoteName = chromatic[newNoteIndex];
      const newOctave = octave + octaveOffset;
      
      return {
        toNote: jest.fn(() => `${newNoteName}${newOctave}`),
      };
    }),
  };
}
// --- FIN DE LA FUNCIÓN AÑADIDA ---

function Filter(...args) {
  this.dispose = filterDisposeMock;
}
function Compressor(...args) {
  this.dispose = compressorDisposeMock;
}
function Reverb(...args) {
  this.toDestination = ReverbToDestinationMock;
  this.dispose = jest.fn();
}
function Time(value) {
  return {
    toMilliseconds: jest.fn(() => 500),
    toSeconds: jest.fn(() => 0.5),
    toNotation: jest.fn(() => '4n'),
  };
}

function NoiseSynth(...args) {
  this.triggerAttackRelease = triggerAttackReleaseMock;
  this.dispose = synthDisposeMock;
  this.connect = jest.fn(() => this);
  this.volume = { value: 0 };
}

function Gain(...args) {
  this.connect = jest.fn(() => this);
  this.dispose = jest.fn();
}

const Part = jest.fn(() => {
  return {
    start: jest.fn(),
    stop: jest.fn(),
    dispose: jest.fn(),
    events: [],
    callback: jest.fn(),
  };
})

module.exports = {
  __esModule: true,
  Part,
  Synth: allowNewless(Synth),
  PolySynth: PolySynth,
  Filter: allowNewless(Filter),
  Compressor: allowNewless(Compressor),
  Reverb: allowNewless(Reverb),
  Time: allowNewless(Time),
  NoiseSynth: allowNewless(NoiseSynth),
  Gain: allowNewless(Gain),
  Frequency: allowNewless(Frequency),

  now: jest.fn(() => 500),
  start: jest.fn(() => Promise.resolve()),

  getTransport: () => transportMock,
  getDestination: () => destinationMock,

  triggerAttackReleaseMock,
  ReverbToDestinationMock,
  synthDisposeMock,
  filterDisposeMock,
  compressorDisposeMock,
};