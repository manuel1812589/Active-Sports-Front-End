import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuario } from '../model/usuarios';
import { Paginate } from '../model/paginate';
import { GLOBAL } from './global';
import {LoginService} from './login.service';
import { Calzado } from '../model/calzado';

@Injectable({
  providedIn: 'root'
})
export class CalzadoService {

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
    return this.http.get<Paginate[]>(this.url + 'api/calzado/listar?nombre=&page='+page,{headers});
  }

  crear(calzado: any,tipo:any): Observable<Calzado> {
    let headers = new HttpHeaders({
      "Authorization": "Bearer "+this.loginService.getToken(),
      });

      if(tipo == 1){
        return this.http.post<Calzado>(this.url + 'api/calzado/agregar', calzado ,{headers});
      }else{
        return this.http.post<Calzado>(this.url + 'api/calzado/agregar-imagen', calzado ,{headers});
      }
  }

  actualizar(calzado: any, tipo: any): Observable<Calzado> {
    let headers = new HttpHeaders({
      "Authorization": "Bearer "+this.loginService.getToken(),

      });
      if(tipo == 1){
        return this.http.put<Calzado>(this.url + 'api/calzado/actualizar', calzado ,{headers});
      }else{
        return this.http.put<Calzado>(this.url + 'api/calzado/agregar-imagen', calzado ,{headers});
      }
      
  }

  eliminar(calzado: any) {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": "Bearer "+this.loginService.getToken(),

      });
    return this.http.post(this.url + 'api/calzado/eliminar', calzado ,{headers});
  }

  verPresentacion(id:number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": "Bearer "+this.loginService.getToken(),

      });
    return this.http.get(this.url + 'api/calzado/presentacion/'+id,{headers});
  }

  agregarPresentacion(idPropiedad: any, propiedad: any): Observable<Calzado> {
    let headers = new HttpHeaders({
      "Authorization": "Bearer "+this.loginService.getToken(),
      });
        return this.http.post<Calzado>(this.url + 'api/calzado/presentacion/' + idPropiedad + '/agregar', propiedad,{headers});
  }

  actualizarPresentacion(idPropiedad: any, propiedad: any): Observable<Calzado> {
    let headers = new HttpHeaders({
      "Authorization": "Bearer "+this.loginService.getToken(),

      });
      return this.http.put<Calzado>(this.url + 'api/calzado/presentacion/' + idPropiedad + '/actualizar', propiedad,{headers});
      
  }

  eliminarPresentacion(propiedad: any) {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": "Bearer "+this.loginService.getToken(),

      });
    return this.http.post(this.url + 'api/calzado/presentacion-eliminar', propiedad ,{headers});
  }
}
