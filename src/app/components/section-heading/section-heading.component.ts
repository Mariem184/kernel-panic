import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** How the highlighted word/phrase of the title is emphasised. */
export type HeadingAccent =
  | 'curve'    // hand-drawn curved underline   (the reference style — "Projects")
  | 'line'     // short straight underline      (clean, confident)
  | 'bracket'  // technical [ brackets ]        (precise, structured)
  | 'mark'     // editorial highlighter band    (news / editorial feel)
  | 'none';    // blue colour only

/** Small marker shown before the eyebrow label. */
export type EyebrowMarker = 'dot' | 'code' | 'none';

/**
 * Shared heading for every page section:
 *
 *   ● OUR WORK                      ← eyebrow (small, blue, uppercase pill)
 *   Projects We Are Proud Of        ← <h2>, one phrase highlighted in blue
 *   ~~~~~~~~                          with an accent (curve / line / …)
 *   Optional subtitle text.         ← <p>
 *
 * The highlight is found inside the title by plain text match, so it works
 * for both languages: pass the translated title and the translated phrase.
 * If the phrase isn't found the title simply renders without a highlight.
 *
 * Anything placed between the tags (<app-section-heading>…</app-section-heading>)
 * is projected under the subtitle.
 */
@Component({
  selector: 'app-section-heading',
  standalone: true,
  templateUrl: './section-heading.component.html',
  styleUrl: './section-heading.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.sh-left]': "align() === 'left'",
    '[class.sh-large]': "size() === 'large'",
  },
})
export class SectionHeadingComponent {
  eyebrow = input<string>('');
  title = input.required<string>();
  highlight = input<string>('');
  subtitle = input<string>('');
  align = input<'center' | 'left'>('center');
  accent = input<HeadingAccent>('line');
  marker = input<EyebrowMarker>('dot');
  size = input<'default' | 'large'>('default');
  /** id for the <h2>, e.g. to point aria-labelledby of the section at it. */
  headingId = input<string | null>(null);

  /** Title split around the highlighted phrase. */
  parts = computed(() => {
    const title = (this.title() ?? '').trim();
    const hl = (this.highlight() ?? '').trim();
    const i = hl ? title.indexOf(hl) : -1;
    if (i < 0) return { before: title, hl: '', after: '' };
    return { before: title.slice(0, i), hl, after: title.slice(i + hl.length) };
  });
}
