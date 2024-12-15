import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../service/login.service';
import { Router } from '@angular/router';
import { Usuario } from './../../model/usuarioEjm';
import { throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public login: Usuario;
  public alerta: boolean;
  constructor(private router: Router, private loginService: LoginService) {
    this.login = new Usuario('', '', '');
    this.alerta = false;
  }
  ngOnInit(): void {
    if (this.loginService.getToken()) {
      this.router.navigate(['/usuario']);
    }
  }


  iniciarSesion(model: Usuario, isValid: any) {
    this.alerta = false;
    if (isValid === true) {
      try {
        this.loginService.login(model).pipe(retry(1), catchError(this.handleError)).subscribe({
          next: (data) => {
            localStorage.setItem('token', data.accessToken);
            console.log(data.accessToken);

          },
          error: () => {
            console.log('ERROR DESDE SUBSCRIBE');
            this.alerta = true;
          },
          complete: () => {
            this.router.navigate(['/usuario']);
            console.log('Completado');
          }
        });
      } catch (err) {
        console.log('ERROR DESDE CATCH');
      }
    } else {
      this.alerta = false;
    }
  }
  
  

  handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `CODIGO DE ERROR: ${error.status}\nMENSAJE: ${error.message}`;
    }
    console.log(errorMessage)
    return throwError(() => {
      return errorMessage;
    });
  }
}
