'use strict';

angular.module('estorrent.version', [
  'estorrent.version.interpolate-filter',
  'estorrent.version.version-directive'
])

.value('version', '0.1');
