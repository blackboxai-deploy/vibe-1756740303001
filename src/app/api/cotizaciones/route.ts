import { NextRequest, NextResponse } from 'next/server';
import { obtenerCotizaciones, guardarCotizacion } from '@/lib/cotizaciones';
import { Cotizacion } from '@/types/cotizacion';

// GET: Obtener todas las cotizaciones
export async function GET() {
  try {
    const cotizaciones = obtenerCotizaciones();
    return NextResponse.json({ 
      success: true, 
      data: cotizaciones,
      count: cotizaciones.length 
    });
  } catch (error) {
    console.error('Error al obtener cotizaciones:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener las cotizaciones' 
      },
      { status: 500 }
    );
  }
}

// POST: Crear nueva cotización
export async function POST(request: NextRequest) {
  try {
    const datos = await request.json();
    
    // Validar datos requeridos
    if (!datos.cliente?.nombre || !datos.cliente?.email || !datos.elementos?.length) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Faltan datos obligatorios (cliente.nombre, cliente.email, elementos)' 
        },
        { status: 400 }
      );
    }

    const cotizacion: Cotizacion = {
      ...datos,
      id: datos.id || Date.now().toString(),
      fecha: datos.fecha ? new Date(datos.fecha) : new Date(),
      fechaVencimiento: new Date(datos.fechaVencimiento),
      creadoEn: datos.creadoEn ? new Date(datos.creadoEn) : new Date(),
      actualizadoEn: new Date(),
    };

    guardarCotizacion(cotizacion);

    return NextResponse.json({ 
      success: true, 
      data: cotizacion,
      message: 'Cotización creada exitosamente' 
    });
  } catch (error) {
    console.error('Error al crear cotización:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear la cotización' 
      },
      { status: 500 }
    );
  }
}