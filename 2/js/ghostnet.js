// ==== Données de faux sites ============================================
const ghostNodes = [
  {
    id: "market_echo",
    kind: "node",
    name: "ECHO-MARKT v3",
    address: "echo-markt.v3.ghost",
    risk: "HIGH",
    lastSeen: "2025-11-01T23:11:00Z",
    labels: ["leaks", "datasmog"],
    content: `
# ECHO-MARKT v3

> « si c'est gratuit, c'est toi le produit — si tu paies, c'est quand même toi le produit »

Pseudo place de marché dédiée à tout ce qui ne devrait pas exister.  
Ici, on ne vend rien : on montre **à quoi ressemblerait** un monde où tout est à vendre.

---

## Modules simulés

- Jeux de données de suivi de masse (« anonymisés »).
- Profils psychologiques prédictifs.
- Modèles de scoring social opaques.
- « Optimisation » de productivité basée sur la surveillance totale.

---

Ce noeud n'est qu'un **miroir dystopique**.  
Rien n'est réel, mais tout est *possible* si personne ne tire le frein d'urgence.
    `
  },
  {
    id: "forum_null",
    kind: "node",
    name: "NULL-FORUM : /dev/utopia/",
    address: "null-forum.7q.ghost",
    risk: "MEDIUM",
    lastSeen: "2025-11-11T02:42:00Z",
    labels: ["threads", "meta", "rpg"],
    content: `
# /dev/utopia/ — thread épinglé

Bienvenue sur ce pseudo-board. Chaque personne que tu croises est **déjà une instance du jeu**, même si elle ne le sait pas.

- Règle 1 : on ne parle pas des règles.
- Règle 2 : il n'y a pas de règles.
- Règle 3 : on s'en fout pas mal.

---

## Mission possible

Poste quelque chose **quelque part** sur le net, sous n'importe quel pseudo :

- un fragment de texte cryptique,
- une image glitched,
- un lien vers un fichier hébergé "par hasard".

Note seulement ici (dans ton Markdown perso) **l'URL que toi seul·e connais**.  
Un jour, quelqu'un qui se fait appeler « S » tombera peut-être dessus.
    `
  },
  {
    id: "mirror_state",
    kind: "node",
    name: "STATE-MIRROR / oversight.sim",
    address: "oversight.state-mirror.ghost",
    risk: "CRITICAL",
    lastSeen: "2025-10-31T13:37:00Z",
    labels: ["surveillance", "ai", "control"],
    content: `
# STATE-MIRROR / Surcouche de contrôle simulée

Ce noeud émule une console d'administration d'un système de surveillance mondiale.

- Caméras intelligentes : **ON**
- Analyse comportementale : **ON**
- Profilage automatique : **ON**
- Contestation publique : <code>throttled</code>

---

## Et si…

- …chaque clic était scoré ?
- …chaque relation sociale était pondérée par un algorithme privé ?
- …la présomption d'innocence était remplacée par un **score de risque** statistique ?

Tu peux utiliser ce noeud comme décor pour tes récits, fictions, manifestes.  
Mais souviens-toi : on n'a pas besoin de science-fiction pour décrire certaines dérives, juste d'un **miroir un peu grossissant**.
    `
  }
];

// ==== Etat =============================================================
const state = {
  current: null,
  vaultIndex: { entries: [] },
  filterTag: null,
  currentFileNameForSidecar: "sidecar"
};

// ==== Utils ============================================================
const $ = (id) => document.getElementById(id);

function formatDate(iso) {
  if (!iso) return "n/a";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toISOString().replace("T", " ").replace("Z", "Z");
  } catch {
    return iso;
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderMarkdown(md) {
  if (!md) return "";
  let html = md.replace(/\r\n/g, "\n");

  // ```code```
  html = html.replace(/```([\s\S]*?)```/g, (m, code) => {
    return "<pre><code>" + escapeHtml(code.trim()) + "</code></pre>";
  });

  // titres
  html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");

  // gras / italique
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');

  // liens
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>');

  // listes + paragraphes
  const lines = html.split("\n");
  let out = "";
  let inList = false;
  for (const line of lines) {
    if (/^\s*[-*] /.test(line)) {
      if (!inList) {
        inList = true;
        out += "<ul>";
      }
      const text = line.replace(/^\s*[-*]\s+/, "");
      out += "<li>" + text + "</li>";
    } else {
      if (inList) {
        inList = false;
        out += "</ul>";
      }
      if (
        line.trim().length === 0 ||
        /^<h[1-3]>/.test(line) ||
        /^<pre>/.test(line)
      ) {
        out += line;
      } else {
        out += "<p>" + line + "</p>";
      }
    }
  }
  if (inList) out += "</ul>";
  return out;
}

function flashElement(el) {
  if (!el) return;
  el.classList.remove("flash");
  void el.offsetWidth;
  el.classList.add("flash");
}

function setAddr(str) {
  $("addrCurrent").textContent = str;
  $("statusAddr").textContent = str;
}

function humanSize(bytes) {
  if (bytes == null) return "n/a";
  const b = Number(bytes);
  if (Number.isNaN(b)) return String(bytes);
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let val = b;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return val.toFixed(1).replace(".0", "") + " " + units[i];
}

// ==== Sidebar ==========================================================
function renderNodesList() {
  const container = $("nodesList");
  const ul = document.createElement("ul");
  ul.className = "list";

  ghostNodes.forEach(node => {
    const li = document.createElement("li");
    li.className = "list-item";
    li.dataset.kind = "node";
    li.dataset.id = node.id;

    const main = document.createElement("div");
    main.className = "list-item-main";

    const title = document.createElement("div");
    title.className = "list-title";
    title.textContent = node.name;

    const sub = document.createElement("div");
    sub.className = "list-sub";
    sub.textContent = node.address;

    main.appendChild(title);
    main.appendChild(sub);

    const pill = document.createElement("div");
    pill.className = "pill" + (node.risk === "CRITICAL" ? " pill-danger" : "");
    pill.textContent = node.risk;

    li.appendChild(main);
    li.appendChild(pill);

    li.addEventListener("click", () => selectNode("node", node.id));

    ul.appendChild(li);
  });

  container.innerHTML = "";
  container.appendChild(ul);
}

function renderVaultList() {
  const container = $("vaultList");
  const ul = document.createElement("ul");
  ul.className = "list";

  const entries = state.vaultIndex.entries || [];
  const filterTag = state.filterTag;

  entries.forEach(entry => {
    const tags = entry.tags || [];
    if (filterTag && !tags.includes(filterTag)) return;

    const li = document.createElement("li");
    li.className = "list-item";
    li.dataset.kind = "vault";
    li.dataset.id = entry.id;

    const main = document.createElement("div");
    main.className = "list-item-main";

    const title = document.createElement("div");
    title.className = "list-title";
    title.textContent = entry.title || entry.id;

    const sub = document.createElement("div");
    sub.className = "list-sub";
    sub.textContent = (entry.level || "LOCAL") + " · " + (entry.file || "?");

    main.appendChild(title);
    main.appendChild(sub);

    const pill = document.createElement("div");
    pill.className = "pill pill-muted";
    pill.textContent = (entry.tags || []).slice(0, 2).join(", ") || "no tags";

    li.appendChild(main);
    li.appendChild(pill);

    li.addEventListener("click", () => selectNode("vault", entry.id));

    ul.appendChild(li);
  });

  container.innerHTML = "";
  container.appendChild(ul);
}

function updateActiveListItem() {
  const all = document.querySelectorAll(".list-item");
  all.forEach(li => li.classList.remove("active"));
  if (!state.current) return;
  const sel = `.list-item[data-kind="${state.current.kind}"][data-id="${state.current.id}"]`;
  const active = document.querySelector(sel);
  if (active) active.classList.add("active");
}

// ==== META RENDER ======================================================
function attachTagHandlers() {
  const tags = document.querySelectorAll(".meta-tags .tag");
  tags.forEach(tagEl => {
    tagEl.addEventListener("click", () => {
      const value = tagEl.textContent.trim();
      if (!value) return;
      if (state.filterTag === value) {
        state.filterTag = null;
      } else {
        state.filterTag = value;
      }
      renderVaultList();
      if (state.filterTag) {
        const all = document.querySelectorAll(".meta-tags .tag");
        all.forEach(t => {
          if (t.textContent.trim() === state.filterTag) {
            t.classList.add("active");
          }
        });
      }
    });
  });
}

function renderMetaForNode(node) {
  $("metaHeaderMode").textContent = "NODE";
  const meta = $("metaGrid");

  const tagsHtml = (node.labels || [])
    .map(t => `<span class="tag">${t}</span>`)
    .join(" ");

  meta.innerHTML = `
    <div class="meta-row">
      <div class="meta-label">ID</div>
      <div class="meta-value">${node.id}</div>
    </div>
    <div class="meta-row">
      <div class="meta-label">RISK</div>
      <div class="meta-value">${node.risk}</div>
    </div>
    <div class="meta-row">
      <div class="meta-label">LAST SEEN</div>
      <div class="meta-value">${formatDate(node.lastSeen)}</div>
    </div>
    <div class="meta-row">
      <div class="meta-label">TAGS</div>
      <div class="meta-value meta-tags">
        ${tagsHtml || '<span class="muted">aucun tag</span>'}
      </div>
    </div>
    <div class="meta-row">
      <div class="meta-label">TYPE</div>
      <div class="meta-value">FAKE DARKWEB NODE (offline)</div>
    </div>
    <div class="meta-row">
      <div class="meta-label">RAW</div>
      <div class="meta-value meta-json">${escapeHtml(JSON.stringify(node, null, 2))}</div>
    </div>
    <div class="meta-row meta-note">
      Noeud 100 % fictif, aucune requête réseau réelle.
    </div>
  `;
  attachTagHandlers();
}

function renderMetaForVault(entry) {
  $("metaHeaderMode").textContent = "VAULT";
  const meta = $("metaGrid");

  const tagsHtml = (entry.tags || [])
    .map(t => `<span class="tag">${t}</span>`)
    .join(" ");

  meta.innerHTML = `
    <div class="meta-row">
      <div class="meta-label">ID</div>
      <div class="meta-value">${entry.id}</div>
    </div>
    <div class="meta-row">
      <div class="meta-label">LEVEL</div>
      <div class="meta-value">${entry.level || "LOCAL"}</div>
    </div>
    <div class="meta-row">
      <div class="meta-label">FILE</div>
      <div class="meta-value">${entry.file || "??"}</div>
    </div>
    <div class="meta-row">
      <div class="meta-label">CREATED</div>
      <div class="meta-value">${entry.created || "n/a"}</div>
    </div>
    <div class="meta-row">
      <div class="meta-label">TAGS</div>
      <div class="meta-value meta-tags">
        ${tagsHtml || '<span class="muted">aucun tag</span>'}
      </div>
    </div>
    <div class="meta-row">
      <div class="meta-label">META</div>
      <div class="meta-value meta-json">${escapeHtml(JSON.stringify(entry, null, 2))}</div>
    </div>
    <div class="meta-row meta-actions">
      <button class="btn btn-ghost small-text" id="copyMetaBtn">copier meta JSON</button>
    </div>
    <div class="meta-row meta-note">
      Modifie <code>/data/index.json</code> ou passe par export/import pour mettre à jour ces infos.
    </div>
  `;
  attachTagHandlers();

  const copyBtn = $("copyMetaBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      try {
        navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
        copyBtn.textContent = "copié ✓";
      } catch {
        copyBtn.textContent = "échec copie";
      }
      setTimeout(() => (copyBtn.textContent = "copier meta JSON"), 1200);
    });
  }
}

// ==== Sélection ========================================================
function selectNode(kind, id) {
  state.current = { kind, id };
  updateActiveListItem();

  if (kind === "node") {
    const node = ghostNodes.find(n => n.id === id);
    if (!node) return;
    $("viewTitle").textContent = node.name;
    $("viewType").textContent = "NODE.FAKE";
    $("viewBody").innerHTML = renderMarkdown(node.content);
    setAddr("ghost://" + node.address);
    renderMetaForNode(node);
    flashElement($("viewBody"));
  } else {
    const entry = (state.vaultIndex.entries || []).find(e => e.id === id);
    if (!entry) return;
    loadVaultEntry(entry);
  }
}

async function loadVaultEntry(entry) {
  const addr = "ghost://vault/" + (entry.id || "unknown");
  setAddr(addr);
  $("viewTitle").textContent = entry.title || entry.id || "VAULT ENTRY";
  $("viewType").textContent = "VAULT.MD";
  $("viewBody").innerHTML = "<p class='muted'>Chargement du fichier Markdown…</p>";
  renderMetaForVault(entry);

  try {
    const res = await fetch("./data/" + entry.file);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();
    $("viewBody").innerHTML = renderMarkdown(text);
    flashElement($("viewBody"));
  } catch (err) {
    $("viewBody").innerHTML = `
      <p class="error-text">
        Impossible de charger <code>${entry.file}</code> dans <code>/data/</code>.
      </p>
      <p class="muted small-text">
        Si tu as ouvert le fichier en <code>file://</code>, ton navigateur bloque les lectures avancées.  
        Lance un mini serveur : <code>python -m http.server</code> dans le dossier <code>ghostnet</code>,
        puis visite <code>http://localhost:8000</code>.
      </p>
    `;
  }
}

// ==== /data/index.json ================================================
async function loadIndexJson() {
  try {
    const res = await fetch("./data/index.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const index = await res.json();
    if (!Array.isArray(index.entries)) index.entries = [];
    state.vaultIndex = index;
    renderVaultList();
  } catch (err) {
    state.vaultIndex = { entries: [] };
    renderVaultList();
    $("metaGrid").innerHTML = `
      <div class="meta-row">
        <div class="meta-label">INDEX</div>
        <div class="meta-value error-text">
          /data/index.json introuvable ou illisible.
        </div>
      </div>
      <div class="meta-row meta-note">
        Crée <code>data/index.json</code> avec un champ <code>entries: []</code>
        et ajoute-y tes items.
      </div>
    `;
  }
}

// ==== Export / import index ============================================
function exportIndex() {
  const blob = new Blob(
    [JSON.stringify(state.vaultIndex, null, 2)],
    { type: "application/json" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "index.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function handleImportIndex(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const json = JSON.parse(e.target.result);
      if (!Array.isArray(json.entries)) json.entries = [];
      state.vaultIndex = json;
      renderVaultList();
      $("metaGrid").innerHTML = `
        <div class="meta-row">
          <div class="meta-label">INDEX</div>
          <div class="meta-value">
            index.json importé en mémoire (${json.entries.length} entrées).
          </div>
        </div>
      `;
      flashElement($("metaGrid"));
    } catch (err) {
      $("metaGrid").innerHTML = `
        <div class="meta-row meta-json meta-json-warning">
          Erreur de parsing JSON : ${escapeHtml(String(err))}
        </div>
      `;
    }
  };
  reader.readAsText(file);
}

// ==== Scanner web (taille réglable) ====================================
function logScan(msg) {
  const logEl = $("scanLog");
  const now = new Date().toISOString().split("T")[1].replace("Z", "");
  logEl.textContent += "[" + now + "] " + msg + "\n";
  logEl.scrollTop = logEl.scrollHeight;
}

function normalizeUrl(str) {
  let u = (str || "").trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) {
    u = "https://" + u;
  }
  return u;
}

function initScanner() {
  const input = $("scanUrlInput");
  const btn = $("scanBtn");
  const frame = $("scanFrame");
  const sizeRange = $("scanSizeRange");
  const wrapper = document.querySelector(".scanner-iframe-wrapper");

  btn.addEventListener("click", () => {
    const raw = input.value;
    const url = normalizeUrl(raw);
    if (!url) {
      logScan("ERR: URL vide.");
      return;
    }
    frame.src = url;
    logScan("probe → " + url);
    setAddr("scan://" + url);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      btn.click();
    }
  });

  if (sizeRange && wrapper) {
    const apply = () => {
      wrapper.style.height = sizeRange.value + "px";
    };
    apply();
    sizeRange.addEventListener("input", apply);
  }
}

// ==== Visionneuse de fichiers ==========================================
function handleFileSelected(file) {
  const metaEl = $("fileMeta");
  const previewEl = $("filePreview");
  const nameLabel = $("fileNameLabel");
  const sidecarEl = $("fileSidecar");
  const fsTitle = $("fsFileTitle");
  const fsInfo = $("fsFileInfo");

  if (!file) {
    nameLabel.textContent = "aucun fichier";
    metaEl.textContent = "aucun fichier chargé";
    previewEl.innerHTML = '<div class="small-text muted">prévisualisation vide</div>';
    state.currentFileNameForSidecar = "sidecar";
    if (fsTitle) fsTitle.textContent = "FILE // FULLSCREEN VIEW";
    if (fsInfo) fsInfo.textContent = "–";
    return;
  }

  state.currentFileNameForSidecar = file.name.replace(/\.[^/.]+$/, "") || "sidecar";
  nameLabel.textContent = file.name;

  const metaLines = [
    "nom : " + file.name,
    "type MIME : " + (file.type || "inconnu"),
    "taille : " + humanSize(file.size) + " (" + file.size + " octets)",
    "lastModified (epoch) : " + file.lastModified,
    "lastModified (ISO) : " + new Date(file.lastModified).toISOString()
  ];

  metaEl.textContent = metaLines.join("\n");

  if (fsTitle) fsTitle.textContent = "FILE // " + file.name;
  if (fsInfo) fsInfo.textContent = humanSize(file.size) + " · " + (file.type || "type inconnu");

  const url = URL.createObjectURL(file);

  // preview selon type
  previewEl.innerHTML = "";
  const type = (file.type || "").toLowerCase();
  const nameLower = file.name.toLowerCase();

  if (type.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = url;
    img.alt = file.name;
    previewEl.appendChild(img);
  } else if (type === "application/pdf" || nameLower.endsWith(".pdf")) {
    const iframe = document.createElement("iframe");
    iframe.src = url;
    previewEl.appendChild(iframe);
  } else if (type.startsWith("video/")) {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    previewEl.appendChild(video);
  } else if (type.startsWith("audio/")) {
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;
    previewEl.appendChild(audio);
  } else if (
    type.startsWith("text/") ||
    /\.txt$|\.md$|\.log$/i.test(nameLower)
  ) {
    const reader = new FileReader();
    reader.onload = e => {
      const pre = document.createElement("pre");
      pre.textContent = e.target.result;
      previewEl.appendChild(pre);
    };
    reader.readAsText(file);
  } else {
    const msg = document.createElement("div");
    msg.className = "small-text muted";
    msg.textContent = "type non prévisualisable ici (binaire ou format exotique).";
    previewEl.appendChild(msg);
  }

  // sidecar JSON pour métadonnées "EXIF/PDF" virtuelles modifiables
  const sidecar = {
    fileName: file.name,
    size: file.size,
    type: file.type || "unknown",
    lastModified: file.lastModified,
    exif: {
      cameraMake: "",
      cameraModel: "",
      lens: "",
      iso: "",
      shutter: "",
      aperture: "",
      gps: "",
      comment: ""
    },
    pdf: {
      title: "",
      author: "",
      subject: "",
      keywords: ""
    },
    tags: [],
    notes: ""
  };
  sidecarEl.value = JSON.stringify(sidecar, null, 2);
}

function exportSidecar() {
  const sidecarEl = $("fileSidecar");
  let jsonText = sidecarEl.value;
  try {
    const parsed = JSON.parse(jsonText);
    jsonText = JSON.stringify(parsed, null, 2);
  } catch {
    // pas grave : on exporte le texte brut, même s'il est invalide
  }

  const blob = new Blob([jsonText], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const base = state.currentFileNameForSidecar || "sidecar";
  a.href = url;
  a.download = base + ".sidecar.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function initFileViewer() {
  const input = $("fileInput");
  const exportBtn = $("exportSidecarBtn");
  const fsBtn = $("fileFullscreenBtn");
  const fsOverlay = $("fileFullscreenOverlay");
  const fsClose = $("fsCloseBtn");

  input.addEventListener("change", e => {
    const file = e.target.files && e.target.files[0];
    handleFileSelected(file);
  });

  exportBtn.addEventListener("click", exportSidecar);

  function openFullscreen() {
    if (!fsOverlay) return;
    fsOverlay.classList.remove("hidden");

    $("fsFileMetaContainer").appendChild($("fileMeta"));
    $("fsFilePreviewContainer").appendChild($("filePreview"));
    $("fsFileSidecarContainer").appendChild($("fileSidecar"));
  }

  function closeFullscreen() {
    if (!fsOverlay) return;
    fsOverlay.classList.add("hidden");

    $("viewerMetaContainer").appendChild($("fileMeta"));
    $("viewerPreviewContainer").appendChild($("filePreview"));
    $("viewerSidecarContainer").appendChild($("fileSidecar"));
  }

  if (fsBtn) fsBtn.addEventListener("click", openFullscreen);
  if (fsClose) fsClose.addEventListener("click", closeFullscreen);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !fsOverlay.classList.contains("hidden")) {
      closeFullscreen();
    }
  });
}

// ==== Divers ===========================================================
function randomNode() {
  const all = [
    ...ghostNodes.map(n => ({ kind: "node", id: n.id })),
    ...(state.vaultIndex.entries || []).map(e => ({ kind: "vault", id: e.id }))
  ];
  if (!all.length) return;
  const pick = all[Math.floor(Math.random() * all.length)];
  selectNode(pick.kind, pick.id);
}

function init() {
  renderNodesList();
  loadIndexJson();
  $("exportIndexBtn").addEventListener("click", exportIndex);
  $("importIndexInput").addEventListener("change", e => {
    handleImportIndex(e.target.files[0]);
  });
  $("randomNodeBtn").addEventListener("click", randomNode);
  initScanner();
  initFileViewer();
}

document.addEventListener("DOMContentLoaded", init);
