import { render } from '@testing-library/react';
import FiveStringsGuitar from './FiveStringsGuitar';

describe('FiveStringsGuitar', () => {
  it('renders without crashing', () => {
    render(<FiveStringsGuitar chord={[]} />);
  });

  it('renders with empty chord', () => {
    const { container } = render(<FiveStringsGuitar chord={[]} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    
    // No debería haber círculos amarillos (highlighted)
    const yellowCircles = container.querySelectorAll('circle[fill="yellow"]');
    expect(yellowCircles.length).toBe(0);
  });

  it('highlights only leftmost occurrence of each note', () => {
    const { container } = render(<FiveStringsGuitar chord={['D4', 'A4', 'F#4', 'A5', 'D6']} />);
    
    // Debería haber exactamente 5 círculos amarillos (uno por cada nota del acorde)
    const yellowCircles = container.querySelectorAll('circle[fill="yellow"]');
    expect(yellowCircles.length).toBe(5);
  });

  it('highlights single note correctly', () => {
    const { container } = render(<FiveStringsGuitar chord={['D4']} />);
    
    // Debería haber exactamente 1 círculo amarillo
    const yellowCircles = container.querySelectorAll('circle[fill="yellow"]');
    expect(yellowCircles.length).toBe(1);
  });

  it('handles duplicate notes in chord', () => {
    const { container } = render(<FiveStringsGuitar chord={['D4', 'D4', 'A4']} />);
    
    // Debería haber exactamente 2 círculos amarillos (D4 y A4, sin duplicar D4)
    const yellowCircles = container.querySelectorAll('circle[fill="yellow"]');
    expect(yellowCircles.length).toBe(2);
  });

  it('handles non-existent notes gracefully', () => {
    const { container } = render(<FiveStringsGuitar chord={['X1', 'Y2']} />);
    
    // No debería haber círculos amarillos para notas que no existen
    const yellowCircles = container.querySelectorAll('circle[fill="yellow"]');
    expect(yellowCircles.length).toBe(0);
  });

  it('prioritizes leftmost position across all strings', () => {
    // F#4 aparece en la primera cuerda en el traste 4 y puede aparecer en otra cuerda antes
    const { container } = render(<FiveStringsGuitar chord={['F#4']} />);
    
    const yellowCircles = container.querySelectorAll('circle[fill="yellow"]');
    expect(yellowCircles.length).toBe(1);
  });

  it('renders all strings with correct thickness', () => {
    const { container } = render(<FiveStringsGuitar chord={[]} />);
    
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBe(5);
    
    // Verificar que las líneas tienen el grosor correcto
    const thicknesses = Array.from(lines).map(line => line.getAttribute('stroke-width'));
    expect(thicknesses).toEqual(['4', '3', '2.5', '2', '1.5']);
  });

  it('renders all circles and text elements', () => {
    const { container } = render(<FiveStringsGuitar chord={[]} />);
    
    // Debería haber 5 cuerdas * 14 trastes = 70 círculos
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(70);
    
    // Debería haber 70 elementos de texto
    const texts = container.querySelectorAll('text');
    expect(texts.length).toBe(70);
  });

  it('has correct string tuning', () => {
    const { container } = render(<FiveStringsGuitar chord={[]} />);
    
    // Verificar que las cuerdas tienen la afinación correcta
    const texts = container.querySelectorAll('text');
    
    // Primera cuerda (D4) - primer traste debería ser D4
    const firstStringFirstFret = texts[0];
    expect(firstStringFirstFret.textContent).toBe('D4');
    
    // Segunda cuerda (A4) - primer traste debería ser A4
    const secondStringFirstFret = texts[14];
    expect(secondStringFirstFret.textContent).toBe('A4');
    
    // Tercera cuerda (E5) - primer traste debería ser E5
    const thirdStringFirstFret = texts[28];
    expect(thirdStringFirstFret.textContent).toBe('E5');
    
    // Cuarta cuerda (A5) - primer traste debería ser A5
    const fourthStringFirstFret = texts[42];
    expect(fourthStringFirstFret.textContent).toBe('A5');
    
    // Quinta cuerda (D6) - primer traste debería ser D6
    const fifthStringFirstFret = texts[56];
    expect(fifthStringFirstFret.textContent).toBe('D6');
  });
});