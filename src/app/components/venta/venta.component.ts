import { Component, OnInit } from '@angular/core';
import { VentaService } from '../../service/venta.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Venta } from './../../model/venta';
import { Observable, throwError, Subject } from 'rxjs';
import { retry, catchError, takeUntil } from 'rxjs/operators';
declare var $: any;
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver'; // Importar file-saver para guardar el archivo Excel


@Component({
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css']
})
export class VentaComponent implements OnInit{

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
  startDate: any;
  endDate: any;
  nombreCalzado: string = '';
  numPedido: string = '';
  pedidosFiltrados: any = [];
  numeroElementosTabla: number = 0;
  pedidosFiltradosVacio = true;
  totalSum: number = 0;


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

  calculateItemNumber(index: number): number {
    const currentPage = +this.routerIntParams.snapshot.params['pages'] || 0;
    const itemsPerPage = this.ventas.lista.size;
    return (currentPage * itemsPerPage) + index + 1;
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
            console.log(this.ventas.lista)

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

  calcularNumeroElementosTabla(): void {
    this.numeroElementosTabla = this.pedidosFiltrados.lista.length;
  }

  enviarDatos() {
    this.alerta = false;
    try {
      let body: any = {
        startDate: this.startDate,
        endDate: this.endDate,
        nombreCalzado: this.nombreCalzado,
        numPedido: this.numPedido
      };
  
      console.log(body)
      this.ventaService.filtrarVentas(body)
        .pipe(
          retry(1),
          catchError(this.handleError)
        )
        .subscribe({
          next: (data) => {
            this.pedidosFiltrados = data;
            console.log(this.pedidosFiltrados);
            this.pedidosFiltradosVacio = false;
            this.calcularNumeroElementosTabla();
            this.calcularTotalSum();
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

  resetFilters() {
    this.startDate = null;
    this.endDate = null;
    this.pedidosFiltrados = [];
    this.numeroElementosTabla = 0;
    this.pedidosFiltradosVacio = true;
  }

  calcularTotalSum(): void {
    this.totalSum = this.pedidosFiltrados.lista.reduce((sum: any, item: { total: any; }) => sum + item.total, 0);
  }

  exportToExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.pedidosFiltrados.lista);

    // Agregar la suma total al final de la hoja
    const totalRow = { Item: 'Total', Total: this.totalSum };
    XLSX.utils.sheet_add_json(ws, [totalRow], { skipHeader: true, origin: -1 });

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas Filtradas');

    // Guardar el archivo Excel
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'ventas_filtradas.xlsx');
  }
  

}


