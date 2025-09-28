// ... importy

// Interface zůstává stejný jako v předchozím kroku

export function LoanCard({ loan, onReturn, onUpdateCondition, onUploadPhoto }: LoanCardProps) {
  // ... stavy a funkce zůstávají stejné

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-l-orange-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            {/* Zobrazíme název hlavní věci */}
            {loan.items?.name || 'Neznámá věc'}
            {/* Pokud existuje varianta, zobrazíme i její název */}
            {loan.item_variants && (
              <span className="text-lg text-gray-600 font-medium ml-2">- {loan.item_variants.name}</span>
            )}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {/* ... zbytek JSX (datum) zůstává stejný */}
          </div>
        </div>
        
        <div className="text-right">
            {/* ... zbytek JSX (osoba a množství) zůstává stejný */}
        </div>
      </div>

      {/* ... zbytek komponenty zůstává stejný */}
    </div>
  );
}
