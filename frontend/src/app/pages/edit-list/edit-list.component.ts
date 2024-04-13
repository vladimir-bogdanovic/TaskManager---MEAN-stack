import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ListInterface } from 'src/app/models/list-model';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-edit-list',
  templateUrl: './edit-list.component.html',
  styleUrls: ['./edit-list.component.scss'],
})
export class EditListComponent implements OnInit {
  inputValue!: string;
  listId!: string;

  constructor(
    private router: Router,
    private taskService: TaskService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.listId = params?.['listId'];
    });
  }

  editList() {
    this.taskService
      .editList(this.inputValue, this.listId)
      .subscribe((list: ListInterface) => {
        console.log(list);
        this.router.navigate(['lists']);
      });
  }
}
