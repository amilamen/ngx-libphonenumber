import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgModule } from '@angular/core';
import { NgxLibphonenumberComponent } from './ngx-libphonenumber.component';
import { NativeElementInjectorDirective } from './directives/native-element-injector.directive';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as i0 from "@angular/core";
import * as i1 from "ngx-bootstrap/dropdown";
export const dropdownModuleForRoot = BsDropdownModule.forRoot();
export class NgxLibphonenumberModule {
}
NgxLibphonenumberModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: NgxLibphonenumberModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
NgxLibphonenumberModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.2.10", ngImport: i0, type: NgxLibphonenumberModule, declarations: [NgxLibphonenumberComponent, NativeElementInjectorDirective], imports: [CommonModule,
        FormsModule,
        ReactiveFormsModule, i1.BsDropdownModule], exports: [NgxLibphonenumberComponent, NativeElementInjectorDirective] });
NgxLibphonenumberModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: NgxLibphonenumberModule, imports: [CommonModule,
        FormsModule,
        ReactiveFormsModule,
        dropdownModuleForRoot] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: NgxLibphonenumberModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [NgxLibphonenumberComponent, NativeElementInjectorDirective],
                    imports: [
                        CommonModule,
                        FormsModule,
                        ReactiveFormsModule,
                        dropdownModuleForRoot,
                    ],
                    exports: [NgxLibphonenumberComponent, NativeElementInjectorDirective],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWxpYnBob25lbnVtYmVyLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL25neC1saWJwaG9uZW51bWJlci9zcmMvbGliL25neC1saWJwaG9uZW51bWJlci5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFMUQsT0FBTyxFQUF1QixRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDOUQsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDNUUsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFDaEcsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7O0FBRWxFLE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUNoQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQVk3QixNQUFNLE9BQU8sdUJBQXVCOztxSEFBdkIsdUJBQXVCO3NIQUF2Qix1QkFBdUIsaUJBVG5CLDBCQUEwQixFQUFFLDhCQUE4QixhQUV2RSxZQUFZO1FBQ1osV0FBVztRQUNYLG1CQUFtQixrQ0FHWCwwQkFBMEIsRUFBRSw4QkFBOEI7c0hBRXpELHVCQUF1QixZQVBoQyxZQUFZO1FBQ1osV0FBVztRQUNYLG1CQUFtQjtRQUNuQixxQkFBcUI7NEZBSVosdUJBQXVCO2tCQVZuQyxRQUFRO21CQUFDO29CQUNSLFlBQVksRUFBRSxDQUFDLDBCQUEwQixFQUFFLDhCQUE4QixDQUFDO29CQUMxRSxPQUFPLEVBQUU7d0JBQ1AsWUFBWTt3QkFDWixXQUFXO3dCQUNYLG1CQUFtQjt3QkFDbkIscUJBQXFCO3FCQUN0QjtvQkFDRCxPQUFPLEVBQUUsQ0FBQywwQkFBMEIsRUFBRSw4QkFBOEIsQ0FBQztpQkFDdEUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCc0Ryb3Bkb3duTW9kdWxlIH0gZnJvbSAnbmd4LWJvb3RzdHJhcC9kcm9wZG93bic7XG5cbmltcG9ydCB7IE1vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOZ3hMaWJwaG9uZW51bWJlckNvbXBvbmVudCB9IGZyb20gJy4vbmd4LWxpYnBob25lbnVtYmVyLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBOYXRpdmVFbGVtZW50SW5qZWN0b3JEaXJlY3RpdmUgfSBmcm9tICcuL2RpcmVjdGl2ZXMvbmF0aXZlLWVsZW1lbnQtaW5qZWN0b3IuZGlyZWN0aXZlJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBGb3Jtc01vZHVsZSwgUmVhY3RpdmVGb3Jtc01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcblxuZXhwb3J0IGNvbnN0IGRyb3Bkb3duTW9kdWxlRm9yUm9vdDogTW9kdWxlV2l0aFByb3ZpZGVyczxCc0Ryb3Bkb3duTW9kdWxlPiA9XG4gIEJzRHJvcGRvd25Nb2R1bGUuZm9yUm9vdCgpO1xuXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtOZ3hMaWJwaG9uZW51bWJlckNvbXBvbmVudCwgTmF0aXZlRWxlbWVudEluamVjdG9yRGlyZWN0aXZlXSxcbiAgaW1wb3J0czogW1xuICAgIENvbW1vbk1vZHVsZSxcbiAgICBGb3Jtc01vZHVsZSxcbiAgICBSZWFjdGl2ZUZvcm1zTW9kdWxlLFxuICAgIGRyb3Bkb3duTW9kdWxlRm9yUm9vdCxcbiAgXSxcbiAgZXhwb3J0czogW05neExpYnBob25lbnVtYmVyQ29tcG9uZW50LCBOYXRpdmVFbGVtZW50SW5qZWN0b3JEaXJlY3RpdmVdLFxufSlcbmV4cG9ydCBjbGFzcyBOZ3hMaWJwaG9uZW51bWJlck1vZHVsZSB7fVxuIl19