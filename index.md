---
layout: default
title: Home
---


<div style="text-align: center; margin-bottom: 2rem;">
  <h2>Forrorf</h2>
  <p>I do forensics and I like cars.</p>
</div>

<div class="card">
  <h3>Quick links</h3>
  <ul>
    <li><a href="/projects/">Projects</a></li>
    <li><a href="/ctf/">CTF Writeups</a></li>
  </ul>
</div>

<h2>CTF Writeups</h2>
<div class="grid">
{% for post in site.ctf reversed %}
  <div class="card">
    <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
    <p>{{ post.excerpt | strip_html | truncate: 100 }}</p>
    <p class="meta">{{ post.date | date: "%b %d, %Y" }} — {{ post.tags | join: ", " }}</p>
  </div>
{% endfor %}
</div>
