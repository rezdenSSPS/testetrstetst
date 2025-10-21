import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { User } from 'lucide-react';

interface IdCardProps {
  person: {
    id: string;
    name: string;
    photo_url?: string | null; // FIXED: Made this property optional with a '?'
  };
}

export function IdCard({ person }: IdCardProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && person.id) {
      try {
        console.log("Generating barcode for person:", person.name, "ID:", person.id);
        JsBarcode(barcodeRef.current, person.id, {
          format: 'CODE128',
          width: 1.5,
          height: 40,
          displayValue: false,
          margin: 0,
        });
        console.log("Barcode generated successfully for:", person.name);
      } catch (e) {
        console.error("Barcode generation failed for", person.name, ":", e);
      }
    } else {
      console.log("Cannot generate barcode - missing ref or ID:", {
        hasRef: !!barcodeRef.current,
        hasId: !!person.id,
        personName: person.name
      });
    }
  }, [person.id, person.name]);

  return (
    <div className="id-card bg-white rounded-lg shadow-md w-52 h-80 flex flex-col items-center p-3 border border-gray-200 break-inside-avoid">
      <h2 className="text-lg font-bold text-gray-800 mb-2">ARMYCRAFT</h2>
      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center mb-3 border-2 border-gray-300">
        {person.photo_url ? (
          <img src={person.photo_url} alt={person.name} className="w-full h-full object-cover" />
        ) : (
          <User className="w-16 h-16 text-gray-400" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 text-center">{person.name}</h3>
      <div className="mt-auto w-full border border-gray-200 bg-gray-50 p-2">
        <svg ref={barcodeRef} className="w-full h-8"></svg>
        <div className="text-xs text-gray-500 mt-1">ID: {person.id}</div>
      </div>
    </div>
  );
}