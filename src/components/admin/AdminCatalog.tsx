import React, { useState } from 'react';
import {
  Search,
  Plus,
  BookOpen,
  Receipt,
  Syringe,
  Percent,
  Pencil,
  X,
  Filter,
  Check,
} from 'lucide-react';
import { MOCK_CATALOG } from '../../data/mockData';
import { CatalogItem } from '../../types';

export const AdminCatalog: React.FC = () => {
  const [items, setItems] = useState<CatalogItem[]>(MOCK_CATALOG);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<CatalogItem['category']>('Consultas');
  const [formPrice, setFormPrice] = useState(180);
  const [formDescription, setFormDescription] = useState('');

  const openEdit = (item: CatalogItem) => {
    setSelectedItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPrice(item.basePrice);
    setFormDescription(item.description);
    setIsDrawerOpen(true);
  };

  const openNew = () => {
    setSelectedItem(null);
    setFormName('');
    setFormCategory('Consultas');
    setFormPrice(150);
    setFormDescription('');
    setIsDrawerOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      setItems((prev) =>
        prev.map((it) =>
          it.sku === selectedItem.sku
            ? {
                ...it,
                name: formName,
                category: formCategory,
                basePrice: formPrice,
                description: formDescription,
              }
            : it
        )
      );
    } else {
      const newItem: CatalogItem = {
        sku: `SRV-00${items.length + 1}`,
        name: formName || 'Novo Item Clínico',
        category: formCategory,
        description: formDescription,
        unit: 'Sessão',
        basePrice: formPrice,
        marginPercent: 65,
        status: 'Ativo',
      };
      setItems((prev) => [newItem, ...prev]);
    }
    setIsDrawerOpen(false);
  };

  const filteredItems = items.filter((it) => {
    const matchSearch = `${it.sku} ${it.name} ${it.description}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === 'Todas' || it.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      {/* Breadcrumbs */}
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>PawCare Veterinary Clinic</span>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Catálogo Geral</span>
      </div>

      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
            Catálogo de Itens & Tabela de Preços
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Gerencie consultas, exames, procedimentos cirúrgicos e itens de farmácia clínica com controle de margens e precificação em tempo real.
          </p>
        </div>

        <button
          onClick={openNew}
          className="px-4 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Adicionar Novo Item ao Catálogo</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Total de Itens Ativos</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1 font-mono">190</p>
          <p className="text-[11px] text-teal-700 font-medium mt-1 flex items-center gap-1">
            <Check className="w-3 h-3" /> 100% atualizados
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Ticket Médio Consulta</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1 font-mono">R$ 164,00</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            ↗ +5.4% este mês
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Vacinas & Imunizantes</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Syringe className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1 font-mono">32</p>
          <p className="text-[11px] text-amber-600 font-medium mt-1">
            ⚠ 2 c/ estoque crítico
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Margem Média Bruta</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0e5a60] flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1 font-mono">68.2%</p>
          <p className="text-[11px] text-teal-700 font-medium mt-1">
            ✓ Dentro da meta alvo
          </p>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar item por nome, código SKU ou categoria..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e5a60] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Categoria:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs bg-slate-50 font-medium text-slate-700"
            >
              <option value="Todas">Todas</option>
              <option value="Consultas">Consultas</option>
              <option value="Vacinas">Vacinas</option>
              <option value="Procedimentos">Procedimentos</option>
              <option value="Medicamentos">Medicamentos</option>
              <option value="Exames">Exames</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Status:</span>
            <select className="border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs bg-slate-50 font-medium text-slate-700">
              <option>Itens Ativos</option>
              <option>Todos</option>
            </select>
          </div>

          <button className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <Filter className="w-3.5 h-3.5" />
            <span>Mais Filtros</span>
          </button>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-5">Código SKU</th>
                <th className="py-3 px-4">Nome do Item / Procedimento</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Descrição Clínica Sucinta</th>
                <th className="py-3 px-4">Unidade</th>
                <th className="py-3 px-4">Valor Base</th>
                <th className="py-3 px-4">Status / Margem</th>
                <th className="py-3 px-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.sku} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5 font-bold font-mono text-[#0e5a60] text-[11px]">
                    {item.sku}
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-bold text-slate-900">{item.name}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200/60">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-500 max-w-xs truncate text-[11px]">
                    {item.description}
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">
                    {item.unit}
                  </td>
                  <td className="py-4 px-4 font-bold font-mono text-slate-900 text-sm">
                    R$ {item.basePrice.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">
                      ↗ {item.marginPercent}% Margem
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-8 h-4.5 rounded-full bg-[#0e5a60] relative p-0.5">
                        <span className="block w-3.5 h-3.5 rounded-full bg-white translate-x-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Exibindo <strong>5</strong> de <strong>190</strong> itens catalogados
          </span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 text-slate-400 hover:text-slate-700">Anterior</button>
            <button className="w-6 h-6 rounded bg-[#0e5a60] text-white font-bold text-xs flex items-center justify-center">
              1
            </button>
            <button className="w-6 h-6 rounded hover:bg-slate-200 text-xs flex items-center justify-center">
              2
            </button>
            <button className="w-6 h-6 rounded hover:bg-slate-200 text-xs flex items-center justify-center">
              3
            </button>
            <span className="px-1 text-slate-400">...</span>
            <button className="px-2.5 py-1 text-slate-600 hover:text-slate-900">Próximo</button>
          </div>
        </div>
      </div>

      {/* Right Drawer: Editar Item do Catálogo */}
      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-[1px] z-40"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Painel de Configuração
                  </p>
                  <h2 className="text-lg font-bold text-slate-900 font-serif">
                    {selectedItem ? 'Editar Item do Catálogo' : 'Novo Item do Catálogo'}
                  </h2>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 mt-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome do Procedimento / Item
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria Clínica
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60] bg-white"
                  >
                    <option value="Consultas">Consultas</option>
                    <option value="Vacinas">Vacinas</option>
                    <option value="Procedimentos">Procedimentos</option>
                    <option value="Medicamentos">Medicamentos</option>
                    <option value="Exames">Exames</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor Base (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-slate-400 font-medium">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      required
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Descrição Clínica Sucinta
                  </label>
                  <textarea
                    rows={4}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                  />
                </div>
              </form>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-[#0e5a60] hover:bg-[#0a454a] text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
