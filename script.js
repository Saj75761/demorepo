const form = document.getElementById('search-form');
const input = document.getElementById('username');
const resultEl = document.getElementById('result');
const messageEl = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = input.value.trim();
  if (!username) return;
  // show loading
  messageEl.textContent = 'Searching...';
  messageEl.classList.remove('error');
  resultEl.hidden = true;
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });

    if (res.status === 404) {
      showError('User not found. Please check the username.');
      return;
    }
    if (!res.ok) {
      showError(`Error: ${res.status} ${res.statusText}`);
      return;
    }

    const data = await res.json();
    renderProfile(data);
  } catch (err) {
    showError('Network error. Try again later.');
    console.error(err);
  }
});

function showError(msg) {
  messageEl.textContent = msg;
  messageEl.classList.add('error');
  resultEl.hidden = true;
}

function renderProfile(user) {
  messageEl.textContent = '';
  messageEl.classList.remove('error');

  const name = user.name ? escapeHtml(user.name) : '';
  const login = escapeHtml(user.login);
  const bio = user.bio ? escapeHtml(user.bio) : '';
  const avatar = user.avatar_url;
  const html = `
    <div class="card">
      <div class="avatar" aria-hidden="false">
        <img src="${avatar}" alt="Avatar for ${login}" loading="lazy" />
      </div>
      <div class="info">
        <div class="name-row">
          <div class="name">${name || login}</div>
          <a class="badge" href="${user.html_url}" target="_blank" rel="noopener">View on GitHub</a>
        </div>
        <div class="meta">@${login}</div>
        ${bio ? `<p class="bio">${bio}</p>` : ''}
        <div class="stats" aria-hidden="false">
          <div class="stat">
            <div class="num">${user.followers}</div>
            <div class="label">Followers</div>
          </div>
          <div class="stat">
            <div class="num">${user.following}</div>
            <div class="label">Following</div>
          </div>
          <div class="stat">
            <div class="num">${user.public_repos}</div>
            <div class="label">Public Repos</div>
          </div>
        </div>
      </div>
    </div>
  `;
  resultEl.innerHTML = html;
  resultEl.hidden = false;
}

// Very small escape helper for text nodes
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
