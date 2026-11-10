
(async function loadWordPressArticle() {
  const apiBase = "http://localhost/blogTempolegal/wp-json/wp/v2/posts";

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

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

  titleElement.textContent = "Cargando artículo...";
  if (leadElement) leadElement.textContent = "";
  storyElement.textContent = "Consultando WordPress...";
  if (tocElement) tocElement.replaceChildren();

  if (!slug) {
    titleElement.textContent = "Artículo no seleccionado";
    storyElement.textContent = "Regresa a Publicaciones y selecciona un artículo.";
    return;
  }

  try {
    const apiUrl = new URL(apiBase);
    apiUrl.searchParams.set("slug", slug);
    apiUrl.searchParams.set("_embed", "1");

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const posts = await response.json();
    const post = posts[0];

    if (!post) {
      titleElement.textContent = "Artículo no encontrado";
      storyElement.textContent = "Esta publicación no está disponible.";
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

    if (leadElement) leadElement.textContent = summary;
    if (categoryElement) categoryElement.textContent = category;

    document.title = `${title} | Tempo Legal`;

    // Display article content using the existing editorial styles.
    const contentSection = document.createElement("section");
    contentSection.className = "article-section";
    contentSection.innerHTML = post.content.rendered;

    storyElement.replaceChildren();

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
    titleElement.textContent = "No se pudo cargar el artículo";
    storyElement.textContent =
      "Comprueba que WAMP esté encendido y vuelve a intentarlo.";
  }
})();
