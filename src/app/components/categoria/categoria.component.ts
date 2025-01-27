import { Component, OnInit } from '@angular/core';
import { CategoriaService } from '../../service/categoria.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Categoria } from './../../model/categoria';
import { Observable, throwError, Subject } from 'rxjs';
import { retry, catchError, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.css'],
})
export class CategoriaComponent implements OnInit {
  public categoria: Categoria;
  public categoriaEditar: Categoria;
  public pages: any;
  public estadosList: any;
  public pagePrev = 1;
  public pageNext = 1;
  categorias: any = [];
  public selectedFile;
  public imagenState: boolean;
  tipoActualizacion: string = '';
  categoriaForm!: FormGroup; // Reactive form

  cargando: boolean = false;
  mensaje: string;
  alerta: boolean;
  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private router: Router,
    private categoriaService: CategoriaService,
    private routerIntParams: ActivatedRoute,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    let fecha: Date = new Date();
    this.cargando = true;
    this.mensaje = 'Cargando lista de Categorías';
    this.categoria = new Categoria('', '', 0);
    this.categoriaEditar = new Categoria('', '', 0);
    this.alerta = true;
    this.selectedFile = '';
    this.imagenState = false;
  }

  ngOnInit(): void {
    this.getCategoria();
    this.categoriaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      estado: [null, Validators.required],
    });
  }

  calculateItemNumber(index: number): number {
    const currentPage = +this.routerIntParams.snapshot.params['pages'] || 0;
    const itemsPerPage = this.categorias.lista.size;
    return currentPage * itemsPerPage + index + 1;
  }

  getCategoria() {
    this.routerIntParams.params.subscribe((params) => {
      let page = +params['pages'];
      if (!page) {
        page = 0;
      }

      try {
        this.categoriaService
          .index(page)
          .pipe(retry(1), catchError(this.handleError))
          .subscribe({
            next: (data) => {
              this.categorias = data;
              this.estadosList = this.categorias.estado;
              this.categoria['estado'] =
                this.estadosList !== undefined ? this.estadosList[0].id : null;
              this.estadosList.splice(2, 1);
              console.log(this.categorias);

              this.pages = [];
              for (let i = 0; i < this.categorias.lista.totalPages; i++) {
                this.pages.push(i);
              }
              this.pagePrev = page >= 1 ? page - 1 : page;
              this.pageNext =
                page < this.categorias.lista.totalPages ? page + 1 : page;
            },
            error: (error) => {
              if (error == 401) {
                this.mensaje =
                  'No tiene permiso para ingresar a la lista de Categorías';
              }
              if (error == 400) {
                this.mensaje = 'Error en el servidor';
              }
            },
            complete: () => {
              this.cargando = true;
            },
          });
      } catch (err) {
        console.log('ERROR DESDE CATCH ', err);
      }
    });
  }

  registrarCategoria() {
    if (this.categoriaForm.invalid) {
      this.categoriaForm.markAllAsTouched();
      this.toastr.error('Por favor, ingrese los datos correctamente', 'Error');
      return;
    }

    const categoria = this.categoriaForm.value;
    const agregarEstado = { id: categoria.estado };

    const formData = {
      nombre: categoria.nombre,
      estado: agregarEstado,
    };

    this.alerta = false;

    this.categoriaService
      .crear(formData, 1)
      .pipe(retry(1), catchError(this.handleError))
      .subscribe({
        next: (data) => {},
        error: () => {
          this.alerta = true;
        },
        complete: () => {
          this.getCategoria();
          document.getElementById('cerrarModal')?.click();
          this.categoriaForm.reset();
          this.resetEstado();
        },
      });
  }

  actualizarCategoria() {
    if (!this.categoriaForm.valid) {
      this.alerta = true;
      return;
    }

    this.alerta = false;
    let tipo: number = 0;
    let formData: any;

    const categoria = this.categoriaForm.value;

    if (!categoria.id) {
      console.error('ID no encontrado en el formulario:', categoria);
      return;
    }

    let agregarJsonEstado = {
      id: categoria.estado,
    };

    formData = {
      id: categoria.id,
      nombre: categoria.nombre,
      estado: agregarJsonEstado,
    };

    tipo = 1;

    console.log('formData:', formData);

    try {
      this.categoriaService
        .actualizar(formData, tipo)
        .pipe(retry(1), catchError(this.handleError))
        .subscribe({
          next: (data) => {
            console.log(data);
            this.getCategoria();
            document.getElementById('cerrarModalAc')?.click();
          },
          error: () => {
            console.log('ERROR DESDE SUBSCRIBE');
            this.alerta = true;
          },
          complete: () => {
            console.log('Completado');
          },
        });
    } catch (err) {
      console.log('ERROR DESDE CATCH', err);
    }
  }

  archivarCategoria(estadoId: number) {
    if (!this.categoriaForm.valid) {
      this.alerta = true;
      return;
    }

    this.alerta = false;
    let tipo: number = 0;
    let formData: any;

    const categoria = this.categoriaForm.value;

    if (!categoria.id) {
      console.error('ID no encontrado en el formulario:', categoria);
      return;
    }

    let agregarJsonEstado = {
      id: estadoId,
    };

    formData = {
      id: categoria.id,
      nombre: categoria.nombre,
      estado: agregarJsonEstado,
    };

    tipo = 1;

    console.log('formData:', formData);

    try {
      this.categoriaService
        .actualizar(formData, tipo)
        .pipe(retry(1), catchError(this.handleError))
        .subscribe({
          next: (data) => {
            console.log(data);
            this.getCategoria();
            document.getElementById('cerrarModalAc')?.click();
          },
          error: () => {
            console.log('ERROR DESDE SUBSCRIBE');
            this.alerta = true;
          },
          complete: () => {
            console.log('Completado');
          },
        });
    } catch (err) {
      console.log('ERROR DESDE CATCH', err);
    }
  }

  verCategoria(categoria: any) {
    this.categoriaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      estado: ['', Validators.required],
      id: ['', [Validators.required]],
    });

    if (!categoria.id) {
      console.error('ID de la categoria no encontrado:', categoria);
      return;
    }

    this.categoriaEditar = new Categoria(
      categoria.nombre,
      categoria.estado.id,
      categoria.id
    );

    this.categoriaForm.patchValue({
      nombre: categoria.nombre,
      estado: categoria.estado.id,
      id: categoria.id,
    });

    $('#actualizar').modal('show');
    console.log(this.categoriaForm.value);
  }

  verCategoriaArchivar(categoria: any) {
    if (confirm('¿Estás seguro de que quieres archivar esta categoria?')) {
      this.categoriaForm = this.fb.group({
        nombre: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
        estado: ['', Validators.required],
        id: ['', [Validators.required]],
      });

      if (!categoria.id) {
        console.error('ID de la categoria no encontrado:', categoria);
        return;
      }

      this.categoriaEditar = new Categoria(
        categoria.nombre,
        categoria.estado.id,
        categoria.id
      );

      this.categoriaForm.patchValue({
        nombre: categoria.nombre,
        estado: categoria.estado.id,
        id: categoria.id,
      });

      this.archivarCategoria(3);
    }
  }

  resetFormulario() {
    this.categoriaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      estado: [null, Validators.required],
    });
    console.log('Formulario Reseteado');
  }

  resetEstado() {
    console.log(this.categoriaForm.value);
  }

  handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.status;
    } else {
      errorMessage = error.status;
    }

    return throwError(() => {
      return errorMessage;
    });
  }
}
