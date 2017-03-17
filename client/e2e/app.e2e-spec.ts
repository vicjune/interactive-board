import { InteractiveBoardPage } from './app.po';

describe('interactive-board App', function() {
  let page: InteractiveBoardPage;

  beforeEach(() => {
    page = new InteractiveBoardPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
