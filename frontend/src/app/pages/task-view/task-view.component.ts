import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
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
  selectedListId!: string;
  selectedTaskId!: string;
  test: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.taskService.getLists().subscribe((lists: ListInterface[]) => {
      this.lists = lists;
    });
    this.route.params.subscribe((params: Params) => {
      if (params?.['listId']) {
        this.selectedListId = params?.['listId'];
        this.taskService
          .getTasks(params?.['listId'])
          .subscribe((tasks: TaskInterface[]) => {
            this.tasks = tasks;
          });
      } else {
        this.tasks = undefined!;
      }
    });
  }

  // onTaskClick(task: TaskInterface) {
  //   this.taskService.completeTask(task).subscribe(() => {
  //     console.log(task);
  //     console.log('task is complete');
  //     task.completed = !task.completed;
  //   });
  // }

  onDeleteListClick() {
    this.taskService.deleteList(this.selectedListId).subscribe(() => {
      console.log('list is deleted successfully');
      this.router.navigate(['/lists']);
    });
  }

  onEditListClick() {
    this.router.navigate([`/edit-list/${this.selectedListId}`]);
  }

  onTaskDeleteClick(task: TaskInterface) {
    const taskId = task._id as string;
    console.log(taskId);
    this.taskService.deleteTask(this.selectedListId, taskId).subscribe(() => {
      console.log('Task deleted successfully');
      this.tasks = this.tasks.filter((value) => {
        value._id !== this.selectedTaskId;
      });
    });
  }

  onTaskEditClick(task: TaskInterface) {
    this.router.navigate([
      `lists/${this.selectedListId}/edit-task/${task._id}`,
    ]);
  }
}
