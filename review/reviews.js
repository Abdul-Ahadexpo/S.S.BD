// Function to fetch and display reviews
async function loadReviews() {
  const reviewsContainer = document.querySelector("#customer-reviews .reviews");

  try {
    // Fetch reviews from the JSON file
    const response = await fetch("./reviews.json");
    const reviews = await response.json();

    // Generate HTML for each review
    reviews.forEach((review) => {
      const reviewHTML = `
        <div class="review-container">
          <div class="flex">
            ${review.images
              .map(
                (image) =>
                  `<img class="review-img db" src="${image}" alt="${review.productName} Image" onclick="openInNewTab('${image}')">`
              )
              .join("")}
          </div>
          <p class="review-text">
            "${review.reviewText}" - <strong><i>${review.buyerName}</i></strong>
            <br><small><strong>Product:</strong> ${review.productName}</small>
            <br><small><strong>Date:</strong> ${review.purchaseDate}</small>
          </p>
        </div>
      `;
      reviewsContainer.innerHTML += reviewHTML;
    });
  } catch (error) {
    console.error("Error loading reviews:", error);
    reviewsContainer.innerHTML =
      "<p>Failed to load reviews. Please try again later.</p>";
  }
}

// Open image in a new tab
function openInNewTab(url) {
  window.open(url, "_blank").focus();
}

// Load reviews on page load
document.addEventListener("DOMContentLoaded", loadReviews);
