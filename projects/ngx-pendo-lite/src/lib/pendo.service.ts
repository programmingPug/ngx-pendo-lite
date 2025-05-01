import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Interface for visitor data
 */
export interface PendoVisitor {
  /** Required unique visitor identifier */
  id: string;
  /** Any additional visitor properties */
  [key: string]: any;
}

/**
 * Interface for account data
 */
export interface PendoAccount {
  /** Required unique account identifier */
  id: string;
  /** Any additional account properties */
  [key: string]: any;
}

/**
 * Pendo initialization configuration options
 */
export interface PendoConfig {
  /** Your Pendo API key */
  apiKey: string;
  /** Optional visitor data */
  visitor?: PendoVisitor;
  /** Optional account data */
  account?: PendoAccount;
  /** Optional Pendo script URL. If not provided, uses the default URL with apiKey */
  scriptUrl?: string;
  /** Whether to load Pendo script automatically. Default is true */
  autoLoad?: boolean;
  /** Whether to disable cookies. Default is false */
  disableCookies?: boolean;
}

/**
 * Type definition for the Pendo global object
 */
export interface PendoInstance {
  initialize: (options: {
    apiKey: string;
    visitor?: PendoVisitor;
    account?: PendoAccount;
  }) => void;
  updateOptions: (options: {
    visitor?: PendoVisitor;
    account?: PendoAccount;
  }) => void;
  identify: (visitor: { visitor: PendoVisitor; account: PendoAccount }) => void;
  track: (eventName: string, metadata?: Record<string, any>) => void;
  disableCookies: () => void;
  isReady: () => boolean;
}

/**
 * Token for providing Pendo configuration
 */
export const PENDO_CONFIG = 'PENDO_CONFIG';

/**
 * Angular service wrapper for Pendo.io analytics
 */
@Injectable({
  providedIn: 'root',
})
export class PendoService {
  /**
   * Flag indicating if Pendo has been initialized
   */
  private isInitialized = false;

  /**
   * Reference to the Pendo instance
   */
  private pendoInstance?: PendoInstance;

  /**
   * Configuration options
   */
  private config: PendoConfig;

  /**
   * Script loading promise to prevent multiple script loads
   */
  private loadPromise: Promise<void> | null = null;

  /**
   * @param platformId Angular platform ID for SSR detection
   * @param config Optional injected Pendo configuration
   */
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Optional() @Inject(PENDO_CONFIG) config?: PendoConfig
  ) {
    this.config = config || { apiKey: '' };

    // Auto-load the script if running in browser and autoLoad is not explicitly disabled
    if (
      isPlatformBrowser(this.platformId) &&
      config?.apiKey &&
      (config.autoLoad !== false)
    ) {
      this.loadPendoScript();
    }
  }

  /**
   * Loads the Pendo script asynchronously
   * @returns Promise that resolves when the script is loaded
   */
  public loadPendoScript(): Promise<void> {
    // Don't attempt to load in non-browser environments
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }

    // Return existing promise if already loading
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise<void>((resolve, reject) => {
      // Check if Pendo is already loaded
      if (typeof window !== 'undefined' && (window as any).pendo) {
        this.pendoInstance = (window as any).pendo;
        resolve();
        return;
      }

      try {
        // Create a script element to load Pendo
        const script = document.createElement('script');
        script.async = true;
        script.defer = true;
        
        // Use custom URL if provided, otherwise construct from API key
        script.src = this.config.scriptUrl || 
          `https://cdn.pendo.io/agent/static/${this.config.apiKey}/pendo.js`;
        
        script.onload = () => {
          // Make Pendo instance accessible
          if (typeof window !== 'undefined') {
            this.pendoInstance = (window as any).pendo;
            resolve();
          } else {
            reject(new Error('Window is not defined after script load'));
          }
        };
        
        script.onerror = () => {
          reject(new Error('Failed to load Pendo script'));
        };
        
        // Append script to the document head
        document.head.appendChild(script);
      } catch (error) {
        reject(error);
      }
    });

    return this.loadPromise;
  }

  /**
   * Initialize Pendo with configuration
   * @param config Pendo configuration options
   * @returns Promise that resolves when initialization is complete
   */
  public async initialize(config?: PendoConfig): Promise<void> {
    // Don't attempt to initialize in non-browser environments
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Merge provided config with existing config
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Validate API key
    if (!this.config.apiKey) {
      console.error('Pendo API key is required');
      return;
    }

    try {
      // Ensure script is loaded
      await this.loadPendoScript();

      // Check if Pendo instance is available
      if (!this.pendoInstance) {
        throw new Error('Pendo instance not available');
      }

      // Initialize Pendo
      this.pendoInstance.initialize({
        apiKey: this.config.apiKey,
        visitor: this.config.visitor,
        account: this.config.account,
      });

      // Set initialized flag
      this.isInitialized = true;

      // Disable cookies if configured
      if (this.config.disableCookies) {
        this.disable();
      }
    } catch (error) {
      console.error('Failed to initialize Pendo:', error);
    }
  }

  /**
   * Updates visitor information
   * @param visitorData Visitor data to update
   */
  public updateVisitor(visitorData: PendoVisitor): void {
    if (!this.isInitialized || !isPlatformBrowser(this.platformId) || !this.pendoInstance) {
      return;
    }
    
    this.pendoInstance.updateOptions({
      visitor: visitorData
    });
  }

  /**
   * Updates account information
   * @param accountData Account data to update
   */
  public updateAccount(accountData: PendoAccount): void {
    if (!this.isInitialized || !isPlatformBrowser(this.platformId) || !this.pendoInstance) {
      return;
    }
    
    this.pendoInstance.updateOptions({
      account: accountData
    });
  }

  /**
   * Track a custom event in Pendo
   * @param eventName Name of the event to track
   * @param metadata Optional metadata for the event
   */
  public track(eventName: string, metadata?: Record<string, any>): void {
    if (!this.isInitialized || !isPlatformBrowser(this.platformId) || !this.pendoInstance) {
      return;
    }
    
    this.pendoInstance.track(eventName, metadata);
  }

  /**
   * Identify user and account (or update existing)
   * @param visitorId Visitor identifier
   * @param accountId Account identifier
   * @param visitorData Additional visitor metadata
   * @param accountData Additional account metadata
   */
  public identify(
    visitorId: string,
    accountId: string,
    visitorData?: Record<string, any>,
    accountData?: Record<string, any>
  ): void {
    if (!this.isInitialized || !isPlatformBrowser(this.platformId) || !this.pendoInstance) {
      return;
    }
    
    const visitor: PendoVisitor = {
      id: visitorId,
      ...(visitorData || {})
    };
    
    const account: PendoAccount = {
      id: accountId,
      ...(accountData || {})
    };
    
    this.pendoInstance.identify({
      visitor,
      account
    });
  }

  /**
   * Disable Pendo tracking by disabling cookies
   */
  public disable(): void {
    if (!this.isInitialized || !isPlatformBrowser(this.platformId) || !this.pendoInstance) {
      return;
    }
    
    this.pendoInstance.disableCookies();
  }

  /**
   * Check if Pendo is ready
   * @returns boolean indicating if Pendo is ready
   */
  public isReady(): boolean {
    if (!isPlatformBrowser(this.platformId) || !this.pendoInstance) {
      return false;
    }
    
    return typeof this.pendoInstance.isReady === 'function' 
      ? this.pendoInstance.isReady() 
      : this.isInitialized;
  }
}