const productGrid =
document.getElementById("productGrid");

let cart =
JSON.parse(localStorage.getItem("cart")) || [];

function formatRupiah(number){

return "Rp " +
number.toLocaleString("id-ID");

}

function renderProducts(list = products){

productGrid.innerHTML="";

list.forEach(product=>{

productGrid.innerHTML += `

<div class="product-card">

<img 
  src="${product.image}" 
  alt="${product.name}"
  onerror="this.src='/admin-panel-pos-coffeshop/assets/img/Products/espresso.jpg'"
>

<div class="product-info">

<div class="product-name">
${product.name}
</div>

<div class="product-bottom">

<div class="price">
${formatRupiah(product.price)}
</div>

<button
class="add-btn"
onclick="addToCart(${product.id})">
+
</button>

</div>

</div>

</div>

`;

});

}

// INITIAL LOAD
document.addEventListener("DOMContentLoaded", () => {

  // Aktifkan kategori Semua
  document.querySelectorAll(".category")
    .forEach(btn => btn.classList.remove("active"));

  document.querySelector(".category")
    .classList.add("active");

  // Tampilkan seluruh produk
  renderProducts(products);

  // Load cart dari LocalStorage
  renderCart();

});

function addToCart(id){

const product =
products.find(p=>p.id===id);

const item =
cart.find(i=>i.id===id);

if(item){

item.qty++;

}else{

cart.push({
...product,
qty:1
});

}

saveCart();

}

function saveCart(){

localStorage.setItem(
"cart",
JSON.stringify(cart)
);

renderCart();

}

function renderCart(){

const cartItems =
document.getElementById("cartItems");

const count =
document.getElementById("cartCount");
const clearBtn =
document.getElementById("clearCartBtn");

if(cart.length===0){
    clearBtn.style.display = "none";

cartItems.innerHTML=`

<div class="empty-cart">

<i class="fa-solid fa-cart-shopping"></i>

<p>Keranjang masih kosong</p>

</div>

`;

count.innerText="0 item";

updateSummary();

return;
}

clearBtn.style.display = "block";

count.innerText =
cart.length+" item";

cartItems.innerHTML="";

cart.forEach(item=>{

cartItems.innerHTML += `

<div class="cart-item">

<img src="${item.image}">

<div class="cart-info">

<div class="cart-name">
${item.name}
</div>

<div class="cart-price">
${formatRupiah(item.price)}
</div>

<div class="qty-control">

<button
class="qty-btn"
onclick="changeQty(${item.id},-1)">
-
</button>

<span>${item.qty}</span>

<button
class="qty-btn"
onclick="changeQty(${item.id},1)">
+
</button>

<i
class="fa-solid fa-trash delete-btn"
onclick="removeItem(${item.id})">
</i>

</div>

</div>

</div>

`;

});



updateSummary();

}

function changeQty(id,value){

const item =
cart.find(i=>i.id===id);

item.qty += value;

if(item.qty<=0){

cart =
cart.filter(i=>i.id!==id);

}

saveCart();

}

function removeItem(id){

cart =
cart.filter(i=>i.id!==id);

saveCart();

}

function clearCart(){

cart=[];

saveCart();

}

function updateSummary(){

const subtotal =
cart.reduce((sum,item)=>{

return sum +
(item.price * item.qty);

},0);

const tax =
subtotal * 0.10;

const total =
subtotal + tax;

document.getElementById(
"subtotal"
).innerText =
formatRupiah(subtotal);

document.getElementById(
"tax"
).innerText =
formatRupiah(tax);

document.getElementById(
"total"
).innerText =
formatRupiah(total);

const payBtn =
document.getElementById(
"payBtn"
);

payBtn.disabled =
cart.length===0;

payBtn.style.background =
cart.length
? "#004D40"
: "#d1d5db";

}

const categories =
document.querySelectorAll(".category");

categories.forEach(btn=>{

btn.addEventListener("click",()=>{

categories.forEach(c=>
c.classList.remove("active")
);

btn.classList.add("active");

const category =
btn.innerText;

if(category==="Semua"){

renderProducts(products);

}else{

renderProducts(

products.filter(p=>
p.category===category
)

);

}

});

});