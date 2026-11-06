import { useState } from 'react'
import { useCategories } from '../hooks/useCategories.js'
import CategoryForm from '../components/CategoryForm.jsx'
import CategoryList from '../components/CategoryList.jsx'

function Settings() {
  const { categories, loading, error, addCategory, updateCategory, deleteCategory, reload } =
    useCategories()
  const [addingCategory, setAddingCategory] = useState(false)

  async function handleAddCategory(values) {
    await addCategory(values)
    setAddingCategory(false)
  }

  return (
    <section className="page">
      <h1>Configurações</h1>
      <p>Gerencie suas categorias de gastos. As caixinhas (orçamento por categoria) chegam na Etapa 8.</p>

      {loading && <p className="status status--pending">Carregando…</p>}

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
          <div className="section-header">
            <h3>Categorias</h3>
            {!addingCategory && (
              <button type="button" className="button" onClick={() => setAddingCategory(true)}>
                + Nova categoria
              </button>
            )}
          </div>

          {addingCategory && (
            <CategoryForm onSave={handleAddCategory} onCancel={() => setAddingCategory(false)} />
          )}

          <CategoryList categories={categories} onUpdate={updateCategory} onDelete={deleteCategory} />
        </>
      )}
    </section>
  )
}

export default Settings
