export class Presentacion {
    constructor(
        public color: string,
        public talla: number,
        public precioVenta: number,
        public precioCompra: number,
        public stock: number,
        public calzado?: any,
        public id?: number,
    ) { }
}