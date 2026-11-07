import { useEffect } from 'react'

// Título da aba do navegador: "Histórico · Controle Financeiro".
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Controle Financeiro` : 'Controle Financeiro'
  }, [title])
}
