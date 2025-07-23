import {Component, input, output, EventEmitter, signal, effect, OnDestroy, viewChild, ElementRef} from '@angular/core';
import {FormControl, ReactiveFormsModule} from "@angular/forms";

@Component({
    selector: 'search-select',
    standalone: true,
    imports: [ReactiveFormsModule],
    template: `
        <div class="dropdown-container">
            <input
                    #searchinput
                    type="text"
                    (click)="openDropdown()"
                    (input)="onSearchInput($event)"
                    [formControl]="search"
                    [placeholder]="placeholder()"
                    autocomplete="off"
            />

            @if (isDropdownOpen()) {
                <div class="dropdown">
                    @if (isWaiting()) {
                        <div class="dropdown-item">lade...</div>
                    } @else {
                        @for (opt of filteredOptions(); track $index) {
                            <div class="dropdown-item" (click)="selectOption($index)">
                                {{opt[1]}}
                            </div>
                        } @empty {
                            <div class="dropdown-item">Keine Ergebnisse</div>
                        }
                    }
                </div>
            }
        </div>
    `
})
export class SearchSelectComponent<T> implements OnDestroy {
    fetchOptions = input.required<(query: string) => Promise<[T, string][]>>();
    placeholder = input("Select...");
    selectedChange = output<T>();

    searchInput = viewChild<ElementRef<HTMLInputElement>>('searchinput');
    search = new FormControl('');
    isDropdownOpen = signal(false);
    isWaiting = signal(false);
    filteredOptions = signal<[T, string][]>([]);
    selected = signal('');

    // Bounce/debounce variables
    private debounceMs = 350; // ms
    private debounceTimer: any = null;

    openDropdown() {
        this.isDropdownOpen.set(true);
        this.selected.set('');
        this.search.setValue('');
    }

    closeDropdown() {
        this.isDropdownOpen.set(false);
        this.filteredOptions.set([]);
        this.isWaiting.set(false);
        this.search.setValue(this.selected());
    }

    onSearchInput(ev: Event) {
        const val = (ev.target as HTMLInputElement).value;

        this.search.setValue(val);
        this.debouncedLoad(val);
    }

    debouncedLoad(query: string) {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        // Wait debounceMs ms, then trigger loadOptions
        this.debounceTimer = setTimeout(() => {
            this.loadOptions(query);
        }, this.debounceMs);
    }

    async loadOptions(query: string) {
        if (!this.fetchOptions()) return;
        this.isWaiting.set(true);
        try {
            const options = await this.fetchOptions()(query);
            this.filteredOptions.set(options);
        } finally {
            this.isWaiting.set(false);
        }
    }

    selectOption(index: number) {
        const sel = this.filteredOptions()[index]
        this.selected.set(sel[1]);
        this.selectedChange.emit(sel[0]);
        this.closeDropdown();
    }

    ngOnDestroy() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
    }
}