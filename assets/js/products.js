const PRODUCT_STORAGE_KEY = "posProducts";

const productSeed = [
  {
    id:1,
    name:"Espresso",
    price:25000,
    category:"Kopi",
    image:"/admin-panel-pos-coffeshop/assets/img/Products/espresso.jpg"
  },
  {
    id:2,
    name:"Cappuccino",
    price:35000,
    category:"Kopi",
    image:"/admin-panel-pos-coffeshop/assets/img/Products/cappucino.jpg"
  },
  {
    id:3,
    name:"Latte",
    price:35000,
    category:"Kopi",
    image:"/admin-panel-pos-coffeshop/assets/img/Products/latte.jpg"
  },
  {
    id:4,
    name:"Americano",
    price:30000,
    category:"Kopi",
    image:"/admin-panel-pos-coffeshop/assets/img/Products/americano.jpg"
  },
  {
    id:5,
    name:"Matcha Latte",
    price:38000,
    category:"Non-Kopi",
    image:"/admin-panel-pos-coffeshop/assets/img/Products/matcha.jpg"
  },
  {
    id:6,
    name:"Chocolate",
    price:35000,
    category:"Non-Kopi",
    image:"/admin-panel-pos-coffeshop/assets/img/Products/coklat.jpg"
  },
  {
    id:7,
    name:"Red Velvet",
    price:36000,
    category:"Non-Kopi",
    image:"/admin-panel-pos-coffeshop/assets/img/Products/red-velvet.jpg"
  },
  {
    id:8,
    name:"Croissant",
    price:28000,
    category:"Snack",
    image:"/admin-panel-pos-coffeshop/assets/img/Products/croissant.jpg"
  },
  {
    id:9,
    name:"Donut",
    price:18000,
    category:"Snack",
    image:"/admin-panel-pos-coffeshop/assets/img/Products/donut.jpg"
  },
  {
    id:10,
    name:"French Fries",
    price:25000,
    category:"Snack",
    image:"/admin-panel-pos-coffeshop/assets/img/Products/kentang.jpg"
  },
  {
    id:11,
    name:"Nasi Goreng",
    price:40000,
    category:"Makanan",
    image:"/admin-panel-pos-coffeshop/assets/img/Products/nasigoreng.jpg"
  },
  {
    id:12,
    name:"Chicken Katsu",
    price:45000,
    category:"Makanan",
    image:"/admin-panel-pos-coffeshop/assets/img/Products/katsu.jpg"
  }
];

function normalizeImagePath(image){
  let value = String(image || "").trim();

  if(!value){
    return "";
  }

  // Kalau gambar dari internet, biarkan
  if(value.startsWith("http://") || value.startsWith("https://")){
    return value;
  }

  // Kalau sudah absolut project, biarkan
  if(value.startsWith("/admin-panel-pos-coffeshop/assets/img/Products/")){
    return value;
  }

  // Kalau user isi: assets/img/Products/taro.jpg
  if(value.startsWith("assets/img/Products/")){
    return "/admin-panel-pos-coffeshop/" + value;
  }

  // Kalau user isi: ./assets/img/Products/taro.jpg
  if(value.startsWith("./assets/img/Products/")){
    return "/admin-panel-pos-coffeshop/" + value.replace("./", "");
  }

  // Kalau user isi dari halaman pages: ../assets/img/Products/taro.jpg
  if(value.startsWith("../assets/img/Products/")){
    return "/admin-panel-pos-coffeshop/" + value.replace("../", "");
  }

  return value;
}

function normalizeProduct(product){
  return {
    id:Number(product.id),
    name:String(product.name || "Produk Tanpa Nama").trim(),
    price:Number(product.price || 0),
    category:String(product.category || "Lainnya").trim(),
    image:normalizeImagePath(product.image)
  };
}

function getProducts(){
  const savedProducts = JSON.parse(localStorage.getItem(PRODUCT_STORAGE_KEY) || "null");

  if(Array.isArray(savedProducts) && savedProducts.length){
    return savedProducts.map(normalizeProduct);
  }

  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(productSeed));
  return productSeed.map(normalizeProduct);
}

function setProducts(nextProducts){
  const cleanProducts = (nextProducts || []).map(normalizeProduct);
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(cleanProducts));
  return cleanProducts;
}

function resetProducts(){
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(productSeed));
  return productSeed.map(normalizeProduct);
}

function getNextProductId(productList){
  const maxId = (productList || []).reduce((max,product) => {
    return Math.max(max, Number(product.id || 0));
  },0);

  return maxId + 1;
}

const products = getProducts();
