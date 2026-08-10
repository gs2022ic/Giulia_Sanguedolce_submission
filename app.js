const screens = [...document.querySelectorAll('.screen')];
const goalInput = document.querySelector('#goal-input');
const goalContinue = document.querySelector('#goal-continue');
const goalCount = document.querySelector('#goal-count');
const scoreSlider = document.querySelector('#score-slider');
const scoreValue = document.querySelector('#score-value');
const toast = document.querySelector('#toast');
const svgNamespace = 'http://www.w3.org/2000/svg';
const STORAGE_KEY = 'helloself-goal-support-prototype-v1';
const sampleGoalTitle = 'Feel more confident handling a difficult family situation';
let toastTimer;

const sampleTrackerData = [
  { date: '2026-07-13', score: 4, note: 'I was beginning to understand what I needed.' },
  { date: '2026-07-20', score: 5, note: 'I wrote down what I wanted to communicate.' },
  { date: '2026-07-27', score: 3, note: 'A difficult conversation made things feel harder.' },
  { date: '2026-08-03', score: 5, note: 'I discussed the situation and felt clearer afterward.' },
  { date: '2026-08-10', score: 6, note: 'I communicated one boundary calmly.' },
];

function copyEntries(entries) {
  return entries.map((entry) => ({ ...entry }));
}

function sampleGoalRecord() {
  return { id: 'fictional-example', title: sampleGoalTitle, isFictional: true, suppressSupportPrompt: false, trackerData: copyEntries(sampleTrackerData) };
}

function freshState() {
  return {
    goals: [sampleGoalRecord()],
    activeGoalId: 'fictional-example',
    pendingGoalId: null,
    pendingGoalTitle: '',
    draftGoal: '',
    baselineScore: 5,
    baselineNote: '',
    supportArea: 'Family and relationships',
    quizReturnScreen: 'support-screen',
    supportScreenMode: 'goal',
    therapyStyle: ['A warm space to talk'],
    availability: 'Weekday evenings',
    therapistPreference: 'No preference',
    shareGoal: false,
    selectedTherapist: 'Dr Maya Thompson',
    lastScreen: 'progress-screen',
  };
}

function loadState() {
  const defaults = freshState();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return defaults;

    if (Array.isArray(saved.goals)) {
      const goals = saved.goals.some((goal) => goal.id === 'fictional-example')
        ? saved.goals
        : [sampleGoalRecord(), ...saved.goals];
      return { ...defaults, ...saved, goals };
    }

    // Migrate the earlier single-goal prototype without losing the member's work.
    const fictional = sampleGoalRecord();
    const goals = [fictional];
    let activeGoalId = fictional.id;
    if (saved.goal && saved.goal !== sampleGoalTitle) {
      const migrated = {
        id: `goal-${Date.now()}`,
        title: saved.goal,
        isFictional: false,
        trackerData: Array.isArray(saved.trackerData) ? saved.trackerData : [],
      };
      goals.push(migrated);
      activeGoalId = migrated.id;
    } else if (Array.isArray(saved.trackerData)) {
      fictional.trackerData = saved.trackerData;
    }
    return { ...defaults, ...saved, goals, activeGoalId, pendingGoalId: null, pendingGoalTitle: '' };
  } catch {
    return defaults;
  }
}

const state = loadState();
let trackerData = [];

function getActiveGoal() {
  return state.goals.find((goal) => goal.id === state.activeGoalId);
}

function activeGoalTitle() {
  return state.pendingGoalTitle || getActiveGoal()?.title || sampleGoalTitle;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The prototype continues in memory when browser storage is unavailable.
  }
}

function shortDate(dateString) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${dateString}T12:00:00`));
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function showScreen(id) {
  const target = document.getElementById(id);
  if (!target) return;
  screens.forEach((screen) => screen.classList.toggle('active', screen === target));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  state.lastScreen = id;
  persist();
}

function setQuizReturnScreen(id) {
  const returnScreen = document.getElementById(id) ? id : 'progress-screen';
  state.quizReturnScreen = returnScreen;
  document.querySelector('#quiz-intro-back').dataset.go = returnScreen;
  document.querySelector('#quiz-maybe-later').dataset.go = returnScreen;
  persist();
}

function configureSupportScreen(mode = 'goal') {
  const afterTracking = mode === 'tracking';
  state.supportScreenMode = mode;
  document.querySelector('#support-title').textContent = afterTracking ? 'Progress updated' : 'Goal saved';
  document.querySelector('#support-status').textContent = afterTracking ? 'YOUR UPDATE IS SAVED' : 'YOUR GOAL IS READY';
  document.querySelector('#support-copy').textContent = afterTracking
    ? 'Your score is now part of this goal’s history. You can return and add another update whenever it feels useful.'
    : 'You can return and track this goal whenever it feels useful.';
  document.querySelector('#support-back').dataset.go = afterTracking ? 'tracker-screen' : 'baseline-screen';
  document.querySelector('#support-close').dataset.go = afterTracking ? 'tracker-screen' : 'progress-screen';
  document.querySelector('#support-dismiss').dataset.go = afterTracking ? 'tracker-screen' : 'saved-screen';
  document.querySelector('#support-opt-out').checked = Boolean(getActiveGoal()?.suppressSupportPrompt);
  persist();
}

function syncGoal() {
  const title = goalInput.value.trim() || activeGoalTitle();
  document.querySelectorAll('[data-goal-text]').forEach((element) => {
    element.textContent = title;
  });
}

function createGoalCard(goal) {
  const latest = goal.trackerData.at(-1);
  const article = document.createElement('article');
  article.className = `active-goal-card${goal.isFictional ? ' demo-goal' : ''}`;

  if (goal.isFictional) {
    const label = document.createElement('div');
    label.className = 'demo-label';
    label.textContent = 'Fictional example';
    article.append(label);
  }

  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = 'I AIM TO…';
  const title = document.createElement('h3');
  title.textContent = goal.title;
  const scoreRow = document.createElement('div');
  scoreRow.className = 'goal-score';
  const score = document.createElement('strong');
  score.textContent = latest?.score ?? '—';
  const count = document.createElement('span');
  count.textContent = `Latest score · ${goal.trackerData.length} ${goal.trackerData.length === 1 ? 'update' : 'updates'}`;
  scoreRow.append(score, count);
  const button = document.createElement('button');
  button.className = 'secondary full-width';
  button.type = 'button';
  button.dataset.trackGoal = goal.id;
  button.textContent = 'View & track progress';
  article.append(eyebrow, title, scoreRow, button);
  return article;
}

function renderGoalLists() {
  ['goal-list', 'saved-goal-list'].forEach((id) => {
    const list = document.getElementById(id);
    if (!list) return;
    list.replaceChildren(...state.goals.map(createGoalCard));
  });
}

function setActiveGoal(id) {
  const goal = state.goals.find((item) => item.id === id);
  if (!goal) return;
  state.activeGoalId = goal.id;
  state.pendingGoalId = null;
  state.pendingGoalTitle = '';
  trackerData = goal.trackerData;
  goalInput.value = '';
  syncGoal();
  renderChart();
  syncGoalManagement();
  persist();
}

function syncGoalManagement() {
  const goal = getActiveGoal();
  document.querySelector('#goal-management').hidden = !goal || Boolean(goal.isFictional);
}

function beginNewGoal() {
  state.pendingGoalId = null;
  state.pendingGoalTitle = '';
  state.draftGoal = '';
  state.baselineScore = 5;
  state.baselineNote = '';
  goalInput.value = '';
  goalCount.textContent = '0/140';
  goalContinue.disabled = true;
  scoreSlider.value = 5;
  scoreValue.textContent = '5';
  document.querySelector('#baseline-note').value = '';
  persist();
}

function showPoint(index) {
  const entry = trackerData[index];
  if (!entry) return;
  document.querySelector('#point-date').textContent = shortDate(entry.date);
  document.querySelector('#point-score').textContent = entry.score;
  document.querySelector('#point-note').textContent = entry.note || 'No note was added for this update.';
  document.querySelectorAll('#progress-chart .point').forEach((point, pointIndex) => {
    point.classList.toggle('active', pointIndex === index);
    point.setAttribute('aria-current', pointIndex === index ? 'true' : 'false');
  });
}

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(svgNamespace, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function renderChart(selectedIndex = trackerData.length - 1) {
  const svg = document.querySelector('#progress-chart');
  if (!svg) return;
  svg.replaceChildren();

  if (!trackerData.length) {
    const message = svgElement('text', { x: 210, y: 125, 'text-anchor': 'middle', fill: '#66736f', 'font-size': 14 });
    message.textContent = 'Your first score will appear here.';
    svg.append(message);
    document.querySelector('#latest-score').textContent = '—';
    document.querySelector('#point-date').textContent = 'No updates yet';
    document.querySelector('#point-score').textContent = '—';
    document.querySelector('#point-note').textContent = 'Add your baseline to begin tracking this goal.';
    renderGoalLists();
    return;
  }

  const defs = svgElement('defs');
  const gradient = svgElement('linearGradient', { id: 'goal-gradient', x1: '0', y1: '0', x2: '0', y2: '1' });
  gradient.append(svgElement('stop', { offset: '0%', 'stop-color': '#d8f0e8' }), svgElement('stop', { offset: '100%', 'stop-color': '#ffffff' }));
  defs.append(gradient);
  svg.append(defs);

  const left = 35;
  const right = 397;
  const top = 34;
  const bottom = 218;
  const xFor = (index) => trackerData.length === 1 ? (left + right) / 2 : left + (index * (right - left)) / (trackerData.length - 1);
  const yFor = (score) => bottom - (score / 10) * (bottom - top);

  [0, 2, 4, 6, 8, 10].forEach((score) => {
    const y = yFor(score);
    svg.append(svgElement('line', { class: 'grid-line', x1: left, x2: right, y1: y, y2: y }));
    const label = svgElement('text', { class: 'axis-label', x: left - 9, y: y + 3 });
    label.textContent = score;
    svg.append(label);
  });

  const points = trackerData.map((entry, index) => [xFor(index), yFor(entry.score)]);
  const areaPath = `M ${points[0][0]} ${bottom} L ${points.map(([x, y]) => `${x} ${y}`).join(' L ')} L ${points.at(-1)[0]} ${bottom} Z`;
  svg.append(svgElement('path', { class: 'goal-area', d: areaPath }));
  svg.append(svgElement('polyline', { class: 'goal-line', points: points.map(([x, y]) => `${x},${y}`).join(' ') }));

  trackerData.forEach((entry, index) => {
    const [x, y] = points[index];
    const date = svgElement('text', { class: 'date-label', x, y: Math.max(13, y - 22) });
    date.textContent = shortDate(entry.date);
    const score = svgElement('text', { class: 'score-label', x, y: Math.min(bottom + 24, y + 27) });
    score.textContent = entry.score;
    const point = svgElement('circle', { class: `point${index === selectedIndex ? ' active' : ''}`, cx: x, cy: y, r: 7, tabindex: 0, role: 'button', 'aria-label': `${shortDate(entry.date)}, score ${entry.score}. Show note.` });
    const hit = svgElement('circle', { class: 'point-hit', cx: x, cy: y, r: 18 });
    const select = () => showPoint(index);
    point.addEventListener('click', select);
    hit.addEventListener('click', select);
    point.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') select(); });
    svg.append(date, score, hit, point);
  });

  document.querySelector('#latest-score').textContent = trackerData.at(-1).score;
  renderGoalLists();
  showPoint(Math.max(0, selectedIndex));
}

goalInput.addEventListener('input', () => {
  goalCount.textContent = `${goalInput.value.length}/140`;
  goalContinue.disabled = goalInput.value.trim().length < 3;
  state.draftGoal = goalInput.value;
  persist();
});

goalContinue.addEventListener('click', () => {
  state.pendingGoalTitle = goalInput.value.trim();
  state.pendingGoalId ||= `goal-${Date.now()}`;
  trackerData = [];
  syncGoal();
  persist();
  renderChart();
  showScreen('baseline-screen');
});

scoreSlider.addEventListener('input', () => {
  scoreValue.textContent = scoreSlider.value;
  state.baselineScore = Number(scoreSlider.value);
  persist();
});

document.querySelector('#baseline-note').addEventListener('input', (event) => {
  state.baselineNote = event.target.value;
  persist();
});

document.querySelector('#save-baseline').addEventListener('click', () => {
  const today = new Date().toISOString().slice(0, 10);
  const goal = {
    id: state.pendingGoalId || `goal-${Date.now()}`,
    title: state.pendingGoalTitle || goalInput.value.trim(),
    isFictional: false,
    suppressSupportPrompt: false,
    trackerData: [{ date: today, score: Number(scoreSlider.value), note: document.querySelector('#baseline-note').value.trim() }],
  };
  const existingIndex = state.goals.findIndex((item) => item.id === goal.id);
  if (existingIndex >= 0) state.goals[existingIndex] = goal;
  else state.goals.push(goal);
  state.activeGoalId = goal.id;
  state.pendingGoalId = null;
  state.pendingGoalTitle = '';
  state.draftGoal = '';
  trackerData = goal.trackerData;
  syncGoal();
  persist();
  renderChart();
  configureSupportScreen('goal');
});

const trackingDate = document.querySelector('#tracking-date');
const trackingSlider = document.querySelector('#tracking-slider');
const trackingScore = document.querySelector('#tracking-score');
const today = new Date().toISOString().slice(0, 10);
trackingDate.value = today;
trackingDate.max = today;
trackingSlider.addEventListener('input', () => { trackingScore.textContent = trackingSlider.value; });

function validateTrackingDate() {
  const invalid = !trackingDate.value || trackingDate.value > today;
  trackingDate.classList.toggle('invalid', invalid);
  document.querySelector('#tracking-date-error').hidden = !invalid;
  document.querySelector('#save-tracking').disabled = invalid;
  return !invalid;
}

trackingDate.addEventListener('input', validateTrackingDate);
trackingDate.addEventListener('change', validateTrackingDate);

document.querySelector('#save-tracking').addEventListener('click', () => {
  if (!validateTrackingDate()) {
    showToast('Choose today or an earlier date.');
    return;
  }
  const goal = getActiveGoal();
  if (!goal) return;
  const date = trackingDate.value || new Date().toISOString().slice(0, 10);
  const score = Number(trackingSlider.value);
  const noteField = document.querySelector('#tracking-note');
  const existingIndex = goal.trackerData.findIndex((entry) => entry.date === date);
  const entry = { date, score, note: noteField.value.trim() };
  if (existingIndex >= 0) goal.trackerData[existingIndex] = entry;
  else goal.trackerData.push(entry);
  goal.trackerData.sort((a, b) => a.date.localeCompare(b.date));
  trackerData = goal.trackerData;
  const selectedIndex = trackerData.findIndex((item) => item.date === date);
  noteField.value = '';
  persist();
  renderChart(selectedIndex);
  if (goal.suppressSupportPrompt) {
    showToast(existingIndex >= 0 ? 'That day’s progress was updated.' : 'Your progress update was added.');
    document.querySelector('#point-detail').scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    configureSupportScreen('tracking');
    showScreen('support-screen');
  }
});

document.querySelector('#support-opt-out').addEventListener('change', (event) => {
  const goal = getActiveGoal();
  if (!goal) return;
  goal.suppressSupportPrompt = event.target.checked;
  persist();
});

const cancelGoalDialog = document.querySelector('#cancel-goal-dialog');

document.querySelector('#cancel-goal').addEventListener('click', () => {
  const goal = getActiveGoal();
  if (!goal || goal.isFictional) return;
  cancelGoalDialog.showModal();
});

document.querySelector('#confirm-cancel-goal').addEventListener('click', () => {
  const goal = getActiveGoal();
  if (!goal || goal.isFictional) return;
  state.goals = state.goals.filter((item) => item.id !== goal.id);
  const nextGoal = state.goals.find((item) => item.id === 'fictional-example') || state.goals[0];
  state.activeGoalId = nextGoal.id;
  trackerData = nextGoal.trackerData;
  syncGoal();
  renderChart();
  renderGoalLists();
  syncGoalManagement();
  persist();
  showScreen('saved-screen');
  showToast('Goal cancelled. The fictional example is still available.');
});

document.addEventListener('click', (event) => {
  const trackButton = event.target.closest('[data-track-goal]');
  if (trackButton) {
    setActiveGoal(trackButton.dataset.trackGoal);
    showScreen('tracker-screen');
    return;
  }

  const navigation = event.target.closest('[data-go]');
  if (navigation && navigation.id !== 'goal-continue') {
    if (navigation.hasAttribute('data-new-goal')) beginNewGoal();
    if (navigation.hasAttribute('data-quiz-entry')) {
      const currentScreen = document.querySelector('.screen.active');
      setQuizReturnScreen(currentScreen?.id || 'progress-screen');
    }
    showScreen(navigation.dataset.go);
    return;
  }

  const choice = event.target.closest('.choice');
  if (choice) {
    const group = choice.closest('.choice-grid');
    if (group.dataset.select === 'single') {
      group.querySelectorAll('.choice').forEach((item) => item.classList.toggle('selected', item === choice));
    } else {
      const selectedCount = group.querySelectorAll('.choice.selected').length;
      if (choice.classList.contains('selected') || selectedCount < Number(group.dataset.max || 99)) choice.classList.toggle('selected');
    }
    const selected = [...group.querySelectorAll('.choice.selected')].map((item) => item.textContent.trim());
    if (group.dataset.output === 'support-area') {
      state.supportArea = selected[0] || 'Not specified';
      document.querySelector('#review-choice').textContent = state.supportArea;
    }
    if (group.dataset.output === 'therapy-style') {
      state.therapyStyle = selected;
      document.querySelector('#review-style').textContent = selected.join(', ') || 'No preference';
    }
    persist();
  }

  const therapistButton = event.target.closest('.choose-therapist');
  if (therapistButton) {
    const therapist = therapistButton.closest('.therapist-card').dataset.therapist;
    state.selectedTherapist = therapist;
    document.querySelector('#review-therapist').textContent = therapist;
    document.querySelector('#review-therapist-heading').textContent = therapist;
    persist();
    showScreen('review-screen');
  }

  const toastTrigger = event.target.closest('[data-toast]');
  if (toastTrigger) showToast(toastTrigger.dataset.toast);
});

document.querySelector('#availability').addEventListener('change', (event) => {
  state.availability = event.target.value;
  document.querySelector('#review-availability').textContent = state.availability;
  persist();
});

document.querySelector('#therapist-preference').addEventListener('change', (event) => {
  state.therapistPreference = event.target.value;
  persist();
});

document.querySelector('#share-goal').addEventListener('change', (event) => {
  state.shareGoal = event.target.checked;
  document.querySelector('#review-goal-row').hidden = !state.shareGoal;
  persist();
});

function restoreChoiceGroup(output, selectedValues) {
  const group = document.querySelector(`.choice-grid[data-output="${output}"]`);
  if (!group) return;
  const values = Array.isArray(selectedValues) ? selectedValues : [selectedValues];
  group.querySelectorAll('.choice').forEach((choice) => choice.classList.toggle('selected', values.includes(choice.textContent.trim())));
}

function restoreState() {
  const activeGoal = getActiveGoal() || state.goals[0];
  state.activeGoalId = activeGoal.id;
  trackerData = activeGoal.trackerData;
  goalInput.value = state.draftGoal || '';
  goalCount.textContent = `${goalInput.value.length}/140`;
  goalContinue.disabled = goalInput.value.trim().length < 3;
  scoreSlider.value = state.baselineScore;
  scoreValue.textContent = state.baselineScore;
  document.querySelector('#baseline-note').value = state.baselineNote || '';
  document.querySelector('#availability').value = state.availability;
  document.querySelector('#therapist-preference').value = state.therapistPreference;
  document.querySelector('#share-goal').checked = Boolean(state.shareGoal);
  document.querySelector('#review-goal-row').hidden = !state.shareGoal;
  document.querySelector('#review-choice').textContent = state.supportArea;
  document.querySelector('#review-style').textContent = state.therapyStyle.join(', ') || 'No preference';
  document.querySelector('#review-availability').textContent = state.availability;
  document.querySelector('#review-therapist').textContent = state.selectedTherapist;
  document.querySelector('#review-therapist-heading').textContent = state.selectedTherapist;
  restoreChoiceGroup('support-area', state.supportArea);
  restoreChoiceGroup('therapy-style', state.therapyStyle);
  configureSupportScreen(state.supportScreenMode || 'goal');
  setQuizReturnScreen(state.quizReturnScreen || 'support-screen');
  syncGoal();
  renderChart();
  renderGoalLists();
  syncGoalManagement();
  const resumableScreen = document.getElementById(state.lastScreen) ? state.lastScreen : 'progress-screen';
  screens.forEach((screen) => screen.classList.toggle('active', screen.id === resumableScreen));
  persist();
}

restoreState();
