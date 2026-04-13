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
