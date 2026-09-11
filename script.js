// State Aplikasi (Tersimpan di LocalStorage)
let tasks = JSON.parse(localStorage.getItem('smarttask_data')) || [
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

// Simpan data ke local storage
function saveToStorage() {
  localStorage.setItem('edutask_data', JSON.stringify(tasks));
  renderAll();
}

// Navigasi Halaman
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
  }
}

// Modal Control
function openModal() { 
  document.getElementById('modal-task').style.display = 'flex'; 
}

function closeModal() { 
  document.getElementById('modal-task').style.display = 'none'; 
  document.getElementById('task-form').reset();
}

// Tambah Tugas Baru
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

// Toggle Selesai / Belum Selesai
function toggleComplete(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  saveToStorage();
}

// Hapus Tugas
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveToStorage();
}

// Template Card Tugas
function createCardHTML(t) {
  const prioClass = `badge-prio-${t.priority.toLowerCase()}`;
  return `
    <div class="task-card">
      <div>
        <div class="task-header">
          <span class="task-subject">${t.subject}</span>
          <span class="task-subject ${prioClass}">${t.priority}</span>
        </div>
        <div class="task-title">${t.title}</div>
        <div class="task-desc">${t.desc || 'Tidak ada catatan tambahan.'}</div>
      </div>
      <div class="task-footer">
        <span><i class="fa-regular fa-calendar"></i> ${t.deadline}</span>
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

// Render Semua Data
function renderAll() {
  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  // Update Statistik Header
  document.getElementById('stat-total').innerText = tasks.length;
  document.getElementById('stat-pending').innerText = pendingTasks.length;
  document.getElementById('stat-completed').innerText = completedTasks.length;

  // Render Home Recent (Maksimal 3 tugas pending)
  const homeGrid = document.getElementById('home-recent-grid');
  if (pendingTasks.length === 0) {
    homeGrid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><i class="fa-solid fa-circle-check"></i><p>Tidak ada tugas pending! Kamu bebas tugas.</p></div>`;
  } else {
    homeGrid.innerHTML = pendingTasks.slice(0, 3).map(createCardHTML).join('');
  }

  // Render Halaman Belum Selesai
  const pendingGrid = document.getElementById('pending-grid');
  if (pendingTasks.length === 0) {
    pendingGrid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><i class="fa-solid fa-folder-open"></i><p>Semua tugas sudah diselesaikan!</p></div>`;
  } else {
    pendingGrid.innerHTML = pendingTasks.map(createCardHTML).join('');
  }

  // Render Halaman Selesai
  const completedGrid = document.getElementById('completed-grid');
  if (completedTasks.length === 0) {
    completedGrid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><i class="fa-solid fa-box-archive"></i><p>Belum ada tugas yang diselesaikan.</p></div>`;
  } else {
    completedGrid.innerHTML = completedTasks.map(createCardHTML).join('');
  }
}

// Jalankan render awal saat script dimuat
renderAll();