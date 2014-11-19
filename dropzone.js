'use strict';

/**
version 0.1

 * Een catch-all dropzone die reageert op het hierop slepen van
 * a) een afbeelding, d.w.z. een url naar een bestand met grafische extensie
 * b) een item (een film of ander object)
 * c) een hyperlink, d.w.z. een url zonder grafische extensie
 * d) een lokaal bestand, zoiets als upload dus
 */
angular.module('jcDirectives')
  .directive('dropzone', function ($parse) {
  return {
      getExtension: function(s) {
            var point = s.lastIndexOf('.');
            return s.substr(point).toUpperCase();
        },
        restrict : "A",
        link: function (scope, elem, attr) {
            var getExtension = function(s) {
                    var point = s.lastIndexOf('.');
                    return s.substr(point).toUpperCase();
                },
                execFun = function(attrName, parms, evt) {
                    var fn = $parse(attr[attrName]);
                    scope.$apply(function () {
                        fn(scope, {
                            $data: parms,
                            $event: evt
                        });
                    });
                };

            elem.bind('dragover', function(evt){
                evt.preventDefault();
            });

            elem.bind('drop', function(evt) {
                var text = evt.originalEvent.dataTransfer.getData('text/plain'),
                    files = evt.originalEvent.dataTransfer.files;

                evt.stopPropagation();
                evt.preventDefault();

                if (text) {
                    // Drop een bestand: mogelijkheden a,b,c,d.
                    // a) picture -> dropImage
                    var ext = getExtension(text);
                    if (ext === '.JPG' || ext === '.JPEG' || ext === '.PNG' || ext === '.GIF') {
                        execFun('dropImage', {text: text}, evt);
                    }
                    // b. lijstregel -> dropItem
                    else {
                        var done = false;
                        try {
                            var item = angular.fromJson(text);
                            if (angular.isObject(item)) {
                                execFun('dropItem', {item: item}, evt);
                                done = true;
                            }
                        }
                        catch(ex){
                            // Don't report this intented error
                            // that we have used to determine whether the jsonstring
                            // has an object in it.
                        }
                        // c. hyperlink -> dropUrl
                        // e.g. an url for an item in a lijstje-films-lijst.
                        if (!done) {
                            execFun('dropUrl', {text:text}, evt);
                        }
                    }
                }
                else if (files) {
                    // d. lokaal bestand
                    for (var i = 0, f; f = files[i]; i++) {
                       var imageReader = new FileReader();

                       imageReader.onload = (function(file) {
                            return function(progressEvent) {
                                execFun('dropImage', {
                                    localResult: progressEvent.target.result,// voor BLOB
                                    file: file  // voor PHP upload handling ($_FILES)
                                }, evt);
                            };
                       })(f);
                       imageReader.readAsDataURL(f);
                    }
                }
            });
        }
    };
});

