const historyContainer = document.getElementById("historyContainer");
const searchInput = document.getElementById("searchInput");
const dateInput = document.getElementById("dateInput");

function formatRupiah(number) {
  return "Rp " + Number(number).toLocaleString("id-ID");
}

function getTransactions() {
  return JSON.parse(localStorage.getItem("transactions")) || [];
}

function getTotalItems(items) {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

function normalizeDate(transaction) {
  if (transaction.dateISO) {
    return transaction.dateISO.split("T")[0];
  }

  const date = new Date(transaction.date);
  if (isNaN(date)) return "";
  return date.toISOString().split("T")[0];
}

function renderEmptyState() {
  historyContainer.innerHTML = `
    <div class="empty-history">
      <i class="fa-regular fa-cube"></i>
      <h3>Tidak ada pesanan</h3>
      <p>Belum ada transaksi yang tercatat</p>
    </div>
  `;
}

function renderTransactions(data) {
  if (!data.length) {
    renderEmptyState();
    return;
  }

  historyContainer.innerHTML = `
    <div class="history-list">
      ${data.map(transaction => `
        <div class="history-item">
          <div class="history-top">
            <div class="invoice-info">
              <h3>${transaction.id}</h3>
              <p>${transaction.date || "-"}</p>
            </div>

            <div class="invoice-total">
              <h4>${formatRupiah(transaction.total)}</h4>
              <p>Total Pembayaran</p>
            </div>
          </div>

          <div class="history-meta">
            <span class="meta-pill">
              Pelanggan: ${transaction.customer ? transaction.customer : "Umum"}
            </span>

            <span class="meta-pill">
              Metode: ${transaction.method || "-"}
            </span>

            <span class="meta-pill">
              ${getTotalItems(transaction.items)} item
            </span>
          </div>

          <div class="history-products">
            ${transaction.items.map(item => `
              <div class="product-row">
                <div class="left">
                  <span>${item.name}</span>
                  <span class="qty">x${item.qty}</span>
                </div>
                <div>${formatRupiah(item.price * item.qty)}</div>
              </div>
            `).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function filterTransactions() {
  const keyword = searchInput.value.toLowerCase().trim();
  const selectedDate = dateInput.value;

  let transactions = getTransactions();

  const filtered = transactions.filter(transaction => {
    const searchableText = [
      transaction.id,
      transaction.customer,
      transaction.method,
      ...(transaction.items || []).map(item => item.name)
    ]
      .join(" ")
      .toLowerCase();

    const matchKeyword = searchableText.includes(keyword);

    const transactionDate = normalizeDate(transaction);
    const matchDate = selectedDate ? transactionDate === selectedDate : true;

    return matchKeyword && matchDate;
  });

  renderTransactions(filtered);
}

searchInput.addEventListener("input", filterTransactions);
dateInput.addEventListener("change", filterTransactions);

document.addEventListener("DOMContentLoaded", () => {
  renderTransactions(getTransactions());
});