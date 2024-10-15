let cart = [];

// Sample product data
const products = [
  {
    id: 1,
    name: "Phoenix Wing 9-60GF",
    description: "Best Attack X Beyblade",
    price: 450,
    image:
      "https://th.bing.com/th/id/OIP.7Vlwn3_Ru7iwhjRfTEPWIAHaGg?rs=1&pid=ImgDetMai",
  },

  {
    id: 2,
    name: "UX Bey Hells Hammer 3-70H",
    description: "Heard hitting X Bey",
    price: 450,
    image:
      "https://cdn11.bigcommerce.com/s-lsouzjo20i/images/stencil/1280x1280/products/2512/5372/Beyblade_UX-02_03__11434.1708526001.jpg?c=2",
  },

  {
    id: 3,
    name: "X Bey Unicorn Sting 5-60GP",
    description: "",
    price: 400,
    image:
      "https://th.bing.com/th/id/OIP.JfM8kxGWhTDQLyFToWd9mAHaHa?rs=1&pid=ImgDetMain",
  },
  {
    id: 4,
    name: "Hells Chain 5-60HT (BX-21)",
    description: "",
    price: 400,
    image:
      "https://cdn11.bigcommerce.com/s-iodt3qca/images/stencil/1280x1280/products/2127/9339/BX-21-HC-TT_copy__53930.1700174025.jpg?c=2",
  },
  {
    id: 5,
    name: "BX-08 Wizard Arrow 4-80B(Yellow)",
    description: "",
    price: 300,
    image:
      "https://img4.dhresource.com/webp/m/0x0/f3/albu/km/o/14/e42c932b-7a4c-4bd7-b639-55b94642ac3d.jpg",
  },
  {
    id: 6,
    name: "UX-03 Booster Wizard Rod 5-70DB",
    description: "",
    price: 450,
    image:
      "https://toysonejapan.com/cdn/shop/files/s-l1600_4_9bc991d6-8200-4b36-93a8-52e9abc499fe_1059x959.jpg?v=1711513033",
  },
  {
    id: 7,
    name: "BX-18 X String Launcher",
    description: "",
    price: 400,
    image:
      "https://th.bing.com/th/id/OIP.pRZBwx1ca5dpY_2YPF79jwHaHa?w=1200&h=1200&rs=1&pid=ImgDetMain",
  },
  {
    id: 8,
    name: "BX-00 X Ripcord-Launcher",
    description: "",
    price: 250,
    image:
      "https://takaratomyasia.com/img/product/910398/product-910398-A02.jpg?20230724_091221",
  },
  {
    id: 9,
    name: "Bey logger (BX-09)",
    description: "A Beyblade Accessory. It also can be used as a launcher Grip",
    price: 250,
    image:
      "https://th.bing.com/th/id/OIP.9Vv5ethvnFQkhAq5IpnJVQHaHa?w=800&h=800&rs=1&pid=ImgDetMain",
  },

  {
    id: 10,
    name: "Beyblade X Launcher Grip",
    description: "A Beyblade X Accessory. It's a launcher Grip",
    price: 100,
    image:
      "https://scontent.fdac138-2.fna.fbcdn.net/v/t1.15752-9/462639111_1931297604016044_2676344296671439481_n.png?_nc_cat=105&ccb=1-7&_nc_sid=9f807c&_nc_ohc=WygLdblYY4EQ7kNvgEZb8C1&_nc_zt=23&_nc_ht=scontent.fdac138-2.fna&_nc_gid=AxOm45Q447snH4xCVCOBrAh&oh=03_Q7cD1QHViB2AdRuFGmSZ7j70dGbzBGWKkQD96H34ITe5Eqhhuw&oe=67361065",
  },
];

// Delivery Fee
const delivery = 120;

// Discount configuration
const discountConfig = [
  { quantity: 3, discount: 1 },
  { quantity: 6, discount: 2 },
  { quantity: 8, discount: 3 },
  { quantity: 10, discount: 4 },
  { quantity: 30, discount: 10 },
];

// Load products
function loadProducts() {
  const productList = document.getElementById("product-list");
  productList.innerHTML = products
    .map(
      (product) => `
        <div class="card bg-base-100 shadow-xl">
            <figure><img src="${product.image}" alt="${
        product.name
      }" /></figure>
            <div class="card-body">
                <h2 class="card-title">${product.name}</h2>
                <p>${product.description}</p>
                <p class="font-bold">Price: BDT ${product.price.toFixed(2)}</p>
                <div class="card-actions justify-end">
                    <button onclick="addToCart(${
                      product.id
                    })" class="btn btn-primary">Add to Cart</button>
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
    alert(`${product.name} has been added to your cart!`);
  }
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

// Load cart items on the cart page
function loadCart() {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItems = document.getElementById("cart-items");

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
  } else {
    const totalItems = cart.reduce(
      (total, item) => total + (item.quantity || 1),
      0
    );
    const totalPriceWithoutDelivery = cart.reduce((total, item) => {
      const discount = calculateDiscount(item.quantity || 1, item.price);
      return total + (item.price * (item.quantity || 1) - discount);
    }, 0);
    const totalPrice = totalPriceWithoutDelivery + delivery;

    cartItems.innerHTML =
      cart
        .map((item) => {
          const discount = calculateDiscount(item.quantity || 1, item.price);
          return `
            <div class="flex justify-between items-center border-b py-2">
                <div>
                    <h3>${item.name} (Quantity: ${item.quantity || 1})</h3>
                    <p>Price: BDT ${item.price.toFixed(2)}</p>
                    <p>Discount: BDT ${discount.toFixed(2)}</p>
                    <p>Delivery Fee: BDT ${delivery} (All Over BD)</p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="addOneMore(${
                      item.id
                    })" class="btn btn-primary">+</button>
                    <button onclick="removeFromCart(${
                      item.id
                    })" class="btn btn-secondary">Remove</button>
                </div>
            </div>
        `;
        })
        .join("") +
      `<p class="font-bold">Total: BDT ${totalPrice.toFixed(2)} approx </p>`;
  }
}

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
  alert(
    `Added one more of ${
      productInCart ? productInCart.name : product.name
    } to your cart!`
  );

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
        <div class="card bg-base-100 shadow-xl">
            <figure><img src="${product.image}" alt="${
              product.name
            }" /></figure>
            <div class="card-body">
                <h2 class="card-title">${product.name}</h2>
                <p>${product.description}</p>
                <p class="font-bold">Price: BDT ${product.price.toFixed(2)}</p>
                <div class="card-actions justify-end">
                    <button onclick="addToCart(${
                      product.id
                    })" class="btn btn-primary">Add to Cart</button>
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
    // Filter only bookmark products (IDs 11 and 12)
    filteredProducts = products.filter(
      (product) => product.id >= 11 && product.id <= 30
    );
  } else {
    // Show all products for the "All Products" category
    filteredProducts = products;
  }

  loadFilteredProducts(filteredProducts);
}
