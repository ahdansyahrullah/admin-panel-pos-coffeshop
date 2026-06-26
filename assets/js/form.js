const productForm = document.getElementById("productForm");
const productName = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const productCategory = document.getElementById("productCategory");
const productImage = document.getElementById("productImage");
const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");

const previewImage = document.getElementById("previewImage");
const previewName = document.getElementById("previewName");
const previewCategory = document.getElementById("previewCategory");
const previewPrice = document.getElementById("previewPrice");

const PROJECT_BASE_PATH = "/admin-panel-pos-coffeshop/";
const PRODUCT_IMAGE_PATH = "assets/img/Products/";
const FALLBACK_IMAGE = PROJECT_BASE_PATH + PRODUCT_IMAGE_PATH + "espresso.jpg";

const params = new URLSearchParams(window.location.search);
const editId = Number(params.get("id"));
let currentProducts = getProducts();
let editedProduct = editId ? currentProducts.find(product => product.id === editId) : null;

function formatRupiah(number){
  return "Rp " + Number(number || 0).toLocaleString("id-ID");
}

function normalizeImagePath(value){
  let image = String(value || "").trim();

  if(!image){
    return "";
  }

  // Kalau pakai URL online, biarkan
  if(/^https?:\/\//i.test(image)){
    return image;
  }

  // Kalau sudah path absolut project, biarkan
  if(image.startsWith(PROJECT_BASE_PATH + PRODUCT_IMAGE_PATH)){
    return image;
  }

  // Kalau user isi: assets/img/Products/taro.jpg
  if(image.startsWith(PRODUCT_IMAGE_PATH)){
    return PROJECT_BASE_PATH + image;
  }

  // Kalau user isi: ./assets/img/Products/taro.jpg
  if(image.startsWith("./" + PRODUCT_IMAGE_PATH)){
    return PROJECT_BASE_PATH + image.replace("./", "");
  }

  // Kalau user isi: ../assets/img/Products/taro.jpg
  if(image.startsWith("../" + PRODUCT_IMAGE_PATH)){
    return PROJECT_BASE_PATH + image.replace("../", "");
  }

  return image;
}

function isValidImageValue(value){
  const image = String(value || "").trim();

  const isOnlineUrl = /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(image);

  const isLocalImage =
    image.startsWith(PROJECT_BASE_PATH + PRODUCT_IMAGE_PATH) ||
    image.startsWith(PRODUCT_IMAGE_PATH) ||
    image.startsWith("./" + PRODUCT_IMAGE_PATH) ||
    image.startsWith("../" + PRODUCT_IMAGE_PATH);

  const hasImageExtension = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(image.split("?")[0]);

  return (isOnlineUrl || isLocalImage) && hasImageExtension;
}

function setError(id, message){
  document.getElementById(id).innerText = message;
}

function clearErrors(){
  setError("nameError", "");
  setError("priceError", "");
  setError("categoryError", "");
  setError("imageError", "");
}

function validateForm(){
  clearErrors();
  let valid = true;

  if(productName.value.trim().length < 3){
    setError("nameError", "Nama produk minimal 3 karakter.");
    valid = false;
  }

  if(Number(productPrice.value) <= 0){
    setError("priceError", "Harga harus lebih dari 0.");
    valid = false;
  }

  if(!productCategory.value){
    setError("categoryError", "Kategori wajib dipilih.");
    valid = false;
  }

  if(!isValidImageValue(productImage.value.trim())){
    setError(
      "imageError",
      "Masukkan URL http/https atau path lokal seperti assets/img/Products/taro.jpg."
    );
    valid = false;
  }

  return valid;
}

function updatePreview(){
  previewName.innerText = productName.value.trim() || "Nama Produk";
  previewCategory.innerText = productCategory.value || "Kategori produk";
  previewPrice.innerText = formatRupiah(productPrice.value);

  if(isValidImageValue(productImage.value.trim())){
    previewImage.src = normalizeImagePath(productImage.value.trim());
  }else{
    previewImage.src = FALLBACK_IMAGE;
  }
}

function fillEditForm(){
  if(!editedProduct) return;

  formTitle.innerText = "Edit Produk";
  formSubtitle.innerText = `Ubah data produk #${editedProduct.id}.`;

  productName.value = editedProduct.name;
  productPrice.value = editedProduct.price;
  productCategory.value = editedProduct.category;
  productImage.value = editedProduct.image;

  updatePreview();
}

function saveProduct(event){
  event.preventDefault();

  if(!validateForm()) return;

  const productPayload = {
    id: editedProduct ? editedProduct.id : getNextProductId(currentProducts),
    name: productName.value.trim(),
    price: Number(productPrice.value),
    category: productCategory.value,
    image: normalizeImagePath(productImage.value.trim())
  };

  if(editedProduct){
    currentProducts = currentProducts.map(product => {
      return product.id === editedProduct.id ? productPayload : product;
    });
  }else{
    currentProducts.push(productPayload);
  }

  setProducts(currentProducts);

  alert("Data produk berhasil disimpan.");
  window.location.href = "data-master.html";
}

[productName, productPrice, productCategory, productImage].forEach(input => {
  input.addEventListener("input", updatePreview);
  input.addEventListener("change", updatePreview);
});

productForm.addEventListener("submit", saveProduct);

productForm.addEventListener("reset", () => {
  setTimeout(() => {
    clearErrors();
    updatePreview();
  }, 0);
});

previewImage.onerror = function(){
  this.src = FALLBACK_IMAGE;
};

fillEditForm();
updatePreview();