import { useState } from 'react';
import { MapPin, Save, Trash2 } from 'lucide-react';

export default function FloorPlans() {
  const [points, setPoints] = useState<any[]>([]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Pegar coordenadas exatas em percentual, independente da resolução
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPoints([...points, { id: Date.now().toString(), x, y, name: `Novo Espaço ${points.length + 1}` }]);
  };

  const removePoint = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPoints(points.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Editor de Plantas</h1>
          <p className="text-sm text-gray-500 mt-1">Clique na planta para adicionar novos pontos de reserva. As posições são salvas em percentual.</p>
        </div>
        <button className="flex items-center py-2 px-4 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
          <Save className="w-4 h-4 mr-2" />
          Salvar Alterações
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6">
        {/* Área do Editor */}
        <div 
          className="flex-1 border-2 border-dashed border-gray-300 rounded-xl relative bg-gray-50 min-h-[600px] overflow-hidden cursor-crosshair group"
          onClick={handleMapClick}
        >
           <div className="absolute inset-0 bg-gray-100 opacity-20" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
           
           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity">
              <MapPin className="w-24 h-24 text-gray-900" />
           </div>

          {points.map(point => (
            <div
              key={point.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full shadow-lg border-2 border-white flex items-center justify-center text-white cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              title={point.name}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          ))}
        </div>

        {/* Sidebar de Propriedades */}
        <div className="w-full lg:w-80 bg-gray-50/50 rounded-xl p-6 border border-gray-100 h-[600px] flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Espaços Adicionados ({points.length})</h3>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {points.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">Nenhum espaço adicionado ainda. Clique no mapa.</p>
            )}
            
            {points.map(point => (
              <div key={point.id} className="p-3 bg-white rounded-lg shadow-sm border border-gray-100 text-sm group hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <input 
                    type="text" 
                    defaultValue={point.name} 
                    className="font-medium text-gray-900 bg-transparent border-none p-0 focus:ring-0 w-full"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button 
                    onClick={(e) => removePoint(point.id, e)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-4 text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                  <span>X: {point.x.toFixed(2)}%</span>
                  <span>Y: {point.y.toFixed(2)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
