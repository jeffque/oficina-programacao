import React, { useEffect } from "react";
import styles from "./Board.module.css"

const TARTARUGA = "🐢"

let RUNNING = false

const MAX = 10
const vetorDimensoes = () => {
    const linhas = []
    for (let i = 0; i < MAX; i++) {
        linhas.push(i)
    }
    return linhas
}

const MeuTd = ({x,y, tartarugaInicial}) => {
    console.log(`em MeuTd tartaruga x ${tartarugaInicial.x} y ${tartarugaInicial.y}/ x ${x} y ${y}`)
    const posicaoInicial = x == tartarugaInicial.x && y == tartarugaInicial.y

    console.log(`posicaoInicial? ${posicaoInicial}`)
    if (posicaoInicial) {
        return <td data-pos={`${x}/${y}`} data-giro={tartarugaInicial.giro}>{TARTARUGA}</td>
    } else {
        return <td data-pos={`${x}/${y}`}></td>
    }
}

const MeuTr = ({y, tartarugaInicial}) => {
    console.log(`em MeuTr ${tartarugaInicial}`)
    const colunas = vetorDimensoes()

    return <>
        <tr>
            { colunas.map((i) => <MeuTd key={i} y={y} x={i} tartarugaInicial={tartarugaInicial}/>) }
        </tr>
    </>
}

function limpaNodo({x, y}) {
    const querySelector = `[data-pos="${x}/${y}"]`
    const nodo = document.querySelector(querySelector)
    if (nodo) {
        nodo.removeAttribute("data-giro")
        nodo.innerHTML = ""
    }
}

function limpezaTotal(tartarugaInicial) {
    for (const x of vetorDimensoes()) {
        for (const y of vetorDimensoes()) {
            const posicaoInicial = x == tartarugaInicial.x && y == tartarugaInicial.y
            if (posicaoInicial) {
                pintarNodo(tartarugaInicial)
            } else {
                limpaNodo({x, y})
            }
        }
    }
}

function pintarNodo({x, y, giro}) {
    const querySelector = `[data-pos="${x}/${y}"]`
    const nodo = document.querySelector(querySelector)
    if (nodo) {
        nodo.setAttribute("data-giro", giro)
        nodo.innerHTML = TARTARUGA
    }
}

function fazPintura(eventos, idx, prev) {
    if (!prev) {
        console.log(`chegou no fazPintura, com ${idx}`)
    }
    setTimeout(() => {
        if (idx >= eventos.length) {
            RUNNING = false
            return
        }
        const {x, y, giro} = eventos[idx]

        if (prev) {
            limpaNodo(prev)
        }
        pintarNodo({x, y, giro})
        
        fazPintura(eventos, idx + 1, {x, y})
    }, 1000)
}

export const Board = ({ tartarugaInicial }) => {
    useEffect(() => {
        window.addEventListener("movimentos", (evento) => {
            evento.preventDefault()
            if (RUNNING) {
                console.log("tá rodando algo antes, te acalma")
                return
            }
            RUNNING = true
            limpezaTotal({...tartarugaInicial})

            fazPintura(evento.detail.movimentos.map((m) => m.tartaruga), 0, null)
        })
    })
    console.log(`em Board ${tartarugaInicial}`)
    const linhas = vetorDimensoes()
    return <>
        <div className={styles.ilBordo}>
            <table className={styles.celula}>
                <tbody>
                    { linhas.map((i) => <MeuTr key={i} y={MAX - 1 - i} tartarugaInicial={tartarugaInicial} />) }
                </tbody>
            </table>
        </div>
    </>
}