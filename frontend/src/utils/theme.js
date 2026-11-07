// Tema da interface: 'auto' (segue o sistema), 'light' ou 'dark'.
// Fica guardado no navegador (localStorage); o index.html aplica antes de a
// página aparecer e esta função aplica quando a pessoa troca em Configurações.
const STORAGE_KEY = 'tema'
export const THEMES = [
  { value: 'auto', label: 'Automático (igual ao sistema)' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
]

export function getTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'light' || saved === 'dark' ? saved : 'auto'
  } catch {
    return 'auto'
  }
}

export function setTheme(theme) {
  const root = document.documentElement
  if (theme === 'light' || theme === 'dark') {
    root.dataset.theme = theme
  } else {
    delete root.dataset.theme
  }
  try {
    if (theme === 'auto') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Navegador sem localStorage (modo privado restrito): vale só nesta aba.
  }
}
