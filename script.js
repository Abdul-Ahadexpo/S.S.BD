document.documentElement.setAttribute("data-theme", "dark");
let cart = [];

// Sample product data
const products = [
    {
    id: 2.1,
    name: "BX-34 Cobalt Dragoon 2-60C",
    description:
      "Cobalt Dragoon is a left-spin four-sided Attack Type Blade with four upward slanting blades acting as the main contact points.",
    price: 450,
    image:
      "https://i5.walmartimages.com/asr/19cc5349-bd73-4c38-ae26-24d153f35867.d2b63e51ab81b07745964587525dcfde.jpeg?odnHeight=117&odnWidth=117&odnBg=FFFFFF",
  },
  {
    id: 2.4,
    name: "Weiss Tiger 3-60U",
    description:
      "<b>Weiss Tiger</b> is a Balance Type Blade with three different sets of three types of blades. The three types of blades are the Attack Type <b>Upper Blades</b>, the Defense Type Damper Blades, and the Stamina Type <b>Smash Blades</b>.",
    price: 450,
    image:
      "https://th.bing.com/th/id/OIP.LX-pjn8-PzrjcHWl_QSipwHaG9?rs=1&pid=ImgDetMain",
  },
  {
    id: 2.2,
    name: "Black Shell 4-60D",
    description:
      "Black Shell is a Defense Type Blade with an overall diamond shape with eight protrusions as the main points of contact.",
    price: 450,
    image:
      "https://beybladepremier.com/cdn/shop/files/BX-3501BlackShell4-60D_BeybladeX_BACKORDERJuly31st.jpg?v=1721582044",
  },
  {
    id: 1,
    name: "Phoenix Wing 9-60GF (Pre-Order)",
    description: `Soar Phoenix (Japanese: PhoenixWing) is a three-sided Attack Type Blade with three blades acting as the main contact points.`,
    price: 400,
    image:
      "https://th.bing.com/th/id/OIP.7Vlwn3_Ru7iwhjRfTEPWIAHaGg?rs=1&pid=ImgDetMai",
  },

  {
    id: 2,
    name: "UX Bey Hells Hammer 3-70H",
    description:
      "Hells Hammer is a right-spin Balance Type Blade with three <b>Smash Blades</b> acting as the main contact points.",
    price: 450,
    image:
      "https://cdn11.bigcommerce.com/s-lsouzjo20i/images/stencil/1280x1280/products/2512/5372/Beyblade_UX-02_03__11434.1708526001.jpg?c=2",
  },
  {
    id: 2.3,
    name: "Cobalt Drake 4-60F",
    description:
      "Cobalt Drake is a four-sided Attack Type Blade with four upward slanting blades acting as the main contact points. The blades are similar to those of Dran Sword, albeit smaller in size.",
    price: 450,
    image:
      "https://th.bing.com/th/id/OIP._db41qhqY7Cj6M-cQLflwQHaHa?rs=1&pid=ImgDetMain",
  },


  {
    id: 3,
    name: "X Bey Unicorn Sting 5-60GP",
    description:
      "Sting Unicorn (Japanese: UnicornSting) is a Balance Type Blade with an asymmetrical shape.",
    price: 400,
    image:
      "https://th.bing.com/th/id/OIP.JfM8kxGWhTDQLyFToWd9mAHaHa?rs=1&pid=ImgDetMain",
  },
  {
    id: 4,
    name: "Hells Chain 5-60HT (BX-21) (Pre-Order)",
    description:
      "A Balance Type Beyblade. <br>Successor to Hells Scythe 4-60T<br><i>It will take 15-25 days<br> to be delivered</i>",
    price: 350,
    image:
      "https://cdn11.bigcommerce.com/s-iodt3qca/images/stencil/1280x1280/products/2127/9339/BX-21-HC-TT_copy__53930.1700174025.jpg?c=2",
  },
  {
    id: 9,
    name: "Dran Dagger 4-60R",
    description:
      "Dagger Dran (Japanese: DranDagger) is an Attack Type Blade with six small blades acting as the main contact points.",
    price: 400,
    image:
      "https://th.bing.com/th/id/OIP.AVUEtziRnBOUYX7G-teWbQHaHu?rs=1&pid=ImgDetMain",
  },
  {
    id: 5,
    name: "BX-08 Wizard Arrow 4-80B(Yellow)",
    description:
      "Arrow Wizard (Japanese: WizardArrow) is a round Stamina Type Blade with two large blades acting as the main contact points.",
    price: 300,
    image:
      "https://img4.dhresource.com/webp/m/0x0/f3/albu/km/o/14/e42c932b-7a4c-4bd7-b639-55b94642ac3d.jpg",
  },
  {
    id: 6,
    name: "UX-03 Booster Wizard Rod 5-70DB",
    description:
      "Wizard Rod is a Stamina Type Blade with a wide circular shape.",
    price: 450,
    image:
      "https://toysonejapan.com/cdn/shop/files/s-l1600_4_9bc991d6-8200-4b36-93a8-52e9abc499fe_1059x959.jpg?v=1711513033",
  },
  // Original TT
  {
    id: 1.5,
    name: "Takara Tomy Beyblade X Random Booster (Pre-Order)",
    description: `Original Random Booster Vol. 4 BX-35. <br>
  <i>It will take 15-25 days<br> to be delivered</i>`,
    price: 1480,
    image:
      "https://th.bing.com/th/id/OIP.7ncb8aYMnFMRJFi-SS3bTQHaHa?rs=1&pid=ImgDetMain",
  },
  {
    id: 1.6,
    name: "Takara Tomy UX-08 Silver Wolf (Pre-Order)",
    description: `Original UX-08 Silver Wolf 3-80FB. <br>
  <i>It will take 15-25 days<br> to be delivered</i>`,
    price: 4000,
    image:
      "https://media3.nin-nin-game.com/464324/beyblade-x-ux-08-starter-silver-wolf-3-80fb-takara-tomy-.jpg",
  },

  {
    id: 1.7,
    name: "Takara Tomy Random Booster Shinobi Shadow Select (Pre-Order)",
    description: `Original UX-05 Random Booster. <br>
  <i>It will take 15-25 days<br> to be delivered</i>`,
    price: 1480,
    image:
      "https://malloftoys.com/cdn/shop/files/TakaraTomyBeybladeXUX-05RandomBoosterShinobiShadow.webp?v=1713220230g",
  },

  {
    id: 1.8,
    name: "Takara Tomy BX-33 Weiss Tiger <I>With launcher</i> (Pre-Order)",
    description: `Original UX-33 Beyblade X Booster Weiss Tiger 3-60U. <br>
  <i>It will take 15-25 days<br> to be delivered</i>`,
    price: 2900,
    image:
      "https://th.bing.com/th/id/OIP.vUV_FV_GZ6PIu6fTbTyD7gHaHa?w=1280&h=1280&rs=1&pid=ImgDetMain",
  },
  {
    id: 1.9,
    name: "Takara Tomy Xtreme Stadium (Pre-Order)",
    description: `Original BX-10 Xtreme Stadium. <br>
  <i>It will take 15-25 days<br> to be delivered</i>`,
    price: 4400,
    image: "https://opensesame.com.bd/wp-content/uploads/2024/08/910596-2.jpg",
  },

  // Original TT Ends

  {
    id: 7,
    name: "BX-18 X String Launcher (Pre-order)",
    description: "Pre-order, It will take 15-25 days to be delivered",
    price: 400,
    image:
      "https://th.bing.com/th/id/OIP.pRZBwx1ca5dpY_2YPF79jwHaHa?w=1200&h=1200&rs=1&pid=ImgDetMain",
  },
  {
    id: 8,
    name: "BX-00 X Ripcord-Launcher (Pre-order)",
    description: "Pre-order, It will take 15-25 days to be delivered",
    price: 300,
    image:
      "https://takaratomyasia.com/img/product/910398/product-910398-A02.jpg?20230724_091221",
  },

  {
    id: 10,
    name: "Beyblade X Launcher Grip",
    description:
      "The Launcher Grip (ランチャーグリップ, Ranchā Gurippu) is an Accessory released as part of the Beyblade X series. It was released in Japan on July 15th, 2023 for 700円.",
    price: 200,
    image:
      "https://beybladepremier.com/cdn/shop/files/TAKARATOMYBeybladeXLauncherGripBX-11er.jpg?height=940&v=1684358727",
  },

  {
    id: 11,
    name: "Gatling Dragon",
    description: "Flame brand Gatling Dragon Rapid Charge' Metal-10",
    price: 520,
    image:
      "https://th.bing.com/th/id/OIP.Qd6oZIu2UZ2JyDl8OKXDuAHaHa?rs=1&pid=ImgDetMain",
  },

  {
    id: 12,
    name: "Imperial Dragon",
    description: "Flame brand Imperial Dragon Ignition'",
    price: 500,
    image:
      "https://vignette.wikia.nocookie.net/beyblade/images/2/2c/Imperial_Dragon_Bey.jpg/revision/latest?cb=20191015123208",
  },
  {
    id: 13,
    name: "Ultimate Valkyrie",
    description: "Flame brand Ultimate Valkyrie Legacy Variable'-9",
    price: 500,
    image:
      "https://th.bing.com/th/id/OIP._makEXYOpLStcyVIRfj61wHaHa?rs=1&pid=ImgDetMain",
  },
  {
    id: 13.5,
    name: "Vanish Fafnir",
    description: "Full rubber Vanish Fafnir Tapered Kick-3",
    price: 500,
    image:
      "https://th.bing.com/th/id/OIP.nx0indHJS37xKmwlMftJKAHaHa?rs=1&pid=ImgDetMain",
  },

  {
    id: 14,
    name: "Burst Stadium SB Brand",
    description: "SB Brand Stadium",
    price: 2280,
    image:
      "https://ae-pic-a1.aliexpress-media.com/kf/H0b6d5eeee5bc4bf7bc1d68e8eedc50bda.jpg_640x640.jpg_.webp",
  },

  {
    id: 15,
    name: "L-Drago Destructor",
    description: "L-Drago Destructor F:S. A Metal Fight Bey",
    price: 350,
    image:
      "https://cdn11.bigcommerce.com/s-iodt3qca/images/stencil/1280x1280/products/140/405/s_l1600_50__79330.1448225384.jpg?c=2?imbypass=on",
  },
];

// Delivery Fee
const delivery = 120;

// Discount configuration
const discountConfig = [
  { quantity: 3, discount: 0.2 },
  { quantity: 6, discount: 0.5 },
  { quantity: 8, discount: 0.6 },
  { quantity: 10, discount: 0.7 },
  { quantity: 20, discount: 0.9 },
  { quantity: 30, discount: 1 },
];

// Load products
function loadProducts() {
  const productList = document.getElementById("product-list");
  productList.innerHTML = products
    .map(
      (product) => `
      <div
  id="ppd"
  class="card w-full bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl transition-transform transform hover:scale-105 hover:shadow-2xl rounded-xl overflow-hidden relative group"
>
  <figure class="overflow-hidden">
    <img
      src="${product.image}"
      alt="${product.name}"
      class="rounded-t-xl"
    />
  </figure>
  <div class="card-body p-6 bg-opacity-80 backdrop-blur-sm bg-gradient-to-b from-black via-gray-800 to-transparent">
    <h2 class="card-title text-3xl font-extrabold mb-3 group-hover:text-green-400 transition duration-200">
      ${product.name}
    </h2>
    <p class="text-sm text-gray-400 mb-4 line-clamp-3">
      ${product.description}
    </p>
    <p class="text-lg font-bold mb-4">
      Price: <span class="text-green-400">BDT ${product.price.toFixed(2)}</span>
    </p>
    <div class="card-actions mt-4 flex justify-between items-center">
      <button
        onclick="addToCart(${product.id})"
        class="btn bg-gradient-to-r from-green-500 to-green-700 text-black font-bold px-6 py-3 rounded-lg shadow-lg hover:from-green-700 hover:to-green-500 transition-all duration-300 transform hover:-translate-y-1 hover:scale-110"
      >
        Add to Cart
      </button>
    </div>
  </div>
</div>
    `
    )
    .join("");
}

// Function to add an item to the cart
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (product) {
    product.quantity = 1; // Initialize quantity to 1
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    showNotification(`1. ${product.name} has been added to your cart!`);
  }
}
// Popup u added a product to your cart
function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.remove("hidden");
  setTimeout(() => {
    notification.classList.add("hidden");
  }, 5000); // Hide after 5 seconds
}

// Function to calculate the discount based on quantity
function calculateDiscount(quantity, price) {
  let discountPercentage = 0;

  // Find the appropriate discount based on quantity
  for (let i = discountConfig.length - 1; i >= 0; i--) {
    if (quantity >= discountConfig[i].quantity) {
      discountPercentage = discountConfig[i].discount;
      break;
    }
  }

  return price * discountPercentage;
}




//
//
//
//
//
//
//
//
// Load cart items on the cart page
function loadCart() {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItems = document.getElementById("cart-items");

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
  } else {
    const totalPriceWithoutDelivery = cart.reduce((total, item) => {
      const discount = calculateDiscount(item.quantity || 1, item.price);
      return total + (item.price * (item.quantity || 1) - discount);
    }, 0);
    let totalPrice = totalPriceWithoutDelivery + delivery;

    cartItems.innerHTML =
      cart
        .map((item) => {
          const discount = calculateDiscount(item.quantity || 1, item.price);
          return `
            <div class="flex flex-col md:flex-row justify-between items-center border-b py-4 shadow-sm rounded-md">
              <div class="w-24 h-24 md:w-32 md:h-32">
                <img class="w-full h-full object-cover rounded-md" src="${
                  item.image
                }" alt="${item.name}" />
              </div>
              <div class="flex-1 px-4 mt-4">
                <h3 class="text-lg font-semibold text-gray-100">${
                  item.name
                } <span class="text-sm font-normal text-gray-400">(Quantity: ${
            item.quantity || 1
          })</span></h3>
                <p class="text-sm text-gray-300">Price: <span class="text-blue-100">BDT ${item.price.toFixed(
                  2
                )}</span></p>
                <p class="text-sm text-gray-300">Discount: <span class="text-green-400">BDT ${discount.toFixed(
                  2
                )}</span></p>
                <p class="text-sm text-gray-300">Delivery Fee: <span class="text-yellow-400">BDT ${delivery}</span></p>
              </div>
              <div class="flex flex-col mt-4 md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                <button onclick="addOneMore(${
                  item.id
                })" class="btn btn-outline btn-info btn-sm md:btn-md">+</button>
                <button onclick="removeFromCart(${
                  item.id
                })" class="btn btn-outline btn-error btn-sm md:btn-md">Remove</button>
              </div>
            </div>
          `;
        })
        .join("") +
      `
      <!-- Coupon Section -->
      <div id="coupon-section" class="mt-6">
        <input type="text" id="coupon-code" placeholder="Enter your coupon code" class="input input-bordered input-success w-full max-w-xs" />
        <button id="apply-coupon" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2">Apply Discount</button>
      </div>
      <!-- Total Price -->
      <p id="total-cost" class="font-bold text-lg mt-4">Total: BDT ${totalPrice.toFixed(
        2
      )} approx</p>
      `;

 const coupons = {
      WINNER10: 0.1,
      FLASHSALE25: 0.25,
      EXTRA30OFF: 0.3,
      SUPERDISCOUNT50: 0.5,
      MEGADEAL40: 0.4,
      QUICK5OFF: 0.05,
      COOLVIBES10: 0.1,
      LUCKYDAY20: 0.2,
      ZOOMDEAL30: 0.3,
      POWERUP60: 0.6,
      JUMPSTART70: 0.7,
      SMARTBUY80: 0.8,
      FREEDELIVERY100: 1.0,
      FASTTRACK35: 0.35,
      BIGSAVINGS45: 0.45,
      NEWUSER10: 0.1,
      RETURNING20: 0.2,
      WEEKENDSPECIAL25: 0.25,
      FESTIVEOFFER30: 0.3,
      BIRTHDAYGIFT50: 0.5,
      WHAT10: 0.1,
      YEAHS10: 0.1,
      OKAPIS20: 0.2,
      AAVE20: 0.2,
      MYFREEDEL: "free_delivery",
    };

    // Track used coupons
    const usedCoupons = JSON.parse(localStorage.getItem("usedCoupons")) || [];

    document.getElementById("apply-coupon").addEventListener("click", () => {
      const couponInput = document
        .getElementById("coupon-code")
        .value.trim()
        .toUpperCase();

      if (usedCoupons.includes(couponInput)) {
        alert("This coupon code has already been used! 😢");
        return;
      }

      const couponDiscount = coupons[couponInput];
      if (!couponDiscount) {
        alert("Invalid discount code 😢. Try again!");
        return;
      }

      let deliveryCost = delivery;
      let newTotalCost = totalPriceWithoutDelivery;

      if (couponDiscount === "free_delivery") {
        deliveryCost = 0;
        alert("🎉 Free delivery applied!");
      } else {
        const discountAmount = newTotalCost * couponDiscount;
        newTotalCost -= discountAmount;
        alert(
          `🎉 ${
            couponDiscount * 100
          }% discount applied! You saved BDT ${discountAmount.toFixed(2)}`
        );
      }

      // Add the coupon to used list
      usedCoupons.push(couponInput);
      localStorage.setItem("usedCoupons", JSON.stringify(usedCoupons));

      document.getElementById("total-cost").innerHTML = `Total: BDT ${(
        newTotalCost + deliveryCost
      ).toFixed(2)} approx`;
    });
  }
}

//
//
//
//
//
//





// Function to remove an item from the cart
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

// Function to add one more item to the cart
function addOneMore(productId) {
  const productInCart = cart.find((item) => item.id === productId);

  if (productInCart) {
    productInCart.quantity = (productInCart.quantity || 1) + 1;
  } else {
    const product = products.find((p) => p.id === productId);
    if (product) {
      product.quantity = 1;
      cart.push(product);
    }
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  // Create a div for the popup
  const popup = document.createElement("div");
  popup.className = "popup";
  popup.innerText = `Added one more ${
    productInCart ? productInCart.name : product.name
  } to your cart!`;

  // Add popup to the body
  document.body.appendChild(popup);

  // Style and animate the popup
  popup.style.position = "fixed";
  popup.style.top = "20px"; // Change this to top for top-right
  popup.style.right = "20px";
  popup.style.padding = "10px";
  popup.style.backgroundColor = "#000";
  popup.style.color = "#fff";
  popup.style.borderRadius = "16px";
  popup.style.border = "2px solid greenyellow";
  popup.style.zIndex = "1000";

  // Remove popup after 3 seconds
  setTimeout(() => {
    popup.remove();
  }, 3000);
  localStorage.setItem("cart", JSON.stringify(cart));

  loadCart();
}

if (document.getElementById("product-list")) {
  loadProducts();
}

if (document.getElementById("cart-items")) {
  loadCart();
}

// Checkout function
function checkout() {
  window.location.href = "checkout.html";
}

// Function to search products based on input
function searchProducts() {
  const searchInput = document.getElementById("search-bar").value.toLowerCase();
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchInput)
  );

  // Load the filtered products to the display
  loadFilteredProducts(filteredProducts);
}

// Function to load filtered products
function loadFilteredProducts(filteredProducts) {
  const productList = document.getElementById("product-list");
  productList.innerHTML =
    filteredProducts.length > 0
      ? filteredProducts
          .map(
            (product) => `
      <div
  id="ppd"
  class="card w-full bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl transition-transform transform hover:scale-105 hover:shadow-2xl rounded-xl overflow-hidden relative group"
>
  <figure class="overflow-hidden">
    <img
      src="${product.image}"
      alt="${product.name}"
      class="rounded-t-xl"
    />
  </figure>
  <div class="card-body p-6 bg-opacity-80 backdrop-blur-sm bg-gradient-to-b from-black via-gray-800 to-transparent">
    <h2 class="card-title text-3xl font-extrabold mb-3 group-hover:text-green-400 transition duration-200">
      ${product.name}
    </h2>
    <p class="text-sm text-gray-400 mb-4 line-clamp-3">
      ${product.description}
    </p>
    <p class="text-lg font-bold mb-4">
      Price: <span class="text-green-400">BDT ${product.price.toFixed(2)}</span>
    </p>
    <div class="card-actions mt-4 flex justify-between items-center">
      <button
        onclick="addToCart(${product.id})"
        class="btn bg-gradient-to-r from-green-500 to-green-700 text-black font-bold px-6 py-3 rounded-lg shadow-lg hover:from-green-700 hover:to-green-500 transition-all duration-300 transform hover:-translate-y-1 hover:scale-110"
      >
        Add to Cart
      </button>
    </div>
  </div>
</div>

    `
          )
          .join("")
      : "<p>No products found.</p>";
}

// Function to filter products by category
function filterProducts(categoryId) {
  let filteredProducts;

  if (categoryId === 1) {
    // Filter only manga products (IDs 1-10)
    filteredProducts = products.filter(
      (product) => product.id >= 1 && product.id <= 10
    );
  } else if (categoryId === 2) {
    // Filter only bookmark products (IDs 11 and 14)
    filteredProducts = products.filter(
      (product) => product.id >= 11 && product.id <= 14
    );
  } else if (categoryId === 3) {
    // Filter only bookmark products (IDs 15 and 18)
    filteredProducts = products.filter(
      (product) => product.id >= 15 && product.id <= 18
    );
  } else if (categoryId === 4) {
    // Filter only bookmark products (IDs 1.5 and 1.6)
    filteredProducts = products.filter(
      (product) => product.id >= 1.5 && product.id <= 1.9
    );
  } else {
    // Show all products for the "All Products" category
    filteredProducts = products;
  }

  loadFilteredProducts(filteredProducts);
}
