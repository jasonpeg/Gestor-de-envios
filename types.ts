
export enum OrderStatus {
  PENDIENTE = 'Pendiente',
  ENTREGADO = 'Entregado',
  DEVUELTO = 'Devuelto',
  NOVEDAD = 'Novedad'
}

export enum PaymentStatus {
  PENDIENTE = 'Pendiente de pago',
  PAGADO = 'Pagado'
}

export interface Product {
  id: string;
  reference: string;
  name: string;
  price1: number; // Precio por 1 cantidad
  price2: number; // Precio por 2 cantidades
  price3: number; // Precio por 3 cantidades
  stock: number;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  reference: string;
  type: 'IN' | 'OUT'; // IN = Entrada (A Merquix), OUT = Salida
  quantity: number;
  date: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string; // Internal ID
  customerName: string; // NOMBRE
  shippingNumber: string; // NUMERO DE ENVIO
  shippingCompany: string; // COMPAÑIA DE ENVIO
  date: string; // CREACIÓN
  deliveryDate?: string; // FECHA DE ENTREGA
  city: string; // CIUDAD
  total: number; // MONTO
  productSummary: string; // PRODUCTO (Text description from the sheet)
  phoneNumber: string; // TELEFONO
  
  status: OrderStatus;
  paymentStatus: PaymentStatus; // Nuevo campo de pagos
  
  items: OrderItem[]; // Kept for compatibility with product manager logic
  address?: string;
  notes?: string;
}

export type ViewState = 'orders' | 'products' | 'import' | 'manual' | 'inventory';
