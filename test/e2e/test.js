describe('items list', function() {

  beforeEach(function () {
    browser.get('http://localhost:8080');
  });

  it('should contain a pill box with two buttons', function() {

    var itemsButton = element(by.buttonText('Items'));
    var manifestsButton = element(by.buttonText('Manifests'));

    expect(itemsButton).toBeDefined();
    expect(manifestsButton).toBeDefined();
    
  });

});
