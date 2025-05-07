const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const addButton = document.getElementById("add-entry");
const entryList = document.getElementById("entry-list");
const filterCategory = document.getElementById("filter-category");
const filterType = document.getElementById("filter-type"); // new

const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const balanceEl = document.getElementById("balance");

let entries = [];
let chart;
const chartCtx = document.getElementById("chart").getContext("2d");

addButton.addEventListener("click", () => {
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;
  const category = categoryInput.value.trim();
  const date = dateInput.value;

  if (!amount || !category || !date) {
    alert("Please fill all fields.");
    return;
  }

  const entry = { amount, type, category, date };
  entries.push(entry);

  updateFilterOptions();
  updateUI();
  clearInputs();
});

function clearInputs() {
  amountInput.value = "";
  categoryInput.value = "";
  dateInput.value = "";
}

function updateUI() {
  renderEntries();
  updateSummary();
  updateChart();
}

function renderEntries() {
  const selectedCategory = filterCategory.value;
  const selectedType = filterType.value;
  entryList.innerHTML = "";

  const filtered = entries.filter(e => {
    const matchCategory = selectedCategory === "all" || e.category === selectedCategory;
    const matchType = selectedType === "all" || e.type === selectedType;
    return matchCategory && matchType;
  });

  filtered.forEach((entry, index) => {
    const li = document.createElement("li");
    li.textContent = `${entry.date} - ${entry.category}: ₹${entry.amount} (${entry.type})`;

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      entries.splice(index, 1);
      updateUI();
    });

    li.appendChild(delBtn);
    entryList.appendChild(li);
  });
}

function updateSummary() {
  let income = 0;
  let expense = 0;

  entries.forEach((e) => {
    if (e.type === "income") income += e.amount;
    else expense += e.amount;
  });

  totalIncomeEl.textContent = income.toFixed(2);
  totalExpenseEl.textContent = expense.toFixed(2);
  balanceEl.textContent = (income - expense).toFixed(2);
}

function updateFilterOptions() {
  const categories = [...new Set(entries.map(e => e.category))];
  filterCategory.innerHTML = `<option value="all">All</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filterCategory.appendChild(option);
  });
}

filterCategory.addEventListener("change", updateUI);
filterType.addEventListener("change", updateUI); // new

function updateChart() {
  const incomeByCategory = {};
  const expenseByCategory = {};

  entries.forEach((entry) => {
    const target = entry.type === "income" ? incomeByCategory : expenseByCategory;
    if (!target[entry.category]) target[entry.category] = 0;
    target[entry.category] += entry.amount;
  });

  const incomeLabels = Object.keys(incomeByCategory);
  const incomeData = Object.values(incomeByCategory);

  const expenseLabels = Object.keys(expenseByCategory);
  const expenseData = Object.values(expenseByCategory);

  if (chart) chart.destroy();

  chart = new Chart(chartCtx, {
    type: "doughnut",
    data: {
      labels: [...incomeLabels, ...expenseLabels],
      datasets: [{
        label: "Expenses & Income",
        data: [...incomeData, ...expenseData],
        backgroundColor: [
          ...incomeLabels.map(() => "green"),
          ...expenseLabels.map(() => "red")
        ],
      }],
    },
  });
}
