import { useState } from 'react'
import { useCategories } from '../hooks/useCategories.js'
import { useToast } from '../hooks/useToast.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { useRouteReady } from '../hooks/useRouteLoading.jsx'
import { THEMES, getTheme, setTheme } from '../utils/theme.js'
import CategoryForm from '../components/CategoryForm.jsx'
import CategoryList from '../components/CategoryList.jsx'
import SupabaseStatus from '../components/SupabaseStatus.jsx'
import MfaSettings from '../components/MfaSettings.jsx'
import Icon from '../components/Icon.jsx'
import { SkeletonRows, LoadingLabel } from '../components/Skeleton.jsx'

function Settings() {
  usePageTitle('Configurações')
  const toast = useToast()
  const { categories, loading, error, addCategory, updateCategory, deleteCategory, reload } =
    useCategories()
  const [addingCategory, setAddingCategory] = useState(false)
  useRouteReady(!loading)
  const [theme, setThemeState] = useState(getTheme)

  async function handleAddCategory(values) {
    await addCategory(values)
    setAddingCategory(false)
    toast('Categoria criada.')
  }

  function handleThemeChange(value) {
    setTheme(value)
    setThemeState(value)
  }

  return (
    <section className="page">
      <h1>Configurações</h1>

      <div className="settings-section">
        <div className="section-header">
          <h2>Categorias</h2>
          {!loading && !error && !addingCategory && (
            <button type="button" className="button" onClick={() => setAddingCategory(true)}>
              <Icon name="plus" size={16} /> Nova categoria
            </button>
          )}
        </div>
        <p>
          As categorias organizam seus gastos e são a base das caixinhas. Uma categoria que já tem gastos
          não pode ser excluída, mas pode ser renomeada.
        </p>

        {loading && (
          <>
            <LoadingLabel />
            <SkeletonRows count={5} />
          </>
        )}

        {error && (
          <div className="dashboard-panel">
            <p className="status status--error">{error}</p>
            <button type="button" className="button button--ghost" onClick={reload}>
              Tentar de novo
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {addingCategory && (
              <CategoryForm onSave={handleAddCategory} onCancel={() => setAddingCategory(false)} />
            )}
            <CategoryList categories={categories} onUpdate={updateCategory} onDelete={deleteCategory} />
          </>
        )}
      </div>

      <div className="settings-section">
        <MfaSettings />
      </div>

      <div className="settings-section">
        <fieldset className="theme-options">
          <legend>
            <h2>Aparência</h2>
          </legend>
          {THEMES.map((option) => (
            <label key={option.value} className="radio-option">
              <input
                type="radio"
                name="theme"
                value={option.value}
                checked={theme === option.value}
                onChange={() => handleThemeChange(option.value)}
              />
              {option.label}
            </label>
          ))}
        </fieldset>
      </div>

      <div className="settings-section">
        <h2>Conexão</h2>
        <p>Se algo não carregar, confira aqui se o sistema está falando com o servidor e com o banco.</p>
        <SupabaseStatus />
      </div>
    </section>
  )
}

export default Settings
