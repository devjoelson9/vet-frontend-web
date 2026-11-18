import React, { useEffect, useState } from 'react';
import { AlertCircle, Bird, Cat, Dog, HelpCircle, PawPrint, Trash2, X } from 'lucide-react';
import type { AnimalApi, AnimalRequest, ApiSexo } from '../../types/api';
import type { Pet } from '../../types';
import { mapAnimalToPet } from '../../utils/identityMappers';

interface AnimalEditDrawerProps {
  isOpen: boolean;
  animal: AnimalApi | null;
  tutorName: string;
  isLoading?: boolean;
  isSaving?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (payload: AnimalRequest) => void;
  onDelete?: () => void;
}

function SpeciesIcon({ species, className }: { species: Pet['species']; className?: string }) {
  if (species === 'Cão') return <Dog className={className} />;
  if (species === 'Gato') return <Cat className={className} />;
  if (species === 'Ave') return <Bird className={className} />;

  return <HelpCircle className={className} />;
}

export const AnimalEditDrawer: React.FC<AnimalEditDrawerProps> = ({
  isOpen,
  animal,
  tutorName,
  isLoading = false,
  isSaving = false,
  error = '',
  onClose,
  onSubmit,
  onDelete,
}) => {
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState<Pet['species']>('Cão');
  const [breed, setBreed] = useState('');
  const [sexo, setSexo] = useState<ApiSexo | ''>('');
  const [birthDate, setBirthDate] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!animal) return;

    const pet = mapAnimalToPet(animal);
    setPetName(animal.nome);
    setSpecies(pet.species);
    setBreed(animal.raca ?? '');
    setSexo(animal.sexo ?? '');
    setBirthDate(animal.dataNascimento ?? '');
    setWeight(animal.peso != null ? String(animal.peso).replace('.', ',') : '');
    setNotes(animal.observacoes ?? '');
    setValidationError('');
  }, [animal]);

  if (!isOpen) return null;

  const submitForm = () => {
    setValidationError('');

    if (!petName.trim()) {
      setValidationError('Informe o nome do animal.');
      return;
    }

    const parsedWeight = Number.parseFloat(weight.replace(',', '.'));

    if (weight.trim() && (!Number.isFinite(parsedWeight) || parsedWeight < 0)) {
      setValidationError('Informe um peso válido, maior ou igual a zero.');
      return;
    }

    onSubmit({
      nome: petName.trim(),
      especie: species,
      raca: breed.trim() || null,
      sexo: sexo || null,
      dataNascimento: birthDate || null,
      peso: weight.trim() && Number.isFinite(parsedWeight) ? parsedWeight : null,
      observacoes: notes.trim() || null,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/25 backdrop-blur-[1px] z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 no-scrollbar">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-50 text-[#0e5a60] flex items-center justify-center">
                <PawPrint className="w-3.5 h-3.5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-serif">Editar Pet</h2>
                <p className="text-[10px] text-slate-400">Tutor: {tutorName || '—'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-7 h-7 border-4 border-[#0e5a60] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Carregando animal...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Pet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  required
                  maxLength={100}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Espécie <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {(['Cão', 'Gato', 'Ave', 'Outro'] as const).map((sp) => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => setSpecies(sp)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        species === sp
                          ? 'border-[#0e5a60] bg-teal-50/60 font-bold text-[#0e5a60] ring-1 ring-[#0e5a60]'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <SpeciesIcon species={sp} className="w-4 h-4" />
                      <span>{sp}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Raça</label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    maxLength={50}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sexo</label>
                  <select
                    value={sexo}
                    onChange={(e) => setSexo(e.target.value as ApiSexo | '')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60] bg-white"
                  >
                    <option value="">Não informado</option>
                    <option value="MACHO">Macho</option>
                    <option value="FEMEA">Fêmea</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nascimento
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                    className="w-full px-2 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peso (kg)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="14.5"
                    className="w-full px-2 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0e5a60] resize-none"
                />
              </div>

              {(validationError || error) && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{validationError || error}</span>
                </div>
              )}
            </form>
          )}
        </div>

        <div className="pt-6 border-t border-slate-100 space-y-2">
          <button
            type="button"
            onClick={submitForm}
            disabled={isSaving || isLoading}
            className="w-full py-2.5 bg-[#0e5a60] hover:bg-[#0a454a] text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isSaving || isLoading}
              className="w-full py-2 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-50 disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Excluir Animal
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
};
