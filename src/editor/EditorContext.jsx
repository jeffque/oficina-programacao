import { createContext, useContext, useEffect, useState, useImperativeHandle, forwardRef, useCallback, useRef } from 'react';

const TABULEIRO_DEFAULT_WIDTH = 10;
const TABULEIRO_DEFAULT_HEIGHT = 10;

export const DIREÇÕES = {
	DIREITA: 'DIREITA',
	TRAS: 'TRAS',
	ESQUERDA: 'ESQUERDA',
	FRENTE: 'FRENTE',
}

const deltas = {
  [DIREÇÕES.DIREITA]: {x: 1, y: 0},
  [DIREÇÕES.TRAS]: {x: 0, y: 1},
  [DIREÇÕES.ESQUERDA]: {x: -1, y: 0},
  [DIREÇÕES.FRENTE]: {x: 0, y: -1},
};

const buildInitialState = () => {
	const tabuleiro = {
		max_rows: TABULEIRO_DEFAULT_WIDTH,
		max_lines: TABULEIRO_DEFAULT_HEIGHT,
	}

	
	const tartaruga = {
		x: 3,
		y: 3,
		giro: DIREÇÕES.DIREITA,
	}

  const getAppleXPosition = () => {
    const x = Math.floor(Math.random() * tabuleiro.max_rows);
    return x === tartaruga.x ? getAppleXPosition() : x;
  }

  const getAppleYPosition = () => {
    const y = Math.floor(Math.random() * tabuleiro.max_lines);
    return y === tartaruga.y ? getAppleYPosition() : y;
  }

  const apple = {
    x: getAppleXPosition(),
    y: getAppleYPosition(),
  }

	const logs = [];

	return {
		tabuleiro,
		tartaruga,
    apple,
		logs,
	}
}

export const getTartarugaPosition = (tartaruga) => {
    const { giro } = tartaruga;
    const giroIndex = Object.keys(DIREÇÕES).indexOf(giro);
    return giroIndex;
}

export const useEditor = () => useContext(EditorContext);

export const EditorContext = createContext(null);
export const EditorProvider = forwardRef(({ children }, ref) => {
  const steps = useRef([]);
	const [state, setState] = useState(() => buildInitialState());

  const tartarugaTurnLeft = (tartaruga) => {
    const giroIndex = getTartarugaPosition(state.tartaruga);
    const newGiroIndex = (giroIndex + 1) % 4;
    const newGiro = DIREÇÕES[newGiroIndex];
    return { ...tartaruga, giro: newGiro };
  }

  const tartarugaTurnRight = (tartaruga) => {
    const giroIndex = getTartarugaPosition(tartaruga);
    const newGiroIndex = (giroIndex + 3) % 4;
    const newGiro = DIREÇÕES[newGiroIndex];
    return { ...tartaruga, giro: newGiro };
  }

  const tartarugaGoAhead = (tartaruga) => {
    const delta = deltas[state.tartaruga.giro]
    const newX = tartaruga.x + delta.x;
    const newY = tartaruga.y + delta.y;

    return {
      ...tartaruga,
      x: newX > state.tabuleiro.max_rows - 1 ? state.tabuleiro.max_rows - 1 : newX,
      y: newY > state.tabuleiro.max_lines - 1 ? state.tabuleiro.max_lines - 1 : newY,
    }
  }

  const tartarugaGoBack = (tartaruga) => {
    const delta = deltas[state.tartaruga.giro]
    const newX = state.tartaruga.x - delta.x;
    const newY = state.tartaruga.y - delta.y;

    return {
      ...tartaruga,
      x: newX < 0 ? 0 : newX,
      y: newY < 0 ? 0 : newY,
    }
  }

  const value = [state]

  useEffect(() => {
    globalThis.tartaruga = {
      girarParaEsquerda: () => steps.current.push(DIREÇÕES.ESQUERDA), 
      girarParaDireita: () => steps.current.push(DIREÇÕES.DIREITA), 
      irParaFrente: () => steps.current.push(DIREÇÕES.FRENTE), 
      irParaTras: () => steps.current.push(DIREÇÕES.TRAS), 
    }
  }, []);

  useImperativeHandle(
    ref, 
    () => ({
      run: (script) => {
        steps.current = [];
        console.log('Running the program...', script);
        eval(script);

        const isSameX = state.tartaruga.x === state.apple.x;
        const isSameY = state.tartaruga.y === state.apple.y;
        if (isSameX && isSameY) {
          console.log('The apple is on the same position as the tartaruga, so the program will not run.')
          return;
        }

        const handleSteps = (step, tartaruga) => {
          if (step === DIREÇÕES.ESQUERDA) {
            return tartarugaTurnLeft(tartaruga);
          }
      
          if (step === DIREÇÕES.DIREITA) {
            return tartarugaTurnRight(tartaruga);
          }
      
          if (step === DIREÇÕES.FRENTE) {
            return tartarugaGoAhead(tartaruga);
          }
      
          if (step === DIREÇÕES.TRAS) {
            return tartarugaGoBack(tartaruga);
          }
        }

        let currentTartarugaState = state.tartaruga;
        console.log('Starting running the program...')
        steps.current.forEach(async (step, i) => {
          console.log('Step:', i + 1, step);
          const newTartarugaState = handleSteps(step, currentTartarugaState);
          currentTartarugaState = newTartarugaState;
        });

        setState(s => ({
          ...s,
          tartaruga: currentTartarugaState,
        }));
      }
    }),
  );

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  )
});