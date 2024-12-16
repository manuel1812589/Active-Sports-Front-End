import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../service/login.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private toastr: ToastrService, private loginService: LoginService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.loginService.getToken();
  
    // Excluir solicitudes a la API de la Reniec
    if (req.url.includes('https://apiperu.dev/api/dni')) {
      return next.handle(req); // No modificar esta solicitud
    }
  
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(authReq).pipe(
      // Manejar respuestas exitosas
      tap((event) => {
        if (event instanceof HttpResponse) {
          if (event.status === 202) {
            const successMsg = event.body?.errors?.[0] || 'Acción completada.';
            this.toastr.success(successMsg, 'Éxito');
          } else if (event.status === 201) {
            const successMsg = event.body?.errors?.[0] || 'Acción completada.';
            this.toastr.success(successMsg, 'Éxito');
          }
        }
      }),
      // Manejar errores
      catchError((error: HttpErrorResponse) => {
        console.log('Interceptado un error HTTP:', error);

        if (error.status === 401) {
          this.toastr.error('No tienes permiso para acceder a este recurso.', 'Error de Autorización');
        } else if (error.status === 400) {
          const errorMsg = error.error?.errors?.[0] || 'Error al procesar la solicitud.';
          this.toastr.error(errorMsg, 'Error');
        }

        return throwError(() => new Error(error.message));
      })
    );
  }
}
