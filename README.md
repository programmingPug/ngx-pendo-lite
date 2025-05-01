# ngx-pendo-lite-workspace

This workspace contains the Angular library for integrating Pendo.io analytics into Angular applications.

## Development

### Library

The main library code is in the `projects/ngx-pendo-lite` directory.

### Build

Run `npm run build:lib` to build the library. The build artifacts will be stored in the `dist/ngx-pendo-lite` directory.

### Running unit tests

Run `npm run test:lib` to execute the unit tests for the library via [Karma](https://karma-runner.github.io).

### Publishing

After building the library, you can publish it to npm with:

```bash
npm run publish:lib
```

Or do a dry run first:

```bash
npm run publish:lib:dry
```

## Versioning

The library follows [Semantic Versioning](https://semver.org/).

To bump the version:

```bash
# For patch releases (bug fixes)
npm run version:patch

# For minor releases (new features, backward compatible)
npm run version:minor

# For major releases (breaking changes)
npm run version:major
```

## Features

- Easy integration with Angular's dependency injection
- Type-safe wrapper for all Pendo functionality
- Server-side rendering (SSR) support
- Comprehensive testing

## Library Usage

```typescript
// Import in your app module
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PendoModule } from 'ngx-pendo-lite';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    PendoModule.forRoot({
      apiKey: 'YOUR_PENDO_API_KEY'
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

For more details, see the library's own [README](./projects/ngx-pendo-lite/README.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.