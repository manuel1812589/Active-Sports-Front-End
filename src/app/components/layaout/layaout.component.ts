import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../service/login.service';

@Component({
  selector: 'app-layaout',
  templateUrl: './layaout.component.html',
  styleUrls: ['./layaout.component.css']
})
export class LayaoutComponent implements OnInit {
  roles: string[] = [];

  constructor(private router: Router, private loginService: LoginService) {
  }

  ngOnInit(): void {
    this.roles = this.loginService.getRoles();

  }

  isAdmin(): boolean {
    return this.roles.includes('ROLE_ADMIN');
  }

  isSupervisor(): boolean {
    return this.roles.includes('ROLE_SUPERVISOR');
  }

  canViewSuperv(): boolean {
    // Define la lógica para mostrar u ocultar la opción "Articulos" basado en los roles
    return this.isAdmin();
  }

  canViewSupervAndAdmin(): boolean {
    // Define la lógica para mostrar u ocultar la opción "Articulos" basado en los roles
    return this.isSupervisor() || this.isAdmin();
  }

  clickTerminar() {
    localStorage.removeItem("token");
    this.router.navigate(['/login']);
  }
}
