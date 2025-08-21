import {
  Component,
  input,
  output,
  signal,
  computed,
  contentChild,
  TemplateRef,
  OnInit,
  OnChanges,
  effect,
} from "@angular/core";
import { CommonModule } from "@angular/common";

export interface TableItem {
  id: string;
  disabled?: boolean;
}

export interface TableGroup<T extends TableItem> {
  id: string;
  items: T[];
  expanded?: boolean;
}

@Component({
  selector: "app-grouped-table",
  imports: [CommonModule],
  template: `
    <div class="grouped-table">
      <!-- Header -->
      <ng-container [ngTemplateOutlet]="headerTemplate()"></ng-container>

      <!-- Groups -->
      <div class="table-body">
        @for (group of groups(); track group.id) {
          <div class="group-container">
            <!-- Group Header -->
            <div
              class="group-header"
              [class.expanded]="groupExpandedStates().get(group.id)"
            >
              <div class="group-header-row">
                <div class="label-column">
                  <ng-container
                    [ngTemplateOutlet]="groupHeaderTemplate()"
                    [ngTemplateOutletContext]="{
                      $implicit: group,
                      index: $index,
                    }"
                  ></ng-container>
                </div>
                <div class="expand-column">
                  <button
                    class="material-button"
                    (click)="toggleGroupExpansion(group.id)"
                  >
                    @if (groupExpandedStates().get(group.id)) {
                      keyboard_arrow_up
                    } @else {
                      keyboard_arrow_down
                    }
                  </button>
                </div>
              </div>
            </div>

            <!-- Group Items -->
            @if (groupExpandedStates().get(group.id)) {
              <div class="group-items">
                @for (item of group.items; track item.id) {
                  <div
                    class="item-row"
                    [class.disabled]="item.disabled ?? false"
                  >
                    <div class="item-content">
                      <ng-container
                        [ngTemplateOutlet]="itemTemplate()"
                        [ngTemplateOutletContext]="{
                          $implicit: item,
                          index: getItemIndex(group, item),
                        }"
                      ></ng-container>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class GroupedTableComponent<T extends TableItem> {
  groups = input.required<TableGroup<T>[]>();
  initialExpandedGroups = input<string[]>([]);

  // Content projection for row template
  itemTemplate = contentChild.required<TemplateRef<any>>("itemTemplate");
  headerTemplate = contentChild.required<TemplateRef<any>>("headerTemplate");
  groupHeaderTemplate = contentChild.required<TemplateRef<any>>(
    "groupHeaderTemplate",
  );

  groupExpansionChange = output<{
    groupId: string;
    expanded: boolean;
  }>();

  groupExpandedStates = signal<Map<string, boolean>>(new Map());

  constructor() {}

  allItems = computed(() => {
    return this.groups().flatMap((x) => x.items);
  });

  getItemIndex(group: TableGroup<T>, item: T): number {
    return group.items.indexOf(item);
  }

  toggleGroupExpansion(groupId: string): void {
    const currentStates = this.groupExpandedStates();
    const newStates = new Map(currentStates);
    newStates.set(groupId, !currentStates.get(groupId));

    this.groupExpandedStates.set(newStates);
    this.groupExpansionChange.emit({
      groupId,
      expanded: newStates.get(groupId)!,
    });
  }
}
