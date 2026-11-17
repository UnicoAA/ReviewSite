const STORAGE_KEY = 'study-nook-data-v1';
const appView = document.getElementById('appView');
const deckDialog = document.getElementById('deckDialog');
const cardDialog = document.getElementById('cardDialog');
const deckForm = document.getElementById('deckForm');
const cardForm = document.getElementById('cardForm');
const importFile = document.getElementById('importFile');
const themeToggle = document.getElementById('themeToggle');
const THEME_KEY = 'study-nook-theme-v1';
const DAY = 24 * 60 * 60 * 1000;

function copy(value) { return JSON.parse(JSON.stringify(value)); }
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && Array.isArray(saved.decks)) {
      return {
        decks: saved.decks,
        activity: Array.isArray(saved.activity) ? saved.activity : [],
        reviewedToday: saved.reviewedToday || '',
        reviewsToday: Number(saved.reviewsToday) || 0
      };
    }
  } catch (error) {
    console.warn('Saved study data could not be read.', error);
  }
  return { decks: copy(STUDY_DECKS), activity: [], reviewedToday: '', reviewsToday: 0 };
}

let state = loadState();
let currentView = 'today';
let selectedDeckId = state.decks[0]?.id || '';
let studySession = null;
let quizSession = null;
let toastTimer;

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    showToast('This browser could not save your progress. Try exporting a backup.');
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function markActivity() {
  const today = todayKey();
  if (!state.activity.includes(today)) state.activity.push(today);
  state.activity = [...new Set(state.activity)].sort().slice(-90);
  if (state.reviewedToday !== today) {
    state.reviewedToday = today;
    state.reviewsToday = 0;
  }
  state.reviewsToday += 1;
}

function streakCount() {
  const days = new Set(state.activity || []);
  const cursor = new Date();
  let count = 0;
  if (!days.has(todayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(todayKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

function allCards() { return state.decks.flatMap(deck => deck.cards || []); }
function getDeck(id) { return state.decks.find(deck => deck.id === id); }
function dueCards(deck) {
  const now = Date.now();
  return (deck?.cards || []).filter(card => !card.dueAt || Number(card.dueAt) <= now);
}
function dueTotal() { return state.decks.reduce((total, deck) => total + dueCards(deck).length, 0); }
function deckIconClass(deck) { return ['green', 'peach', 'lavender', 'yellow'].includes(deck.color) ? deck.color : 'green'; }
function deckIcon(deck) {
  return ({ green: '✦', peach: '◌', lavender: '✧', yellow: '☼' })[deckIconClass(deck)];
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
}

function applyTheme(theme) {
  const dark = theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]').content = dark ? '#151b18' : '#f7f5f0';
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  themeToggle.querySelector('.theme-icon').textContent = dark ? '☀' : '☾';
  themeToggle.querySelector('.theme-label').textContent = dark ? 'Light mode' : 'Dark mode';
}

function navigate(view) {
  currentView = view;
  document.querySelectorAll('[data-nav]').forEach(button => {
    button.classList.toggle('active', button.dataset.nav === view);
    if (button.classList.contains('nav-link')) {
      if (button.dataset.nav === view) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
  });
  render();
  appView.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function render() {
  if (currentView === 'flashcards') appView.innerHTML = renderFlashcards();
  else if (currentView === 'quiz') appView.innerHTML = renderQuiz();
  else if (currentView === 'decks') appView.innerHTML = renderDeckManager();
  else appView.innerHTML = renderToday();
}

function deckCardHtml(deck) {
  const due = dueCards(deck).length;
  return `<article class="deck-card">
    <div class="deck-card-top">
      <span class="deck-icon ${deckIconClass(deck)}" aria-hidden="true">${deckIcon(deck)}</span>
      <span class="deck-count">${deck.cards.length} ${deck.cards.length === 1 ? 'card' : 'cards'}</span>
    </div>
    <h3>${escapeHtml(deck.title)}</h3>
    <p class="deck-description">${escapeHtml(deck.description || 'A little set to keep your learning moving.')}</p>
    <div class="deck-card-actions">
      <span class="deck-due">${due ? `${due} ready to review` : 'All caught up'}</span>
      <span style="flex:1"></span>
      <button class="button button-light button-small" type="button" data-action="manage-deck" data-deck="${escapeHtml(deck.id)}">Edit</button>
      <button class="button button-green button-small" type="button" data-action="study-all" data-deck="${escapeHtml(deck.id)}">Study</button>
    </div>
  </article>`;
}

function renderToday() {
  const decks = state.decks;
  const due = dueTotal();
  const count = allCards().length;
  const dueDeck = decks.find(deck => dueCards(deck).length > 0);
  const decksSection = decks.length
    ? `<section aria-labelledby="decksHeading">
        <div class="section-heading"><div><h2 id="decksHeading">Your study sets</h2><p>Pick up wherever you left off.</p></div><button class="text-button" type="button" data-action="go-decks">See all decks →</button></div>
        <div class="deck-grid">${decks.slice(0, 3).map(deckCardHtml).join('')}</div>
      </section>`
    : `<section class="empty-state"><div class="empty-icon" aria-hidden="true">＋</div><h3>Your first deck starts here</h3><p>Create a deck, add a few questions and answers, and it will be ready for flashcards and quizzes.</p><button class="button button-dark" type="button" data-action="new-deck">Create a deck</button></section>`;

  return `<section class="hero" aria-labelledby="welcomeTitle">
    <div class="hero-copy">
      <p class="eyebrow">A LITTLE REVIEW GOES A LONG WAY</p>
      <h1 id="welcomeTitle">Small steps,<br>solid recall.</h1>
      <p class="subtle-copy">A calm corner for flashcards, quick quizzes, and getting the tricky bits to stick.</p>
      <div class="hero-actions">
        <button class="button button-dark" type="button" data-action="start-due" ${due ? '' : 'disabled'}>Start today’s review <span aria-hidden="true">→</span></button>
        <button class="button button-light" type="button" data-action="go-quiz">Take a quiz</button>
      </div>
    </div>
    <div class="hero-art" aria-hidden="true"><div class="study-stack">
      <div class="study-note one"><span>KEEP GOING</span><span>One card at a time.</span></div>
      <div class="study-note two"><span>YOU’VE GOT THIS</span><span>Little by little.</span></div>
      <div class="study-note three"><span>✦ TODAY’S NOTE</span><span>Good things take practice.</span></div>
    </div></div>
  </section>
  <section class="stats-row" aria-label="Study overview">
    <div class="stat-card"><span class="stat-value">${due}</span><span class="stat-label">ready to review</span></div>
    <div class="stat-card"><span class="stat-value">${count}</span><span class="stat-label">cards in your library</span></div>
    <div class="stat-card"><span class="stat-value">${streakCount()}</span><span class="stat-label">${streakCount() === 1 ? 'day' : 'days'} in a row</span></div>
  </section>
  ${decksSection}`;
}

function deckSelectHtml(selectedId) {
  if (!state.decks.length) return '<option value="">Create a deck first</option>';
  return state.decks.map(deck => `<option value="${escapeHtml(deck.id)}" ${deck.id === selectedId ? 'selected' : ''}>${escapeHtml(deck.title)}</option>`).join('');
}

function renderFlashcards() {
  const session = studySession;
  const deck = session ? getDeck(session.deckId) : null;
  if (session && (!deck || session.index >= session.ids.length)) {
    const completed = session.completed;
    return `<section class="page-intro"><p class="eyebrow">FLASHCARDS</p><h1>That’s your review done.</h1><p>Nice work showing up for yourself. Your next cards will be ready when it’s time.</p></section>
      <section class="empty-state"><div class="empty-icon" aria-hidden="true">✦</div><h3>${completed} ${completed === 1 ? 'card' : 'cards'} reviewed</h3><p>Your cards have been scheduled for another look using spaced review.</p><button class="button button-dark" type="button" data-action="go-today">Back to today</button> <button class="button button-light" type="button" data-action="study-all" data-deck="${escapeHtml(session.deckId)}">Preview this deck</button></section>`;
  }
  if (!session) {
    const selected = getDeck(selectedDeckId) || state.decks[0];
    selectedDeckId = selected?.id || '';
    const due = dueCards(selected).length;
    return `<section class="page-intro"><p class="eyebrow">FLASHCARDS</p><h1>Make it stick.</h1><p>Try to remember first, then flip the card and rate how it felt.</p></section>
      ${state.decks.length ? `<div class="select-row">
        <div class="select-field"><label for="studyDeckSelect">Choose a deck</label><select class="select-input" id="studyDeckSelect">${deckSelectHtml(selectedDeckId)}</select></div>
        <button class="button button-green" type="button" data-action="start-due-deck" ${due ? '' : 'disabled'}>Review ${due} due ${due === 1 ? 'card' : 'cards'}</button>
        <button class="button button-light" type="button" data-action="study-all" data-deck="${escapeHtml(selectedDeckId)}">Study all cards</button>
      </div>` : `<section class="empty-state"><div class="empty-icon" aria-hidden="true">✦</div><h3>No decks yet</h3><p>Add a deck and some questions to start using flashcards.</p><button class="button button-dark" type="button" data-action="new-deck">Create your first deck</button></section>`}
      ${selected ? `<div class="study-layout"><section class="study-panel" aria-label="Flashcard preview"><div class="flashcard"><span class="flashcard-label">READY WHEN YOU ARE</span><p class="flashcard-text">Choose a review above<br>to begin.</p></div><div class="study-controls"><button class="button button-light" type="button" disabled>Again</button><button class="button button-light" type="button" disabled>Hard</button><button class="button button-light" type="button" disabled>Good</button><button class="button button-light" type="button" disabled>Easy</button></div></section><aside class="study-side"><h3>A gentle rhythm</h3><p>Cards you find difficult come back sooner. The ones you know well get more time before the next review.</p><div class="review-key"><strong>Again</strong><span>in about 10 minutes</span><strong>Hard</strong><span>in 1 day</span><strong>Good</strong><span>in 3 days</span><strong>Easy</strong><span>in 4 days or more</span></div></aside></div>` : ''}`;
  }

  const card = deck.cards.find(item => item.id === session.ids[session.index]);
  if (!card) {
    session.index += 1;
    return renderFlashcards();
  }
  const total = session.ids.length;
  const progress = Math.round((session.index / total) * 100);
  const shownText = session.flipped ? card.answer : card.front;
  const note = session.flipped ? card.note : '';
  return `<section class="page-intro"><p class="eyebrow">FLASHCARDS · ${escapeHtml(deck.title)}</p><h1>One card at a time.</h1><p>Take a moment to recall it before you turn it over.</p></section>
    <div class="study-layout">
      <section class="study-panel" aria-label="Flashcard session">
        <div class="study-panel-top"><span class="progress-label">Card ${session.index + 1} of ${total}</span><button class="text-button" type="button" data-action="end-study">Finish session</button></div>
        <div class="progress-track" role="progressbar" aria-label="Review progress" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill" style="width:${progress}%"></div></div>
        <div class="flashcard" aria-live="polite"><span class="flashcard-label">${session.flipped ? 'THE ANSWER' : 'YOUR QUESTION'}</span><p class="flashcard-text">${escapeHtml(shownText)}</p>${note ? `<p class="flashcard-source">${escapeHtml(note)}</p>` : ''}<p class="flashcard-source">${escapeHtml(card.source || deck.source || '')}</p></div>
        ${session.flipped ? `<p class="progress-label" style="text-align:center;margin:0 0 12px">How well did you remember?</p><div class="study-controls"><button class="button button-light" type="button" data-action="grade" data-grade="again">Again</button><button class="button button-light" type="button" data-action="grade" data-grade="hard">Hard</button><button class="button button-green" type="button" data-action="grade" data-grade="good">Good</button><button class="button button-dark" type="button" data-action="grade" data-grade="easy">Easy</button></div>` : `<div class="study-controls"><button class="button button-dark" type="button" data-action="flip-card">Show answer</button></div>`}
      </section>
      <aside class="study-side"><h3>Spaced review</h3><p>Your rating sets the next review time. Choose the one that feels honest so your tricky cards return at the right pace.</p><div class="review-key"><strong>Again</strong><span>in about 10 minutes</span><strong>Hard</strong><span>in 1 day</span><strong>Good</strong><span>in 3 days</span><strong>Easy</strong><span>in 4 days or more</span></div></aside>
    </div>`;
}

function renderQuiz() {
  if (quizSession) {
    if (quizSession.index >= quizSession.questions.length) {
      const total = quizSession.questions.length;
      const score = quizSession.score;
      return `<section class="page-intro"><p class="eyebrow">QUIZ COMPLETE</p><h1>You made it through.</h1><p>Every question is another chance to make the ideas clearer.</p></section>
        <section class="quiz-panel"><div class="quiz-result"><div class="quiz-result-score">${score}/${total}</div><h2>${score === total ? 'Perfect round!' : score / total >= .7 ? 'Nicely done.' : 'Good practice.'}</h2><p class="subtle-copy" style="margin:0 auto 22px">You got ${score} of ${total} questions right. The flashcards are there if you want another pass.</p><button class="button button-dark" type="button" data-action="quiz-again" data-deck="${escapeHtml(quizSession.deckId)}">Try another round</button> <button class="button button-light" type="button" data-action="go-today">Back to today</button></div></section>`;
    }
    const item = quizSession.questions[quizSession.index];
    const card = item.card;
    const letters = ['A', 'B', 'C', 'D'];
    const isCorrect = quizSession.selected === card.answer;
    return `<section class="page-intro"><p class="eyebrow">MULTIPLE-CHOICE QUIZ · ${escapeHtml(quizSession.deckTitle)}</p><h1>Quick check.</h1><p>Choose the answer that best fits the handout.</p></section>
      <section class="quiz-panel" aria-label="Quiz question">
        <div class="quiz-meta"><span>Question ${quizSession.index + 1} of ${quizSession.questions.length}</span><span>${quizSession.score} right so far</span></div>
        <div class="progress-track" style="margin-top:13px" role="progressbar" aria-label="Quiz progress" aria-valuenow="${Math.round((quizSession.index / quizSession.questions.length) * 100)}" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill" style="width:${Math.round((quizSession.index / quizSession.questions.length) * 100)}%"></div></div>
        <h2 class="quiz-question">${escapeHtml(card.front)}</h2>
        <div class="quiz-options">${item.options.map((option, index) => {
          const correctClass = quizSession.answered && option === card.answer ? ' correct' : '';
          const incorrectClass = quizSession.answered && option === quizSession.selected && !isCorrect ? ' incorrect' : '';
          return `<button class="quiz-option${correctClass}${incorrectClass}" type="button" data-action="quiz-answer" data-option="${escapeHtml(option)}" ${quizSession.answered ? 'disabled' : ''}><span class="option-letter">${letters[index]}</span><span>${escapeHtml(option)}</span></button>`;
        }).join('')}</div>
        ${quizSession.answered ? `<p class="quiz-feedback">${isCorrect ? 'That’s right.' : 'Not quite. The answer is: ' + escapeHtml(card.answer)}${card.note ? ` ${escapeHtml(card.note)}` : ''}</p>` : ''}
        <div class="quiz-footer"><span class="progress-label">${quizSession.score} correct</span>${quizSession.answered ? `<button class="button button-dark" type="button" data-action="quiz-next">${quizSession.index + 1 === quizSession.questions.length ? 'See results' : 'Next question'} →</button>` : '<span class="progress-label">Choose one answer</span>'}</div>
      </section>`;
  }

  const selected = getDeck(selectedDeckId) || state.decks[0];
  selectedDeckId = selected?.id || '';
  return `<section class="page-intro"><p class="eyebrow">MULTIPLE-CHOICE QUIZ</p><h1>See what’s sticking.</h1><p>A quick quiz built from your cards. You’ll get a little feedback after each answer.</p></section>
    ${state.decks.length ? `<div class="select-row"><div class="select-field"><label for="quizDeckSelect">Choose a deck</label><select class="select-input" id="quizDeckSelect">${deckSelectHtml(selectedDeckId)}</select></div><button class="button button-dark" type="button" data-action="start-quiz" data-deck="${escapeHtml(selectedDeckId)}" ${selected && selected.cards.length ? '' : 'disabled'}>Start quiz <span aria-hidden="true">→</span></button></div>
      ${selected ? `<div class="deck-grid">${deckCardHtml(selected)}</div>` : ''}` : `<section class="empty-state"><div class="empty-icon" aria-hidden="true">?</div><h3>No quiz decks yet</h3><p>Create a deck and add cards with three wrong answers to build multiple-choice quizzes.</p><button class="button button-dark" type="button" data-action="new-deck">Create a deck</button></section>`}`;
}

function renderDeckManager() {
  const decks = state.decks;
  const managerDeck = deck => `<section class="deck-manager-card">
    <div class="deck-manager-head"><div class="deck-manager-title"><span class="deck-icon ${deckIconClass(deck)}" aria-hidden="true">${deckIcon(deck)}</span><div><h3>${escapeHtml(deck.title)}</h3><p>${deck.cards.length} ${deck.cards.length === 1 ? 'flashcard' : 'flashcards'} · ${dueCards(deck).length} ready to review</p></div></div>
      <div class="deck-manager-actions"><button class="button button-light button-small" type="button" data-action="add-card" data-deck="${escapeHtml(deck.id)}">＋ Add card</button><button class="text-button" type="button" data-action="edit-deck" data-deck="${escapeHtml(deck.id)}">Edit deck</button><button class="text-button danger" type="button" data-action="delete-deck" data-deck="${escapeHtml(deck.id)}">Delete</button></div>
    </div>
    <div class="card-list">${deck.cards.length ? deck.cards.map(card => `<div class="card-row"><div class="card-row-copy"><strong>${escapeHtml(card.front)}</strong><span>${escapeHtml(card.answer)}</span></div><div class="row-actions"><button class="text-button" type="button" data-action="edit-card" data-deck="${escapeHtml(deck.id)}" data-card="${escapeHtml(card.id)}">Edit</button><button class="text-button danger" type="button" data-action="delete-card" data-deck="${escapeHtml(deck.id)}" data-card="${escapeHtml(card.id)}">Delete</button></div></div>`).join('') : '<div class="card-row"><div class="card-row-copy"><strong>No cards yet</strong><span>Add a question, its answer, and three quiz choices.</span></div></div>'}</div>
  </section>`;

  return `<section class="page-intro"><p class="eyebrow">YOUR LIBRARY</p><h1>Make it yours.</h1><p>Add decks and cards whenever there’s something new to review. Changes are saved in this browser.</p></section>
    <div class="library-tools"><p>Keep a backup or bring in another deck. Exported JSON files can be imported here later.</p><button class="button button-light button-small" type="button" data-action="export">↓ Export backup</button><button class="button button-light button-small" type="button" data-action="import">↑ Import deck</button><button class="button button-dark button-small" type="button" data-action="new-deck">＋ New deck</button></div>
    ${decks.length ? `<div class="deck-list">${decks.map(managerDeck).join('')}</div>` : `<div class="empty-state"><div class="empty-icon" aria-hidden="true">✦</div><h3>Your library is waiting</h3><p>Create a deck and add the first few questions you want to remember.</p><button class="button button-dark" type="button" data-action="new-deck">Create a deck</button></div>`}`;
}

function startStudy(deckId, includeAll) {
  const deck = getDeck(deckId);
  if (!deck || !deck.cards.length) return showToast('Add a few cards to this deck first.');
  const cards = includeAll ? deck.cards : dueCards(deck);
  if (!cards.length) return showToast('You’re all caught up on this deck.');
  selectedDeckId = deckId;
  studySession = { deckId, ids: cards.map(card => card.id), index: 0, completed: 0, flipped: false };
  currentView = 'flashcards';
  render();
  updateNavigation();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function gradeCurrentCard(grade) {
  if (!studySession) return;
  const deck = getDeck(studySession.deckId);
  const card = deck?.cards.find(item => item.id === studySession.ids[studySession.index]);
  if (!card) return;
  const base = Number(card.intervalDays) || 1;
  const intervals = { again: 10 / (60 * 24), hard: Math.max(1, Math.round(base * 1.3)), good: Math.max(3, Math.round(base * 2.5)), easy: Math.max(4, Math.round(base * 4)) };
  const days = intervals[grade] ?? 1;
  card.dueAt = Date.now() + days * DAY;
  card.intervalDays = days;
  card.reps = (Number(card.reps) || 0) + 1;
  markActivity();
  studySession.index += 1;
  studySession.completed += 1;
  studySession.flipped = false;
  saveState();
  render();
}

function startQuiz(deckId) {
  const deck = getDeck(deckId);
  if (!deck || !deck.cards.length) return showToast('Add a few cards to this deck first.');
  const cards = shuffle(deck.cards).slice(0, Math.min(10, deck.cards.length));
  quizSession = {
    deckId,
    deckTitle: deck.title,
    questions: cards.map(card => ({ card, options: shuffle([...new Set([...(card.choices || []), card.answer])]).slice(0, 4) })),
    index: 0,
    score: 0,
    answered: false,
    selected: null
  };
  if (quizSession.questions.some(question => question.options.length < 4)) {
    quizSession = null;
    return showToast('Each flashcard needs three different wrong answers for a multiple-choice quiz.');
  }
  currentView = 'quiz';
  render();
  updateNavigation();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function answerQuiz(option) {
  if (!quizSession || quizSession.answered) return;
  const question = quizSession.questions[quizSession.index];
  quizSession.selected = option;
  quizSession.answered = true;
  if (option === question.card.answer) quizSession.score += 1;
  render();
}

function nextQuizQuestion() {
  if (!quizSession) return;
  quizSession.index += 1;
  quizSession.answered = false;
  quizSession.selected = null;
  if (quizSession.index >= quizSession.questions.length) {
    markActivity();
    saveState();
  }
  render();
}

function updateNavigation() {
  document.querySelectorAll('[data-nav]').forEach(button => {
    button.classList.toggle('active', button.dataset.nav === currentView);
    if (button.classList.contains('nav-link')) {
      if (button.dataset.nav === currentView) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
  });
}

function openDeckDialog(deck = null) {
  document.getElementById('deckId').value = deck?.id || '';
  document.getElementById('deckTitle').value = deck?.title || '';
  document.getElementById('deckDescription').value = deck?.description || '';
  document.getElementById('deckDialogTitle').textContent = deck ? 'Edit your deck' : 'Create a deck';
  deckDialog.showModal();
  document.getElementById('deckTitle').focus();
}

function openCardDialog(deck, card = null) {
  if (!deck) return;
  cardForm.reset();
  document.getElementById('cardDeckId').value = deck.id;
  document.getElementById('cardId').value = card?.id || '';
  document.getElementById('cardDeckName').textContent = deck.title.toUpperCase();
  document.getElementById('cardDialogTitle').textContent = card ? 'Edit flashcard' : 'Add a flashcard';
  document.getElementById('cardQuestion').value = card?.front || '';
  document.getElementById('cardAnswer').value = card?.answer || '';
  document.getElementById('cardChoices').value = card ? (card.choices || []).filter(choice => choice !== card.answer).join('\n') : '';
  document.getElementById('cardNote').value = card?.note || '';
  document.getElementById('cardSource').value = card?.source || deck.source || '';
  cardDialog.showModal();
  document.getElementById('cardQuestion').focus();
}

function exportLibrary() {
  const payload = { format: 'study-nook', version: 1, exportedAt: new Date().toISOString(), decks: state.decks };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `study-nook-backup-${todayKey()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast('Your backup is ready.');
}

function importLibrary(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const incoming = Array.isArray(parsed) ? parsed : parsed.decks;
      if (!Array.isArray(incoming) || !incoming.length) throw new Error('No decks found in that file.');
      const timestamp = Date.now();
      const imported = incoming.map((deck, deckIndex) => {
        if (!deck || !String(deck.title || '').trim() || !Array.isArray(deck.cards)) throw new Error('A deck is missing its name or cards.');
        const id = `import-${timestamp}-${deckIndex}`;
        const cards = deck.cards.map((card, cardIndex) => {
          const front = String(card.front || '').trim();
          const answer = String(card.answer || '').trim();
          const choices = [...new Set((Array.isArray(card.choices) ? card.choices : []).map(item => String(item).trim()).filter(item => item && item.toLowerCase() !== answer.toLowerCase()))].slice(0, 3);
          if (!front || !answer || choices.length !== 3) throw new Error(`A card in “${deck.title}” needs a question, answer, and three different wrong answers.`);
          return { id: `${id}-${cardIndex}`, front, answer, choices, note: String(card.note || ''), source: String(card.source || deck.source || ''), dueAt: null, intervalDays: 0, reps: 0 };
        });
        return { id, title: String(deck.title).trim().slice(0, 70), description: String(deck.description || '').slice(0, 180), source: String(deck.source || ''), color: ['green','peach','lavender','yellow'].includes(deck.color) ? deck.color : 'green', cards };
      });
      state.decks.push(...imported);
      saveState();
      selectedDeckId = imported[0].id;
      render();
      showToast(`${imported.length} ${imported.length === 1 ? 'deck' : 'decks'} added to your library.`);
    } catch (error) {
      showToast(error.message || 'That file could not be imported.');
    }
    importFile.value = '';
  };
  reader.onerror = () => showToast('This file could not be read.');
  reader.readAsText(file);
}

function handleAction(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  const deckId = button.dataset.deck || selectedDeckId;
  const deck = getDeck(deckId);
  if (action === 'new-deck') openDeckDialog();
  else if (action === 'go-decks') navigate('decks');
  else if (action === 'go-today') { studySession = null; quizSession = null; navigate('today'); }
  else if (action === 'go-quiz') { quizSession = null; navigate('quiz'); }
  else if (action === 'manage-deck') { selectedDeckId = deckId; navigate('decks'); }
  else if (action === 'study-all') startStudy(deckId, true);
  else if (action === 'start-due') {
    const firstDue = state.decks.find(item => dueCards(item).length);
    if (firstDue) startStudy(firstDue.id, false);
  }
  else if (action === 'start-due-deck') startStudy(selectedDeckId, false);
  else if (action === 'flip-card' && studySession) { studySession.flipped = true; render(); }
  else if (action === 'grade') gradeCurrentCard(button.dataset.grade);
  else if (action === 'end-study') { studySession.index = studySession.ids.length; render(); }
  else if (action === 'start-quiz' || action === 'quiz-again') startQuiz(deckId);
  else if (action === 'quiz-answer') answerQuiz(button.dataset.option);
  else if (action === 'quiz-next') nextQuizQuestion();
  else if (action === 'add-card') openCardDialog(deck);
  else if (action === 'edit-deck') openDeckDialog(deck);
  else if (action === 'edit-card') openCardDialog(deck, deck?.cards.find(card => card.id === button.dataset.card));
  else if (action === 'delete-deck' && deck && window.confirm(`Delete “${deck.title}” and all of its cards?`)) {
    state.decks = state.decks.filter(item => item.id !== deck.id);
    if (selectedDeckId === deck.id) selectedDeckId = state.decks[0]?.id || '';
    saveState(); render(); showToast('Deck deleted.');
  }
  else if (action === 'delete-card' && deck) {
    const card = deck.cards.find(item => item.id === button.dataset.card);
    if (card && window.confirm('Delete this flashcard?')) {
      deck.cards = deck.cards.filter(item => item.id !== card.id);
      saveState(); render(); showToast('Flashcard deleted.');
    }
  }
  else if (action === 'export') exportLibrary();
  else if (action === 'import') importFile.click();
}

document.querySelectorAll('[data-nav]').forEach(button => button.addEventListener('click', event => {
  event.preventDefault();
  studySession = null;
  if (button.dataset.nav !== 'quiz') quizSession = null;
  navigate(button.dataset.nav);
}));
document.getElementById('newDeckButton').addEventListener('click', () => openDeckDialog());
themeToggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem(THEME_KEY, next); } catch (error) { showToast('This browser could not save the theme preference.'); }
});
appView.addEventListener('click', handleAction);
appView.addEventListener('change', event => {
  if (event.target.id === 'studyDeckSelect' || event.target.id === 'quizDeckSelect') {
    selectedDeckId = event.target.value;
    render();
  }
});
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.close).close()));
importFile.addEventListener('change', () => { if (importFile.files?.[0]) importLibrary(importFile.files[0]); });

deckForm.addEventListener('submit', event => {
  event.preventDefault();
  const id = document.getElementById('deckId').value;
  const title = document.getElementById('deckTitle').value.trim();
  const description = document.getElementById('deckDescription').value.trim();
  if (!title) return;
  const existing = getDeck(id);
  if (existing) { existing.title = title; existing.description = description; }
  else {
    const newDeck = { id: `deck-${Date.now()}`, title, description, source: '', color: ['green','peach','lavender','yellow'][state.decks.length % 4], cards: [] };
    state.decks.push(newDeck);
    selectedDeckId = newDeck.id;
  }
  saveState();
  deckDialog.close();
  render();
  showToast(existing ? 'Deck updated.' : 'Your new deck is ready.');
});

cardForm.addEventListener('submit', event => {
  event.preventDefault();
  const deck = getDeck(document.getElementById('cardDeckId').value);
  if (!deck) return;
  const id = document.getElementById('cardId').value;
  const front = document.getElementById('cardQuestion').value.trim();
  const answer = document.getElementById('cardAnswer').value.trim();
  const choices = [...new Set(document.getElementById('cardChoices').value.split('\n').map(choice => choice.trim()).filter(choice => choice && choice.toLowerCase() !== answer.toLowerCase()))];
  if (choices.length !== 3) {
    showToast('Add three different wrong answers that do not match the correct answer.');
    return;
  }
  const values = { front, answer, choices, note: document.getElementById('cardNote').value.trim(), source: document.getElementById('cardSource').value.trim() };
  const existing = deck.cards.find(card => card.id === id);
  if (existing) Object.assign(existing, values);
  else deck.cards.push({ id: `card-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, ...values, dueAt: null, intervalDays: 0, reps: 0 });
  selectedDeckId = deck.id;
  saveState();
  cardDialog.close();
  currentView = 'decks';
  updateNavigation();
  render();
  showToast(existing ? 'Flashcard updated.' : 'Flashcard added.');
});

let savedTheme = 'light';
try { if (localStorage.getItem(THEME_KEY) === 'dark') savedTheme = 'dark'; } catch (error) { /* Keep the default light theme. */ }
applyTheme(savedTheme);
render();
updateNavigation();
