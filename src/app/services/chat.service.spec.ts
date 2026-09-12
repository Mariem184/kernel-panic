import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  let service: ChatService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ChatService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ChatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should post message to /api/chat and return response', () => {
    const mockResponse = {
      answer: 'Kernel Panic provides penetration testing and cybersecurity services.',
      sources: ['Services']
    };

    service.sendMessage('What cybersecurity services do you provide?').subscribe((res) => {
      expect(res.answer).toBe(mockResponse.answer);
      expect(res.sources).toEqual(mockResponse.sources);
    });

    const req = httpMock.expectOne('/api/chat');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      message: 'What cybersecurity services do you provide?',
      history: []
    });

    req.flush(mockResponse);
  });
});
