import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { PendoService, PENDO_CONFIG } from './pendo.service';

describe('PendoService', () => {
  let service: PendoService;
  
  // Mock Pendo instance
  const mockPendo = {
    initialize: jasmine.createSpy('initialize'),
    updateOptions: jasmine.createSpy('updateOptions'),
    identify: jasmine.createSpy('identify'),
    track: jasmine.createSpy('track'),
    disableCookies: jasmine.createSpy('disableCookies'),
    isReady: jasmine.createSpy('isReady').and.returnValue(true)
  };

  const mockConfig = {
    apiKey: 'test-api-key',
    autoLoad: false
  };

  beforeEach(() => {
    // Define mock for window.pendo
    Object.defineProperty(window, 'pendo', {
      value: mockPendo,
      writable: true
    });
    
    TestBed.configureTestingModule({
      providers: [
        PendoService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: PENDO_CONFIG, useValue: mockConfig }
      ]
    });
    
    service = TestBed.inject(PendoService);
  });

  afterEach(() => {
    // Reset all spies
    mockPendo.initialize.calls.reset();
    mockPendo.updateOptions.calls.reset();
    mockPendo.identify.calls.reset();
    mockPendo.track.calls.reset();
    mockPendo.disableCookies.calls.reset();
    mockPendo.isReady.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {
    it('should initialize Pendo with the provided config', async () => {
      await service.initialize();
      
      expect(mockPendo.initialize).toHaveBeenCalledWith({
        apiKey: mockConfig.apiKey,
        visitor: undefined,
        account: undefined
      });
    });
    
    it('should initialize with visitor and account data when provided', async () => {
      const visitorData = { id: 'visitor-1', name: 'Test User' };
      const accountData = { id: 'account-1', name: 'Test Account' };
      
      await service.initialize({
        apiKey: 'new-api-key',
        visitor: visitorData,
        account: accountData
      });
      
      expect(mockPendo.initialize).toHaveBeenCalledWith({
        apiKey: 'new-api-key',
        visitor: visitorData,
        account: accountData
      });
    });
  });

  describe('updateVisitor', () => {
    it('should call updateOptions with visitor data', async () => {
      await service.initialize();
      
      const visitorData = { id: 'visitor-1', name: 'Test User' };
      service.updateVisitor(visitorData);
      
      expect(mockPendo.updateOptions).toHaveBeenCalledWith({
        visitor: visitorData
      });
    });
    
    it('should not call updateOptions if not initialized', () => {
      const visitorData = { id: 'visitor-1', name: 'Test User' };
      service.updateVisitor(visitorData);
      
      expect(mockPendo.updateOptions).not.toHaveBeenCalled();
    });
  });

  describe('updateAccount', () => {
    it('should call updateOptions with account data', async () => {
      await service.initialize();
      
      const accountData = { id: 'account-1', name: 'Test Account' };
      service.updateAccount(accountData);
      
      expect(mockPendo.updateOptions).toHaveBeenCalledWith({
        account: accountData
      });
    });
    
    it('should not call updateOptions if not initialized', () => {
      const accountData = { id: 'account-1', name: 'Test Account' };
      service.updateAccount(accountData);
      
      expect(mockPendo.updateOptions).not.toHaveBeenCalled();
    });
  });

  describe('track', () => {
    it('should call track with event name and metadata', async () => {
      await service.initialize();
      
      const eventName = 'test-event';
      const metadata = { property: 'value' };
      service.track(eventName, metadata);
      
      expect(mockPendo.track).toHaveBeenCalledWith(eventName, metadata);
    });
    
    it('should not call track if not initialized', () => {
      const eventName = 'test-event';
      service.track(eventName);
      
      expect(mockPendo.track).not.toHaveBeenCalled();
    });
  });

  describe('identify', () => {
    it('should call identify with visitor and account data', async () => {
      await service.initialize();
      
      const visitorId = 'visitor-1';
      const accountId = 'account-1';
      const visitorData = { name: 'Test User' };
      const accountData = { name: 'Test Account' };
      
      service.identify(visitorId, accountId, visitorData, accountData);
      
      expect(mockPendo.identify).toHaveBeenCalledWith({
        visitor: { id: visitorId, ...visitorData },
        account: { id: accountId, ...accountData }
      });
    });
    
    it('should call identify with minimal data', async () => {
      await service.initialize();
      
      const visitorId = 'visitor-1';
      const accountId = 'account-1';
      
      service.identify(visitorId, accountId);
      
      expect(mockPendo.identify).toHaveBeenCalledWith({
        visitor: { id: visitorId },
        account: { id: accountId }
      });
    });
    
    it('should not call identify if not initialized', () => {
      const visitorId = 'visitor-1';
      const accountId = 'account-1';
      
      service.identify(visitorId, accountId);
      
      expect(mockPendo.identify).not.toHaveBeenCalled();
    });
  });

  describe('disable', () => {
    it('should call disableCookies', async () => {
      await service.initialize();
      
      service.disable();
      
      expect(mockPendo.disableCookies).toHaveBeenCalled();
    });
    
    it('should not call disableCookies if not initialized', () => {
      service.disable();
      
      expect(mockPendo.disableCookies).not.toHaveBeenCalled();
    });
  });

  describe('isReady', () => {
    it('should return true when Pendo is ready', async () => {
      await service.initialize();
      
      expect(service.isReady()).toBe(true);
    });
    
    it('should return false when not initialized', () => {
      expect(service.isReady()).toBe(false);
    });
  });

  // Test for SSR (server-side rendering) environment
  describe('in SSR environment', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          PendoService,
          { provide: PLATFORM_ID, useValue: 'server' }, // Simulate server-side rendering
          { provide: PENDO_CONFIG, useValue: mockConfig }
        ]
      });
      
      service = TestBed.inject(PendoService);
    });
    
    it('should not attempt to initialize Pendo', async () => {
      await service.initialize();
      
      expect(mockPendo.initialize).not.toHaveBeenCalled();
    });
    
    it('should not call any Pendo methods', () => {
      service.track('event');
      service.identify('visitor', 'account');
      service.updateVisitor({ id: 'visitor' });
      service.updateAccount({ id: 'account' });
      service.disable();
      
      expect(mockPendo.track).not.toHaveBeenCalled();
      expect(mockPendo.identify).not.toHaveBeenCalled();
      expect(mockPendo.updateOptions).not.toHaveBeenCalled();
      expect(mockPendo.disableCookies).not.toHaveBeenCalled();
    });
    
    it('should return false for isReady', () => {
      expect(service.isReady()).toBe(false);
    });
  });
});