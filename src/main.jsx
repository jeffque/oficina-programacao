import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ForkMe } from 'fork-me-corner'
import { REPO_NAME } from '../generated-sources/base-env'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <ForkMe repo={REPO_NAME} />
  </React.StrictMode>,
)
