import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from 'environments/environment';

// Rxjs
import { BehaviorSubject, Observable, catchError, retry, shareReplay, throwError } from 'rxjs';

// Interface
interface ITask {
  id: string, title: string
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Novo
  public name = signal('Dener Troquatte');

  // Antigo
  public name$ = new BehaviorSubject('Dener Troquatte $');

  // Consimundo BackEnd com Http
  #http = inject(HttpClient);
  #url = signal(environment.apiTasks)

  constructor() { }

  public getListTasksError = signal<null | string>(null)
  public getListTasks$(): Observable<Array<ITask>> {
    this.getListTasksError.set(null);
    return this.#http.get<Array<ITask>>(this.#url()).pipe(
      shareReplay(),
      retry({ count: 2, delay: 1000 }),
      catchError( (error: HttpErrorResponse) => this.#handleError(error, 'getListTasksError'))
    )
  }

  public getTaskError = signal<null | string>(null)
  public getTask$(id: string): Observable<ITask> {
    this.getTaskError.set(null);
    return this.#http.get<ITask>(`${this.#url()}/${id}`).pipe(
      shareReplay(),
      retry({ count: 2, delay: 1000 }),
      catchError( (error: HttpErrorResponse) => this.#handleError(error, 'getTaskError'))
    )
  }

  public createTaskError = signal<null | string>(null)
  public createTask$(title: string): Observable<ITask>{
    return this.#http.post<ITask>(this.#url(), { title }).pipe(
      shareReplay(),
      retry({ count: 2, delay: 1000 }),
      catchError( (error: HttpErrorResponse) => this.#handleError(error, 'createTaskError'))
    )
  }

  // Error Validator ----------------------
  #handleError(error: HttpErrorResponse, errorType: string){
    const errorMessage = error.error.message;

    switch (errorType) {
      case 'getListTasksError':
        this.getListTasksError.set(errorMessage)
      break;

      case 'getTaskError':
        this.getTaskError.set(errorMessage)
      break;

      case 'createTaskError':
        this.createTaskError.set(errorMessage)
      break;

    }

    return throwError( () => errorMessage)
  }
}
