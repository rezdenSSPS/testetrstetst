import { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Camera, FileText, Clock } from 'lucide-react';
import type { Loan } from '../types';

interface LoanCardProps {
  loan: Loan;
  onReturn: (loanId: string) => Promise<void>;
  onUpdateCondition: (loanId: string, notes: string, photo?: string) => Promise<void>;
  onUploadPhoto: (loanId: string, file: File) => Promise<string | undefined>;
}

export function LoanCard({ loan, onReturn, onUpdateCondition, onUploadPhoto }: LoanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [conditionNotes, setConditionNotes] = useState(loan.condition_notes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReturn = async () => {
    setIsReturning(true);
    try {
      await onReturn(loan.id);
    } catch (error) {
      console.error('Error returning loan:', error);
    } finally {
      setIsReturning(false);
    }
  };

  const handleUpdateCondition = async () => {
    setIsUpdating(true);
    try {
      await onUpdateCondition(loan.id, conditionNotes);
    } catch (error) {
      console.error('Error updating condition:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      await onUploadPhoto(loan.id, file);
    } catch (error) {
      alert('Chyba při nahrávání fotografie.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handlePhotoButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-l-orange-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            {loan.items?.name || 'Neznámá věc'}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDate(loan.loaned_at)}
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-800">
            {loan.people?.name || 'Neznámá osoba'}
          </div>
          <div className="text-sm text-gray-600">
            Množství: {loan.quantity}
          </div>
        </div>
      </div>

      {loan.notes && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Poznámka:</strong> {loan.notes}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors p-2 hover:bg-gray-50 rounded-lg"
        >
          <span className="text-sm font-medium">Detail</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={handleReturn}
          disabled={isReturning}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          {isReturning ? 'Vracím...' : 'Vrátit'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
          {loan.condition_photo && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nahraná fotografie
              </label>
              <img 
                src={loan.condition_photo} 
                alt="Stav věci" 
                className="rounded-lg max-w-xs max-h-48 object-cover border"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Stav a poznámky
            </label>
            <textarea
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              placeholder="Popište stav věci, případné poškození..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleUpdateCondition}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {isUpdating ? 'Ukládám...' : 'Uložit'}
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoSelect}
              accept="image/*"
              className="hidden"
            />

            <button
              onClick={handlePhotoButtonClick}
              disabled={isUploadingPhoto}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              {isUploadingPhoto ? 'Nahrávám...' : 'Nová fotka'}
            </button>
          </div>

          {loan.condition_notes && loan.condition_notes !== conditionNotes && (
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Uložený stav:</strong> {loan.condition_notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
