---
layout: default
title: CTF Writeups
---

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
