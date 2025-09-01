'use client';

import { useState, useEffect } from 'react';
import { Cotizacion, FiltrosCotizacion, EstadisticasCotizaciones } from '@/types/cotizacion';
import { 
  obtenerCotizaciones, 
  guardarCotizacion, 
  eliminarCotizacion,
  filtrarCotizaciones,
  calcularEstadisticas
} from '@/lib/cotizaciones';

export const useCotizaciones = () => {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarCotizaciones = () => {
    setCargando(true);
    try {
      const datos = obtenerCotizaciones();
      setCotizaciones(datos);
    } catch (error) {
      console.error('Error al cargar cotizaciones:', error);
    } finally {
      setCargando(false);
    }
  };

  const crear = (cotizacion: Cotizacion) => {
    try {
      guardarCotizacion(cotizacion);
      cargarCotizaciones();
      return { exito: true };
    } catch (error) {
      console.error('Error al crear cotización:', error);
      return { exito: false, error: 'Error al crear la cotización' };
    }
  };

  const actualizar = (cotizacion: Cotizacion) => {
    try {
      guardarCotizacion(cotizacion);
      cargarCotizaciones();
      return { exito: true };
    } catch (error) {
      console.error('Error al actualizar cotización:', error);
      return { exito: false, error: 'Error al actualizar la cotización' };
    }
  };

  const eliminar = (id: string) => {
    try {
      eliminarCotizacion(id);
      cargarCotizaciones();
      return { exito: true };
    } catch (error) {
      console.error('Error al eliminar cotización:', error);
      return { exito: false, error: 'Error al eliminar la cotización' };
    }
  };

  const filtrar = (filtros: FiltrosCotizacion): Cotizacion[] => {
    return filtrarCotizaciones(cotizaciones, filtros);
  };

  const obtenerEstadisticas = (): EstadisticasCotizaciones => {
    return calcularEstadisticas(cotizaciones);
  };

  useEffect(() => {
    cargarCotizaciones();
  }, []);

  return {
    cotizaciones,
    cargando,
    crear,
    actualizar,
    eliminar,
    filtrar,
    obtenerEstadisticas,
    recargar: cargarCotizaciones,
  };
};