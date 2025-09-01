export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  empresa: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  codigoPostal?: string;
}

export interface ElementoCotizacion {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export type EstadoCotizacion = 'borrador' | 'enviada' | 'aprobada' | 'rechazada';

export interface Cotizacion {
  id: string;
  numero: string;
  fecha: Date;
  fechaVencimiento: Date;
  cliente: Cliente;
  elementos: ElementoCotizacion[];
  subtotal: number;
  impuesto: number;
  porcentajeImpuesto: number;
  total: number;
  estado: EstadoCotizacion;
  notas?: string;
  terminosCondiciones?: string;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface EstadisticasCotizaciones {
  total: number;
  borradores: number;
  enviadas: number;
  aprobadas: number;
  rechazadas: number;
  montoTotal: number;
  montoAprobado: number;
}

export interface FiltrosCotizacion {
  estado?: EstadoCotizacion;
  cliente?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  busqueda?: string;
}