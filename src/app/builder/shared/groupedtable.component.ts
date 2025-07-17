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
    effect
} from '@angular/core';
import {CommonModule} from "@angular/common";

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
    selector: 'app-grouped-table',
    imports: [CommonModule],
    template: `
    <div class="grouped-table">
      <!-- Header -->
      <ng-container
              [ngTemplateOutlet]="headerTemplate()"
      ></ng-container>

      <!-- Groups -->
      <div class="table-body">
        @for (group of groups(); track group.id) {
          <div class="group-container">
            <!-- Group Header -->
            <div class="group-header" [class.expanded]="groupExpandedStates().get(group.id)">
              <div class="group-header-row">
                <div class="checkbox-column">
                  <input 
                    type="checkbox" 
                    [checked]="getGroupCheckboxState(group.id).checked"
                    [indeterminate]="getGroupCheckboxState(group.id).indeterminate"
                    (change)="toggleGroupSelection(group.id, $event)"
                    class="group-checkbox"
                  >
                </div>
                <div class="expand-column">
                  <button 
                    class="expand-button"
                    (click)="toggleGroupExpansion(group.id)"
                    [attr.aria-expanded]="groupExpandedStates().get(group.id)"
                  >
                    <span class="expand-icon" [class.rotated]="groupExpandedStates().get(group.id)">▶</span>
                  </button>
                </div>
                <ng-container
                        [ngTemplateOutlet]="groupHeaderTemplate()"
                        [ngTemplateOutletContext]="{ $implicit: group, index: $index }"
                ></ng-container>
              </div>
            </div>

            <!-- Group Items -->
            @if (groupExpandedStates().get(group.id)) {
              <div class="group-items">
                @for (item of group.items; track item.id) {
                  <div class="item-row" [class.selected]="isItemSelected(item.id)" [class.disabled]="item.disabled ?? false">
                    <div class="checkbox-column">
                      <input 
                        type="checkbox" 
                        [disabled]="item.disabled ?? false"
                        [checked]="isItemSelected(item.id)"
                        (change)="toggleItemSelection(item.id, group.id, $event)"
                        class="item-checkbox"
                      >
                    </div>
                    <div class="item-content">
                      <ng-container 
                        [ngTemplateOutlet]="itemTemplate()" 
                        [ngTemplateOutletContext]="{ $implicit: item, index: getItemIndex(group, item) }"
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
  `
})
export class GroupedTableComponent<T extends TableItem> {
    groups = input.required<TableGroup<T>[]>();
    initialExpandedGroups = input<string[]>([]);

    // Content projection for row template
    itemTemplate = contentChild.required<TemplateRef<any>>('itemTemplate');
    headerTemplate = contentChild.required<TemplateRef<any>>('headerTemplate');
    groupHeaderTemplate = contentChild.required<TemplateRef<any>>('groupHeaderTemplate');

    // Outputs
    selectionChange = output<{
        selectedItems: string[];
        selectedByGroup: Map<string, string[]>;
    }>();

    groupExpansionChange = output<{
        groupId: string;
        expanded: boolean;
    }>();

    // Internal state
    selectedIds = signal<Set<string>>(new Set());
    groupExpandedStates = signal<Map<string, boolean>>(new Map());

    constructor() {
        // effect(() => {
        //     this.initializeExpandedStates();
        // })
    }

    // Computed values
    headerCheckboxState = computed(() => {
        const selectedCount = this.selectedIds().size;
        const totalCount = this.groups().flatMap(group => group.items).length;
        const disabledCount = this.allItems().filter((item: T) => item.disabled ?? false).length;

        if (selectedCount === 0) {
            return { checked: false, indeterminate: false };
        } else if (selectedCount === totalCount - disabledCount) {
            return { checked: true, indeterminate: false };
        } else {
            return { checked: false, indeterminate: true };
        }
    });

    selectedItems = computed(() => {
        const selectedIds = this.selectedIds();
        return this.allItems().filter(x => selectedIds.has(x.id));
    })

    allItems = computed(() => {
        return this.groups().flatMap(x => x.items);
    })

    // Public methods for template
    getGroupCheckboxState(groupId: string) {
        const group = this.groups().find(g => g.id === groupId);
        if (!group) return { checked: false, indeterminate: false };

        const groupItemIds = group.items.map(item => item.id);
        const selectedInGroup = groupItemIds.filter(id => this.selectedIds().has(id)).length;
        const disabledInGroup = group.items.filter(item => item.disabled ?? false).length;

        if (selectedInGroup === 0) {
            return { checked: false, indeterminate: false };
        } else if (selectedInGroup === groupItemIds.length - disabledInGroup) {
            return { checked: true, indeterminate: false };
        } else {
            return { checked: false, indeterminate: true };
        }
    }

    isItemSelected(itemId: string): boolean {
        return this.selectedIds().has(itemId);
    }

    getItemIndex(group: TableGroup<T>, item: T): number {
        return group.items.indexOf(item);
    }

    toggleSelectAll(event: Event): void {
        const checkbox = event.target as HTMLInputElement;
        const allItemIds = this.groups().flatMap(group => group.items)
            .filter(item => !item.disabled).map(item => item.id);

        if (checkbox.checked) {
            this.selectedIds.set(new Set(allItemIds));
        } else {
            this.selectedIds.set(new Set());
        }

        this.emitSelectionChange();
    }

    toggleGroupSelection(groupId: string, event: Event): void {
        const checkbox = event.target as HTMLInputElement;
        const group = this.groups().find(g => g.id === groupId);
        if (!group) return;

        const groupItemIds = group.items.filter(item => !item.disabled).map(item => item.id);
        const newSelected = new Set(this.selectedIds());

        if (checkbox.checked) {
            groupItemIds.forEach(id => newSelected.add(id));
        } else {
            groupItemIds.forEach(id => newSelected.delete(id));
        }

        this.selectedIds.set(newSelected);
        this.emitSelectionChange();
    }

    toggleItemSelection(itemId: string, groupId: string, event: Event): void {
        const checkbox = event.target as HTMLInputElement;
        const newSelected = new Set(this.selectedIds());

        if (checkbox.checked) {
            newSelected.add(itemId);
        } else {
            newSelected.delete(itemId);
        }

        this.selectedIds.set(newSelected);
        this.emitSelectionChange();
    }

    toggleGroupExpansion(groupId: string): void {
        const currentStates = this.groupExpandedStates();
        // const newStates = {
        //     ...currentStates,
        //     [groupId]: !currentStates.get(groupId)
        // };
        const newStates = new Map(currentStates);
        newStates.set(groupId, !currentStates.get(groupId));

        this.groupExpandedStates.set(newStates);
        this.groupExpansionChange.emit({
            groupId,
            expanded: newStates.get(groupId)!
        });
    }

    // Private methods
    private initializeExpandedStates(): void {
        const initialStates: Map<string, boolean> = new Map();
        this.groups().forEach(group => {
            initialStates.set(group.id, this.initialExpandedGroups().includes(group.id));
        });
        this.groupExpandedStates.set(initialStates);
    }

    private emitSelectionChange(): void {
        const selectedItemsArray = Array.from(this.selectedIds());
        const selectedByGroup: Map<string, string[]> = new Map();

        this.groups().forEach(group => {
            const groupItemIds = group.items.map(item => item.id);
            selectedByGroup.set(group.id, groupItemIds.filter(id => this.selectedIds().has(id)));
        });

        this.selectionChange.emit({
            selectedItems: selectedItemsArray,
            selectedByGroup
        });
    }
}