<script>
/* Upfrica Chat Widget – robust JSON parsing + product & form support (Tailwind-proof) */
(function () {
  const NS = "upfrica-chat";
  const CFG = {
    endpoint: "https://n8n.wisebrain.io/webhook/ai/",
    sessionKey: "upfrica_session_id",
    brandName: "Upfrica assistant",
    apiKey: () => (window.UPFRICA_API_KEY || null),
    autoOpen: false,
    dev: false // set true to console.log parse steps
  };

  const svg = {
    bot:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path d="M12 3v3" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/><rect x="3" y="7" width="18" height="12" rx="3" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="9" cy="13" r="1.5" fill="currentColor"/><circle cx="15" cy="13" r="1.5" fill="currentColor"/><rect x="8" y="16" width="8" height="2" rx="1" fill="currentColor"/></svg>`,
    chat:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 2H4a2 2 0 00-2 2v16l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>`,
    close:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6.225 4.811L4.811 6.225 10.586 12l-5.775 5.775 1.414 1.414L12 13.414l5.775 5.775 1.414-1.414L13.414 12l5.775-5.775-1.414-1.414L12 10.586 6.225 4.811z"/></svg>`,
    minus:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="4" y="11" width="16" height="2" rx="1"/></svg>`,
    send:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="transform:rotate(-45deg)"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`
  };

  const css = `
:host{all:initial}*{box-sizing:border-box;font:inherit}
@media (prefers-reduced-motion:no-preference){.ease{transition:all .15s ease}}
:root{--indigo-600:#4f46e5;--indigo-700:#4338ca;--fuchsia-600:#c026d3;--bg:#fff;--fg:#111827;--muted:#6b7280;--panel:#e5e7eb;--chip:#f3f4f6;--bubble:#f3f4f6;--shadow:0 25px 50px -12px rgba(0,0,0,.25);--ring:rgba(79,70,229,.35);--scroll:#c7c7c7}
@media (prefers-color-scheme:dark){:root{--bg:#0b0b10;--fg:#e5e7eb;--muted:#9ca3af;--panel:#262936;--chip:#151723;--bubble:#151723;--scroll:#3a3d4a}}
@keyframes blink{0%{opacity:.2;transform:translateY(0)}20%{opacity:1;transform:translateY(-2px)}100%{opacity:.2;transform:translateY(0)}}
.${NS}-launcher{position:fixed;right:1rem;bottom:1rem;z-index:2147480000;display:grid;place-items:center;width:56px;height:56px;border-radius:9999px;background:var(--indigo-600);color:#fff;border:none;cursor:pointer;box-shadow:0 10px 20px rgba(79,70,229,.4)}
.${NS}-launcher:hover{background:var(--indigo-700)}.${NS}-launcher:focus-visible{outline:2px solid var(--ring);outline-offset:2px}
.${NS}-wrap{position:fixed;right:1rem;bottom:1rem;z-index:2147480001;width:min(92vw,420px);height:min(88vh,560px);display:flex;flex-direction:column;border-radius:1rem;border:1px solid var(--panel);background:var(--bg);color:var(--fg);box-shadow:var(--shadow)}
.${NS}-hidden{display:none!important}
.${NS}-header{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1rem;border-bottom:1px solid var(--panel);border-top-left-radius:1rem;border-top-right-radius:1rem;background:var(--bg)}
.${NS}-title{display:flex;align-items:center;gap:.75rem;font-weight:600}
.${NS}-brand{width:36px;height:36px;border-radius:.75rem;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,var(--indigo-600),var(--fuchsia-600))}
.${NS}-iconbtn{border:none;background:transparent;padding:.4rem;border-radius:.5rem;cursor:pointer;color:#6b7280}
.${NS}-iconbtn:hover{background:rgba(0,0,0,.05)}@media (prefers-color-scheme:dark){.${NS}-iconbtn:hover{background:rgba(255,255,255,.06)}}
.${NS}-iconbtn:focus-visible{outline:2px solid var(--ring);outline-offset:2px}
.${NS}-messages{flex:1;overflow:auto;padding:.75rem .75rem;display:flex;flex-direction:column;gap:.6rem;scroll-padding-bottom:6rem}
.${NS}-scroll::-webkit-scrollbar{width:6px}.${NS}-scroll::-webkit-scrollbar-thumb{background:var(--scroll);border-radius:9999px}
.${NS}-row{display:flex;gap:.5rem}.${NS}-row-user{justify-content:flex-end;align-items:flex-end}.${NS}-row-ai{align-items:flex-start}
.${NS}-chip-you{width:28px;height:28px;border-radius:9999px;background:#d1d5db;color:#111;display:grid;place-items:center;font-size:.75rem;flex-shrink:0}
.${NS}-chip-bot{width:32px;height:32px;border-radius:9999px;display:grid;place-items:center;color:#fff;flex-shrink:0;margin-top:.25rem;background:linear-gradient(135deg,var(--indigo-600),var(--fuchsia-600))}
.${NS}-bubble{max-width:85%;padding:.5rem .625rem;border-radius:1rem;font-size:.9rem;line-height:1.45}
.${NS}-bubble-ai{background:var(--bubble);border-top-left-radius:.25rem}
.${NS}-bubble-user{background:var(--indigo-600);color:#fff;border-top-right-radius:.25rem}
.${NS}-composer{border-top:1px solid var(--panel);padding:.5rem .5rem calc(.5rem + env(safe-area-inset-bottom))}
.${NS}-composerbox{display:flex;align-items:flex-end;gap:.5rem;background:var(--chip);border-radius:.75rem;padding:.375rem .5rem}
.${NS}-textarea{flex:1;min-height:1.75rem;max-height:10rem;background:transparent;border:none;resize:none;outline:none;font-size:.95rem;color:var(--fg)}
.${NS}-send{display:inline-flex;align-items:center;gap:.375rem;background:var(--indigo-600);color:#fff;border:none;border-radius:.5rem;padding:.4rem .6rem;font-weight:600;font-size:.85rem;cursor:pointer}
.${NS}-send:hover{background:var(--indigo-700)}.${NS}-send[disabled]{opacity:.5;cursor:not-allowed}
.${NS}-dot{width:.375rem;height:.375rem;background:#6b7280;border-radius:9999px;display:inline-block}
.${NS}-dot-1{animation:blink 1.2s infinite .0s}.${NS}-dot-2{animation:blink 1.2s infinite .2s}.${NS}-dot-3{animation:blink 1.2s infinite .4s}
.${NS}-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.5rem}
.${NS}-card{border:1px solid var(--panel);border-radius:.5rem;overflow:hidden}
.${NS}-card>a{display:flex;gap:.75rem;padding:.5rem;text-decoration:none;color:inherit;align-items:center}
.${NS}-card>a:hover{background:rgba(0,0,0,.04)}@media (prefers-color-scheme:dark){.${NS}-card>a:hover{background:rgba(255,255,255,.06)}}
.${NS}-thumb{width:48px;height:48px;border-radius:.375rem;object-fit:cover;flex-shrink:0;background:#eee}
.${NS}-title-sm{font-size:.9rem;font-weight:600;line-height:1.2;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.${NS}-price{font-size:.75rem;color:var(--muted);margin-top:.15rem}
`;

  // ——— Helpers ———
  const esc = (s)=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const safeUrl = (u)=>{try{return new URL(u, location.href).href}catch{return '#'}};
  const smoothOK = ()=>!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  function extractFirstJson(s) {
    if (!s) return null;
    const t = String(s);

    // 1) code fence ```json ... ```
    const fence = t.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fence && fence[1]) return fence[1];

    // 2) first balanced {...}
    const objStart = t.indexOf('{');
    if (objStart !== -1) {
      let depth = 0;
      for (let i = objStart; i < t.length; i++) {
        const ch = t[i];
        if (ch === '{') depth++;
        if (ch === '}') { depth--; if (depth === 0) return t.slice(objStart, i + 1); }
      }
    }
    // 3) first balanced [...]
    const arrStart = t.indexOf('[');
    if (arrStart !== -1) {
      let depth = 0;
      for (let i = arrStart; i < t.length; i++) {
        const ch = t[i];
        if (ch === '[') depth++;
        if (ch === ']') { depth--; if (depth === 0) return t.slice(arrStart, i + 1); }
      }
    }
    return null;
  }

  function normalizeProducts(list) {
    return (list || []).map(p => ({
      title: p.title || p.name || p.productName || p.heading || 'Untitled',
      price: p.priceText || p.price || p.amount || p.cost || '',
      detailsUrl: p.detailsUrl || p.url || p.link || p.permalink || '#',
      image: p.image || p.imageUrl || p.thumbnail || p.thumb || p.picture || ''
    }));
  }

  function normalizeForm(spec) {
    const src = spec.form || spec;
    const fields = (src.fields || []).map(f => ({
      id: f.id || f.name || f.key || ('f_' + Math.random().toString(36).slice(2,6)),
      label: f.label || f.placeholder || f.name || f.id || 'Field',
      type: f.type || 'text',
      required: !!f.required,
      placeholder: f.placeholder || '',
      value: f.value ?? ''
    }));
    return {
      id: src.id || 'form_' + Math.random().toString(36).slice(2,6),
      title: src.title || 'Form',
      submitLabel: src.submitLabel || 'Submit',
      message: src.message || '',
      fields
    };
  }

  function parseAssistantOutput(outputStr) {
    if (/\[SHOW_PRODUCTS\]/i.test(outputStr)) {
      return { kind: 'products', data: { products: sampleProducts() } };
    }
    if (/\[SHOW_FORM\]/i.test(outputStr)) {
      return { kind: 'form', data: normalizeForm(sampleFormSpec()) };
    }

    const jsonText = extractFirstJson(outputStr);
    if (!jsonText) return { kind: 'text', data: String(outputStr) };

    let j = null;
    try { j = JSON.parse(jsonText); } catch (e) { if (CFG.dev) console.log('JSON parse failed', e); }

    if (Array.isArray(j)) {
      // bare array → assume products
      return { kind: 'products', data: { products: normalizeProducts(j) } };
    }
    if (!j) return { kind: 'text', data: String(outputStr) };

    // accept multiple shapes
    if (Array.isArray(j.products)) {
      return { kind: 'products', data: { products: normalizeProducts(j.products), seeAllLink: j.seeAllLink || j.url || '', cta: j.cta || '' } };
    }
    if (j.command && /product/i.test(j.command)) {
      const products = Array.isArray(j.items) ? j.items : [];
      return { kind: 'products', data: { products: normalizeProducts(products), seeAllLink: j.seeAllLink || '', cta: j.cta || '' } };
    }
    if (j.ui === 'form' || j.type === 'form' || j.form) {
      return { kind: 'form', data: normalizeForm(j) };
    }
    if (typeof j.message === 'string') {
      return { kind: 'text', data: j.message };
    }
    return { kind: 'text', data: String(outputStr) };
  }

  // ——— DOM builders ———
  const rowAI = (html)=>{ const r=document.createElement('div'); r.className=`${NS}-row ${NS}-row-ai`; r.innerHTML=`<div class="${NS}-chip-bot">${svg.bot}</div><div class="${NS}-bubble ${NS}-bubble-ai">${html}</div>`; return r; };
  const rowUser = (t)=>{ const r=document.createElement('div'); r.className=`${NS}-row ${NS}-row-user`; r.innerHTML=`<div class="${NS}-bubble ${NS}-bubble-user">${esc(t)}</div><div class="${NS}-chip-you">You</div>`; return r; };
  const rowTyping = ()=>{ const r=document.createElement('div'); r.className=`${NS}-row ${NS}-row-ai`; r.dataset.typing='true'; r.innerHTML=`<div class="${NS}-chip-bot">${svg.bot}</div><div class="${NS}-bubble ${NS}-bubble-ai"><span class="${NS}-dot ${NS}-dot-1"></span><span class="${NS}-dot ${NS}-dot-2" style="margin-left:.15rem"></span><span class="${NS}-dot ${NS}-dot-3" style="margin-left:.15rem"></span></div>`; return r; };
  const scrollToBottom = (el,s=true)=>el.scrollTo({ top: el.scrollHeight+9999, behavior: (s && smoothOK())?'smooth':'auto' });

  function productCardsHTML({products=[], seeAllLink='', cta=''}) {
    const items = products.map(p=>{
      const title=esc(p.title||'Untitled'); const price=esc(p.price||''); const link=safeUrl(p.detailsUrl||'#'); const img=safeUrl(p.image||'');
      const fallback=encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="100%" height="100%" fill="#eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="10" fill="#999">No image</text></svg>');
      return `<li class="${NS}-card"><a href="${link}" target="_blank" rel="noopener nofollow noreferrer" aria-label="${title}">
        <img class="${NS}-thumb" src="${img}" alt="" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,${fallback}'">
        <div class="min-w-0"><div class="${NS}-title-sm">${title}</div><div class="${NS}-price">${price}</div></div></a></li>`;
    }).join('');
    const seeAll = seeAllLink ? `<a class="${NS}-title-sm" style="display:inline-flex;gap:.25rem;align-items:center;color:var(--indigo-600);text-decoration:none" href="${safeUrl(seeAllLink)}" target="_blank" rel="noopener nofollow noreferrer">See all results
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M13 5l7 7-7 7v-4H4v-6h9V5z"/></svg></a>` : '';
    const ctaLine = cta ? `<p style="margin:.35rem 0 0 0">${esc(cta)}</p>` : '';
    return `<div><p style="font-size:.9rem;margin:0 0 .35rem 0">Here are some options:</p><ul class="${NS}-list">${items}</ul>${ctaLine}${seeAll}</div>`;
  }

  function formBubble(spec) {
    const { id, title='Form', submitLabel='Submit', message, fields=[] } = spec;
    const formId = `f-${id}-${Math.random().toString(36).slice(2,8)}`;
    const wrap = document.createElement('div'); wrap.className=`${NS}-row ${NS}-row-ai}`;
    const inputs = fields.map(f=>{
      const label = `<label for="${formId}-${f.id}" style="display:block;font-size:.75rem;font-weight:600;margin:0 0 .25rem;color:#374151">${esc(f.label || f.id)}${f.required?'<span style="color:#ef4444"> *</span>':''}</label>`;
      const common = `id="${formId}-${f.id}" name="${esc(f.id)}" ${f.required?'required':''} style="width:100%;border:1px solid var(--panel);border-radius:.5rem;padding:.5rem .625rem;font-size:.9rem;outline:none"`;
      const ph = f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : '';
      const val = f.value!=null ? String(f.value) : '';
      if (f.type==='textarea') return `${label}<textarea ${common} rows="3"${ph}>${esc(val)}</textarea>`;
      if (f.type==='select') {
        const opts=(f.options||[]).map(o=>`<option${String(val)===String(o)?' selected':''}>${esc(String(o))}</option>`).join('');
        return `${label}<select ${common}>${opts}</select>`;
      }
      const type = ['text','email','tel','number'].includes(f.type)?f.type:'text';
      const min = f.min!=null?` min="${f.min}"`:''; const max = f.max!=null?` max="${f.max}"`:''; const step = f.step!=null?` step="${f.step}"`:'';
      return `${label}<input type="${type}" ${common}${ph} value="${esc(val)}"${min}${max}${step}>`;
    }).join('<div style="height:.5rem"></div>');

    const msg = message ? `<p style="font-size:.9rem;margin:0 0 .5rem;color:#374151">${esc(message)}</p>` : '';
    wrap.innerHTML = `<div class="${NS}-chip-bot">${svg.bot}</div>
      <div class="${NS}-bubble ${NS}-bubble-ai" style="padding:.75rem">
        <div style="font-weight:600;margin:0 0 .25rem">${esc(title)}</div>
        ${msg}
        <form id="${formId}" data-form-id="${esc(id)}">${inputs}
          <div style="padding-top:.5rem"><button type="submit" class="${NS}-send">${svg.send}<span>${esc(submitLabel)}</span></button></div>
        </form>
      </div>`;
    setTimeout(()=>{
      const form = wrap.querySelector('form'); if(!form) return;
      form.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const btn=form.querySelector('button[type="submit"]'); const old=btn.innerHTML; btn.disabled=true; btn.innerHTML='<span class="animate-pulse">Submitting…</span>';
        const data={}; Array.from(form.elements).forEach(el=>{ if(!el.name) return; data[el.name]=(el.type==='checkbox'?el.checked:el.value); });
        const typing = rowTyping(); messages.appendChild(typing); scrollToBottom(messages,true);
        let output; try{ output = await sendToAssistant({ message:"[FORM_SUBMISSION]", event:"form_submitted", id: form.dataset.formId, data }); }
        catch{ output = "Sorry — I couldn't submit the form. Please try again."; }
        btn.disabled=false; btn.innerHTML=old; typing.remove(); renderOutput(output);
      });
    },0);
    return wrap;
  }

  function renderOutput(outputStr){
    const parsed = parseAssistantOutput(outputStr);
    if (parsed.kind==='products'){ messages.appendChild(rowAI(productCardsHTML(parsed.data))); scrollToBottom(messages,true); return; }
    if (parsed.kind==='form'){ messages.appendChild(formBubble(parsed.data)); scrollToBottom(messages,true); return; }
    messages.appendChild(rowAI(esc(parsed.data).replace(/\n/g,"<br>"))); scrollToBottom(messages,true);
  }

  // ——— Networking ———
  let sessionId = localStorage.getItem(CFG.sessionKey) || null;
  async function sendToAssistant(payload){
    const headers = new Headers({ "Content-Type":"application/json" });
    const key = (typeof CFG.apiKey==='function'?CFG.apiKey():CFG.apiKey) || null;
    if (key) headers.append("X-API-Key", key);
    const body = { ...payload }; if (sessionId) body.sessionId = sessionId;
    const res = await fetch(CFG.endpoint, { method:"POST", headers, body: JSON.stringify(body), redirect:"follow" });
    const ct = res.headers.get('content-type')||'';
    const raw = ct.includes('application/json') ? await res.json() : JSON.parse(await res.text());
    if (raw?.sessionId && raw.sessionId !== sessionId) { sessionId = raw.sessionId; localStorage.setItem(CFG.sessionKey, sessionId); }
    return String(raw?.output ?? "(No response text)");
  }

  // ——— Mount (Shadow DOM, Tailwind-proof) ———
  // Hide your demo HTML so we don't double render
  const demoLauncher=document.getElementById('chat-launcher'); const demoPanel=document.getElementById('chat-panel');
  if (demoLauncher) { demoLauncher.style.display='none'; demoLauncher.setAttribute('aria-hidden','true'); }
  if (demoPanel) { demoPanel.style.display='none'; demoPanel.setAttribute('aria-hidden','true'); }

  const host=document.createElement('div'); host.id=`${NS}-container`; document.body.appendChild(host);
  const shadow=host.attachShadow({mode:'open'});
  const style=document.createElement('style'); style.textContent=css; shadow.appendChild(style);

  const launcher=document.createElement('button'); launcher.className=`${NS}-launcher ease`; launcher.type='button'; launcher.setAttribute('aria-label','Open chat'); launcher.setAttribute('aria-expanded','false'); launcher.innerHTML=svg.chat; shadow.appendChild(launcher);
  const panel=document.createElement('section'); panel.className=`${NS}-wrap ${NS}-hidden`; panel.setAttribute('role','dialog'); panel.setAttribute('aria-modal','true'); panel.setAttribute('aria-label','Chat panel'); panel.setAttribute('aria-live','polite');

  const header=document.createElement('header'); header.className=`${NS}-header`;
  header.innerHTML=`<div class="${NS}-title"><div class="${NS}-brand">${svg.bot}</div><div id="${NS}-heading">${esc(CFG.brandName)}</div></div>
    <div style="display:flex;gap:.25rem;align-items:center">
      <button type="button" class="${NS}-iconbtn" title="Minimize" aria-label="Minimize">${svg.minus}</button>
      <button type="button" class="${NS}-iconbtn" title="Close" aria-label="Close">${svg.close}</button>
    </div>`;
  panel.appendChild(header);

  const messages=document.createElement('main'); messages.className=`${NS}-messages ${NS}-scroll`;
  messages.innerHTML=`<div class="${NS}-row ${NS}-row-ai"><div class="${NS}-chip-bot">${svg.bot}</div><div class="${NS}-bubble ${NS}-bubble-ai">Hi! I’m <strong>${esc(CFG.brandName)}</strong>. Ask me anything — I’ll reply here. 👋</div></div>`;
  panel.appendChild(messages);

  const form=document.createElement('form'); form.className=`${NS}-composer`;
  form.innerHTML=`<div class="${NS}-composerbox"><textarea rows="1" class="${NS}-textarea" placeholder="Type your message…" aria-label="Type your message"></textarea><button type="submit" class="${NS}-send" disabled aria-disabled="true">${svg.send}<span>Send</span></button></div>`;
  panel.appendChild(form);
  shadow.appendChild(panel);

  // focus + controls
  const minBtn=header.querySelectorAll('button')[0]; const closeBtn=header.querySelectorAll('button')[1];
  const textarea=form.querySelector('textarea'); const sendBtn=form.querySelector('button[type="submit"]');
  function trapFocus(e){ if (e.key!=='Tab') return; const f=panel.querySelectorAll('button,[href],input,textarea,select,[tabindex]:not([tabindex="-1"])'); if(!f.length) return; const first=f[0], last=f[f.length-1]; if(e.shiftKey && document.activeElement===first){e.preventDefault(); last.focus();} else if(!e.shiftKey && document.activeElement===last){e.preventDefault(); first.focus();}}
  function openPanel(){ panel.classList.remove(`${NS}-hidden`); launcher.classList.add(`${NS}-hidden`); launcher.setAttribute('aria-expanded','true'); panel.addEventListener('keydown',trapFocus); setTimeout(()=>textarea.focus(),50); scrollToBottom(messages,true); }
  function closePanel(){ panel.classList.add(`${NS}-hidden`); launcher.classList.remove(`${NS}-hidden`); launcher.setAttribute('aria-expanded','false'); panel.removeEventListener('keydown',trapFocus); launcher.focus(); }
  launcher.addEventListener('click', openPanel); minBtn.addEventListener('click', closePanel); closeBtn.addEventListener('click', closePanel);
  shadow.addEventListener('keydown', e=>{ if(e.key==='Escape' && !panel.classList.contains(`${NS}-hidden`)) closePanel(); });
  function autoGrow(){ textarea.style.height='auto'; textarea.style.height=Math.min(textarea.scrollHeight,160)+'px'; }
  function enableSend(){ const dis = textarea.value.trim().length===0; sendBtn.disabled=dis; sendBtn.setAttribute('aria-disabled',String(dis)); }
  textarea.addEventListener('input', ()=>{ autoGrow(); enableSend(); });
  textarea.addEventListener('keydown', (e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); if(!sendBtn.disabled) form.requestSubmit(); } });

  // Slash commands for instant test
  function sampleProducts() {
    return [
      { title: "Solar Home Kit 50W", price: "$79", detailsUrl: "#", image: "https://picsum.photos/seed/solar50/96/96" },
      { title: "Inverter 1kVA", price: "$149", detailsUrl: "#", image: "https://picsum.photos/seed/inverter1/96/96" },
      { title: "Deep-cycle Battery 100Ah", price: "$189", detailsUrl: "#", image: "https://picsum.photos/seed/battery100/96/96" }
    ];
  }
  function sampleFormSpec() {
    return {
      id: "lead_capture",
      title: "Get a Quote",
      message: "Share a few details and we’ll follow up.",
      submitLabel: "Send",
      fields: [
        { id:"name", label:"Full name", type:"text", required:true, placeholder:"Jane Doe" },
        { id:"email", label:"Email", type:"email", required:true, placeholder:"jane@example.com" },
        { id:"phone", label:"Phone", type:"tel", placeholder:"+1 555…" },
        { id:"budget", label:"Budget (USD)", type:"number", min:0, step:1 },
        { id:"notes", label:"Notes", type:"textarea", placeholder:"What are you looking for?" }
      ]
    };
  }
  function handleSlashCommand(input) {
    const cmd = input.trim().slice(1).toLowerCase();
    if (cmd.startsWith('form')) { messages.appendChild(formBubble(sampleFormSpec())); scrollToBottom(messages,true); return true; }
    if (cmd.startsWith('products')) { messages.appendChild(rowAI(productCardsHTML({ products: sampleProducts() }))); scrollToBottom(messages,true); return true; }
    return false;
  }

  // Submit
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const text = textarea.value.trim(); if(!text) return;

    // local commands
    if (text.startsWith('/')) {
      textarea.value=''; autoGrow(); enableSend();
      messages.appendChild(rowUser(text)); scrollToBottom(messages,true);
      if (!handleSlashCommand(text)) {
        messages.appendChild(rowAI("Unknown command. Try <code>/form</code> or <code>/products</code>.")); scrollToBottom(messages,true);
      }
      return;
    }

    textarea.value=''; autoGrow(); enableSend();
    messages.appendChild(rowUser(text)); scrollToBottom(messages,true);

    const typing=rowTyping(); messages.appendChild(typing); scrollToBottom(messages,true);
    sendBtn.disabled=true; sendBtn.setAttribute('aria-disabled','true');

    let output;
    try { output = await sendToAssistant({ message: text }); }
    catch(e){ console.error('[UpfricaChat] API error:', e); output = `Sorry, I couldn't reach the server. Please try again.`; }

    typing.remove(); renderOutput(output); enableSend();
  });

  if (CFG.autoOpen) openPanel();
})();
</script>
