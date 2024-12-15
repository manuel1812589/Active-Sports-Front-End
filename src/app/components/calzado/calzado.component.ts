import { Component, OnInit } from '@angular/core';
import { CalzadoService } from '../../service/calzado.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Calzado } from './../../model/calzado';
import { Observable, throwError, Subject } from 'rxjs';
import { retry, catchError, takeUntil } from 'rxjs/operators';
declare var $: any;

@Component({
  selector: 'app-calzado',
  templateUrl: './calzado.component.html',
  styleUrls: ['./calzado.component.css']
})
export class CalzadoComponent implements OnInit{

  public calzado: Calzado;
  public calzadoEditar: Calzado;
  public pages: any;
  public pagePrev = 1;
  public pageNext = 1;
  calzados: any = [];
  public selectedFile;
  public imagenState: boolean;
  public proveedorList: any;

  cargando: boolean = false;
  mensaje: string;
  alerta: boolean;
  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private router: Router, private calzadoService: CalzadoService, private routerIntParams: ActivatedRoute) {
    this.cargando = true;
    this.mensaje = "Cargando lista de Estados";
    this.calzado = new Calzado('', '', '', 0);
    this.calzadoEditar = new Calzado('', '', '', 0);
    this.alerta = true;
    this.imagenState = false;
    this.selectedFile = "";
  }

  ngOnInit(): void {
    this.getcalzados();
  }

  calculateItemNumber(index: number): number {
    const currentPage = +this.routerIntParams.snapshot.params['pages'] || 0;
    const itemsPerPage = this.calzados.lista.size;
    return (currentPage * itemsPerPage) + index + 1;
  }  

  getcalzados() {
    this.routerIntParams.params.subscribe(params => {
      let page = +params["pages"];
      if (!page) {
        page = 0;
      }

      try {
        this.calzadoService.index(page).pipe(retry(1), catchError(this.handleError)).subscribe({
          next: (data) => {
            this.calzados = data
            this.proveedorList = this.calzados.proveedor;
            this.calzado['proveedor'] = this.proveedorList !== undefined ? this.proveedorList[0].id : null;
            console.log(this.calzados.lista)

            this.pages = [];
            for (let i = 0; i < this.calzados.lista.totalPages; i++) {
              this.pages.push(i)
            }
            if (page >= 1) {
              this.pagePrev = (page - 1);
            } else {
              this.pagePrev = page
            }
            if (page < this.calzados.lista.totalPages || page == 1) {
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

  registrarcalzado(calzado: Calzado, isValid: any) {
    this.alerta = false;
    try {
      let tipo: number = 0;
      let formData: any;
      let agregarJsonProveedor = {
        id: calzado.proveedor
      }
      formData = {
        nombre: calzado.nombre,
        estado: calzado.estado,
        proveedor: agregarJsonProveedor
      };
      tipo = 1;
      this.calzadoService.crear(formData, tipo).pipe(retry(1), catchError(this.handleError)).subscribe({
        next: (data) => {
          console.log(data);

        },
        error: () => {
          console.log('ERROR DESDE SUBSCRIBE');
          this.alerta = true;
        },
        complete: () => {
          console.log('Completado');
          this.getcalzados();
          document.getElementById("cerrarModal")?.click();
          this.calzado = new Calzado('', '', '', 0);
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

  actualizarcalzado(calzado: Calzado, isValid: any) {
    this.alerta = false;
    let tipo: number = 0;
    let formData: any;
    let agregarJsonProveedor = {
      id: calzado.proveedor
    }
      formData = {
        id: calzado.id,
        nombre: calzado.nombre,
        estado: calzado.estado,
        proveedor: agregarJsonProveedor
      };
      tipo = 1;
    try {
      this.calzadoService.actualizar(formData, tipo).pipe(retry(1), catchError(this.handleError)).subscribe({
        next: (data) => {
          console.log(data);
          this.getcalzados();
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
  cambiarStateImg(calzado: any) {
    this.imagenState = false;
    this.calzado = new Calzado(calzado.nombre, calzado.estado, calzado.proveedor.id, calzado.id);
  }
  
  vercalzado(calzado: any) {
    let imagenAgregar: string;
    if (calzado.imagen) {
      this.imagenState = true;
    } else {
      this.imagenState = false;
    }
    this.calzadoEditar = new Calzado(calzado.nombre, calzado.estado, calzado.proveedor.id, calzado.id);
    $('#actualizar').modal('show');
    console.log(this.calzadoEditar)
  }

  eliminarcalzado(calzado: Calzado) {
    this.alerta = false;
    try {
      this.calzadoService.eliminar(calzado).pipe(retry(1), catchError(this.handleError)).subscribe({
        next: (data) => {
          console.log(data);
          this.getcalzados();
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

