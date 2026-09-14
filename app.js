const KEY = "bp-monitor-readings-v1";
const form = document.getElementById("readingForm");
const body = document.getElementById("readingsBody");
const empty = document.getElementById("empty");

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}
function save(data) { localStorage.setItem(KEY, JSON.stringify(data)); }

function setDefaultDateTime() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  document.getElementById("datetime").value = d.toISOString().slice(0,16);
}
function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}
function formatDate(iso) {
  return new Date(iso).toLocaleString([], {dateStyle:"medium", timeStyle:"short"});
}
function render() {
  const readings = load().sort((a,b)=>new Date(b.datetime)-new Date(a.datetime));
  body.innerHTML = "";
  empty.style.display = readings.length ? "none" : "block";
  readings.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${esc(formatDate(r.datetime))}</td>
      <td><strong>${r.systolic}/${r.diastolic}</strong></td>
      <td>${r.pulse || "—"}</td><td>${esc(r.arm)}</td><td>${esc(r.position)}</td>
      <td>${esc(r.notes)}</td>
      <td><button class="delete" data-id="${esc(r.id)}">Delete</button></td>`;
    body.appendChild(tr);
  });

  const today = new Date().toDateString();
  const todayReadings = readings.filter(r => new Date(r.datetime).toDateString() === today);
  document.getElementById("todayCount").textContent = todayReadings.length;

  if (readings.length) {
    const avgS = Math.round(readings.reduce((s,r)=>s+r.systolic,0)/readings.length);
    const avgD = Math.round(readings.reduce((s,r)=>s+r.diastolic,0)/readings.length);
    document.getElementById("avgBp").textContent = `${avgS}/${avgD}`;
    document.getElementById("latestBp").textContent = `${readings[0].systolic}/${readings[0].diastolic}`;
    document.getElementById("latestTime").textContent = formatDate(readings[0].datetime);
  } else {
    document.getElementById("avgBp").textContent = "—";
    document.getElementById("latestBp").textContent = "—";
    document.getElementById("latestTime").textContent = "—";
  }
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const r = {
    id: crypto.randomUUID(),
    datetime: document.getElementById("datetime").value,
    systolic: Number(document.getElementById("systolic").value),
    diastolic: Number(document.getElementById("diastolic").value),
    pulse: document.getElementById("pulse").value ? Number(document.getElementById("pulse").value) : "",
    arm: document.getElementById("arm").value,
    position: document.getElementById("position").value,
    notes: document.getElementById("notes").value.trim()
  };
  const data = load();
  data.push(r); save(data); render();
  form.reset(); setDefaultDateTime();
  document.getElementById("arm").value = "Left";
  document.getElementById("position").value = "Sitting";
});

body.addEventListener("click", e => {
  if (!e.target.matches(".delete")) return;
  const id = e.target.dataset.id;
  save(load().filter(r => r.id !== id)); render();
});

document.getElementById("clearBtn").addEventListener("click", () => {
  if (confirm("Delete all saved readings from this browser?")) {
    localStorage.removeItem(KEY); render();
  }
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const rows = load().sort((a,b)=>new Date(a.datetime)-new Date(b.datetime));
  if (!rows.length) { alert("There are no readings to export."); return; }
  const headers = ["Date/Time","Systolic (mmHg)","Diastolic (mmHg)","Pulse (bpm)","Arm","Position","Notes"];
  const csv = [headers, ...rows.map(r=>[
    r.datetime,r.systolic,r.diastolic,r.pulse,r.arm,r.position,r.notes
  ])].map(row => row.map(v => `"${String(v ?? "").replace(/"/g,'""')}"`).join(",")).join("\r\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url; a.download=`blood-pressure-readings-${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
});

setDefaultDateTime();
render();