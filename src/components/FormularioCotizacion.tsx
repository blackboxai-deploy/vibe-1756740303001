'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Cotizacion, Cliente, EstadoCotizacion, ElementoCotizacion } from '@/types/cotizacion';
import { calcularTotales, generarNumeroCotizacion, formatearMoneda } from '@/lib/cotizaciones';
import { useCotizaciones } from '@/hooks/use-cotizaciones';
import TablaElementos from './TablaElementos';

interface FormularioCotizacionProps {
  cotizacionInicial?: Cotizacion;
  esEdicion?: boolean;
}

export default function FormularioCotizacion({ cotizacionInicial, esEdicion = false }: FormularioCotizacionProps) {
  const router = useRouter();
  const { crear, actualizar } = useCotizaciones();
  const [guardando, setGuardando] = useState(false);

  const [formData, setFormData] = useState<{
    numero: string;
    cliente: Cliente;
    elementos: ElementoCotizacion[];
    estado: EstadoCotizacion;
    notas: string;
    terminosCondiciones: string;
    porcentajeImpuesto: number;
    fechaVencimiento: string;
  }>({
    numero: cotizacionInicial?.numero || '',
    cliente: cotizacionInicial?.cliente || {
      id: '',
      nombre: '',
      email: '',
      empresa: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      codigoPostal: '',
    },
    elementos: cotizacionInicial?.elementos || [],
    estado: cotizacionInicial?.estado || 'borrador',
    notas: cotizacionInicial?.notas || '',
    terminosCondiciones: cotizacionInicial?.terminosCondiciones || 'Esta cotización es válida por 30 días. Los precios incluyen IVA del 19%. Los términos de pago son 50% anticipo y 50% contra entrega.',
    porcentajeImpuesto: cotizacionInicial?.porcentajeImpuesto || 19,
    fechaVencimiento: cotizacionInicial?.fechaVencimiento 
      ? new Date(cotizacionInicial.fechaVencimiento).toISOString().split('T')[0] 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!esEdicion && !formData.numero) {
      setFormData(prev => ({ ...prev, numero: generarNumeroCotizacion() }));
    }
  }, [esEdicion, formData.numero]);

  const handleClienteChange = (campo: keyof Cliente, valor: string) => {
    setFormData(prev => ({
      ...prev,
      cliente: { ...prev.cliente, [campo]: valor }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cliente.nombre || !formData.cliente.email || formData.elementos.length === 0) {
      alert('Por favor complete todos los campos obligatorios y agregue al menos un elemento.');
      return;
    }

    setGuardando(true);

    try {
      const { subtotal, impuesto, total } = calcularTotales(formData.elementos, formData.porcentajeImpuesto);
      
      const cotizacion: Cotizacion = {
        id: cotizacionInicial?.id || Date.now().toString(),
        numero: formData.numero,
        fecha: cotizacionInicial?.fecha || new Date(),
        fechaVencimiento: new Date(formData.fechaVencimiento),
        cliente: {
          ...formData.cliente,
          id: formData.cliente.id || Date.now().toString(),
        },
        elementos: formData.elementos,
        subtotal,
        impuesto,
        porcentajeImpuesto: formData.porcentajeImpuesto,
        total,
        estado: formData.estado,
        notas: formData.notas,
        terminosCondiciones: formData.terminosCondiciones,
        creadoEn: cotizacionInicial?.creadoEn || new Date(),
        actualizadoEn: new Date(),
      };

      const resultado = esEdicion ? actualizar(cotizacion) : crear(cotizacion);
      
      if (resultado.exito) {
        router.push('/cotizaciones');
      } else {
        alert(resultado.error || 'Error al guardar la cotización');
      }
    } catch (error) {
      alert('Error al procesar la cotización');
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  const { subtotal, impuesto, total } = calcularTotales(formData.elementos, formData.porcentajeImpuesto);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {esEdicion ? 'Editar Cotización' : 'Nueva Cotización'}
          </h1>
          <p className="text-gray-600 mt-2">
            {esEdicion ? 'Modifica los datos de tu cotización' : 'Crea una nueva cotización para tu cliente'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numero">Número de Cotización*</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                  required
                  disabled={esEdicion}
                />
              </div>
              <div>
                <Label htmlFor="fechaVencimiento">Fecha de Vencimiento*</Label>
                <Input
                  id="fechaVencimiento"
                  type="date"
                  value={formData.fechaVencimiento}
                  onChange={(e) => setFormData(prev => ({ ...prev, fechaVencimiento: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select value={formData.estado} onValueChange={(value: EstadoCotizacion) => setFormData(prev => ({ ...prev, estado: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borrador">Borrador</SelectItem>
                    <SelectItem value="enviada">Enviada</SelectItem>
                    <SelectItem value="aprobada">Aprobada</SelectItem>
                    <SelectItem value="rechazada">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="impuesto">Porcentaje de IVA (%)</Label>
                <Input
                  id="impuesto"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.porcentajeImpuesto}
                  onChange={(e) => setFormData(prev => ({ ...prev, porcentajeImpuesto: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Información del Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clienteNombre">Nombre del Cliente*</Label>
                <Input
                  id="clienteNombre"
                  value={formData.cliente.nombre}
                  onChange={(e) => handleClienteChange('nombre', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="clienteEmail">Email*</Label>
                <Input
                  id="clienteEmail"
                  type="email"
                  value={formData.cliente.email}
                  onChange={(e) => handleClienteChange('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="clienteEmpresa">Empresa*</Label>
                <Input
                  id="clienteEmpresa"
                  value={formData.cliente.empresa}
                  onChange={(e) => handleClienteChange('empresa', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="clienteTelefono">Teléfono</Label>
                <Input
                  id="clienteTelefono"
                  value={formData.cliente.telefono || ''}
                  onChange={(e) => handleClienteChange('telefono', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="clienteDireccion">Dirección</Label>
                <Input
                  id="clienteDireccion"
                  value={formData.cliente.direccion || ''}
                  onChange={(e) => handleClienteChange('direccion', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="clienteCiudad">Ciudad</Label>
                <Input
                  id="clienteCiudad"
                  value={formData.cliente.ciudad || ''}
                  onChange={(e) => handleClienteChange('ciudad', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="clienteCodigoPostal">Código Postal</Label>
                <Input
                  id="clienteCodigoPostal"
                  value={formData.cliente.codigoPostal || ''}
                  onChange={(e) => handleClienteChange('codigoPostal', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tabla de Elementos */}
          <TablaElementos
            elementos={formData.elementos}
            onElementosChange={(elementos) => setFormData(prev => ({ ...prev, elementos }))}
          />

          {/* Resumen de Totales */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-sm ml-auto">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatearMoneda(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA ({formData.porcentajeImpuesto}%):</span>
                  <span className="font-semibold">{formatearMoneda(impuesto)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatearMoneda(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notas y Términos */}
          <Card>
            <CardHeader>
              <CardTitle>Información Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  placeholder="Notas adicionales para el cliente..."
                  value={formData.notas}
                  onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="terminos">Términos y Condiciones</Label>
                <Textarea
                  id="terminos"
                  value={formData.terminosCondiciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, terminosCondiciones: e.target.value }))}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={guardando}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : (esEdicion ? 'Actualizar Cotización' : 'Crear Cotización')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}