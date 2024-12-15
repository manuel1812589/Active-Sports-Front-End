export class Roles{
    constructor(
        public nombre: string,
        public id?: number
    ) {}
    verDatos() {
        console.log ("Id: " + this.id + ", Nombre: " + this.nombre);
    }
}