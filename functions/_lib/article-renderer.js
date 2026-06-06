function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00Z`));
}

function shareSection() {
  return `<section class="share-section" aria-label="Share this article">
    <h2 class="share-title">Share this article</h2>
    <div class="share-actions">
      <a class="share-button" data-share="linkedin" href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a class="share-button" data-share="twitter" href="#" target="_blank" rel="noopener noreferrer">X / Twitter</a>
      <a class="share-button" data-share="facebook" href="#" target="_blank" rel="noopener noreferrer">Facebook</a>
      <a class="share-button" data-share="whatsapp" href="#" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      <a class="share-button" data-share="email" href="#">Email</a>
      <button class="share-button" data-share="copy" type="button" aria-live="polite">Copy Link</button>
      <button class="share-button" data-share="native" type="button" hidden>Native Share</button>
    </div>
  </section>`;
}

export function renderArticle(article, { preview = false } = {}) {
  const references = article.references?.length
    ? `<div class="references"><h2>References</h2><ol>${article.references.map((item) => `<li>${item}</li>`).join("")}</ol></div>`
    : "";
  const cover = article.coverImage
    ? `<img class="cover-image" src="${escapeHtml(article.coverImage)}" alt="">`
    : "";
  const previewBanner = preview
    ? `<div class="preview-banner">Draft preview · This page is visible only to logged-in editors.</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${escapeHtml(article.excerpt)}">
<meta property="og:title" content="${escapeHtml(article.title)}">
<meta property="og:description" content="${escapeHtml(article.excerpt)}">
<meta property="og:type" content="article">
<title>${escapeHtml(article.title)} — DALE</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;1,8..60,300&display=swap" rel="stylesheet">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png">
<style>
:root{--ink:#1a1612;--paper:#f4f0e8;--amber:#c8841a;--rust:#8b3a2a;--muted:#6b6358;--rule:#d4c9b0;--highlight:#e8dfc0}
*{box-sizing:border-box}html{font-size:18px}body{margin:0;background:var(--paper);color:var(--ink);font-family:"Source Serif 4",Georgia,serif;font-weight:300;line-height:1.75}
.masthead{border-bottom:2px solid var(--ink);padding:1.5rem;text-align:center}.masthead-label,.masthead-brand,.back-link,.byline,.share-title,.share-button,.references h2,.dale-mark,.closing-mark p,.preview-banner{font-family:"IBM Plex Mono",monospace}.masthead-label{font-size:.65rem;letter-spacing:.25em;text-transform:uppercase;color:var(--muted)}.masthead-brand{font-size:.8rem;font-weight:500;letter-spacing:.3em;color:var(--amber);text-transform:uppercase}.back-link{display:inline-block;margin-top:.8rem;color:var(--rust);font-size:.65rem;font-weight:500;letter-spacing:.08em;text-decoration:none;text-transform:uppercase}
.preview-banner{padding:.75rem 1rem;background:var(--rust);color:#fff;text-align:center;font-size:.68rem;letter-spacing:.06em}.article-container{max-width:680px;margin:0 auto;padding:4rem 2rem 8rem}.kicker{display:flex;align-items:center;gap:.75rem;margin-bottom:1.5rem;color:var(--rust);font-family:"IBM Plex Mono",monospace;font-size:.65rem;letter-spacing:.2em;text-transform:uppercase}.kicker::after{content:"";height:1px;flex:1;background:var(--rust);opacity:.4}
h1,h2,h3,h4{font-family:"Playfair Display",Georgia,serif;color:var(--ink)}h1{margin:0 0 .5rem;font-size:clamp(2.4rem,5vw,3.6rem);line-height:1.1;letter-spacing:-.02em}.subtitle{margin:0 0 2.5rem;padding-bottom:2.5rem;border-bottom:1px solid var(--rule);color:var(--muted);font-family:"Playfair Display",Georgia,serif;font-size:1.15rem;font-style:italic;font-weight:400;line-height:1.5}.byline{display:flex;gap:2rem;margin-bottom:2rem;color:var(--muted);font-size:.65rem;letter-spacing:.12em;text-transform:uppercase}.cover-image{display:block;width:100%;height:auto;margin:0 0 2.5rem}
.article-body p{margin:0 0 1.6rem}.article-body>p:first-child::first-letter{float:left;margin:.05em .12em 0 0;color:var(--rust);font-family:"Playfair Display",serif;font-size:4rem;font-weight:700;line-height:.82}.article-body h2{margin:3.5rem 0 1.25rem;padding-top:2rem;border-top:1px solid var(--rule);font-size:1.4rem}.article-body h3{margin:2.5rem 0 1rem}.article-body a{color:var(--rust)}.article-body ul,.article-body ol{margin:0 0 1.6rem;padding-left:1.5rem}
.article-body blockquote,.pull-quote{margin:3rem 0;padding:1.25rem 1.5rem;border-left:3px solid var(--amber);background:var(--highlight)}.article-body blockquote p,.pull-quote p{margin:0;font-family:"Playfair Display",serif;font-size:1.2rem;font-style:italic;line-height:1.55}.term{padding:.1em .35em;border-radius:2px;background:var(--highlight);color:var(--rust);font-family:"IBM Plex Mono",monospace;font-size:.82em}.article-body sup{color:var(--amber);font-family:"IBM Plex Mono",monospace;font-size:.6em;font-weight:500}.chain{position:relative;margin:2.5rem 0;padding:1.5rem 1.75rem;border:1px solid var(--rule)}.chain::before{content:"CHAIN OF EVIDENCE";position:absolute;top:-.6rem;left:1.5rem;padding:0 .5rem;background:var(--paper);color:var(--amber);font-family:"IBM Plex Mono",monospace;font-size:.55rem;letter-spacing:.2em}.chain ol{list-style:none;counter-reset:chain;padding:0}.chain li{counter-increment:chain;display:flex;gap:1rem;margin-bottom:1rem}.chain li::before{content:counter(chain,decimal-leading-zero);min-width:1.8rem;color:var(--amber);font-family:"IBM Plex Mono",monospace;font-size:.7rem}
.section-break{text-align:center;margin:3rem 0;color:var(--muted);letter-spacing:.3em}.share-section{margin:0 0 3rem;padding:1.25rem 0;border-top:1px solid var(--rule);border-bottom:1px solid var(--rule)}.share-section.end{margin:3rem 0}.share-title{margin:0 0 .8rem;color:var(--muted);font-size:.65rem;letter-spacing:.16em;text-transform:uppercase}.share-actions{display:flex;flex-wrap:wrap;gap:.55rem}.share-button{appearance:none;min-height:42px;padding:.65rem .8rem;border:1px solid var(--rule);border-radius:2px;background:transparent;color:var(--ink);cursor:pointer;font-size:.62rem;font-weight:500;text-decoration:none}.share-button:hover,.share-button:focus-visible{border-color:var(--rust);background:var(--highlight)}.share-button[hidden]{display:none}
.references{margin-top:5rem;padding-top:2rem;border-top:2px solid var(--ink)}.references h2{margin:0 0 1.5rem;font-size:.65rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}.references ol{padding-left:1.5rem;color:var(--muted)}.references li{margin-bottom:.75rem;font-family:"IBM Plex Mono",monospace;font-size:.7rem;line-height:1.65}.closing-mark{text-align:center;margin-top:4rem;padding-top:2rem;border-top:1px solid var(--rule)}.dale-mark{display:block;margin-bottom:.5rem;color:var(--amber);font-size:.75rem;font-weight:500;letter-spacing:.3em}.closing-mark p{margin:0;color:var(--muted);font-size:.6rem;letter-spacing:.2em;text-transform:uppercase}
@media(max-width:600px){.article-container{padding:2.5rem 1.25rem 5rem}h1{font-size:2.2rem}.byline{gap:.7rem;flex-direction:column}.share-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.share-button{display:grid;place-items:center;text-align:center}}
</style>
</head>
<body>
${previewBanner}
<header class="masthead"><div class="masthead-label">Systems Thinking Lab</div><div class="masthead-brand">DALE — app.dale.africa</div><a class="back-link" href="${preview ? "/admin/blog/" : "/blog/"}">← Back to ${preview ? "editor" : "DALE Systems Lab"}</a></header>
<main class="article-container">
  <div class="kicker">${escapeHtml(article.category || "DALE Systems Lab")}</div>
  <h1>${escapeHtml(article.title)}</h1>
  ${article.subtitle ? `<p class="subtitle">${escapeHtml(article.subtitle)}</p>` : ""}
  <div class="byline"><span>${escapeHtml(article.author)}</span><span>${escapeHtml(formatDate(article.date))}</span></div>
  ${cover}
  ${shareSection()}
  <article class="article-body">${article.bodyContent}</article>
  ${shareSection().replace('class="share-section"', 'class="share-section end"')}
  ${references}
  <div class="closing-mark"><span class="dale-mark">DALE</span><p>Market memory infrastructure · app.dale.africa · Kisumu, Kenya</p></div>
</main>
<script>
(()=>{const title=${JSON.stringify(article.title)},url=location.href.split("#")[0];const e=encodeURIComponent;
const urls={linkedin:"https://www.linkedin.com/sharing/share-offsite/?url="+e(url),twitter:"https://twitter.com/intent/tweet?url="+e(url)+"&text="+e(title),facebook:"https://www.facebook.com/sharer/sharer.php?u="+e(url),whatsapp:"https://wa.me/?text="+e(title+" "+url),email:"mailto:?subject="+e(title)+"&body="+e(url)};
Object.entries(urls).forEach(([key,value])=>document.querySelectorAll('[data-share="'+key+'"]').forEach(link=>link.href=value));
document.querySelectorAll('[data-share="copy"]').forEach(button=>button.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(url)}catch{const input=document.createElement("textarea");input.value=url;document.body.appendChild(input);input.select();document.execCommand("copy");input.remove()}button.textContent="Link copied";setTimeout(()=>button.textContent="Copy Link",1800)}));
if(typeof navigator.share==="function")document.querySelectorAll('[data-share="native"]').forEach(button=>{button.hidden=false;button.addEventListener("click",()=>navigator.share({title,url}).catch(()=>{}))});
})();
</script>
</body></html>`;
}
