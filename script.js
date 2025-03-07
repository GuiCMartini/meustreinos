/**
 * Retorna a lista de datas concluídas armazenadas no localStorage.
 * @returns {string[]} Array de datas no formato "YYYY-MM-DD"
 */
function getCompletedDates() {
  const data = localStorage.getItem("completedDates");
  return data ? JSON.parse(data) : [];
}

/**
 * Armazena a lista de datas concluídas no localStorage.
 * @param {string[]} dates 
 */
function setCompletedDates(dates) {
  localStorage.setItem("completedDates", JSON.stringify(dates));
}

/**
 * Atualiza o progresso dos treinos (Treino A, B e Perna) e sincroniza o calendário para o dia atual.
 */
function updateProgress() {
  // Treino A
  const treinoAList = document.querySelectorAll("#treinoA li");
  const totalA = treinoAList.length;
  const checkedA = document.querySelectorAll("#treinoA input:checked").length;
  document.getElementById("progressoA").textContent = checkedA;
  document.getElementById("totalA").textContent = totalA;
  
  // Treino B
  const treinoBList = document.querySelectorAll("#treinoB li");
  const totalB = treinoBList.length;
  const checkedB = document.querySelectorAll("#treinoB input:checked").length;
  document.getElementById("progressoB").textContent = checkedB;
  document.getElementById("totalB").textContent = totalB;
  
  // Treino de Perna
  const treinoPernaList = document.querySelectorAll("#treinoPerna li");
  const totalPerna = treinoPernaList.length;
  const checkedPerna = document.querySelectorAll("#treinoPerna input:checked").length;
  document.getElementById("progressoPerna").textContent = checkedPerna;
  document.getElementById("totalPerna").textContent = totalPerna;
  
  // Se algum treino estiver completamente concluído, atualiza o calendário para o dia atual
  const isCompleted = (checkedA === totalA) || (checkedB === totalB) || (checkedPerna === totalPerna);
  updateCalendarForToday(isCompleted);
  updateMonthlyProgress();
}

/**
 * Atualiza o status do dia atual no calendário conforme o progresso.
 * @param {boolean} completed - Se o treino do dia está concluído.
 */
function updateCalendarForToday(completed) {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0]; // Formato YYYY-MM-DD
  let dates = getCompletedDates();
  
  if (completed) {
    if (!dates.includes(dateStr)) {
      dates.push(dateStr);
    }
  } else {
    dates = dates.filter(d => d !== dateStr);
  }
  setCompletedDates(dates);
  if (document.getElementById("calendar-container")) {
    generateCalendar(2025);
  }
}

/**
 * Atualiza a barra de progresso mensal e exibe a data atual no cabeçalho.
 * Calcula o progresso com base em 6 treinos por semana, considerando apenas semanas completas.
 */
function updateMonthlyProgress() {
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-based
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const completeWeeks = Math.floor(daysInMonth / 7);
  const maxWorkouts = completeWeeks * 6;
  
  // Filtra as datas concluídas para o mês atual
  const completedDates = getCompletedDates();
  const completedThisMonth = completedDates.filter(dateStr => {
    const d = new Date(dateStr);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;
  
  const percentage = maxWorkouts > 0 ? Math.min((completedThisMonth / maxWorkouts) * 100, 100) : 0;
  
  // Atualiza a barra de progresso mensal
  const progressBar = document.getElementById("monthlyProgressBar");
  const progressText = document.getElementById("monthlyProgressText");
  progressBar.style.width = percentage + "%";
  progressText.textContent = Math.round(percentage) + "% concluído";
  
  // Atualiza o cabeçalho com a data atual (ex: "Março 2025 - Dia 07/03")
  const headerDateInfo = document.getElementById("headerDateInfo");
  const monthName = today.toLocaleString("pt-BR", { month: "long" });
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  headerDateInfo.textContent = `${monthName} ${currentYear} - Dia ${day}/${month}`;
}

/**
 * Gera o calendário anual para o ano informado.
 * @param {number} year - Ano para o calendário.
 */
function generateCalendar(year) {
  const calendarContainer = document.getElementById("calendar-container");
  calendarContainer.innerHTML = "";
  const completedDates = getCompletedDates();
  const todayStr = new Date().toISOString().split("T")[0];
  
  for (let month = 0; month < 12; month++) {
    const monthDiv = document.createElement("div");
    monthDiv.classList.add("calendar-month");
    
    const monthName = new Date(year, month).toLocaleString("pt-BR", { month: "long" });
    const monthHeader = document.createElement("h3");
    monthHeader.textContent = monthName;
    monthDiv.appendChild(monthHeader);
    
    const daysGrid = document.createElement("div");
    daysGrid.classList.add("calendar-days");
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month+1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayElem = document.createElement("div");
      dayElem.classList.add("calendar-day");
      dayElem.textContent = day;
      dayElem.setAttribute("data-date", dateStr);
      
      if (completedDates.includes(dateStr)) {
        dayElem.classList.add("completed-day");
        dayElem.setAttribute("data-tooltip", dateStr === todayStr ? "Hoje: Treino concluído" : "Treino concluído");
      } else {
        dayElem.setAttribute("data-tooltip", dateStr === todayStr ? "Hoje: Treino pendente" : "Treino pendente");
      }
      
      dayElem.addEventListener("click", function() {
        toggleCalendarDay(dateStr, dayElem);
      });
      daysGrid.appendChild(dayElem);
    }
    monthDiv.appendChild(daysGrid);
    calendarContainer.appendChild(monthDiv);
  }
}

/**
 * Alterna o status de conclusão de um dia no calendário e atualiza o localStorage.
 * @param {string} dateStr - Data no formato "YYYY-MM-DD".
 * @param {HTMLElement} element - Elemento do dia clicado.
 */
function toggleCalendarDay(dateStr, element) {
  let dates = getCompletedDates();
  if (dates.includes(dateStr)) {
    dates = dates.filter(d => d !== dateStr);
    element.classList.remove("completed-day");
    element.setAttribute("data-tooltip", "Treino pendente");
  } else {
    dates.push(dateStr);
    element.classList.add("completed-day");
    element.setAttribute("data-tooltip", "Treino concluído");
  }
  setCompletedDates(dates);
}

/**
 * Salva o estado de um checkbox no localStorage.
 * @param {string} id - ID do checkbox.
 * @param {boolean|string} state - Estado a ser salvo.
 */
function saveState(id, state) {
  localStorage.setItem(id, state);
}

/**
 * Cria um botão de reset reutilizável para os treinos.
 * @param {string} treinoId - Seletor do treino (ex: "#treinoA").
 * @param {string} labelText - Texto do botão.
 * @param {string} ariaLabel - Atributo aria-label para acessibilidade.
 * @returns {HTMLElement} O botão criado.
 */
function createResetButton(treinoId, labelText, ariaLabel) {
  const button = document.createElement("button");
  button.innerText = labelText;
  button.classList.add("reset-button");
  button.setAttribute("aria-label", ariaLabel);
  button.addEventListener("click", function() {
    if (confirm(`Tem certeza que deseja limpar todas as marcações do ${labelText}?`)) {
      const checkboxes = document.querySelectorAll(`${treinoId} input[type='checkbox']`);
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        saveState(checkbox.id, false);
        const label = checkbox.nextElementSibling;
        if (label) {
          label.classList.remove("completed");
        }
        checkbox.setAttribute("aria-checked", "false");
      });
      updateProgress();
    }
  });
  return button;
}

/**
 * Inicializa o toggle de tema (modo escuro/claro) e persiste a preferência.
 */
function initThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let isDarkMode = savedTheme ? savedTheme === "dark" : prefersDark;
  
  if (isDarkMode) {
    document.body.classList.add("dark-mode");
    document.body.classList.remove("light-mode");
    themeToggle.checked = true;
  } else {
    document.body.classList.add("light-mode");
    document.body.classList.remove("dark-mode");
    themeToggle.checked = false;
  }
  
  themeToggle.addEventListener("change", function() {
    if (this.checked) {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  });
}

document.addEventListener("DOMContentLoaded", function() {
  const container = document.querySelector(".treinos-container");
  container.addEventListener("change", function(e) {
    if (e.target && e.target.matches("input[type='checkbox']")) {
      const checkbox = e.target;
      const state = checkbox.checked ? "true" : "false";
      saveState(checkbox.id, state);
      const label = checkbox.nextElementSibling;
      if (checkbox.checked) {
        label.classList.add("completed");
        checkbox.setAttribute("aria-checked", "true");
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      } else {
        label.classList.remove("completed");
        checkbox.setAttribute("aria-checked", "false");
      }
      updateProgress();
    }
  });
  
  const checkboxes = document.querySelectorAll("input[type='checkbox']");
  checkboxes.forEach(checkbox => {
    const storedValue = localStorage.getItem(checkbox.id);
    checkbox.checked = storedValue === "true";
    const label = checkbox.nextElementSibling;
    if (checkbox.checked) {
      label.classList.add("completed");
      checkbox.setAttribute("aria-checked", "true");
    } else {
      checkbox.setAttribute("aria-checked", "false");
    }
  });
  
  checkboxes.forEach(checkbox => {
    checkbox.style.width = "24px";
    checkbox.style.height = "24px";
    const label = checkbox.nextElementSibling;
    if (label) {
      label.addEventListener("click", function(e) {
        e.preventDefault();
        checkbox.checked = !checkbox.checked;
        const event = new Event('change');
        checkbox.dispatchEvent(event);
      });
    }
  });
  
  updateProgress();
  
  const progressAContainer = document.getElementById("progressA").parentNode;
  const progressBContainer = document.getElementById("progressB").parentNode;
  const progressPernaContainer = document.getElementById("progressPerna").parentNode;
  const resetA = createResetButton("#treinoA", "Limpar Treino A", "Limpar Treino A");
  const resetB = createResetButton("#treinoB", "Limpar Treino B", "Limpar Treino B");
  const resetPerna = createResetButton("#treinoPerna", "Limpar Treino de Perna", "Limpar Treino de Perna");
  progressAContainer.appendChild(resetA);
  progressBContainer.appendChild(resetB);
  progressPernaContainer.appendChild(resetPerna);
  
  initThemeToggle();
  generateCalendar(2025);
});
