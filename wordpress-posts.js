
(async function loadWordPressPosts() {
  const apiUrl =
    "http://localhost/blogTempolegal/wp-json/wp/v2/posts?_embed&per_page=3";

  const grid = document.getElementById("articles-grid");

  if (!grid) return;

  const toText = (html) => {
    const template = document.createElement("template");
    template.innerHTML = html || "";
    return template.content.textContent.trim();
  };

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const posts = await response.json();
    const cards = [...grid.querySelectorAll(":scope > article")];

    posts.slice(0, 3).forEach((post, index) => {
      const card = cards[index];
      if (!card) return;

      const title = toText(post.title.rendered);
      const summary = toText(post.excerpt.rendered);
      const category =
        post._embedded?.["wp:term"]?.[0]?.[0]?.name ||
        "Publicaciones";

      const media =
        post._embedded?.["wp:featuredmedia"]?.[0];

      const imageUrl =
        media?.media_details?.sizes?.large?.source_url ||
        media?.source_url;

      // Update article information.
      const heading = card.querySelector("h3");
      const description = card.querySelector(
        ".insight-summary, .tl-post-body > p"
      );
      const categoryLabel = card.querySelector(
        ".insight-category, .tl-post-category"
      );
      const metaLabel = card.querySelector(".insight-meta span");

      if (heading) heading.textContent = title;
      if (description) description.textContent = summary;
      if (categoryLabel) categoryLabel.textContent = category;
      if (metaLabel && index > 0) {
        metaLabel.textContent = category;
      }

      // Use the WordPress article URL temporarily.
      
      // Build the internal article URL using the WordPress slug.
      const articleUrl = new URL(
        "articulo-wordpress/index.html",
        document.baseURI
      );

      articleUrl.searchParams.set("slug", post.slug);

      // Update the article action link.
      const action = card.querySelector(
        ".insight-action, .tl-post-action"
      );

      if (action) {
        action.href = articleUrl.href;
        action.setAttribute(
          "aria-label",
          `Leer artículo: ${title}`
        );
      }

      // Update the article image link.
      const cover = card.querySelector(".tl-post-cover");

      if (cover) {
        cover.href = articleUrl.href;
      }


      // Update the featured image.
      if (imageUrl) {
        const artwork = card.querySelector(".insight-art");

        if (artwork) {
          const img = document.createElement("img");
          img.src = imageUrl;
          img.alt = "";
          img.loading = "lazy";
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.objectFit = "cover";
          artwork.replaceChildren(img);
        } else {
          const img = card.querySelector(".tl-post-cover img");
          if (img) {
            img.src = imageUrl;
            img.alt = media?.alt_text || title;
          }
        }
      }
    });

    console.log("WordPress articles displayed:", posts.length);

  } catch (error) {
    console.error("WordPress connection failed:", error);
  }
})();
