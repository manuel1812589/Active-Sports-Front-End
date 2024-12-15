import { Component, OnInit } from '@angular/core';
import { CalzadoService } from '../../service/calzado.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Calzado } from './../../model/calzado';
import { Presentacion } from './../../model/presentacion';
import { Observable, throwError, Subject } from 'rxjs';
import { retry, catchError, takeUntil } from 'rxjs/operators';
declare var $: any;

@Component({
  selector: 'app-calzado-presentacion',
  templateUrl: './calzado-presentacion.component.html',
  styleUrls: ['./calzado-presentacion.component.css']
})
export class CalzadoPresentacionComponent implements OnInit{

  idPropiedad: any;
  public propiedad: Presentacion;
  public propiedadEditar: Presentacion;
  public detallesList: any;
  propiedadesDetalles: any = [];
  public selectedFile;
  public imagenState: boolean;
  

  cargando: boolean = false;
  mensaje: string;
  alerta: boolean;
  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private router: Router, private propiedadService: CalzadoService, private routerIntParams: ActivatedRoute) {
    let fecha: Date = new Date();
    this.cargando = true;
    this.mensaje = "Cargando lista de Imagenes";
    this.propiedad = new Presentacion('', 0, 0, 0, 0, '', 0);
    this.propiedadEditar = new Presentacion('', 0, 0, 0, 0, '', 0);
    this.alerta = true;
    this.imagenState = false;
    this.selectedFile = "";
    this.idPropiedad = this.routerIntParams.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.getPresentacion();
    console.log('ID del producto:', this.idPropiedad);
  }

  calculateItemNumber(index: number): number {
    return index + 1;
  }
  

  getPresentacion() {
    this.routerIntParams.params.subscribe(params => {
      let page = +params["id"];
      if (!page) {
        page = 0;
      }

      try {
        this.propiedadService.verPresentacion(page).pipe(retry(1), catchError(this.handleError)).subscribe({
          next: (data : any) => {
            this.propiedadesDetalles = data
            console.log(this.propiedadesDetalles.lista)

          },
          error: (error : any) => {
            if (error == 401) {
              this.mensaje = "No tiene permiso para ingresar a la lista de Productos";
            } if (error == 400) {
              this.mensaje = "Error en el servidor";
            }
          },
          complete: () => {
            this.cargando = true;

          }
        });
      } catch (err) {
        console.log('ERROR DESDE CATCH ', err);
      }

    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    console.log(this.selectedFile);
  }

  registrarPresentacion(propiedad: Presentacion, idPropiedad: any, isValid: any) {
    this.alerta = false;
    try {
      let formData: any;
        formData = {
          color: propiedad.color,
          talla: propiedad.talla,
          precioVenta: propiedad.precioVenta,
          precioCompra: propiedad.precioCompra,
          stock: propiedad.stock,
        };
      this.propiedadService.agregarPresentacion(this.idPropiedad, formData).pipe(retry(1), catchError(this.handleError)).subscribe({
        next: (data) => {
          console.log(data);

        },
        error: () => {
          console.log('ERROR DESDE SUBSCRIBE');
          this.alerta = true;
        },
        complete: () => {
          console.log('Completado');
          this.getPresentacion();
          document.getElementById("cerrarModal")?.click();
          this.propiedad = new Presentacion('', 0, 0, 0, 0, '', 0);
        }
      });
    } catch (err) {
      console.log('ERROR DESDE CATCH');
    }
  }

  actualizarPresentacion(propiedad: Presentacion, idPropiedad: any, isValid: any) {
    this.alerta = false;
    let tipo: number = 0;
    let formData: any;
      formData = {
        id: propiedad.id,
        color: propiedad.color,
        talla: propiedad.talla,
        precioVenta: propiedad.precioVenta,
        precioCompra: propiedad.precioCompra,
        stock: propiedad.stock,
      };
    try {
      this.propiedadService.actualizarPresentacion(this.idPropiedad, formData).pipe(retry(1), catchError(this.handleError)).subscribe({
        next: (data) => {
          console.log(data);
          this.getPresentacion();
          document.getElementById("cerrarModalAc")?.click();
        },
        error: () => {
          console.log('ERROR DESDE SUBSCRIBE');
          this.alerta = true;
        },
        complete: () => {
          console.log('Completado');
        }
      });
    } catch (err) {
      console.log('ERROR DESDE CATCH');
    }
  }
  cambiarStateImg(propiedad: any) {
    this.imagenState = false;
    this.propiedad = new Presentacion(propiedad.color, propiedad.talla, propiedad.precioVenta, propiedad.precioCompra, propiedad.stock, propiedad.calzado, propiedad.id);
  }
  
  verPresentacion(propiedad: any) {
    let imagenAgregar: string;
    if (propiedad.imagen) {
      this.imagenState = true;
    } else {
      this.imagenState = false;
    }
    this.propiedadEditar = new Presentacion(propiedad.color, propiedad.talla, propiedad.precioVenta, propiedad.precioCompra, propiedad.stock, propiedad.calzado, propiedad.id);
    $('#actualizar').modal('show');
    console.log(this.propiedadEditar)
  }

  eliminarPresentacion(propiedad: Presentacion) {
    this.alerta = false;
    try {
      this.propiedadService.eliminarPresentacion(propiedad).pipe(retry(1), catchError(this.handleError)).subscribe({
        next: (data) => {
          console.log(data);
          this.getPresentacion();
        },
        error: () => {
          console.log('ERROR DESDE SUBSCRIBE');
          this.alerta = true;
        },
        complete: () => {
          console.log('Completado');
        }
      });
    } catch (err) {
      console.log('ERROR DESDE CATCH');
    }

  }

  handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      //errorMessage = error.error.message;
      errorMessage = error.error.status;
    } else {
      //errorMessage = `CODIGO DE ERROR: ${error.status}\nMENSAJE: ${error.message}`;
      errorMessage = error.status;
    }

    return throwError(() => {
      return errorMessage;
    });
  }
}
