'use strict';

module.exports = function (grunt) {

    grunt.initConfig({
        jshint: {
            files: ['Gruntfile.js', 'app/app.js', 'app/js/**/*.js', 'test/**/*.js'],
            options: {
                globalstrict: true,
                "globals": {
                    "angular": true,
                    "ejs": true,
                    "describe": false,
                    "it": false,
                    "expect": false,
                    "beforeEach": false,
                    "afterEach": false,
                    "module": false,
                    "inject": false
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint']
        },
        imagemin: {                          // Task
            dynamic: {                         // Another target
                files: [{
                    expand: true,                  // Enable dynamic expansion
                    cwd: 'app/assets/src/',                   // Src matches are relative to this path
                    src: ['**/*.{png,jpg,gif}'],   // Actual patterns to match
                    dest: 'app/assets/dist/'                  // Destination path prefix
                }]
            }
        },
        uncss: {
            dist: {
                options: {
                    ignore: [/js-.+/, '.special-class'],
                    ignoreSheets: [/fonts.googleapis/],
                },
                files: {
                    'tmp/app.css': ['app/index.html']
                }
            }
        },
        cssmin: {
            dist: {
                files: {
                    'app/assets/dist/css/app.css': ['tmp/app.css']
                }
            }
        },
        processhtml: {
          dist: {
              files: {
                  'tmp/index.html': ['app/index.html']
              }
          }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [{
                    expand: true,
                    cwd: 'tmp',
                    src: 'index.html',
                    dest: 'app/assets/dist/'
                }]
            }
        },
        concat: {
          dist: {
              files: [
                  {
                      src: [
                          'app/bower_components/html5-boilerplate/dist/js/vendor/modernizr-2.8.3.min.js',
                          'app/bower_components/angular/angular.js',
                          'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
                          'app/bower_components/elasticsearch/elasticsearch.angular.js',
                          'app/bower_components/elastic.js/dist/elastic.min.js',
                          'app/app.js',
                          'components/search/search.js'
                      ],
                      dest: 'tmp/app.js'
                  }
              ]
          }
        },
        'closure-compiler': {
            simple: {
                js: [
                    'tmp/app.js',
                ],
                jsOutputFile: 'app/assets/dist/js/app.js',
                noreport: true,
                closurePath: "./",
                options: {
                    compilation_level: 'ADVANCED_OPTIMIZATIONS',
                    warning_level:"DEFAULT"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-uncss');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-closure-compiler');

    grunt.registerTask('default', ['jshint', 'imagemin', 'uncss', 'cssmin', 'processhtml', 'htmlmin', 'concat', 'closure-compiler:simple']);
};