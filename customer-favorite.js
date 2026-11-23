
// 3. SECTION 03: CUSTOMER FAVORITES (4 CARDS)
const customerFavorites = [
  {
    id: "fav-1",
    name: "Lotus Biscoff Cake",
    price: "Rs. 3,400",
    rating: "4.9",
    stars: "★★★★★",
    description: "Soft sponge layered with caramelized Biscoff spread.",
    image: "assets/cake.jpeg",
    category: "cakes"
  },
  {
    id: "fav-2",
    name: "Nutella Heaven Brownie",
    price: "Rs. 380",
    rating: "4.8",
    stars: "★★★★★",
    description: "Chocolate brownie filled and topped with Nutella.",
    image: "assets/brownie.jpeg",
    category: "brownies"
  },
  {
    id: "fav-3",
    name: "Almond Croissant",
    price: "Rs. 400",
    rating: "4.9",
    stars: "★★★★★",
    description: "Flaky croissant filled with almond cream and topped with sliced almonds.",
    image: "assets/pastries/pastry-11.jpeg",
    category: "pastries"
  },
  {
    id: "fav-4",
    name: "Salted Caramel Brownie",
    price: "Rs. 350",
    rating: "4.7",
    stars: "★★★★☆",
    description: "Fudgy brownie swirled with sweet and salty caramel.",
    image: "assets/brownies/brownie-14.jpeg",
    category: "brownies"
  }
];

const favoritesGrid = document.getElementById("favoritesGrid");

if (favoritesGrid) {
  favoritesGrid.innerHTML = customerFavorites
    .map(
      (treat) => `
      <article class="favorite-card">
        <div class="favorite-img-wrap">
          <img src="${treat.image}" alt="${treat.name}" loading="lazy">
        </div>
        <div class="favorite-body">
          <div class="favorite-rating-row">
            <span class="star-rating" aria-label="${treat.rating} out of 5 stars">${treat.stars}</span>
            <span class="rating-value">(${treat.rating})</span>
          </div>
          <h3 class="favorite-title">${treat.name}</h3>
          <p class="favorite-desc">${treat.description}</p>
          <div class="favorite-footer">
            <span class="favorite-price">${treat.price}</span>
            <a href="categories.html?category=${treat.category}" class="btn-order-now" data-treat="${treat.name}">
              Order Now
            </a>
          </div>
        </div>
      </article>
    `
    )
    .join("");

  favoritesGrid.querySelectorAll(".btn-order-now").forEach((btn) => {
    btn.addEventListener("click", () => {
      const treatName = btn.getAttribute("data-treat");
      localStorage.setItem("butterBloomQuickOrder", treatName);
    });
  });
}