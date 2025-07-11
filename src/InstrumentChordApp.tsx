import React, { useState } from 'react';
import FiveStringsGuitarApp from './FiveStringsGuitarApp';
import UkuleleApp from './UkuleleApp';

const InstrumentChordApp: React.FC = () => {
  const [instrument, setInstrument] = useState<'guitar' | 'ukulele'>('guitar');

  return (
    <div>
      <label>
        <input
          type="radio"
          value="guitar"
          checked={instrument === 'guitar'}
          onChange={() => setInstrument('guitar')}
        />
        Guitarra 5 cuerdas
      </label>
      <label>
        <input
          type="radio"
          value="ukulele"
          checked={instrument === 'ukulele'}
          onChange={() => setInstrument('ukulele')}
        />
        Ukulele
      </label>
      {instrument === 'guitar' ? <FiveStringsGuitarApp /> : <UkuleleApp />}
    </div>
  );
};

export default InstrumentChordApp;