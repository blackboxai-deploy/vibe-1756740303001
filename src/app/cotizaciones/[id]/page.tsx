'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Cotizacion } from '@/types/cotizacion';
import { obtenerCotizacionPorId, formatearMoneda, obtenerColorEstado, obtenerTextoEstado } from '@/lib/cotizaciones';
import FormularioCotizacion from '@/components/FormularioCotizacion';
import TablaElementos from '@/components/TablaElementos';
import Link from 'next/link';

export default function DetallesCotizacionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const esEdicion = searchParams.get('editar') === 'true';
  const id = params?.id as string;

  useEffect(() => {
    if (!id) {
      setError('ID de cotización no válido');
      setCargando(false);
      return;
    }

    try {
      const cotizacionEncontrada = obtenerCotizacionPorId(id);
      if (cotizacionEncontrada) {
        setCotizacion(cotizacionEncontrada);
      } else {
        setError('Cotización no encontrada');
      }
    } catch (err) {
      setError('Error al cargar la cotización');
      console.error(err);
    } finally {
      setCargando(false);
    }
  }, [id]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando cotización...</p>
        </div>
      </div>
    );
  }

  if (error || !cotizacion) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Cotización no encontrada'}
          </h1>
          <p className="text-gray-600 mb-6">
            La cotización que buscas no existe o ha sido eliminada.
          </p>
          <Link href="/cotizaciones">
            <Button>Volver a Cotizaciones</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (esEdicion) {
    return <FormularioCotizacion cotizacionInicial={cotizacion} esEdicion={true} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Cotización {cotizacion.numero}
            </h1>
            <div className="flex items-center gap-4">
              <Badge className={obtenerColorEstado(cotizacion.estado)}>
                {obtenerTextoEstado(cotizacion.estado)}
              </Badge>
              <span className="text-sm text-gray-600">
                Creada: {new Date(cotizacion.fecha).toLocaleDateString('es-ES')}
              </span>
              <span className="text-sm text-gray-600">
                Vence: {new Date(cotizacion.fechaVencimiento).toLocaleDateString('es-ES')}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/cotizaciones/${cotizacion.id}?editar=true`}>
              <Button variant="outline">
                ✏️ Editar
              </Button>
            </Link>
            <Link href={`/cotizaciones/${cotizacion.id}/pdf`}>
              <Button>
                📄 Ver PDF
              </Button>
            </Link>
          </div>
        </div>

        {/* Información del Cliente */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold">{cotizacion.cliente.nombre}</h4>
                <p className="text-gray-600">{cotizacion.cliente.empresa}</p>
                {cotizacion.cliente.telefono && (
                  <p className="text-sm text-gray-500">Tel: {cotizacion.cliente.telefono}</p>
                )}
                <p className="text-sm text-gray-500">{cotizacion.cliente.email}</p>
              </div>
              {cotizacion.cliente.direccion && (
                <div>
                  <p className="text-sm text-gray-600">{cotizacion.cliente.direccion}</p>
                  {cotizacion.cliente.ciudad && (
                    <p className="text-sm text-gray-600">
                      {cotizacion.cliente.ciudad} {cotizacion.cliente.codigoPostal}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Elementos de la Cotización */}
        <TablaElementos
          elementos={cotizacion.elementos}
          onElementosChange={() => {}} // Solo lectura
          readonly={true}
        />

        {/* Resumen Financiero */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Resumen Financiero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-w-sm ml-auto">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatearMoneda(cotizacion.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA ({cotizacion.porcentajeImpuesto}%):</span>
                <span className="font-semibold">{formatearMoneda(cotizacion.impuesto)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatearMoneda(cotizacion.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notas y Términos */}
        {(cotizacion.notas || cotizacion.terminosCondiciones) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {cotizacion.notas && (
              <Card>
                <CardHeader>
                  <CardTitle>Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{cotizacion.notas}</p>
                </CardContent>
              </Card>
            )}
            {cotizacion.terminosCondiciones && (
              <Card>
                <CardHeader>
                  <CardTitle>Términos y Condiciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{cotizacion.terminosCondiciones}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Botones de Navegación */}
        <div className="flex gap-4 justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            ← Volver
          </Button>
          <div className="flex gap-2">
            <Link href="/cotizaciones">
              <Button variant="outline">
                📋 Todas las Cotizaciones
              </Button>
            </Link>
            <Link href="/cotizaciones/nueva">
              <Button>
                ➕ Nueva Cotización
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}