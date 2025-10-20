import { useState } from 'react';
import { Loader2, Target, AlertCircle, ScanLine, Edit } from 'lucide-react';
import { LoanForm } from './components/LoanForm';
import { LoanCard } from './components/LoanCard';
import { AdminPanel } from './components/AdminPanel';
import { CameraScanner } from './components/CameraScanner';
import { useItems } from './hooks/useItems';
import { usePeople } from './hooks/usePeople';
import { useLoans } from './hooks/useLoans';
// supabase client is used inside hooks; no direct import needed here
import type { Item, Person, ItemVariant } from './types';

interface ScannedItem extends Item {
  variant: ItemVariant | null;
}

function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [notification, setNotification] = useState('');
  const [isErrorNotification, setIsErrorNotification] = useState(false);
  const [loanMode, setLoanMode] = useState<'form' | 'scan'>('form');
  
  const { items, loading: itemsLoading, addItem, updateItemQuantity, addVariant, deleteItem, deleteVariant, getItemOrVariantById } = useItems();
  const { people, loading: peopleLoading, addPerson, getPersonById, batchAddPeople, uploadPersonPhoto } = usePeople();
  // Debug: verify we actually received the functions from the hook
  console.log('App.tsx: typeof uploadPersonPhoto from usePeople =', typeof uploadPersonPhoto);
  console.log('App.tsx: typeof batchAddPeople from usePeople =', typeof batchAddPeople);
  const { 
    loans, 
    loading: loansLoading, 
    createLoan, 
    returnLoan, 
    updateLoanCondition,
    uploadLoanPhoto: uploadLoanPicture,
  } = useLoans();

  const [scannedItems, setScannedItems] = useState<Map<string, { item: ScannedItem; quantity: number }>>(new Map());

  const showNotification = (message: string, isError = false) => {
    setNotification(message); 
    setIsErrorNotification(isError);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleLoanSubmit = async (itemId: string, personId: string, quantity: number, notes: string, variantId: string | null) => {
    try {
      await createLoan(itemId, personId, quantity, notes, variantId);
      await updateItemQuantity(itemId, quantity, variantId || undefined);
      showNotification('Věc byla úspěčně půjčena!');
    } catch (error) {
      console.error('Error creating loan:', error);
      showNotification('Chyba při půjčování věci!', true);
    }
  };
  
  const handleBarcodeScan = async (decodedText: string) => {
    const person = await getPersonById(decodedText);
    if (person) {
        if (scannedItems.size === 0) {
            showNotification('Nejprve naskenujte nějaké produkty!', true);
            return;
        }
        await handleSubmitScannedItems(person);
        return;
    }

    const foundItem = await getItemOrVariantById(decodedText);
    if (foundItem) {
        const key = foundItem.variant ? foundItem.variant.id : foundItem.id;
        const existing = scannedItems.get(key);
        const maxQuantity = foundItem.variant ? foundItem.variant.available_quantity : foundItem.available_quantity;
        if (existing && existing.quantity >= maxQuantity) {
            showNotification('Nelze přidat další kusy, není skladem.', true);
            return;
        }
        const newScannedItems = new Map(scannedItems);
        if (existing) {
          newScannedItems.set(key, { ...existing, quantity: existing.quantity + 1 });
        } else {
          if (maxQuantity < 1) {
              showNotification('Tato položka není skladem.', true);
              return;
          }
          newScannedItems.set(key, { item: foundItem, quantity: 1 });
        }
        setScannedItems(newScannedItems);
        showNotification(`Přidáno: ${foundItem.name} ${foundItem.variant ? `(${foundItem.variant.name})` : ''}`);
        return;
    }
    
    showNotification('Neznámý kód.', true);
  };

  const handleSubmitScannedItems = async (person: Person) => {
    if (!person || scannedItems.size === 0) return;
    try {
        const notes = '';
        for (const [_key, { item, quantity }] of scannedItems) {
            await createLoan(item.id, person.id, quantity, notes, item.variant?.id || null);
            await updateItemQuantity(item.id, quantity, item.variant?.id || undefined);
        }
        showNotification(`Půjčka pro ${person.name} byla úspěšně vytvořena.`);
        setScannedItems(new Map());
    } catch (err) {
        showNotification('Nepodařilo se vytvořit půjčku.', true);
        console.error(err);
    }
  }

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
      showNotification('Chyba při vracení věci!', true);
    }
  };

  const handleAddItem = async (name: string, quantity: number, consumable: boolean) => {
    try {
      await addItem(name, quantity, consumable);
      showNotification('Nová věc byla přidána!');
    } catch (error) {
      console.error('Error adding item:', error);
      showNotification('Chyba při přidávání věci!', true);
    }
  };

  const handleAddVariant = async (itemId: string, name: string, quantity: number) => {
    try {
      await addVariant(itemId, name, quantity);
      showNotification('Varianta byla úspěšně přidána!');
    } catch (error) {
      console.error('Error adding variant:', error);
      showNotification('Chyba při přidávání varianty!', true);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Opravdu chcete smazat tuto věc a všechny její varianty?')) {
      try {
        await deleteItem(itemId);
        showNotification('Věc byla úspěšně smazána!');
      } catch (error) {
        console.error('Error deleting item:', error);
        showNotification('Chyba při mazání věci!', true);
      }
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (window.confirm('Opravdu chcete smazat tuto variantu?')) {
      try {
        await deleteVariant(variantId);
        showNotification('Varianta byla úspěšně smazána!');
      } catch (error) {
        console.error('Error deleting variant:', error);
        showNotification('Chyba při mazání varianty!', true);
      }
    }
  };

  const handleAddPerson = async (name: string) => {
    try {
      await addPerson(name);
      showNotification('Nová osoba byla přidána!');
    } catch (error) {
      console.error('Error adding person:', error);
      showNotification('Chyba při přidávání osoby!', true);
    }
  };

  const loading = itemsLoading || peopleLoading || loansLoading;

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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">ARMYCRAFT</h1>
            </div>
            <button
              onClick={() => setShowAdmin(!showAdmin)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >{showAdmin ? 'Zavřít admin' : 'Administrace'}</button>
          </div>
        </div>
      </header>

      {notification && (
        <div className={`fixed top-4 right-4 z-50 ${isErrorNotification ? 'bg-red-600' : 'bg-green-600'} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in`}>
          <AlertCircle className="w-5 h-5" />{notification}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-xl shadow-lg p-2 mb-6 flex items-center gap-2">
              <button onClick={() => setLoanMode('form')} className={`flex-1 p-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${loanMode === 'form' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}><Edit className="w-5 h-5" /> Manuálně</button>
              <button onClick={() => setLoanMode('scan')} className={`flex-1 p-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${loanMode === 'scan' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}><ScanLine className="w-5 h-5" /> Skenovat</button>
            </div>
            {loanMode === 'form' ? (<LoanForm items={items} people={people} onSubmit={handleLoanSubmit} />) : (<CameraScanner onScan={handleBarcodeScan} scannedItems={scannedItems} setScannedItems={setScannedItems} />)}
            
            {/* THIS BLOCK IS THE FIX */}
            {showAdmin && (
              <AdminPanel
                items={items}
                people={people}
                onAddItem={handleAddItem}
                onAddPerson={handleAddPerson}
                onAddVariant={handleAddVariant}
                onDeleteItem={handleDeleteItem}
                onDeleteVariant={handleDeleteVariant}
                batchAddPeople={batchAddPeople ?? (async () => [])}
                uploadPersonPhoto={uploadPersonPhoto ?? (async () => undefined)}
              />
            )}
            
          </div>
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"><Target className="w-8 h-8 text-orange-600" />Aktivní půjčky ({loans.length})</h2>
              {loans.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4"><Target className="w-16 h-16 mx-auto" /></div>
                  <p className="text-xl text-gray-600">Žádné aktivní půjčky</p>
                  <p className="text-gray-500">Půjčte nějaké vybavení výše</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {loans.map(loan => (<LoanCard key={loan.id} loan={loan} onReturn={handleLoanReturn} onUpdateCondition={updateLoanCondition} onUploadPhoto={uploadLoanPicture} />))}
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