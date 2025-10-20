import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Person } from '../types';
import { IdCard } from './IdCard';
import { Camera, Save, Printer, AlertCircle, Loader2 } from 'lucide-react';

interface ParsedPerson {
  name: string;
  date_of_birth: string;
  photo_file?: File;
  photo_preview?: string;
  status: 'new' | 'uploading' | 'saving' | 'saved' | 'error';
  errorMessage?: string;
}

// FIXED: Added props to receive the functions
interface IdCardManagerProps {
  people: Person[];
  uploadPersonPhoto: (file: File) => Promise<string | undefined>;
  batchAddPeople: (peopleData: Omit<Person, 'id' | 'created_at'>[]) => Promise<any[] | null>;
}

export function IdCardManager({ people, uploadPersonPhoto, batchAddPeople }: IdCardManagerProps) {
  const [parsedPeople, setParsedPeople] = useState<ParsedPerson[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Inline fallback avatar to avoid external network calls
  const fallbackAvatar =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><rect width='40' height='40' fill='%23e5e7eb'/><circle cx='20' cy='14' r='8' fill='%239ca3af'/><rect x='6' y='26' width='28' height='10' rx='5' fill='%23cbd5e1'/></svg>";

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet) as any[];

      const newPeople: ParsedPerson[] = json.map((row) => ({
        name: row['Jméno'] || row['name'],
        date_of_birth: row['Datum Narození'] || row['date_of_birth'],
        status: 'new' as const,
      })).filter(p => p.name && p.date_of_birth);

      setParsedPeople(newPeople);
      try {
        localStorage.setItem('idCardManager.parsedPeople', JSON.stringify(newPeople));
      } catch {}
    };
    reader.readAsArrayBuffer(file);
  };
  
  const handlePhotoChange = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const newParsedPeople = [...parsedPeople];
      newParsedPeople[index].photo_file = file;
      newParsedPeople[index].photo_preview = typeof reader.result === 'string' ? reader.result : undefined;
      setParsedPeople(newParsedPeople);
      try {
        // Persist without File object
        const toStore = newParsedPeople.map(({ name, date_of_birth, photo_preview, status, errorMessage }) => ({ name, date_of_birth, photo_preview, status, errorMessage }));
        localStorage.setItem('idCardManager.parsedPeople', JSON.stringify(toStore));
      } catch {}
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAll = async () => {
    setIsProcessing(true);
    const peopleToInsert: Omit<Person, 'id' | 'created_at'>[] = [];

    if (typeof uploadPersonPhoto !== 'function') {
      console.error('uploadPersonPhoto prop is not a function.');
      setIsProcessing(false);
      alert('Nahrávání fotek není dostupné. Zkuste prosím obnovit stránku.');
      return;
    }
    if (typeof batchAddPeople !== 'function') {
      console.error('batchAddPeople prop is not a function.');
      setIsProcessing(false);
      alert('Ukládání osob není dostupné. Zkuste prosím obnovit stránku.');
      return;
    }

    for (let i = 0; i < parsedPeople.length; i++) {
        const person = parsedPeople[i];
        if (person.status !== 'new' || !person.photo_file) continue;

        try {
            updatePersonStatus(i, 'uploading');
            const photo_url = await uploadPersonPhoto(person.photo_file);
            
            updatePersonStatus(i, 'saving');
            peopleToInsert.push({
                name: person.name,
                date_of_birth: new Date(person.date_of_birth).toISOString(),
                photo_url: photo_url,
            });
            updatePersonStatus(i, 'saved');
        } catch(e: any) {
            updatePersonStatus(i, 'error', 'Failed to upload photo');
            console.error(e);
        }
    }
    
    if (peopleToInsert.length > 0) {
        try {
            await batchAddPeople(peopleToInsert);
        } catch (e: any) {
            alert('Error saving people to database: ' + e.message);
        }
    }
    
    setIsProcessing(false);
  };
  
  const updatePersonStatus = (index: number, status: ParsedPerson['status'], errorMessage = '') => {
      setParsedPeople(prev => {
          const updated = [...prev];
          if(updated[index]) {
            updated[index] = { ...updated[index], status, errorMessage };
          }
          try {
            const toStore = updated.map(({ name, date_of_birth, photo_preview, status: s, errorMessage: err }) => ({ name, date_of_birth, photo_preview, status: s, errorMessage: err }));
            localStorage.setItem('idCardManager.parsedPeople', JSON.stringify(toStore));
          } catch {}
          return updated;
      });
  };

  // Rehydrate parsed people from localStorage on mount (for debugging without re-uploading)
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('idCardManager.parsedPeople');
      if (raw) {
        const stored: Partial<ParsedPerson>[] = JSON.parse(raw);
        const cleaned: ParsedPerson[] = stored
          .filter(p => p && p.name && p.date_of_birth)
          .map(p => ({
            name: String(p.name),
            date_of_birth: String(p.date_of_birth),
            photo_preview: typeof p.photo_preview === 'string' ? p.photo_preview : undefined,
            status: (p.status === 'saved' || p.status === 'saving' || p.status === 'uploading' || p.status === 'error') ? p.status : 'new',
            errorMessage: p.errorMessage || '',
          }));
        if (cleaned.length > 0) setParsedPeople(cleaned);
      }
    } catch {}
  }, []);

  const handlePrint = () => {
      window.print();
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
        <style>{`
            @media print {
                /* Hide everything by default */
                body * {
                    visibility: hidden !important;
                }
                
                /* Only show the printable cards container */
                #printable-cards {
                    visibility: visible !important;
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    background: white !important;
                    margin: 0 !important;
                    padding: 0.25in !important;
                    display: grid !important;
                    grid-template-columns: repeat(3, 1fr) !important;
                    gap: 0.1in !important;
                }
                
                /* Make sure all card elements are visible */
                #printable-cards,
                #printable-cards * {
                    visibility: visible !important;
                }
                
                /* Card styling - larger size */
                .id-card { 
                    box-shadow: none !important; 
                    border: 1px solid #000 !important;
                    background: white !important;
                    display: block !important;
                    visibility: visible !important;
                    width: 2.5in !important;
                    height: 3.5in !important;
                    font-size: 14px !important;
                    margin: 0 !important;
                    padding: 0.1in !important;
                }
                
                /* Card container styling */
                .id-card-container { 
                    page-break-inside: avoid !important; 
                    padding: 0 !important;
                    margin: 0 !important;
                    display: block !important;
                    visibility: visible !important;
                }
            }
        `}</style>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Správa ID Karet</h2>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">1. Nahrát Excel soubor</h3>
        <p className="text-sm text-gray-600 mb-3">Soubor musí obsahovat sloupce 'Jméno' a 'Datum Narození'.</p>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
      </div>

      {parsedPeople.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">2. Přidat fotky a uložit</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {parsedPeople.map((person, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white rounded-md gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                              <img src={person.photo_preview || fallbackAvatar} alt="preview" className="w-10 h-10 rounded-full object-cover"/>
                              <span className="font-medium truncate">{person.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {person.status === 'new' && (
                              <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center text-xs">
                                  <Camera className="w-4 h-4 mr-2" />
                                  <span>{person.photo_file ? 'Změnit' : 'Nahrát'}</span>
                                  <input type='file' className="hidden" accept="image/*" onChange={(e) => e.target.files && handlePhotoChange(i, e.target.files[0])}/>
                              </label>
                            )}
                            {person.status === 'uploading' && <Loader2 className="animate-spin text-blue-500" />}
                            {person.status === 'saving' && <Loader2 className="animate-spin text-purple-500" />}
                            {person.status === 'saved' && <span className="text-green-600 font-semibold">Uloženo</span>}
                            {person.status === 'error' && <AlertCircle className="text-red-500" />}
                          </div>
                      </div>
                  ))}
              </div>
              <button onClick={handleSaveAll} disabled={isProcessing || !parsedPeople.some(p => p.photo_file && p.status === 'new')} className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 flex items-center justify-center">
                  {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <Save className="w-5 h-5 mr-2" />}
                  Uložit vše do databáze
              </button>
          </div>
      )}

      {people.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">3. Tisk karet</h3>
              <p className="text-sm text-gray-600 mb-3">Vytiskněte vygenerované karty pro všechny osoby v databázi.</p>
              <button onClick={handlePrint} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center">
                  <Printer className="w-5 h-5 mr-2" /> Vytisknout všechny karty
              </button>
          </div>
      )}

      {people.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Vygenerované ID karty ({people.length} lidí):</h3>
          <div className="mb-4 text-sm text-gray-600">
            Lidé s fotkami: {people.filter(p => p.photo_url).length} | Bez fotek: {people.filter(p => !p.photo_url).length}
          </div>
          <div id="printable-cards" className="grid grid-cols-3 gap-2">
            {people.map(person => (
              <div key={person.id} className="id-card-container">
                <IdCard person={person} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}