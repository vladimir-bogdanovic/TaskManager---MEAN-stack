import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TaskInterface } from 'src/app/models/task-model';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-edit-task',
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.scss'],
})
export class EditTaskComponent implements OnInit {
  inputValue!: string;
  listId!: string;
  taskId!: string;

  constructor(
    private router: Router,
    private taskService: TaskService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.listId = params?.['listId'];
      this.taskId = params?.['taskId'];
    });
    console.log(this.listId);
    console.log(this.taskId);
    console.log('aaasd');
  }

  editTask() {
    this.taskService
      .editTask(this.listId, this.taskId, this.inputValue)
      .subscribe((task: TaskInterface) => {
        console.log(task);
        console.log(this.listId);
        console.log(this.taskId);
        this.router.navigate([`lists/${this.listId}`]);
      });
  }
}
