import { Component, OnInit } from '@angular/core';
import { MarcaService } from '../../service/marca.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Marca } from './../../model/marca';
import { Observable, throwError, Subject } from 'rxjs';
import { retry, catchError, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var $: any;
@Component({
  selector: 'app-marca',
  templateUrl: './marca.component.html',
  styleUrls: ['./marca.component.css']
})
export class MarcaComponent implements OnInit{

  public marca: Marca;
  public marcaEditar: Marca;
  public pages: any;
  public estadosList: any;
  public pagePrev = 1;
  public pageNext = 1;
  marcas: any = [];
  public selectedFile;
  public imagenState: boolean;
  tipoActualizacion: string = '';
  marcaForm!: FormGroup; // Reactive form

  cargando: boolean = false;
  mensaje: string;
  alerta: boolean;
  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private router: Router, private marcaService: MarcaService, private routerIntParams: ActivatedRoute, private toastr: ToastrService, private fb: FormBuilder) {
    let fecha: Date = new Date();
    this.cargando = true;
    this.mensaje = "Cargando lista de Marcas";
    this.marca = new Marca('', '', 0);
    this.marcaEditar = new Marca('', '', 0);
    this.alerta = true;
    this.selectedFile = "";
    this.imagenState = false;
  }

  ngOnInit(): void {
    this.getMarca();
    this.marcaForm = this.fb.group({
        nombre: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
        estado: [null, Validators.required],
    });
  }

  calculateItemNumber(index: number): number {
    const currentPage = +this.routerIntParams.snapshot.params['pages'] || 0;
    const itemsPerPage = this.marcas.lista.size;
    return (currentPage * itemsPerPage) + index + 1;
  } 

  getMarca() {
    this.routerIntParams.params.subscribe(params => {
      let page = +params["pages"];
      if (!page) {
        page = 0;
      }

      try {
        this.marcaService.index(page).pipe(retry(1), catchError(this.handleError)).subscribe({
          next: (data) => {
            this.marcas = data
            this.estadosList = this.marcas.estado;
            this.marca['estado'] = this.estadosList !== undefined ? this.estadosList[0].id : null;
            this.estadosList.splice(2, 1);
            console.log(this.marcas.lista.content)

            this.pages = [];
            for (let i = 0; i < this.marcas.lista.totalPages; i++) {
              this.pages.push(i)
            }
            if (page >= 1) {
              this.pagePrev = (page - 1);
            } else {
              this.pagePrev = page
            }
            if (page < this.marcas.lista.totalPages || page == 1) {
              this.pageNext = (page + 1);
            } else {
              this.pageNext = page
            }

          },
          error: (error) => {
            if (error == 401) {
              this.mensaje = "No tiene permiso para ingresar a la lista de Marcas";
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

  registrarMarca() {
    if (this.marcaForm.invalid) {
      this.marcaForm.markAllAsTouched();
      this.toastr.error('Por favor, ingrese los datos correctamente', 'Error');
      return;
    }
  
    const marca = this.marcaForm.value;
    const agregarEstado = { id: marca.estado };
  
    const formData = {
      nombre: marca.nombre,
      estado: agregarEstado,
    };
  
    this.alerta = false;
  
    this.marcaService.crear(formData, 1).pipe(retry(1), catchError(this.handleError)).subscribe({
      next: (data) => {
      },
      error: () => {
        this.alerta = true;
      },
      complete: () => {
        this.getMarca();
        document.getElementById('cerrarModal')?.click();
        this.marcaForm.reset();
        this.resetEstado()
      },
    });
  }

  actualizarMarca() {
    if (!this.marcaForm.valid) {
      this.alerta = true;
      return;
    }
  
    this.alerta = false;
    let tipo: number = 0;
    let formData: any;
  
    const marca = this.marcaForm.value;
  
    if (!marca.id) {
      console.error('ID no encontrado en el formulario:', marca);
      return; 
    }
  
    let agregarJsonEstado = {
        id: marca.estado
      };
  
    formData = {
      id: marca.id,
      nombre: marca.nombre,
      estado: agregarJsonEstado,
    };
  
    tipo = 1;
  
    console.log('formData:', formData); 
  
    try {
      this.marcaService.actualizar(formData, tipo).pipe(retry(1), catchError(this.handleError)).subscribe({
        next: (data) => {
          console.log(data);
          this.getMarca(); 
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
      console.log('ERROR DESDE CATCH', err);
    }
  }

  archivarMarca(estadoId: number) {
    if (!this.marcaForm.valid) {
      this.alerta = true;
      return;
    }
  
    this.alerta = false;
    let tipo: number = 0;
    let formData: any;
  
    const marca = this.marcaForm.value;
  
    if (!marca.id) {
      console.error('ID no encontrado en el formulario:', marca);
      return; 
    }
  
    let agregarJsonEstado = {
        id: estadoId
      };
  
    formData = {
      id: marca.id,
      nombre: marca.nombre,
      estado: agregarJsonEstado,
    };
  
    tipo = 1;
  
    console.log('formData:', formData); 
  
    try {
      this.marcaService.actualizar(formData, tipo).pipe(retry(1), catchError(this.handleError)).subscribe({
        next: (data) => {
          console.log(data);
          this.getMarca(); 
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
      console.log('ERROR DESDE CATCH', err);
    }
  }

  verMarca(marca: any) {
    this.marcaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      estado: ['', Validators.required],
      id: ['', [Validators.required]]
  });

    if (!marca.id) {
      console.error('ID de la Marca no encontrado:', marca);
      return; 
    }
  
    this.marcaEditar = new Marca(marca.nombre, marca.estado.id, marca.id);
    
    this.marcaForm.patchValue({
      nombre: marca.nombre,
      estado: marca.estado.id,
      id: marca.id
    });
  
    $('#actualizar').modal('show');
    console.log(this.marcaForm.value);
  }

  verMarcaArchivar(marca: any) {
  if (confirm('¿Estás seguro de que quieres eliminar esta marca?')) {
      this.marcaForm = this.fb.group({
        nombre: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
        estado: ['', Validators.required],
        id: ['', [Validators.required]]
    });

      if (!marca.id) {
        console.error('ID de la Marca no encontrado:', marca);
        return; 
      }
    
      this.marcaEditar = new Marca(marca.nombre, marca.estado.id, marca.id);
      
      this.marcaForm.patchValue({
        nombre: marca.nombre,
        estado: marca.estado.id,
        id: marca.id
      });

      this.archivarMarca(3)
  }
  }

  resetFormulario(){
    this.marcaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      estado: [null, Validators.required],
  });
  console.log("Formulario Reseteado")
  }

  resetEstado(){
    console.log(this.marcaForm.value)
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