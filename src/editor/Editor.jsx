import { useRef, useState, useEffect } from 'react';
import * as React from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import cobalt from 'monaco-themes/themes/Cobalt.json';
import styles from './Editor.module.css';
import {Board} from './Board';

/** 
 * based on https://github.com/brijeshb42/monaco-playground/
 * 
 */

const LOCAL_STORAGE_KEY = "code-tartaruga";

function tartarugaInicial() {
	return {x:3, y:3, giro: "DIREITA"}
}

const pomoInicial = (() => {
	const tini = tartarugaInicial()
	let xl, yl
	do {
		xl = Math.floor(Math.random()*10)
		yl = Math.floor(Math.random()*10)
	} while (xl == tini.x && yl == tini.y)
	const x = xl
	const y = yl

	console.log(`criando o pomo inicial... x ${x} y ${y}`)
	return () => ({x, y})
})()

function giro_valido(giro) {
	if (typeof giro != 'number') {
		return false
	}
	return 0 <= giro && giro < 4
}

function buildGame({tartarugaIni, pomoIni }) {
	let tartaruga = {...tartarugaIni}
	let pomo = {...pomoIni}

	const rumos = ["DIREITA", "CIMA", "ESQUERDA", "BAIXO"]
	const deltas = [{x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 0, y: -1}]
	const eventos = []
	function adicionaEvento() {
		eventos.push({tartaruga: {...tartaruga}})
	}

	if (!tartaruga.hasOwnProperty("giro_pos")) {
		if (tartaruga.hasOwnProperty("giro")) {
			tartaruga.giro_pos = rumos.indexOf(tartaruga.giro)
		} else {
			tartaruga.giro_pos = 0
		}
	}
	if (!giro_valido(tartaruga.giro_pos)) {
		tartaruga.giro_pos = 0
	}
	tartaruga.giro = rumos[tartaruga.giro_pos]


	adicionaEvento()

	tartaruga.girar_esquerda = () => {
		tartaruga.giro_pos = (tartaruga.giro_pos + 1) % 4
		tartaruga.giro = rumos[tartaruga.giro_pos]
		adicionaEvento()
	}
	tartaruga.girar_direita = () => {
		tartaruga.giro_pos = (tartaruga.giro_pos + 3) % 4
		tartaruga.giro = rumos[tartaruga.giro_pos]
		adicionaEvento()
	}
	tartaruga.frente = () => {
		const delta = deltas[tartaruga.giro_pos]
		tartaruga.x += delta.x
		tartaruga.y += delta.y
		adicionaEvento()
	}

	return {tartaruga, pomo, eventos}
}

/*
tartaruga.frente()
tartaruga.girar_esquerda()
tartaruga.girar_esquerda()
tartaruga.girar_esquerda()
tartaruga.girar_esquerda()

console.log(tartaruga)
tartaruga.frente()
tartaruga.frente()
tartaruga.frente()
console.log(tartaruga)

tartaruga.girar_esquerda()
console.log(tartaruga)

tartaruga.frente()
tartaruga.frente()
tartaruga.frente()
console.log(tartaruga)
*/

const base = `
( () => {
	const {tartaruga, pomo, eventos} = buildGame({ tartarugaIni: tartarugaInicial(), pomoIni: pomoInicial() });

	{
		const eventos = undefined;
		{
`

const fim = `
		}
	}

	return eventos
})()
`

function getValorEditor() {
	const locallyStoredValue = localStorage.getItem(LOCAL_STORAGE_KEY)
	if (!!locallyStoredValue) return locallyStoredValue

	return `
	/*
	const tartaruga: {
		x: number,
		y: number,
		frente: function() => void
		girar_esquerda: function() => void
		girar_direita: function() => void
	}
	const pomo: {x: number, y: number}
	*/ 
	const passos = [1, 2, 3, 4]
	for (const passo of passos) {
		tartaruga.frente()
		tartaruga.frente()

		tartaruga.girar_esquerda()
		console.log("Alterou a posição da tartaruga")
	}
	for (const passo of passos) {
		tartaruga.frente()
		tartaruga.frente()

		tartaruga.girar_direita()
		console.log("Alterou a posição da tartaruga")
	}
	`
}

let lastUpdate = Date.now()
function preparaArmazem(delayedTexto) {
	const agora = Date.now()
	lastUpdate = Math.max(lastUpdate, agora)

	setTimeout(() => {
		if (agora >= lastUpdate) {
			console.log("armazenando...")
			localStorage.setItem(LOCAL_STORAGE_KEY, delayedTexto())
			console.log("armazenou!")
		}
	}, 500)
}
export const Editor = () => {
	const [editor, setEditor] = useState(null);
	const monacoEl = useRef(null);

	
	useEffect(() => {
		if (monacoEl) {
			console.log(buildGame({ tartarugaIni: tartarugaInicial(), pomoIni: pomoInicial() }))
			setEditor((editor) => {
				if (editor) return editor;

				
                console.log("as langs abaixo")
                console.log(monaco.languages.getLanguages())

                monaco.editor.defineTheme("Cobalt", cobalt)
                monaco.editor.setTheme("Cobalt")

                const _ed = monaco.editor.create(monacoEl.current, {
					value: getValorEditor(),
					language: 'javascript',
                    tabCompletion: 'on'
				});
				_ed.getModel().onDidChangeContent((e) => {
					preparaArmazem(() => _ed.getValue())
				})
				// setClick(() => {
					console.log(_ed.getValue())
				// })
                return _ed;
			});
		}

		return () => editor?.dispose();
	}, [monacoEl.current]);

	const click = () => {
		// console.log(`editor tá nulo? ${editor}`)
		if (editor) {
			console.log(`editor conteúdo? ${editor.getValue()}`)
			const script = base + editor.getValue() + fim
			const saida = eval(script)

			console.log(saida)
			window.dispatchEvent(new CustomEvent("movimentos", { detail : {movimentos: saida }, bubbles: true}))
		}
	}

	return <div>
	<Board tartarugaInicial={tartarugaInicial()} pomoInicial={pomoInicial()} />
	<button onClick={click} className={`${styles.ali_esquerda} ${styles.oh_o_meio} ${styles.greyButton}`}>Executar o programa</button>
    <div className={styles.ali_esquerda}>
      <div id="editor" ref={monacoEl} className={styles.raiz_editor + " " + styles.editorMonaco}></div>
    </div>
    </div>;
};

