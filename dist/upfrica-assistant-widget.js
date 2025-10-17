<script>
/* Upfrica Chat Widget – embeddable, no Tailwind required.
   - Shadow DOM styles replicate your Tailwind look
   - Keeps product-card JSON parsing (expects { output, sessionId } or plain text)
   - Focus trap, aria-live, Escape close, reduced motion, dark-mode
   - Safe HTML escaping; allows links via product cards only
*/
(function () {
  const WIDGET_NS = "upfrica-chat";
  const DEFAULTS = {
    endpoint: "https://n8n.wisebrain.io/webhook/ai/",
    brandName: "Upfrica assistant",
    sessionKey: "upfrica_session_id",
    autoOpen: false,
    apiKey: () => (window.UPFRICA_API_KEY || null),
  };

  const svg = {
    bot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" aria-hidden="true">
            <path d="M12 3v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
            <rect x="3" y="7" width="18" height="12" rx="3" stroke="currentColor" stroke-width="2" fill="none"/>
            <circle cx="9" cy="13" r="1.5" fill="currentColor"/>
            <circle cx="15" cy="13" r="1.5" fill="currentColor"/>
            <rect x="8" y="16" width="8" height="2" rx="1" fill="currentColor"/>
         </svg>`,
    chat: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
             <path d="M20 2H4a2 2 0 00-2 2v16l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/>
           </svg>`,
    close: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6.225 4.811L4.811 6.225 10.586 12l-5.775 5.775 1.414 1.414L12 13.414l5.775 5.775 1.414-1.414L13.414 12l5.775-5.775-1.414-1.414L12 10.586 6.225 4.811z"/>
            </svg>`,
    minus: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="4" y="11" width="16" height="2" rx="1"/>
            </svg>`,
    send: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="transform: rotate(-45deg);">
             <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
           </svg>`
  };

  // Minimal CSS (Tailwind-like look), scoped to shadow root
  const styles = `
:host { all: initial; }
* { box-sizing: border-box; font: inherit; }
@media (prefers-reduced-motion: no-preference) {
  .ease { transition: all .15s ease; }
}
:root {
  --indigo-600: #4f46e5; --indigo-700:#4338ca;
  --fuchsia-600:#c026d3;
  --ring: rgba(79,70,229,.35);
  --bg: #fff; --fg: #111827; --muted:#6b7280; --panel-border:#e5e7eb; --chip:#f3f4f6; --bubble:#f3f4f6;
  --shadow: 0 25px 50px -12px rgba(0,0,0,.25);
  --scroll-thumb:#c7c7c7;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0b0b10; --fg: #e5e7eb; --muted:#9ca3af; --panel-border:#262936; --chip:#151723; --bubble:#151723;
    --scroll-thumb:#3a3d4a;
  }
}
@keyframes blink {
  0% { opacity:.2; transform: translateY(0); }
  20% { opacity:1; transform: translateY(-2px); }
  100% { opacity:.2; transform: translateY(0); }
}
.${WIDGET_NS}-dot { width:.375rem; height:.375rem; background:#6b7280; border-radius:9999px; display:inline-block; }
.${WIDGET_NS}-dot-1 { animation: blink 1.2s infinite .0s; }
.${WIDGET_NS}-dot-2 { animation: blink 1.2s infinite .2s; }
.${WIDGET_NS}-dot-3 { animation: blink 1.2s infinite .4s; }
.${WIDGET_NS}-scroll::-webkit-scrollbar { width:6px; }
.${WIDGET_NS}-scroll::-webkit-scrollbar-thumb { background: var(--scroll-thumb); border-radius: 9999px; }

.${WIDGET_NS}-launcher {
  position: fixed; right:1rem; bottom:1rem; z-index:2147480000;
  display:grid; place-items:center; width:56px; height:56px; border-radius:9999px;
  background: var(--indigo-600); color:#fff; border:none; cursor:pointer;
  box-shadow: 0 10px 20px rgba(79,70,229,.4);
}
.${WIDGET_NS}-launcher:hover { background: var(--indigo-700); }
.${WIDGET_NS}-launcher:focus-visible { outline: 2px solid var(--ring); outline-offset:2px; }

.${WIDGET_NS}-wrap {
  position: fixed; right:1rem; bottom:1rem; z-index:2147480001;
  width:min(92vw,420px); height: min(88vh, 560px);
  display:flex; flex-direction:column; border-radius:1rem; border:1px solid var(--panel-border);
  background: var(--bg); color: var(--fg); box-shadow: var(--shadow);
}
.${WIDGET_NS}-hidden { display:none !important; }

.${WIDGET_NS}-header {
  display:flex; align-items:center; justify-content:space-between; padding:.75rem 1rem;
  border-bottom:1px solid var(--panel-border); border-top-left-radius:1rem; border-top-right-radius:1rem;
}
.${WIDGET_NS}-title { display:flex; align-items:center; gap:.75rem; font-weight:600; letter-spacing:.01em; }
.${WIDGET_NS}-brand {
  width:36px; height:36px; border-radius:.75rem; display:grid; place-items:center; color:#fff;
  background: linear-gradient(135deg, var(--indigo-600), var(--fuchsia-600));
}
.${WIDGET_NS}-iconbtn { border:none; background:transparent; padding:.4rem; border-radius:.5rem; cursor:pointer; color:#6b7280; }
.${WIDGET_NS}-iconbtn:hover { background: rgba(0,0,0,.05); }
@media (prefers-color-scheme: dark) {
  .${WIDGET_NS}-iconbtn:hover { background: rgba(255,255,255,.06); }
}
.${WIDGET_NS}-iconbtn:focus-visible { outline:2px solid var(--ring); outline-offset:2px; }

.${WIDGET_NS}-messages {
  flex:1; overflow:auto; padding:.75rem .75rem; display:flex; flex-direction:column; gap:.6rem;
  scroll-padding-bottom:6rem;
}
.${WIDGET_NS}-row { display:flex; gap:.5rem; }
.${WIDGET_NS}-row-user { justify-content:flex-end; align-items:flex-end; }
.${WIDGET_NS}-row-ai { align-items:flex-start; }
.${WIDGET_NS}-chip-you { width:28px; height:28px; border-radius:9999px; background:#d1d5db; color:#111; display:grid; place-items:center; font-size:.75rem; flex-shrink:0; }
.${WIDGET_NS}-chip-bot { width:32px; height:32px; border-radius:9999px; display:grid; place-items:center; color:#fff; flex-shrink:0; margin-top:.25rem;
  background: linear-gradient(135deg, var(--indigo-600), var(--fuchsia-600));
}

.${WIDGET_NS}-bubble { max-width:85%; padding:.5rem .625rem; border-radius:1rem; font-size:.9rem; line-height:1.45; }
.${WIDGET_NS}-bubble-ai { background: var(--bubble); border-top-left-radius:.25rem; }
.${WIDGET_NS}-bubble-user { background: var(--indigo-600); color:#fff; border-top-right-radius:.25rem; }

.${WIDGET_NS}-composer { border-top:1px solid var(--panel-border); padding:.5rem .5rem calc(.5rem + env(safe-area-inset-bottom)); }
.${WIDGET_NS}-composerbox { display:flex; align-items:flex-end; gap:.5rem; background: var(--chip); border-radius:.75rem; padding:.375rem .5rem; }
.${WIDGET_NS}-textarea {
  flex:1; min-height:1.75rem; max-height:10rem; background:transparent; border:none; resize:none; outline:none; font-size:.95rem;
  color:var(--fg);
}
.${WIDGET_NS}-placeholder { color: var(--muted); }
.${WIDGET_NS}-send {
  display:inline-flex; align-items:center; gap:.375rem; background: var(--indigo-600); color:#fff;
  border:none; border-radius:.5rem; padding:.4rem .6rem; font-weight:600; font-size:.85rem; cursor:pointer;
}
.${WIDGET_NS}-send:hover { background: var(--indigo-700); }
.${WIDGET_NS}-send:disabled { opacity:.5; cursor:not-allowed; }

.${WIDGET_NS}-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:.5rem; }
.${WIDGET_NS}-card { border:1px solid var(--panel-border); border-radius:.5rem; overflow:hidden; }
.${WIDGET_NS}-card > a { display:flex; gap:.75rem; padding:.5rem; text-decoration:none; color:inherit; align-items:center; }
.${WIDGET_NS}-card > a:hover { background: rgba(0,0,0,.04); }
@media (prefers-color-scheme: dark) {
  .${WIDGET_NS}-card > a:hover { background: rgba(255,255,255,.06); }
}
.${WIDGET_NS}-thumb { width:48px; height:48px; border-radius:.375rem; object-fit:cover; flex-shrink:0; background:#eee; }
.${WIDGET_NS}-title-sm { font-size:.9rem; font-weight:600; line-height:1.2; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.${WIDGET_NS}-price { font-size:.75rem; color: var(--muted); margin-top:.15rem; }
.${WIDGET_NS}-cta { margin-top:.4rem; font-size:.85rem; color: var(--fg); }
.${WIDGET_NS}-seeall { display:inline-flex; gap:.25rem; align-items:center; color: var(--indigo-600); text-decoration:none; font-weight:600; font-size:.85rem; margin-top:.35rem; }
.${WIDGET_NS}-seeall svg { width:16px; height:16px; }
`;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function safeUrl(url) {
    try { return new URL(url, location.href).href; } catch { return '#'; }
  }
  function supportsSmooth() {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? false : true;
  }

  function productCardsHTML({ products = [], seeAllLink = '', cta = '' }) {
    const items = products.map(p => {
      const title = escapeHtml(p.title ?? 'Untitled');
      const price = escapeHtml(p.price ?? '');
      const link = safeUrl(p.detailsUrl ?? '#');
      const img = safeUrl(p.image ?? '');
      const fallbackSvg = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="100%" height="100%" fill="#eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="10" fill="#999">No image</text></svg>');
      return `
        <li class="${WIDGET_NS}-card">
          <a href="${link}" target="_blank" rel="noopener nofollow noreferrer" aria-label="${title}">
            <img class="${WIDGET_NS}-thumb" src="${img}" alt="" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,${fallbackSvg}'">
            <div class="min-w-0">
              <div class="${WIDGET_NS}-title-sm">${title}</div>
              <div class="${WIDGET_NS}-price">${price}</div>
            </div>
          </a>
        </li>`;
    }).join('');

    const seeAll = seeAllLink
      ? `<a class="${WIDGET_NS}-seeall" href="${safeUrl(seeAllLink)}" target="_blank" rel="noopener nofollow noreferrer">
           See all results
           <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 5l7 7-7 7v-4H4v-6h9V5z"/></svg>
         </a>`
      : '';

    const ctaLine = cta ? `<p class="${WIDGET_NS}-cta">${escapeHtml(cta)}</p>` : '';

    return `
      <div>
        <p style="font-size:.9rem;color:var(--fg);margin:0 0 .35rem 0;">Here are some options:</p>
        <ul class="${WIDGET_NS}-list">${items}</ul>
        ${ctaLine}
        ${seeAll}
      </div>`;
  }

  function tryParseProducts(outputStr) {
    try {
      const parsed = JSON.parse(outputStr);
      if (parsed && Array.isArray(parsed.products)) {
        return {
          products: parsed.products,
          seeAllLink: parsed.seeAllLink || '',
          cta: parsed.cta || ''
        };
      }
    } catch {}
    return null;
  }

  function createWidgetRoot() {
    // Avoid double-init
    if (document.getElementById(`${WIDGET_NS}-container`)) return null;

    const host = document.createElement('div');
    host.id = `${WIDGET_NS}-container`;
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });

    const styleEl = document.createElement('style');
    styleEl.textContent = styles;

    const launcher = document.createElement('button');
    launcher.className = `${WIDGET_NS}-launcher ease`;
    launcher.setAttribute('type', 'button');
    launcher.setAttribute('aria-label', 'Open chat');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.innerHTML = svg.chat;

    const panel = document.createElement('section');
    panel.className = `${WIDGET_NS}-wrap ${WIDGET_NS}-hidden`;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Chat panel');
    panel.setAttribute('aria-live', 'polite');

    // Header
    const header = document.createElement('header');
    header.className = `${WIDGET_NS}-header`;
    header.innerHTML = `
      <div class="${WIDGET_NS}-title">
        <div class="${WIDGET_NS}-brand" aria-hidden="true">${svg.bot}</div>
        <div id="${WIDGET_NS}-heading" style="font-weight:600;">Upfrica assistant</div>
      </div>
      <div style="display:flex;gap:.25rem;align-items:center;">
        <button type="button" class="${WIDGET_NS}-iconbtn" title="Minimize" aria-label="Minimize">${svg.minus}</button>
        <button type="button" class="${WIDGET_NS}-iconbtn" title="Close" aria-label="Close">${svg.close}</button>
      </div>
    `;

    // Messages
    const messages = document.createElement('main');
    messages.className = `${WIDGET_NS}-messages ${WIDGET_NS}-scroll`;
    messages.innerHTML = `
      <div class="${WIDGET_NS}-row ${WIDGET_NS}-row-ai">
        <div class="${WIDGET_NS}-chip-bot" aria-hidden="true">${svg.bot}</div>
        <div class="${WIDGET_NS}-bubble ${WIDGET_NS}-bubble-ai">
          Hi! I’m <strong>Upfrica assistant</strong>. Ask me anything — I’ll reply here. 👋
        </div>
      </div>`;

    // Composer
    const form = document.createElement('form');
    form.className = `${WIDGET_NS}-composer`;
    form.innerHTML = `
      <div class="${WIDGET_NS}-composerbox">
        <textarea rows="1" class="${WIDGET_NS}-textarea ${WIDGET_NS}-placeholder"
          placeholder="Type your message…"
          aria-label="Type your message"></textarea>
        <button type="submit" class="${WIDGET_NS}-send" disabled aria-disabled="true">
          ${svg.send} <span>Send</span>
        </button>
      </div>
    `;

    panel.appendChild(header);
    panel.appendChild(messages);
    panel.appendChild(form);

    shadow.appendChild(styleEl);
    shadow.appendChild(launcher);
    shadow.appendChild(panel);

    return { host, shadow, launcher, panel, header, messages, form };
  }

  function assistantBubble(htmlSafe) {
    const row = document.createElement('div');
    row.className = `${WIDGET_NS}-row ${WIDGET_NS}-row-ai`;
    row.innerHTML = `
      <div class="${WIDGET_NS}-chip-bot" aria-hidden="true">${svg.bot}</div>
      <div class="${WIDGET_NS}-bubble ${WIDGET_NS}-bubble-ai">${htmlSafe}</div>`;
    return row;
  }
  function userBubble(text) {
    const row = document.createElement('div');
    row.className = `${WIDGET_NS}-row ${WIDGET_NS}-row-user`;
    row.innerHTML = `
      <div class="${WIDGET_NS}-bubble ${WIDGET_NS}-bubble-user">${escapeHtml(text)}</div>
      <div class="${WIDGET_NS}-chip-you">You</div>`;
    return row;
  }
  function typingBubble() {
    const row = document.createElement('div');
    row.className = `${WIDGET_NS}-row ${WIDGET_NS}-row-ai`;
    row.setAttribute('data-typing', 'true');
    row.innerHTML = `
      <div class="${WIDGET_NS}-chip-bot" aria-hidden="true">${svg.bot}</div>
      <div class="${WIDGET_NS}-bubble ${WIDGET_NS}-bubble-ai">
        <span class="${WIDGET_NS}-dot ${WIDGET_NS}-dot-1"></span>
        <span class="${WIDGET_NS}-dot ${WIDGET_NS}-dot-2" style="margin-left:.15rem;"></span>
        <span class="${WIDGET_NS}-dot ${WIDGET_NS}-dot-3" style="margin-left:.15rem;"></span>
      </div>`;
    return row;
  }

  function scrollToBottom(el, smooth = true) {
    el.scrollTo({ top: el.scrollHeight + 9999, behavior: (smooth && supportsSmooth()) ? 'smooth' : 'auto' });
  }

  function trapFocus(container, firstFocusable, lastFocusable) {
    function handler(e) {
      if (e.key !== 'Tab') return;
      const focusables = container.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
    container.__trapHandler = handler;
    container.addEventListener('keydown', handler);
  }
  function untrapFocus(container) {
    if (container.__trapHandler) container.removeEventListener('keydown', container.__trapHandler);
    container.__trapHandler = null;
  }

  async function callAssistantApi(endpoint, apiKey, sessionKey, sessionId, userText) {
    const headers = new Headers({ "Content-Type": "application/json" });
    if (apiKey) headers.append("X-API-Key", apiKey);
    const payload = { message: userText };
    if (sessionId) payload.sessionId = sessionId;

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      redirect: "follow"
    });
    const contentType = res.headers.get("content-type") || "";
    const raw = contentType.includes("application/json") ? await res.json() : JSON.parse(await res.text());

    // Expecting: { output: "...", sessionId: "..." }
    let newSession = sessionId;
    if (raw && raw.sessionId && raw.sessionId !== sessionId) {
      newSession = raw.sessionId;
      localStorage.setItem(sessionKey, newSession);
    }
    const output = raw && raw.output ? String(raw.output) : "(No response text)";
    return { output, sessionId: newSession };
  }

  function init(opts = {}) {
    const cfg = {
      ...DEFAULTS,
      ...opts,
    };
    const apiKey = typeof cfg.apiKey === "function" ? cfg.apiKey() : cfg.apiKey;
    let sessionId = localStorage.getItem(cfg.sessionKey) || null;

    const nodes = createWidgetRoot();
    if (!nodes) return; // already mounted

    const { shadow, launcher, panel, header, messages, form } = nodes;
    const minimizeBtn = header.querySelectorAll('button')[0];
    const closeBtn = header.querySelectorAll('button')[1];
    const textarea = form.querySelector('textarea');
    const sendBtn = form.querySelector('button[type="submit"]');

    // Set brand name in header
    header.querySelector(`#${WIDGET_NS}-heading`).textContent = cfg.brandName || DEFAULTS.brandName;

    const openPanel = () => {
      panel.classList.remove(`${WIDGET_NS}-hidden`);
      launcher.classList.add(`${WIDGET_NS}-hidden`);
      launcher.setAttribute('aria-expanded', 'true');
      // focus trap
      trapFocus(panel);
      setTimeout(() => textarea.focus(), 50);
      scrollToBottom(messages, true);
    };
    const closePanel = () => {
      panel.classList.add(`${WIDGET_NS}-hidden`);
      launcher.classList.remove(`${WIDGET_NS}-hidden`);
      launcher.setAttribute('aria-expanded', 'false');
      untrapFocus(panel);
      launcher.focus();
    };

    launcher.addEventListener('click', openPanel);
    minimizeBtn.addEventListener('click', closePanel);
    closeBtn.addEventListener('click', closePanel);

    // ESC closes when open
    shadow.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.classList.contains(`${WIDGET_NS}-hidden`)) closePanel();
    });

    // Input behaviors
    const autoGrow = () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px';
    };
    const enableSendIfNeeded = () => {
      const disabled = textarea.value.trim().length === 0;
      sendBtn.disabled = disabled;
      sendBtn.setAttribute('aria-disabled', String(disabled));
    };
    textarea.addEventListener('input', () => { autoGrow(); enableSendIfNeeded(); });
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) form.requestSubmit();
      }
    });

    // Submit handler
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = textarea.value.trim();
      if (!text) return;

      // reset input
      textarea.value = '';
      autoGrow();
      enableSendIfNeeded();

      // user bubble
      messages.appendChild(userBubble(text));
      scrollToBottom(messages, true);

      // typing
      const typing = typingBubble();
      messages.appendChild(typing);
      scrollToBottom(messages, true);

      // disable send to avoid double submits
      sendBtn.disabled = true;
      sendBtn.setAttribute('aria-disabled', 'true');

      let outputStr;
      try {
        const resp = await callAssistantApi(cfg.endpoint, apiKey, cfg.sessionKey, sessionId, text);
        sessionId = resp.sessionId; // persist updated sessionId already handled inside
        outputStr = resp.output;
      } catch (err) {
        console.error('[UpfricaChat] API error:', err);
        outputStr = `Sorry, I couldn't reach the server. Please try again.`;
      }

      // remove typing
      typing.remove();

      // render assistant
      const parsed = tryParseProducts(outputStr);
      const html = parsed ? productCardsHTML(parsed) : escapeHtml(outputStr).replace(/\n/g, '<br>');
      messages.appendChild(assistantBubble(html));
      scrollToBottom(messages, true);

      // re-enable send
      enableSendIfNeeded();
    });

    if (cfg.autoOpen) openPanel();
  }

  // expose
  window.UpfricaChatWidget = { init };
})();
</script>
