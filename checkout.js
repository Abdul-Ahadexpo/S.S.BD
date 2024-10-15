let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Function to load cart items on the checkout page
function loadCheckout() {
  const checkoutItems = document.getElementById("checkout-items");

  if (cart.length === 0) {
    checkoutItems.innerHTML = "<p>Your cart is empty.</p>";
  } else {
    checkoutItems.innerHTML =
      cart
        .map(
          (item) => `
                <div class="flex justify-between items-center border-b py-2">
                    <div>
                        <h3>${item.name} (Quantity: ${item.quantity || 1})</h3>
                        <p>Price: BDT ${item.price.toFixed(2)}</p>
                    </div>
                </div>
            `
        )
        .join("") +
      `<p class="font-bold">Total: BDT ${calculateTotal().toFixed(2)}</p>`;
  }
}

// Function to calculate total price
function calculateTotal() {
  const delivery = 110; // Delivery fee
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );
  return totalPrice + delivery; // Add delivery fee
}

// Call loadCheckout on the checkout page
loadCheckout();
