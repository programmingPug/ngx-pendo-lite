# ngx-pendo-lite

A lightweight Angular wrapper for Pendo.io analytics integration.

## Installation

```bash
npm install ngx-pendo-lite --save
```

## Setup

### 1. Import the Module

Import the `PendoModule` in your `AppModule` and configure it with your Pendo API key:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { PendoModule } from 'ngx-pendo-lite';

@NgModule({
  declarations: [
    AppComponent
  ],
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

### 2. Identify Users (after login)

After a user logs in to your application, identify them to Pendo:

```typescript
import { Component } from '@angular/core';
import { PendoService } from 'ngx-pendo-lite';

@Component({
  selector: 'app-login',
  template: `...`
})
export class LoginComponent {
  constructor(private pendoService: PendoService) {}

  onLoginSuccess(user: any): void {
    this.pendoService.identify(
      user.id,
      user.organizationId,
      {
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      {
        name: user.organizationName,
        tier: user.subscriptionTier
      }
    );
  }
}
```

### 3. Track Custom Events

Track user interactions and custom events:

```typescript
import { Component } from '@angular/core';
import { PendoService } from 'ngx-pendo-lite';

@Component({
  selector: 'app-feature',
  template: `...`
})
export class FeatureComponent {
  constructor(private pendoService: PendoService) {}

  onFeatureUsed(): void {
    this.pendoService.track('feature_used', {
      featureName: 'example-feature',
      timestamp: new Date().toISOString()
    });
  }
}
```

## API Reference

### PendoService

#### Methods

- `initialize(config: PendoConfig): void` - Initialize the Pendo service
- `identify(visitorId: string, accountId: string, visitorData?: Record<string, any>, accountData?: Record<string, any>): void` - Identify a user and account
- `track(eventName: string, metadata?: Record<string, any>): void` - Track a custom event
- `updateVisitor(visitorData: Record<string, any>): void` - Update visitor information
- `updateAccount(accountData: Record<string, any>): void` - Update account information
- `disable(): void` - Disable Pendo tracking

#### Interfaces

```typescript
interface PendoConfig {
  apiKey: string;
  visitor?: {
    id: string;
    [key: string]: any;
  };
  account?: {
    id: string;
    [key: string]: any;
  };
}
```

## License

MIT