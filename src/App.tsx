import { useState } from 'react';
import { Loader2, Target, AlertCircle, Database } from 'lucide-react';
import { LoanForm } from './components/LoanForm';
import { LoanCard } from './components/LoanCard';
import { AdminPanel } from './components/AdminPanel';
import { useItems } from './hooks/useItems';
import { usePeople } from './hooks/usePeople';
import { useLoans } from './hooks/useLoans';
import { supabase } from './lib/supabase';

function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [notification, setNotification] = useState('');
  
  const { items, loading: itemsLoading, addItem, updateItemQuantity } = useItems();
  const { people, loading: peopleLoading, addPerson } = usePeople();
  const { 
    loans, 
    loading: loansLoading, 
    createLoan, 
    returnLoan, 
    updateLoanCondition,
    uploadLoanPhoto
  } = useLoans();

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleLoanSubmit = async (itemId: string, personId: string, quantity: number, notes: string, variantId: string | null) => {
    try {
      await createLoan(itemId, personId, quantity, notes, variantId);
      await updateItemQuantity(itemId, quantity, variantId || undefined);
      showNotification('Věc byla úspěšně půjčena!');
    } catch (error) {
      console.error('Error creating loan:', error);
      showNotification('Chyba při půjčování věci!');
    }
  };

  const handleLoanReturn = async (loanId: string) => {
    try {
      const loan = loans.find(l => l.id === loanId);
      if (loan) {
        await returnLoan(loanId);
        await updateItemQuantity(loan.item_id, -loan.quantity, loan.variant_id || undefined);
        showNotification('Věc byla úspěšně vrácena!');
      }
    } catch (error) {
      console.error('Error returning loan:', error);
      showNotification('Chyba při vracení věci!');
    }
  };

  const handleAddItem = async (name: string, quantity: number) => {
    try {
      await addItem(name, quantity);
      showNotification('Nová věc byla přidána!');
    } catch (error) {
      console.error('Error adding item:', error);
      showNotification('Chyba při přidávání věci!');
    }
  };

  const handleAddPerson = async (name: string) => {
    try {
      await addPerson(name);
      showNotification('Nová osoba byla přidána!');
    } catch (error) {
      console.error('Error adding person:', error);
      showNotification('Chyba při přidávání osoby!');
    }
  };

  const loading = itemsLoading || peopleLoading || loansLoading;

  if (!supabase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <Database className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Databáze není nakonfigurována
          </h1>
          <p className="text-gray-600 mb-6">
            Pro spuštění systému je potřeba nakonfigurovat Supabase databázi.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg text-left">
            <p className="text-sm text-blue-800 font-semibold mb-2">Kroky k nastavení:</p>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Klikněte na ikonu nastavení ⚙️</li>
              <li>2. Vyberte "Supabase"</li>
              <li>3. Zadejte URL a API klíč</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-xl font-semibold text-gray-700">
          <Loader2 className="w-8 h-8 animate-spin" />
          Načítání systému...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Airsoft Půjčovna
              </h1>
            </div>
            
            <button
              onClick={() => setShowAdmin(!showAdmin)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              {showAdmin ? 'Zavřít admin' : 'Administrace'}
            </button>
          </div>
        </div>
      </header>

      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-5 h-5" />
          {notification}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <LoanForm
              items={items}
              people={people}
              onSubmit={handleLoanSubmit}
            />

            {showAdmin && (
              <AdminPanel
                items={items}
                people={people}
                onAddItem={handleAddItem}
                onAddPerson={handleAddPerson}
              />
            )}
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Target className="w-8 h-8 text-orange-600" />
                Aktivní půjčky ({loans.length})
              </h2>

              {loans.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Target className="w-16 h-16 mx-auto" />
                  </div>
                  <p className="text-xl text-gray-600">Žádné aktivní půjčky</p>
                  <p className="text-gray-500">Půjčte nějaké vybavení výše</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {loans.map(loan => (
                    <LoanCard
                      key={loan.id}
                      loan={loan}
                      onReturn={handleLoanReturn}
                      onUpdateCondition={updateLoanCondition}
                      onUploadPhoto={uploadLoanPhoto}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
