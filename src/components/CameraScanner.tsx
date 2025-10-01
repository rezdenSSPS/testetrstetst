import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Video, X, Trash2 } from 'lucide-react';
import type { Item, ItemVariant } from '../types';

interface ScannedItem extends Item {
  variant: ItemVariant | null;
}

interface CameraScannerProps {
  onScan: (decodedText: string) => void;
  scannedItems: Map<string, { item: ScannedItem; quantity: number }>;
  setScannedItems: (items: Map<string, { item: ScannedItem; quantity: number }>) => void;
}

const SCANNER_ID = 'barcode-scanner';

export function CameraScanner({ onScan, scannedItems, setScannedItems }: CameraScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const lastScanTime = useRef(0);

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(SCANNER_ID, { verbose: false });
    }

    const startScanner = async () => {
      try {
        if (scannerRef.current && scannerRef.current.getState() === Html5QrcodeScannerState.NOT_STARTED) {
          const cameras = await Html5Qrcode.getCameras();
          if (cameras && cameras.length) {
            await scannerRef.current.start(
              { facingMode: 'environment' },
              {
                fps: 5,
                qrbox: { width: 250, height: 150 },
                aspectRatio: 1.7777778,
              },
              (decodedText, _decodedResult) => {
                const now = Date.now();
                if (now - lastScanTime.current > 2000) { // Throttle scans to every 2 seconds
                  lastScanTime.current = now;
                  onScan(decodedText);
                }
              },
              (_errorMessage) => {
                // ignore errors
              }
            );
            setIsScanning(true);
            setError('');
          }
        }
      } catch (err) {
        console.error('Failed to start scanner', err);
        setError('Nepodařilo se spustit kameru. Zkontrolujte oprávnění v prohlížeči.');
      }
    };

    const stopScanner = async () => {
      try {
        if (scannerRef.current && scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.error('Failed to stop scanner', err);
      }
    };

    if (isScanning) {
        startScanner();
    } else {
        stopScanner();
    }

    // Cleanup function
    return () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            stopScanner();
        }
    };
  }, [isScanning, onScan]);

  const removeItem = (key: string) => {
    const newScannedItems = new Map(scannedItems);
    newScannedItems.delete(key);
    setScannedItems(newScannedItems);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <div id={SCANNER_ID} style={{ width: '100%', minHeight: '200px', backgroundColor: '#f0f0f0', borderRadius: '8px', overflow: 'hidden' }}></div>
      
      <button
        onClick={() => setIsScanning(!isScanning)}
        className={`w-full p-4 rounded-lg text-lg font-semibold flex items-center justify-center gap-3 transition-colors ${isScanning ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
        {isScanning ? <><X className="w-6 h-6" /> Ukončit skenování</> : <><Video className="w-6 h-6" /> Spustit skenování</>}
      </button>
      
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {scannedItems.size > 0 && (
        <div>
            <h3 className="text-lg font-semibold text-gray-800 my-3">Položky k zapůjčení:</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {[...scannedItems.entries()].map(([key, { item, quantity }]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          {item.variant && <p className="text-sm text-gray-600">{item.variant.name}</p>}
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-lg">{quantity} ks</span>
                            <button onClick={() => removeItem(key)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
             <button
                onClick={() => setScannedItems(new Map())}
                className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg text-sm"
                > Vyčistit seznam
            </button>
        </div>
      )}
    </div>
  );
}
