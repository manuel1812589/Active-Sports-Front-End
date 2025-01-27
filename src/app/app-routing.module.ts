import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { guardGuard } from './service/guard.guard';
import { LoginComponent } from './components/login/login.component';
import { ProveedorComponent } from './components/proveedor/proveedor.component';
import { UsuarioComponent } from './components/usuario/usuario.component';
import { VentaComponent } from './components/venta/venta.component';
import { CalzadoComponent } from './components/calzado/calzado.component';
import { CalzadoPresentacionComponent } from './components/calzado-presentacion/calzado-presentacion.component';
import { DetalleVentaComponent } from './components/detalle-venta/detalle-venta.component';
import { RealizarVentaComponent } from './components/realizar-venta/realizar-venta.component';
import { MarcaComponent } from './components/marca/marca.component';
import { CategoriaComponent } from './components/categoria/categoria.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'usuario', component: UsuarioComponent, canActivate: [guardGuard] },
  {
    path: 'usuario/:pages',
    component: UsuarioComponent,
    canActivate: [guardGuard],
  },
  { path: 'marca', component: MarcaComponent, canActivate: [guardGuard] },
  {
    path: 'marca/:pages',
    component: MarcaComponent,
    canActivate: [guardGuard],
  },
  {
    path: 'proveedor',
    component: ProveedorComponent,
    canActivate: [guardGuard],
  },
  {
    path: 'proveedor/:pages',
    component: ProveedorComponent,
    canActivate: [guardGuard],
  },
  {
    path: 'categoria',
    component: CategoriaComponent,
    canActivate: [guardGuard],
  },
  {
    path: 'categoria/:pages',
    component: CategoriaComponent,
    canActivate: [guardGuard],
  },
  { path: 'venta', component: VentaComponent, canActivate: [guardGuard] },
  {
    path: 'realizar-venta',
    component: RealizarVentaComponent,
    canActivate: [guardGuard],
  },
  { path: 'calzado', component: CalzadoComponent, canActivate: [guardGuard] },
  {
    path: 'presentacion/:id',
    component: CalzadoPresentacionComponent,
    canActivate: [guardGuard],
  },
  {
    path: 'detalle-venta/:id',
    component: DetalleVentaComponent,
    canActivate: [guardGuard],
  },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
export const routingComponents = [LoginComponent, PageNotFoundComponent];
