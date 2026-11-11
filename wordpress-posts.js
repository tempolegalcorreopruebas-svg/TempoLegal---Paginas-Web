(async function loadWordPressPosts() {
  const directory = document.querySelector("[data-wordpress-directory]");
  const grid = directory || document.getElementById("articles-grid");
  const template = document.getElementById("wordpress-post-card");
  const status = document.querySelector("[data-wordpress-status]");

  if (!grid || !template || !status) return;

  const apiUrl = new URL("http://localhost/blogTempolegal/wp-json/wp/v2/posts");
  apiUrl.searchParams.set("_embed", "1");
  apiUrl.searchParams.set("per_page", "20");

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

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const posts = await response.json();
    const totalPages = Number(response.headers.get("X-WP-TotalPages"));

    for (let page = 2; page <= totalPages; page += 1) {
      apiUrl.searchParams.set("page", String(page));
      const next = await fetch(apiUrl);
      if (!next.ok) throw new Error(`HTTP ${next.status}`);
      posts.push(...await next.json());
    }

    const fragment = document.createDocumentFragment();
    const displayedSlugs = new Set();

    const bySlug = new Map(posts.map((post) => [post.slug, post]));
    if (language !== "es") articleUrl.searchParams.set("lang", language);

    for (const original of posts) {
      const sourceSlug = original.slug?.replace(/-(?:en|pt|fr)$/, "");
      if (sourceSlug !== original.slug && bySlug.has(sourceSlug)) continue;
      const translation = language === "es" ? null : bySlug.get(original.slug + "-" + language);
      const post = translation || original;
      const contentLanguage = translation ? language : "es";
      if (!post.slug || displayedSlugs.has(post.slug)) continue;
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
      const excerpt = toText(post.excerpt.rendered);
      card.querySelector("p").textContent = directory
        ? excerpt
        : excerpt.split(/\s+(?:Actualizado|Autor|Revisado por|Aprobado por):/i, 1)[0];
      articleUrl.searchParams.set("slug", original.slug);
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
      displayedSlugs.add(post.slug);
    }

    grid.replaceChildren(fragment);
    status.textContent = displayedSlugs.size ? "" : copy.empty;
    status.hidden = displayedSlugs.size > 0;
  } catch (error) {
    console.error("WordPress connection failed:", error);
    status.textContent = copy.error;
  }
})();
