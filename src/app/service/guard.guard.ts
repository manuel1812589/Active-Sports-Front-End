import { CanActivateFn, ActivatedRouteSnapshot, createUrlTreeFromSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { LoginService } from '../service/login.service';



export const guardGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {

  let token: any = inject(LoginService).getToken();

  if (token != null) {
    return true;
  } else {
    return createUrlTreeFromSnapshot(route, ['../login']);
  }
};
