/* =========================================================
   MathQuest Espacial
   Juego de refuerzo matemático (sumas, restas, multiplicación
   con multiplicador de 1 cifra) para alumnos de 3er grado.
   ========================================================= */

const QUESTIONS_PER_LEVEL = 10;
const STORAGE_KEY = 'mathquest_progress_v1';

/* ---------------------------------------------------------
   Utilidades numéricas
   --------------------------------------------------------- */
function randInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffle(arr){
  const a = arr.slice();
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Formatea números con separador de miles (estilo es-AR: 1.234) */
function numFmt(n){
  return n.toLocaleString('es-AR');
}

/* ---------------------------------------------------------
   Bancos de problemas narrados (para los niveles "de la vida
   cotidiana": Tierra y Júpiter). Cada función recibe los dos
   números ya generados y devuelve el enunciado como texto.
   --------------------------------------------------------- */
const STORY_SUM = [
  (a, b) => `En el almacén compraste una gaseosa a $${numFmt(a)} y un paquete de galletitas a $${numFmt(b)}. ¿Cuánto gastaste en total?`,
  (a, b) => `Un colectivo recorrió ${numFmt(a)} metros por la mañana y ${numFmt(b)} metros por la tarde. ¿Cuántos metros recorrió en total?`,
  (a, b) => `Juntaste $${numFmt(a)} vendiendo rifas y tu abuela te regaló $${numFmt(b)} más. ¿Cuánto dinero tenés ahora?`,
  (a, b) => `En la biblioteca del cole hay ${numFmt(a)} libros de cuentos y ${numFmt(b)} libros de ciencias. ¿Cuántos libros hay en total?`,
  (a, b) => `Un camión cargó ${numFmt(a)} kilos de manzanas y después ${numFmt(b)} kilos más. ¿Cuántos kilos lleva en total?`
];

const STORY_SUB = [
  (a, b) => `Tenías ahorrados $${numFmt(a)} y gastaste $${numFmt(b)} en un regalo. ¿Cuánto dinero te queda?`,
  (a, b) => `Una juguetería tenía ${numFmt(a)} pelotas y vendió ${numFmt(b)}. ¿Cuántas pelotas le quedan?`,
  (a, b) => `Un viaje en auto es de ${numFmt(a)} kilómetros y ya recorrieron ${numFmt(b)} kilómetros. ¿Cuántos kilómetros faltan?`,
  (a, b) => `En el cine había ${numFmt(a)} entradas disponibles y se vendieron ${numFmt(b)}. ¿Cuántas entradas quedan?`,
  (a, b) => `Tu curso necesita $${numFmt(a)} para el viaje de egresados y ya juntó $${numFmt(b)}. ¿Cuánto dinero falta?`
];

const STORY_MUL = [
  (a, b) => `Para una torta se necesitan ${numFmt(a)} gramos de harina. ¿Cuántos gramos necesitarás para hacer ${b} tortas iguales?`,
  (a, b) => `Cada caja tiene ${numFmt(a)} alfajores. ¿Cuántos alfajores hay en ${b} cajas?`,
  (a, b) => `Un micro escolar lleva ${numFmt(a)} pasajeros. ¿Cuántos pasajeros viajan en ${b} micros?`,
  (a, b) => `Cada entrada al parque de diversiones cuesta $${numFmt(a)}. ¿Cuánto pagarán ${b} amigos que van juntos?`,
  (a, b) => `Un atleta corre ${numFmt(a)} metros por vuelta. ¿Cuántos metros recorre en ${b} vueltas?`
];

function pickStory(bank, a, b){
  return bank[randInt(0, bank.length - 1)](a, b);
}

/* ---------------------------------------------------------
   Definición de niveles (planetas)
   --------------------------------------------------------- */
const LEVELS = [
  {
    id: 1,
    key: 'mercurio',
    name: 'Mercurio',
    icon: '🌑',
    accent: '--mercury',
    accentDark: '--mercury-dark',
    desc: 'Sumas hasta 5.999',
    label: 'Suma',
    generate(){
      const a = randInt(1, 3000);
      const b = randInt(1, Math.max(1, 5999 - a));  //-----numeracion hasta 5999
      const answer = a + b;
      return { a, b, operator: '+', answer };
    }
  },
  {
    id: 2,
    key: 'venus',
    name: 'Venus',
    icon: '🟠',
    accent: '--venus',
    accentDark: '--venus-dark',
    desc: 'Restas hasta 5.999',
    label: 'Resta',
    generate(){
      const a = randInt(1000, 5999); //-----numeracion hasta 5999
      const b = randInt(1, a);
      const answer = a - b;
      return { a, b, operator: '−', answer };
    }
  },
  {
    id: 3,
    key: 'tierra',
    name: 'Tierra',
    icon: '🌍',
    accent: '--earth',
    accentDark: '--earth-dark',
    desc: 'Problemas de la vida cotidiana · suma y resta',
    label: 'Problema',
    isStory: true,
    generate(){
      const isSum = Math.random() < 0.5;
      if(isSum){
        const a = randInt(500, 5000);
        const b = randInt(500, Math.max(500, 5999 - a));   //-----numeracion hasta 5999
        return { a, b, text: pickStory(STORY_SUM, a, b), answer: a + b };
      }else{
        const a = randInt(1000, 5999);        //-----numeracion hasta 5999
        const b = randInt(100, a);
        return { a, b, text: pickStory(STORY_SUB, a, b), answer: a - b };
      }
    }
  },
  {
    id: 4,
    key: 'marte',
    name: 'Marte',
    icon: '🔴',
    accent: '--mars',
    accentDark: '--mars-dark',
    desc: 'Multiplicación · multiplicador 1 a 5, números hasta 5.999',
    label: 'Multiplicación',
    generate(){
      const a = randInt(2, 5999);          //-----numeracion hasta 5999
      const b = randInt(1, 5);
      const answer = a * b;
      return { a, b, operator: '×', answer };
    }
  },
  {
    id: 5,
    key: 'jupiter',
    name: 'Júpiter',
    icon: '🟣',
    accent: '--jupiter',
    accentDark: '--jupiter-dark',
    desc: 'Misión final · problemas mixtos de la vida cotidiana',
    label: 'Misión mixta',
    isStory: true,
    generate(){
      const mode = randInt(1, 3);
      if(mode === 1){
        const a = randInt(2, 5999);             //-----numeracion hasta 5999
        const b = randInt(6, 9);
        return { a, b, text: pickStory(STORY_MUL, a, b), answer: a * b };
      }else if(mode === 2){
        const a = randInt(1000, 5999);            //-----numeracion hasta 5999
        const b = randInt(100, a);
        return { a, b, text: pickStory(STORY_SUB, a, b), answer: a - b };
      }else{
        const a = randInt(500, 5000);
        const b = randInt(500, Math.max(500, 5999 - a));      //-----numeracion hasta 5999
        return { a, b, text: pickStory(STORY_SUM, a, b), answer: a + b };
      }
    }
  }
];

/* ---------------------------------------------------------
   Progreso (localStorage)
   --------------------------------------------------------- */
function loadProgress(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  }catch(e){
    return {};
  }
}
function saveProgress(progress){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }catch(e){ /* almacenamiento no disponible, seguimos sin guardar */ }
}
let progress = loadProgress();

function isUnlocked(levelIndex){
  if(levelIndex === 0) return true;
  const prevLevel = LEVELS[levelIndex - 1];
  return (progress[prevLevel.key]?.stars || 0) >= 1;
}

/* ---------------------------------------------------------
   Estado del juego
   --------------------------------------------------------- */
const state = {
  levelIndex: 0,
  currentQuestion: 0,
  correctCount: 0,
  score: 0,
  currentAnswer: null,
  locked: false
};

/* ---------------------------------------------------------
   Referencias DOM
   --------------------------------------------------------- */
const screens = {
  start: document.getElementById('start-screen'),
  game: document.getElementById('game-screen'),
  end: document.getElementById('end-screen')
};
const solarTrack = document.getElementById('solar-track');
const progressTrack = document.getElementById('progress-track');
const hudPlanetIcon = document.getElementById('hud-planet-icon');
const hudPlanetName = document.getElementById('hud-planet-name');
const hudScore = document.getElementById('hud-score');
const problemLabel = document.getElementById('problem-label');
const problemDisplay = document.getElementById('problem-display');
const answersGrid = document.getElementById('answers-grid');
const ship = document.getElementById('ship');
const shipFx = document.getElementById('ship-fx');
const shipMessage = document.getElementById('ship-message');

const resultsIcon = document.getElementById('results-icon');
const resultsTitle = document.getElementById('results-title');
const resultsSubtitle = document.getElementById('results-subtitle');
const starsEarnedEl = document.getElementById('stars-earned');
const resultsCorrect = document.getElementById('results-correct');
const resultsTotal = document.getElementById('results-total');
const btnNext = document.getElementById('btn-next');

/* ---------------------------------------------------------
   Navegación de pantallas
   --------------------------------------------------------- */
function showScreen(name){
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

/* ---------------------------------------------------------
   Pantalla de inicio: construir mapa de planetas
   --------------------------------------------------------- */
function renderSolarTrack(){
  solarTrack.innerHTML = '<div class="track-line"></div>';
  LEVELS.forEach((level, idx) => {
    const unlocked = isUnlocked(idx);
    const data = progress[level.key] || { stars: 0 };

    const btn = document.createElement('button');
    btn.className = 'planet-node';
    btn.dataset.locked = (!unlocked).toString();
    btn.setAttribute('aria-label', `${level.name}: ${level.desc}`);

    const starsStr = unlocked
      ? '★'.repeat(data.stars) + '☆'.repeat(3 - data.stars)
      : '';

    btn.innerHTML = `
      <div class="planet-orb" style="background: var(${level.accent}); border-color: var(${level.accentDark});">
        ${unlocked ? level.icon : '🔒'}
      </div>
      <div class="planet-name">${level.name}</div>
      ${unlocked
        ? `<div class="planet-stars">${starsStr}</div>`
        : `<div class="planet-lock">Bloqueado</div>`}
    `;

    if(unlocked){
      btn.addEventListener('click', () => startLevel(idx));
    }
    solarTrack.appendChild(btn);
  });
}

/* ---------------------------------------------------------
   Iniciar un nivel
   --------------------------------------------------------- */
function startLevel(levelIndex){
  state.levelIndex = levelIndex;
  state.currentQuestion = 0;
  state.correctCount = 0;
  state.score = 0;

  const level = LEVELS[levelIndex];
  document.documentElement.style.setProperty('--accent', `var(${level.accent})`);
  document.documentElement.style.setProperty('--accent-dark', `var(${level.accentDark})`);

  hudPlanetIcon.textContent = level.icon;
  hudPlanetName.textContent = level.name;
  problemLabel.textContent = level.label;
  hudScore.textContent = '0';

  document.getElementById('problem-card').classList.toggle('story-card', !!level.isStory);

  buildProgressDots();
  showScreen('game');
  nextQuestion();
}

function buildProgressDots(){
  progressTrack.innerHTML = '';
  for(let i = 0; i < QUESTIONS_PER_LEVEL; i++){
    const dot = document.createElement('span');
    dot.className = 'progress-dot';
    progressTrack.appendChild(dot);
  }
  updateProgressDots();
}
function updateProgressDots(){
  const dots = progressTrack.querySelectorAll('.progress-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('done', i < state.currentQuestion);
    dot.classList.toggle('current', i === state.currentQuestion);
  });
}

/* ---------------------------------------------------------
   Generar y mostrar una pregunta
   --------------------------------------------------------- */
const SHIP_MESSAGES_IDLE = [
  '¡Vamos, tripulante!',
  'Calculá con calma…',
  'Vos podés con esto 🚀',
  'La nave espera tu respuesta'
];
const SHIP_MESSAGES_CORRECT = [
  '¡Impulso activado! 🔥',
  '¡Excelente cálculo!',
  '¡Directo al destino!',
  '¡Sos un crack espacial!'
];
const SHIP_MESSAGES_WRONG = [
  'Turbulencia leve… ¡seguimos!',
  'Casi. ¡Probemos la próxima!',
  'La nave se corrige sola 💪',
  'No pasa nada, ¡seguimos rumbo!'
];

/* Separa un número en sus dígitos (como array de strings), ej: 4028 -> ['4','0','2','8'] */
function digitsOf(n){
  return String(Math.abs(Math.round(n))).split('');
}

/* Arma el HTML de una cuenta "parada": los dígitos de cada número
   quedan alineados por columna (unidades bajo unidades, decenas bajo
   decenas, etc). Arriba del todo va una fila de casilleros libres
   para anotar lo que se lleva (en sumas/multiplicaciones) o lo que
   se pide prestado a la cifra de al lado (en restas). Debajo de la
   raya, los casilleros editables donde el chico escribe el resultado,
   dígito por dígito, alineados a la derecha bajo su columna. */
function buildVerticalOpHTML(a, b, operator, answer){
  const digitsA = digitsOf(a);
  const digitsB = digitsOf(b);
  const digitsAns = digitsOf(answer);
  const totalCols = Math.max(digitsA.length, digitsB.length, digitsAns.length);

  const padA = totalCols - digitsA.length;
  const padB = totalCols - digitsB.length;
  const padAns = totalCols - digitsAns.length;

  let html = `<div class="vertical-op" style="grid-template-columns: auto repeat(${totalCols}, minmax(1.1em, 1fr));">`;

  // Fila de anotaciones (lo que llevo / lo que pido prestado)
  html += `<span class="vop-cell"></span>`;
  for(let i = 0; i < totalCols; i++){
    html += `<input type="text" class="carry-box" maxlength="2" inputmode="numeric" pattern="[0-9]*" autocomplete="off" aria-label="Anotación">`;
  }

  // Fila del primer número
  html += `<span class="vop-cell"></span>`;
  for(let i = 0; i < totalCols; i++){
    html += (i < padA)
      ? `<span class="vop-num-cell"></span>`
      : `<span class="vop-num-cell">${digitsA[i - padA]}</span>`;
  }

  // Fila del operador + segundo número
  html += `<span class="vop-operator">${operator}</span>`;
  for(let i = 0; i < totalCols; i++){
    html += (i < padB)
      ? `<span class="vop-num-cell"></span>`
      : `<span class="vop-num-cell">${digitsB[i - padB]}</span>`;
  }

  // Línea divisoria
  html += `<span class="vop-rule"></span>`;

  // Fila de respuesta: un casillero editable por cada dígito del resultado,
  // alineado a la derecha bajo su columna correspondiente
  html += `<span class="vop-cell"></span>`;
  for(let i = 0; i < totalCols; i++){
    html += (i < padAns)
      ? `<span class="vop-num-cell"></span>`
      : `<input type="text" class="answer-digit" maxlength="1" inputmode="numeric" pattern="[0-9]*" autocomplete="off" data-idx="${i - padAns}">`;
  }

  html += `</div>`;
  return html;
}

/* Fila de casilleros de respuesta "suelta", para problemas narrados
   que no tienen una estructura de columnas (no hay dos números para
   alinear verticalmente, solo un resultado final). */
function buildStoryAnswerHTML(answer){
  const digitsAns = digitsOf(answer);
  let html = `<div class="story-answer-row">`;
  digitsAns.forEach((_, i) => {
    html += `<input type="text" class="answer-digit" maxlength="1" inputmode="numeric" pattern="[0-9]*" autocomplete="off" data-idx="${i}">`;
  });
  html += `</div>`;
  return html;
}

/* Borrador en blanco para los niveles narrados (Tierra y Júpiter):
   como el problema es un texto y a muchos chicos les cuesta resolver
   la cuenta mentalmente, acá se les arman los dos números del
   enunciado YA puestos en forma de cuenta parada (alineados por
   columna, igual que en Mercurio/Venus/Marte). Ellos eligen qué
   operación corresponde (+, − o ×) y resuelven con sus propias
   anotaciones de acarreo/préstamo y sus propios casilleros de
   resultado. Nada de esto se corrige automáticamente: solo se
   valida el resultado final que carguen en los casilleros de abajo. */
function buildScratchPadHTML(a, b){
  const digitsA = digitsOf(a);
  const digitsB = digitsOf(b);
  // +1 columna extra a la izquierda por si el resultado "se lleva" una cifra más
  const totalCols = Math.max(digitsA.length, digitsB.length) + 1;
  const padA = totalCols - digitsA.length;
  const padB = totalCols - digitsB.length;

  let html = `<p class="scratch-label">🧮 Borrador: elegí la operación y resolvé la cuenta parada</p>`;
  html += `<div class="vertical-op scratch-op" style="grid-template-columns: auto repeat(${totalCols}, minmax(1.1em, 1fr));">`;

  // Fila de anotaciones (lo que llevo / lo que pido prestado)
  html += `<span class="vop-cell"></span>`;
  for(let i = 0; i < totalCols; i++){
    html += `<input type="text" class="carry-box" maxlength="2" inputmode="numeric" pattern="[0-9]*" autocomplete="off" aria-label="Anotación">`;
  }

  // Primer número, tal como aparece en el problema
  html += `<span class="vop-cell"></span>`;
  for(let i = 0; i < totalCols; i++){
    html += (i < padA)
      ? `<span class="vop-num-cell"></span>`
      : `<span class="vop-num-cell">${digitsA[i - padA]}</span>`;
  }

  // Selector de operación + segundo número, tal como aparece en el problema
  html += `
    <div class="operator-picker" role="group" aria-label="Elegí la operación">
      <button type="button" class="op-btn" data-op="+">+</button>
      <button type="button" class="op-btn" data-op="−">−</button>
      <button type="button" class="op-btn" data-op="×">×</button>
    </div>`;
  for(let i = 0; i < totalCols; i++){
    html += (i < padB)
      ? `<span class="vop-num-cell"></span>`
      : `<span class="vop-num-cell">${digitsB[i - padB]}</span>`;
  }

  // Línea divisoria
  html += `<span class="vop-rule"></span>`;

  // Resultado del borrador (libre, no se corrige acá)
  html += `<span class="vop-cell"></span>`;
  for(let i = 0; i < totalCols; i++){
    html += `<input type="text" class="scratch-digit scratch-result" data-row="result" maxlength="1" inputmode="numeric" pattern="[0-9]*" autocomplete="off" aria-label="Resultado del borrador">`;
  }

  html += `</div>`;
  return html;
}

function nextQuestion(){
  if(state.currentQuestion >= QUESTIONS_PER_LEVEL){
    finishLevel();
    return;
  }
  state.locked = false;
  updateProgressDots();

  const level = LEVELS[state.levelIndex];
  const q = level.generate();
  state.currentAnswer = q.answer;

  if(level.isStory){
    problemDisplay.innerHTML = `<p class="problem-text story-mode">${q.text}</p>`;
    answersGrid.innerHTML = `
      <button type="button" id="btn-toggle-scratch" class="scratch-toggle-btn">✏️ Anotar la cuenta</button>
      <div class="scratch-pad" id="scratch-pad" hidden>
        ${buildScratchPadHTML(q.a, q.b)}
      </div>
      ${buildStoryAnswerHTML(q.answer)}
      <button type="button" id="btn-verify" class="verify-btn">Verificar ✅</button>
    `;
  }else{
    problemDisplay.innerHTML = buildVerticalOpHTML(q.a, q.b, q.operator, q.answer);
    answersGrid.innerHTML = `
      <p class="answer-hint">Podés anotar arriba lo que llevás o pedís prestado ✏️</p>
      <button type="button" id="btn-verify" class="verify-btn">Verificar ✅</button>
    `;
  }

  shipMessage.textContent = SHIP_MESSAGES_IDLE[randInt(0, SHIP_MESSAGES_IDLE.length - 1)];

  setupAnswerInputs();
}

/* ---------------------------------------------------------
   Casilleros de respuesta: navegación automática y validación
   --------------------------------------------------------- */
function setupAnswerInputs(){
  const digitBoxes = Array.from(document.querySelectorAll('.answer-digit'));

  // El cálculo se resuelve empezando por las unidades (columna de la
  // derecha) y avanzando hacia la izquierda, igual que en el cuaderno.
  // digitBoxes está en orden de columnas (izquierda a derecha), así que
  // el recorrido de tipeo va en sentido inverso al del array.
  digitBoxes.forEach((box, i) => {
    box.addEventListener('input', () => {
      box.value = box.value.replace(/[^0-9]/g, '').slice(0, 1);
      box.classList.remove('shake-empty');
      if(box.value && i > 0){
        digitBoxes[i - 1].focus();
      }
    });
    box.addEventListener('keydown', (e) => {
      if(e.key === 'Backspace' && !box.value && i < digitBoxes.length - 1){
        digitBoxes[i + 1].focus();
      }
      if(e.key === 'Enter'){
        e.preventDefault();
        checkAnswer();
      }
    });
  });

  document.querySelectorAll('.carry-box').forEach(box => {
    box.addEventListener('input', () => {
      box.value = box.value.replace(/[^0-9]/g, '').slice(0, 2);
    });
  });

  const verifyBtn = document.getElementById('btn-verify');
  if(verifyBtn) verifyBtn.addEventListener('click', checkAnswer);

  if(digitBoxes.length) digitBoxes[digitBoxes.length - 1].focus();

  setupScratchPad();
}

/* ---------------------------------------------------------
   Borrador (Tierra y Júpiter): mostrar/ocultar y cablear los
   casilleros de cada fila (número 1, número 2 y resultado libre)
   con el mismo sentido de tipeo: unidades primero, hacia la
   izquierda. Nada de esto se valida; es solo para pensar la cuenta.
   --------------------------------------------------------- */
function wireDigitAutoAdvance(boxes){
  boxes.forEach((box, i) => {
    box.addEventListener('input', () => {
      box.value = box.value.replace(/[^0-9]/g, '').slice(0, 1);
      if(box.value && i > 0) boxes[i - 1].focus();
    });
    box.addEventListener('keydown', (e) => {
      if(e.key === 'Backspace' && !box.value && i < boxes.length - 1){
        boxes[i + 1].focus();
      }
    });
  });
}

function setupScratchPad(){
  const toggleBtn = document.getElementById('btn-toggle-scratch');
  const scratchPad = document.getElementById('scratch-pad');
  if(!toggleBtn || !scratchPad) return;

  toggleBtn.addEventListener('click', () => {
    const isHidden = scratchPad.hasAttribute('hidden');
    if(isHidden){
      scratchPad.removeAttribute('hidden');
      toggleBtn.textContent = '🙈 Ocultar borrador';
    }else{
      scratchPad.setAttribute('hidden', '');
      toggleBtn.textContent = '✏️ Anotar la cuenta';
    }
  });

  const resultBoxes = Array.from(scratchPad.querySelectorAll('.scratch-digit[data-row="result"]'));
  wireDigitAutoAdvance(resultBoxes);

  const opButtons = Array.from(scratchPad.querySelectorAll('.op-btn'));
  opButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      opButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

/* ---------------------------------------------------------
   Manejo de respuesta
   --------------------------------------------------------- */
function checkAnswer(){
  if(state.locked) return;

  const digitBoxes = Array.from(document.querySelectorAll('.answer-digit'));

  // Si falta completar algún casillero, avisamos sin gastar el intento
  const missing = digitBoxes.filter(b => !b.value);
  if(missing.length){
    missing.forEach(b => {
      b.classList.remove('shake-empty');
      void b.offsetWidth;
      b.classList.add('shake-empty');
    });
    shipMessage.textContent = 'Completá todos los casilleros';
    return;
  }

  state.locked = true;
  digitBoxes.forEach(b => b.disabled = true);
  document.querySelectorAll('.carry-box').forEach(b => b.disabled = true);
  const verifyBtn = document.getElementById('btn-verify');
  if(verifyBtn) verifyBtn.disabled = true;

  const given = parseInt(digitBoxes.map(b => b.value).join(''), 10);
  const isCorrect = given === state.currentAnswer;

  if(isCorrect){
    digitBoxes.forEach(b => b.classList.add('correct'));
    state.correctCount++;
    state.score += 10;
    hudScore.textContent = state.score;
    ship.classList.remove('wrong-anim');
    void ship.offsetWidth;
    ship.classList.add('correct-anim');
    shipMessage.textContent = SHIP_MESSAGES_CORRECT[randInt(0, SHIP_MESSAGES_CORRECT.length - 1)];
    spawnSparks();
    playTone(true);
  }else{
    digitBoxes.forEach(b => b.classList.add('wrong'));
    const correctDigits = digitsOf(state.currentAnswer);
    setTimeout(() => {
      digitBoxes.forEach((b, i) => {
        b.classList.remove('wrong');
        b.classList.add('correct');
        b.value = correctDigits[i];
      });
    }, 500);
    ship.classList.remove('correct-anim');
    void ship.offsetWidth;
    ship.classList.add('wrong-anim');
    shipMessage.textContent = SHIP_MESSAGES_WRONG[randInt(0, SHIP_MESSAGES_WRONG.length - 1)];
    playTone(false);
  }

  state.currentQuestion++;
  setTimeout(nextQuestion, isCorrect ? 1100 : 1700);
}

/* Efecto visual de chispitas al acertar */
function spawnSparks(){
  const icons = ['✨', '⭐', '💫'];
  const rect = ship.getBoundingClientRect();
  for(let i = 0; i < 6; i++){
    const spark = document.createElement('span');
    spark.className = 'spark';
    spark.textContent = icons[randInt(0, icons.length - 1)];
    const angle = randInt(0, 360) * (Math.PI / 180);
    const dist = randInt(40, 90);
    spark.style.setProperty('--spark-end', `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px)`);
    spark.style.left = '50%';
    spark.style.top = '30%';
    shipFx.appendChild(spark);
    setTimeout(() => spark.remove(), 950);
  }
}

/* Sonido simple con Web Audio API (sin archivos externos) */
let audioCtx = null;
function playTone(success){
  try{
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    if(success){
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
    }else{
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(174.6, now + 0.12);
    }
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.start(now);
    osc.stop(now + 0.35);
  }catch(e){ /* audio no disponible, seguimos sin sonido */ }
}

/* ---------------------------------------------------------
   Fin de nivel
   --------------------------------------------------------- */
function finishLevel(){
  const level = LEVELS[state.levelIndex];
  const pct = state.correctCount / QUESTIONS_PER_LEVEL;
  let stars = 0;
  if(pct >= 0.9) stars = 3;
  else if(pct >= 0.7) stars = 2;
  else if(pct >= 0.4) stars = 1;

  const prevBest = progress[level.key]?.stars || 0;
  progress[level.key] = { stars: Math.max(stars, prevBest) };
  saveProgress(progress);

  resultsCorrect.textContent = state.correctCount;
  resultsTotal.textContent = QUESTIONS_PER_LEVEL;

  if(stars === 3){
    resultsIcon.textContent = '🏆';
    resultsTitle.textContent = '¡Misión perfecta!';
    resultsSubtitle.textContent = `Dominaste ${level.name} por completo.`;
  }else if(stars >= 1){
    resultsIcon.textContent = '🛰️';
    resultsTitle.textContent = '¡Misión completa!';
    resultsSubtitle.textContent = `Llegaste a ${level.name} con éxito.`;
  }else{
    resultsIcon.textContent = '🪐';
    resultsTitle.textContent = '¡Casi llegamos!';
    resultsSubtitle.textContent = 'Practiquemos un poco más antes de avanzar.';
  }

  const slots = starsEarnedEl.querySelectorAll('.star-slot');
  slots.forEach((slot, i) => {
    slot.classList.remove('lit');
    slot.textContent = '☆';
  });
  setTimeout(() => {
    slots.forEach((slot, i) => {
      if(i < stars){
        setTimeout(() => {
          slot.textContent = '★';
          slot.classList.add('lit');
          playTone(true);
        }, i * 220);
      }
    });
  }, 250);

  const hasNext = state.levelIndex < LEVELS.length - 1;
  btnNext.style.display = (hasNext && stars >= 1) ? 'inline-flex' : 'none';

  showScreen('end');
}

/* ---------------------------------------------------------
   Botones globales
   --------------------------------------------------------- */
document.getElementById('btn-exit').addEventListener('click', () => {
  renderSolarTrack();
  showScreen('start');
});
document.getElementById('btn-map').addEventListener('click', () => {
  renderSolarTrack();
  showScreen('start');
});
document.getElementById('btn-retry').addEventListener('click', () => {
  startLevel(state.levelIndex);
});
btnNext.addEventListener('click', () => {
  if(state.levelIndex < LEVELS.length - 1){
    startLevel(state.levelIndex + 1);
  }
});

/* ---------------------------------------------------------
   Inicio
   --------------------------------------------------------- */
renderSolarTrack();
showScreen('start');
