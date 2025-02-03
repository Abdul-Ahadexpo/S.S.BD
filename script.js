document.documentElement.setAttribute("data-theme", "dark");
let cart = [];

// Sample product data
const products = [
  // {
  //   id: 92.12,
  //   name: "280TK Beyblade X Mystery Box",
  //   description: "An exciting mystery box filled with Beyblade X surprises worth more than the price you pay!",
  //   price: 280,
  //   pcs: "∞",
  //   image: "https://thebeyverse.com/cdn/shop/products/6C495ED9-94FD-43FD-A2D2-1630AD50E3E8.jpg?v=1680825615",
  // },
   {
    id: 0.941,
    name: "Phoenix Rudder",
    description:
      "Phoenix Rudder 9-70G (フェニックスラダー9-70ナインセブンティーGグライド, Fenikkusu Radā Nain Sebuntī Guraido; Phoenix Rudder Nine Seventy Glide) is a Stamina Type Beyblade.",
    price: 460,
    pcs: 11,
    image:
      "https://th.bing.com/th/id/OIP.pk6blr69rhIm9_KKW6Tg-QAAAA?rs=1&pid=ImgDetMain",
  },
    {
    id: 0.17,
    name: "Silver Wolf",
    description:
      "<b>Silver Wolf </b> is a reference to Beyblades from Bakuten Shoot Beyblade, in this case being Wolborg. The Gear Chip has the Bakuten Shoot Beyblade logo on the wolf's ears..",
    price: 470,
    pcs: 7,
    image:
      "https://th.bing.com/th/id/OIP.EP4oWeNCoM2XVYiSiRvfjgHaHa?rs=1&pid=ImgDetMain",
  },

  {
    id: 0.819,
    name: "Leon Crest",
    description:
      "Leon Crest 7-60GN (レオンクレスト7-60 (セブンシクスティー)GN (ギヤニードル), Reon Kuresuto Sebun Shikusutī Giya Nīdoru; Leon Crest Seven Sixty Gear Needle) is a Defense Type Beyblade.",
    price: 480,
    pcs: 11,
    image:
      "https://th.bing.com/th/id/OIP.lnyewdWH41kt0n1521GDtgHaGe?rs=1&pid=ImgDetMain",
  },

  {
    id: 1,
    name: "Phoenix Wing 9-60GF (Pre-Order)",
    description: `Soar Phoenix (Japanese: PhoenixWing) is a three-sided Attack Type Blade with three blades acting as the main contact points.`,
    price: 450,
    pcs: 4,
    image:
      "https://th.bing.com/th/id/OIP.7Vlwn3_Ru7iwhjRfTEPWIAHaGg?rs=1&pid=ImgDetMai",
  },


 {
    id: 0.172,
    name: "Shinobi Shadow",
    description:
      "<b>Shinobi Shadow</b> is a Shitty Beyblade...",
    price: 420,
    pcs: 6,
    image:
      "https://th.bing.com/th/id/OIP.qsOanWmIlc24rOmGhG6ZaAAAAA?rs=1&pid=ImgDetMain",
  },

  
 
  {
    id: 2.1,
    name: "BX-34 Cobalt Dragoon 2-60C",
    description:
      "Cobalt Dragoon is a left-spin four-sided Attack Type Blade with four upward slanting blades acting as the main contact points.",
    price: 400,
    pcs: 3,
    image:
      "https://i5.walmartimages.com/asr/19cc5349-bd73-4c38-ae26-24d153f35867.d2b63e51ab81b07745964587525dcfde.jpeg?odnHeight=117&odnWidth=117&odnBg=FFFFFF",
  },
  {
    id: 2.31,
    name: "SB Brand Bey X Left String Launcher (Pre-Order)",
    description:
      "Models: String launcher<br>Brand: SB brand <br> Package include: Launcher only",
    price: 400,
    pcs: 8,
    image:
      "https://ae01.alicdn.com/kf/S287b82f604874630a3ceb08de1a04111M/SB-Brand-Bey-X-Left-String-Launcher-BX-Spinning-Tops-Toys-Gift-for-Children.jpg_640x640.jpg",
  },
  {
    id: 2.4,
    name: "Weiss Tiger 3-60U",
    description:
      "<b>Weiss Tiger</b> is a Balance Type Blade with three different sets of three types of blades. The three types of blades are the Attack Type <b>Upper Blades</b>, the Defense Type Damper Blades, and the Stamina Type <b>Smash Blades</b>.",
    price: 400,
    pcs: 1,
    image:
      "https://th.bing.com/th/id/OIP.LX-pjn8-PzrjcHWl_QSipwHaG9?rs=1&pid=ImgDetMain",
  },
  {
    id: 2.36,
    name: "Shark Edge 3-60LF(Pre-Order)",
    description:
      "Shark Edge Three Sixty Low Flat) is an Attack Type Beyblade released by Takara Tomy. It was released in Japan on September 9th, 2023 for 1400円 as the prize Beyblade in Random Booster Vol. 1.",
    price: 450,
    pcs: 0,
    image:
      "https://beyblade-shop.com/cdn/shop/files/Shark-Edge-3-60LF-Beyblade-Shop_1200x1200.jpg?v=1692305996",
  },
  {
    id: 2.2,
    name: "Black Shell 4-60D",
    description:
      "Black Shell is a Defense Type Blade with an overall diamond shape with eight protrusions as the main points of contact.",
    price: 400,
    pcs: 1,
    image:
      "https://beybladepremier.com/cdn/shop/files/BX-3501BlackShell4-60D_BeybladeX_BACKORDERJuly31st.jpg?v=1721582044",
  },


  {
    id: 2,
    name: "UX Bey Hells Hammer 3-70H  (Pre-Order)",
    description:
      "Hells Hammer is a right-spin Balance Type Blade with three <b>Smash Blades</b> acting as the main contact points.",
    price: 450,
    pcs: 0,
    image:
      "https://cdn11.bigcommerce.com/s-lsouzjo20i/images/stencil/1280x1280/products/2512/5372/Beyblade_UX-02_03__11434.1708526001.jpg?c=2",
  },
  {
    id: 2.3,
    name: "Cobalt Drake 4-60T",
    description:
      "Cobalt Drake is a four-sided Attack Type Blade with four upward slanting blades acting as the main contact points. The blades are similar to those of Dran Sword, albeit smaller in size.",
    price: 450,
    pcs: 1,
    image:
      "https://th.bing.com/th/id/OIP._db41qhqY7Cj6M-cQLflwQHaHa?rs=1&pid=ImgDetMain",
  },

  {
    id: 3,
    name: "X Bey Unicorn Sting 5-60GP(Pre-Order)",
    description:
      "Sting Unicorn (Japanese: UnicornSting) is a Balance Type Blade with an asymmetrical shape.",
    price: 400,
    pcs: 0,
    image:
      "https://th.bing.com/th/id/OIP.JfM8kxGWhTDQLyFToWd9mAHaHa?rs=1&pid=ImgDetMain",
  },
  {
    id: 4,
    name: "Hells Chain 5-60HT (BX-21)(Black)",
    description:
      "A Balance Type Beyblade. <br>Successor to Hells Scythe 4-60T<br><i>It will take 15-25 days<br> to be delivered</i>",
    price: 400,
    pcs: 1,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5I8U5CrQj4dMH-N8XT2DNaR1gZx35mGCaotYm2YMG1h9eSpdliY1gt-lgZZJrLsY3_lg&usqp=CAU",
  },
  {
    id: 9,
    name: "Dran Dagger 4-60R (Pre-Order)",
    description:
      "Dagger Dran (Japanese: DranDagger) is an Attack Type Blade with six small blades acting as the main contact points.",
    price: 400,
    pcs: 0,
    image:
      "https://th.bing.com/th/id/OIP.AVUEtziRnBOUYX7G-teWbQHaHu?rs=1&pid=ImgDetMain",
  },
  {
    id: 5,
    name: "BX-08 Wizard Arrow 4-80B(Yellow)",
    description:
      "Arrow Wizard (Japanese: WizardArrow) is a round Stamina Type Blade with two large blades acting as the main contact points.",
    price: 300,
    pcs: 1,
    image:
      "https://img4.dhresource.com/webp/m/0x0/f3/albu/km/o/14/e42c932b-7a4c-4bd7-b639-55b94642ac3d.jpg",
  },
  {
    id: 6,
    name: "UX-03 Booster Wizard Rod 5-70DB(pre-order)",
    description:
      "Wizard Rod is a Stamina Type Blade with a wide circular shape.",
    price: 450,
    pcs: 0,
    image:
      "https://th.bing.com/th/id/OIP.TiyXAebWm4JEOPMxDXE6WwHaHa?rs=1&pid=ImgDetMain",
  },
  // Original TT
  {
    id: 1.5,
    name: "BX-01 STARTER DRAN SWORD 3-60F",
    description: `Dran Sword Three Sixty Flat) is an Attack Type Beyblade released by Takara Tomy. It was released as a Starter in Japan on June 10th, 2023 during the CoroCoro Spirit Festival for 1980円.`,
    price: 1700,
    pcs: "Pre-order",
    image: "https://opensesame.com.bd/wp-content/uploads/2024/08/910381-4.jpg",
  },
  {
    id: 1.6,
    name: "BX-02 STARTER HELLS SCYTHE 4-60T",
    description: `Hells Scythe Four Sixty Taper) is a Balance Type Beyblade released by Takara Tomy. It was released as a Starter in Japan on June 10th, 2023 during the CoroCoro Spirit Festival for 1980円.`,
    price: 1700,
    pcs: "Pre-order",
    image: "https://opensesame.com.bd/wp-content/uploads/2024/08/910398-4.jpg",
  },

  {
    id: 1.6,
    name: "BX-03 STARTER WIZARD ARROW 4-80B",
    description: `Wizard Arrow Four Eighty Ball) is a Stamina Type Beyblade released by Takara Tomy. It was released as a Starter in Japan on July 15th, 2023 for 1980円.`,
    price: 1700,
    pcs: "Pre-order",
    image: "https://opensesame.com.bd/wp-content/uploads/2024/08/910473-4.jpg",
  },

  {
    id: 1.5,
    name: "Takara Tomy Beyblade X Random Booster (Pre-Order)",
    description: `Original Random Booster Vol. 4 BX-35. <br>
  <i>It will take 15-25 days<br> to be delivered</i>`,
    price: 1480,
    pcs: "Pre-order",
    image:
      "https://th.bing.com/th/id/OIP.7ncb8aYMnFMRJFi-SS3bTQHaHa?rs=1&pid=ImgDetMain",
  },
  {
    id: 1.6,
    name: "Takara Tomy UX-08 Silver Wolf (Pre-Order)",
    description: `Original UX-08 Silver Wolf 3-80FB. <br>
  <i>It will take 15-25 days<br> to be delivered</i>`,
    price: 4000,
    pcs: "Pre-order",
    image:
      "https://media3.nin-nin-game.com/464324/beyblade-x-ux-08-starter-silver-wolf-3-80fb-takara-tomy-.jpg",
  },

  {
    id: 1.7,
    name: "Takara Tomy Random Booster Shinobi Shadow Select (Pre-Order)",
    description: `Original UX-05 Random Booster. <br>
  <i>It will take 15-25 days<br> to be delivered</i>`,
    price: 1480,
    pcs: "Pre-order",
    image:
      "https://malloftoys.com/cdn/shop/files/TakaraTomyBeybladeXUX-05RandomBoosterShinobiShadow.webp?v=1713220230g",
  },

  {
    id: 1.8,
    name: "Takara Tomy BX-33 Weiss Tiger <I>With launcher</i> (Pre-Order)",
    description: `Original UX-33 Beyblade X Booster Weiss Tiger 3-60U. <br>
  <i>It will take 15-25 days<br> to be delivered</i>`,
    price: 2900,
    pcs: "Pre-order",
    image:
      "https://th.bing.com/th/id/OIP.iDwuU32BFuQq98OZXQmjbgHaHa?w=1280&h=1280&rs=1&pid=ImgDetMain",
  },
  {
    id: 1.9,
    name: "Takara Tomy Xtreme Stadium (Pre-Order)",
    description: `Original BX-10 Xtreme Stadium. <br>
  <i>It will take 15-25 days<br> to be delivered</i>`,
    price: 3800,
    pcs: "Pre-order",
    image: "https://opensesame.com.bd/wp-content/uploads/2024/08/910596-2.jpg",
  },

  // Original TT Ends

  {
    id: 7,
    name: "BX-18 X String Launcher (Pre-order)",
    description: "Pre-order, It will take 15-25 days to be delivered",
    price: 400,
    pcs: "Pre-order",
    image:
      "https://th.bing.com/th/id/OIP.pRZBwx1ca5dpY_2YPF79jwHaHa?w=1200&h=1200&rs=1&pid=ImgDetMain",
  },
  {
    id: 8,
    name: "BX-00 X Ripcord-Launcher (Pre-order)",
    description: "Pre-order, It will take 15-25 days to be delivered",
    price: 300,
    pcs: "Pre-order",
    image:
      "https://takaratomyasia.com/img/product/910398/product-910398-A02.jpg?20230724_091221",
  },

  {
    id: 10,
    name: "Beyblade X Launcher Grip",
    description:
      "The Launcher Grip (ランチャーグリップ, Ranchā Gurippu) is an Accessory released as part of the Beyblade X series. It was released in Japan on July 15th, 2023 for 700円.",
    price: 200,
    pcs: "Out of Stock",
    image:
      "https://beybladepremier.com/cdn/shop/files/TAKARATOMYBeybladeXLauncherGripBX-11er.jpg?height=940&v=1684358727",
  },

  {
    id: 11.2,
    name: "Xiphoid Xcalibur(pre-order)",
    description:
      " Xcalibur is a right-spin DB Core that features a large sword, representing the DB Core's namesake; Excalibur, the legendary sword of King Arthur.",
    price: 520,
    pcs: "2",
    image:
      "https://th.bing.com/th/id/R.3c496bbaeac5d4e1e695c24b5cd4fb01?rik=2Dlt2AU3yYDN8Q&pid=ImgRaw&r=0",
  },
  {
    id: 11.6,
    name: "Wind Knight Moon Bounce-6(pre-order)",
    description:
      "Knight is a right-spin DB Core that features the helmet of a knight, akin to its predecessor, the Air Knight Cho-Z Layer.",
    price: 520,
    pcs: "1",
    image:
      "https://th.bing.com/th/id/R.8cb4f3687991c2262a6384ef6cfd5e89?rik=UQbsuD%2fCGVomTQ&pid=ImgRaw&r=0",
  },
  {
    id: 11,
    name: "Gatling Dragon(pre-order)",
    description: "Flame brand Gatling Dragon Rapid Charge' Metal-10",
    price: 520,
    pcs: "4",
    image:
      "https://th.bing.com/th/id/OIP.Qd6oZIu2UZ2JyDl8OKXDuAHaHa?rs=1&pid=ImgDetMain",
  },

  {
    id: 12,
    name: "Imperial Dragon(pre-order)",
    description: "Flame brand Imperial Dragon Ignition'",
    price: 500,
    image:
      "https://vignette.wikia.nocookie.net/beyblade/images/2/2c/Imperial_Dragon_Bey.jpg/revision/latest?cb=20191015123208",
  },
  {
    id: 13,
    name: "Ultimate Valkyrie(pre-order)",
    description: "Flame brand Ultimate Valkyrie Legacy Variable'-9",
    price: 500,
    pcs: "3",
    image:
      "https://th.bing.com/th/id/OIP._makEXYOpLStcyVIRfj61wHaHa?rs=1&pid=ImgDetMain",
  },
  {
    id: 13.5,
    name: "Vanish Fafnir(pre-order)",
    description: "Full rubber Vanish Fafnir Tapered Kick-3",
    price: 500,
    pcs: "2",
    image:
      "https://th.bing.com/th/id/OIP.nx0indHJS37xKmwlMftJKAHaHa?rs=1&pid=ImgDetMain",
  },

  {
    id: 14,
    name: "Burst Stadium SB Brand",
    description: "SB Brand Stadium",
    price: 2280,
    pcs: "Pre-order",
    image:
      "https://ae-pic-a1.aliexpress-media.com/kf/H0b6d5eeee5bc4bf7bc1d68e8eedc50bda.jpg_640x640.jpg_.webp",
  },

  {
    id: 15,
    name: "L-Drago Destructor",
    description: "L-Drago Destructor F:S. A Metal Fight Bey",
    price: 350,
    pcs: 3,
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
      Price: <span class="text-green-400"> ${product.price.toFixed(2)}TK</span>
    </p>

    <p class="font-thin mb-0 text-gray-400">
    Stock: <i><span class="text-gray-400">${product.pcs}</span>.</i>
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

function showNotification(message) {
  Swal.fire({
    title: "Notification",
    text: message,
    icon: "success",
    showCancelButton: true,
    confirmButtonText: "OK",
    cancelButtonText: "View Cart",
    timer: 3000,
    timerProgressBar: true,
  }).then((result) => {
    if (result.dismiss === Swal.DismissReason.cancel) {
      window.location.href = "cart.html"; // Redirect to cart page
    }
  });
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
             <div class="flex flex-col md:flex-row justify-between items-center border-b py-4 shadow-lg rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div class="w-24 h-24 md:w-32 md:h-32 overflow-hidden rounded-lg">
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


            <p class="text-sm font-normal mb-0 text-gray-300">
    Stock: <i><span class="text-red-100">${item.pcs}</span>.</i>
    </p>
                <p class="text-sm text-gray-300">Price: <span class="text-blue-100"> ${item.price.toFixed(
                  2
                )}TK</span></p>
                <p class="text-sm text-gray-300">Discount: <span class="text-green-400"> ${discount.toFixed(
                  2
                )}TK</span></p>
                <p class="text-sm text-gray-300">Delivery Fee: <span class="text-yellow-400"> ${delivery}TK</span></p>
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
<div id="coupon-section" class="mt-6 bg-gradient-to-r from-pink-200 to-blue-200 p-6 rounded-xl shadow-lg flex flex-col items-center space-y-4">
  <input 
    type="text" 
    id="coupon-code" 
    placeholder="Enter your coupon code..." 
    class="input input-bordered input-success w-full max-w-xs text-center text-pink-700 bg-white focus:outline-none focus:ring-4 focus:ring-blue-300" 
  />
  <button 
    id="apply-coupon" 
    class="btn btn-info w-full max-w-xs hover:bg-blue-700 transition-colors duration-300"
  >
    Apply Discount
  </button>
</div>


      <!-- Total Price -->
      <p id="total-cost" class="font-bold text-lg mt-4">Total: ${totalPrice.toFixed(
        2
      )}TK approx</p>
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
        Swal.fire({
          icon: "warning",
          title: "Oops!",
          text: "This coupon code has already been used! 😢",
          confirmButtonColor: "#f87171", // Tailwind pink-400
        });
        return;
      }

      const couponDiscount = coupons[couponInput];
      if (!couponDiscount) {
        Swal.fire({
          icon: "error",
          title: "Invalid Code!",
          text: "Invalid discount code 😢. Try again!",
          confirmButtonColor: "#f87171",
        });
        return;
      }

      let deliveryCost = delivery;
      let newTotalCost = totalPriceWithoutDelivery;

      if (couponDiscount === "free_delivery") {
        deliveryCost = 0;
        Swal.fire({
          icon: "success",
          title: "Free Delivery!",
          text: "🎉 Free delivery applied!",
          confirmButtonColor: "#34d399", // Tailwind green-400
        });
      } else {
        const discountAmount = newTotalCost * couponDiscount;
        newTotalCost -= discountAmount;
        Swal.fire({
          icon: "success",
          title: "Discount Applied!",
          html: `🎉 ${
            couponDiscount * 100
          }% discount applied!<br>You saved <strong>${discountAmount.toFixed(
            2
          )}TK</strong>.<br><br>Please <strong>You must</strong> use it in Checkout 🛒`,
          confirmButtonColor: "#60a5fa", // Tailwind blue-400
        });
      }

      // Add the coupon to used list
      // Add the coupon to used list
      // Add the coupon to used list
      // Add the coupon to used list
      usedCoupons.push(couponInput);
      localStorage.setItem("usedCoupons", JSON.stringify(usedCoupons));

      document.getElementById("total-cost").innerHTML = `Total: ${(
        newTotalCost + deliveryCost
      ).toFixed(2)}TK approx`;
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
  const product = cart.find((item) => item.id === productId); // Find the product to remove
  cart = cart.filter((item) => item.id !== productId); // Remove the product from the cart
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  showRemovalNotification(product);
}

// Function to show the removal notification with an "Add More Items" button
function showRemovalNotification(product) {
  Swal.fire({
    title: "Item Removed",
    text: `${product.name} has been removed from your cart.`,
    icon: "error",
    showCancelButton: true,
    cancelButtonText: "Add More Items",
    confirmButtonText: "OK",
    timer: 3000,
    timerProgressBar: true,
  }).then((result) => {
    if (result.isDismissed) {
      // Redirect to the product page or home page to add more items
      window.location.href = "./index.html"; // You can change this URL as per your site's structure
    }
  });
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
    <h2 class="card-title text-3xl font-extrabold mb-3 group-hover:text-green-400 transition duration-200 max-h-[30px]">
      ${product.name}
    </h2>
    <p class="text-sm text-gray-400 mb-4 line-clamp-3">
      ${product.description}
    </p>
    <p class="text-lg font-bold mb-4">
      Price: <span class="text-green-400"> ${product.price.toFixed(2)}TK</span>
    </p>


  <p class="font-thin mb-0 text-gray-400">
    Stock: <i><span class="text-gray-400">${product.pcs}</span>.</i>
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
