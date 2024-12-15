import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuario } from '../model/usuarios';
import { Paginate } from '../model/paginate';
import { GLOBAL } from './global';
import {LoginService} from './login.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  public url: string;
  public token: any;
  constructor(private http: HttpClient, private loginService:LoginService) {
    this.url = GLOBAL.url;
  }

  index(page:number): Observable<Paginate[]> {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": "Bearer "+this.loginService.getToken(),

      });
    return this.http.get<Paginate[]>(this.url + 'api/usuarios/listar?nombre=&page='+page,{headers});
  }

  crear(usuario: any,tipo:any): Observable<Usuario> {
    let headers = new HttpHeaders({
      "Authorization": "Bearer "+this.loginService.getToken(),
      });

      if(tipo == 1){
        return this.http.post<Usuario>(this.url + 'api/usuarios/agregar', usuario ,{headers});
      }else{
        return this.http.post<Usuario>(this.url + 'api/usuarios/agregar-imagen', usuario ,{headers});
      }
  }

  crearCliente(usuario: any,tipo:any): Observable<Usuario> {
    let headers = new HttpHeaders({
      "Authorization": "Bearer "+this.loginService.getToken(),
      });

      if(tipo == 1){
        return this.http.post<Usuario>(this.url + 'api/usuarios/agregar-cliente', usuario ,{headers});
      }else{
        return this.http.post<Usuario>(this.url + 'api/usuarios/agregar-imagen', usuario ,{headers});
      }
  }

  actualizar(usuario: any, tipo: any): Observable<Usuario> {
    let headers = new HttpHeaders({
      "Authorization": "Bearer "+this.loginService.getToken(),

      });
      if(tipo == 1){
        return this.http.put<Usuario>(this.url + 'api/usuarios/actualizar', usuario ,{headers});
      }else{
        return this.http.put<Usuario>(this.url + 'api/usuarios/agregar-imagen', usuario ,{headers});
      }
      
  }

  actualizarCliente(usuario: any, tipo: any): Observable<Usuario> {
    let headers = new HttpHeaders({
      "Authorization": "Bearer "+this.loginService.getToken(),

      });
      return this.http.put<Usuario>(this.url + 'api/usuarios/actualizar-cliente', usuario ,{headers});
      
  }

  eliminar(usuario: any) {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": "Bearer "+this.loginService.getToken(),

      });
    return this.http.post(this.url + 'api/usuarios/eliminar', usuario ,{headers});
  }

}