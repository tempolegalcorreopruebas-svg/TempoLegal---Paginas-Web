
(async function loadWordPressArticle() {
  const apiBase = "http://localhost/blogTempolegal/wp-json/wp/v2/posts";

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const languages = ["es", "en", "pt", "fr"];
  const requested = params.get("lang");
  const language = languages.includes(requested) ? requested : "es";
  const root = document.documentElement;
  root.lang = language;
  root.dataset.pageLang = language;
  root.dataset.langUrls = JSON.stringify(Object.fromEntries(languages.map((locale) => {
    const target = new URL(window.location.href);
    if (locale === "es") target.searchParams.delete("lang");
    else target.searchParams.set("lang", locale);
    return [locale, target.href];
  })));

  const labels = {
    es: ["Cargando artículo…", "Consultando WordPress…", "Artículo no seleccionado", "Regresa a Publicaciones y selecciona un artículo.", "Artículo no encontrado", "Esta publicación no está disponible.", "No se pudo cargar el artículo", "Comprueba que WAMP esté encendido y vuelve a intentarlo.", "", "En esta lectura", "Volver a Publicaciones"],
    en: ["Loading article…", "Connecting to WordPress…", "No article selected", "Go back to Publications and select an article.", "Article not found", "This publication is unavailable.", "Could not load the article", "Check that WAMP is running and try again.", "This article is currently available in Spanish.", "In this article", "Back to Publications"],
    pt: ["Carregando artigo…", "Consultando o WordPress…", "Nenhum artigo selecionado", "Volte a Publicações e selecione um artigo.", "Artigo não encontrado", "Esta publicação está indisponível.", "Não foi possível carregar o artigo", "Verifique se o WAMP está em execução e tente novamente.", "Este artigo está disponível em espanhol.", "Neste artigo", "Voltar para Publicações"],
    fr: ["Chargement de l’article…", "Connexion à WordPress…", "Aucun article sélectionné", "Retournez aux publications et sélectionnez un article.", "Article introuvable", "Cette publication est indisponible.", "Impossible de charger l’article", "Vérifiez que WAMP est démarré, puis réessayez.", "Cet article est actuellement disponible en espagnol.", "Dans cet article", "Retour aux publications"]
  };
  const [loading, connecting, noSelection, selectArticle, notFound, unavailable, failed, retry, fallback, tocTitle, backLabel] = labels[language];
  const back = document.querySelector(".article-breadcrumb");
  if (back) {
    back.textContent = backLabel;
    back.href = language === "es" ? "../publicaciones/index.html" : "../" + language + "/publicaciones/index.html";
  }
  const indexTitle = document.getElementById("article-index-title");
  if (indexTitle) indexTitle.textContent = tocTitle;

  const titleElement = document.getElementById("article-title");
  const leadElement = document.querySelector(".article-lead");
  const categoryElement = document.querySelector(".article-eyebrow");
  const storyElement = document.getElementById("article-story");
  const tocElement = document.querySelector(".article-toc ol");

  if (!titleElement || !storyElement) return;

  const extractText = (html) => {
    const element = document.createElement("div");
    element.innerHTML = html || "";
    return element.textContent.trim();
  };

  titleElement.textContent = loading;
  if (leadElement) leadElement.textContent = "";
  storyElement.textContent = connecting;
  if (tocElement) tocElement.replaceChildren();

  if (!slug) {
    titleElement.textContent = noSelection;
    storyElement.textContent = selectArticle;
    return;
  }

  try {
    async function fetchPost(postSlug) {
      const apiUrl = new URL(apiBase);
      apiUrl.searchParams.set("slug", postSlug);
      apiUrl.searchParams.set("_embed", "1");
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("HTTP " + response.status);
      const posts = await response.json();
      return posts[0];
    }

    const translated = language === "es" ? null : await fetchPost(slug + "-" + language);
    const post = translated || await fetchPost(slug);
    const contentLanguage = translated ? language : "es";

    if (!post) {
      titleElement.textContent = notFound;
      storyElement.textContent = unavailable;
      return;
    }

    const title = extractText(post.title.rendered);
    const summary = extractText(post.excerpt.rendered);

    const category =
      post._embedded?.["wp:term"]?.[0]?.[0]?.name ||
      "Publicaciones";

    const media =
      post._embedded?.["wp:featuredmedia"]?.[0];

    titleElement.textContent = title;
    titleElement.lang = contentLanguage;
    if (leadElement) leadElement.lang = contentLanguage;
    if (categoryElement) categoryElement.lang = contentLanguage;
    if (tocElement) tocElement.lang = contentLanguage;

    if (leadElement) leadElement.textContent = summary;
    if (categoryElement) categoryElement.textContent = category;

    document.title = `${title} | Tempo Legal`;

    // Display article content using the existing editorial styles.
    const contentSection = document.createElement("section");
    contentSection.className = "article-section";
    contentSection.lang = contentLanguage;
    contentSection.innerHTML = post.content.rendered;

    storyElement.replaceChildren();
    if (!translated && fallback) {
      const notice = document.createElement("p");
      notice.textContent = fallback;
      storyElement.appendChild(notice);
    }

    // Display the featured image.
    if (media?.source_url) {
      const figure = document.createElement("figure");
      const image = document.createElement("img");

      image.src = media.source_url;
      image.alt = media.alt_text || title;
      image.loading = "eager";
      image.decoding = "async";

      image.style.cssText =
        "width:100%;height:auto;display:block;border-radius:12px;";

      figure.style.margin = "0 0 36px";
      figure.appendChild(image);

      storyElement.appendChild(figure);
    }

    storyElement.appendChild(contentSection);

    // Generate the table of contents from article headings.
    const headings = storyElement.querySelectorAll("h2");

    if (tocElement) {
      headings.forEach((heading, index) => {
        const id = `wp-heading-${index + 1}`;
        heading.id = id;

        const item = document.createElement("li");
        const link = document.createElement("a");

        link.href = `#${id}`;
        link.textContent = heading.textContent;

        item.appendChild(link);
        tocElement.appendChild(item);
      });

      const toc = tocElement.closest(".article-toc");
      if (toc) toc.style.display = headings.length ? "" : "none";
    }

    console.log("WordPress article loaded:", title);

  } catch (error) {
    console.error("WordPress article loading failed:", error);
    titleElement.textContent = failed;
    storyElement.textContent =
      retry;
  }
})();
