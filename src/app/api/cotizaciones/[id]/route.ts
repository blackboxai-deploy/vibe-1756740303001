import { NextRequest, NextResponse } from 'next/server';
import { obtenerCotizacionPorId, guardarCotizacion, eliminarCotizacion } from '@/lib/cotizaciones';
import { Cotizacion } from '@/types/cotizacion';

// GET: Obtener cotización por ID
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cotizacion = obtenerCotizacionPorId(id);
    
    if (!cotizacion) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cotización no encontrada' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: cotizacion 
    });
  } catch (error) {
    console.error('Error al obtener cotización:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener la cotización' 
      },
      { status: 500 }
    );
  }
}

// PUT: Actualizar cotización
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const datos = await request.json();
    
    const cotizacionExistente = obtenerCotizacionPorId(id);
    if (!cotizacionExistente) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cotización no encontrada' 
        },
        { status: 404 }
      );
    }

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

    const cotizacionActualizada: Cotizacion = {
      ...datos,
      id,
      fecha: datos.fecha ? new Date(datos.fecha) : cotizacionExistente.fecha,
      fechaVencimiento: new Date(datos.fechaVencimiento),
      creadoEn: cotizacionExistente.creadoEn,
      actualizadoEn: new Date(),
    };

    guardarCotizacion(cotizacionActualizada);

    return NextResponse.json({ 
      success: true, 
      data: cotizacionActualizada,
      message: 'Cotización actualizada exitosamente' 
    });
  } catch (error) {
    console.error('Error al actualizar cotización:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar la cotización' 
      },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar cotización
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cotizacion = obtenerCotizacionPorId(id);
    
    if (!cotizacion) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cotización no encontrada' 
        },
        { status: 404 }
      );
    }

    eliminarCotizacion(id);

    return NextResponse.json({ 
      success: true, 
      message: 'Cotización eliminada exitosamente' 
    });
  } catch (error) {
    console.error('Error al eliminar cotización:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al eliminar la cotización' 
      },
      { status: 500 }
    );
  }
}