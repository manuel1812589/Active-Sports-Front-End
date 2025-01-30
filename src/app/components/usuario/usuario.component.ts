import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '../../service/usuario.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Usuario } from './../../model/usuarios';
import { Observable, throwError, Subject } from 'rxjs';
import { retry, catchError, takeUntil } from 'rxjs/operators';
import { Roles } from 'src/app/model/roles';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css'],
})
export class UsuarioComponent implements OnInit {
  public usuario: Usuario;
  public usuarioEditar: Usuario;
  public pages: any;
  public estadosList: any;
  public rolesList: any;
  public rolPerfilList: any;
  public pagePrev = 1;
  public pageNext = 1;
  usuarios: any = [];
  public selectedFile;
  public imagenState: boolean;
  selectedRoles: any[] = [];
  tipoActualizacion: string = '';
  mostrarRoles: boolean = true;
  mostrarPassword: boolean = false;
  usuarioForm!: FormGroup; // Reactive form
  dniInfo: any = null;

  cargando: boolean = false;
  mensaje: string;
  alerta: boolean;
  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private router: Router,
    private usuarioService: UsuariosService,
    private routerIntParams: ActivatedRoute,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    let fecha: Date = new Date();
    this.cargando = true;
    this.mensaje = 'Cargando lista de Usuarios';
    this.usuario = new Usuario('', '', '', '', 0, 0);
    this.usuarioEditar = new Usuario('', '', '', '', 0, 0);
    this.alerta = true;
    this.selectedFile = '';
    this.imagenState = false;
    this.selectedRoles = [];
  }

  ngOnInit(): void {
    this.getUsuarios();
    this.usuarioForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      nombre: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      dni: [
        '',
        [
          Validators.required,
          Validators.min(1), // Evita números negativos o cero
          Validators.maxLength(8), // Máximo 8 dígitos
          Validators.pattern(/^\d+$/), // Solo números
        ],
      ],
      roles: ['', Validators.required],
      password: ['', [Validators.required]],
    });
  }

  calculateItemNumber(index: number): number {
    const currentPage = +this.routerIntParams.snapshot.params['pages'] || 0;
    const itemsPerPage = this.usuarios.lista.size;
    return currentPage * itemsPerPage + index + 1;
  }

  getUsuarios() {
    this.routerIntParams.params.subscribe((params) => {
      let page = +params['pages'];
      if (!page) {
        page = 0;
      }

      try {
        this.usuarioService
          .index(page)
          .pipe(retry(1), catchError(this.handleError))
          .subscribe({
            next: (data) => {
              this.usuarios = data;
              this.rolesList = this.usuarios.roles;
              this.usuario['roles'] =
                this.rolesList !== undefined ? this.rolesList[0].id : null;
              console.log(this.usuarios);

              this.pages = [];
              for (let i = 0; i < this.usuarios.lista.totalPages; i++) {
                this.pages.push(i);
              }
              if (page >= 1) {
                this.pagePrev = page - 1;
              } else {
                this.pagePrev = page;
              }
              if (page < this.usuarios.lista.totalPages || page == 1) {
                this.pageNext = page + 1;
              } else {
                this.pageNext = page;
              }
            },
            error: (error) => {
              if (error == 401) {
                this.mensaje =
                  'No tiene permiso para ingresar a la lista de usuarios';
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

  registrarUsuario() {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      this.toastr.error('Por favor, ingrese los datos correctamente', 'Error');
      return;
    }

    const usuario = this.usuarioForm.value;
    const agregarJsonRol = { id: usuario.roles };

    const formData = {
      nombre: usuario.nombre,
      roles: agregarJsonRol,
      correo: usuario.correo,
      password: usuario.password,
      dni: usuario.dni,
    };

    this.alerta = false;

    this.usuarioService
      .crear(formData, 1)
      .pipe(retry(1), catchError(this.handleError))
      .subscribe({
        next: (data) => {},
        error: () => {
          this.alerta = true;
        },
        complete: () => {
          this.getUsuarios();
          document.getElementById('cerrarModal')?.click();
          this.usuarioForm.reset();
        },
      });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    console.log(this.selectedFile);
  }

  actualizarUsuario() {
    if (!this.usuarioForm.valid) {
      this.alerta = true;
      return;
    }

    this.alerta = false;
    let tipo: number = 0;
    let formData: any;

    const usuario = this.usuarioForm.value;

    if (!usuario.id) {
      console.error('ID no encontrado en el formulario:', usuario);
      return;
    }

    let newPassword = '';
    if (usuario.password !== this.usuarioEditar.password) {
      newPassword = usuario.password;
    }

    let agregarJsonRol = {
      id: usuario.roles,
    };
    formData = {
      id: usuario.id,
      nombre: usuario.nombre,
      dni: usuario.dni,
      roles: agregarJsonRol,
      correo: usuario.correo,
      password: newPassword,
    };

    tipo = 1;

    console.log('formData:', formData);

    try {
      let actualizarObservable;

      if (this.tipoActualizacion === 'editarCliente') {
        actualizarObservable = this.usuarioService.actualizarCliente(
          formData,
          tipo
        );
      } else {
        actualizarObservable = this.usuarioService.actualizar(formData, tipo);
      }

      // Realizar la solicitud de actualización
      actualizarObservable
        .pipe(retry(1), catchError(this.handleError))
        .subscribe({
          next: (data) => {
            console.log(data);
            this.getUsuarios();
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

  cambiarStateImg(usuario: any) {
    this.imagenState = false;
    this.usuario = new Usuario(
      usuario.correo,
      usuario.roles.id,
      usuario.password,
      usuario.nombre,
      usuario.dni,
      usuario.id
    );
  }

  verUsuario(usuario: any, tipo: string) {
    this.usuarioForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      nombre: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      dni: [
        '',
        [
          Validators.required,
          Validators.min(1), // Evita números negativos o cero
          Validators.maxLength(8), // Máximo 8 dígitos
          Validators.pattern(/^\d+$/), // Solo números
        ],
      ],
      roles: ['', Validators.required],
      password: ['', [Validators.required]],
      id: ['', [Validators.required]],
    });

    this.tipoActualizacion = tipo;
    this.mostrarRoles = tipo !== 'editarCliente';

    if (!usuario.id) {
      console.error('ID del usuario no encontrado:', usuario);
      return;
    }

    this.usuarioEditar = new Usuario(
      usuario.correo,
      usuario.roles.id,
      '',
      usuario.nombre,
      usuario.dni,
      usuario.id
    );

    this.selectedRoles = usuario.roles.map((role: any) => ({ id: role.id }));

    this.usuarioForm.patchValue({
      correo: usuario.correo,
      nombre: usuario.nombre,
      dni: usuario.dni,
      roles: usuario.roles.id,
      password: '',
      id: usuario.id,
    });

    if (tipo === 'editar' || tipo === 'editarCliente') {
      this.usuarioForm.get('password')?.clearValidators();
    } else {
      this.usuarioForm.get('password')?.setValidators([Validators.required]);
    }

    this.usuarioForm.get('password')?.updateValueAndValidity();

    $('#actualizar').modal('show');
    console.log(this.usuarioForm.value);
  }

  resetFormulario() {
    this.usuarioForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      nombre: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
      dni: [
        '',
        [
          Validators.required,
          Validators.min(1), // Evita números negativos o cero
          Validators.maxLength(8), // Máximo 8 dígitos
          Validators.pattern(/^\d+$/), // Solo números
        ],
      ],
      roles: ['', Validators.required],
      password: ['', [Validators.required]],
    });
    console.log('Formulario Reseteado');
  }

  onBuscarDni() {
    const dni = this.usuarioForm.get('dni')?.value;
    this.toastr.warning('BUSCANDO DNI', 'Espera');
    if (dni) {
      this.usuarioService.buscarDni(dni).subscribe({
        next: (response) => {
          if (response.success) {
            this.dniInfo = response.data;
            let nombreCompleto = response.data.nombre_completo;
            nombreCompleto = nombreCompleto.replace(',', '').trim();
            this.usuarioForm.get('nombre')?.setValue(nombreCompleto);
            this.toastr.success('DNI CORRECTO', 'Éxito');
          } else {
            this.dniInfo = null;
            this.toastr.error('DNI INCORRECTO', 'ERROR');
          }
        },
        error: (err) => {
          console.error(err);
          alert('Error al buscar el DNI');
        },
      });
    }
  }

  eliminarUsuario(usuario: Usuario) {
    if (confirm('¿Estás seguro de que quieres eliminar a este usuario?')) {
      this.alerta = false;
      let formData;
      formData = {
        id: usuario.id,
      };
      try {
        this.usuarioService
          .eliminar(usuario)
          .pipe(retry(1), catchError(this.handleError))
          .subscribe({
            next: (data) => {
              console.log(data);
              this.getUsuarios();
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

  toggleRole(roleId: number) {
    const index = this.selectedRoles.findIndex((role) => role.id === roleId);
    if (index !== -1) {
      this.selectedRoles.splice(index, 1);
    } else {
      this.selectedRoles.push({ id: roleId });
    }
  }

  isRoleSelected(roleId: number): boolean {
    return (
      Array.isArray(this.usuarioEditar.roles) &&
      this.usuarioEditar.roles.some((role: Roles) => role.id === roleId)
    );
  }

  abrirModalCliente() {
    $('#clientModal').modal('show');
  }

  abrirModal() {
    $('#clientModal').modal('show');
  }
}
