# NexusLab AI

NexusLab AI is a browser-based, Thai-language science learning lab. It combines interactive 2D/3D simulations, scientific calculations, concept explanations, and PDF lab-manual analysis in one interface.

## Features

- **Chemistry:** mix substances, explore stoichiometry, and view states of matter.
- **Biology:** inspect virtual microscope specimens and explore predator-prey population dynamics.
- **Physics:** experiment with Newton's laws, friction, inclined planes, and circular motion.
- **Astronomy:** explore Keplerian orbits and constellations.
- **Science tutor:** ask questions, review scientific concepts, and identify common misconceptions.
- **PDF lab documents:** extract text from a PDF, identify science topics and parameters, and use the findings in a simulation.
- **Scientific calculator:** calculate common physics, chemistry, biology, and astronomy quantities with formulas and verification details.
- **Saved browser state:** simulation settings and related preferences are stored locally in the browser.

## Run locally

No build step or package installation is required. The interface loads libraries from public CDNs, so an internet connection is needed.

From the project directory, start a local static web server:

```powershell
py -m http.server 8000
```

Then open <http://localhost:8000> in a modern browser. Alternatively, open `index.html` directly; if browser file restrictions interfere with loading features, use the local server instead.

## Optional Gemini API

The app includes a built-in tutor experience and can optionally call Google Gemini when a user supplies their own API key in the app. The key is stored in that browser's local storage. Do not commit API keys or other secrets to this repository.

The subscription plans, token counts, and related upgrade UI are demo/simulated functionality; this project does not process payments.

## Project layout

```text
.
|-- index.html
|-- css/
|-- assets/
\-- js/
    |-- calculator-engine.js
    |-- pdf-engine.js
    |-- science-engine.js
    \-- state-manager.js
```

The current page is a static HTML application with JavaScript in `index.html`; the files under `js/` contain supporting calculation, PDF, science-knowledge, and state-management engines.