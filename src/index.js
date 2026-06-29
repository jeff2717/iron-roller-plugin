import { 
  onReady, 
  getState, 
  setState, 
  toast, 
  onShortcut 
} from '@overseer-studio/sdk';

// Internal reference tracking state memory
let stateMemory = {
  lastRoll: null,
  lastTotal: null,
  modifier: 0,
  history: []
};

// Main lifecycle entry point for Overseer Studio
const destroy = onReady(async () => {
  
  // Fetch previous data block stored in Overseer's local tile cache
  const savedState = await getState('d20_roller_data');
  if (savedState) {
    stateMemory = savedState;
  }

  // Inject structural HTML directly into tile canvas viewport
  renderInterface();

  // Listen for the hotkey registered in the manifest
  onShortcut('quick-roll-d20', () => {
    executeD20Roll();
  });
});

function renderInterface() {
  const container = document.getElementById('app');
  if (!container) return;

  // Determine display text and check if previous state held a critical roll
  let displayValue = stateMemory.lastTotal !== null ? String(stateMemory.lastTotal) : "--";
  let critClass = "";
  
  if (stateMemory.lastRoll === 20) critClass = "crit-success";
  if (stateMemory.lastRoll === 1) critClass = "crit-fail";

  container.innerHTML = `
    <div class="roller-frame">
      <div class="display-panel ${critClass}" id="roll-display">
        ${displayValue}
      </div>
      
      <div class="modifier-row">
        <label for="roll-mod">MODIFIER:</label>
        <input type="number" id="roll-mod" value="${stateMemory.modifier}" step="1" />
      </div>

      <button class="roll-btn" id="roll-trigger">Engage Roller</button>

      <div class="history-log" id="roll-history">
        ${stateMemory.history.map(entry => `<div>${entry}</div>`).reverse().join('')}
      </div>
    </div>
  `;

  // Attach interactive events to the interface elements
  document.getElementById('roll-trigger')?.addEventListener('click', executeD20Roll);
  
  // Track manual changes to the modifier field and sync to local memory
  document.getElementById('roll-mod')?.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    stateMemory.modifier = isNaN(val) ? 0 : val;
    setState('d20_roller_data', stateMemory);
  });
}

function executeD20Roll() {
  // Generate random base number 1-20
  const natRoll = Math.floor(Math.random() * 20) + 1;
  const currentMod = stateMemory.modifier;
  const finalTotal = natRoll + currentMod;

  // Formulate textual log block
  const sign = currentMod >= 0 ? '+' : '';
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const logMessage = `[${timestamp}] d20(${natRoll})${sign}${currentMod} = <strong>${finalTotal}</strong>`;

  // Push to history tracking deck, capping size to 5 entries
  stateMemory.lastRoll = natRoll;
  stateMemory.lastTotal = finalTotal;
  stateMemory.history.push(logMessage);
  if (stateMemory.history.length > 5) {
    stateMemory.history.shift();
  }

  // Push update payload down to persistent SDK storage
  setState('d20_roller_data', stateMemory);

  // Trigger app toasts depending on natural dice bounds
  if (natRoll === 20) {
    toast.success('CRITICAL SUCCESS', `A natural 20 was pulled from the iron engine!`);
  } else if (natRoll === 1) {
    toast.error('CRITICAL FAILURE', `A dark structural failure: Natural 1 rolled.`);
  }

  // Re-render local layout view elements
  renderInterface();
}

// Ensure cleanup routine hooks out appropriately
export default destroy;