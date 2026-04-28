import { useState } from 'react';
import { MapPin, CheckCircle, XCircle } from 'lucide-react';

// Dados simulados para demonstração
const spaces = [
  { id: '1', name: 'Mesa 01', type: 'desk', x: 20, y: 30, isOccupied: false },
  { id: '2', name: 'Mesa 02', type: 'desk', x: 20, y: 50, isOccupied: true },
  { id: '3', name: 'Sala de Reunião Beta', type: 'meeting_room', x: 60, y: 40, isOccupied: false },
  { id: '4', name: 'Mesa 03', type: 'desk', x: 35, y: 60, isOccupied: false, isMine: true },
];

export default function OfficeMap() {
  const [selectedSpace, setSelectedSpace] = useState<any>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Planta Interativa</h1>
          <p className="text-sm text-gray-500 mt-1">Selecione uma mesa ou sala na planta para reservar.</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Livre</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Ocupado</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Minha Reserva</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6">
        {/* Área do Mapa */}
        <div className="flex-1 border-2 border-dashed border-gray-200 rounded-xl relative bg-gray-50 min-h-[600px] overflow-hidden">
          {/* Imagem de fundo da planta (placeholder visual) */}
          <div className="absolute inset-0 bg-gray-100 opacity-20" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          {spaces.map(space => {
            let bgColor = 'bg-emerald-100 text-emerald-600 border-emerald-200 hover:bg-emerald-200';
            if (space.isOccupied) bgColor = 'bg-red-100 text-red-600 border-red-200';
            if (space.isMine) bgColor = 'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200';

            const isSelected = selectedSpace?.id === space.id;

            return (
              <button
                key={space.id}
                onClick={() => setSelectedSpace(space)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-2.5 rounded-full shadow-sm transition-all hover:scale-110 border-2 ${bgColor} ${isSelected ? 'ring-4 ring-primary/30 ring-offset-1 scale-110' : ''}`}
                style={{ left: `${space.x}%`, top: `${space.y}%` }}
                title={space.name}
              >
                <MapPin className="w-5 h-5" />
              </button>
            )
          })}
        </div>

        {/* Sidebar de Detalhes do Espaço */}
        <div className="w-full lg:w-80 bg-gray-50/50 rounded-xl p-6 border border-gray-100">
          {selectedSpace ? (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedSpace.name}</h3>
                <p className="text-sm text-gray-500 capitalize mt-1 border-b pb-4">
                  {selectedSpace.type === 'desk' ? 'Mesa de Trabalho' : 'Sala de Reunião'}
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-sm font-medium">
                {selectedSpace.isOccupied ? (
                  <span className="flex items-center text-red-600 bg-red-50 px-3 py-1.5 rounded-md w-full"><XCircle className="w-4 h-4 mr-2"/> Indisponível no momento</span>
                ) : (
                  <span className="flex items-center text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md w-full"><CheckCircle className="w-4 h-4 mr-2"/> Disponível para reserva</span>
                )}
              </div>
              
              {!selectedSpace.isOccupied && (
                <div className="pt-4 space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Data da Reserva</label>
                  <input type="date" className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2.5 border" />
                  
                  <button className="w-full mt-4 py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm">
                    Confirmar Reserva
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full opacity-60">
              <MapPin className="w-12 h-12 mb-3 text-gray-300" />
              <p className="text-sm font-medium">Selecione um ponto no mapa para visualizar detalhes e reservar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
