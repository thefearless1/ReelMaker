/**
 * Top 5 Mobile Video Editors 2026
 * Content sourced from pickedfive.com/tops/mobile-video-editors.html
 */

const AppReviewTemplate = require('./src/templates/AppReviewTemplate');

const template = new AppReviewTemplate({
  title:         'Mobile Video Editors',
  subtitle:      'Ranked & Reviewed 2026',
  brand:         '@pickedfive',
  itemDuration:  7,
  introDuration: 3.5,
  outroDuration: 4,

  items: [
    {
      rank: 1,
      name: 'Filmora',
      screenshot: '/screenshots/filmora.jpeg',
      award: 'Best Overall',
      quote: 'AI auto-captions, background removal, and smart clip generation',
      features: [
        'Over 2.9M creative assets via Filmstock',
        '4K export with auto-reframe for social formats',
        'Desktop & mobile sync — edit anywhere',
      ],
      price: 'Free (watermarked)  ·  from $59.99 / year',
      colors: {
        primary:   '#C41F7A',
        secondary: '#FF6B35',
        accent:    '#FFD700',
      },
    },
    {
      rank: 2,
      name: 'InVideo AI',
      screenshot: '/screenshots/invideoAi.jpeg',
      award: 'Best AI Generation',
      quote: 'Text-to-video with script, voiceover, and footage handled automatically',
      features: [
        'Bundles OpenAI Sora 2 & Google VEO 3.1 models',
        'Voice cloning from a 30-second sample',
        '16M+ premium stock media assets included',
      ],
      price: 'Free  ·  Plus from $25 / month',
      colors: {
        primary:   '#1a2a8e',
        secondary: '#0a6fff',
        accent:    '#00CFFF',
      },
    },
    {
      rank: 3,
      name: 'FlexClip',
      screenshot: '/screenshots/flexclip.jpeg',
      award: 'Best Browser-Based',
      quote: 'Browser-based with no download required',
      features: [
        'AI text-to-video & image-to-video generation',
        '6,000+ templates and 4M+ stock assets',
        'Auto subtitles, background removal & TTS',
      ],
      price: 'Free  ·  Plus from $11.99 / month',
      colors: {
        primary:   '#027CA8',
        secondary: '#00C9A7',
        accent:    '#7FFFCF',
      },
    },
    {
      rank: 4,
      name: 'Movavi',
      screenshot: '/screenshots/movavi.jpeg',
      award: 'Best for Beginners',
      quote: 'Clean drag-and-drop interface with no intimidating learning curve',
      features: [
        'AI background removal — no green screen needed',
        'One-time lifetime license option available',
        '180+ format support with preset exports',
      ],
      price: 'From $69.95 one-time  ·  $14.95 / month',
      colors: {
        primary:   '#1B4F9B',
        secondary: '#2C87D1',
        accent:    '#62B8FF',
      },
    },
    {
      rank: 5,
      name: 'Descript',
      screenshot: '/screenshots/descript.jpeg',
      award: 'Most Unique',
      quote: 'Edit video by deleting words from the transcript',
      features: [
        'One-click filler-word removal & AI voice cloning',
        'Integrated transcription & Studio Sound audio',
        'Screen recording built right in',
      ],
      price: 'Free  ·  Hobbyist from $24 / month',
      colors: {
        primary:   '#3B0764',
        secondary: '#7B2D8B',
        accent:    '#D946EF',
      },
    },
  ],
});

module.exports = {
  rendererOptions: template.getRendererOptions(),
  scenes:          template.getScenes(),
  totalDuration:   template.getTotalDuration(),
};
