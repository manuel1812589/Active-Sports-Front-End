import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Categoria } from '../model/categoria';
import { Paginate } from '../model/paginate';
import { GLOBAL } from './global';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  public url: string;
  public token: any;
  constructor(private http: HttpClient, private loginService: LoginService) {
    this.url = GLOBAL.url;
  }

  index(page: number): Observable<Paginate[]> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.loginService.getToken(),
    });
    return this.http.get<Paginate[]>(
      this.url + 'api/categoria/listar?nombre=&page=' + page,
      { headers }
    );
  }

  crear(categoria: any, tipo: any): Observable<Categoria> {
    let headers = new HttpHeaders({
      Authorization: 'Bearer ' + this.loginService.getToken(),
    });

    if (tipo == 1) {
      return this.http.post<Categoria>(
        this.url + 'api/categoria/agregar',
        categoria,
        { headers }
      );
    } else {
      return this.http.post<Categoria>(
        this.url + 'api/categoria/agregar-imagen',
        categoria,
        { headers }
      );
    }
  }

  actualizar(categoria: any, tipo: any): Observable<Categoria> {
    let headers = new HttpHeaders({
      Authorization: 'Bearer ' + this.loginService.getToken(),
    });
    if (tipo == 1) {
      return this.http.put<Categoria>(
        this.url + 'api/categoria/actualizar',
        categoria,
        { headers }
      );
    } else {
      return this.http.put<Categoria>(
        this.url + 'api/categoria/agregar-imagen',
        categoria,
        { headers }
      );
    }
  }
}
