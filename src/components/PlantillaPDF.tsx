'use client';

import { Cotizacion } from '@/types/cotizacion';
import { formatearMoneda } from '@/lib/cotizaciones';

interface PlantillaPDFProps {
  cotizacion: Cotizacion;
}

export default function PlantillaPDF({ cotizacion }: PlantillaPDFProps) {
  const fechaFormateada = new Date(cotizacion.fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const fechaVencimientoFormateada = new Date(cotizacion.fechaVencimiento).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 print:p-0">
      {/* Header de la empresa */}
      <div className="border-b-2 border-gray-300 pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">COTIZACIÓN</h1>
            <div className="text-gray-600">
              <p className="font-semibold">Mi Empresa S.A.S.</p>
              <p>NIT: 900.123.456-7</p>
              <p>Calle 123 #45-67</p>
              <p>Bogotá, Colombia</p>
              <p>Tel: +57 (1) 234-5678</p>
              <p>Email: contacto@miempresa.com</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h2 className="text-xl font-bold text-gray-900">{cotizacion.numero}</h2>
              <p className="text-sm text-gray-600 mt-1">Fecha: {fechaFormateada}</p>
              <p className="text-sm text-gray-600">Vence: {fechaVencimientoFormateada}</p>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                cotizacion.estado === 'borrador' ? 'bg-gray-100 text-gray-800' :
                cotizacion.estado === 'enviada' ? 'bg-blue-100 text-blue-800' :
                cotizacion.estado === 'aprobada' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {cotizacion.estado.charAt(0).toUpperCase() + cotizacion.estado.slice(1)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información del cliente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">COTIZADO PARA:</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold text-gray-900">{cotizacion.cliente.nombre}</p>
            <p className="text-gray-700">{cotizacion.cliente.empresa}</p>
            <p className="text-sm text-gray-600">{cotizacion.cliente.email}</p>
            {cotizacion.cliente.telefono && (
              <p className="text-sm text-gray-600">Tel: {cotizacion.cliente.telefono}</p>
            )}
            {cotizacion.cliente.direccion && (
              <div className="mt-2 text-sm text-gray-600">
                <p>{cotizacion.cliente.direccion}</p>
                {cotizacion.cliente.ciudad && (
                  <p>{cotizacion.cliente.ciudad} {cotizacion.cliente.codigoPostal}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de elementos */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">DETALLE DE LA COTIZACIÓN</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                  Descripción
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 w-20">
                  Cantidad
                </th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900 w-32">
                  Valor Unitario
                </th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900 w-32">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {cotizacion.elementos.map((elemento, index) => (
                <tr key={elemento.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900">
                    {elemento.descripcion}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center text-gray-900">
                    {elemento.cantidad}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right text-gray-900">
                    {formatearMoneda(elemento.precioUnitario)}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">
                    {formatearMoneda(elemento.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totales */}
      <div className="flex justify-end mb-8">
        <div className="w-full max-w-sm">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-semibold text-gray-900">{formatearMoneda(cotizacion.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">IVA ({cotizacion.porcentajeImpuesto}%):</span>
                <span className="font-semibold text-gray-900">{formatearMoneda(cotizacion.impuesto)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">TOTAL:</span>
                  <span className="text-xl font-bold text-gray-900">{formatearMoneda(cotizacion.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notas */}
      {cotizacion.notas && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">NOTAS:</h3>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-gray-800 whitespace-pre-wrap">{cotizacion.notas}</p>
          </div>
        </div>
      )}

      {/* Términos y condiciones */}
      {cotizacion.terminosCondiciones && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">TÉRMINOS Y CONDICIONES:</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{cotizacion.terminosCondiciones}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t pt-6 mt-8 text-center text-sm text-gray-500">
        <p>Esta cotización fue generada electrónicamente y es válida sin firma.</p>
        <p className="mt-1">Para cualquier consulta, no dude en contactarnos.</p>
        <div className="mt-4">
          <p className="font-semibold">¡Gracias por confiar en nosotros!</p>
        </div>
      </div>
    </div>
  );
}