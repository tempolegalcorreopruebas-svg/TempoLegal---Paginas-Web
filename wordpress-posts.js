(async function loadWordPressPosts() {
  const directory = document.querySelector("[data-wordpress-directory]");
  const grid = directory || document.getElementById("articles-grid");
  const template = document.getElementById("wordpress-post-card");
  const status = document.querySelector("[data-wordpress-status]");

  if (!grid || !template || !status) return;

  const apiUrl = new URL(window.TEMPO_CONFIG?.wordpressPostsUrl || "/wp-json/wp/v2/posts", document.baseURI);
  apiUrl.searchParams.set("_embed", directory ? "wp:featuredmedia" : "wp:featuredmedia,wp:term");
  apiUrl.searchParams.set("_fields", "slug,title,excerpt,_links,_embedded");

  const articleUrl = new URL("articulo-wordpress/index.html", document.currentScript.src);
  const language = document.documentElement.lang.split("-")[0];
  const labels = {
    es: {
      category: "Publicaciones",
      empty: "Aún no hay publicaciones.",
      error: "No se pudieron cargar las publicaciones. Inténtalo de nuevo en unos minutos."
    },
    en: {
      category: "Insights",
      empty: "No publications yet.",
      error: "Publications could not be loaded. Please try again in a few minutes."
    },
    pt: {
      category: "Publicações",
      empty: "Ainda não há publicações.",
      error: "Não foi possível carregar as publicações. Tente novamente em alguns minutos."
    },
    fr: {
      category: "Publications",
      empty: "Aucune publication pour le moment.",
      error: "Impossible de charger les publications. Réessayez dans quelques minutes."
    }
  };
  const copy = labels[language] || labels.es;

  const toText = (html) => {
    const textTemplate = document.createElement("template");
    textTemplate.innerHTML = html || "";
    return textTemplate.content.textContent.trim();
  };

  const posts = [];
  const pageSize = 20;
  apiUrl.searchParams.set("per_page", String(pageSize));
  let page = 1;
  let pending = false;
  let hasMore = true;

  const labelsByAction = {
    es: ["Cargando publicaciones…", "Cargar más publicaciones", "Reintentar"],
    en: ["Loading publications…", "Load more publications", "Try again"],
    pt: ["Carregando publicações…", "Carregar mais publicações", "Tentar novamente"],
    fr: ["Chargement des publications…", "Charger plus de publications", "Réessayer"]
  };
  const [loadingLabel, moreLabel, retryLabel] = labelsByAction[language] || labelsByAction.es;
  const more = document.createElement("button");
  more.type = "button";
  more.className = "button button-outline wordpress-load-more";
  more.hidden = true;
  grid.after(more);

  function render() {
    const fragment = document.createDocumentFragment();
    const displayedSlugs = new Set();

    const bySlug = new Map(posts.map((post) => [post.slug, post]));
    if (language !== "es") articleUrl.searchParams.set("lang", language);

    for (const entry of posts) {
      const baseSlug = entry.slug.replace(/-(?:en|pt|fr)$/, "");
      if (displayedSlugs.has(baseSlug)) continue;
      const original = bySlug.get(baseSlug);
      const translation = language === "es" ? null : bySlug.get(baseSlug + "-" + language);
      const post = translation || original || entry;
      const contentLanguage = post.slug.match(/-(en|pt|fr)$/)?.[1] || "es";
      if (!directory && displayedSlugs.size === 3) break;

      const card = template.content.firstElementChild.cloneNode(true);
      const title = toText(post.title.rendered);

      if (!directory) {
        card.classList.add(displayedSlugs.size ? "tl-post-side" : "tl-post-featured");
        card.querySelector(".tl-post-category").textContent =
          post._embedded?.["wp:term"]?.[0]?.[0]?.name || copy.category;
      }

      const titleElement = card.querySelector(directory ? "h2 a" : "h3");
      titleElement.textContent = title;
      titleElement.lang = contentLanguage;
      card.querySelector("p").lang = contentLanguage;
      const excerpt = toText(post.excerpt?.rendered);
      card.querySelector("p").textContent = directory
        ? excerpt
        : excerpt.split(/\s+(?:Actualizado|Autor|Revisado por|Aprobado por):/i, 1)[0];
      articleUrl.searchParams.set("slug", original ? baseSlug : post.slug);
      card.querySelectorAll("a").forEach((link) => {
        link.href = articleUrl.href;
      });
      const action = card.querySelector(directory ? ".text-link" : ".tl-post-action");
      action.setAttribute("aria-label", action.textContent.replace(/[→↗]/g, "").trim() + ": " + title);

      const media = post._embedded?.["wp:featuredmedia"]?.[0];
      const imageUrl = media?.media_details?.sizes?.large?.source_url || media?.source_url;
      const cover = card.querySelector(".tl-post-cover");

      if (imageUrl) {
        const image = cover.querySelector("img");
        image.src = imageUrl;
        image.alt = media?.alt_text || "";
        cover.setAttribute("aria-label", title);
      } else {
        cover.remove();
      }

      fragment.appendChild(card);
      displayedSlugs.add(baseSlug);
    }

    grid.replaceChildren(fragment);
    status.textContent = displayedSlugs.size ? "" : copy.empty;
    status.hidden = displayedSlugs.size > 0;
    return displayedSlugs.size;
  }

  async function loadPage() {
    if (pending || !hasMore) return;
    pending = true;
    const hadFocus = document.activeElement === more;
    const previousCount = grid.children.length;
    more.disabled = true;
    if (!more.hidden) more.textContent = loadingLabel;
    try {
      apiUrl.searchParams.set("page", String(page));
      const response = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
      const batch = await response.json();
      if (!response.ok) {
        if (page === 1 || batch?.code !== "rest_post_invalid_page_number") {
          throw new Error("HTTP " + response.status);
        }
        hasMore = false;
        status.hidden = true;
        return;
      }
      if (!Array.isArray(batch)) throw new Error("Invalid WordPress response");
      const validPosts = batch.filter(post => typeof post?.slug === "string" && post.slug &&
        typeof post.title?.rendered === "string");
      posts.push(...validPosts);
      const total = Number.parseInt(response.headers.get("X-WP-TotalPages"), 10);
      hasMore = batch.length > 0 && (Number.isFinite(total) ? page < total : batch.length === pageSize);
      page += 1;
      const shown = render();
      if (!directory && shown >= 3) hasMore = false;
      more.textContent = moreLabel;
    } catch (error) {
      console.error("WordPress connection failed:", error);
      status.textContent = copy.error;
      status.hidden = false;
      more.textContent = retryLabel;
    } finally {
      pending = false;
      more.disabled = false;
      more.hidden = !hasMore;
      if (hadFocus && (document.activeElement === more || document.activeElement === document.body)) {
        const next = grid.children[previousCount]?.querySelector(directory ? "h2 a" : "a[href]");
        if (next) next.focus();
        else if (hasMore) more.focus({ preventScroll: true });
        else grid.lastElementChild?.querySelector("a[href]")?.focus({ preventScroll: true });
      }
    }
  }

  more.addEventListener("click", loadPage);
  await loadPage();
})();
