let selectedMethod = "Tunai";

const modal =
document.getElementById("paymentModal");

document
.getElementById("payBtn")
.addEventListener("click",openPaymentModal);

function openPaymentModal(){

if(cart.length===0) return;

const subtotal =
cart.reduce((sum,item)=>{

return sum + (item.price*item.qty);

},0);

const total =
subtotal + (subtotal*0.10);

document
.getElementById("modalTotal")
.innerText =
formatRupiah(total);

modal.style.display="flex";

calculateChange();
}

function closePaymentModal(){

modal.style.display="none";

}

document
.querySelectorAll(".method-btn")
.forEach(btn=>{

btn.addEventListener("click",()=>{

document
.querySelectorAll(".method-btn")
.forEach(b=>b.classList.remove("active"));

btn.classList.add("active");

selectedMethod =
btn.dataset.method;

});

});

function addMoney(amount){

document
.getElementById("cashInput")
.value = amount;

calculateChange();

}

document
.getElementById("cashInput")
.addEventListener("input",calculateChange);

function calculateChange(){

const subtotal =
cart.reduce((sum,item)=>{

return sum + (item.price*item.qty);

},0);

const total =
subtotal + subtotal*0.10;

const cash =
Number(
document.getElementById("cashInput").value
);

const change =
cash-total;

document
.getElementById("changeAmount")
.innerText =

change > 0
? formatRupiah(change)
: "Rp 0";

}

function processPayment(){

const subtotal =
cart.reduce((sum,item)=>{

return sum + (item.price*item.qty);

},0);

const total =
subtotal + subtotal*0.10;

const cash =
Number(
document.getElementById("cashInput").value
);

if(selectedMethod==="Tunai" && cash<total){

alert("Uang tidak cukup");

return;
}

const transactions =

JSON.parse(
localStorage.getItem("transactions")
) || [];

const now = new Date();

const transaction = {

id:
"INV-"+Date.now(),

date:
now.toLocaleString("id-ID"),

dateISO:
now.toISOString(),

customer:
document.getElementById("customerName").value.trim(),

method:
selectedMethod,

items:
cart.map(item => ({ ...item })),

subtotal,

tax:subtotal*0.10,

total

};

transactions.unshift(transaction);

localStorage.setItem(

"transactions",

JSON.stringify(transactions)

);

cart=[];

saveCart();

document.getElementById("customerName").value = "";
document.getElementById("cashInput").value = "";
document.getElementById("changeAmount").innerText = "Rp 0";

closePaymentModal();

alert("Pembayaran berhasil");

}