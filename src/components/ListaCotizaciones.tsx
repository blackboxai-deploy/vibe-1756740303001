'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCotizaciones } from '@/hooks/use-cotizaciones';
import { FiltrosCotizacion, EstadoCotizacion } from '@/types/cotizacion';
import TarjetaCotizacion from './TarjetaCotizacion';
import Link from 'next/link';

export default function ListaCotizaciones() {
  const { cotizaciones, eliminar, cargando } = useCotizaciones();
  const [filtros, setFiltros] = useState<FiltrosCotizacion>({});
  const [busqueda, setBusqueda] = useState('');

  const cotizacionesFiltradas = useMemo(() => {
    let resultado = [...cotizaciones];

    // Filtrar por estado
    if (filtros.estado) {
      resultado = resultado.filter(c => c.estado === filtros.estado);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(c =>
        c.numero.toLowerCase().includes(termino) ||
        c.cliente.nombre.toLowerCase().includes(termino) ||
        c.cliente.empresa.toLowerCase().includes(termino) ||
        c.elementos.some(e => e.descripcion.toLowerCase().includes(termino))
      );
    }

    // Ordenar por fecha de creación (más recientes primero)
    resultado.sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime());

    return resultado;
  }, [cotizaciones, filtros, busqueda]);

  const limpiarFiltros = () => {
    setFiltros({});
    setBusqueda('');
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando cotizaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cotizaciones</h1>
            <p className="text-gray-600 mt-2">
              Gestiona todas tus cotizaciones ({cotizacionesFiltradas.length} de {cotizaciones.length})
            </p>
          </div>
          <Link href="/cotizaciones/nueva">
            <Button size="lg">
              ➕ Nueva Cotización
            </Button>
          </Link>
        </div>

        {/* Filtros y Búsqueda */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros y Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Buscar por número, cliente, empresa o descripción..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <div>
                <Select 
                  value={filtros.estado || 'todos'} 
                  onValueChange={(value) => setFiltros(prev => ({ 
                    ...prev, 
                    estado: value === 'todos' ? undefined : value as EstadoCotizacion 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="borrador">Borrador</SelectItem>
                    <SelectItem value="enviada">Enviada</SelectItem>
                    <SelectItem value="aprobada">Aprobada</SelectItem>
                    <SelectItem value="rechazada">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button variant="outline" onClick={limpiarFiltros} className="w-full">
                  🧹 Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {cotizaciones.filter(c => c.estado === 'borrador').length}
              </div>
              <p className="text-xs text-muted-foreground">Borradores</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {cotizaciones.filter(c => c.estado === 'enviada').length}
              </div>
              <p className="text-xs text-muted-foreground">Enviadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {cotizaciones.filter(c => c.estado === 'aprobada').length}
              </div>
              <p className="text-xs text-muted-foreground">Aprobadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {cotizaciones.filter(c => c.estado === 'rechazada').length}
              </div>
              <p className="text-xs text-muted-foreground">Rechazadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Cotizaciones */}
        {cotizacionesFiltradas.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              {cotizaciones.length === 0 ? (
                <>
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold mb-2">No hay cotizaciones aún</h3>
                  <p className="text-gray-600 mb-6">Crea tu primera cotización para comenzar a gestionar tus ventas</p>
                  <Link href="/cotizaciones/nueva">
                    <Button>Crear Primera Cotización</Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">No se encontraron cotizaciones</h3>
                  <p className="text-gray-600 mb-6">Intenta ajustar los filtros de búsqueda</p>
                  <Button onClick={limpiarFiltros}>Limpiar Filtros</Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cotizacionesFiltradas.map((cotizacion) => (
              <TarjetaCotizacion
                key={cotizacion.id}
                cotizacion={cotizacion}
                onEliminar={eliminar}
              />
            ))}
          </div>
        )}

        {/* Información adicional */}
        {cotizacionesFiltradas.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Mostrando {cotizacionesFiltradas.length} de {cotizaciones.length} cotizaciones
          </div>
        )}
      </div>
    </div>
  );
}