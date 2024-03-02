import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { ModuleWithProviders, NgModule } from '@angular/core';
import { NgxLibphonenumberComponent } from './ngx-libphonenumber.component';
import { NativeElementInjectorDirective } from './directives/native-element-injector.directive';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

export const dropdownModuleForRoot: ModuleWithProviders<BsDropdownModule> =
  BsDropdownModule.forRoot();

@NgModule({
  declarations: [NgxLibphonenumberComponent, NativeElementInjectorDirective],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    dropdownModuleForRoot,
  ],
  exports: [NgxLibphonenumberComponent, NativeElementInjectorDirective],
})
export class NgxLibphonenumberModule {}
