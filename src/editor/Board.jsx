import React, { useEffect } from "react";
import styles from "./Board.module.css"
import song from "../assets/shimmer_1.flac"

const TARTARUGA = "🐢"
const MACA = "🍎"

let RUNNING = false

const MAX = 10
const vetorDimensoes = () => {
    const linhas = []
    for (let i = 0; i < MAX; i++) {
        linhas.push(i)
    }
    return linhas
}

const MeuTd = ({x,y, tartarugaInicial, pomoInicial}) => {
    console.log(`em MeuTd tartaruga x ${tartarugaInicial.x} y ${tartarugaInicial.y}/ x ${x} y ${y}`)
    const posicaoInicial = x == tartarugaInicial.x && y == tartarugaInicial.y
    const posicaoPomoInicial = x == pomoInicial.x && y == pomoInicial.y

    console.log(`posicaoInicial? ${posicaoInicial}`)
    if (posicaoInicial) {
        return <td data-pos={`${x}/${y}`} data-giro={tartarugaInicial.giro}>{TARTARUGA}</td>
    } else if (posicaoPomoInicial) {
        return <td data-pos={`${x}/${y}`}>{MACA}</td>
    } else {
        return <td data-pos={`${x}/${y}`}></td>
    }
}

const MeuTr = ({y, tartarugaInicial, pomoInicial}) => {
    console.log(`em MeuTr ${tartarugaInicial}, pomo ${pomoInicial.x}`)
    const colunas = vetorDimensoes()

    return <>
        <tr>
            { colunas.map((i) => <MeuTd key={i} y={y} x={i} tartarugaInicial={tartarugaInicial} pomoInicial={pomoInicial}/>) }
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

function limpezaTotal(tartarugaInicial, pomoInicial) {
    for (const x of vetorDimensoes()) {
        for (const y of vetorDimensoes()) {
            const posicaoInicial = x == tartarugaInicial.x && y == tartarugaInicial.y
            const posicaoPomoInicial = x == pomoInicial.x && y == pomoInicial.y
            if (posicaoInicial) {
                pintarNodo(tartarugaInicial)
            } else {
                limpaNodo({x, y})
                if (posicaoPomoInicial) {
                    const querySelector = `[data-pos="${x}/${y}"]`
                    const nodo = document.querySelector(querySelector)
                    if (nodo) {
                        nodo.innerHTML = MACA
                    }
                }
            }
        }
    }
}

function pintarNodo({x, y, giro}) {
    const querySelector = `[data-pos="${x}/${y}"]`
    const nodo = document.querySelector(querySelector)
    if (nodo) {
        if (nodo.innerHTML === MACA) {
            document.getElementById("audio")?.play()
            nodo.innerHTML = ""
        }
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

export const Board = ({ tartarugaInicial, pomoInicial }) => {
    useEffect(() => {
        window.addEventListener("movimentos", (evento) => {
            evento.preventDefault()
            if (RUNNING) {
                console.log("tá rodando algo antes, te acalma")
                return
            }
            RUNNING = true
            limpezaTotal({...tartarugaInicial}, {...pomoInicial})

            fazPintura(evento.detail.movimentos.map((m) => m.tartaruga), 0, null)
        })
    })
    console.log(`em Board ${tartarugaInicial}`)
    console.log({...pomoInicial, obj: "pomo"})
    const linhas = vetorDimensoes()
    return <>
        <div className={styles.ilBordo}>
            <table className={styles.celula}>
                <tbody>
                    { linhas.map((i) => <MeuTr key={i} y={MAX - 1 - i} tartarugaInicial={tartarugaInicial} pomoInicial={pomoInicial} />) }
                </tbody>
            </table>
        </div>
        <div  style={{visibility: "hidden"}}>
        <audio src={song} controls={true} id="audio"></audio>
        </div>
    </>
}