import "@angular/compiler";   // JIT – must come first (see vite.config.ts)
import "./styles.css";
import { provideZonelessChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app.component";

bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] })
  .catch(err => console.error(err));
