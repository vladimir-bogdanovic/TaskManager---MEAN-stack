import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListInterface } from '../models/list-model';
import { HttpClient } from '@angular/common/http';
import { TaskInterface } from '../models/task-model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  createList(listName: string): Observable<ListInterface> {
    return this.http.post<ListInterface>(`${this.baseUrl}/lists`, {
      title: listName,
    });
  }

  createTask(listId: string, newTask: string): Observable<TaskInterface> {
    return this.http.post<TaskInterface>(
      `${this.baseUrl}/lists/${listId}/tasks`,
      {
        title: newTask,
      }
    );
  }

  getLists(): Observable<ListInterface[]> {
    return this.http.get<ListInterface[]>(`${this.baseUrl}/lists`);
  }

  getTasks(listId: string): Observable<TaskInterface[]> {
    return this.http.get<TaskInterface[]>(
      `${this.baseUrl}/lists/${listId}/tasks`
    );
  }

  completeTask(task: TaskInterface): Observable<TaskInterface> {
    return this.http.patch<TaskInterface>(
      `${this.baseUrl}/lists/${task._listId}/tasks/${task._id}`,
      { completed: !task.completed }
    );
  }

  deleteList(listId: string): Observable<ListInterface> {
    return this.http.delete<ListInterface>(`${this.baseUrl}/lists/${listId}`);
  }

  editList(listName: string, listId: string): Observable<ListInterface> {
    return this.http.patch<ListInterface>(`${this.baseUrl}/lists/${listId}`, {
      title: listName,
    });
  }

  deleteTask(listId: string, taskId: string): Observable<TaskInterface> {
    return this.http.delete<TaskInterface>(
      `${this.baseUrl}/lists/${listId}/tasks/${taskId}`
    );
  }

  editTask(
    listId: string,
    taskid: string,
    taskName: string
  ): Observable<TaskInterface> {
    return this.http.patch<TaskInterface>(
      `${this.baseUrl}/lists/${listId}/tasks/${taskid}`,
      {
        title: taskName,
      }
    );
  }

  signup(email: string, password: string): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/users`,
      { email, password },
      { observe: 'response' }
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/users/login`,
      { email, password },
      { observe: 'response' }
    );
  }
}
