import { useAuth } from '../../hooks/useAuth';
import { Calendar, Users, MapPin } from 'lucide-react';

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Olá, {profile?.name?.split(' ')[0] || 'Colaborador'}! 👋</h1>
        <p className="text-gray-500 mt-1 text-lg">Bem-vindo ao ZOOM Office.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900">Próxima Reserva</h3>
          </div>
          <p className="text-sm text-gray-500">Você não tem reservas futuras.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900">Quem vai hoje?</h3>
          </div>
          <p className="text-sm text-gray-500">3 colegas confirmados no escritório hoje.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900">Ações Rápidas</h3>
          </div>
          <button className="text-sm font-medium text-primary hover:underline block mb-2">Reservar Mesa</button>
          <button className="text-sm font-medium text-primary hover:underline block">Agendar Sala de Reunião</button>
        </div>
      </div>
    </div>
  );
}
