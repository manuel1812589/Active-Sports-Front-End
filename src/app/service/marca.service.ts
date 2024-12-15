import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Marca } from '../model/marca';
import { Paginate } from '../model/paginate';
import { GLOBAL } from './global';
import {LoginService} from './login.service';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {

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
    return this.http.get<Paginate[]>(this.url + 'api/marca/listar?nombre=&page='+page,{headers});
  }

  crear(marca: any,tipo:any): Observable<Marca> {
    let headers = new HttpHeaders({
      "Authorization": "Bearer "+this.loginService.getToken(),
      });

      if(tipo == 1){
        return this.http.post<Marca>(this.url + 'api/marca/agregar', marca ,{headers});
      }else{
        return this.http.post<Marca>(this.url + 'api/marca/agregar-imagen', marca ,{headers});
      }
  }

  actualizar(marca: any, tipo: any): Observable<Marca> {
    let headers = new HttpHeaders({
      "Authorization": "Bearer "+this.loginService.getToken(),

      });
      if(tipo == 1){
        return this.http.put<Marca>(this.url + 'api/marca/actualizar', marca ,{headers});
      }else{
        return this.http.put<Marca>(this.url + 'api/marca/agregar-imagen', marca ,{headers});
      }
      
  }

}
