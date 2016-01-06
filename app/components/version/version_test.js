'use strict';

describe('estorrent.version module', function() {
  beforeEach(module('estorrent.version'));

  describe('version service', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });
});
