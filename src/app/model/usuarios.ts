export class Usuario {
    constructor(
        public correo: string,
        public roles: any,
        public password: string,
        public nombre: string,
        public dni: number,
        public id?: number,
    ) { }
}