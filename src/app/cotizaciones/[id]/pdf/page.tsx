'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cotizacion } from '@/types/cotizacion';
import { obtenerCotizacionPorId } from '@/lib/cotizaciones';
import { descargarPDF, imprimirPDF } from '@/lib/generador-pdf';
import PlantillaPDF from '@/components/PlantillaPDF';
import Link from 'next/link';

export default function PDFCotizacionPage() {
  const params = useParams();
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  
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

  const manejarDescarga = async () => {
    if (!cotizacion || !pdfRef.current) return;

    setDescargando(true);
    try {
      await descargarPDF(pdfRef.current, cotizacion);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al generar el PDF. Por favor intenta nuevamente.');
    } finally {
      setDescargando(false);
    }
  };

  const manejarImprimir = () => {
    imprimirPDF();
  };

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
            No se pudo cargar la cotización para generar el PDF.
          </p>
          <Link href="/cotizaciones">
            <Button>Volver a Cotizaciones</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      {/* Barra de acciones - oculta en impresión */}
      <div className="max-w-4xl mx-auto px-6 mb-6 print:hidden">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Vista PDF - {cotizacion.numero}</h1>
              <p className="text-sm text-gray-600">Vista previa para impresión o descarga</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/cotizaciones/${cotizacion.id}`}>
                <Button variant="outline" size="sm">
                  ← Volver
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={manejarImprimir}
              >
                🖨️ Imprimir
              </Button>
              <Button 
                size="sm"
                onClick={manejarDescarga}
                disabled={descargando}
              >
                {descargando ? '⏳ Generando...' : '📥 Descargar PDF'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Vista previa del PDF */}
      <div className="max-w-4xl mx-auto px-6 print:px-0">
        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-0 print:p-0">
            <div ref={pdfRef} className="print:shadow-none">
              <PlantillaPDF cotizacion={cotizacion} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional - oculta en impresión */}
      <div className="max-w-4xl mx-auto px-6 mt-6 print:hidden">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-500">
              <p>💡 <strong>Consejo:</strong> Para obtener el mejor resultado en PDF, utiliza el botón de descarga.</p>
              <p className="mt-2">Para imprimir directamente desde tu navegador, usa el botón de imprimir.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estilos CSS para impresión */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5cm;
            size: A4;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:border-0 {
            border: none !important;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          .print\\:px-0 {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          
          .print\\:bg-white {
            background-color: white !important;
          }
        }
      `}</style>
    </div>
  );
}