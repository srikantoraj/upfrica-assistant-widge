<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Upfrica assistant – Isolated (fixed)</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}</style>
</head>
<body>
<script>
(function () {
  const CONFIG = {
    endpoint: "https://n8n.wisebrain.io/webhook/ai/",
    sessionKey: "upfrica_session_id",
    brandName: "Upfrica assistant",
    autoOpen: false
  };

  // Host container
  const host = document.createElement('div');
  host.style.cssText = [
    "all:initial","position:fixed","right:16px","bottom:16px","z-index:2147483647",
    "border:none!important","outline:none!important","background:transparent!important","pointer-events:auto"
  ].join(";");
  document.body.appendChild(host);

  // Iframe shell
  const frame = document.createElement('iframe');
  frame.title = "Upfrica assistant";
  frame.setAttribute("aria-label","Upfrica assistant chat");
  frame.setAttribute("tabindex","0");
  frame.setAttribute("frameborder","0");
  frame.setAttribute("allowtransparency","true");
  frame.setAttribute("scrolling","no");
  frame.style.cssText = [
    "all:initial","display:block","width:56px","height:56px","border:0!important","outline:0!important",
    "box-shadow:none!important","background:transparent!important","border-radius:50%!important",
    "-webkit-tap-highlight-color:transparent","contain:layout paint style size"
  ].join(";");
  host.appendChild(frame);

  // Parent listens for iframe resize
  addEventListener("message", (e) => {
    if (!e?.data || e.data.__upfrica__ !== true) return;
    if (e.data.type === "resize") {
      frame.style.width = e.data.w + "px";
      frame.style.height = e.data.h + "px";
      frame.style.borderRadius = e.data.rounded ? "50%" : "16px";
      frame.style.boxShadow = e.data.rounded ? "none" : "0 25px 50px -12px rgba(0,0,0,.25)";
    }
  });

  // ---- IMPORTANT: avoid literal </script> inside this script ----
  const END_SCRIPT = "</scr" + "ipt>";

  // Iframe document
  const SRCDOC =
`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Upfrica assistant</title>
<style>
  :root{--indigo-600:#4f46e5;--indigo-700:#4338ca;--fuchsia-600:#c026d3;--bg:#fff;--fg:#111827;--muted:#6b7280;--panel:#e5e7eb;--shadow:0 25px 50px -12px rgba(0,0,0,.25)}
  @media (prefers-color-scheme:dark){:root{--bg:#0b0b10;--fg:#e5e7eb;--muted:#9ca3af;--panel:#262936}}
  html,body{height:100%;margin:0;background:transparent}
  *{box-sizing:border-box;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
  @keyframes blink{0%{opacity:.2;transform:translateY(0)}20%{opacity:1;transform:translateY(-2px)}100%{opacity:.2;transform:translateY(0)}}
  .ease{transition:all .15s ease}
  .wrap{position:fixed;right:0;bottom:0;width:100%;height:100%}
  .launcher{position:absolute;right:0;bottom:0;width:56px;height:56px;border-radius:9999px;background:var(--indigo-600);color:#fff;border:none;display:grid;place-items:center;cursor:pointer;outline:0!important;box-shadow:none!important;-webkit-tap-highlight-color:transparent}
  .launcher:hover{background:var(--indigo-700)}
  .panel{position:absolute;right:0;bottom:0;width:420px;max-width:92vw;height:560px;max-height:88vh;background:var(--bg);color:var(--fg);border:none;border-radius:16px;box-shadow:var(--shadow);display:flex;flex-direction:column;overflow:hidden}
  .hidden{display:none!important}
  .header{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1rem;background:var(--bg)}
  .title{display:flex;align-items:center;gap:.75rem;font-weight:600}
  .brand{width:36px;height:36px;border-radius:.75rem;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,var(--indigo-600),var(--fuchsia-600))}
  .iconbtn{border:none;background:transparent;padding:.4rem;border-radius:.5rem;cursor:pointer;color:#6b7280;outline:0!important;box-shadow:none!important;-webkit-tap-highlight-color:transparent}
  .messages{flex:1;overflow:auto;padding:.75rem .9rem;display:flex;flex-direction:column;gap:.65rem}
  .row{display:flex;gap:.5rem}.row-user{justify-content:flex-end}.row-ai{justify-content:flex-start}
  .chip-bot{width:32px;height:32px;border-radius:9999px;display:grid;place-items:center;color:#fff;flex-shrink:0;margin-top:.25rem;background:linear-gradient(135deg,var(--indigo-600),var(--fuchsia-600))}
  .bubble{max-width:85%;font-size:.95rem;line-height:1.5}.bubble-ai{padding:0;background:transparent}.bubble-user{padding:.5rem .65rem;background:var(--indigo-600);color:#fff;border-radius:1rem;border-top-right-radius:.25rem}
  .composer{padding:.5rem .6rem;background:transparent}
  .composerbox{display:flex;align-items:flex-end;gap:.5rem;background:transparent;border:none;border-radius:0;padding:0}
  .textarea{flex:1;min-height:1.75rem;max-height:10rem;background:transparent;border:none;resize:none;outline:0!important;box-shadow:none!important;-webkit-appearance:none;-webkit-tap-highlight-color:transparent;font-size:.95rem;color:var(--fg);padding:.25rem .2rem}
  .textarea::placeholder{color:var(--muted);opacity:.7}
  .send{display:inline-flex;align-items:center;gap:.375rem;background:var(--indigo-600);color:#fff;border:none;border-radius:.5rem;padding:.4rem .6rem;font-weight:600;font-size:.85rem;cursor:pointer;outline:0!important;box-shadow:none!important;-webkit-tap-highlight-color:transparent}
  .send:hover{background:var(--indigo-700)} .send[disabled]{opacity:.5;cursor:not-allowed}
  .dot{width:.375rem;height:.375rem;background:#6b7280;border-radius:9999px;display:inline-block}.dot-1{animation:blink 1.2s infinite .0s}.dot-2{animation:blink 1.2s infinite .2s}.dot-3{animation:blink 1.2s infinite .4s}
  .list{list-style:none;margin:.25rem 0 0 0;padding:0;display:flex;flex-direction:column;gap:.5rem}
  .card{border:1px solid var(--panel);border-radius:.5rem;overflow:hidden}
  .card>a{display:flex;gap:.75rem;padding:.5rem;text-decoration:none;color:inherit;align-items:center}
  .card>a:hover{background:rgba(0,0,0,.04)}@media (prefers-color-scheme:dark){.card>a:hover{background:rgba(255,255,255,.06)}}
  .thumb{width:48px;height:48px;border-radius:.375rem;object-fit:cover;flex-shrink:0;background:#eee}
  .title-sm{font-size:.9rem;font-weight:600;line-height:1.2}
  .price{font-size:.8rem;color:var(--muted);margin-top:.15rem}
</style>
</head>
<body>
<div class="wrap" aria-live="polite">
  <button class="launcher ease" id="btn-launcher" aria-label="Open chat" aria-expanded="false">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#fff" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 2H4a2 2 0 00-2 2v16l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>
  </button>

  <section class="panel hidden" id="panel" role="dialog" aria-modal="true" aria-label="Chat panel">
    <header class="header">
      <div class="title">
        <div class="brand" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M12 3v3" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/><rect x="3" y="7" width="18" height="12" rx="3" stroke="#fff" stroke-width="2" fill="none"/><circle cx="9" cy="13" r="1.5" fill="#fff"/><circle cx="15" cy="13" r="1.5" fill="#fff"/><rect x="8" y="16" width="8" height="2" rx="1" fill="#fff"/></svg>
        </div>
        <div id="brand">Upfrica assistant</div>
      </div>
      <div>
        <button class="iconbtn" id="btn-min" title="Minimize" aria-label="Minimize"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"><rect x="4" y="7" width="8" height="2" rx="1"/></svg></button>
        <button class="iconbtn" id="btn-close" title="Close" aria-label="Close"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"><path d="M6.225 4.811L4.811 6.225 10.586 12l-5.775 5.775 1.414 1.414L12 13.414l5.775 5.775 1.414-1.414L13.414 12l5.775-5.775-1.414-1.414L12 10.586 6.225 4.811z"/></svg></button>
      </div>
    </header>

    <main class="messages" id="messages">
      <div class="row row-ai">
        <div class="chip-bot"></div>
        <div class="bubble bubble-ai">Hi! I’m <strong>Upfrica assistant</strong>. Ask me anything — I’ll reply here. 👋</div>
      </div>
    </main>

    <form class="composer" id="composer">
      <div class="composerbox">
        <textarea id="input" rows="1" class="textarea" placeholder="Type your message…" aria-label="Type your message"></textarea>
        <button id="send" type="submit" class="send" disabled aria-disabled="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" style="transform:rotate(-45deg)"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          <span>Send</span>
        </button>
      </div>
    </form>
  </section>
</div>

<script>
(function(){
  const ENDPOINT = ${JSON.stringify(CONFIG.endpoint)};
  const SESSION_KEY = ${JSON.stringify(CONFIG.sessionKey)};
  const BRAND = ${JSON.stringify(CONFIG.brandName)};
  const API_KEY = parent && parent.UPFRICA_API_KEY ? parent.UPFRICA_API_KEY : null;

  const launcher = document.getElementById('btn-launcher');
  const panel = document.getElementById('panel');
  const messages = document.getElementById('messages');
  const input = document.getElementById('input');
  const send = document.getElementById('send');
  const btnMin = document.getElementById('btn-min');
  const btnClose = document.getElementById('btn-close');
  document.getElementById('brand').textContent = BRAND;

  let sessionId = null; try { sessionId = localStorage.getItem(SESSION_KEY) || null; } catch(e){}

  function postResize(w,h,rounded){ parent.postMessage({__upfrica__:true,type:"resize",w,h,rounded},"*"); }
  function sizeLauncher(){ postResize(56,56,true); }
  function sizePanel(){ const w=Math.min(420, Math.floor(innerWidth*0.92)); const h=Math.min(560, Math.floor(innerHeight*0.88)); postResize(w,h,false); }

  const esc = (s)=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const smoothOK = ()=>!matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const scrollToBottom = ()=>messages.scrollTo({top:messages.scrollHeight+9999, behavior: smoothOK()?'smooth':'auto'});
  const rowUser = (t)=>{ const r=document.createElement('div'); r.className='row row-user'; r.innerHTML=\`<div class="bubble bubble-user">\${esc(t)}</div>\`; return r; };
  const rowAI = (h)=>{ const r=document.createElement('div'); r.className='row row-ai'; r.innerHTML=\`<div class="chip-bot"></div><div class="bubble bubble-ai">\${h}</div>\`; return r; };
  const rowTyping = ()=>{ const r=document.createElement('div'); r.className='row row-ai'; r.dataset.typing='true'; r.innerHTML=\`<div class="chip-bot"></div><div class="bubble bubble-ai"><span class="dot dot-1"></span><span class="dot dot-2" style="margin-left:.15rem"></span><span class="dot dot-3" style="margin-left:.15rem"></span></div>\`; return r; };

  function openPanel(){ panel.classList.remove('hidden'); launcher.classList.add('hidden'); sizePanel(); setTimeout(()=>input.focus(),30); scrollToBottom(); }
  function closePanel(){ panel.classList.add('hidden'); launcher.classList.remove('hidden'); sizeLauncher(); }
  launcher.addEventListener('click', openPanel); btnMin.addEventListener('click', closePanel); btnClose.addEventListener('click', closePanel);
  addEventListener('keydown', e=>{ if(e.key==='Escape' && !panel.classList.contains('hidden')) closePanel(); });

  function grow(){ input.style.height='auto'; input.style.height=Math.min(input.scrollHeight,160)+'px'; }
  function enable(){ const dis = input.value.trim().length===0; send.disabled=dis; send.setAttribute('aria-disabled', String(dis)); }
  input.addEventListener('input', ()=>{ grow(); enable(); });
  input.addEventListener('keydown', (e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); if(!send.disabled) composer.requestSubmit(); } });

  // networking
  async function callApi(payload){
    const headers = new Headers({ "Content-Type":"application/json" });
    if (API_KEY) headers.append("X-API-Key", API_KEY);
    const body = { ...payload }; if (sessionId) body.sessionId = sessionId;
    const res = await fetch(ENDPOINT, { method:"POST", headers, body: JSON.stringify(body) });
    const ct = res.headers.get('content-type')||'';
    const raw = ct.includes('application/json') ? await res.json() : JSON.parse(await res.text());
    if (raw?.sessionId && raw.sessionId !== sessionId) { sessionId = raw.sessionId; try{ localStorage.setItem(SESSION_KEY, sessionId); }catch{} }
    return String(raw?.output ?? "(No response text)");
  }

  function extractFirstJson(s){
    if(!s) return null; const t=String(s);
    const fence=t.match(/```(?:json)?\\s*([\\s\\S]*?)\\s*```/i); if(fence?.[1]) return fence[1];
    const oi=t.indexOf('{'); if(oi!==-1){ let d=0; for(let i=oi;i<t.length;i++){ if(t[i]==='{') d++; if(t[i]==='}') { d--; if(d===0) return t.slice(oi,i+1); } } }
    const ai=t.indexOf('['); if(ai!==-1){ let d=0; for(let i=ai;i<t.length;i++){ if(t[i]==='[') d++; if(t[i]===']') { d--; if(d===0) return t.slice(ai,i+1); } } }
    return null;
  }
  function normalizeProducts(list){ return (list||[]).map(p=>({ title:p.title||p.name||p.productName||'Untitled', price:p.priceText||p.price||p.amount||'', detailsUrl:p.detailsUrl||p.url||p.link||'#', image:p.image||p.imageUrl||p.thumbnail||'' })); }
  function normalizeForm(spec){ const src=spec.form||spec; const fields=(src.fields||[]).map(f=>({ id:f.id||f.name||('f_'+Math.random().toString(36).slice(2,6)), label:f.label||f.placeholder||f.name||'Field', type:f.type||'text', required:!!f.required, placeholder:f.placeholder||'', value:f.value??'', options:f.options||[], min:f.min, max:f.max, step:f.step })); return { id:src.id||'form_'+Math.random().toString(36).slice(2,6), title:src.title||'Form', submitLabel:src.submitLabel||'Submit', message:src.message||'', fields }; }
  function parseOutput(s){
    const jtxt = extractFirstJson(s); if(!jtxt) return {kind:'text', data:String(s)};
    let j=null; try{ j=JSON.parse(jtxt);}catch{}
    if(Array.isArray(j)) return {kind:'products', data:{products: normalizeProducts(j)}};
    if(!j) return {kind:'text', data:String(s)};
    if(Array.isArray(j.products)) return {kind:'products', data:{products: normalizeProducts(j.products), seeAllLink:j.seeAllLink||j.url||'', cta:j.cta||''}};
    if(j.ui==='form' || j.type==='form' || j.form) return {kind:'form', data: normalizeForm(j)};
    if(typeof j.message==='string') return {kind:'text', data:j.message};
    return {kind:'text', data:String(s)};
  }
  function productCardsHTML({products=[],seeAllLink='',cta=''}) {
    const items = products.map(p=>{
      const title=esc(p.title||'Untitled'), price=esc(p.price||''), link=p.detailsUrl||'#', img=p.image||'';
      const fb=encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="100%" height="100%" fill="#eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="10" fill="#999">No image</text></svg>');
      return \`<li class="card"><a href="\${link}" target="_blank" rel="noopener nofollow noreferrer" aria-label="\${title}">
        <img class="thumb" src="\${img}" alt="" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,\${fb}'">
        <div class="min-w-0"><div class="title-sm">\${title}</div><div class="price">\${price}</div></div></a></li>\`;
    }).join('');
    const seeAll = seeAllLink ? \`<a class="title-sm" style="display:inline-flex;gap:.25rem;align-items:center;color:var(--indigo-600);text-decoration:none" href="\${seeAllLink}" target="_blank" rel="noopener nofollow noreferrer">See all results
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M13 5l7 7-7 7v-4H4v-6h9V5z"/></svg></a>\` : '';
    const ctaLine = cta ? \`<p style="margin:.35rem 0 0 0">\${esc(cta)}</p>\` : '';
    return \`<div><p style="font-size:.9rem;margin:0 0 .35rem 0">Here are some options:</p><ul class="list">\${items}</ul>\${ctaLine}\${seeAll}</div>\`;
  }
  function formBubble(spec){
    const { id, title='Form', submitLabel='Submit', message, fields=[] } = spec;
    const formId = \`f-\${id}-\${Math.random().toString(36).slice(2,8)}\`;
    const wrap = document.createElement('div'); wrap.className='row row-ai';
    const inputs = fields.map(f=>{
      const label = \`<label for="\${formId}-\${f.id}" style="display:block;font-size:.8rem;font-weight:600;margin:0 0 .25rem;color:#374151">\${esc(f.label || f.id)}\${f.required?'<span style="color:#ef4444"> *</span>':''}</label>\`;
      const common = \`id="\${formId}-\${f.id}" name="\${esc(f.id)}" \${f.required?'required':''} style="width:100%;border:1px solid var(--panel);border-radius:.5rem;padding:.5rem .625rem;font-size:.9rem;outline:0!important;box-shadow:none!important"\`;
      const ph = f.placeholder ? \` placeholder="\${esc(f.placeholder)}"\` : '';
      const val = f.value!=null ? String(f.value) : '';
      if (f.type==='textarea') return \`\${label}<textarea \${common} rows="3"\${ph}>\${esc(val)}</textarea>\`;
      if (f.type==='select') {
        const opts=(f.options||[]).map(o=>\`<option\${String(val)===String(o)?' selected':''}>\${esc(String(o))}</option>\`).join('');
        return \`\${label}<select \${common}>\${opts}</select>\`;
      }
      const type = ['text','email','tel','number'].includes(f.type)?f.type:'text';
      const min = f.min!=null?\` min="\${f.min}"\`:'', max = f.max!=null?\` max="\${f.max}"\`:'', step = f.step!=null?\` step="\${f.step}"\`:'';
      return \`\${label}<input type="\${type}" \${common}\${ph} value="\${esc(val)}"\${min}\${max}\${step}>\`;
    }).join('<div style="height:.5rem"></div>');
    const msg = message ? \`<p style="font-size:.9rem;margin:0 0 .5rem;color:#374151">\${esc(message)}</p>\` : '';
    wrap.innerHTML = \`<div class="chip-bot"></div>
      <div class="bubble bubble-ai">
        <div style="font-weight:600;margin:0 0 .25rem">\${esc(title)}</div>
        \${msg}
        <form id="\${formId}" data-form-id="\${esc(id)}">\${inputs}
          <div style="padding-top:.5rem"><button type="submit" class="send"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fff" style="transform:rotate(-45deg)"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg><span>\${esc(submitLabel)}</span></button></div>
        </form>
      </div>\`;
    setTimeout(()=>{
      const form = wrap.querySelector('form'); if(!form) return;
      form.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const btn=form.querySelector('button[type="submit"]'); const old=btn.innerHTML; btn.disabled=true; btn.innerHTML='Submitting…';
        const data={}; Array.from(form.elements).forEach(el=>{ if(!el.name) return; data[el.name]=(el.type==='checkbox'?el.checked:el.value); });
        const typing=rowTyping(); messages.appendChild(typing); scrollToBottom();
        let out; try{ out = await callApi({ message:"[FORM_SUBMISSION]", event:"form_submitted", id: form.dataset.formId, data }); }
        catch{ out = "Sorry — I couldn't submit the form. Please try again."; }
        btn.disabled=false; btn.innerHTML=old; typing.remove(); render(out);
      });
    },0);
    return wrap;
  }
  function parseAndRender(out){
    const p = parseOutput(out);
    if (p.kind==='products'){ messages.appendChild(rowAI(productCardsHTML(p.data))); scrollToBottom(); return; }
    if (p.kind==='form'){ messages.appendChild(formBubble(p.data)); scrollToBottom(); return; }
    messages.appendChild(rowAI(esc(p.data).replace(/\\n/g,"<br>"))); scrollToBottom();
  }

  const composer = document.getElementById('composer');
  composer.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const text = input.value.trim(); if(!text) return;

    input.value=''; input.style.height='auto'; send.disabled=true; send.setAttribute('aria-disabled','true');
    messages.appendChild(rowUser(text)); scrollToBottom();

    const typing = rowTyping(); messages.appendChild(typing); scrollToBottom();

    let out; try { out = await callApi({ message: text }); } catch { out = "Sorry, I couldn't reach the server. Please try again."; }
    typing.remove(); parseAndRender(out);
  });

  function sizeLauncher(){ postResize(56,56,true); }
  function sizePanel(){ const w=Math.min(420, Math.floor(innerWidth*0.92)); const h=Math.min(560, Math.floor(innerHeight*0.88)); postResize(w,h,false); }
  function openPanel(){ panel.classList.remove('hidden'); launcher.classList.add('hidden'); sizePanel(); setTimeout(()=>input.focus(),30); scrollToBottom(); }
  function closePanel(){ panel.classList.add('hidden'); launcher.classList.remove('hidden'); sizeLauncher(); }
  sizeLauncher();
  if (${CONFIG.autoOpen ? 'true' : 'false'}) openPanel();
  addEventListener('resize', ()=>{ if (panel.classList.contains('hidden')) sizeLauncher(); else sizePanel(); });
  addEventListener('load', ()=>{ if (panel.classList.contains('hidden')) sizeLauncher(); else sizePanel(); });
  document.getElementById('btn-launcher').addEventListener('click', openPanel);
  document.getElementById('btn-min').addEventListener('click', closePanel);
  document.getElementById('btn-close').addEventListener('click', closePanel);
})();${END_SCRIPT}
</body>
</html>`;

  // Assign srcdoc (with Blob fallback)
  try {
    frame.srcdoc = SRCDOC;
  } catch {
    const blob = new Blob([SRCDOC], {type:'text/html'});
    frame.src = URL.createObjectURL(blob);
  }

})();
</script>
</body>
</html>
