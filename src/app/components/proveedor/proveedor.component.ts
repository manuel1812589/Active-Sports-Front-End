import { Component, OnInit } from '@angular/core';
import { ProveedorService } from '../../service/proveedor.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Proveedor } from './../../model/proveedor';
import { Observable, throwError, Subject } from 'rxjs';
import { retry, catchError, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Component({
  selector: 'app-proveedor',
  templateUrl: './proveedor.component.html',
  styleUrls: ['./proveedor.component.css'],
})
export class ProveedorComponent implements OnInit {
  public proveedor: Proveedor;
  public proveedorEditar: Proveedor;
  public pages: any;
  public pagePrev = 1;
  public pageNext = 1;
  proveedores: any = [];
  public selectedFile;
  public imagenState: boolean;
  proveedorForm!: FormGroup;

  cargando: boolean = false;
  mensaje: string;
  alerta: boolean;
  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private router: Router,
    private proveedorService: ProveedorService,
    private routerIntParams: ActivatedRoute,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.cargando = true;
    this.mensaje = 'Cargando lista de Estados';
    this.proveedor = new Proveedor('', '', '', 0);
    this.proveedorEditar = new Proveedor('', '', '', 0);
    this.alerta = true;
    this.imagenState = false;
    this.selectedFile = '';
  }

  ngOnInit(): void {
    this.getProveedores();
    this.proveedorForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      telefono: [
        '',
        [
          Validators.required,
          Validators.pattern('^[+]?[(]?[0-9]{1,4}[)]?[-\\s./0-9]*$'), // Permite números internacionales con +, paréntesis, espacios y guiones
        ],
      ],
      correo: [
        '',
        [
          Validators.required,
          Validators.email, // Valida que sea un formato de correo válido
        ],
      ],
    });
  }

  calculateItemNumber(index: number): number {
    const currentPage = +this.routerIntParams.snapshot.params['pages'] || 0;
    const itemsPerPage = this.proveedores.lista.size;
    return currentPage * itemsPerPage + index + 1;
  }

  getProveedores() {
    this.routerIntParams.params.subscribe((params) => {
      let page = +params['pages'];
      if (!page) {
        page = 0;
      }

      try {
        this.proveedorService
          .index(page)
          .pipe(retry(1), catchError(this.handleError))
          .subscribe({
            next: (data) => {
              this.proveedores = data;
              console.log(this.proveedores.lista.content);

              this.pages = [];
              for (let i = 0; i < this.proveedores.lista.totalPages; i++) {
                this.pages.push(i);
              }
              if (page >= 1) {
                this.pagePrev = page - 1;
              } else {
                this.pagePrev = page;
              }
              if (page < this.proveedores.lista.totalPages || page == 1) {
                this.pageNext = page + 1;
              } else {
                this.pageNext = page;
              }
            },
            error: (error) => {
              if (error == 401) {
                this.mensaje =
                  'No tiene permiso para ingresar a la lista de estado';
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

  registrarProveedor() {
    if (this.proveedorForm.invalid) {
      this.proveedorForm.markAllAsTouched();
      this.toastr.error('Por favor, ingrese los datos correctamente', 'Error');
      return;
    }

    const proveedor = this.proveedorForm.value;

    const formData = {
      nombre: proveedor.nombre,
      telefono: proveedor.telefono,
      correo: proveedor.correo,
    };

    this.alerta = false;

    this.proveedorService
      .crear(formData, 1)
      .pipe(retry(1), catchError(this.handleError))
      .subscribe({
        next: (data) => {
          console.log('Proveedor creado:', data);
        },
        error: () => {
          console.log('ERROR DESDE SUBSCRIBE');
          this.alerta = true;
        },
        complete: () => {
          console.log('Completado');
          this.getProveedores();
          document.getElementById('cerrarModal')?.click();
          this.proveedorForm.reset();
        },
      });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    console.log(this.selectedFile);
  }

  actualizarProveedor() {
    if (!this.proveedorForm.valid) {
      this.alerta = true;
      this.toastr.error(
        'Por favor, corrija los errores en el formulario',
        'Error'
      );
      return;
    }

    this.alerta = false;

    const proveedor = this.proveedorForm.value;

    if (!proveedor.id) {
      console.error('ID no encontrado en el formulario:', proveedor);
      return;
    }

    const formData = {
      id: proveedor.id,
      nombre: proveedor.nombre,
      telefono: proveedor.telefono,
      correo: proveedor.correo,
    };

    const tipo = 1;

    console.log('formData:', formData); // Para depuración

    try {
      this.proveedorService
        .actualizar(formData, tipo)
        .pipe(retry(1), catchError(this.handleError))
        .subscribe({
          next: (data) => {
            console.log('Proveedor actualizado:', data);
            this.getProveedores();
            document.getElementById('cerrarModalAc')?.click();
          },
          error: () => {
            console.log('ERROR DESDE SUBSCRIBE');
            this.alerta = true;
          },
          complete: () => {
            console.log('Actualización completada');
          },
        });
    } catch (err) {
      console.log('ERROR DESDE CATCH', err);
    }
  }

  cambiarStateImg(proveedor: any) {
    this.imagenState = false;
    this.proveedor = new Proveedor(
      proveedor.nombre,
      proveedor.telefono,
      proveedor.correo,
      proveedor.id
    );
  }

  verProveedor(proveedor: any) {
    this.proveedorForm = this.fb.group({
      id: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      telefono: [
        '',
        [
          Validators.required,
          Validators.pattern('^[+]?[(]?[0-9]{1,4}[)]?[-\\s./0-9]*$'),
        ],
      ],
      correo: ['', [Validators.required, Validators.email]],
    });

    if (!proveedor.id) {
      console.error('ID del Proveedor no encontrado:', proveedor);
      return;
    }

    this.proveedorForm.patchValue({
      id: proveedor.id,
      nombre: proveedor.nombre,
      telefono: proveedor.telefono,
      correo: proveedor.correo,
    });

    $('#actualizar').modal('show');
    console.log(this.proveedorForm.value);
  }

  eliminarProveedor(proveedor: Proveedor) {
    if (confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
      this.alerta = false;
      try {
        this.proveedorService
          .eliminar(proveedor)
          .pipe(retry(1), catchError(this.handleError))
          .subscribe({
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
            },
          });
      } catch (err) {
        console.log('ERROR DESDE CATCH');
      }
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
