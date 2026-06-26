const state={articles:[],current:null,slugTouched:false,referenceText:""};
const $=id=>document.getElementById(id);
const fields=["title","subtitle","slug","author","date","category","tags","excerpt","coverImage","status"];
const escapeHtml=value=>String(value||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const slugify=value=>String(value||"").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,100);
const formatDate=value=>new Intl.DateTimeFormat("en",{dateStyle:"medium",timeZone:"UTC"}).format(new Date(value+"T00:00:00Z"));

function notify(message,error=false){const notice=$("notice");notice.textContent=message;notice.className="notice show"+(error?" error":"");setTimeout(()=>notice.classList.remove("show"),4500)}
async function api(url,options={}){const response=await fetch(url,{headers:{"Content-Type":"application/json",...(options.headers||{})},...options});const data=await response.json().catch(()=>({}));if(response.status===401){location.href="/login/?next=/admin/blog/";throw new Error("Authentication required.")}if(!response.ok)throw new Error(data.error||"Request failed.");return data}
function show(view){$("dashboard").hidden=view!=="dashboard";$("editorView").hidden=view!=="editor"}

async function loadArticles(){try{state.articles=await api("/api/admin/blog/");renderList()}catch(error){$("articleList").innerHTML=`<p class="empty">${escapeHtml(error.message)}</p>`}}
function renderList(){const list=$("articleList");if(!state.articles.length){list.innerHTML='<p class="empty">No articles yet. Create the first one.</p>';return}list.innerHTML=state.articles.map(article=>`<article class="article-row"><div><h2>${escapeHtml(article.title)}</h2><p class="meta"><span class="status ${article.status}">${article.status}</span>${escapeHtml(article.category||"Uncategorized")} · ${formatDate(article.date)} · Updated ${new Date(article.updatedAt).toLocaleString()}</p></div><div class="row-actions"><button data-edit="${article.id}">Edit</button><a class="button" href="/admin/blog/preview/${article.id}" target="_blank">Preview</a>${article.status==="published"?`<button data-unpublish="${article.id}">Unpublish</button><a class="button" href="/blog/${encodeURIComponent(article.slug)}" target="_blank">View</a>`:`<button class="primary" data-publish="${article.id}">Publish</button>`}<button class="danger" data-delete="${article.id}">Delete</button></div></article>`).join("")}

function resetForm(article=null){state.current=article;state.slugTouched=Boolean(article);$("editorHeading").textContent=article?"Edit article":"New article";const defaults={title:"",subtitle:"",slug:"",author:"DALE Systems Lab",date:new Date().toISOString().slice(0,10),category:"",tags:"",excerpt:"",coverImage:"",status:"draft"};const values=article?{...article,tags:article.tags.join(", ")}:defaults;fields.forEach(id=>$(id).value=values[id]||"");$("bodyEditor").innerHTML=article?.bodyContent||"";state.referenceText=(article?.references||[]).map(item=>htmlToText(item)).join("\n\n");$("references").value=state.referenceText;show("editor")}
function htmlToText(html){const div=document.createElement("div");div.innerHTML=html;return div.textContent.trim()}
function formData(statusOverride){const referenceText=$("references").value;const references=state.current&&referenceText===state.referenceText?state.current.references:referenceText.split(/\n\s*\n/).map(item=>escapeHtml(item.trim())).filter(Boolean);return{title:$("title").value,subtitle:$("subtitle").value,slug:$("slug").value,author:$("author").value,date:$("date").value,category:$("category").value,tags:$("tags").value.split(",").map(tag=>tag.trim()).filter(Boolean),excerpt:$("excerpt").value,coverImage:$("coverImage").value,bodyContent:$("bodyEditor").innerHTML,references,status:statusOverride||$("status").value}}
async function save(statusOverride){const payload=formData(statusOverride);if(!payload.title||!payload.slug||!payload.date){notify("Title, slug, and date are required.",true);return null}try{const article=state.current?await api(`/api/admin/blog/${state.current.id}`,{method:"PUT",body:JSON.stringify(payload)}):await api("/api/admin/blog/",{method:"POST",body:JSON.stringify(payload)});state.current=article;notify(article.status==="published"?"Article published.":"Draft saved.");await loadArticles();return article}catch(error){notify(error.message,true);return null}}

const allowedTags=new Set(["P","BR","H2","H3","H4","STRONG","B","EM","I","A","BLOCKQUOTE","OL","UL","LI"]);
function cleanPastedHtml(html){const doc=new DOMParser().parseFromString(html,"text/html");doc.querySelectorAll("script,style,meta,link,iframe,object").forEach(node=>node.remove());const clean=node=>{[...node.childNodes].forEach(child=>{if(child.nodeType===Node.TEXT_NODE)return;if(child.nodeType!==Node.ELEMENT_NODE){child.remove();return}clean(child);if(!allowedTags.has(child.tagName)){child.replaceWith(...child.childNodes);return}[...child.attributes].forEach(attr=>child.removeAttribute(attr.name))})};
  // Reparse links separately because attributes are intentionally stripped above.
  const links=[...doc.body.querySelectorAll("a")].map(link=>link.getAttribute("href"));
  clean(doc.body);[...doc.body.querySelectorAll("a")].forEach((link,index)=>{const href=links[index];if(href&&/^(https?:|mailto:)/i.test(href))link.href=href});
  return doc.body.innerHTML;
}
function insertHtml(html){$("bodyEditor").focus();document.execCommand("insertHTML",false,html)}

$("newArticle").addEventListener("click",()=>resetForm());
$("backToDashboard").addEventListener("click",()=>show("dashboard"));
$("title").addEventListener("input",event=>{if(!state.slugTouched)$("slug").value=slugify(event.target.value)});
$("slug").addEventListener("input",()=>state.slugTouched=true);
$("articleForm").addEventListener("submit",event=>{event.preventDefault();save()});
$("saveDraft").addEventListener("click",()=>{$("status").value="draft";save("draft")});
$("preview").addEventListener("click",async()=>{const article=await save(state.current?null:"draft");if(article)window.open(`/admin/blog/preview/${article.id}`,"_blank")});
document.querySelectorAll("[data-command]").forEach(button=>button.addEventListener("click",()=>{let value=button.dataset.value||null;if(button.dataset.command==="createLink")value=prompt("Link URL:");if(button.dataset.command==="createLink"&&!value)return;$("bodyEditor").focus();document.execCommand(button.dataset.command,false,value)}));
$("pullQuote").addEventListener("click",()=>insertHtml('<div class="pull-quote"><p>Pull quote text</p></div><p><br></p>'));
$("evidenceChain").addEventListener("click",()=>insertHtml('<div class="chain"><ol><li>First point in the evidence chain</li><li>Second point</li></ol></div><p><br></p>'));
$("plainText").addEventListener("click",()=>{const text=prompt("Paste plain text:");if(text)insertHtml(text.split(/\n{2,}/).map(p=>`<p>${escapeHtml(p).replaceAll("\n","<br>")}</p>`).join(""))});
$("bodyEditor").addEventListener("paste",event=>{const html=event.clipboardData.getData("text/html");if(!html)return;event.preventDefault();insertHtml(cleanPastedHtml(html))});
$("articleList").addEventListener("click",async event=>{const button=event.target.closest("button");if(!button)return;const id=button.dataset.edit||button.dataset.publish||button.dataset.unpublish||button.dataset.delete;if(!id)return;const article=state.articles.find(item=>item.id===id);if(button.dataset.edit){resetForm(article);return}if(button.dataset.delete){if(!confirm(`Delete "${article.title}"? This cannot be undone.`))return;try{await api(`/api/admin/blog/${id}`,{method:"DELETE"});notify("Article deleted.");await loadArticles()}catch(error){notify(error.message,true)}return}const status=button.dataset.publish?"published":"draft";try{await api(`/api/admin/blog/${id}`,{method:"PUT",body:JSON.stringify({...article,status})});notify(status==="published"?"Article published.":"Article unpublished.");await loadArticles()}catch(error){notify(error.message,true)}});
loadArticles();
