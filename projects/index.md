---
layout: default
title: Projects
---

<h2>My GitHub Projects</h2>
<div id="repos" class="grid"></div>

<script>
async function loadRepos() {
  const user = "forrof";
  const response = await fetch(`https://api.github.com/users/${user}/repos?sort=updated`);
  const repos = await response.json();
  const container = document.getElementById('repos');
  repos.forEach(r => {
    if (!r.fork) {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3><a href="${r.html_url}" target="_blank">${r.name}</a></h3>
        <p>${r.description || ''}</p>
        <p class="meta">⭐ ${r.stargazers_count} — Updated ${new Date(r.updated_at).toLocaleDateString()}</p>
      `;
      container.appendChild(card);
    }
  });
}
loadRepos();
</script>
