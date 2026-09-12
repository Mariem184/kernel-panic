import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MarkdownPipe]
    });
    pipe = TestBed.inject(MarkdownPipe);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  it('should render bold text properly', () => {
    const result = pipe.transform('**bold text**') as any;
    expect(result.changingThisBreaksApplicationSecurity).toContain('<strong>bold text</strong>');
  });

  it('should render headings properly', () => {
    const result = pipe.transform('### Services Heading') as any;
    expect(result.changingThisBreaksApplicationSecurity).toContain('<h3>Services Heading</h3>');
  });

  it('should render markdown tables properly', () => {
    const markdownTable = '| Col 1 | Col 2 |\n|---|---|\n| Val A | Val B |';
    const result = pipe.transform(markdownTable) as any;
    const html = result.changingThisBreaksApplicationSecurity;
    expect(html).toContain('<table>');
    expect(html).toContain('<th>Col 1</th>');
    expect(html).toContain('<td>Val A</td>');
  });

  it('should convert escaped and literal br tags', () => {
    const textWithBrs = 'Line 1\\<br>Line 2<br>Line 3\\\\<br>Line 4';
    const result = pipe.transform(textWithBrs) as any;
    const html = result.changingThisBreaksApplicationSecurity;
    expect(html).not.toContain('&lt;br&gt;');
    expect(html).not.toContain('\\<br>');
    expect(html).toContain('<br>');
  });
});
