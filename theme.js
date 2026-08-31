const themeButton = document.querySelector(".theme-toggle")
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")

function savedTheme() {
  return localStorage.getItem("familyplates-website-theme")
}

function resolvedTheme() {
  return savedTheme() || (systemTheme.matches ? "dark" : "light")
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light"
  document.documentElement.dataset.theme = nextTheme
  document.documentElement.style.colorScheme = nextTheme

  if (themeButton) {
    const action = nextTheme === "dark" ? "light" : "dark"
    themeButton.setAttribute("aria-label", `Switch to ${action} theme`)
    themeButton.setAttribute("title", `Switch to ${action} theme`)
  }
}

themeButton?.addEventListener("click", () => {
  const nextTheme = resolvedTheme() === "dark" ? "light" : "dark"
  localStorage.setItem("familyplates-website-theme", nextTheme)
  applyTheme(nextTheme)
})

systemTheme.addEventListener("change", () => {
  if (!savedTheme()) applyTheme(resolvedTheme())
})

applyTheme(resolvedTheme())
