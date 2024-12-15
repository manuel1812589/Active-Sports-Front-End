import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuario } from '../model/usuarioEjm';
import { GLOBAL } from './global';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  public url: string;
  public token: any;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  login(usuario: any): Observable<any> {
    let params = JSON.stringify(usuario);
    return this._http.post<any>(this.url + 'api/v1/login', params, this.httpOptions).pipe(
      tap(response => {
        if (response && response.accessToken) {
          localStorage.setItem('token', response.accessToken);
          localStorage.setItem('roles', JSON.stringify(response.roles));
        }
      })
    );
  }

  getToken() {
    let token = localStorage.getItem('token');
    if (token !== "undefined") {
      this.token = token;
    } else {
      this.token = null;
    }
    return this.token;
  }

  getRoles() {
    let roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  }
}
