'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cotizacion } from '@/types/cotizacion';
import { formatearMoneda, obtenerColorEstado, obtenerTextoEstado } from '@/lib/cotizaciones';
import Link from 'next/link';

interface TarjetaCotizacionProps {
  cotizacion: Cotizacion;
  onEliminar?: (id: string) => void;
}

export default function TarjetaCotizacion({ cotizacion, onEliminar }: TarjetaCotizacionProps) {
  const fechaVencimiento = new Date(cotizacion.fechaVencimiento);
  const hoy = new Date();
  const diasVencimiento = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 3600 * 24));
  const estaVencida = diasVencimiento < 0;
  const proximaVencer = diasVencimiento <= 7 && diasVencimiento > 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{cotizacion.numero}</h3>
            <p className="text-sm text-gray-600">
              {cotizacion.cliente.nombre} - {cotizacion.cliente.empresa}
            </p>
          </div>
          <Badge className={obtenerColorEstado(cotizacion.estado)}>
            {obtenerTextoEstado(cotizacion.estado)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total:</span>
          <span className="font-bold text-lg">{formatearMoneda(cotizacion.total)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Fecha:</span>
          <span className="text-sm">{new Date(cotizacion.fecha).toLocaleDateString('es-ES')}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Vencimiento:</span>
          <span className={`text-sm ${estaVencida ? 'text-red-600 font-semibold' : proximaVencer ? 'text-orange-600 font-semibold' : ''}`}>
            {fechaVencimiento.toLocaleDateString('es-ES')}
            {estaVencida && ' (Vencida)'}
            {proximaVencer && ' (Por vencer)'}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>{cotizacion.elementos.length} elemento(s)</span>
          <span>Creada: {new Date(cotizacion.creadoEn).toLocaleDateString('es-ES')}</span>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Link href={`/cotizaciones/${cotizacion.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              👁️ Ver
            </Button>
          </Link>
          <Link href={`/cotizaciones/${cotizacion.id}?editar=true`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              ✏️ Editar
            </Button>
          </Link>
          <Link href={`/cotizaciones/${cotizacion.id}/pdf`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              📄 PDF
            </Button>
          </Link>
          {onEliminar && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                if (confirm('¿Estás seguro de que deseas eliminar esta cotización?')) {
                  onEliminar(cotizacion.id);
                }
              }}
            >
              🗑️
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}