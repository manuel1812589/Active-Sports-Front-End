import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Venta } from '../model/venta';
import { Paginate } from '../model/paginate';
import { GLOBAL } from './global';
import {LoginService} from './login.service';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

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
    return this.http.get<Paginate[]>(this.url + 'api/ventas/listar?nombre=&page='+page,{headers});
  }

  crear(venta: any,tipo:any): Observable<Venta> {
    let headers = new HttpHeaders({
      "Authorization": "Bearer "+this.loginService.getToken(),
      });

      if(tipo == 1){
        return this.http.post<Venta>(this.url + 'api/ventas/agregar', venta ,{headers});
      }else{
        return this.http.post<Venta>(this.url + 'api/ventas/agregar-imagen', venta ,{headers});
      }
  }

  actualizar(venta: any, tipo: any): Observable<Venta> {
    let headers = new HttpHeaders({
      "Authorization": "Bearer "+this.loginService.getToken(),

      });
      if(tipo == 1){
        return this.http.put<Venta>(this.url + 'api/ventas/actualizar', venta ,{headers});
      }else{
        return this.http.put<Venta>(this.url + 'api/ventas/agregar-imagen', venta ,{headers});
      }
      
  }

  eliminar(venta: any) {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": "Bearer "+this.loginService.getToken(),

      });
    return this.http.post(this.url + 'api/ventas/eliminar', venta ,{headers});
  }

  filtrarVentas(body: any): Observable<any> {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.loginService.getToken()}`
    });
    return this.http.post(this.url + 'api/ventas/filtros', body, { headers });
  }

  verDetalleVenta(id:number): any {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Authorization": "Bearer "+this.loginService.getToken(),

      });
    return this.http.get(this.url + 'api/ventas/detalle-venta/'+id,{headers});
  }
}
