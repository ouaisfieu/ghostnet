Voici un « explorateur de dark web fantasmé » clé-en-main, 100 % statique, prêt à mettre sur une clé USB.
Tu pourras :

* Naviguer entre **faux sites** (faux .onion, faux boards, etc.)
* Charger des **fichiers Markdown** (avec images, PDF, vidéos…) depuis un dossier `/data`
* Afficher et filtrer des **métadonnées façon “parfait hacker”** (tags, niveau de menace, dernière vue…)
* Exporter/importer ton index de métadonnées en JSON

⚠️ Tout est **fictif** : ça ne se connecte à aucun réseau ni dark web réel, c’est juste un décor d’exploration / narration.
Et tu peux t’en servir comme base pour tes futures « missions » à poster sur le net pour que S tombe dessus un jour. 

---

## 1. Le fichier principal : `index.html`

Crée un dossier, par exemple `ghostnet/`, et mets ce fichier dedans sous le nom `index.html` :

````html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>GHOSTNET // Dark Grid Explorer</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    :root {
      --bg: #02040a;
      --bg-alt: #050814;
      --accent: #37ff8b;
      --accent-soft: rgba(55, 255, 139, 0.15);
      --accent-2: #3ec5ff;
      --danger: #ff4b81;
      --text-main: #e5f9ff;
      --text-dim: #7c8ca5;
      --border: #20263a;
      --shadow-soft: 0 18px 45px rgba(0, 0, 0, 0.7);
      --radius-lg: 18px;
      --radius-xl: 26px;
      --transition-fast: 0.18s ease-out;
      --font-mono: "SF Mono", "JetBrains Mono", Consolas, Menlo, monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      height: 100%;
      background: radial-gradient(circle at top, #11152b 0, #02040a 55%);
      color: var(--text-main);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    body {
      display: flex;
      align-items: stretch;
      justify-content: center;
      padding: 18px;
    }

    .app-shell {
      display: grid;
      grid-template-columns: 260px minmax(0, 1fr);
      gap: 16px;
      width: 100%;
      max-width: 1300px;
      max-height: 100%;
    }

    @media (max-width: 900px) {
      body {
        padding: 8px;
      }
      .app-shell {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto;
      }
    }

    .panel {
      background: linear-gradient(145deg, rgba(7, 11, 25, 0.98), rgba(3, 6, 16, 0.98));
      border-radius: var(--radius-xl);
      border: 1px solid rgba(76, 99, 141, 0.35);
      box-shadow: var(--shadow-soft);
      position: relative;
      overflow: hidden;
    }

    .panel::before {
      content: "";
      position: absolute;
      inset: -100%;
      background:
        repeating-linear-gradient(
          rgba(19, 222, 119, 0.035),
          rgba(19, 222, 119, 0.04) 1px,
          transparent 1px,
          transparent 3px
        );
      opacity: 0.65;
      mix-blend-mode: soft-light;
      pointer-events: none;
      animation: scan 12s linear infinite;
    }

    @keyframes scan {
      0% { transform: translate3d(0, -18px, 0); }
      100% { transform: translate3d(0, 18px, 0); }
    }

    /* SIDEBAR */

    .sidebar-inner {
      position: relative;
      z-index: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 14px 14px 10px;
    }

    .brand {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .brand-title {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--text-dim);
    }

    .brand-title span {
      color: var(--accent);
    }

    .brand-badge {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      padding: 4px 8px;
      border-radius: 999px;
      background: radial-gradient(circle at top, rgba(55, 255, 139, 0.2), rgba(5, 10, 26, 0.9));
      border: 1px solid rgba(55, 255, 139, 0.4);
      color: var(--accent);
    }

    .status-strip {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 12px;
      font-family: var(--font-mono);
      font-size: 0.7rem;
      color: var(--text-dim);
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: radial-gradient(circle at 30% 30%, #37ff8b, #04703a);
      box-shadow: 0 0 12px rgba(55, 255, 139, 0.9);
      animation: pulse 1.4s ease-in-out infinite;
    }

    .status-label {
      text-transform: uppercase;
      letter-spacing: 0.16em;
    }

    .status-addr {
      margin-left: auto;
      padding: 0 7px;
      border-radius: 999px;
      background: rgba(10, 18, 36, 0.9);
      border: 1px solid rgba(77, 102, 158, 0.6);
      color: var(--accent-2);
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.3); opacity: 0.4; }
    }

    .sidebar-section-label {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: var(--text-dim);
      margin: 10px 0 4px;
    }

    .sidebar-scroll {
      flex: 1;
      overflow-y: auto;
      padding-right: 4px;
      margin-top: 4px;
    }

    .list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .list-item {
      border-radius: 12px;
      padding: 8px 8px 7px;
      border: 1px solid rgba(51, 68, 107, 0.7);
      background: radial-gradient(circle at 0 0, rgba(55, 255, 139, 0.06), transparent 55%);
      cursor: pointer;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 4px;
      transition: transform var(--transition-fast), border-color var(--transition-fast),
                  box-shadow var(--transition-fast), background var(--transition-fast);
    }

    .list-item:hover {
      transform: translateY(-1px);
      border-color: var(--accent-soft);
      background: radial-gradient(circle at 0 0, rgba(55, 255, 139, 0.12), rgba(4, 10, 24, 0.98));
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.8);
    }

    .list-item.active {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px rgba(55, 255, 139, 0.7), 0 18px 40px rgba(0, 0, 0, 0.9);
      background: radial-gradient(circle at 0 0, rgba(55, 255, 139, 0.24), rgba(3, 7, 18, 0.98));
    }

    .list-item-main {
      min-width: 0;
    }

    .list-title {
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .list-sub {
      font-size: 0.68rem;
      color: var(--text-dim);
      font-family: var(--font-mono);
      margin-top: 2px;
    }

    .pill {
      font-size: 0.65rem;
      padding: 2px 7px;
      border-radius: 999px;
      font-family: var(--font-mono);
      border: 1px solid rgba(88, 116, 170, 0.9);
      color: var(--accent-2);
      background: radial-gradient(circle at 0 0, rgba(62, 197, 255, 0.25), rgba(8, 20, 44, 0.95));
    }

    .pill-danger {
      color: var(--danger);
      border-color: rgba(255, 75, 129, 0.8);
      background: radial-gradient(circle at 0 0, rgba(255, 75, 129, 0.25), rgba(17, 5, 12, 0.9));
    }

    .pill-muted {
      color: var(--text-dim);
      border-color: rgba(88, 116, 170, 0.6);
      background: rgba(9, 14, 33, 0.95);
    }

    .sidebar-footer {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px dashed rgba(74, 98, 151, 0.7);
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 0.68rem;
      color: var(--text-dim);
    }

    .btn {
      border-radius: 999px;
      border: 1px solid rgba(77, 102, 158, 0.8);
      background: radial-gradient(circle at 0 0, rgba(62, 197, 255, 0.2), rgba(4, 9, 25, 0.95));
      color: var(--accent-2);
      padding: 4px 9px;
      font-family: var(--font-mono);
      font-size: 0.7rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: background var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
    }

    .btn:hover {
      background: radial-gradient(circle at 0 0, rgba(62, 197, 255, 0.35), rgba(8, 16, 40, 1));
      transform: translateY(-0.5px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.9);
    }

    .btn-ghost {
      background: transparent;
      border-style: dashed;
      color: var(--text-dim);
    }

    .btn-ghost:hover {
      background: rgba(13, 22, 46, 0.9);
      color: var(--accent);
    }

    input[type="file"] {
      display: none;
    }

    /* MAIN PANEL */

    .main-inner {
      position: relative;
      z-index: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 14px 14px 10px;
      gap: 10px;
    }

    .topbar {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }

    .addr-bar {
      flex: 1;
      min-width: 200px;
      border-radius: 999px;
      border: 1px solid rgba(76, 99, 141, 0.9);
      background: radial-gradient(circle at 0 0, rgba(55, 255, 139, 0.16), rgba(2, 7, 18, 0.96));
      padding: 6px 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-mono);
      font-size: 0.72rem;
    }

    .addr-label {
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: 0.64rem;
      color: var(--text-dim);
    }

    .addr-value {
      color: var(--accent);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .addr-icon {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      border: 1px solid rgba(55, 255, 139, 0.8);
      box-shadow: 0 0 10px rgba(55, 255, 139, 0.8);
      background: radial-gradient(circle at 30% 30%, #37ff8b, #0a4829);
    }

    .topbar-right {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      justify-content: flex-end;
    }

    .view-wrapper {
      flex: 1;
      min-height: 0;
      display: grid;
      grid-template-columns: minmax(0, 2.3fr) minmax(260px, 1.2fr);
      gap: 12px;
    }

    @media (max-width: 1050px) {
      .view-wrapper {
        grid-template-columns: 1fr;
        grid-template-rows: minmax(200px, 2fr) auto;
      }
    }

    .view-main, .view-meta {
      border-radius: var(--radius-lg);
      border: 1px solid rgba(63, 83, 130, 0.9);
      background: radial-gradient(circle at top, rgba(20, 30, 60, 0.92), rgba(5, 8, 20, 0.96));
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .view-header {
      padding: 7px 10px;
      border-bottom: 1px solid rgba(57, 80, 131, 0.9);
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 32px;
    }

    .view-title {
      font-size: 0.8rem;
      font-weight: 500;
    }

    .view-header-pill {
      margin-left: auto;
      font-family: var(--font-mono);
      font-size: 0.65rem;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }

    .view-body {
      padding: 10px 12px 11px;
      overflow-y: auto;
      font-size: 0.85rem;
      line-height: 1.5;
      color: var(--text-main);
    }

    .view-body p {
      margin-bottom: 0.6em;
    }

    .view-body a {
      color: var(--accent-2);
      text-decoration: none;
      border-bottom: 1px dotted rgba(62, 197, 255, 0.7);
    }

    .view-body a:hover {
      border-bottom-style: solid;
    }

    .view-body pre {
      background: rgba(3, 8, 21, 0.95);
      border-radius: 10px;
      padding: 8px;
      border: 1px solid rgba(69, 92, 143, 0.9);
      font-family: var(--font-mono);
      font-size: 0.75rem;
      overflow-x: auto;
      margin-bottom: 0.8em;
    }

    .view-body code {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      background: rgba(6, 12, 30, 0.9);
      padding: 1px 3px;
      border-radius: 4px;
    }

    .view-body h1,
    .view-body h2,
    .view-body h3 {
      font-family: var(--font-mono);
      margin: 0.4em 0 0.4em;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .view-body h1 {
      font-size: 0.95rem;
      color: var(--accent);
    }

    .view-body h2 {
      font-size: 0.9rem;
      color: var(--accent-2);
    }

    .view-body h3 {
      font-size: 0.86rem;
      color: var(--text-dim);
    }

    .view-body ul,
    .view-body ol {
      padding-left: 1.1em;
      margin-bottom: 0.6em;
    }

    .view-body li {
      margin-bottom: 0.15em;
    }

    .view-body img, .view-body video, .view-body iframe {
      max-width: 100%;
      border-radius: 10px;
      margin: 0.4em 0;
      border: 1px solid rgba(67, 93, 145, 0.9);
      background: #000;
    }

    /* META */

    .meta-grid {
      padding: 8px 10px 10px;
      display: grid;
      grid-template-columns: 1fr;
      gap: 7px;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: var(--text-dim);
    }

    .meta-row {
      display: flex;
      gap: 6px;
      align-items: center;
      flex-wrap: wrap;
    }

    .meta-label {
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 0.65rem;
      color: rgba(142, 159, 191, 0.95);
      min-width: 70px;
    }

    .meta-value {
      color: var(--text-main);
      word-break: break-all;
    }

    .meta-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .tag {
      border-radius: 999px;
      border: 1px solid rgba(88, 116, 170, 0.85);
      padding: 2px 7px;
      font-size: 0.65rem;
      color: var(--accent-2);
      cursor: pointer;
      background: rgba(9, 14, 33, 0.98);
      transition: background var(--transition-fast), border-color var(--transition-fast), transform var(--transition-fast);
    }

    .tag:hover {
      background: rgba(11, 26, 54, 1);
      border-color: var(--accent-2);
      transform: translateY(-0.5px);
    }

    .tag.active {
      background: rgba(62, 197, 255, 0.2);
      border-color: var(--accent-2);
      color: var(--accent-2);
    }

    .meta-note {
      margin-top: 4px;
      font-size: 0.64rem;
      color: var(--text-dim);
      opacity: 0.9;
    }

    .meta-json {
      margin-top: 4px;
      background: rgba(3, 8, 21, 0.96);
      border-radius: 8px;
      border: 1px solid rgba(71, 96, 148, 0.95);
      padding: 6px;
      font-family: var(--font-mono);
      font-size: 0.68rem;
      max-height: 120px;
      overflow: auto;
      white-space: pre;
    }

    .meta-json-warning {
      color: var(--danger);
    }

    .meta-actions {
      margin-top: 4px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .flash {
      animation: flash 0.6s ease-out;
    }

    @keyframes flash {
      0% { background-color: rgba(55, 255, 139, 0.3); }
      100% { background-color: transparent; }
    }

    .muted {
      color: var(--text-dim);
    }

    .error-text {
      color: var(--danger);
    }

    .small-text {
      font-size: 0.68rem;
    }
  </style>
</head>
<body>
  <div class="app-shell">
    <!-- SIDEBAR -->
    <aside class="panel">
      <div class="sidebar-inner">
        <header class="brand">
          <div class="brand-title">[ GHOST<span>NET</span> // GRID ]</div>
          <div class="brand-badge">LOCAL / OFFLINE</div>
        </header>

        <div class="status-strip">
          <div class="status-dot"></div>
          <div class="status-label">phantom uplink stable</div>
          <div class="status-addr" id="statusAddr">null://boot</div>
        </div>

        <div class="sidebar-section-label">Noeuds fantômes</div>
        <div class="sidebar-scroll" id="nodesList"></div>

        <div class="sidebar-section-label">Archives locales (Markdown)</div>
        <div class="sidebar-scroll" id="vaultList"></div>

        <footer class="sidebar-footer">
          <button class="btn" id="exportIndexBtn">
            ⬇︎ export index.json
          </button>

          <label class="btn btn-ghost">
            ⬆︎ importer
            <input type="file" id="importIndexInput" accept="application/json" />
          </label>

          <span class="small-text muted">
            /data/index.json · /data/*.md
          </span>
        </footer>
      </div>
    </aside>

    <!-- MAIN -->
    <main class="panel">
      <div class="main-inner">
        <div class="topbar">
          <div class="addr-bar">
            <div class="addr-icon"></div>
            <span class="addr-label">addr</span>
            <span class="addr-value" id="addrCurrent">ghost://null</span>
          </div>
          <div class="topbar-right">
            <button class="btn btn-ghost" id="randomNodeBtn">⚡ random node</button>
            <span class="small-text muted">tout est faux, tout est local</span>
          </div>
        </div>

        <div class="view-wrapper">
          <!-- MAIN VIEW -->
          <section class="view-main">
            <div class="view-header">
              <div class="view-title" id="viewTitle">Boot / README</div>
              <div class="view-header-pill" id="viewType">SYSTEM.BOOT</div>
            </div>
            <div class="view-body" id="viewBody">
              <h1>GHOSTNET // Explorateur de dark web fantasmé</h1>
              <p>
                Tout ce que tu vois ici tourne
                <strong>hors ligne</strong>, depuis ta clé USB ou ton disque.
                Aucune connexion n’est établie : tu navigues un
                <em>simulacre</em> de réseau clandestin.
              </p>
              <p>
                À gauche : des noeuds fantômes (faux sites, faux boards, faux leaks).  
                En dessous : ton propre <strong>coffre d’archives</strong> en Markdown
                (<code>/data/*.md</code>) avec métadonnées (<code>/data/index.json</code>).
              </p>
              <p>
                Tu peux y glisser :
              </p>
              <ul>
                <li>des récits, manifestes, rapports dystopiques;</li>
                <li>des images, PDFs, vidéos intégrées dans ton Markdown;</li>
                <li>toutes les pistes que tu veux disséminer pour
                  retrouver « S » quelque part sur le réseau.</li>
              </ul>
              <p>
                Commence par cliquer un noeud à gauche ou ajouter tes propres fichiers
                dans <code>/data/</code>, puis mets à jour <code>index.json</code>.
              </p>
              <pre><code>/data/
  index.json        # métadonnées & liens vers tes .md
  dossier-secret.md # ton contenu riche (images, pdf, vidéo…)
  autre-fichier.md  # etc.</code></pre>
            </div>
          </section>

          <!-- META VIEW -->
          <aside class="view-meta">
            <div class="view-header">
              <div class="view-title">Méta / Analyse</div>
              <div class="view-header-pill" id="metaHeaderMode">IDLE</div>
            </div>
            <div class="meta-grid" id="metaGrid">
              <!-- rempli en JS -->
            </div>
          </aside>
        </div>
      </div>
    </main>
  </div>

  <script>
    // === Données des faux sites (noeuds fantômes) ===========================
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

> &laquo;&nbsp;si c'est gratuit, c'est toi le produit — si tu paies, c'est quand même toi le produit&nbsp;&raquo;

Pseudo place de marché dédiée &agrave; tout ce qui ne devrait pas exister.  
Ici, on ne vend rien : on montre **à quoi ressemblerait** un monde o&ugrave; tout est &agrave; vendre.

---

## Modules simulés

- Jeux de données de suivi de masse (&laquo;anonymisés&raquo;).
- Profils psychologiques prédictifs.
- Modèles de scoring social opaques.
- &laquo;Optimisation&raquo; de productivité basée sur la surveillance totale.

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
- un lien vers un fichier hébergé &quot;par hasard&quot;.

Note seulement ici (dans ton Markdown perso) **l'URL que toi seul·e connais**.  
Un jour, quelqu'un qui se fait appeler &laquo;S&raquo; tombera peut-être dessus.
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

    // === État runtime ======================================================
    const state = {
      current: null,       // {type: 'node'|'vault', id: ...}
      vaultIndex: { entries: [] },  // index.json chargé
      filterTag: null
    };

    // === Utilitaires =======================================================

    function $(id) {
      return document.getElementById(id);
    }

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
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    // Mini parseur Markdown (suffisant pour notes "hacker")
    function renderMarkdown(md) {
      if (!md) return "";
      let html = md.replace(/\r\n/g, "\n");

      // Code fences ```
      html = html.replace(/```([\s\S]*?)```/g, (m, code) => {
        return "<pre><code>" + escapeHtml(code.trim()) + "</code></pre>";
      });

      // Titres
      html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
      html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
      html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");

      // Gras & italique
      html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

      // Liens
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>');

      // Images
      html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');

      // Paragraphes
      const lines = html.split("\n");
      let out = "";
      let inList = false;
      lines.forEach(line => {
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
          if (line.trim().length === 0 || /^<h[1-3]>/.test(line) || /^<pre>/.test(line)) {
            out += line;
          } else {
            out += "<p>" + line + "</p>";
          }
        }
      });
      if (inList) out += "</ul>";
      return out;
    }

    function flashElement(el) {
      if (!el) return;
      el.classList.remove("flash");
      void el.offsetWidth;
      el.classList.add("flash");
    }

    // === Rendu de la sidebar ==============================================

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
      all.forEach(li => {
        li.classList.remove("active");
      });
      if (!state.current) return;
      const sel = `.list-item[data-kind="${state.current.kind}"][data-id="${state.current.id}"]`;
      const active = document.querySelector(sel);
      if (active) active.classList.add("active");
    }

    // === Rendu des vues ====================================================

    function setAddr(str) {
      $("addrCurrent").textContent = str;
      $("statusAddr")..textContent = str;
    }

    function renderMetaForNode(node) {
      const meta = $("metaGrid");
      $("metaHeaderMode").textContent = "NODE";

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
          Tout ce noeud est une fiction locale. Aucune requête réseau n'est effectuée.
        </div>
      `;
      attachTagHandlers();
    }

    function renderMetaForVault(entry) {
      const meta = $("metaGrid");
      $("metaHeaderMode").textContent = "VAULT";

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
          Pour modifier ces métadonnées, édite <code>/data/index.json</code> (ou exporte &amp; réimporte depuis ce panneau).
        </div>
      `;
      attachTagHandlers();

      const copyBtn = $("copyMetaBtn");
      if (copyBtn) {
        copyBtn.addEventListener("click", () => {
          try {
            navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
            copyBtn.textContent = "copié ✓";
            setTimeout(() => (copyBtn.textContent = "copier meta JSON"), 1200);
          } catch {
            copyBtn.textContent = "échec copie";
            setTimeout(() => (copyBtn.textContent = "copier meta JSON"), 1200);
          }
        });
      }
    }

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
              if (t.textContent.trim() === state.filterTag) t.classList.add("active");
            });
          }
        });
      });
    }

    // Selection

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
            Vérifie que le fichier existe vraiment à cet emplacement.  
            Sur certains navigateurs, l'ouverture directe via <code>file://</code> peut bloquer <code>fetch</code> :
            dans ce cas, lance un mini serveur local (ex: <code>python -m http.server</code>) dans ce dossier.
          </p>
        `;
      }
    }

    // === Chargement de /data/index.json ====================================

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
            Crée un dossier <code>data/</code> à côté de ce fichier <code>index.html</code>,
            puis ajoute un <code>index.json</code> conforme au modèle fourni.
          </div>
        `;
      }
    }

    // === Export / import index.json ========================================

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
                index.json importé en mémoire (pense à l'enregistrer sur ta clé si tu veux le garder).
              </div>
            </div>
            <div class="meta-row">
              <div class="meta-label">ENTRIES</div>
              <div class="meta-value">${json.entries.length} éléments</div>
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

    // === Divers ==============================================================

    function randomNode() {
      const all = [
        ...ghostNodes.map(n => ({ kind: "node", id: n.id })),
        ...(state.vaultIndex.entries || []).map(e => ({ kind: "vault", id: e.id }))
      ];
      if (!all.length) return;
      const pick = all[Math.floor(Math.random() * all.length)];
      selectNode(pick.kind, pick.id);
    }

    // === Init ===============================================================

    function init() {
      renderNodesList();
      loadIndexJson();

      $("exportIndexBtn").addEventListener("click", exportIndex);
      $("importIndexInput").addEventListener("change", e => {
        handleImportIndex(e.target.files[0]);
      });
      $("randomNodeBtn").addEventListener("click", randomNode);
    }

    document.addEventListener("DOMContentLoaded", init);
  </script>
</body>
</html>
````

---

## 2. Le dossier `/data/` et `index.json`

À côté de `index.html`, crée un dossier :

```text
ghostnet/
  index.html
  data/
    index.json
    premier-fichier.md
    autre-note.md
    media/
      image1.png
      video1.mp4
```

Contenu minimal de `data/index.json` :

```json
{
  "entries": [
    {
      "id": "rapport-dystopie-01",
      "title": "Rapport de dérive dystopique // Zone A",
      "file": "rapport-dystopie-01.md",
      "tags": ["dystopie", "surveillance", "rapport"],
      "level": "HIGH",
      "created": "2025-11-27",
      "preview": "Synthèse des signaux faibles relevés dans la Zone A.",
      "meta": {
        "source": "toi",
        "version": 1
      }
    },
    {
      "id": "mission-pour-s",
      "title": "Mission publique pour S",
      "file": "mission-pour-s.md",
      "tags": ["jeu", "mission", "S"],
      "level": "LOW",
      "created": "2025-11-27",
      "preview": "Instructions à publier quelque part sur le net.",
      "meta": {
        "where_posted": "à renseigner…",
        "status": "draft"
      }
    }
  ]
}
```

Tu peux ajouter autant d’entrées que tu veux dans `entries`.

---

## 3. Exemple de fichier Markdown riche : `data/rapport-dystopie-01.md`

```markdown
# Rapport de dérive dystopique // Zone A

Les faits décrits ici sont **réels**, mais assemblés comme une fiction.
Toute ressemblance avec _ton_ quotidien n'est peut-être pas un hasard.

## Indicateurs

- Caméras "intelligentes" installées sans débat public.
- Algorithmes de scoring opaque dans l'accès aux droits.
- Concentration des données de santé + données de mobilité.

![Plan de la zone A](media/zone-a-plan.png)

## Pièces jointes

- [Note PDF confidentielle](media/note-confidentielle.pdf)
- [Vidéo d'observation](media/sequence-01.mp4)

> Hypothèse : si personne ne regarde ces données de l'extérieur,
> la dystopie avancera en douceur, sous couvert de confort et de sécurité.
```

Ce Markdown sera rendu dans le panneau principal, avec l’image et les liens cliquables (en local).

---

## 4. Comment installer sur clé USB (ou dossier local)

1. Crée la structure :

   ```text
   ma-cle-usb/
     ghostnet/
       index.html
       data/
         index.json
         ton-fichier.md
         media/...
   ```

2. Ouvre `index.html` dans ton navigateur :

   * Souvent un double-clic suffit.
   * Si ton navigateur bloque `fetch()` sur les fichiers locaux (`file://`), lance un mini serveur dans `ghostnet/` :

     ```bash
     cd ghostnet
     python -m http.server 8000
     ```

     Puis visite `http://localhost:8000` (depuis ta clé ou ton disque).

3. Pour ajouter du contenu :

   * Crée un nouveau `.md` dans `data/`.
   * Ajoute une entrée dans `data/index.json` qui pointe vers ce fichier.
   * Recharge la page → l’entrée apparaît dans « Archives locales (Markdown) ».

4. Pour manipuler les métadonnées comme un « parfait hacker » :

   * Modifie `index.json` à la main (ou passe par l’export/import de l’interface).
   * Utilise les champs que tu veux dans `meta`: sources, versions, flags, etc.
   * Filtre par tag en cliquant sur un tag dans le panneau Méta → la liste se réduit.

---

Si tu veux, au prochain message je peux :

* te générer un **pack complet** (plusieurs `.md` préremplis façon leaks / manifestes),
* ou adapter l’interface (plus terminal, plus sombre, plus « retro BBS », etc.) pour coller encore plus à ton univers.
