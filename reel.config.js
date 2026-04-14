const HowToTemplate = require('./src/templates/HowToTemplate');

const template = new HowToTemplate({
  hookDuration:    3,
  problemDuration: 3.5,
  stepDuration:    4.5,
  resultDuration:  4,
  outroDuration:   3,

  hook: {
    badge:    'AI AGENT',
    title:    'Automate Document Intelligence',
    subtitle: 'Extract data from 600-page docs & match invoices against contracts — in seconds',
    brand:    '@YourChannel',
  },

  problems: [
    {
      label:       'THE CHALLENGE',
      title:       '600-Page Contracts, Zero Room for Error',
      description: 'Manual data extraction takes hours per document and introduces costly mistakes at scale',
      stat:        '⏱  3–5 hours per document, manually',
    },
    {
      label:       'THE CHALLENGE',
      title:       '1 Invoice vs 10 Different Contracts',
      description: 'Payment terms, pricing clauses, and SLAs vary across every agreement — impossible to cross-check by hand',
      stat:        '🔍  10 contracts × hundreds of clauses',
    },
  ],

  steps: [
    {
      number:      1,
      title:       'Connect Your Document Sources',
      description: 'Ingest PDFs, scanned documents, and emails directly into TotalAgility\'s intelligent capture pipeline',
      image:       'https://www.flexmind.co/wp-content/uploads/2020/12/Kofax-agility.png',
      tip:         'Supports PDF, TIFF, Word, email attachments and more',
    },
    {
      number:      2,
      title:       'Configure AI Extraction Rules',
      description: 'Use pre-built AI models to identify fields, tables, amounts, and key contract clauses automatically',
      image:       'https://blogs.genustechnologies.com/hs-fs/hubfs/Blog%20Images/02_TA8%20Cloud%20Docs.webp?width=685&height=498&name=02_TA8%20Cloud%20Docs.webp',
      tip:         'No training data needed — models work out of the box',
    },
    {
      number:      3,
      title:       'Build the Invoice Matching Agent',
      description: 'Define matching rules and tolerance thresholds — the AI agent cross-checks each invoice against all relevant contracts',
      image:       'https://cdn.prod.website-files.com/6257145dcba369226267687e/62a1c24c9a8eedd742ca8e6c_kofax5.jpg',
      tip:         'Flag discrepancies automatically for human review',
    },
  ],

  results: [
    { value: '< 60s',  label: 'to process a 600-page document' },
    { value: '99.8%',  label: 'extraction accuracy' },
    { value: '10×',    label: 'faster than manual review' },
  ],

  outro: {
    title: 'START BUILDING TODAY',
    cta:   'Like & Subscribe for more AI tutorials!',
    brand: '@YourChannel',
  },
});

module.exports = {
  rendererOptions: template.getRendererOptions(),
  scenes:          template.getScenes(),
  totalDuration:   template.getTotalDuration(),
};
