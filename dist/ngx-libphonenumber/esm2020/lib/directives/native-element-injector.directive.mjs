import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
/*
"Property 'nativeElement' does not exist on type 'FormControl'".
'NativeElementInjectorDirective' injects nativeElement to each control,
so we can access it from inside validator for example.
More about this approach and reasons for this:
https://github.com/angular/angular/issues/18025
https://stackoverflow.com/a/54075119/1617590
*/
export class NativeElementInjectorDirective {
    constructor(controlDir, host) {
        this.controlDir = controlDir;
        this.host = host;
    }
    ngOnInit() {
        if (this.controlDir.control) {
            // @ts-ignore
            this.controlDir.control['nativeElement'] = this.host.nativeElement;
        }
    }
}
NativeElementInjectorDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: NativeElementInjectorDirective, deps: [{ token: i1.NgControl }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
NativeElementInjectorDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.10", type: NativeElementInjectorDirective, selector: "[ngModel], [formControl], [formControlName]", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: NativeElementInjectorDirective, decorators: [{
            type: Directive,
            args: [{
                    // tslint:disable-next-line: directive-selector
                    selector: '[ngModel], [formControl], [formControlName]',
                }]
        }], ctorParameters: function () { return [{ type: i1.NgControl }, { type: i0.ElementRef }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF0aXZlLWVsZW1lbnQtaW5qZWN0b3IuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LWxpYnBob25lbnVtYmVyL3NyYy9saWIvZGlyZWN0aXZlcy9uYXRpdmUtZWxlbWVudC1pbmplY3Rvci5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBc0IsTUFBTSxlQUFlLENBQUM7OztBQUc5RDs7Ozs7OztFQU9FO0FBS0YsTUFBTSxPQUFPLDhCQUE4QjtJQUMxQyxZQUNTLFVBQXFCLEVBQ3JCLElBQWlDO1FBRGpDLGVBQVUsR0FBVixVQUFVLENBQVc7UUFDckIsU0FBSSxHQUFKLElBQUksQ0FBNkI7SUFDdkMsQ0FBQztJQUNKLFFBQVE7UUFDUCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFO1lBQzVCLGFBQWE7WUFDVixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztTQUN0RTtJQUNGLENBQUM7OzRIQVZXLDhCQUE4QjtnSEFBOUIsOEJBQThCOzRGQUE5Qiw4QkFBOEI7a0JBSjFDLFNBQVM7bUJBQUM7b0JBQ1YsK0NBQStDO29CQUMvQyxRQUFRLEVBQUUsNkNBQTZDO2lCQUN2RCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOZ0NvbnRyb2wgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5cbi8qXG5cIlByb3BlcnR5ICduYXRpdmVFbGVtZW50JyBkb2VzIG5vdCBleGlzdCBvbiB0eXBlICdGb3JtQ29udHJvbCdcIi5cbidOYXRpdmVFbGVtZW50SW5qZWN0b3JEaXJlY3RpdmUnIGluamVjdHMgbmF0aXZlRWxlbWVudCB0byBlYWNoIGNvbnRyb2wsXG5zbyB3ZSBjYW4gYWNjZXNzIGl0IGZyb20gaW5zaWRlIHZhbGlkYXRvciBmb3IgZXhhbXBsZS5cbk1vcmUgYWJvdXQgdGhpcyBhcHByb2FjaCBhbmQgcmVhc29ucyBmb3IgdGhpczpcbmh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzE4MDI1XG5odHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNTQwNzUxMTkvMTYxNzU5MFxuKi9cbkBEaXJlY3RpdmUoe1xuXHQvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IGRpcmVjdGl2ZS1zZWxlY3RvclxuXHRzZWxlY3RvcjogJ1tuZ01vZGVsXSwgW2Zvcm1Db250cm9sXSwgW2Zvcm1Db250cm9sTmFtZV0nLFxufSlcbmV4cG9ydCBjbGFzcyBOYXRpdmVFbGVtZW50SW5qZWN0b3JEaXJlY3RpdmUgaW1wbGVtZW50cyBPbkluaXQge1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRwcml2YXRlIGNvbnRyb2xEaXI6IE5nQ29udHJvbCxcblx0XHRwcml2YXRlIGhvc3Q6IEVsZW1lbnRSZWY8SFRNTEZvcm1FbGVtZW50PlxuXHQpIHt9XG5cdG5nT25Jbml0KCkge1xuXHRcdGlmICh0aGlzLmNvbnRyb2xEaXIuY29udHJvbCkge1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuICAgICAgdGhpcy5jb250cm9sRGlyLmNvbnRyb2xbJ25hdGl2ZUVsZW1lbnQnXSA9IHRoaXMuaG9zdC5uYXRpdmVFbGVtZW50O1xuXHRcdH1cblx0fVxufVxuIl19