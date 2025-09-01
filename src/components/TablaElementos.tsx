'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ElementoCotizacion } from '@/types/cotizacion';
import { formatearMoneda } from '@/lib/cotizaciones';

interface TablaElementosProps {
  elementos: ElementoCotizacion[];
  onElementosChange: (elementos: ElementoCotizacion[]) => void;
  readonly?: boolean;
}

export default function TablaElementos({ elementos, onElementosChange, readonly = false }: TablaElementosProps) {
  const [nuevoElemento, setNuevoElemento] = useState({
    descripcion: '',
    cantidad: 1,
    precioUnitario: 0,
  });

  const agregarElemento = () => {
    if (!nuevoElemento.descripcion || nuevoElemento.precioUnitario <= 0) return;

    const elemento: ElementoCotizacion = {
      id: Date.now().toString(),
      descripcion: nuevoElemento.descripcion,
      cantidad: nuevoElemento.cantidad,
      precioUnitario: nuevoElemento.precioUnitario,
      subtotal: nuevoElemento.cantidad * nuevoElemento.precioUnitario,
    };

    onElementosChange([...elementos, elemento]);
    setNuevoElemento({ descripcion: '', cantidad: 1, precioUnitario: 0 });
  };

  const actualizarElemento = (id: string, campo: keyof ElementoCotizacion, valor: string | number) => {
    const elementosActualizados = elementos.map(elemento => {
      if (elemento.id === id) {
        const actualizado = { ...elemento, [campo]: valor };
        if (campo === 'cantidad' || campo === 'precioUnitario') {
          actualizado.subtotal = actualizado.cantidad * actualizado.precioUnitario;
        }
        return actualizado;
      }
      return elemento;
    });
    onElementosChange(elementosActualizados);
  };

  const eliminarElemento = (id: string) => {
    onElementosChange(elementos.filter(elemento => elemento.id !== id));
  };

  const subtotalTotal = elementos.reduce((sum, elemento) => sum + elemento.subtotal, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Elementos de la Cotización</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Lista de elementos existentes */}
        <div className="space-y-4 mb-6">
          {elementos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay elementos agregados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">Descripción</th>
                    <th className="text-center p-2 font-semibold w-24">Cantidad</th>
                    <th className="text-right p-2 font-semibold w-32">Precio Unit.</th>
                    <th className="text-right p-2 font-semibold w-32">Subtotal</th>
                    {!readonly && <th className="text-center p-2 font-semibold w-20">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {elementos.map((elemento) => (
                    <tr key={elemento.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        {readonly ? (
                          <span>{elemento.descripcion}</span>
                        ) : (
                          <Input
                            value={elemento.descripcion}
                            onChange={(e) => actualizarElemento(elemento.id, 'descripcion', e.target.value)}
                            className="min-w-0"
                          />
                        )}
                      </td>
                      <td className="p-2">
                        {readonly ? (
                          <span className="text-center block">{elemento.cantidad}</span>
                        ) : (
                          <Input
                            type="number"
                            value={elemento.cantidad}
                            onChange={(e) => actualizarElemento(elemento.id, 'cantidad', parseInt(e.target.value) || 0)}
                            className="text-center"
                            min="1"
                          />
                        )}
                      </td>
                      <td className="p-2">
                        {readonly ? (
                          <span className="text-right block">{formatearMoneda(elemento.precioUnitario)}</span>
                        ) : (
                          <Input
                            type="number"
                            value={elemento.precioUnitario}
                            onChange={(e) => actualizarElemento(elemento.id, 'precioUnitario', parseFloat(e.target.value) || 0)}
                            className="text-right"
                            min="0"
                            step="0.01"
                          />
                        )}
                      </td>
                      <td className="p-2 text-right font-semibold">
                        {formatearMoneda(elemento.subtotal)}
                      </td>
                      {!readonly && (
                        <td className="p-2 text-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => eliminarElemento(elemento.id)}
                          >
                            🗑️
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2">
                    <td colSpan={3} className="p-2 text-right font-semibold">
                      Subtotal:
                    </td>
                    <td className="p-2 text-right font-bold text-lg">
                      {formatearMoneda(subtotalTotal)}
                    </td>
                    {!readonly && <td></td>}
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Formulario para agregar nuevo elemento */}
        {!readonly && (
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-4">Agregar Nuevo Elemento</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  placeholder="Describe el producto o servicio"
                  value={nuevoElemento.descripcion}
                  onChange={(e) => setNuevoElemento({ ...nuevoElemento, descripcion: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  value={nuevoElemento.cantidad}
                  onChange={(e) => setNuevoElemento({ ...nuevoElemento, cantidad: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor="precio">Precio Unitario</Label>
                <Input
                  id="precio"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={nuevoElemento.precioUnitario}
                  onChange={(e) => setNuevoElemento({ ...nuevoElemento, precioUnitario: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={agregarElemento} disabled={!nuevoElemento.descripcion || nuevoElemento.precioUnitario <= 0}>
                ➕ Agregar Elemento
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}