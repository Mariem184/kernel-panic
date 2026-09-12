import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  constructor() {
    marked.setOptions({
      gfm: true,
      breaks: true
    });
  }

  transform(value: string | undefined | null): SafeHtml {
    if (!value) return '';

    // 1. Strip literal bullet characters, markdown list syntax (- , * , + , 1. , etc.)
    let cleaned = value
      .replace(/[\u2022\u25E6\u25FE\u25CF\u25C6\u25A0\u2043\u2023]/g, '')
      .replace(/^(\s*)([-*+]|[\d\u0660-\u0669]+[\.\)])\s+/gm, '$1')
      .replace(/\\+<br\s*\/?>/gi, '<br>')
      .replace(/\\?&lt;br\s*\/?&gt;/gi, '<br>');

    // 2. Parse markdown to HTML
    let rawHtml = marked.parse(cleaned) as string;

    // 3. Guarantee NO ul/ol/li bullet lists exist by replacing list elements with clean paragraphs
    rawHtml = rawHtml
      .replace(/<\/?(ul|ol)[^>]*>/gi, '')
      .replace(/<li[^>]*>/gi, '<p>')
      .replace(/<\/li>/gi, '</p>');

    // Bypass Angular security sanitizer to safely allow tables, headers, and formatted tags
    return this.sanitizer.bypassSecurityTrustHtml(rawHtml);
  }
}
