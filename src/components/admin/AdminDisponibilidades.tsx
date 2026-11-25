import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CalendarClock,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import {
  agendamentoService,
  type DiaSemana,
  type DisponibilidadeApi,
} from '../../services/agendamentoService';
import {
  veterinarioService,
  type VeterinarioResumoApi,
} from '../../services/veterinarioService';
import { getApiErrorMessage } from '../../services/apiError';

const DIAS: Array<{ value: DiaSemana; label: string }> = [
  { value: 'SEGUNDA', label: 'Segunda-feira' },
  { value: 'TERCA', label: 'Terça-feira' },
  { value: 'QUARTA', label: 'Quarta-feira' },
  { value: 'QUINTA', label: 'Quinta-feira' },
  { value: 'SEXTA', label: 'Sexta-feira' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' },
];

function diaLabel(dia: DiaSemana): string {
  return DIAS.find((option) => option.value === dia)?.label ?? dia;
}

function horaCurta(hora: string): string {
  return hora.slice(0, 5);
}

export const AdminDisponibilidades: React.FC = () => {
  const [vets, setVets] = useState<VeterinarioResumoApi[]>([]);
  const [items, setItems] = useState<DisponibilidadeApi[]>([]);
  const [vetFilter, setVetFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<DisponibilidadeApi | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const [formVet, setFormVet] = useState('');
  const [formDia, setFormDia] = useState<DiaSemana>('SEGUNDA');
  const [formInicio, setFormInicio] = useState('08:00');
  const [formFim, setFormFim] = useState('18:00');
  const [formDuracao, setFormDuracao] = useState('30');

  useEffect(() => {
    veterinarioService
      .listar()
      .then(setVets)
      .catch(() => setVets([]));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError('');

      try {
        const result = await agendamentoService.listarDisponibilidades(
          vetFilter ? Number(vetFilter) : undefined
        );

        if (!cancelled) setItems(result);
      } catch (loadError) {
        if (!cancelled) {
          setItems([]);
          setError(
            getApiErrorMessage(loadError, 'Não foi possível carregar as disponibilidades.')
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [vetFilter, reloadKey]);

  const reload = () => setReloadKey((value) => value + 1);

  const openNew = () => {
    setEditing(null);
    setFormVet(vetFilter || (vets[0] ? String(vets[0].id) : ''));
    setFormDia('SEGUNDA');
    setFormInicio('08:00');
    setFormFim('18:00');
    setFormDuracao('30');
    setFormError('');
    setIsDrawerOpen(true);
  };

  const openEdit = (item: DisponibilidadeApi) => {
    setEditing(item);
    setFormVet(String(item.veterinarioId));
    setFormDia(item.diaSemana);
    setFormInicio(horaCurta(item.horaInicio));
    setFormFim(horaCurta(item.horaFim));
    setFormDuracao(String(item.duracaoConsulta));
    setFormError('');
    setIsDrawerOpen(true);
  };

  const handleSave = async (event?: React.FormEvent) => {
    event?.preventDefault();

    if (!formVet) {
      setFormError('Selecione o veterinário.');
      return;
    }

    if (!formInicio || !formFim || formFim <= formInicio) {
      setFormError('O horário final deve ser posterior ao inicial.');
      return;
    }

    const duracao = Number(formDuracao);

    if (!Number.isInteger(duracao) || duracao <= 0) {
      setFormError('Informe uma duração de consulta válida em minutos.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      const payload = {
        veterinarioId: Number(formVet),
        diaSemana: formDia,
        horaInicio: formInicio,
        horaFim: formFim,
        duracaoConsulta: duracao,
      };

      if (editing) {
        await agendamentoService.atualizarDisponibilidade(editing.id, payload);
      } else {
        await agendamentoService.criarDisponibilidade(payload);
      }

      setIsDrawerOpen(false);
      reload();
    } catch (saveError) {
      setFormError(
        getApiErrorMessage(saveError, 'Não foi possível salvar a disponibilidade.')
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: DisponibilidadeApi) => {
    if (!window.confirm('Excluir esta disponibilidade? Consultas já agendadas não serão afetadas.')) {
      return;
    }

    setPendingDeleteId(item.id);
    setError('');

    try {
      await agendamentoService.excluirDisponibilidade(item.id);
      reload();
    } catch (deleteError) {
      setError(
        getApiErrorMessage(deleteError, 'Não foi possível excluir a disponibilidade.')
      );
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative">
      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <span>Painel Administrativo</span>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Disponibilidades</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">
            Horários de Atendimento
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Configure os dias e janelas em que cada veterinário recebe consultas. A agenda do tutor
            e da recepção usa estas regras para gerar os horários disponíveis.
          </p>
        </div>

        <button
          onClick={openNew}
          className="px-4 py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Disponibilidade</span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CalendarClock className="w-4 h-4 text-[#0e5a60]" />
          <span>Filtrar por veterinário:</span>
          <select
            value={vetFilter}
            onChange={(event) => setVetFilter(event.target.value)}
            className="border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs bg-slate-50 font-medium text-slate-700"
          >
            <option value="">Todos os veterinários</option>
            {vets.map((vet) => (
              <option key={vet.id} value={vet.id}>
                {vet.nomeCompleto}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={reload}
          className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="bg-white rounded-2xl border border-red-200 shadow-2xs p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Falha ao carregar disponibilidades</p>
            <p className="text-xs text-slate-500 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-5">Veterinário</th>
                <th className="py-3 px-4">Dia da Semana</th>
                <th className="py-3 px-4">Início</th>
                <th className="py-3 px-4">Fim</th>
                <th className="py-3 px-4">Duração</th>
                <th className="py-3 px-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] font-semibold text-slate-500">
                        Carregando horários...
                      </span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !error && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <p className="text-sm font-bold text-slate-900">
                      Nenhuma disponibilidade cadastrada
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Cadastre uma janela de atendimento para liberar horários na agenda.
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-900">
                        {vets.find((vet) => vet.id === item.veterinarioId)?.nomeCompleto ??
                          `Veterinário #${item.veterinarioId}`}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200/60">
                        {diaLabel(item.diaSemana)}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-800">
                      {horaCurta(item.horaInicio)}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-800">
                      {horaCurta(item.horaFim)}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-800">
                      {item.duracaoConsulta} min
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
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={pendingDeleteId === item.id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-[1px] z-40"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Configuração de agenda
                  </p>
                  <h2 className="text-lg font-bold text-slate-900 font-serif">
                    {editing ? 'Editar Disponibilidade' : 'Nova Disponibilidade'}
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
                    Veterinário
                  </label>
                  <select
                    value={formVet}
                    onChange={(event) => setFormVet(event.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-[#0e5a60]"
                  >
                    <option value="">Selecione...</option>
                    {vets.map((vet) => (
                      <option key={vet.id} value={vet.id}>
                        {vet.nomeCompleto}
                        {vet.crmv ? ` • ${vet.crmv}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dia da semana
                  </label>
                  <select
                    value={formDia}
                    onChange={(event) => setFormDia(event.target.value as DiaSemana)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-[#0e5a60]"
                  >
                    {DIAS.map((dia) => (
                      <option key={dia.value} value={dia.value}>
                        {dia.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hora inicial
                    </label>
                    <input
                      type="time"
                      value={formInicio}
                      onChange={(event) => setFormInicio(event.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hora final
                    </label>
                    <input
                      type="time"
                      value={formFim}
                      onChange={(event) => setFormFim(event.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duração da consulta (minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formDuracao}
                    onChange={(event) => setFormDuracao(event.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60] font-mono"
                  />
                </div>

                {formError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
                    {formError}
                  </div>
                )}
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
                onClick={() => handleSave()}
                disabled={isSaving}
                className="px-5 py-2 bg-[#0e5a60] hover:bg-[#0a454a] text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-60"
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
