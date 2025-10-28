---
layout: default
title: Home
---


<div class="intro scroll-fade">
<h2>forrof</h2>
<p>I do forensics and I like cars.</p>
</div>


<div class="card scroll-fade">
<h3>Quick links</h3>
<ul>
<li><a href="/projects/">Projects</a></li>
<li><a href="/ctf/">CTF Writeups</a></li>
</ul>
</div>


<h2 class="scroll-fade">CTF Writeups</h2>
<div class="grid">
{% for post in site.ctf reversed %}
<div class="card scroll-fade">
<h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
<p>{{ post.excerpt | strip_html | truncate: 100 }}</p>
<p class="meta">{{ post.date | date: "%b %d, %Y" }} — {{ post.tags | join: ", " }}</p>
</div>
{% endfor %}
</div>


<h2 class="scroll-fade">My GitHub Projects</h2>
<div id="repos" class="grid"></div>


<canvas id="led-matrix"></canvas>


<script>
// Scroll fade animation
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if(entry.isIntersecting){
entry.target.classList.add('show');
}
});
}, { threshold: 0.2 });


document.querySelectorAll('.scroll-fade').forEach(el => observer.observe(el));


// Load GitHub repos
async function loadRepos() {
const user = "forrof";
const response = await fetch(`https://api.github.com/users/${user}/repos?sort=updated`);
const repos = await response.json();
const container = document.getElementById('repos');
repos.forEach(r => {
if (!r.fork) {
const card = document.createElement('div');
card.className = 'card scroll-fade';
card.innerHTML = `
<h3><a href="${r.html_url}" target="_blank">${r.name}</a></h3>
<p>${r.description || ''}</p>
<p class="meta">⭐ ${r.stargazers_count} — Updated ${new Date(r.updated_at).toLocaleDateString()}</p>
`;
container.appendChild(card);
observer.observe(card); // fade in GitHub cards
}
});
}
loadRepos();


// LED Matrix Background
const canvas = document.getElementById('led-matrix');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;
const columns = Math.floor(width / 20);
const drops = Array(columns).fill(0);


function draw() {
ctx.fillStyle = 'rgba(0,0,0,0.05)';
ctx.fillRect(0, 0, width, height);
ctx.fillStyle = '#0f0';
ctx.font = '16px monospace';
drops.forEach((y, i) => {
const text = String.fromCharCode(33 + Math.random() * 94);
ctx.fillText(text, i * 20, y * 20);
if(y * 20 > height && Math.random() > 0.975){
drops[i] = 0;
} else {
drops[i]++;
}
});
requestAnimationFrame(draw);
}
draw();


window.addEventListener('resize', () => {
width = canvas.width = window.innerWidth;
height = canvas.height = window.innerHeight;
});
</script>
