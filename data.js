function makeDeck(id, title, description, source, color, items) {
  return {
    id,
    title,
    description,
    source,
    color,
    cards: items.map((item, index) => ({
      id: `${id}-${index + 1}`,
      front: item[0],
      answer: item[1],
      choices: item[2],
      note: item[3] || '',
      source: item[4] || source,
      dueAt: null,
      intervalDays: 0,
      reps: 0
    }))
  };
}

const STUDY_DECKS = [
  makeDeck(
    'interactive-materials',
    'Interactive web materials',
    'Why interactivity matters, common formats, and the tools used in this lesson.',
    'Handout 1 · Interactive Web-Based Materials',
    'green',
    [
      ['What benefit do interactive web-based materials offer learners?', 'They engage users and can make information easier to retain.', ['They remove the need to organize information.', 'They make every activity work without a browser.', 'They replace visuals with longer blocks of text.'], 'Engagement can help learners retain information.', 'Handout 1 · p. 1'],
      ['Which technologies are named as ways to add interactivity to digital materials?', 'Action scripts, Java, or HTML5.', ['CSS grids, spreadsheets, and email.', 'PDF forms, database tables, or print layouts.', 'Audio cables, video codecs, or image filters.'], 'The handout names action scripts, Java, and HTML5.', 'Handout 1 · p. 1'],
      ['What combination is described for creating varied interactive web content?', 'Digital graphics, animation, and action script.', ['Printed illustrations, captions, and page numbers.', 'Sound effects, spreadsheets, and text-only pages.', 'Video clips, paper forms, and static charts.'], 'The lesson pairs graphics and animation with action script.', 'Handout 1 · p. 1'],
      ['Which is an example of interactive content used in marketing?', 'Web banners for online ads.', ['Printed chapter dividers.', 'Offline spreadsheet templates.', 'Static page footers.'], 'The handout lists web banners as a common marketing format.', 'Handout 1 · p. 1'],
      ['What kind of web-based games does the handout mention creating?', 'HTML5 games.', ['Games that only run as printed board games.', 'Games that require a television console.', 'Games made only from slide transitions.'], 'The lesson specifically mentions developing web-based games for HTML5.', 'Handout 1 · p. 1'],
      ['Why can interactive educational or presentation content sustain an audience?', 'It keeps the intended audience engaged.', ['It removes all visuals from the presentation.', 'It limits the audience to one short visit.', 'It prevents the audience from interacting.'], 'Engaging content can help people stay with the material.', 'Handout 1 · p. 2'],
      ['What can audience engagement help learners do with information?', 'Retain information they need to absorb.', ['Skip every explanation and example.', 'Avoid reviewing any of the material.', 'Convert all information into animation.'], 'The handout links engagement with retaining information.', 'Handout 1 · p. 2'],
      ['How can a traditional infographic become more dynamic?', 'Add moving and interactive pictures.', ['Remove its data and labels.', 'Convert it into a plain document.', 'Use only a fixed border and title.'], 'Motion and interaction can make an infographic more dynamic.', 'Handout 1 · p. 2'],
      ['What should be prepared before adding animation and other interactivity?', 'The visual elements of the project.', ['The final website analytics report.', 'The printed version of the project.', 'The exported animation file.'], 'The lesson puts visual setup before adding animation and interactivity.', 'Handout 1 · p. 3'],
      ['Which tools will the module use to explore interactive web content?', 'Wick Editor and Figma.', ['Photoshop and a spreadsheet only.', 'A browser and a printer only.', 'A video player and a word processor.'], 'The module introduces Wick Editor and Figma.', 'Handout 1 · p. 3'],
      ['What qualities does the handout associate with engaging learning content?', 'Interactive, visually appealing, and engaging.', ['Long, static, and difficult to navigate.', 'Unlabeled, text-only, and disconnected.', 'Printed, silent, and without visuals.'], 'The handout highlights interactivity and visual appeal as ways to sustain attention.', 'Handout 1 · p. 2']
    ]
  ),
  makeDeck(
    'web-content',
    'Web content & infographics',
    'Banner ads, interactive infographics, and a practical creation workflow.',
    'Handout 2 · How to Make Interactive Web Content',
    'peach',
    [
      ['What is a web banner ad?', 'A rectangular graphic display placed on websites, mobile, or social media.', ['A full-length video shown only in a cinema.', 'A printed poster kept inside a textbook.', 'A spreadsheet used to calculate ad budgets.'], 'The handout describes a banner as a rectangular graphic display.', 'Handout 2 · p. 1'],
      ['Where might a web banner appear on a website?', 'At the top, bottom, or sides of a page.', ['Only inside a printed footer.', 'Only after a user downloads an app.', 'Only on a separate checkout screen.'], 'The handout lists the top, bottom, and sides of websites.', 'Handout 2 · p. 1'],
      ['What is the main purpose of a web banner ad?', 'Promote a brand, attract visitors, and encourage them to become users or customers.', ['Teach visitors how to edit website code.', 'Replace every other kind of marketing.', 'Store private account information.'], 'The banner is intended to promote a brand and encourage a response.', 'Handout 2 · p. 1'],
      ['What should an effective web banner include?', 'A call to action.', ['A long academic bibliography.', 'A hidden settings menu.', 'A complete copy of the website.'], 'A clear call to action gives the banner a next step.', 'Handout 2 · p. 1'],
      ['Which forms can web banner ads take?', 'Static graphics or animated and interactive ads.', ['Audio-only clips or printed essays.', 'Database tables or email folders.', 'Maps or books only.'], 'The handout describes both plain graphics and animated or interactive ads.', 'Handout 2 · p. 1'],
      ['Which size is shown as one of the high-end mobile banner examples?', '300 × 200 px.', ['300 × 600 px.', '728 × 90 px.', '468 × 60 px.'], 'The mobile examples include 300 × 200, 300 × 50, 300 × 100, 250 × 250, and 200 × 200 px.', 'Handout 2 · p. 2'],
      ['Which size is shown as a computer banner example?', '970 × 90 px.', ['300 × 50 px.', '300 × 100 px.', '300 × 200 px.'], 'The computer examples include several sizes, such as 728 × 90, 970 × 90, 300 × 600, and 160 × 600 px.', 'Handout 2 · p. 2'],
      ['Which list contains all the high-end mobile banner sizes shown in the handout?', '300 × 200, 300 × 50, 300 × 100, 250 × 250, and 200 × 200 px.', ['300 × 250, 336 × 280, 728 × 90, 970 × 90, and 468 × 60 px.', '728 × 90, 970 × 90, 468 × 60, 300 × 600, and 160 × 600 px.', '300 × 250, 300 × 100, 728 × 90, 250 × 250, and 200 × 200 px.'], 'The figure groups five sizes under examples for high-end mobile devices.', 'Handout 2 · p. 2'],
      ['Which list contains all the computer banner sizes shown in the handout?', '300 × 250, 336 × 280, 728 × 90, 970 × 90, 468 × 60, 300 × 600, 160 × 600, 250 × 250, and 200 × 200 px.', ['300 × 200, 300 × 50, 300 × 100, 250 × 250, and 200 × 200 px.', '300 × 250, 336 × 280, 728 × 90, and 970 × 90 px.', '300 × 250, 300 × 100, 468 × 60, 160 × 600, and 200 × 200 px.'], 'The computer figure shows nine example sizes.', 'Handout 2 · p. 2'],
      ['Which set contains examples of other interactive web content?', 'Widgets, maps, interactive video, eBooks, and image sliders.', ['Printers, keyboards, cables, and paper folders.', 'Invoices, calendars, receipts, and manuals.', 'Databases, passwords, servers, and file backups.'], 'The lesson gives widgets, maps, video, motion graphics, eBooks, and sliders as examples.', 'Handout 2 · p. 1'],
      ['What can animation and interactivity do for an infographic?', 'Make it more visually appealing and dynamic.', ['Remove the need to show data.', 'Turn every chart into an advertisement.', 'Make it impossible to update.'], 'The handout says animation and interaction can make infographics more dynamic.', 'Handout 2 · p. 3'],
      ['What is the first step in the interactive infographic workflow?', 'Design the infographic in a design editing tool.', ['Export the finished project.', 'Add game scoring rules.', 'Test the final version.'], 'The workflow starts by designing the infographic.', 'Handout 2 · p. 3'],
      ['After designing an infographic, what comes next in the workflow?', 'Import its design assets into Wick Editor or Figma.', ['Publish the project before adding interaction.', 'Replace the assets with plain text.', 'Create a call to action for a banner ad.'], 'The next step is to bring the design assets into an interactive tool.', 'Handout 2 · p. 3'],
      ['How does the handout suggest animating or prototyping the infographic?', 'Use Wick Editor animation or Figma prototyping.', ['Use a spreadsheet formula or email draft.', 'Print the design and add paper buttons.', 'Record a screen capture without interaction.'], 'It names Wick Editor animation and Figma prototyping.', 'Handout 2 · p. 3'],
      ['What should be added after animating the infographic?', 'Interactive buttons and other interactions.', ['A separate set of website banner dimensions.', 'A printed cover page and index.', 'A new static image with no controls.'], 'The workflow adds interactive buttons and other interactions.', 'Handout 2 · p. 3'],
      ['What should happen before an interactive infographic is exported?', 'Test it.', ['Remove all buttons.', 'Convert it into a printed poster.', 'Replace the design assets.'], 'Testing is the last listed step before exporting.', 'Handout 2 · p. 3'],
      ['Which software does the handout mention for designing infographic visuals?', 'Illustrator, Photoshop, or another graphic design tool.', ['A mail client or calendar app.', 'A spreadsheet only.', 'A web browser with no design tool.'], 'The lesson names Illustrator and Photoshop as examples of design tools.', 'Handout 2 · p. 3'],
      ['Which order matches the interactive infographic workflow?', 'Design, import assets, animate or prototype, add interactions, then test.', ['Test, export, design, remove assets, then publish.', 'Import, test, print, animate, then remove buttons.', 'Animate, publish, design, then skip testing.'], 'The workflow moves from design to assets, animation, interaction, and testing.', 'Handout 2 · p. 3'],
      ['Which statement best describes an interactive infographic in this lesson?', 'A designed infographic enhanced with animation and user interaction.', ['A static chart that cannot be changed.', 'A banner ad with no data visuals.', 'A plain text list with no visual elements.'], 'The lesson builds on infographic design by adding motion and interaction.', 'Handout 2 · p. 3']
    ]
  ),
  makeDeck(
    'interactive-games',
    'Interactive games',
    'Why website games engage visitors and the steps for building one.',
    'Handout 3 · How to Create Interactive Games',
    'lavender',
    [
      ['Do games only exist as mobile or computer games?', 'No. Games can also run directly on a website.', ['Yes. Every game needs to be installed as an app.', 'Yes. A game must be played on a console.', 'No. Games only run inside a printed book.'], 'The handout notes that some games can be played straight from a website.', 'Handout 3 · p. 1'],
      ['How can an interactive game affect a website visitor?', 'It can capture attention and encourage them to stay and engage.', ['It forces them to leave the website immediately.', 'It hides the website content from them.', 'It replaces the need for a website.'], 'The lesson describes games as a way to hold attention and support engagement.', 'Handout 3 · p. 1'],
      ['How can interactive games improve the visitor experience?', 'They can entertain visitors and offer a sense of attainment or rewards.', ['They prevent visitors from interacting with content.', 'They remove all choices and feedback.', 'They make the page display only static text.'], 'The handout connects games with entertainment and rewards.', 'Handout 3 · p. 1'],
      ['What can a branded interactive game help a site grow?', 'Audience interaction and traffic to the site.', ['The number of printed pages in a manual.', 'The size of its offline database only.', 'The time needed to export a static banner.'], 'The handout says branded games can help drive traffic and interaction.', 'Handout 3 · p. 1'],
      ['What is the first step in the game creation workflow?', 'Design the visual graphics.', ['Test the game.', 'Export the finished animation.', 'Add buttons before any design.'], 'The listed workflow starts with designing the visuals.', 'Handout 3 · p. 1'],
      ['What follows designing the game graphics?', 'Create the animation.', ['Publish the game before testing.', 'Write the final review first.', 'Remove the visual elements.'], 'Animation comes after visual design in the workflow.', 'Handout 3 · p. 1'],
      ['After animation, where can the work be imported?', 'Wick Editor or another authoring or design tool.', ['A printed handout only.', 'A spreadsheet or email inbox.', 'A video player with no authoring tools.'], 'The handout names Wick Editor or another authoring/design tool.', 'Handout 3 · p. 1'],
      ['What should be added to make the game interactive?', 'Game buttons and other interactions.', ['Only a page number and border.', 'A static export with no controls.', 'A banner ad call to action only.'], 'The workflow includes game buttons and other interactivity.', 'Handout 3 · p. 1'],
      ['What is the final listed step when creating an interactive game?', 'Test it.', ['Design the graphics.', 'Import the animation.', 'Add the first button.'], 'Testing comes at the end of the handout workflow.', 'Handout 3 · p. 1'],
      ['Which order matches the game workflow in the handout?', 'Design graphics, animate, import into a tool, add game interactions, then test.', ['Import, publish, test, design graphics, then animate.', 'Add buttons, export, design, then skip testing.', 'Animate, test, delete assets, then import.'], 'The sequence ends with testing after the interactions are in place.', 'Handout 3 · p. 1']
    ]
  )
];

