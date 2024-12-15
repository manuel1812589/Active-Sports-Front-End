export class Venta {
    constructor(
        public total: number,
        public numPedido: string,
        public presentacion: any,
        public cantidad: number,
        public sub_total: number,
        public fecha?: Date,
        public id?: number,
    ) { }
}