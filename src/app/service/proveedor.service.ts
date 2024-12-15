import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuario } from '../model/usuarios';
import { Paginate } from '../model/paginate';
import { GLOBAL } from './global';
import {LoginService} from './login.service';
import { Proveedor } from '../model/proveedor';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

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
    return this.http.get<Paginate[]>(this.url + 'api/proveedor/listar?nombre=&page='+page,{headers});
  }

  crear(proveedor: any,tipo:any): Observable<Proveedor> {
    let headers = new HttpHeaders({
      "Authorization": "Bearer "+this.loginService.getToken(),
      });

      if(tipo == 1){
        return this.http.post<Proveedor>(this.url + 'api/proveedor/agregar', proveedor ,{headers});
      }else{
        return this.http.post<Proveedor>(this.url + 'api/proveedor/agregar-imagen', proveedor ,{headers});
      }
  }

  actualizar(proveedor: any, tipo: any): Observable<Proveedor> {
    let headers = new HttpHeaders({
      "Authorization": "Bearer "+this.loginService.getToken(),

      });
      if(tipo == 1){
        return this.http.put<Proveedor>(this.url + 'api/proveedor/actualizar', proveedor ,{headers});
      }else{
        return this.http.put<Proveedor>(this.url + 'api/proveedor/agregar-imagen', proveedor ,{headers});
      }
      
  }

  eliminar(proveedor: any) {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": "Bearer "+this.loginService.getToken(),

      });
    return this.http.post(this.url + 'api/proveedor/eliminar', proveedor ,{headers});
  }
}
