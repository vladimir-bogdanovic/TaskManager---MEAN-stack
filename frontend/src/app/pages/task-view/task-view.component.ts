import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ListInterface } from 'src/app/models/list-model';
import { TaskInterface } from 'src/app/models/task-model';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss'],
})
export class TaskViewComponent implements OnInit {
  lists!: ListInterface[];
  tasks!: TaskInterface[];

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.taskService.getLists().subscribe((lists: ListInterface[]) => {
      this.lists = lists;
    });

    this.route.params.subscribe((params: Params) => {
      this.taskService
        .getTasks(params?.['listId'])
        .subscribe((tasks: TaskInterface[]) => {
          this.tasks = tasks;
        });
    });
  }

  onTaskClick(task: TaskInterface) {
    this.taskService.completeTask(task).subscribe(() => {
      console.log('task is complete');
      task.completed = !task.completed;
    });
  }
}
