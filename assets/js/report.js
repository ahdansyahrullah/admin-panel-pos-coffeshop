const reportRevenueEl = document.getElementById("reportRevenue");
const reportOrdersEl = document.getElementById("reportOrders");
const reportAverageEl = document.getElementById("reportAverage");

const productEmpty = document.getElementById("productEmpty");
const categoryEmpty = document.getElementById("categoryEmpty");
const paymentEmpty = document.getElementById("paymentEmpty");
const transactionDetailBox = document.getElementById("transactionDetailBox");
const filterTabs = document.getElementById("filterTabs");
const printBtn = document.getElementById("printBtn");
const exportBtn = document.getElementById("exportBtn");

let activePeriod = "today";
let currentTransactions = [];
let productChart = null;
let categoryChart = null;
let paymentChart = null;

function formatRupiah(number){
  return "Rp " + Number(number || 0).toLocaleString("id-ID");
}

function getTransactions(){
  return JSON.parse(localStorage.getItem("transactions")) || [];
}

function getTransactionDate(transaction){
  if(transaction.dateISO){
    const isoDate = new Date(transaction.dateISO);
    if(!Number.isNaN(isoDate.getTime())) return isoDate;
  }

  if(transaction.id && String(transaction.id).startsWith("INV-")){
    const timestamp = Number(String(transaction.id).replace("INV-", ""));
    if(!Number.isNaN(timestamp)) return new Date(timestamp);
  }

  if(transaction.date){
    const directDate = new Date(transaction.date);
    if(!Number.isNaN(directDate.getTime())) return directDate;

    const dateOnly = String(transaction.date).split(",")[0].trim();
    const parts = dateOnly.split(/[\/\-.]/).map(Number);

    if(parts.length >= 3){
      const [day, month, year] = parts;
      const parsed = new Date(year, month - 1, day);
      if(!Number.isNaN(parsed.getTime())) return parsed;
    }
  }

  return null;
}

function startOfDay(date){
  const result = new Date(date);
  result.setHours(0,0,0,0);
  return result;
}

function filterByPeriod(transactions, period){
  if(period === "all") return transactions;

  const today = startOfDay(new Date());
  const startDate = new Date(today);

  if(period === "today"){
    startDate.setDate(today.getDate());
  }

  if(period === "7days"){
    startDate.setDate(today.getDate() - 6);
  }

  if(period === "30days"){
    startDate.setDate(today.getDate() - 29);
  }

  return transactions.filter(transaction => {
    const transactionDate = getTransactionDate(transaction);
    if(!transactionDate) return false;

    return startOfDay(transactionDate) >= startDate;
  });
}

function getTotalItems(items){
  return (items || []).reduce((sum,item) => sum + Number(item.qty || 0),0);
}

function getProductSales(transactions){
  const products = {};

  transactions.forEach(transaction => {
    (transaction.items || []).forEach(item => {
      const name = item.name || "Produk Tanpa Nama";

      if(!products[name]){
        products[name] = {
          name,
          category:item.category || "Lainnya",
          qty:0,
          revenue:0
        };
      }

      products[name].qty += Number(item.qty || 0);
      products[name].revenue += Number(item.price || 0) * Number(item.qty || 0);
    });
  });

  return Object.values(products).sort((a,b) => b.qty - a.qty);
}

function getCategorySales(transactions){
  const categories = {};

  transactions.forEach(transaction => {
    (transaction.items || []).forEach(item => {
      const category = item.category || "Lainnya";

      if(!categories[category]){
        categories[category] = {
          category,
          qty:0,
          revenue:0
        };
      }

      categories[category].qty += Number(item.qty || 0);
      categories[category].revenue += Number(item.price || 0) * Number(item.qty || 0);
    });
  });

  return Object.values(categories).sort((a,b) => b.qty - a.qty);
}

function getPaymentMethodSales(transactions){
  const methods = {};

  transactions.forEach(transaction => {
    const method = transaction.method || "Tidak diketahui";

    if(!methods[method]){
      methods[method] = {
        method,
        total:0,
        revenue:0
      };
    }

    methods[method].total += 1;
    methods[method].revenue += Number(transaction.total || 0);
  });

  return Object.values(methods).sort((a,b) => b.total - a.total);
}

function renderStats(transactions){
  const totalRevenue = transactions.reduce((sum,transaction) => sum + Number(transaction.total || 0),0);
  const totalOrders = transactions.length;
  const average = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  reportRevenueEl.innerText = formatRupiah(totalRevenue);
  reportOrdersEl.innerText = totalOrders;
  reportAverageEl.innerText = formatRupiah(average);
}

function hideChart(canvasId, emptyElement){
  const canvas = document.getElementById(canvasId);
  if(canvas) canvas.style.display = "none";
  emptyElement.style.display = "flex";
}

function showChart(canvasId, emptyElement){
  const canvas = document.getElementById(canvasId);
  emptyElement.style.display = "none";
  canvas.style.display = "block";
  return canvas.getContext("2d");
}

function renderProductChart(transactions){
  const productSales = getProductSales(transactions).slice(0,7);

  if(productChart){
    productChart.destroy();
  }

  if(!productSales.length || typeof Chart === "undefined"){
    hideChart("reportProductChart", productEmpty);
    return;
  }

  const ctx = showChart("reportProductChart", productEmpty);

  productChart = new Chart(ctx,{
    type:"bar",
    data:{
      labels:productSales.map(item => item.name),
      datasets:[{
        label:"Item Terjual",
        data:productSales.map(item => item.qty),
        backgroundColor:"#004D40",
        borderRadius:8,
        maxBarThickness:38
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{
        legend:{ display:false },
        tooltip:{
          callbacks:{
            label:function(context){
              const item = productSales[context.dataIndex];
              return context.raw + " item - " + formatRupiah(item.revenue);
            }
          }
        }
      },
      scales:{
        x:{
          grid:{ display:false },
          ticks:{ color:"#667085", font:{ family:"Poppins", size:12 } }
        },
        y:{
          beginAtZero:true,
          ticks:{ precision:0, color:"#667085", font:{ family:"Poppins", size:12 } },
          grid:{ color:"#EAECF0" }
        }
      }
    }
  });
}

function renderCategoryChart(transactions){
  const categorySales = getCategorySales(transactions);

  if(categoryChart){
    categoryChart.destroy();
  }

  if(!categorySales.length || typeof Chart === "undefined"){
    hideChart("reportCategoryChart", categoryEmpty);
    return;
  }

  const ctx = showChart("reportCategoryChart", categoryEmpty);

  categoryChart = new Chart(ctx,{
    type:"doughnut",
    data:{
      labels:categorySales.map(item => item.category),
      datasets:[{
        data:categorySales.map(item => item.qty),
        backgroundColor:["#004D40","#00947D","#EADCA6","#9B7B2F","#667085"],
        borderWidth:4,
        borderColor:"#fff"
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      cutout:"62%",
      plugins:{
        legend:{
          position:"bottom",
          labels:{
            boxWidth:12,
            boxHeight:12,
            color:"#344054",
            font:{ family:"Poppins", size:13 }
          }
        },
        tooltip:{
          callbacks:{
            label:function(context){
              const item = categorySales[context.dataIndex];
              return context.label + ": " + context.raw + " item - " + formatRupiah(item.revenue);
            }
          }
        }
      }
    }
  });
}

function renderPaymentChart(transactions){
  const paymentSales = getPaymentMethodSales(transactions);

  if(paymentChart){
    paymentChart.destroy();
  }

  if(!paymentSales.length || typeof Chart === "undefined"){
    hideChart("reportPaymentChart", paymentEmpty);
    return;
  }

  const ctx = showChart("reportPaymentChart", paymentEmpty);

  paymentChart = new Chart(ctx,{
    type:"bar",
    data:{
      labels:paymentSales.map(item => item.method),
      datasets:[{
        label:"Jumlah Transaksi",
        data:paymentSales.map(item => item.total),
        backgroundColor:"#004D40",
        borderRadius:8,
        maxBarThickness:38
      }]
    },
    options:{
      indexAxis:"y",
      responsive:true,
      maintainAspectRatio:false,
      plugins:{
        legend:{ display:false },
        tooltip:{
          callbacks:{
            label:function(context){
              const item = paymentSales[context.dataIndex];
              return context.raw + " transaksi - " + formatRupiah(item.revenue);
            }
          }
        }
      },
      scales:{
        x:{
          beginAtZero:true,
          ticks:{ precision:0, color:"#667085", font:{ family:"Poppins", size:12 } },
          grid:{ color:"#EAECF0" }
        },
        y:{
          grid:{ display:false },
          ticks:{ color:"#667085", font:{ family:"Poppins", size:12 } }
        }
      }
    }
  });
}

function renderTransactionDetails(transactions){
  const sorted = [...transactions].sort((a,b) => {
    const dateA = getTransactionDate(a);
    const dateB = getTransactionDate(b);
    return (dateB ? dateB.getTime() : 0) - (dateA ? dateA.getTime() : 0);
  }).slice(0,6);

  if(!sorted.length){
    transactionDetailBox.innerHTML = `<div class="report-empty static-empty">Belum ada transaksi</div>`;
    return;
  }

  transactionDetailBox.innerHTML = `
    <div class="transaction-list">
      ${sorted.map(transaction => `
        <div class="transaction-row">
          <div>
            <h3>${transaction.id || "-"}</h3>
            <p>${transaction.date || "-"} • ${getTotalItems(transaction.items)} item</p>
          </div>
          <div class="transaction-value">
            <strong>${formatRupiah(transaction.total)}</strong>
            <span>${transaction.method || "-"}</span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderReport(){
  const allTransactions = getTransactions();
  currentTransactions = filterByPeriod(allTransactions, activePeriod);

  renderStats(currentTransactions);
  renderProductChart(currentTransactions);
  renderCategoryChart(currentTransactions);
  renderPaymentChart(currentTransactions);
  renderTransactionDetails(currentTransactions);
}

function setActiveFilter(button){
  document.querySelectorAll(".filter-btn").forEach(item => item.classList.remove("active"));
  button.classList.add("active");
  activePeriod = button.dataset.period;
  renderReport();
}

function escapeCSV(value){
  const text = String(value ?? "").replace(/"/g,'""');
  return `"${text}"`;
}

function exportCSV(){
  if(!currentTransactions.length){
    alert("Tidak ada data transaksi untuk diekspor");
    return;
  }

  const rows = [[
    "ID Transaksi",
    "Tanggal",
    "Pelanggan",
    "Metode Pembayaran",
    "Produk",
    "Kategori",
    "Qty",
    "Harga Satuan",
    "Subtotal Item",
    "Subtotal Transaksi",
    "Pajak",
    "Total Transaksi"
  ]];

  currentTransactions.forEach(transaction => {
    const items = transaction.items && transaction.items.length ? transaction.items : [{ name:"-", category:"-", qty:0, price:0 }];

    items.forEach(item => {
      const qty = Number(item.qty || 0);
      const price = Number(item.price || 0);

      rows.push([
        transaction.id || "-",
        transaction.date || "-",
        transaction.customer || "Umum",
        transaction.method || "-",
        item.name || "-",
        item.category || "-",
        qty,
        price,
        qty * price,
        Number(transaction.subtotal || 0),
        Number(transaction.tax || 0),
        Number(transaction.total || 0)
      ]);
    });
  });

  const csvContent = rows
    .map(row => row.map(escapeCSV).join(";"))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type:"text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `laporan-penjualan-${activePeriod}-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

filterTabs.addEventListener("click", event => {
  const button = event.target.closest(".filter-btn");
  if(!button) return;

  setActiveFilter(button);
});

printBtn.addEventListener("click", () => {
  window.print();
});

exportBtn.addEventListener("click", exportCSV);

document.addEventListener("DOMContentLoaded", renderReport);
