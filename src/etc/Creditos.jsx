import React from "react";
import song from "../assets/shimmer_1.flac";

export function Creditos() {
    return <div style={{float: "left"}}>
        <h4>Créditos e atribuições</h4>
        <p><a href={song}>Shimmer glitter magic</a>, por <a href="http://www.archive.org/details/Berklee44v13">The Berklee College of Music</a>, licenciado sob <a href="https://creativecommons.org/licenses/by/3.0/">CC-BY 3.0</a>.<br/>Acessado via <a href="https://opengameart.org/content/shimmer-glitter-magic">OpenGameArt</a></p>
    </div>
}