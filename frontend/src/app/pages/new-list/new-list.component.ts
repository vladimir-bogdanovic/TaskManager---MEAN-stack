import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ListInterface } from 'src/app/models/list-model';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-new-list',
  templateUrl: './new-list.component.html',
  styleUrls: ['./new-list.component.scss'],
})
export class NewListComponent {
  inputValue!: string;

  constructor(private taskService: TaskService, private router: Router) {}

  createNewList() {
    this.taskService
      .createList(this.inputValue)
      .subscribe((list: ListInterface) => {
        this.router.navigate(['/lists', list._id]);
      });
  }
}
