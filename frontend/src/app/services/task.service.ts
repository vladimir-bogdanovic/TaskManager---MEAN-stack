import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { Observable } from 'rxjs';
import { ListInterface } from '../models/list-model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private webRequest: WebRequestService) {}

  createList(listName: string) {
    return this.webRequest.post('lists', { title: listName });
  }

  createTask(listId: string, taskName: string) {
    return this.webRequest.post(`lists/${listId}/tasks`, {
      title: taskName,
    });
  }

  getLists() {
    return this.webRequest.get('lists');
  }

  getTasks(listId: string) {
    return this.webRequest.get(`lists/${listId}/tasks`);
  }
}
