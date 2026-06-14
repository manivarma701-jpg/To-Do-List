// ============================
// TO-DO LIST — LOGIC
// Uses localStorage for persistence
// ============================

const taskInput      = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const addBtn         = document.getElementById('addBtn');
const taskList       = document.getElementById('taskList');
const emptyState     = document.getElementById('emptyState');
const progressFill   = document.getElementById('progressFill');
const progressText   = document.getElementById('progressText');
const clearDoneBtn   = document.getElementById('clearDoneBtn');
const filterBtns     = document.querySelectorAll('.filter-btn');

let tasks  = JSON.parse(localStorage.getItem('tasks') || '[]');
let filter = 'all';

// ── Render ────────────────────────────────────────────────────────────────────
function render() {
  const filtered = tasks.filter(t => {
    if (filter === 'active')    return !t.done;
    if (filter === 'completed') return t.done;
    return true;
  });

  taskList.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    filtered.forEach(t => taskList.appendChild(createItem(t)));
  }

  // Progress bar
  const done  = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const pct   = total ? (done / total) * 100 : 0;
  progressFill.style.width = `${pct}%`;
  progressText.textContent = `${done} / ${total} done`;

  save();
}

// ── Create task DOM element ───────────────────────────────────────────────────
function createItem(task) {
  const li = document.createElement('li');
  li.className = `task-item ${task.done ? 'done' : ''}`;
  li.dataset.id = task.id;

  li.innerHTML = `
    <div class="task-checkbox" data-action="toggle"></div>
    <div class="priority-dot ${task.priority}"></div>
    <span class="task-text">${escapeHTML(task.text)}</span>
    <div class="task-actions">
      <button data-action="edit"   title="Edit">✏️</button>
      <button data-action="delete" title="Delete">🗑️</button>
    </div>
  `;

  li.addEventListener('click', e => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    if (action === 'toggle') toggleTask(task.id);
    if (action === 'delete') deleteTask(task.id);
    if (action === 'edit')   editTask(task.id, li);
  });

  return li;
}

// ── CRUD ──────────────────────────────────────────────────────────────────────
function addTask() {
  const text = taskInput.value.trim();
  if (!text) { taskInput.focus(); return; }

  tasks.unshift({
    id:       Date.now(),
    text,
    done:     false,
    priority: prioritySelect.value,
    created:  new Date().toISOString(),
  });

  taskInput.value = '';
  taskInput.focus();
  render();
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  render();
}

function editTask(id, li) {
  const span = li.querySelector('.task-text');
  const original = tasks.find(t => t.id === id).text;
  span.contentEditable = 'true';
  span.focus();
  // Select all text
  const range = document.createRange();
  range.selectNodeContents(span);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);

  const save = () => {
    const newText = span.textContent.trim();
    span.contentEditable = 'false';
    if (newText) {
      tasks = tasks.map(t => t.id === id ? { ...t, text: newText } : t);
    } else {
      span.textContent = original;
    }
    render();
  };

  span.addEventListener('blur',  save, { once: true });
  span.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); span.blur(); } });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function save() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ── Events ────────────────────────────────────────────────────────────────────
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

clearDoneBtn.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.done);
  render();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filter = btn.dataset.filter;
    render();
  });
});

// ── Init ──────────────────────────────────────────────────────────────────────
if (!tasks.length) {
  tasks = [
    { id: 1, text: 'Build something amazing', done: true,  priority: 'high',   created: new Date().toISOString() },
    { id: 2, text: 'Learn localStorage',       done: false, priority: 'medium', created: new Date().toISOString() },
    { id: 3, text: 'Ship a side project',       done: false, priority: 'low',    created: new Date().toISOString() },
  ];
}
render();
