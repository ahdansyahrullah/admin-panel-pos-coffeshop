const totalRevenueEl = document.getElementById("totalRevenue");
const todayRevenueEl = document.getElementById("todayRevenue");
const totalOrdersEl = document.getElementById("totalOrders");
const todayOrdersEl = document.getElementById("todayOrders");
const averageOrderEl = document.getElementById("averageOrder");
const totalItemsEl = document.getElementById("totalItems");

const bestProductEmpty = document.getElementById("bestProductEmpty");
const categoryEmpty = document.getElementById("categoryEmpty");
const paymentMethodEmpty = document.getElementById("paymentMethodEmpty");
const topProductDetail = document.getElementById("topProductDetail");

let bestProductChart = null;
let categoryChart = null;
let paymentMethodChart = null;

function formatRupiah(number){
  return "Rp " + Number(number || 0).toLocaleString("id-ID");
}

function getTransactions(){
  return JSON.parse(localStorage.getItem("transactions")) || [];
}

function getTotalItems(items){
  return (items || []).reduce((sum,item) => sum + Number(item.qty || 0), 0);
}

function getTransactionDate(transaction){
  if(transaction.dateISO){
    const isoDate = new Date(transaction.dateISO);
    if(!Number.isNaN(isoDate.getTime())) return isoDate;
  }

  if(transaction.id && transaction.id.startsWith("INV-")){
    const timestamp = Number(transaction.id.replace("INV-", ""));
    if(!Number.isNaN(timestamp)) return new Date(timestamp);
  }

  if(transaction.date){
    const rawDate = new Date(transaction.date);
    if(!Number.isNaN(rawDate.getTime())) return rawDate;

    const dateOnly = String(transaction.date).split(",")[0].trim();
    const parts = dateOnly.split(/[\/\-.]/).map(Number);

    if(parts.length >= 3){
      const [day,month,year] = parts;
      const parsed = new Date(year, month - 1, day);
      if(!Number.isNaN(parsed.getTime())) return parsed;
    }
  }

  return null;
}

function isToday(transaction){
  const date = getTransactionDate(transaction);
  if(!date) return false;

  const today = new Date();

  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
}

function renderStats(transactions){
  const totalRevenue = transactions.reduce((sum,transaction) => {
    return sum + Number(transaction.total || 0);
  },0);

  const totalOrders = transactions.length;
  const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalItems = transactions.reduce((sum,transaction) => {
    return sum + getTotalItems(transaction.items);
  },0);

  const todayTransactions = transactions.filter(isToday);
  const todayRevenue = todayTransactions.reduce((sum,transaction) => {
    return sum + Number(transaction.total || 0);
  },0);

  totalRevenueEl.innerText = formatRupiah(totalRevenue);
  todayRevenueEl.innerText = "Hari ini: " + formatRupiah(todayRevenue);
  totalOrdersEl.innerText = totalOrders;
  todayOrdersEl.innerText = "Hari ini: " + todayTransactions.length;
  averageOrderEl.innerText = formatRupiah(averageOrder);
  totalItemsEl.innerText = totalItems;
}

function getProductSales(transactions){
  const sales = {};

  transactions.forEach(transaction => {
    (transaction.items || []).forEach(item => {
      const name = item.name || "Produk Tanpa Nama";

      if(!sales[name]){
        sales[name] = {
          name,
          category:item.category || "Lainnya",
          qty:0,
          revenue:0
        };
      }

      sales[name].qty += Number(item.qty || 0);
      sales[name].revenue += Number(item.price || 0) * Number(item.qty || 0);
    });
  });

  return Object.values(sales).sort((a,b) => b.qty - a.qty);
}

function getCategorySales(transactions){
  const categories = {
    "Kopi":0,
    "Non-Kopi":0,
    "Makanan":0,
    "Snack":0
  };

  transactions.forEach(transaction => {
    (transaction.items || []).forEach(item => {
      const category = item.category || "Lainnya";

      if(!categories[category]){
        categories[category] = 0;
      }

      categories[category] += Number(item.qty || 0);
    });
  });

  return Object.entries(categories)
    .filter(([,qty]) => qty > 0)
    .map(([category,qty]) => ({ category, qty }));
}

function getPaymentMethodSales(transactions){
  const methods = {};

  transactions.forEach(transaction => {
    const method = transaction.method || "Tidak diketahui";

    if(!methods[method]){
      methods[method] = 0;
    }

    methods[method] += 1;
  });

  return Object.entries(methods)
    .map(([method,total]) => ({ method,total }))
    .sort((a,b) => b.total - a.total);
}

function hideChart(canvasId, emptyElement){
  const canvas = document.getElementById(canvasId);
  canvas.style.display = "none";
  emptyElement.style.display = "flex";
}

function showChart(canvasId, emptyElement){
  const canvas = document.getElementById(canvasId);
  canvas.style.display = "block";
  emptyElement.style.display = "none";
  return canvas.getContext("2d");
}

function renderBestProductChart(transactions){
  const productSales = getProductSales(transactions).slice(0,7);

  if(bestProductChart){
    bestProductChart.destroy();
  }

  if(!productSales.length || typeof Chart === "undefined"){
    hideChart("bestProductChart", bestProductEmpty);
    return;
  }

  const ctx = showChart("bestProductChart", bestProductEmpty);

  bestProductChart = new Chart(ctx,{
    type:"bar",
    data:{
      labels:productSales.map(item => item.name),
      datasets:[{
        label:"Jumlah Terjual",
        data:productSales.map(item => item.qty),
        backgroundColor:"#004D40",
        borderRadius:8,
        maxBarThickness:42
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
              return context.raw + " item terjual";
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
    hideChart("categoryChart", categoryEmpty);
    return;
  }

  const ctx = showChart("categoryChart", categoryEmpty);

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
              return context.label + ": " + context.raw + " item";
            }
          }
        }
      }
    }
  });
}

function renderPaymentMethodChart(transactions){
  const paymentMethods = getPaymentMethodSales(transactions);

  if(paymentMethodChart){
    paymentMethodChart.destroy();
  }

  if(!paymentMethods.length || typeof Chart === "undefined"){
    hideChart("paymentMethodChart", paymentMethodEmpty);
    return;
  }

  const ctx = showChart("paymentMethodChart", paymentMethodEmpty);

  paymentMethodChart = new Chart(ctx,{
    type:"bar",
    data:{
      labels:paymentMethods.map(item => item.method),
      datasets:[{
        label:"Jumlah Transaksi",
        data:paymentMethods.map(item => item.total),
        backgroundColor:"#004D40",
        borderRadius:8,
        maxBarThickness:42
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
              return context.raw + " transaksi";
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

function renderTopProductDetail(transactions){
  const topProducts = getProductSales(transactions).slice(0,6);

  if(!topProducts.length){
    topProductDetail.innerHTML = `
      <div class="empty-visual static-empty">
        Belum ada data penjualan
      </div>
    `;
    return;
  }

  topProductDetail.innerHTML = `
    <div class="top-product-list">
      ${topProducts.map((product,index) => `
        <div class="top-product-item">
          <div class="rank-badge">${index + 1}</div>
          <div class="product-detail-name">
            <h3>${product.name}</h3>
            <p>${product.category}</p>
          </div>
          <div class="product-detail-value">
            <strong>${product.qty} item</strong>
            <span>${formatRupiah(product.revenue)}</span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderDashboard(){
  const transactions = getTransactions();

  renderStats(transactions);
  renderBestProductChart(transactions);
  renderCategoryChart(transactions);
  renderPaymentMethodChart(transactions);
  renderTopProductDetail(transactions);
}

document.addEventListener("DOMContentLoaded",renderDashboard);
