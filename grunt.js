/*global module:false*/
module.exports = function(grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        pkg: '<json:knockout-validator.json>',
        meta: {
            banner: '// <%= pkg.title %> v<%= pkg.version %>'
        },
        concat: {
            dist: {
                src: ['<banner:meta.banner>', '<file_strip_banner:src/core.js>', '<file_strip_banner:src/utils.js>',
                    '<file_strip_banner:src/methods.js>', '<file_strip_banner:src/extenders.js>',
                    '<file_strip_banner:src/bindings.js>'],
                dest: 'build/<%= pkg.name %>.js'
            }
        },
        min: {
            dist: {
                src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        qunit: {
            files: ['test/test-suite.html']
        },
        lint: {
            files: ['src/*.js']
        },
        watch: {
            files: '<config:lint.files>',
            tasks: 'lint qunit'
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                strict: true,
                undef: true,
                browser: true
            },
            globals: {
                ko: true
            }
        },
        uglify: {}
    });

    // Default task.
    grunt.registerTask('default', 'lint concat min');
};
