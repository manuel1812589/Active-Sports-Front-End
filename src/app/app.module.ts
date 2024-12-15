import { LOCALE_ID, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { AppRoutingModule, routingComponents } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ToastrModule } from 'ngx-toastr';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth/interceptor';
import { NgChartsModule } from "ng2-charts";
import { EditorModule, TINYMCE_SCRIPT_SRC } from "@tinymce/tinymce-angular";
import { CommonModule, DatePipe } from "@angular/common";
import { ProveedorComponent } from './components/proveedor/proveedor.component';
import { UsuarioComponent } from './components/usuario/usuario.component';
import { VentaComponent } from './components/venta/venta.component';
import { CalzadoComponent } from './components/calzado/calzado.component';
import { CalzadoPresentacionComponent } from './components/calzado-presentacion/calzado-presentacion.component';
import { DetalleVentaComponent } from './components/detalle-venta/detalle-venta.component';
import { LayaoutComponent } from './components/layaout/layaout.component';
import { LoginComponent } from "./components/login/login.component";
import { RealizarVentaComponent } from './components/realizar-venta/realizar-venta.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MarcaComponent } from './components/marca/marca.component';
@NgModule({
  declarations: [
    AppComponent,
    ProveedorComponent,
    UsuarioComponent,
    VentaComponent,
    CalzadoComponent,
    CalzadoPresentacionComponent,
    DetalleVentaComponent,
    LayaoutComponent,
    LoginComponent,
    RealizarVentaComponent,
    MarcaComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    NgChartsModule,
    EditorModule,
    NgbModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    BrowserAnimationsModule,
    {
      provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js'
    },
    DatePipe,
    CommonModule,
    { provide: LOCALE_ID, useValue: 'es-PE' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
