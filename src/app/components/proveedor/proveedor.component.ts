import { Component, OnInit } from '@angular/core';
import { ProveedorService } from '../../service/proveedor.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Proveedor } from './../../model/proveedor';
import { Observable, throwError, Subject } from 'rxjs';
import { retry, catchError, takeUntil } from 'rxjs/operators';
declare var $: any;

@Component({
  selector: 'app-proveedor',
  templateUrl: './proveedor.component.html',
  styleUrls: ['./proveedor.component.css']
})
export class ProveedorComponent implements OnInit{

  public proveedor: Proveedor;
  public proveedorEditar: Proveedor;
  public pages: any;
  public pagePrev = 1;
  public pageNext = 1;
  proveedores: any = [];
  public selectedFile;
  public imagenState: boolean;

  cargando: boolean = false;
  mensaje: string;
  alerta: boolean;
  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private router: Router, private proveedorService: ProveedorService, private routerIntParams: ActivatedRoute) {
    this.cargando = true;
    this.mensaje = "Cargando lista de Estados";
    this.proveedor = new Proveedor('', '', '', 0);
    this.proveedorEditar = new Proveedor('', '', '', 0);
    this.alerta = true;
    this.imagenState = false;
    this.selectedFile = "";
  }

  ngOnInit(): void {
    this.getProveedores();
  }

  calculateItemNumber(index: number): number {
    const currentPage = +this.routerIntParams.snapshot.params['pages'] || 0;
    const itemsPerPage = this.proveedores.lista.size;
    return (currentPage * itemsPerPage) + index + 1;
  }  

  getProveedores() {
    this.routerIntParams.params.subscribe(params => {
      let page = +params["pages"];
      if (!page) {
        page = 0;
      }

      try {
        this.proveedorService.index(page).pipe(retry(1), catchError(this.handleError)).subscribe({
          next: (data) => {
            this.proveedores = data
            console.log(this.proveedores.lista.content)

            this.pages = [];
            for (let i = 0; i < this.proveedores.lista.totalPages; i++) {
              this.pages.push(i)
            }
            if (page >= 1) {
              this.pagePrev = (page - 1);
            } else {
              this.pagePrev = page
            }
            if (page < this.proveedores.lista.totalPages || page == 1) {
              this.pageNext = (page + 1);
            } else {
              this.pageNext = page
            }

          },
          error: (error) => {
            if (error == 401) {
              this.mensaje = "No tiene permiso para ingresar a la lista de estado";
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

  registrarProveedor(proveedor: Proveedor, isValid: any) {
    this.alerta = false;
    try {
      let tipo: number = 0;
      let formData: any;
      formData = {
        nombre: proveedor.nombre,
        contacto: proveedor.contacto,
        direccion: proveedor.direccion,
      };
      this.proveedorService.crear(formData, 1).pipe(retry(1), catchError(this.handleError)).subscribe({
        next: (data) => {
          console.log(data);

        },
        error: () => {
          console.log('ERROR DESDE SUBSCRIBE');
          this.alerta = true;
        },
        complete: () => {
          console.log('Completado');
          this.getProveedores();
          document.getElementById("cerrarModal")?.click();
          this.proveedor = new Proveedor('', '', '', 0);
        }
      });
    } catch (err) {
      console.log('ERROR DESDE CATCH');
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    console.log(this.selectedFile);
  }

  actualizarProveedor(proveedor: Proveedor, isValid: any) {
    this.alerta = false;
    let tipo: number = 0;
    let formData: any;
      formData = {
        id: proveedor.id,
        nombre: proveedor.nombre,
        contacto: proveedor.contacto,
        direccion: proveedor.direccion,
      };
      tipo = 1;
    try {
      this.proveedorService.actualizar(formData, tipo).pipe(retry(1), catchError(this.handleError)).subscribe({
        next: (data) => {
          console.log(data);
          this.getProveedores();
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
  cambiarStateImg(proveedor: any) {
    this.imagenState = false;
    this.proveedor = new Proveedor(proveedor.nombre, proveedor.contacto, proveedor.direccion, proveedor.id);
  }
  
  verProveedor(proveedor: any) {
    let imagenAgregar: string;
    if (proveedor.imagen) {
      this.imagenState = true;
    } else {
      this.imagenState = false;
    }
    this.proveedorEditar = new Proveedor(proveedor.nombre, proveedor.contacto, proveedor.direccion, proveedor.id);
    $('#actualizar').modal('show');
    console.log(this.proveedorEditar)
  }

  eliminarProveedor(proveedor: Proveedor) {
    this.alerta = false;
    try {
      this.proveedorService.eliminar(proveedor).pipe(retry(1), catchError(this.handleError)).subscribe({
        next: (data) => {
          console.log(data);
          this.getProveedores();
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
