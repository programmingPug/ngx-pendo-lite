import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PendoConfig, PendoService, PENDO_CONFIG } from './pendo.service';

/**
 * Angular module for Pendo.io integration
 */
@NgModule({
  imports: [
    CommonModule
  ],
  providers: []
})
export class PendoModule {
  /**
   * Use this method in your root module to provide and configure the PendoService
   * @param config Configuration for Pendo initialization
   * @returns ModuleWithProviders configuration for Angular
   */
  static forRoot(config: PendoConfig): ModuleWithProviders<PendoModule> {
    return {
      ngModule: PendoModule,
      providers: [
        { provide: PENDO_CONFIG, useValue: config },
        PendoService
      ]
    };
  }

  /**
   * Use this method to include the module in feature modules without providing
   * the service again (it should only be provided once in the app)
   * @returns ModuleWithProviders configuration for Angular feature modules
   */
  static forChild(): ModuleWithProviders<PendoModule> {
    return {
      ngModule: PendoModule,
      providers: []
    };
  }
}