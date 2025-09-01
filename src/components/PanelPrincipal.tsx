'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCotizaciones } from '@/hooks/use-cotizaciones';
import { formatearMoneda } from '@/lib/cotizaciones';
import Link from 'next/link';

export default function PanelPrincipal() {
  const { cotizaciones, obtenerEstadisticas, cargando } = useCotizaciones();
  
  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const estadisticas = obtenerEstadisticas();
  const cotizacionesRecientes = cotizaciones
    .sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Cotizaciones</h1>
          <p className="text-gray-600">Gestiona tus cotizaciones de manera eficiente</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cotizaciones</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">📊</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.total}</div>
              <p className="text-xs text-muted-foreground">Todas las cotizaciones</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">⏳</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{estadisticas.enviadas}</div>
              <p className="text-xs text-muted-foreground">Esperando respuesta</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">✅</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estadisticas.aprobadas}</div>
              <p className="text-xs text-muted-foreground">Cerradas exitosamente</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">💰</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatearMoneda(estadisticas.montoAprobado)}</div>
              <p className="text-xs text-muted-foreground">Cotizaciones aprobadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Gestiona tus cotizaciones fácilmente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/cotizaciones/nueva">
                <Button className="w-full" size="lg">
                  ➕ Nueva Cotización
                </Button>
              </Link>
              <Link href="/cotizaciones">
                <Button variant="outline" className="w-full" size="lg">
                  📋 Ver Todas las Cotizaciones
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de Estados</CardTitle>
              <CardDescription>Distribución actual de cotizaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Borradores</span>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                  {estadisticas.borradores}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Enviadas</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {estadisticas.enviadas}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Aprobadas</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {estadisticas.aprobadas}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Rechazadas</span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                  {estadisticas.rechazadas}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cotizaciones Recientes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cotizaciones Recientes</CardTitle>
                <CardDescription>Últimas 5 cotizaciones creadas</CardDescription>
              </div>
              <Link href="/cotizaciones">
                <Button variant="outline" size="sm">Ver Todas</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {cotizacionesRecientes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No hay cotizaciones aún</p>
                <Link href="/cotizaciones/nueva">
                  <Button>Crear Primera Cotización</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cotizacionesRecientes.map((cotizacion) => (
                  <div key={cotizacion.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <h4 className="font-semibold">{cotizacion.numero}</h4>
                      <p className="text-sm text-gray-600">{cotizacion.cliente.nombre} - {cotizacion.cliente.empresa}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatearMoneda(cotizacion.total)}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        cotizacion.estado === 'borrador' ? 'bg-gray-100 text-gray-800' :
                        cotizacion.estado === 'enviada' ? 'bg-blue-100 text-blue-800' :
                        cotizacion.estado === 'aprobada' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {cotizacion.estado.charAt(0).toUpperCase() + cotizacion.estado.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}