import { Component, OnInit } from '@angular/core';
import { VentaService } from '../../service/venta.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Venta } from './../../model/venta';
import { Observable, throwError, Subject } from 'rxjs';
import { retry, catchError, takeUntil } from 'rxjs/operators';
declare var $: any;

@Component({
  selector: 'app-realizar-venta',
  templateUrl: './realizar-venta.component.html',
  styleUrls: ['./realizar-venta.component.css']
})
export class RealizarVentaComponent implements OnInit{

  public venta: Venta;
  public ventaEditar: Venta;
  public pages: any;
  public pagePrev = 1;
  public pageNext = 1;
  ventas: any = [];
  public selectedFile;
  public imagenState: boolean;
  public presentacionList: any;
  public filteredPresentaciones: any[] = [];
  public searchTerm: string = '';
  public selectedPresentaciones: any[] = [];

  cargando: boolean = false;
  mensaje: string;
  alerta: boolean;
  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private router: Router, private ventaService: VentaService, private routerIntParams: ActivatedRoute) {
    this.cargando = true;
    this.mensaje = "Cargando lista de Estados";
    this.venta = new Venta(0, '', '', 0, 0);
    this.ventaEditar = new Venta(0, '', '', 0, 0);
    this.alerta = true;
    this.imagenState = false;
    this.selectedFile = "";
  }

  ngOnInit(): void {
    this.getventas();
    this.filteredPresentaciones = this.presentacionList;
  }

  filterPresentaciones(): void {
    if (this.searchTerm.trim()) {
      this.filteredPresentaciones = this.presentacionList.filter((presentacion: { calzado: { nombre: string; }; }) =>
        presentacion.calzado.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredPresentaciones = [];
    }
  }

  selectPresentacion(presentacion: any): void {
    const exists = this.selectedPresentaciones.find(item => item.presentacion.id === presentacion.id);
    if (!exists) {
      this.selectedPresentaciones.push({ presentacion, cantidad: 1 });
    }
  }

  removePresentation(presentacionId: number): void {
    this.selectedPresentaciones = this.selectedPresentaciones.filter(item => item.presentacion.id !== presentacionId);
  }

  calculateItemSubtotal(item: any): number {
    return item.cantidad * item.presentacion.precioVenta;
  }

  calculateTotalSubtotal(): number {
    return this.selectedPresentaciones.reduce((total, item) => total + this.calculateItemSubtotal(item), 0);
  }  

  getventas() {
    this.routerIntParams.params.subscribe(params => {
      let page = +params["pages"];
      if (!page) {
        page = 0;
      }

      try {
        this.ventaService.index(page).pipe(retry(1), catchError(this.handleError)).subscribe({
          next: (data) => {
            this.ventas = data
            this.presentacionList = this.ventas.presentacion;
            this.venta['presentacion'] = this.presentacionList !== undefined ? this.presentacionList[0].id : null;
            console.log(this.presentacionList)

            this.pages = [];
            for (let i = 0; i < this.ventas.lista.totalPages; i++) {
              this.pages.push(i)
            }
            if (page >= 1) {
              this.pagePrev = (page - 1);
            } else {
              this.pagePrev = page
            }
            if (page < this.ventas.lista.totalPages || page == 1) {
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

  registrarventa() {
    this.alerta = false;
    try {
        // Construir la lista de detalles
        const detalles = this.selectedPresentaciones.map(item => ({
            presentacion: item.presentacion,
            cantidad: item.cantidad,
            sub_total: item.cantidad * item.presentacion.precioVenta
        }));

        // Construir el objeto formData
        const formData = {
            detalles: detalles
        };

        this.ventaService.crear(formData, 1).pipe(
            retry(1),
            catchError(this.handleError)
        ).subscribe({
            next: (data) => {
                console.log(data);
            },
            error: () => {
                console.log('ERROR DESDE SUBSCRIBE');
                this.alerta = true;
            },
            complete: () => {
                console.log('Completado');
                $('#ventaModal').modal('show');
                this.getventas();
                document.getElementById("cerrarModal")?.click();
                this.selectedPresentaciones = []; // Limpiar la lista después de guardar
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

  actualizarventa(venta: Venta, isValid: any) {
    this.alerta = false;
    let tipo: number = 0;
    let formData: any;
    let agregarJsonPresentacion = {
      id: venta.presentacion
    }
    formData = {
      nombre: venta.total,
      estado: venta.sub_total,
      presentacion: agregarJsonPresentacion
    };
      tipo = 1;
    try {
      this.ventaService.actualizar(formData, tipo).pipe(retry(1), catchError(this.handleError)).subscribe({
        next: (data) => {
          console.log(data);
          this.getventas();
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
  cambiarStateImg(venta: any) {
    this.imagenState = false;
    this.venta = new venta(venta.nombre, venta.estado, venta.proveedor.id, venta.id);
  }
  
  verventa(venta: any) {
    let imagenAgregar: string;
    if (venta.imagen) {
      this.imagenState = true;
    } else {
      this.imagenState = false;
    }
    this.ventaEditar = new venta(venta.nombre, venta.estado, venta.proveedor.id, venta.id);
    $('#actualizar').modal('show');
    console.log(this.ventaEditar)
  }

  eliminarventa(venta: Venta) {
    this.alerta = false;
    try {
      this.ventaService.eliminar(venta).pipe(retry(1), catchError(this.handleError)).subscribe({
        next: (data) => {
          console.log(data);
          this.getventas();
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

