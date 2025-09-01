import { Cotizacion, EstadisticasCotizaciones, FiltrosCotizacion, ElementoCotizacion } from '@/types/cotizacion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STORAGE_KEY = 'cotizaciones_app_data';

// Generar número de cotización
export const generarNumeroCotizacion = (): string => {
  const cotizaciones = obtenerCotizaciones();
  const ultimoNumero = cotizaciones.length > 0 
    ? Math.max(...cotizaciones.map(c => parseInt(c.numero.replace('COT-', '')))) 
    : 0;
  return `COT-${(ultimoNumero + 1).toString().padStart(4, '0')}`;
};

// Calcular subtotal, impuesto y total
export const calcularTotales = (elementos: ElementoCotizacion[], porcentajeImpuesto: number = 16) => {
  const subtotal = elementos.reduce((sum, elemento) => sum + elemento.subtotal, 0);
  const impuesto = (subtotal * porcentajeImpuesto) / 100;
  const total = subtotal + impuesto;
  
  return { subtotal, impuesto, total };
};

// Almacenamiento local
export const obtenerCotizaciones = (): Cotizacion[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const cotizaciones = JSON.parse(data);
    return cotizaciones.map((c: any) => ({
      ...c,
      fecha: new Date(c.fecha),
      fechaVencimiento: new Date(c.fechaVencimiento),
      creadoEn: new Date(c.creadoEn),
      actualizadoEn: new Date(c.actualizadoEn),
    }));
  } catch {
    return [];
  }
};

export const guardarCotizacion = (cotizacion: Cotizacion): void => {
  if (typeof window === 'undefined') return;
  
  const cotizaciones = obtenerCotizaciones();
  const index = cotizaciones.findIndex(c => c.id === cotizacion.id);
  
  if (index >= 0) {
    cotizaciones[index] = { ...cotizacion, actualizadoEn: new Date() };
  } else {
    cotizaciones.push(cotizacion);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cotizaciones));
};

export const eliminarCotizacion = (id: string): void => {
  if (typeof window === 'undefined') return;
  
  const cotizaciones = obtenerCotizaciones().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cotizaciones));
};

export const obtenerCotizacionPorId = (id: string): Cotizacion | undefined => {
  return obtenerCotizaciones().find(c => c.id === id);
};

// Filtrar cotizaciones
export const filtrarCotizaciones = (cotizaciones: Cotizacion[], filtros: FiltrosCotizacion): Cotizacion[] => {
  return cotizaciones.filter(cotizacion => {
    if (filtros.estado && cotizacion.estado !== filtros.estado) return false;
    
    if (filtros.cliente && !cotizacion.cliente.nombre.toLowerCase().includes(filtros.cliente.toLowerCase()) &&
        !cotizacion.cliente.empresa.toLowerCase().includes(filtros.cliente.toLowerCase())) return false;
    
    if (filtros.fechaDesde && cotizacion.fecha < filtros.fechaDesde) return false;
    if (filtros.fechaHasta && cotizacion.fecha > filtros.fechaHasta) return false;
    
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      const textos = [
        cotizacion.numero,
        cotizacion.cliente.nombre,
        cotizacion.cliente.empresa,
        ...cotizacion.elementos.map(e => e.descripcion)
      ].join(' ').toLowerCase();
      
      if (!textos.includes(busqueda)) return false;
    }
    
    return true;
  });
};

// Estadísticas
export const calcularEstadisticas = (cotizaciones: Cotizacion[]): EstadisticasCotizaciones => {
  return {
    total: cotizaciones.length,
    borradores: cotizaciones.filter(c => c.estado === 'borrador').length,
    enviadas: cotizaciones.filter(c => c.estado === 'enviada').length,
    aprobadas: cotizaciones.filter(c => c.estado === 'aprobada').length,
    rechazadas: cotizaciones.filter(c => c.estado === 'rechazada').length,
    montoTotal: cotizaciones.reduce((sum, c) => sum + c.total, 0),
    montoAprobado: cotizaciones.filter(c => c.estado === 'aprobada').reduce((sum, c) => sum + c.total, 0),
  };
};

// Formatear moneda
export const formatearMoneda = (cantidad: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(cantidad);
};

// Formatear fecha
export const formatearFecha = (fecha: Date): string => {
  return format(fecha, 'dd/MM/yyyy', { locale: es });
};

// Obtener color del estado
export const obtenerColorEstado = (estado: string): string => {
  switch (estado) {
    case 'borrador': return 'bg-gray-100 text-gray-800';
    case 'enviada': return 'bg-blue-100 text-blue-800';
    case 'aprobada': return 'bg-green-100 text-green-800';
    case 'rechazada': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Obtener texto del estado
export const obtenerTextoEstado = (estado: string): string => {
  switch (estado) {
    case 'borrador': return 'Borrador';
    case 'enviada': return 'Enviada';
    case 'aprobada': return 'Aprobada';
    case 'rechazada': return 'Rechazada';
    default: return 'Desconocido';
  }
};