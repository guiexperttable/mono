// Loaded before every browser spec: the JIT compiler must exist before any Angular package is evaluated
// (dist/ and @angular/common are partially compiled – they are linked at runtime).
import '@angular/compiler';
