// ---------- State Aplikasi (Tersimpan di LocalStorage) ----------
const STORAGE_KEY = 'edutask_data';

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  {
    id: 1,
    title: "PR Matematika Latihan 3.2",
    subject: "Matematika",
    deadline: "2026-08-20",
    priority: "Tinggi",
    desc: "Kerjakan soal nomor 1 sampai 10 di buku catatan.",
    completed: false
  },
  {
    id: 2,
    title: "Rangkuman Sejarah Indonesia",
    subject: "Sejarah",
    deadline: "2026-08-22",
    priority: "Sedang",
    desc: "Bab Masa Kerajaan Hindu-Buddha.",
    completed: true
  }
];

// Simpan data ke local storage lalu render ulang
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  renderAll();
}

// ---------- Navigasi Halaman ----------
function switchPage(pageId, event) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const selectedPage = document.getElementById(`page-${pageId}`);
  if (selectedPage) selectedPage.classList.add('active');

  const headers = {
    'home': 'Beranda',
    'pending': 'Tugas Belum Selesai',
    'completed': 'Tugas Sudah Selesai'
  };
  document.getElementById('header-text').innerText = headers[pageId];

  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  } else {
    const fallbackBtn = document.querySelector(`.nav-btn[data-page="${pageId}"]`);
    if (fallbackBtn) fallbackBtn.classList.add('active');
  }

  closeSidebar();
}

// ---------- Sidebar mobile (drawer) ----------
function toggleSidebar() {
  document.body.classList.toggle('sidebar-open');
}

function closeSidebar() {
  document.body.classList.remove('sidebar-open');
}

// ---------- Modal Control ----------
function openModal() {
  document.getElementById('modal-task').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal-task').style.display = 'none';
  document.getElementById('task-form').reset();
}

// ---------- Tambah Tugas Baru ----------
function saveTask(e) {
  e.preventDefault();
  const newTask = {
    id: Date.now(),
    title: document.getElementById('task-title').value,
    subject: document.getElementById('task-subject').value,
    deadline: document.getElementById('task-deadline').value,
    priority: document.getElementById('task-priority').value,
    desc: document.getElementById('task-desc').value,
    completed: false
  };
  tasks.push(newTask);
  saveToStorage();
  closeModal();
}

// ---------- Toggle Selesai / Belum Selesai ----------
function toggleComplete(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  saveToStorage();
}

// ---------- Hapus Tugas ----------
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveToStorage();
}

// ---------- Bantuan tampilan ----------
const SUBJECT_PALETTE = [
  { bg: '#eef2ff', text: '#4338ca' },
  { bg: '#fef3c7', text: '#b45309' },
  { bg: '#dcfce7', text: '#15803d' },
  { bg: '#fee2e2', text: '#b91c1c' },
  { bg: '#e0f2fe', text: '#0369a1' },
  { bg: '#fae8ff', text: '#a21caf' },
  { bg: '#ffedd5', text: '#c2410c' },
  { bg: '#f1f5f9', text: '#334155' }
];

function getSubjectColor(subject) {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) hash += subject.charCodeAt(i);
  return SUBJECT_PALETTE[hash % SUBJECT_PALETTE.length];
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDueInfo(deadline, completed) {
  const label = formatDate(deadline);
  if (completed) return { label, cls: '' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(deadline + 'T00:00:00');
  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: `Terlambat ${Math.abs(diffDays)} hari`, cls: 'due-overdue' };
  if (diffDays === 0) return { label: 'Tenggat hari ini', cls: 'due-today' };
  return { label, cls: '' };
}

// ---------- Template Card Tugas ----------
function createCardHTML(t) {
  const prioClass = `badge-prio-${t.priority.toLowerCase()}`;
  const subjColor = getSubjectColor(t.subject || 'Umum');
  const due = getDueInfo(t.deadline, t.completed);

  return `
    <div class="task-card ${t.completed ? 'is-completed' : ''}">
      <div>
        <div class="task-header">
          <span class="badge" style="background:${subjColor.bg}; color:${subjColor.text};">${t.subject}</span>
          <span class="badge ${prioClass}">${t.priority}</span>
        </div>
        <div class="task-title">${t.title}</div>
        <div class="task-desc">${t.desc || 'Tidak ada catatan tambahan.'}</div>
      </div>
      <div class="task-footer">
        <span class="due-pill ${due.cls}"><i class="fa-regular fa-calendar"></i> ${due.label}</span>
        <div class="task-actions">
          <button class="action-btn ${t.completed ? 'undo' : 'check'}"
                  title="${t.completed ? 'Kembalikan ke belum selesai' : 'Tandai Selesai'}"
                  onclick="toggleComplete(${t.id})">
            <i class="fa-solid ${t.completed ? 'fa-rotate-left' : 'fa-check'}"></i>
          </button>
          <button class="action-btn delete" title="Hapus Tugas" onclick="deleteTask(${t.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

// ---------- Render Semua Data ----------
function renderAll() {
  const pendingTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const completedTasks = tasks.filter(t => t.completed);

  // Statistik header
  document.getElementById('stat-total').innerText = tasks.length;
  document.getElementById('stat-pending').innerText = pendingTasks.length;
  document.getElementById('stat-completed').innerText = completedTasks.length;

  // Cincin progres (Beranda)
  const pct = tasks.length === 0 ? 0 : Math.round((completedTasks.length / tasks.length) * 100);
  const ring = document.getElementById('progress-ring');
  if (ring) ring.style.setProperty('--pct', pct);
  const pctLabel = document.getElementById('progress-pct');
  if (pctLabel) pctLabel.innerText = `${pct}%`;

  // Tanggal hari ini di header
  const dateEl = document.getElementById('header-date');
  if (dateEl) {
    dateEl.innerText = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  // Beranda: maksimal 3 tugas pending terdekat
  const homeGrid = document.getElementById('home-recent-grid');
  if (pendingTasks.length === 0) {
    homeGrid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><i class="fa-solid fa-circle-check"></i><p>Tidak ada tugas pending! Kamu bebas tugas.</p></div>`;
  } else {
    homeGrid.innerHTML = pendingTasks.slice(0, 3).map(createCardHTML).join('');
  }

  // Halaman Belum Selesai
  const pendingGrid = document.getElementById('pending-grid');
  if (pendingTasks.length === 0) {
    pendingGrid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><i class="fa-solid fa-folder-open"></i><p>Semua tugas sudah diselesaikan!</p></div>`;
  } else {
    pendingGrid.innerHTML = pendingTasks.map(createCardHTML).join('');
  }

  // Halaman Selesai
  const completedGrid = document.getElementById('completed-grid');
  if (completedTasks.length === 0) {
    completedGrid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><i class="fa-solid fa-box-archive"></i><p>Belum ada tugas yang diselesaikan.</p></div>`;
  } else {
    completedGrid.innerHTML = completedTasks.map(createCardHTML).join('');
  }
}

// Jalankan render awal saat script dimuat
renderAll();
