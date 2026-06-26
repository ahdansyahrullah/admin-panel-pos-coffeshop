const productTableBody = document.getElementById("productTableBody");
const searchProduct = document.getElementById("searchProduct");
const productCount = document.getElementById("productCount");
const emptyState = document.getElementById("emptyState");
const deleteModal = document.getElementById("deleteModal");
const deleteMessage = document.getElementById("deleteMessage");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const resetBtn = document.getElementById("resetBtn");

let currentProducts = getProducts();
let selectedDeleteId = null;

function formatRupiah(number){
  return "Rp " + Number(number || 0).toLocaleString("id-ID");
}

function escapeHtml(value){
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderProductTable(){
  const keyword = searchProduct.value.trim().toLowerCase();

  const filteredProducts = currentProducts.filter(product => {
    const haystack = `${product.name} ${product.category}`.toLowerCase();
    return haystack.includes(keyword);
  });

  productCount.innerText = `${filteredProducts.length} Produk`;
  emptyState.style.display = filteredProducts.length ? "none" : "block";

  productTableBody.innerHTML = filteredProducts.map(product => `
    <tr>
      <td>#${product.id}</td>
      <td>
        <div class="product-cell">
          <img 
  src="${product.image}" 
  alt="${product.name}"
  onerror="this.src='/admin-panel-pos-coffeshop/assets/img/Products/espresso.jpg'"
          >
          <div>
            <strong>${escapeHtml(product.name)}</strong><br>
            <small style="color:#667085;">Produk POS Coffee Shop</small>
          </div>
        </div>
      </td>
      <td><span class="badge">${escapeHtml(product.category)}</span></td>
      <td><strong>${formatRupiah(product.price)}</strong></td>
      <td>
        <div class="row-actions">
          <a class="btn btn-secondary" href="form.html?id=${product.id}">
            <i class="fa-regular fa-pen-to-square"></i> Edit
          </a>
          <button class="btn btn-outline-danger" type="button" onclick="openDeleteModal(${product.id})">
            <i class="fa-regular fa-trash-can"></i> Hapus
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

function openDeleteModal(productId){
  const product = currentProducts.find(item => item.id === Number(productId));
  if(!product) return;

  selectedDeleteId = Number(productId);
  deleteMessage.innerHTML = `Produk <strong>${escapeHtml(product.name)}</strong> akan dihapus dari data master dan tidak tampil lagi di halaman POS.`;
  deleteModal.style.display = "flex";
}

function closeDeleteModal(){
  selectedDeleteId = null;
  deleteModal.style.display = "none";
}

function deleteSelectedProduct(){
  if(selectedDeleteId === null) return;

  currentProducts = currentProducts.filter(product => product.id !== selectedDeleteId);
  setProducts(currentProducts);
  closeDeleteModal();
  renderProductTable();
}

searchProduct.addEventListener("input", renderProductTable);
cancelDeleteBtn.addEventListener("click", closeDeleteModal);
confirmDeleteBtn.addEventListener("click", deleteSelectedProduct);

deleteModal.addEventListener("click", event => {
  if(event.target === deleteModal){
    closeDeleteModal();
  }
});

resetBtn.addEventListener("click", () => {
  const isConfirmed = confirm("Reset data produk ke data awal?");
  if(!isConfirmed) return;

  currentProducts = resetProducts();
  renderProductTable();
});

renderProductTable();
