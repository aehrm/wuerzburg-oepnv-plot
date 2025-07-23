import { Routes } from "@angular/router";
import { BuilderComponent } from "./builder/builder.component";

export const routes: Routes = [
  { path: "", pathMatch: "full", component: BuilderComponent },
];
