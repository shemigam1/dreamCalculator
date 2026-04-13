const display = {
  expression: document.getElementById("expression"),
  total: document.getElementById("total"),
};

const state = {
  currentInput: "",
  previousInput: "",
  operator: null,
  justCalculated: false,
};

function updateDisplay(value) {
  const formatted = formatNumber(value || state.currentInput);
  display.total.textContent = formatted || "0";
}

function formatNumber(value) {
  if (value === "" || value === null) return "";
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-NG");
}

function handleNumber(val) {
  if (state.justCalculated) {
    state.currentInput = "";
    state.justCalculated = false;
  }
  if (val === "000") {
    if (state.currentInput === "") return;
    state.currentInput += "000";
  } else {
    state.currentInput += val;
  }
  updateDisplay();
}

function handleOperator(op) {
  if (state.currentInput === "" && state.previousInput === "") return;

  if (state.currentInput !== "" && state.previousInput !== "") {
    calculate();
  }

  state.operator = op;
  state.previousInput = state.currentInput || state.previousInput;
  state.currentInput = "";

  const opSymbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };
  display.expression.textContent = `${formatNumber(state.previousInput)} ${opSymbols[op]}`;
}

function calculate() {
  const prev = parseFloat(state.previousInput);
  const curr = parseFloat(state.currentInput);

  if (isNaN(prev) || isNaN(curr)) return;

  let result;
  switch (state.operator) {
    case "+":
      result = prev + curr;
      break;
    case "-":
      result = prev - curr;
      break;
    case "*":
      result = prev * curr;
      break;
    case "/":
      result = curr === 0 ? "Error" : prev / curr;
      break;
    default:
      return;
  }

  display.expression.textContent = `${formatNumber(state.previousInput)} ${state.operator} ${formatNumber(state.currentInput)} =`;
  state.currentInput = result === "Error" ? "Error" : String(result);
  state.previousInput = "";
  state.operator = null;
  state.justCalculated = true;
  updateDisplay();
}

function handleDelete() {
  if (state.justCalculated) return;
  state.currentInput = state.currentInput.slice(0, -1);
  updateDisplay();
}

function handleClear() {
  state.currentInput = "";
  state.previousInput = "";
  state.operator = null;
  state.justCalculated = false;
  display.expression.textContent = "";
  updateDisplay();
}

function handlePercent() {
  if (state.currentInput === "") return;
  state.currentInput = String(parseFloat(state.currentInput) / 100);
  updateDisplay();
}

document.querySelectorAll(".key[data-val]").forEach((key) => {
  key.addEventListener("click", () => {
    const val = key.dataset.val;
    if (!isNaN(val) || val === "000") {
      handleNumber(val);
    } else if (["+", "-", "*", "/"].includes(val)) {
      handleOperator(val);
    } else if (val === "%") {
      handlePercent();
    }
  });
});

document.getElementById("del-btn").addEventListener("click", handleDelete);
document.getElementById("clear-btn").addEventListener("click", handleClear);
document.getElementById("equals-btn").addEventListener("click", calculate);

const marketState = {
  items: [],
  discountPct: 0,
};

function getMarketTotal() {
  const subtotal = marketState.items.reduce((sum, item) => sum + item.price, 0);
  const discount = subtotal * (marketState.discountPct / 100);
  return subtotal - discount;
}

function renderItems() {
  const list = document.getElementById("item-list");
  list.innerHTML = "";

  marketState.items.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "item-row";
    li.innerHTML = `
      <span class="item-name">${item.name}</span>
      <span class="item-price">₦${item.price.toLocaleString("en-NG")}</span>
      <button class="item-delete" data-index="${index}" aria-label="Remove item">×</button>
    `;
    list.appendChild(li);
  });

  list.querySelectorAll(".item-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      marketState.items.splice(Number(btn.dataset.index), 1);
      renderItems();
      renderMarketTotal();
    });
  });
}

function renderMarketTotal() {
  const total = getMarketTotal();
  const subtotal = marketState.items.reduce((sum, item) => sum + item.price, 0);

  display.total.textContent = "₦" + total.toLocaleString("en-NG");

  if (marketState.discountPct > 0) {
    display.expression.textContent = `Subtotal ₦${subtotal.toLocaleString("en-NG")} − ${marketState.discountPct}%`;
  } else {
    display.expression.textContent = `${marketState.items.length} item${marketState.items.length !== 1 ? "s" : ""}`;
  }
}

function addItem() {
  const nameInput = document.getElementById("item-name");
  const priceInput = document.getElementById("item-price");

  const name = nameInput.value.trim() || "Item";
  const price = parseFloat(priceInput.value.replace(/,/g, ""));

  if (isNaN(price) || price <= 0) {
    priceInput.focus();
    return;
  }

  marketState.items.push({ name, price });
  nameInput.value = "";
  priceInput.value = "";
  state.currentInput = "";

  renderItems();
  renderMarketTotal();
}

document.getElementById("add-item-btn").addEventListener("click", addItem);

document.getElementById("item-price").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addItem();
});

document.querySelectorAll(".disc-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const pct = Number(btn.dataset.pct);

    if (btn.id === "custom-disc-btn") {
      const input = prompt("Enter discount percentage:");
      const parsed = parseFloat(input);
      if (isNaN(parsed) || parsed < 0 || parsed > 100) return;
      marketState.discountPct = parsed;
    } else {
      marketState.discountPct = marketState.discountPct === pct ? 0 : pct;
    }

    document
      .querySelectorAll(".disc-btn")
      .forEach((b) => b.classList.remove("active"));
    if (marketState.discountPct > 0) {
      btn.classList.add("active");
    }

    renderMarketTotal();
  });
});

const btnSimple = document.getElementById("btn-simple");
const btnMarket = document.getElementById("btn-market");
const marketPanel = document.getElementById("market-panel");

btnSimple.addEventListener("click", () => {
  btnSimple.classList.add("active");
  btnMarket.classList.remove("active");
  marketPanel.classList.add("hidden");
});

btnMarket.addEventListener("click", () => {
  btnMarket.classList.add("active");
  btnSimple.classList.remove("active");
  marketPanel.classList.remove("hidden");
  renderMarketTotal();
});
