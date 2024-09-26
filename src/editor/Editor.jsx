import { useRef, useState, useEffect } from 'react';
import * as React from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import cobalt from 'monaco-themes/themes/Cobalt.json';
import styles from './Editor.module.css';
import {Board} from './Board';
import { EditorProvider } from './EditorContext';

const LOCAL_STORAGE_KEY = "code-tartaruga";

function getValorEditor() {
	const locallyStoredValue = localStorage.getItem(LOCAL_STORAGE_KEY)
	if (locallyStoredValue) return locallyStoredValue

	return `
	const passos = [1, 2, 3, 4]
	for (const passo of passos) {
		tartaruga.irParaFrente()
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
			localStorage.setItem(LOCAL_STORAGE_KEY, delayedTexto())
		}
	}, 500)
}

export const Editor = () => {
	const editorRef = useRef(null);
	const [editor, setEditor] = useState(null);
	const monacoEl = useRef(null);

	useEffect(() => {
		if (editor) {
			return () => editor.dispose();
		}

		if (monacoEl) {
			setEditor(() => {
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

				return _ed;
			});
		}

		return () => editor?.dispose();
	}, [monacoEl.current]);

	const click = () => {
		if (!editor) {
			return;
		}

		console.log(`editor conteúdo? ${editor.getValue()}`)

		if (editorRef.current) {
			editorRef.current.run(editor.getValue());
		}
	}

	const buttonClassName = [styles.ali_esquerda, styles.oh_o_meio].join(" ");
	const editorClassName = [styles.raiz_editor, styles.editorMonaco].join(" ");

	return (
		<EditorProvider ref={editorRef}>
			<Board />
			<button onClick={click} className={buttonClassName}>Executar o programa</button>
				<div className={styles.ali_esquerda}>
				<div id="editor" ref={monacoEl} className={editorClassName}></div>
			</div>
		</EditorProvider>
	);
};

