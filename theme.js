/* FamilyPlates — theme toggle and interactive widgets */

// --- Theme toggle ---
const themeButton = document.querySelector(".theme-toggle");
const themeColor = document.querySelector("#theme-color");
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

function getSavedTheme() {
  return localStorage.getItem("familyplates-website-theme");
}

function getResolvedTheme() {
  return getSavedTheme() || (systemTheme.matches ? "dark" : "light");
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.style.colorScheme = nextTheme;
  if (themeColor) {
    themeColor.content = nextTheme === "dark" ? "#0e141b" : "#faf8f5";
  }

  if (themeButton) {
    const isDark = nextTheme === "dark";
    const label = `Switch to ${isDark ? "light" : "dark"} theme`;
    themeButton.setAttribute("aria-label", label);
    themeButton.setAttribute("title", label);
  }
}

if (themeButton) {
  themeButton.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme || getResolvedTheme();
    const nextTheme = current === "dark" ? "light" : "dark";
    localStorage.setItem("familyplates-website-theme", nextTheme);
    applyTheme(nextTheme);
  });
}

systemTheme.addEventListener("change", () => {
  if (!getSavedTheme()) {
    applyTheme(getResolvedTheme());
  }
});

applyTheme(getResolvedTheme());

// --- Showcase tabs ---
const tabButtons = document.querySelectorAll(".showcase-tab");
const tabPanels = document.querySelectorAll(".showcase-panel");

function switchTab(targetTabId) {
  tabButtons.forEach((tab) => {
    const isSelected = tab.getAttribute("data-tab") === targetTabId;
    tab.setAttribute("aria-selected", isSelected ? "true" : "false");
    tab.tabIndex = isSelected ? 0 : -1;
    tab.classList.toggle("active", isSelected);
  });

  tabPanels.forEach((panel) => {
    const isMatch = panel.id === `panel-${targetTabId}`;
    panel.hidden = !isMatch;
    panel.classList.toggle("active", isMatch);
  });
}

tabButtons.forEach((tab) => {
  tab.addEventListener("click", () => {
    const tabId = tab.getAttribute("data-tab");
    if (tabId) switchTab(tabId);
  });

  tab.addEventListener("keydown", (e) => {
    const tabs = Array.from(tabButtons);
    const currentIndex = tabs.indexOf(tab);
    let targetIndex = -1;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      targetIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      targetIndex = 0;
    } else if (e.key === "End") {
      targetIndex = tabs.length - 1;
    }

    if (targetIndex !== -1) {
      e.preventDefault();
      tabs[targetIndex].focus();
      const tabId = tabs[targetIndex].getAttribute("data-tab");
      if (tabId) switchTab(tabId);
    }
  });
});

// --- Copy buttons ---
document.querySelectorAll(".copy-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const targetSelector = button.getAttribute("data-copy-target");
    let textToCopy = button.getAttribute("data-copy-text");

    if (!textToCopy && targetSelector) {
      const targetEl = document.querySelector(targetSelector);
      if (targetEl) {
        textToCopy = targetEl.innerText.trim();
      }
    }

    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalText = button.innerHTML;
        button.classList.add("copied");
        button.setAttribute("aria-label", "Copied to clipboard!");
        
        const copyLabel = button.querySelector(".copy-label");
        if (copyLabel) copyLabel.textContent = "Copied!";

        setTimeout(() => {
          button.classList.remove("copied");
          button.setAttribute("aria-label", "Copy to clipboard");
          if (copyLabel) copyLabel.textContent = "Copy";
          button.innerHTML = originalText;
        }, 2200);
      } catch (err) {
        console.error("Failed to copy text:", err);
      }
    }
  });
});
