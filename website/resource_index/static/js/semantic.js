 /*
 * # Semantic UI
 * https://github.com/Semantic-Org/Semantic-UI
 * http://www.semantic-ui.com/
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
/*
 * # Semantic - Accordion
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function (jQuery, window, document, undefined) {

"use strict";

jQuery.fn.accordion = function(parameters) {
  var
    jQueryallModules     = jQuery(this),

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    returnedValue
  ;
  jQueryallModules
    .each(function() {
      var
        settings        = ( jQuery.isPlainObject(parameters) )
          ? jQuery.extend(true, {}, jQuery.fn.accordion.settings, parameters)
          : jQuery.extend({}, jQuery.fn.accordion.settings),

        className       = settings.className,
        namespace       = settings.namespace,
        selector        = settings.selector,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,
        moduleSelector  = jQueryallModules.selector || '',

        jQuerymodule  = jQuery(this),
        jQuerytitle   = jQuerymodule.find(selector.title),
        jQuerycontent = jQuerymodule.find(selector.content),

        element  = this,
        instance = jQuerymodule.data(moduleNamespace),
        observer,
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing accordion with bound events', jQuerymodule);
          jQuerymodule
            .on('click' + eventNamespace, selector.title, module.event.click)
          ;
          module.observeChanges();
          module.instantiate();
        },

        instantiate: function() {
          instance = module;
          jQuerymodule
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.debug('Destroying previous accordion for', jQuerymodule);
          jQuerymodule
            .removeData(moduleNamespace)
          ;
          jQuerytitle
            .off(eventNamespace)
          ;
        },

        refresh: function() {
          jQuerytitle   = jQuerymodule.find(selector.title);
          jQuerycontent = jQuerymodule.find(selector.content);
        },

        observeChanges: function() {
          if('MutationObserver' in window) {
            observer = new MutationObserver(function(mutations) {
              module.debug('DOM tree modified, updating selector cache');
              module.refresh();
            });
            observer.observe(element, {
              childList : true,
              subtree   : true
            });
            module.debug('Setting up mutation observer', observer);
          }
        },


        event: {
          click: function() {
            jQuery.proxy(module.toggle, this)();
          }
        },

        toggle: function(query) {
          var
            jQueryactiveTitle = (query !== undefined)
              ? (typeof query === 'number')
                ? jQuerytitle.eq(query)
                : jQuery(query)
              : jQuery(this),
            jQueryactiveContent = jQueryactiveTitle.next(jQuerycontent),
            contentIsOpen  = jQueryactiveContent.is(':visible')
          ;
          module.debug('Toggling visibility of content', jQueryactiveTitle);
          if(contentIsOpen) {
            if(settings.collapsible) {
              jQuery.proxy(module.close, jQueryactiveTitle)();
            }
            else {
              module.debug('Cannot close accordion content collapsing is disabled');
            }
          }
          else {
            jQuery.proxy(module.open, jQueryactiveTitle)();
          }
        },

        open: function(query) {
          var
            jQueryactiveTitle = (query !== undefined)
              ? (typeof query === 'number')
                ? jQuerytitle.eq(query)
                : jQuery(query)
              : jQuery(this),
            jQueryactiveContent     = jQueryactiveTitle.next(jQuerycontent),
            currentlyAnimating = jQueryactiveContent.is(':animated'),
            currentlyActive    = jQueryactiveContent.hasClass(className.active)
          ;
          if(!currentlyAnimating && !currentlyActive) {
            module.debug('Opening accordion content', jQueryactiveTitle);
            if(settings.exclusive) {
              jQuery.proxy(module.closeOthers, jQueryactiveTitle)();
            }
            jQueryactiveTitle
              .addClass(className.active)
            ;
            jQueryactiveContent
              .stop()
              .children()
                .stop()
                .animate({
                  opacity: 1
                }, settings.duration, module.reset.display)
                .end()
              .slideDown(settings.duration, settings.easing, function() {
                jQueryactiveContent
                  .addClass(className.active)
                ;
                jQuery.proxy(module.reset.display, this)();
                jQuery.proxy(settings.onOpen, this)();
                jQuery.proxy(settings.onChange, this)();
              })
            ;
          }
        },

        close: function(query) {
          var
            jQueryactiveTitle = (query !== undefined)
              ? (typeof query === 'number')
                ? jQuerytitle.eq(query)
                : jQuery(query)
              : jQuery(this),
            jQueryactiveContent = jQueryactiveTitle.next(jQuerycontent),
            isActive       = jQueryactiveContent.hasClass(className.active)
          ;
          if(isActive) {
            module.debug('Closing accordion content', jQueryactiveContent);
            jQueryactiveTitle
              .removeClass(className.active)
            ;
            jQueryactiveContent
              .removeClass(className.active)
              .show()
              .stop()
              .children()
                .stop()
                .animate({
                  opacity: 0
                }, settings.duration, module.reset.opacity)
                .end()
              .slideUp(settings.duration, settings.easing, function() {
                jQuery.proxy(module.reset.display, this)();
                jQuery.proxy(settings.onClose, this)();
                jQuery.proxy(settings.onChange, this)();
              })
            ;
          }
        },

        closeOthers: function(index) {
          var
            jQueryactiveTitle = (index !== undefined)
              ? jQuerytitle.eq(index)
              : jQuery(this),
            jQueryparentTitles    = jQueryactiveTitle.parents(selector.content).prev(selector.title),
            jQueryactiveAccordion = jQueryactiveTitle.closest(selector.accordion),
            activeSelector   = selector.title + '.' + className.active + ':visible',
            activeContent    = selector.content + '.' + className.active + ':visible',
            jQueryopenTitles,
            jQuerynestedTitles,
            jQueryopenContents
          ;
          if(settings.closeNested) {
            jQueryopenTitles   = jQueryactiveAccordion.find(activeSelector).not(jQueryparentTitles);
            jQueryopenContents = jQueryopenTitles.next(jQuerycontent);
          }
          else {
            jQueryopenTitles   = jQueryactiveAccordion.find(activeSelector).not(jQueryparentTitles);
            jQuerynestedTitles = jQueryactiveAccordion.find(activeContent).find(activeSelector).not(jQueryparentTitles);
            jQueryopenTitles = jQueryopenTitles.not(jQuerynestedTitles);
            jQueryopenContents = jQueryopenTitles.next(jQuerycontent);
          }
          if( (jQueryopenTitles.size() > 0) ) {
            module.debug('Exclusive enabled, closing other content', jQueryopenTitles);
            jQueryopenTitles
              .removeClass(className.active)
            ;
            jQueryopenContents
              .stop()
              .children()
                .stop()
                .animate({
                  opacity: 0
                }, settings.duration, module.resetOpacity)
                .end()
              .slideUp(settings.duration , settings.easing, function() {
                jQuery(this).removeClass(className.active);
                jQuery.proxy(module.reset.display, this)();
              })
            ;
          }
        },

        reset: {

          display: function() {
            module.verbose('Removing inline display from element', this);
            jQuery(this).css('display', '');
            if( jQuery(this).attr('style') === '') {
              jQuery(this)
                .attr('style', '')
                .removeAttr('style')
              ;
            }
          },

          opacity: function() {
            module.verbose('Removing inline opacity from element', this);
            jQuery(this).css('opacity', '');
            if( jQuery(this).attr('style') === '') {
              jQuery(this)
                .attr('style', '')
                .removeAttr('style')
              ;
            }
          },

        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          module.debug('Changing internal', name, value);
          if(value !== undefined) {
            if( jQuery.isPlainObject(name) ) {
              jQuery.extend(true, module, name);
            }
            else {
              module[name] = value;
            }
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            jQuery.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                jQuery.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            jQuery.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( jQuery.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if(jQuery.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };
      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;
  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

jQuery.fn.accordion.settings = {

  name        : 'Accordion',
  namespace   : 'accordion',

  debug       : false,
  verbose     : true,
  performance : true,

  exclusive   : true,
  collapsible : true,
  closeNested : false,

  duration    : 500,
  easing      : 'easeInOutQuint',

  onOpen      : function(){},
  onClose     : function(){},
  onChange    : function(){},

  error: {
    method    : 'The method you called is not defined'
  },

  className   : {
    active : 'active'
  },

  selector    : {
    accordion : '.accordion',
    title     : '.title',
    content   : '.content'
  }

};

// Adds easing
jQuery.extend( jQuery.easing, {
  easeInOutQuint: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  }
});

})( jQuery, window , document );


/*
 * # Semantic - API
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( jQuery, window, document, undefined ) {

jQuery.api = jQuery.fn.api = function(parameters) {

  var
    // use window context if none specified
    jQueryallModules     = jQuery.isFunction(this)
        ? jQuery(window)
        : jQuery(this),
    moduleSelector = jQueryallModules.selector || '',
    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),

    returnedValue
  ;

  jQueryallModules
    .each(function() {
      var
        settings          = ( jQuery.isPlainObject(parameters) )
          ? jQuery.extend(true, {}, jQuery.fn.api.settings, parameters)
          : jQuery.extend({}, jQuery.fn.api.settings),

        // internal aliases
        namespace       = settings.namespace,
        metadata        = settings.metadata,
        selector        = settings.selector,
        error           = settings.error,
        className       = settings.className,

        // define namespaces for modules
        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        // element that creates request
        jQuerymodule         = jQuery(this),
        jQueryform           = jQuerymodule.closest(selector.form),

        // context used for state
        jQuerycontext        = (settings.stateContext)
          ? jQuery(settings.stateContext)
          : jQuerymodule,

        // request details
        ajaxSettings,
        requestSettings,
        url,
        data,

        // standard module
        element         = this,
        context         = jQuerycontext.get(),
        instance        = jQuerymodule.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          var
            triggerEvent = module.get.event()
          ;
          // bind events
          if(!methodInvoked) {
            if( triggerEvent ) {
              module.debug('Attaching API events to element', triggerEvent);
              jQuerymodule
                .on(triggerEvent + eventNamespace, module.event.trigger)
              ;
            }
            else {
              module.query();
            }
          }
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          jQuerymodule
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module for', element);
          jQuerymodule
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
        },

        query: function() {

          if(module.is.disabled()) {
            module.debug('Element is disabled API request aborted');
            return;
          }
          // determine if an api event already occurred
          if(module.is.loading() && settings.throttle === 0 ) {
            module.debug('Cancelling request, previous request is still pending');
            return;
          }

          // pass element metadata to url (value, text)
          if(settings.defaultData) {
            jQuery.extend(true, settings.urlData, module.get.defaultData());
          }

          // Add form content
          if(settings.serializeForm !== false || jQuerycontext.is('form')) {
            if(settings.serializeForm == 'json') {
              jQuery.extend(true, settings.data, module.get.formData());
            }
            else {
              settings.data = module.get.formData();
            }
          }

          // call beforesend and get any settings changes
          requestSettings = module.get.settings();

          // check if beforesend cancelled request
          if(requestSettings === false) {
            module.error(error.beforeSend);
            return;
          }

          if(settings.url) {
            // override with url if specified
            module.debug('Using specified url', url);
            url = module.add.urlData( settings.url );
          }
          else {
            // otherwise find url from api endpoints
            url = module.add.urlData( module.get.templateURL() );
            module.debug('Added URL Data to url', url);
          }

          // exit conditions reached, missing url parameters
          if( !url ) {
            if(jQuerymodule.is('form')) {
              module.debug('No url or action specified, defaulting to form action');
              url = jQuerymodule.attr('action');
            }
            else {
              module.error(error.missingURL, settings.action);
              return;
            }
          }

          // add loading state
          module.set.loading();

          // look for jQuery ajax parameters in settings
          ajaxSettings = jQuery.extend(true, {}, settings, {
            type       : settings.method || settings.type,
            data       : data,
            url        : settings.base + url,
            beforeSend : settings.beforeXHR,
            success    : function() {},
            failure    : function() {},
            complete   : function() {}
          });

          module.verbose('Creating AJAX request with settings', ajaxSettings);

          if( !module.is.loading() ) {
            module.request = module.create.request();
            module.xhr = module.create.xhr();
          }
          else {
            // throttle additional requests
            module.timer = setTimeout(function() {
              module.request = module.create.request();
              module.xhr = module.create.xhr();
            }, settings.throttle);
          }

        },


        is: {
          disabled: function() {
            return (jQuerymodule.filter(settings.filter).size() > 0);
          },
          loading: function() {
            return (module.request && module.request.state() == 'pending');
          }
        },

        was: {
          succesful: function() {
            return (module.request && module.request.state() == 'resolved');
          },
          failure: function() {
            return (module.request && module.request.state() == 'rejected');
          },
          complete: function() {
            return (module.request && (module.request.state() == 'resolved' || module.request.state() == 'rejected') );
          }
        },

        add: {
          urlData: function(url, urlData) {
            var
              requiredVariables,
              optionalVariables
            ;
            if(url) {
              requiredVariables = url.match(settings.regExp.required);
              optionalVariables = url.match(settings.regExp.optional);
              urlData           = urlData || settings.urlData;
              if(requiredVariables) {
                module.debug('Looking for required URL variables', requiredVariables);
                jQuery.each(requiredVariables, function(index, templatedString) {
                  var
                    // allow legacy {jQueryvar} style
                    variable = (templatedString.indexOf('jQuery') !== -1)
                      ? templatedString.substr(2, templatedString.length - 3)
                      : templatedString.substr(1, templatedString.length - 2),
                    value   = (jQuery.isPlainObject(urlData) && urlData[variable] !== undefined)
                      ? urlData[variable]
                      : (jQuerymodule.data(variable) !== undefined)
                        ? jQuerymodule.data(variable)
                        : (jQuerycontext.data(variable) !== undefined)
                          ? jQuerycontext.data(variable)
                          : urlData[variable]
                  ;
                  // remove value
                  if(value === undefined) {
                    module.error(error.requiredParameter, variable, url);
                    url = false;
                    return false;
                  }
                  else {
                    module.verbose('Found required variable', variable, value);
                    url = url.replace(templatedString, value);
                  }
                });
              }
              if(optionalVariables) {
                module.debug('Looking for optional URL variables', requiredVariables);
                jQuery.each(optionalVariables, function(index, templatedString) {
                  var
                    // allow legacy {/jQueryvar} style
                    variable = (templatedString.indexOf('jQuery') !== -1)
                      ? templatedString.substr(3, templatedString.length - 4)
                      : templatedString.substr(2, templatedString.length - 3),
                    value   = (jQuery.isPlainObject(urlData) && urlData[variable] !== undefined)
                      ? urlData[variable]
                      : (jQuerymodule.data(variable) !== undefined)
                        ? jQuerymodule.data(variable)
                        : (jQuerycontext.data(variable) !== undefined)
                          ? jQuerycontext.data(variable)
                          : urlData[variable]
                  ;
                  // optional replacement
                  if(value !== undefined) {
                    module.verbose('Optional variable Found', variable, value);
                    url = url.replace(templatedString, value);
                  }
                  else {
                    module.verbose('Optional variable not found', variable);
                    // remove preceding slash if set
                    if(url.indexOf('/' + templatedString) !== -1) {
                      url = url.replace('/' + templatedString, '');
                    }
                    else {
                      url = url.replace(templatedString, '');
                    }
                  }
                });
              }
            }
            return url;
          }
        },

        event: {
          trigger: function(event) {
            module.query();
            if(event.type == 'submit' || event.type == 'click') {
              event.preventDefault();
            }
          },
          xhr: {
            always: function() {
              // calculate if loading time was below minimum threshold
            },
            done: function(response) {
              var
                context      = this,
                elapsedTime  = (new Date().getTime() - time),
                timeLeft     = (settings.loadingDuration - elapsedTime)
              ;
              timeLeft = (timeLeft > 0)
                ? timeLeft
                : 0
              ;
              setTimeout(function() {
                module.request.resolveWith(context, [response]);
              }, timeLeft);
            },
            fail: function(xhr, status, httpMessage) {
              var
                context     = this,
                elapsedTime = (new Date().getTime() - time),
                timeLeft    = (settings.loadingDuration - elapsedTime)
              ;
              timeLeft = (timeLeft > 0)
                ? timeLeft
                : 0
              ;
              // page triggers abort on navigation, dont show error
              setTimeout(function() {
                if(status !== 'abort') {
                  module.request.rejectWith(context, [xhr, status, httpMessage]);
                }
                else {
                  module.reset();
                }
              }, timeLeft);
            }
          },
          request: {
            complete: function(response) {
              module.remove.loading();
              jQuery.proxy(settings.onComplete, context)(response, jQuerymodule);
            },
            done: function(response) {
              module.debug('API Response Received', response);
              if(settings.dataType == 'json') {
                if( jQuery.isFunction(settings.successTest) ) {
                  module.debug('Checking JSON returned success', settings.successTest, response);
                  if( settings.successTest(response) ) {
                    jQuery.proxy(settings.onSuccess, context)(response, jQuerymodule);
                  }
                  else {
                    module.debug('JSON test specified by user and response failed', response);
                    jQuery.proxy(settings.onFailure, context)(response, jQuerymodule);
                  }
                }
                else {
                  jQuery.proxy(settings.onSuccess, context)(response, jQuerymodule);
                }
              }
              else {
                jQuery.proxy(settings.onSuccess, context)(response, jQuerymodule);
              }
            },
            error: function(xhr, status, httpMessage) {
              var
                errorMessage = (settings.error[status] !== undefined)
                  ? settings.error[status]
                  : httpMessage,
                response
              ;
              // let em know unless request aborted
              if(xhr !== undefined) {
                // readyState 4 = done, anything less is not really sent
                if(xhr.readyState !== undefined && xhr.readyState == 4) {

                  // if http status code returned and json returned error, look for it
                  if( xhr.status != 200 && httpMessage !== undefined && httpMessage !== '') {
                    module.error(error.statusMessage + httpMessage);
                  }
                  else {
                    if(status == 'error' && settings.dataType == 'json') {
                      try {
                        response = jQuery.parseJSON(xhr.responseText);
                        if(response && response.error !== undefined) {
                          errorMessage = response.error;
                        }
                      }
                      catch(e) {
                        module.error(error.JSONParse);
                      }
                    }
                  }
                  module.remove.loading();
                  module.set.error();
                  // show error state only for duration specified in settings
                  if(settings.errorDuration) {
                    setTimeout(module.remove.error, settings.errorDuration);
                  }
                  module.debug('API Request error:', errorMessage);
                  jQuery.proxy(settings.onError, context)(errorMessage, context);
                }
                else {
                  jQuery.proxy(settings.onAbort, context)(errorMessage, context);
                  module.debug('Request Aborted (Most likely caused by page change or CORS Policy)', status, httpMessage);
                }
              }
            }
          }
        },

        create: {
          request: function() {
            return jQuery.Deferred()
              .always(module.event.request.complete)
              .done(module.event.request.done)
              .fail(module.event.request.error)
            ;
          },
          xhr: function() {
            jQuery.ajax(ajaxSettings)
              .always(module.event.xhr.always)
              .done(module.event.xhr.done)
              .fail(module.event.xhr.fail)
            ;
          }
        },

        set: {
          error: function() {
            module.verbose('Adding error state to element', jQuerycontext);
            jQuerycontext.addClass(className.error);
          },
          loading: function() {
            module.verbose('Adding loading state to element', jQuerycontext);
            jQuerycontext.addClass(className.loading);
          }
        },

        remove: {
          error: function() {
            module.verbose('Removing error state from element', jQuerycontext);
            jQuerycontext.removeClass(className.error);
          },
          loading: function() {
            module.verbose('Removing loading state from element', jQuerycontext);
            jQuerycontext.removeClass(className.loading);
          }
        },

        get: {
          request: function() {
            return module.request || false;
          },
          xhr: function() {
            return module.xhr || false;
          },
          settings: function() {
            var
              runSettings
            ;
            runSettings = jQuery.proxy(settings.beforeSend, jQuerymodule)(settings);
            if(runSettings) {
              if(runSettings.success !== undefined) {
                module.debug('Legacy success callback detected', runSettings);
                module.error(error.legacyParameters, runSettings.success);
                runSettings.onSuccess = runSettings.success;
              }
              if(runSettings.failure !== undefined) {
                module.debug('Legacy failure callback detected', runSettings);
                module.error(error.legacyParameters, runSettings.failure);
                runSettings.onFailure = runSettings.failure;
              }
              if(runSettings.complete !== undefined) {
                module.debug('Legacy complete callback detected', runSettings);
                module.error(error.legacyParameters, runSettings.complete);
                runSettings.onComplete = runSettings.complete;
              }
            }
            if(runSettings === undefined) {
              module.error(error.noReturnedValue);
            }
            return (runSettings !== undefined)
              ? runSettings
              : settings
            ;
          },
          defaultData: function() {
            var
              data = {}
            ;
            if( !jQuery.isWindow(element) ) {
              if( jQuerymodule.is('input') ) {
                data.value = jQuerymodule.val();
              }
              else if( jQuerymodule.is('form') ) {

              }
              else {
                data.text = jQuerymodule.text();
              }
            }
            return data;
          },
          event: function() {
            if( jQuery.isWindow(element) || settings.on == 'now' ) {
              module.debug('API called without element, no events attached');
              return false;
            }
            else if(settings.on == 'auto') {
              if( jQuerymodule.is('input') ) {
                return (element.oninput !== undefined)
                  ? 'input'
                  : (element.onpropertychange !== undefined)
                    ? 'propertychange'
                    : 'keyup'
                ;
              }
              else if( jQuerymodule.is('form') ) {
                return 'submit';
              }
              else {
                return 'click';
              }
            }
            else {
              return settings.on;
            }
          },
          formData: function() {
            var
              formData
            ;
            if(jQuery(this).serializeObject() !== undefined) {
              formData = jQueryform.serializeObject();
            }
            else {
              module.error(error.missingSerialize);
              formData = jQueryform.serialize();
            }
            module.debug('Retrieved form data', formData);
            return formData;
          },
          templateURL: function(action) {
            var
              url
            ;
            action = action || jQuerymodule.data(settings.metadata.action) || settings.action || false;
            if(action) {
              module.debug('Looking up url for action', action, settings.api);
              if(settings.api[action] !== undefined) {
                url = settings.api[action];
                module.debug('Found template url', url);
              }
              else {
                module.error(error.missingAction, settings.action, settings.api);
              }
            }
            return url;
          }
        },

        // reset state
        reset: function() {
          module.remove.error();
          module.remove.loading();
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                //'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            jQuery.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                jQuery.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            jQuery.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ( jQuery.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if(jQuery.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

jQuery.api.settings = {

  name            : 'API',
  namespace       : 'api',

  debug           : false,
  verbose         : true,
  performance     : true,

  // event binding
  on              : 'auto',
  filter          : '.disabled',
  stateContext    : false,

  // state
  loadingDuration : 0,
  errorDuration   : 2000,

  // templating
  action          : false,
  url             : false,
  base            : '',

  // data
  urlData         : {},

  // ui
  defaultData     : true,
  serializeForm   : false,
  throttle        : 0,

  // jQ ajax
  method          : 'get',
  data            : {},
  dataType        : 'json',

  // callbacks
  beforeSend  : function(settings) { return settings; },
  beforeXHR   : function(xhr) {},

  onSuccess   : function(response, jQuerymodule) {},
  onComplete  : function(response, jQuerymodule) {},
  onFailure   : function(errorMessage, jQuerymodule) {},
  onError     : function(errorMessage, jQuerymodule) {},
  onAbort     : function(errorMessage, jQuerymodule) {},

  successTest : false,

  // errors
  error : {
    beforeSend        : 'The before send function has aborted the request',
    error             : 'There was an error with your request',
    exitConditions    : 'API Request Aborted. Exit conditions met',
    JSONParse         : 'JSON could not be parsed during error handling',
    legacyParameters  : 'You are using legacy API success callback names',
    missingAction     : 'API action used but no url was defined',
    missingSerialize  : 'Required dependency jquery-serialize-object missing, using basic serialize',
    missingURL        : 'No URL specified for api event',
    noReturnedValue   : 'The beforeSend callback must return a settings object, beforeSend ignored.',
    parseError        : 'There was an error parsing your request',
    requiredParameter : 'Missing a required URL parameter: ',
    statusMessage     : 'Server gave an error: ',
    timeout           : 'Your request timed out'
  },

  regExp  : {
    required: /\{\jQuery*[A-z0-9]+\}/g,
    optional: /\{\/\jQuery*[A-z0-9]+\}/g,
  },

  className: {
    loading : 'loading',
    error   : 'error'
  },

  selector: {
    form: 'form'
  },

  metadata: {
    action  : 'action',
    request : 'request',
    xhr     : 'xhr'
  }
};


jQuery.api.settings.api = {};


})( jQuery, window , document );
/*
 * # Semantic - Checkbox
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( jQuery, window, document, undefined ) {

"use strict";

jQuery.fn.checkbox = function(parameters) {
  var
    jQueryallModules    = jQuery(this),
    moduleSelector = jQueryallModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),
    returnedValue
  ;

  jQueryallModules
    .each(function() {
      var
        settings        = jQuery.extend(true, {}, jQuery.fn.checkbox.settings, parameters),

        className       = settings.className,
        namespace       = settings.namespace,
        selector        = settings.selector,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        jQuerymodule         = jQuery(this),
        jQuerylabel          = jQuery(this).next(selector.label).first(),
        jQueryinput          = jQuery(this).find(selector.input),

        instance        = jQuerymodule.data(moduleNamespace),

        observer,
        element         = this,
        module
      ;

      module      = {

        initialize: function() {
          module.verbose('Initializing checkbox', settings);
          jQuerymodule
            .on('click'   + eventNamespace, module.toggle)
            .on('keydown' + eventNamespace, selector.input, module.event.keydown)
          ;
          if( module.is.checked() ) {
            module.set.checked();
            if(settings.fireOnInit) {
              jQuery.proxy(settings.onChecked, jQueryinput.get())();
            }
          }
          else {
            module.remove.checked();
            if(settings.fireOnInit) {
              jQuery.proxy(settings.onUnchecked, jQueryinput.get())();
            }
          }
          module.observeChanges();

          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          jQuerymodule
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module');
          jQuerymodule
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
          jQueryinput
            .off(eventNamespace, module.event.keydown)
          ;
          jQuerylabel
            .off(eventNamespace)
          ;
        },

        refresh: function() {
          jQuerymodule = jQuery(this);
          jQuerylabel  = jQuery(this).next(selector.label).first();
          jQueryinput  = jQuery(this).find(selector.input);
        },

        observeChanges: function() {
          if('MutationObserver' in window) {
            observer = new MutationObserver(function(mutations) {
              module.debug('DOM tree modified, updating selector cache');
              module.refresh();
            });
            observer.observe(element, {
              childList : true,
              subtree   : true
            });
            module.debug('Setting up mutation observer', observer);
          }
        },

        attachEvents: function(selector, event) {
          var
            jQuerytoggle = jQuery(selector)
          ;
          event = jQuery.isFunction(module[event])
            ? module[event]
            : module.toggle
          ;
          if(jQuerytoggle.size() > 0) {
            module.debug('Attaching checkbox events to element', selector, event);
            jQuerytoggle
              .on('click' + eventNamespace, event)
            ;
          }
          else {
            module.error(error.notFound);
          }
        },

        event: {
          keydown: function(event) {
            var
              key     = event.which,
              keyCode = {
                enter  : 13,
                escape : 27
              }
            ;
            if( key == keyCode.escape) {
              module.verbose('Escape key pressed blurring field');
              jQuerymodule
                .blur()
              ;
            }
            if(!event.ctrlKey && key == keyCode.enter) {
              module.verbose('Enter key pressed, toggling checkbox');
              jQuery.proxy(module.toggle, this)();
              event.preventDefault();
            }
          }
        },

        is: {
          radio: function() {
            return jQuerymodule.hasClass(className.radio);
          },
          checked: function() {
            return jQueryinput.prop('checked') !== undefined && jQueryinput.prop('checked');
          },
          unchecked: function() {
            return !module.is.checked();
          }
        },

        can: {
          change: function() {
            return !( jQuerymodule.hasClass(className.disabled) || jQuerymodule.hasClass(className.readOnly) || jQueryinput.prop('disabled') );
          },
          uncheck: function() {
            return (typeof settings.uncheckable === 'boolean')
              ? settings.uncheckable
              : !module.is.radio()
            ;
          }
        },

        set: {
          checked: function() {
            jQuerymodule.addClass(className.checked);
          },
          tab: function() {
            if( jQueryinput.attr('tabindex') === undefined) {
              jQueryinput
                .attr('tabindex', 0)
              ;
            }
          }
        },

        remove: {
          checked: function() {
            jQuerymodule.removeClass(className.checked);
          }
        },

        enable: function() {
          module.debug('Enabling checkbox functionality');
          jQuerymodule.removeClass(className.disabled);
          jQueryinput.prop('disabled', false);
          jQuery.proxy(settings.onEnabled, jQueryinput.get())();
        },

        disable: function() {
          module.debug('Disabling checkbox functionality');
          jQuerymodule.addClass(className.disabled);
          jQueryinput.prop('disabled', 'disabled');
          jQuery.proxy(settings.onDisabled, jQueryinput.get())();
        },

        check: function() {
          module.debug('Enabling checkbox', jQueryinput);
          jQueryinput
            .prop('checked', true)
            .trigger('change')
          ;
          module.set.checked();
          jQuery.proxy(settings.onChange, jQueryinput.get())();
          jQuery.proxy(settings.onChecked, jQueryinput.get())();
        },

        uncheck: function() {
          module.debug('Disabling checkbox');
          jQueryinput
            .prop('checked', false)
            .trigger('change')
          ;
          module.remove.checked();
          jQuery.proxy(settings.onChange, jQueryinput.get())();
          jQuery.proxy(settings.onUnchecked, jQueryinput.get())();
        },

        toggle: function(event) {
          if( !module.can.change() ) {
            console.log(module.can.change());
            module.debug('Checkbox is read-only or disabled, ignoring toggle');
            return;
          }
          module.verbose('Determining new checkbox state');
          if( module.is.unchecked() ) {
            module.check();
          }
          else if( module.is.checked() && module.can.uncheck() ) {
            module.uncheck();
          }
        },
        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            jQuery.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                jQuery.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            jQuery.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( jQuery.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if(jQuery.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

jQuery.fn.checkbox.settings = {

  name        : 'Checkbox',
  namespace   : 'checkbox',

  debug       : false,
  verbose     : true,
  performance : true,

  // delegated event context
  uncheckable : 'auto',
  fireOnInit  : true,

  onChange    : function(){},
  onChecked   : function(){},
  onUnchecked : function(){},
  onEnabled   : function(){},
  onDisabled  : function(){},

  className   : {
    checked  : 'checked',
    disabled : 'disabled',
    radio    : 'radio',
    readOnly : 'read-only'
  },

  error     : {
    method   : 'The method you called is not defined.'
  },

  selector : {
    input  : 'input[type=checkbox], input[type=radio]',
    label  : 'label'
  }

};

})( jQuery, window , document );

/*
 * # Semantic - Colorize
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( jQuery, window, document, undefined ) {

  "use strict";

  jQuery.fn.colorize = function(parameters) {
    var
      settings        = jQuery.extend(true, {}, jQuery.fn.colorize.settings, parameters),
      // hoist arguments
      moduleArguments = arguments || false
    ;
    jQuery(this)
      .each(function(instanceIndex) {

        var
          jQuerymodule         = jQuery(this),

          mainCanvas      = jQuery('<canvas />')[0],
          imageCanvas     = jQuery('<canvas />')[0],
          overlayCanvas   = jQuery('<canvas />')[0],

          backgroundImage = new Image(),

          // defs
          mainContext,
          imageContext,
          overlayContext,

          image,
          imageName,

          width,
          height,

          // shortucts
          colors    = settings.colors,
          paths     = settings.paths,
          namespace = settings.namespace,
          error     = settings.error,

          // boilerplate
          instance   = jQuerymodule.data('module-' + namespace),
          module
        ;

        module = {

          checkPreconditions: function() {
            module.debug('Checking pre-conditions');

            if( !jQuery.isPlainObject(colors) || jQuery.isEmptyObject(colors) ) {
              module.error(error.undefinedColors);
              return false;
            }
            return true;
          },

          async: function(callback) {
            if(settings.async) {
              setTimeout(callback, 0);
            }
            else {
              callback();
            }
          },

          getMetadata: function() {
            module.debug('Grabbing metadata');
            image     = jQuerymodule.data('image') || settings.image || undefined;
            imageName = jQuerymodule.data('name')  || settings.name  || instanceIndex;
            width     = settings.width        || jQuerymodule.width();
            height    = settings.height       || jQuerymodule.height();
            if(width === 0 || height === 0) {
              module.error(error.undefinedSize);
            }
          },

          initialize: function() {
            module.debug('Initializing with colors', colors);
            if( module.checkPreconditions() ) {

              module.async(function() {
                module.getMetadata();
                module.canvas.create();

                module.draw.image(function() {
                  module.draw.colors();
                  module.canvas.merge();
                });
                jQuerymodule
                  .data('module-' + namespace, module)
                ;
              });
            }
          },

          redraw: function() {
            module.debug('Redrawing image');
            module.async(function() {
              module.canvas.clear();
              module.draw.colors();
              module.canvas.merge();
            });
          },

          change: {
            color: function(colorName, color) {
              module.debug('Changing color', colorName);
              if(colors[colorName] === undefined) {
                module.error(error.missingColor);
                return false;
              }
              colors[colorName] = color;
              module.redraw();
            }
          },

          canvas: {
            create: function() {
              module.debug('Creating canvases');

              mainCanvas.width     = width;
              mainCanvas.height    = height;
              imageCanvas.width    = width;
              imageCanvas.height   = height;
              overlayCanvas.width  = width;
              overlayCanvas.height = height;

              mainContext    = mainCanvas.getContext('2d');
              imageContext   = imageCanvas.getContext('2d');
              overlayContext = overlayCanvas.getContext('2d');

              jQuerymodule
                .append( mainCanvas )
              ;
              mainContext    = jQuerymodule.children('canvas')[0].getContext('2d');
            },
            clear: function(context) {
              module.debug('Clearing canvas');
              overlayContext.fillStyle = '#FFFFFF';
              overlayContext.fillRect(0, 0, width, height);
            },
            merge: function() {
              if( !jQuery.isFunction(mainContext.blendOnto) ) {
                module.error(error.missingPlugin);
                return;
              }
              mainContext.putImageData( imageContext.getImageData(0, 0, width, height), 0, 0);
              overlayContext.blendOnto(mainContext, 'multiply');
            }
          },

          draw: {

            image: function(callback) {
              module.debug('Drawing image');
              callback = callback || function(){};
              if(image) {
                backgroundImage.src    = image;
                backgroundImage.onload = function() {
                  imageContext.drawImage(backgroundImage, 0, 0);
                  callback();
                };
              }
              else {
                module.error(error.noImage);
                callback();
              }
            },

            colors: function() {
              module.debug('Drawing color overlays', colors);
              jQuery.each(colors, function(colorName, color) {
                settings.onDraw(overlayContext, imageName, colorName, color);
              });
            }

          },

          debug: function(message, variableName) {
            if(settings.debug) {
              if(variableName !== undefined) {
                console.info(settings.name + ': ' + message, variableName);
              }
              else {
                console.info(settings.name + ': ' + message);
              }
            }
          },
          error: function(errorMessage) {
            console.warn(settings.name + ': ' + errorMessage);
          },
          invoke: function(methodName, context, methodArguments) {
            var
              method
            ;
            methodArguments = methodArguments || Array.prototype.slice.call( arguments, 2 );

            if(typeof methodName == 'string' && instance !== undefined) {
              methodName = methodName.split('.');
              jQuery.each(methodName, function(index, name) {
                if( jQuery.isPlainObject( instance[name] ) ) {
                  instance = instance[name];
                  return true;
                }
                else if( jQuery.isFunction( instance[name] ) ) {
                  method = instance[name];
                  return true;
                }
                module.error(settings.error.method);
                return false;
              });
            }
            return ( jQuery.isFunction( method ) )
              ? method.apply(context, methodArguments)
              : false
            ;
          }

        };
        if(instance !== undefined && moduleArguments) {
          // simpler than invoke realizing to invoke itself (and losing scope due prototype.call()
          if(moduleArguments[0] == 'invoke') {
            moduleArguments = Array.prototype.slice.call( moduleArguments, 1 );
          }
          return module.invoke(moduleArguments[0], this, Array.prototype.slice.call( moduleArguments, 1 ) );
        }
        // initializing
        module.initialize();
      })
    ;
    return this;
  };

  jQuery.fn.colorize.settings = {
    name      : 'Image Colorizer',
    debug     : true,
    namespace : 'colorize',

    onDraw    : function(overlayContext, imageName, colorName, color) {},

    // whether to block execution while updating canvas
    async     : true,
    // object containing names and default values of color regions
    colors    : {},

    metadata: {
      image : 'image',
      name  : 'name'
    },

    error: {
      noImage         : 'No tracing image specified',
      undefinedColors : 'No default colors specified.',
      missingColor    : 'Attempted to change color that does not exist',
      missingPlugin   : 'Blend onto plug-in must be included',
      undefinedHeight : 'The width or height of image canvas could not be automatically determined. Please specify a height.'
    }

  };

})( jQuery, window , document );

/*
 * # Semantic - Dimmer
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( jQuery, window, document, undefined ) {

jQuery.fn.dimmer = function(parameters) {
  var
    jQueryallModules     = jQuery(this),

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    returnedValue
  ;

  jQueryallModules
    .each(function() {
      var
        settings        = ( jQuery.isPlainObject(parameters) )
          ? jQuery.extend(true, {}, jQuery.fn.dimmer.settings, parameters)
          : jQuery.extend({}, jQuery.fn.dimmer.settings),

        selector        = settings.selector,
        namespace       = settings.namespace,
        className       = settings.className,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,
        moduleSelector  = jQueryallModules.selector || '',

        clickEvent      = ('ontouchstart' in document.documentElement)
          ? 'touchstart'
          : 'click',

        jQuerymodule = jQuery(this),
        jQuerydimmer,
        jQuerydimmable,

        element   = this,
        instance  = jQuerymodule.data(moduleNamespace),
        module
      ;

      module = {

        preinitialize: function() {
          if( module.is.dimmer() ) {
            jQuerydimmable = jQuerymodule.parent();
            jQuerydimmer   = jQuerymodule;
          }
          else {
            jQuerydimmable = jQuerymodule;
            if( module.has.dimmer() ) {
              if(settings.dimmerName) {
                jQuerydimmer = jQuerydimmable.children(selector.dimmer).filter('.' + settings.dimmerName);
              }
              else {
                jQuerydimmer = jQuerydimmable.children(selector.dimmer);
              }
            }
            else {
              jQuerydimmer = module.create();
            }
          }
        },

        initialize: function() {
          module.debug('Initializing dimmer', settings);
          if(settings.on == 'hover') {
            jQuerydimmable
              .on('mouseenter' + eventNamespace, module.show)
              .on('mouseleave' + eventNamespace, module.hide)
            ;
          }
          else if(settings.on == 'click') {
            jQuerydimmable
              .on(clickEvent + eventNamespace, module.toggle)
            ;
          }
          if( module.is.page() ) {
            module.debug('Setting as a page dimmer', jQuerydimmable);
            module.set.pageDimmer();
          }

          if( module.is.closable() ) {
            module.verbose('Adding dimmer close event', jQuerydimmer);
            jQuerydimmer
              .on(clickEvent + eventNamespace, module.event.click)
            ;
          }
          module.set.dimmable();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          jQuerymodule
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module', jQuerydimmer);
          jQuerymodule
            .removeData(moduleNamespace)
          ;
          jQuerydimmable
            .off(eventNamespace)
          ;
          jQuerydimmer
            .off(eventNamespace)
          ;
        },

        event: {
          click: function(event) {
            module.verbose('Determining if event occured on dimmer', event);
            if( jQuerydimmer.find(event.target).size() === 0 || jQuery(event.target).is(selector.content) ) {
              module.hide();
              event.stopImmediatePropagation();
            }
          }
        },

        addContent: function(element) {
          var
            jQuerycontent = jQuery(element)
          ;
          module.debug('Add content to dimmer', jQuerycontent);
          if(jQuerycontent.parent()[0] !== jQuerydimmer[0]) {
            jQuerycontent.detach().appendTo(jQuerydimmer);
          }
        },

        create: function() {
          var
            jQueryelement = jQuery( settings.template.dimmer() )
          ;
          if(settings.variation) {
            module.debug('Creating dimmer with variation', settings.variation);
            jQueryelement.addClass(className.variation);
          }
          if(settings.dimmerName) {
            module.debug('Creating named dimmer', settings.dimmerName);
            jQueryelement.addClass(settings.dimmerName);
          }
          jQueryelement
            .appendTo(jQuerydimmable)
          ;
          return jQueryelement;
        },

        show: function(callback) {
          callback = jQuery.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.debug('Showing dimmer', jQuerydimmer, settings);
          if( (!module.is.dimmed() || module.is.animating()) && module.is.enabled() ) {
            module.animate.show(callback);
            jQuery.proxy(settings.onShow, element)();
            jQuery.proxy(settings.onChange, element)();
          }
          else {
            module.debug('Dimmer is already shown or disabled');
          }
        },

        hide: function(callback) {
          callback = jQuery.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( module.is.dimmed() || module.is.animating() ) {
            module.debug('Hiding dimmer', jQuerydimmer);
            module.animate.hide(callback);
            jQuery.proxy(settings.onHide, element)();
            jQuery.proxy(settings.onChange, element)();
          }
          else {
            module.debug('Dimmer is not visible');
          }
        },

        toggle: function() {
          module.verbose('Toggling dimmer visibility', jQuerydimmer);
          if( !module.is.dimmed() ) {
            module.show();
          }
          else {
            module.hide();
          }
        },

        animate: {
          show: function(callback) {
            callback = jQuery.isFunction(callback)
              ? callback
              : function(){}
            ;
            if(settings.useCSS && jQuery.fn.transition !== undefined && jQuerydimmer.transition('is supported')) {
              jQuerydimmer
                .transition({
                  animation : settings.transition + ' in',
                  queue       : false,
                  duration  : module.get.duration(),
                  onStart   : function() {
                    module.set.dimmed();
                  },
                  onComplete : function() {
                    module.set.active();
                    callback();
                  }
                })
              ;
            }
            else {
              module.verbose('Showing dimmer animation with javascript');
              module.set.dimmed();
              jQuerydimmer
                .stop()
                .css({
                  opacity : 0,
                  width   : '100%',
                  height  : '100%'
                })
                .fadeTo(module.get.duration(), 1, function() {
                  jQuerydimmer.removeAttr('style');
                  module.set.active();
                  callback();
                })
              ;
            }
          },
          hide: function(callback) {
            callback = jQuery.isFunction(callback)
              ? callback
              : function(){}
            ;
            if(settings.useCSS && jQuery.fn.transition !== undefined && jQuerydimmer.transition('is supported')) {
              module.verbose('Hiding dimmer with css');
              jQuerydimmer
                .transition({
                  animation  : settings.transition + ' out',
                  queue      : false,
                  duration   : module.get.duration(),
                  onStart    : function() {
                    module.remove.dimmed();
                  },
                  onComplete : function() {
                    module.remove.active();
                    callback();
                  }
                })
              ;
            }
            else {
              module.verbose('Hiding dimmer with javascript');
              module.remove.dimmed();
              jQuerydimmer
                .stop()
                .fadeOut(module.get.duration(), function() {
                  module.remove.active();
                  jQuerydimmer.removeAttr('style');
                  callback();
                })
              ;
            }
          }
        },

        get: {
          dimmer: function() {
            return jQuerydimmer;
          },
          duration: function() {
            if(typeof settings.duration == 'object') {
              if( module.is.active() ) {
                return settings.duration.hide;
              }
              else {
                return settings.duration.show;
              }
            }
            return settings.duration;
          }
        },

        has: {
          dimmer: function() {
            if(settings.dimmerName) {
              return (jQuerymodule.children(selector.dimmer).filter('.' + settings.dimmerName).size() > 0);
            }
            else {
              return ( jQuerymodule.children(selector.dimmer).size() > 0 );
            }
          }
        },

        is: {
          active: function() {
            return jQuerydimmer.hasClass(className.active);
          },
          animating: function() {
            return ( jQuerydimmer.is(':animated') || jQuerydimmer.hasClass(className.animating) );
          },
          closable: function() {
            if(settings.closable == 'auto') {
              if(settings.on == 'hover') {
                return false;
              }
              return true;
            }
            return settings.closable;
          },
          dimmer: function() {
            return jQuerymodule.is(selector.dimmer);
          },
          dimmable: function() {
            return jQuerymodule.is(selector.dimmable);
          },
          dimmed: function() {
            return jQuerydimmable.hasClass(className.dimmed);
          },
          disabled: function() {
            return jQuerydimmable.hasClass(className.disabled);
          },
          enabled: function() {
            return !module.is.disabled();
          },
          page: function () {
            return jQuerydimmable.is('body');
          },
          pageDimmer: function() {
            return jQuerydimmer.hasClass(className.pageDimmer);
          }
        },

        can: {
          show: function() {
            return !jQuerydimmer.hasClass(className.disabled);
          }
        },

        set: {
          active: function() {
            jQuerydimmer.addClass(className.active);
          },
          dimmable: function() {
            jQuerydimmable.addClass(className.dimmable);
          },
          dimmed: function() {
            jQuerydimmable.addClass(className.dimmed);
          },
          pageDimmer: function() {
            jQuerydimmer.addClass(className.pageDimmer);
          },
          disabled: function() {
            jQuerydimmer.addClass(className.disabled);
          }
        },

        remove: {
          active: function() {
            jQuerydimmer
              .removeClass(className.active)
            ;
          },
          dimmed: function() {
            jQuerydimmable.removeClass(className.dimmed);
          },
          disabled: function() {
            jQuerydimmer.removeClass(className.disabled);
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            jQuery.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if(jQueryallModules.size() > 1) {
              title += ' ' + '(' + jQueryallModules.size() + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                jQuery.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            jQuery.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( jQuery.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if(jQuery.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      module.preinitialize();

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

jQuery.fn.dimmer.settings = {

  name        : 'Dimmer',
  namespace   : 'dimmer',

  debug       : false,
  verbose     : true,
  performance : true,

  dimmerName  : false,
  variation   : false,
  closable    : 'auto',
  transition  : 'fade',
  useCSS      : true,
  on          : false,

  duration    : {
    show : 500,
    hide : 500
  },

  onChange    : function(){},
  onShow      : function(){},
  onHide      : function(){},

  error   : {
    method   : 'The method you called is not defined.'
  },

  selector: {
    dimmable : '.dimmable',
    dimmer   : '.ui.dimmer',
    content  : '.ui.dimmer > .content, .ui.dimmer > .content > .center'
  },

  template: {
    dimmer: function() {
     return jQuery('<div />').attr('class', 'ui dimmer');
    }
  },

  className : {
    active     : 'active',
    animating  : 'animating',
    dimmable   : 'dimmable',
    dimmed     : 'dimmed',
    disabled   : 'disabled',
    hide       : 'hide',
    pageDimmer : 'page',
    show       : 'show'
  }

};

})( jQuery, window , document );
/*
 * # Semantic - Dropdown
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( jQuery, window, document, undefined ) {

"use strict";

jQuery.fn.dropdown = function(parameters) {
  var
    jQueryallModules    = jQuery(this),
    jQuerydocument      = jQuery(document),

    moduleSelector = jQueryallModules.selector || '',

    hasTouch       = ('ontouchstart' in document.documentElement),
    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),
    returnedValue
  ;

  jQueryallModules
    .each(function() {
      var
        settings          = ( jQuery.isPlainObject(parameters) )
          ? jQuery.extend(true, {}, jQuery.fn.dropdown.settings, parameters)
          : jQuery.extend({}, jQuery.fn.dropdown.settings),

        className       = settings.className,
        metadata        = settings.metadata,
        namespace       = settings.namespace,
        selector        = settings.selector,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        jQuerymodule         = jQuery(this),
        jQuerytext           = jQuerymodule.find(selector.text),
        jQuerysearch         = jQuerymodule.find(selector.search),
        jQueryinput          = jQuerymodule.find(selector.input),

        jQuerycombo = (jQuerymodule.prev().find(selector.text).size() > 0)
          ? jQuerymodule.prev().find(selector.text)
          : jQuerymodule.prev(),

        jQuerymenu           = jQuerymodule.children(selector.menu),
        jQueryitem           = jQuerymenu.find(selector.item),

        activated       = false,
        itemActivated   = false,

        element         = this,
        instance        = jQuerymodule.data(moduleNamespace),
        observer,
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing dropdown', settings);
          module.setup.layout();
          module.save.defaults();
          module.set.selected();

          if(hasTouch) {
            module.bind.touchEvents();
          }
          module.bind.mouseEvents();
          module.bind.keyboardEvents();

          module.observeChanges();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of dropdown', module);
          instance = module;
          jQuerymodule
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous dropdown for', jQuerymodule);
          module.remove.tabbable();
          jQuerymodule
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        observeChanges: function() {
          if('MutationObserver' in window) {
            observer = new MutationObserver(function(mutations) {
              module.debug('DOM tree modified, updating selector cache');
              module.refresh();
            });
            observer.observe(element, {
              childList : true,
              subtree   : true
            });
            module.debug('Setting up mutation observer', observer);
          }
        },

        setup: {

          layout: function() {
            if( jQuerymodule.is('select') ) {
              module.setup.select();
            }
            if( module.is.search() && !module.is.searchable() ) {
              jQuerysearch = jQuery('<input />')
                .addClass(className.search)
                .insertBefore(jQuerytext)
              ;
            }
            if(settings.allowTab) {
              module.set.tabbable();
            }
          },
          select: function() {
            var
              selectValues = module.get.selectValues()
            ;
            module.debug('Dropdown initialized on a select', selectValues);
            // see if select exists inside a dropdown
            jQueryinput = jQuerymodule;
            if(jQueryinput.parents(selector.dropdown).size() > 0) {
              module.debug('Creating dropdown menu only from template');
              jQuerymodule = jQueryinput.closest(selector.dropdown);
              if(jQuerymodule.find('.' + className.dropdown).size() === 0) {
                jQuery('<div />')
                  .addClass(className.menu)
                  .html( settings.templates.menu( selectValues ))
                  .appendTo(jQuerymodule)
                ;
              }
            }
            else {
              module.debug('Creating entire dropdown from template');
              jQuerymodule = jQuery('<div />')
                .attr('class', jQueryinput.attr('class') )
                .addClass(className.selection)
                .addClass(className.dropdown)
                .html( settings.templates.dropdown(selectValues) )
                .insertBefore(jQueryinput)
              ;
              jQueryinput
                .removeAttr('class')
                .prependTo(jQuerymodule)
              ;
            }
            module.refresh();
          }
        },

        refresh: function() {
          jQuerytext   = jQuerymodule.find(selector.text);
          jQuerysearch = jQuerymodule.find(selector.search);
          jQueryinput  = jQuerymodule.find(selector.input);
          jQuerymenu   = jQuerymodule.children(selector.menu);
          jQueryitem   = jQuerymenu.find(selector.item);
        },

        toggle: function() {
          module.verbose('Toggling menu visibility');
          if( !module.is.active() ) {
            module.show();
          }
          else {
            module.hide();
          }
        },

        show: function() {
          module.debug('Checking if dropdown can show');
          if( !module.is.active() ) {
            module.animate.show(function() {
              if( module.can.click() ) {
                module.bind.intent();
              }
              module.set.visible();
            });
            jQuery.proxy(settings.onShow, element)();
          }
        },

        hide: function() {
          if( module.is.active() ) {
            module.debug('Hiding dropdown');
            module.animate.hide(function() {
              module.remove.visible();
            });
            jQuery.proxy(settings.onHide, element)();
          }
        },

        hideOthers: function() {
          module.verbose('Finding other dropdowns to hide');
          jQueryallModules
            .not(jQuerymodule)
              .has(selector.menu + ':visible:not(.' + className.animating + ')')
                .dropdown('hide')
          ;
        },

        hideSubMenus: function() {
          var
            jQuerysubMenus = jQuerymenu.find(selector.menu),
            jQueryactiveSubMenu = jQuerysubMenus.has(selector.item + '.' + className.active)
          ;
          jQuerysubMenus
            .not(jQueryactiveSubMenu)
              .removeClass(className.visible)
              .removeAttr('style')
          ;
        },

        bind: {
          keyboardEvents: function() {
            module.debug('Binding keyboard events');
            jQuerymodule
              .on('keydown' + eventNamespace, module.event.keydown)
            ;
            if( module.is.searchable() ) {
              jQuerymodule
                .on(module.get.inputEvent(), selector.search, module.event.input)
              ;
            }
          },
          touchEvents: function() {
            module.debug('Touch device detected binding additional touch events');
            if( module.is.searchSelection() ) {
              // do nothing special yet
            }
            else {
              jQuerymodule
                .on('touchstart' + eventNamespace, module.event.test.toggle)
              ;
            }
            jQuerymenu
              .on('touchstart' + eventNamespace, selector.item, module.event.item.mouseenter)
            ;
          },
          mouseEvents: function() {
            module.verbose('Mouse detected binding mouse events');
            if( module.is.searchSelection() ) {
              jQuerymodule
                .on('mousedown' + eventNamespace, selector.menu, module.event.menu.activate)
                .on('mouseup'   + eventNamespace, selector.menu, module.event.menu.deactivate)
                .on('focus'     + eventNamespace, selector.search, module.event.searchFocus)
                .on('click'     + eventNamespace, selector.search, module.show)
                .on('blur'      + eventNamespace, selector.search, module.event.searchBlur)
              ;
            }
            else {
              if(settings.on == 'click') {
                jQuerymodule
                  .on('click' + eventNamespace, module.event.test.toggle)
                ;
              }
              else if(settings.on == 'hover') {
                jQuerymodule
                  .on('mouseenter' + eventNamespace, module.delay.show)
                  .on('mouseleave' + eventNamespace, module.delay.hide)
                ;
              }
              else {
                jQuerymodule
                  .on(settings.on + eventNamespace, module.toggle)
                ;
              }
              jQuerymodule
                .on('mousedown' + eventNamespace, module.event.mousedown)
                .on('mouseup'   + eventNamespace, module.event.mouseup)
                .on('focus'     + eventNamespace, module.event.focus)
                .on('blur'      + eventNamespace, module.event.blur)
              ;
            }
            jQuerymenu
              .on('mouseenter' + eventNamespace, selector.item, module.event.item.mouseenter)
              .on('mouseleave' + eventNamespace, selector.item, module.event.item.mouseleave)
              .on('click'      + eventNamespace, selector.item, module.event.item.click)
            ;
          },
          intent: function() {
            module.verbose('Binding hide intent event to document');
            if(hasTouch) {
              jQuerydocument
                .on('touchstart' + eventNamespace, module.event.test.touch)
                .on('touchmove'  + eventNamespace, module.event.test.touch)
              ;
            }
            jQuerydocument
              .on('click' + eventNamespace, module.event.test.hide)
            ;
          }
        },

        unbind: {
          intent: function() {
            module.verbose('Removing hide intent event from document');
            if(hasTouch) {
              jQuerydocument
                .off('touchstart' + eventNamespace)
                .off('touchmove' + eventNamespace)
              ;
            }
            jQuerydocument
              .off('click' + eventNamespace)
            ;
          }
        },

        filter: function(searchTerm) {
          var
            jQueryresults       = jQuery(),
            exactRegExp    = new RegExp('(?:\s|^)' + searchTerm, 'i'),
            fullTextRegExp = new RegExp(searchTerm, 'i'),
            allItemsFiltered,
            jQueryfilteredItems
          ;
          jQueryitem
            .each(function(){
              var
                jQuerychoice = jQuery(this),
                text    = ( jQuerychoice.data(metadata.text) !== undefined )
                  ? jQuerychoice.data(metadata.text)
                  : (settings.preserveHTML)
                    ? jQuerychoice.html()
                    : jQuerychoice.text(),
                value   = ( jQuerychoice.data(metadata.value) !== undefined)
                  ? jQuerychoice.data(metadata.value)
                  : (typeof text === 'string')
                      ? text.toLowerCase()
                      : text
              ;
              if( exactRegExp.test( text ) || exactRegExp.test( value ) ) {
                jQueryresults = jQueryresults.add(jQuerychoice);
              }
              else if(settings.fullTextSearch) {
                if( fullTextRegExp.test( text ) || fullTextRegExp.test( value ) ) {
                  jQueryresults = jQueryresults.add(jQuerychoice);
                }
              }
            })
          ;
          jQueryfilteredItems   = jQueryitem.not(jQueryresults);
          allItemsFiltered = (jQueryfilteredItems.size() == jQueryitem.size());

          module.remove.filteredItem();
          module.remove.selectedItem();
          jQueryfilteredItems
            .addClass(className.filtered)
          ;
          jQueryitem
            .not('.' + className.filtered)
              .eq(0)
              .addClass(className.selected)
          ;
          if(allItemsFiltered) {
            module.hide();
          }
        },

        focusSearch: function() {
          if( module.is.search() ) {
            jQuerysearch
              .focus()
            ;
          }
        },

        event: {
          // prevents focus callback from occuring on mousedown
          mousedown: function() {
            activated = true;
          },
          mouseup: function() {
            activated = false;
          },
          focus: function() {
            if(!activated && module.is.hidden()) {
              module.show();
            }
          },
          blur: function(event) {
            if(!activated) {
              module.hide();
            }
          },
          searchFocus: function() {
            activated = true;
            module.show();
          },
          searchBlur: function(event) {
            if(!itemActivated) {
              module.hide();
            }
          },
          input: function(event) {
            var
              query = jQuerysearch.val()
            ;
            if(module.is.searchSelection()) {
              if( module.can.show() ) {
                module.show();
              }
              module.set.filtered();
            }
            module.filter(query);
          },
          keydown: function(event) {
            var
              jQueryselectedItem = jQueryitem.not(className.filtered).filter('.' + className.selected).eq(0),
              jQueryvisibleItems = jQueryitem.not('.' + className.filtered),
              pressedKey    = event.which,
              keys          = {
                enter     : 13,
                escape    : 27,
                upArrow   : 38,
                downArrow : 40
              },
              selectedClass   = className.selected,
              currentIndex    = jQueryvisibleItems.index( jQueryselectedItem ),
              hasSelectedItem = (jQueryselectedItem.size() > 0),
              jQuerynextItem,
              newIndex
            ;
            // default to activated choice if no selection present
            if(!hasSelectedItem) {
              jQueryselectedItem   = jQueryitem.filter('.' + className.active).eq(0);
              hasSelectedItem = (jQueryselectedItem.size() > 0);
            }
            // close shortcuts
            if(pressedKey == keys.escape) {
              module.verbose('Escape key pressed, closing dropdown');
              module.hide();
            }
            // result shortcuts
            if(module.is.visible()) {
              if(pressedKey == keys.enter && hasSelectedItem) {
                module.verbose('Enter key pressed, choosing selected item');
                jQuery.proxy(module.event.item.click, jQueryselectedItem)(event);
                event.preventDefault();
                return false;
              }
              else if(pressedKey == keys.upArrow) {
                if(!hasSelectedItem) {
                  jQuerynextItem = jQueryvisibleItems.eq(0);
                }
                else {
                  jQuerynextItem = jQueryselectedItem.prevAll(selector.item + ':not(.' + className.filtered + ')').eq(0);
                }
                if(currentIndex !== 0) {
                  module.verbose('Up key pressed, changing active item');
                  jQueryitem
                    .removeClass(selectedClass)
                  ;
                  jQuerynextItem
                    .addClass(selectedClass)
                  ;
                  module.set.scrollPosition(jQuerynextItem);
                }
                event.preventDefault();
              }
              else if(pressedKey == keys.downArrow) {
                if(!hasSelectedItem) {
                  jQuerynextItem = jQueryvisibleItems.eq(0);
                }
                else {
                  jQuerynextItem = jQueryselectedItem.nextAll(selector.item + ':not(.' + className.filtered + ')').eq(0);
                }
                if(currentIndex + 1 < jQueryvisibleItems.size() ) {
                  module.verbose('Down key pressed, changing active item');
                  jQueryitem
                    .removeClass(selectedClass)
                  ;
                  jQuerynextItem
                    .addClass(selectedClass)
                  ;
                  module.set.scrollPosition(jQuerynextItem);
                }
                event.preventDefault();
              }
            }
            else {
              if(pressedKey == keys.enter) {
                module.show();
              }
            }
          },
          test: {
            toggle: function(event) {
              if( module.determine.eventInMenu(event, module.toggle) ) {
                event.preventDefault();
              }
            },
            touch: function(event) {
              module.determine.eventInMenu(event, function() {
                if(event.type == 'touchstart') {
                  module.timer = setTimeout(module.hide, settings.delay.touch);
                }
                else if(event.type == 'touchmove') {
                  clearTimeout(module.timer);
                }
              });
              event.stopPropagation();
            },
            hide: function(event) {
              module.determine.eventInModule(event, module.hide);
            }
          },

          menu: {
            activate: function() {
              itemActivated = true;
            },
            deactivate: function() {
              itemActivated = false;
            }
          },
          item: {
            mouseenter: function(event) {
              var
                jQuerycurrentMenu = jQuery(this).find(selector.menu),
                jQueryotherMenus  = jQuery(this).siblings(selector.item).children(selector.menu)
              ;
              if( jQuerycurrentMenu.size() > 0 ) {
                clearTimeout(module.itemTimer);
                module.itemTimer = setTimeout(function() {
                  module.animate.hide(false, jQueryotherMenus);
                  module.verbose('Showing sub-menu', jQuerycurrentMenu);
                  module.animate.show(false,  jQuerycurrentMenu);
                }, settings.delay.show * 2);
                event.preventDefault();
              }
            },

            mouseleave: function(event) {
              var
                jQuerycurrentMenu = jQuery(this).find(selector.menu)
              ;
              if(jQuerycurrentMenu.size() > 0) {
                clearTimeout(module.itemTimer);
                module.itemTimer = setTimeout(function() {
                  module.verbose('Hiding sub-menu', jQuerycurrentMenu);
                  module.animate.hide(false,  jQuerycurrentMenu);
                }, settings.delay.hide);
              }
            },

            click: function (event) {
              var
                jQuerychoice = jQuery(this),
                text    = ( jQuerychoice.data(metadata.text) !== undefined )
                  ? jQuerychoice.data(metadata.text)
                  : (settings.preserveHTML)
                    ? jQuerychoice.html()
                    : jQuerychoice.text(),
                value   = ( jQuerychoice.data(metadata.value) !== undefined)
                  ? jQuerychoice.data(metadata.value)
                  : (typeof text === 'string')
                      ? text.toLowerCase()
                      : text,
                callback = function() {
                  module.remove.searchTerm();
                  module.remove.filteredItem();
                  module.determine.selectAction(text, value);
                  jQuery.proxy(settings.onChange, element)(value, text, jQuerychoice);
                },
                openingSubMenu = (jQuerychoice.find(selector.menu).size() > 0)
              ;
              if( !openingSubMenu ) {
                callback();
              }
            }

          },

          resetStyle: function() {
            jQuery(this).removeAttr('style');
          }

        },

        determine: {
          selectAction: function(text, value) {
            module.verbose('Determining action', settings.action);
            if( jQuery.isFunction( module.action[settings.action] ) ) {
              module.verbose('Triggering preset action', settings.action, text, value);
              module.action[ settings.action ](text, value);
            }
            else if( jQuery.isFunction(settings.action) ) {
              module.verbose('Triggering user action', settings.action, text, value);
              settings.action(text, value);
            }
            else {
              module.error(error.action, settings.action);
            }
          },
          eventInModule: function(event, callback) {
            callback = callback || function(){};
            if( jQuery(event.target).closest(jQuerymodule).size() === 0 ) {
              module.verbose('Triggering event', callback);
              callback();
              return true;
            }
            else {
              module.verbose('Event occurred in dropdown, canceling callback');
              return false;
            }
          },
          eventInMenu: function(event, callback) {
            callback = callback || function(){};
            if( jQuery(event.target).closest(jQuerymenu).size() === 0 ) {
              module.verbose('Triggering event', callback);
              callback();
              return true;
            }
            else {
              module.verbose('Event occurred in dropdown menu, canceling callback');
              return false;
            }
          }
        },

        action: {

          nothing: function() {},

          hide: function() {
            module.hide();
          },

          select: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value);
            module.set.value(value);
            module.hide();
          },

          activate: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value);
            module.set.value(value);
            module.hide();
          },

          combo: function(text, value) {
            value = (value !== undefined)
              ? value
              : text
            ;
            module.set.selected(value);
            module.set.value(value);
            module.hide();
          }

        },

        get: {
          text: function() {
            return jQuerytext.text();
          },
          value: function() {
            return (jQueryinput.size() > 0)
              ? jQueryinput.val()
              : jQuerymodule.data(metadata.value)
            ;
          },
          inputEvent: function() {
            var
              input = jQuerysearch[0]
            ;
            if(input) {
              return (input.oninput !== undefined)
                ? 'input'
                : (input.onpropertychange !== undefined)
                  ? 'propertychange'
                  : 'keyup'
              ;
            }
            return false;
          },
          selectValues: function() {
            var
              select = {
                values : {}
              }
            ;
            jQuerymodule
              .find('option')
                .each(function() {
                  var
                    name  = jQuery(this).html(),
                    value = ( jQuery(this).attr('value') !== undefined )
                      ? jQuery(this).attr('value')
                      : name
                  ;
                  if(value === '') {
                    select.placeholder = name;
                  }
                  else {
                    select.values[value] = name;
                  }
                })
            ;
            module.debug('Retrieved values from select', select);
            return select;
          },
          item: function(value, strict) {
            var
              jQueryselectedItem = false
            ;
            value = (value !== undefined)
              ? value
              : ( module.get.value() !== undefined)
                ? module.get.value()
                : module.get.text()
            ;
            strict = (value === '' || value === 0)
              ? true
              : strict || false
            ;
            if(value !== undefined) {
              jQueryitem
                .each(function() {
                  var
                    jQuerychoice       = jQuery(this),
                    optionText    = ( jQuerychoice.data(metadata.text) !== undefined )
                      ? jQuerychoice.data(metadata.text)
                      : (settings.preserveHTML)
                        ? jQuerychoice.html()
                        : jQuerychoice.text(),
                    optionValue   = ( jQuerychoice.data(metadata.value) !== undefined )
                      ? jQuerychoice.data(metadata.value)
                      : (typeof optionText === 'string')
                        ? optionText.toLowerCase()
                        : optionText
                  ;
                  if(strict) {
                    module.verbose('Ambiguous dropdown value using strict type check', jQuerychoice, value);
                    if( optionValue === value ) {
                      jQueryselectedItem = jQuery(this);
                    }
                    else if( !jQueryselectedItem && optionText === value ) {
                      jQueryselectedItem = jQuery(this);
                    }
                  }
                  else {
                    if( optionValue == value ) {
                      module.verbose('Found select item by value', optionValue, value);
                      jQueryselectedItem = jQuery(this);
                    }
                    else if( !jQueryselectedItem && optionText == value ) {
                      module.verbose('Found select item by text', optionText, value);
                      jQueryselectedItem = jQuery(this);
                    }
                  }
                })
              ;
            }
            else {
              value = module.get.text();
            }
            return jQueryselectedItem || false;
          }
        },

        restore: {
          defaults: function() {
            module.restore.defaultText();
            module.restore.defaultValue();
          },
          defaultText: function() {
            var
              defaultText = jQuerymodule.data(metadata.defaultText)
            ;
            module.debug('Restoring default text', defaultText);
            module.set.text(defaultText);
          },
          defaultValue: function() {
            var
              defaultValue = jQuerymodule.data(metadata.defaultValue)
            ;
            if(defaultValue !== undefined) {
              module.debug('Restoring default value', defaultValue);
              module.set.selected(defaultValue);
              module.set.value(defaultValue);
            }
          }
        },

        save: {
          defaults: function() {
            module.save.defaultText();
            module.save.defaultValue();
          },
          defaultValue: function() {
            jQuerymodule.data(metadata.defaultValue, module.get.value() );
          },
          defaultText: function() {
            jQuerymodule.data(metadata.defaultText, jQuerytext.text() );
          }
        },

        set: {
          filtered: function() {
            jQuerytext.addClass(className.filtered);
          },
          tabbable: function() {
            if( module.is.searchable() ) {
              module.debug('Searchable dropdown initialized');
              jQuerysearch
                .val('')
                .attr('tabindex', 0)
              ;
              jQuerymenu
                .attr('tabindex', '-1')
              ;
            }
            else {
              module.debug('Simple selection dropdown initialized');
              if(!jQuerymodule.attr('tabindex') ) {
                jQuerymodule
                  .attr('tabindex', 0)
                ;
                jQuerymenu
                  .attr('tabindex', '-1')
                ;
              }
            }
          },
          scrollPosition: function(jQueryitem) {
            var
              jQueryitem         = jQueryitem || module.get.item(),
              hasActive     = (jQueryitem && jQueryitem.size() > 0),
              edgeTolerance = 5,
              offset,
              itemHeight,
              itemOffset,
              menuOffset,
              menuScroll,
              menuHeight,
              abovePage,
              belowPage
            ;
            if(jQueryitem && hasActive) {
              menuHeight = jQuerymenu.height();
              itemHeight = jQueryitem.height();
              menuScroll = jQuerymenu.scrollTop();
              menuOffset = jQuerymenu.offset().top;
              itemOffset = jQueryitem.offset().top;
              offset     = menuScroll - menuOffset + itemOffset;
              belowPage  = menuScroll + menuHeight < (offset + edgeTolerance);
              abovePage  = ((offset - edgeTolerance) < menuScroll);
              if(abovePage || belowPage) {
                module.debug('Scrolling to active item');
                jQuerymenu
                  .scrollTop(offset)
                ;
              }
            }
          },
          text: function(text) {
            if(settings.action == 'combo') {
              module.debug('Changing combo button text', text, jQuerycombo);
              if(settings.preserveHTML) {
                jQuerycombo.html(text);
              }
              else {
                jQuerycombo.text(text);
              }
            }
            else if(settings.action !== 'select') {
              module.debug('Changing text', text, jQuerytext);
              jQuerytext
                .removeClass(className.filtered)
                .removeClass(className.placeholder)
              ;
              if(settings.preserveHTML) {
                jQuerytext.html(text);
              }
              else {
                jQuerytext.text(text);
              }
            }
          },
          value: function(value) {
            module.debug('Adding selected value to hidden input', value, jQueryinput);
            if(jQueryinput.size() > 0) {
              jQueryinput
                .val(value)
                .trigger('change')
              ;
            }
            else {
              jQuerymodule.data(metadata.value, value);
            }
          },
          active: function() {
            jQuerymodule
              .addClass(className.active)
            ;
          },
          visible: function() {
            jQuerymodule.addClass(className.visible);
          },
          selected: function(value) {
            var
              jQueryselectedItem = module.get.item(value),
              selectedText
            ;
            if(jQueryselectedItem) {
              module.debug('Setting selected menu item to', jQueryselectedItem);
              selectedText = (jQueryselectedItem.data(metadata.text) !== undefined)
                ? jQueryselectedItem.data(metadata.text)
                : (settings.preserveHTML)
                  ? jQueryselectedItem.html()
                  : jQueryselectedItem.text()
              ;
              module.remove.activeItem();
              module.remove.selectedItem();
              jQueryselectedItem
                .addClass(className.active)
                .addClass(className.selected)
              ;
              module.set.text(selectedText);
            }
          }
        },

        remove: {
          active: function() {
            jQuerymodule.removeClass(className.active);
          },
          visible: function() {
            jQuerymodule.removeClass(className.visible);
          },
          activeItem: function() {
            jQueryitem.removeClass(className.active);
          },
          filteredItem: function() {
            jQueryitem.removeClass(className.filtered);
          },
          searchTerm: function() {
            jQuerysearch.val('');
          },
          selectedItem: function() {
            jQueryitem.removeClass(className.selected);
          },
          tabbable: function() {
            if( module.is.searchable() ) {
              module.debug('Searchable dropdown initialized');
              jQuerysearch
                .attr('tabindex', '-1')
              ;
              jQuerymenu
                .attr('tabindex', '-1')
              ;
            }
            else {
              module.debug('Simple selection dropdown initialized');
              jQuerymodule
                .attr('tabindex', '-1')
              ;
              jQuerymenu
                .attr('tabindex', '-1')
              ;
            }
          }
        },

        is: {
          search: function() {
            return jQuerymodule.hasClass(className.search);
          },
          searchable: function() {
            return (jQuerysearch.size() > 0);
          },
          searchSelection: function() {
            return ( module.is.searchable() && jQuerysearch.parent().is(jQuerymodule) );
          },
          selection: function() {
            return jQuerymodule.hasClass(className.selection);
          },
          animated: function(jQuerysubMenu) {
            return (jQuerysubMenu)
              ? jQuerysubMenu.is(':animated') || jQuerysubMenu.transition && jQuerysubMenu.transition('is animating')
              : jQuerymenu.is(':animated') || jQuerymenu.transition && jQuerymenu.transition('is animating')
            ;
          },
          active: function() {
            return jQuerymodule.hasClass(className.active);
          },
          visible: function(jQuerysubMenu) {
            return (jQuerysubMenu)
              ? jQuerysubMenu.is(':visible')
              : jQuerymenu.is(':visible')
            ;
          },
          hidden: function(jQuerysubMenu) {
            return (jQuerysubMenu)
              ? jQuerysubMenu.is(':hidden')
              : jQuerymenu.is(':hidden')
            ;
          }
        },

        can: {
          click: function() {
            return (hasTouch || settings.on == 'click');
          },
          show: function() {
            return !jQuerymodule.hasClass(className.disabled);
          }
        },

        animate: {
          show: function(callback, jQuerysubMenu) {
            var
              jQuerycurrentMenu = jQuerysubMenu || jQuerymenu,
              start = (jQuerysubMenu)
                ? function() {}
                : function() {
                  module.hideOthers();
                  module.set.active();
                  module.set.scrollPosition();
                }
            ;
            callback = callback || function(){};
            module.verbose('Doing menu show animation', jQuerycurrentMenu);
            if( module.is.hidden(jQuerycurrentMenu) ) {
              if(settings.transition == 'none') {
                jQuery.proxy(callback, element)();
              }
              else if(jQuery.fn.transition !== undefined && jQuerymodule.transition('is supported')) {
                jQuerycurrentMenu
                  .transition({
                    animation  : settings.transition + ' in',
                    debug      : settings.debug,
                    verbose    : settings.verbose,
                    duration   : settings.duration,
                    queue      : true,
                    onStart    : start,
                    onComplete : function() {
                      jQuery.proxy(callback, element)();
                    }
                  })
                ;
              }
              else if(settings.transition == 'slide down') {
                start();
                jQuerycurrentMenu
                  .hide()
                  .clearQueue()
                  .children()
                    .clearQueue()
                    .css('opacity', 0)
                    .delay(50)
                    .animate({
                      opacity : 1
                    }, settings.duration, 'easeOutQuad', module.event.resetStyle)
                    .end()
                  .slideDown(100, 'easeOutQuad', function() {
                    jQuery.proxy(module.event.resetStyle, this)();
                    jQuery.proxy(callback, element)();
                  })
                ;
              }
              else if(settings.transition == 'fade') {
                start();
                jQuerycurrentMenu
                  .hide()
                  .clearQueue()
                  .fadeIn(settings.duration, function() {
                    jQuery.proxy(module.event.resetStyle, this)();
                    jQuery.proxy(callback, element)();
                  })
                ;
              }
              else {
                module.error(error.transition, settings.transition);
              }
            }
          },
          hide: function(callback, jQuerysubMenu) {
            var
              jQuerycurrentMenu = jQuerysubMenu || jQuerymenu,
              start = (jQuerysubMenu)
                ? function() {}
                : function() {
                  if( module.can.click() ) {
                    module.unbind.intent();
                  }
                  module.focusSearch();
                  module.hideSubMenus();
                  module.remove.active();
                }
            ;
            callback = callback || function(){};
            if( module.is.visible(jQuerycurrentMenu) ) {
              module.verbose('Doing menu hide animation', jQuerycurrentMenu);

              if(settings.transition == 'none') {
                jQuery.proxy(callback, element)();
              }
              else if(jQuery.fn.transition !== undefined && jQuerymodule.transition('is supported')) {
                jQuerycurrentMenu
                  .transition({
                    animation  : settings.transition + ' out',
                    duration   : settings.duration,
                    debug      : settings.debug,
                    verbose    : settings.verbose,
                    queue      : true,
                    onStart    : start,
                    onComplete : function() {
                      jQuery.proxy(callback, element)();
                    }
                  })
                ;
              }
              else if(settings.transition == 'slide down') {
                start();
                jQuerycurrentMenu
                  .show()
                  .clearQueue()
                  .children()
                    .clearQueue()
                    .css('opacity', 1)
                    .animate({
                      opacity : 0
                    }, 100, 'easeOutQuad', module.event.resetStyle)
                    .end()
                  .delay(50)
                  .slideUp(100, 'easeOutQuad', function() {
                    jQuery.proxy(module.event.resetStyle, this)();
                    jQuery.proxy(callback, element)();
                  })
                ;
              }
              else if(settings.transition == 'fade') {
                start();
                jQuerycurrentMenu
                  .show()
                  .clearQueue()
                  .fadeOut(150, function() {
                    jQuery.proxy(module.event.resetStyle, this)();
                    jQuery.proxy(callback, element)();
                  })
                ;
              }
              else {
                module.error(error.transition);
              }
            }
          }
        },

        delay: {
          show: function() {
            module.verbose('Delaying show event to ensure user intent');
            clearTimeout(module.timer);
            module.timer = setTimeout(module.show, settings.delay.show);
          },
          hide: function() {
            module.verbose('Delaying hide event to ensure user intent');
            clearTimeout(module.timer);
            module.timer = setTimeout(module.hide, settings.delay.hide);
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            jQuery.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                jQuery.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            jQuery.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ( jQuery.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if(jQuery.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

jQuery.fn.dropdown.settings = {

  debug          : false,
  verbose        : true,
  performance    : true,

  on             : 'click',
  action         : 'activate',

  allowTab       : true,
  fullTextSearch : true,
  preserveHTML   : true,

  delay          : {
    show  : 200,
    hide  : 300,
    touch : 50
  },

  transition : 'slide down',
  duration   : 250,

  /* Callbacks */

  onChange   : function(value, text){},
  onShow     : function(){},
  onHide     : function(){},

  /* Component */

  name           : 'Dropdown',
  namespace      : 'dropdown',

  error   : {
    action     : 'You called a dropdown action that was not defined',
    method     : 'The method you called is not defined.',
    transition : 'The requested transition was not found'
  },

  metadata: {
    defaultText  : 'defaultText',
    defaultValue : 'defaultValue',
    text         : 'text',
    value        : 'value'
  },

  selector : {
    dropdown : '.ui.dropdown',
    text     : '> .text:not(.icon)',
    input    : '> input[type="hidden"], > select',
    search   : '> input.search, .menu > .search > input, .menu > input.search',
    menu     : '.menu',
    item     : '.item'
  },

  className : {
    active      : 'active',
    animating   : 'animating',
    disabled    : 'disabled',
    dropdown    : 'ui dropdown',
    filtered    : 'filtered',
    menu        : 'menu',
    placeholder : 'default',
    search      : 'search',
    selected    : 'selected',
    selection   : 'selection',
    visible     : 'visible'
  }

};

/* Templates */
jQuery.fn.dropdown.settings.templates = {
  menu: function(select) {
    var
      placeholder = select.placeholder || false,
      values      = select.values || {},
      html        = ''
    ;
    jQuery.each(select.values, function(value, name) {
      if(value === name) {
        html += '<div class="item">' + name + '</div>';
      }
      else {
        html += '<div class="item" data-value="' + value + '">' + name + '</div>';
      }
    });
    return html;
  },
  dropdown: function(select) {
    var
      placeholder = select.placeholder || false,
      values      = select.values || {},
      html        = ''
    ;
    html +=  '<i class="dropdown icon"></i>';
    if(select.placeholder) {
      html += '<div class="default text">' + placeholder + '</div>';
    }
    else {
      html += '<div class="text"></div>';
    }
    html += '<div class="menu">';
    jQuery.each(select.values, function(value, name) {
      if(value === name) {
        html += '<div class="item">' + name + '</div>';
      }
      else {
        html += '<div class="item" data-value="' + value + '">' + name + '</div>';
      }
    });
    html += '</div>';
    return html;
  }
};


/* Dependencies */
jQuery.extend( jQuery.easing, {
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  },
});


})( jQuery, window , document );
/*
 * # Semantic - Form Validation
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( jQuery, window, document, undefined ) {

jQuery.fn.form = function(fields, parameters) {
  var
    jQueryallModules     = jQuery(this),

    settings        = jQuery.extend(true, {}, jQuery.fn.form.settings, parameters),
    validation      = jQuery.extend({}, jQuery.fn.form.settings.defaults, fields),

    namespace       = settings.namespace,
    metadata        = settings.metadata,
    selector        = settings.selector,
    className       = settings.className,
    error           = settings.error,

    eventNamespace  = '.' + namespace,
    moduleNamespace = 'module-' + namespace,

    moduleSelector  = jQueryallModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    returnedValue
  ;
  jQueryallModules
    .each(function() {
      var
        jQuerymodule    = jQuery(this),
        jQueryfield     = jQuery(this).find(selector.field),
        jQuerygroup     = jQuery(this).find(selector.group),
        jQuerymessage   = jQuery(this).find(selector.message),
        jQueryprompt    = jQuery(this).find(selector.prompt),
        jQuerysubmit    = jQuery(this).find(selector.submit),

        formErrors = [],

        element    = this,
        instance   = jQuerymodule.data(moduleNamespace),
        module
      ;

      module      = {

        initialize: function() {
          module.verbose('Initializing form validation', jQuerymodule, validation, settings);
          module.bindEvents();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          jQuerymodule
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module', instance);
          module.removeEvents();
          jQuerymodule
            .removeData(moduleNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing selector cache');
          jQueryfield = jQuerymodule.find(selector.field);
        },

        submit: function() {
          module.verbose('Submitting form', jQuerymodule);
          jQuerymodule
            .submit()
          ;
        },

        attachEvents: function(selector, action) {
          action = action || 'submit';
          jQuery(selector)
            .on('click', function(event) {
              module[action]();
              event.preventDefault();
            })
          ;
        },

        bindEvents: function() {

          if(settings.keyboardShortcuts) {
            jQueryfield
              .on('keydown' + eventNamespace, module.event.field.keydown)
            ;
          }
          jQuerymodule
            .on('submit' + eventNamespace, module.validate.form)
          ;
          jQueryfield
            .on('blur' + eventNamespace, module.event.field.blur)
          ;
          // attach submit events
          module.attachEvents(jQuerysubmit, 'submit');

          jQueryfield
            .each(function() {
              var
                type       = jQuery(this).prop('type'),
                inputEvent = module.get.changeEvent(type)
              ;
              jQuery(this)
                .on(inputEvent + eventNamespace, module.event.field.change)
              ;
            })
          ;
        },

        removeEvents: function() {
          jQuerymodule
            .off(eventNamespace)
          ;
          jQueryfield
            .off(eventNamespace)
          ;
          jQuerysubmit
            .off(eventNamespace)
          ;
          jQueryfield
            .off(eventNamespace)
          ;
        },

        event: {
          field: {
            keydown: function(event) {
              var
                jQueryfield  = jQuery(this),
                key     = event.which,
                keyCode = {
                  enter  : 13,
                  escape : 27
                }
              ;
              if( key == keyCode.escape) {
                module.verbose('Escape key pressed blurring field');
                jQueryfield
                  .blur()
                ;
              }
              if(!event.ctrlKey && key == keyCode.enter && jQueryfield.is(selector.input) && jQueryfield.not(selector.checkbox).size() > 0 ) {
                module.debug('Enter key pressed, submitting form');
                jQuerysubmit
                  .addClass(className.down)
                ;
                jQueryfield
                  .one('keyup' + eventNamespace, module.event.field.keyup)
                ;
              }
            },
            keyup: function() {
              module.verbose('Doing keyboard shortcut form submit');
              jQuerysubmit.removeClass(className.down);
              module.submit();
            },
            blur: function() {
              var
                jQueryfield      = jQuery(this),
                jQueryfieldGroup = jQueryfield.closest(jQuerygroup)
              ;
              if( jQueryfieldGroup.hasClass(className.error) ) {
                module.debug('Revalidating field', jQueryfield,  module.get.validation(jQueryfield));
                module.validate.field( module.get.validation(jQueryfield) );
              }
              else if(settings.on == 'blur' || settings.on == 'change') {
                module.validate.field( module.get.validation(jQueryfield) );
              }
            },
            change: function() {
              var
                jQueryfield      = jQuery(this),
                jQueryfieldGroup = jQueryfield.closest(jQuerygroup)
              ;
              if(settings.on == 'change' || ( jQueryfieldGroup.hasClass(className.error) && settings.revalidate) ) {
                clearTimeout(module.timer);
                module.timer = setTimeout(function() {
                  module.debug('Revalidating field', jQueryfield,  module.get.validation(jQueryfield));
                  module.validate.field( module.get.validation(jQueryfield) );
                }, settings.delay);
              }
            }
          }

        },

        get: {
          changeEvent: function(type) {
            if(type == 'checkbox' || type == 'radio') {
              return 'change';
            }
            else {
              return (document.createElement('input').oninput !== undefined)
                ? 'input'
                : (document.createElement('input').onpropertychange !== undefined)
                  ? 'propertychange'
                  : 'keyup'
              ;
            }
          },
          field: function(identifier) {
            module.verbose('Finding field with identifier', identifier);
            if( jQueryfield.filter('#' + identifier).size() > 0 ) {
              return jQueryfield.filter('#' + identifier);
            }
            else if( jQueryfield.filter('[name="' + identifier +'"]').size() > 0 ) {
              return jQueryfield.filter('[name="' + identifier +'"]');
            }
            else if( jQueryfield.filter('[data-' + metadata.validate + '="'+ identifier +'"]').size() > 0 ) {
              return jQueryfield.filter('[data-' + metadata.validate + '="'+ identifier +'"]');
            }
            return jQuery('<input/>');
          },
          validation: function(jQueryfield) {
            var
              rules
            ;
            jQuery.each(validation, function(fieldName, field) {
              if( module.get.field(field.identifier).get(0) == jQueryfield.get(0) ) {
                rules = field;
              }
            });
            return rules || false;
          }
        },

        has: {

          field: function(identifier) {
            module.verbose('Checking for existence of a field with identifier', identifier);
            if( jQueryfield.filter('#' + identifier).size() > 0 ) {
              return true;
            }
            else if( jQueryfield.filter('[name="' + identifier +'"]').size() > 0 ) {
              return true;
            }
            else if( jQueryfield.filter('[data-' + metadata.validate + '="'+ identifier +'"]').size() > 0 ) {
              return true;
            }
            return false;
          }

        },

        add: {
          prompt: function(identifier, errors) {
            var
              jQueryfield       = module.get.field(identifier),
              jQueryfieldGroup  = jQueryfield.closest(jQuerygroup),
              jQueryprompt      = jQueryfieldGroup.find(selector.prompt),
              promptExists = (jQueryprompt.size() !== 0)
            ;
            errors = (typeof errors == 'string')
              ? [errors]
              : errors
            ;
            module.verbose('Adding field error state', identifier);
            jQueryfieldGroup
              .addClass(className.error)
            ;
            if(settings.inline) {
              if(!promptExists) {
                jQueryprompt = settings.templates.prompt(errors);
                jQueryprompt
                  .appendTo(jQueryfieldGroup)
                ;
              }
              jQueryprompt
                .html(errors[0])
              ;
              if(!promptExists) {
                if(settings.transition && jQuery.fn.transition !== undefined && jQuerymodule.transition('is supported')) {
                  module.verbose('Displaying error with css transition', settings.transition);
                  jQueryprompt.transition(settings.transition + ' in', settings.duration);
                }
                else {
                  module.verbose('Displaying error with fallback javascript animation');
                  jQueryprompt
                    .fadeIn(settings.duration)
                  ;
                }
              }
              else {
                module.verbose('Inline errors are disabled, no inline error added', identifier);
              }
            }
          },
          errors: function(errors) {
            module.debug('Adding form error messages', errors);
            jQuerymessage
              .html( settings.templates.error(errors) )
            ;
          }
        },

        remove: {
          prompt: function(field) {
            var
              jQueryfield      = module.get.field(field.identifier),
              jQueryfieldGroup = jQueryfield.closest(jQuerygroup),
              jQueryprompt     = jQueryfieldGroup.find(selector.prompt)
            ;
            jQueryfieldGroup
              .removeClass(className.error)
            ;
            if(settings.inline && jQueryprompt.is(':visible')) {
              module.verbose('Removing prompt for field', field);
              if(settings.transition && jQuery.fn.transition !== undefined && jQuerymodule.transition('is supported')) {
                jQueryprompt.transition(settings.transition + ' out', settings.duration, function() {
                  jQueryprompt.remove();
                });
              }
              else {
                jQueryprompt
                  .fadeOut(settings.duration, function(){
                    jQueryprompt.remove();
                  })
                ;
              }
            }
          }
        },

        set: {
          success: function() {
            jQuerymodule
              .removeClass(className.error)
              .addClass(className.success)
            ;
          },
          error: function() {
            jQuerymodule
              .removeClass(className.success)
              .addClass(className.error)
            ;
          }
        },

        validate: {

          form: function(event) {
            var
              allValid = true,
              apiRequest
            ;
            // reset errors
            formErrors = [];
            jQuery.each(validation, function(fieldName, field) {
              if( !( module.validate.field(field) ) ) {
                allValid = false;
              }
            });
            if(allValid) {
              module.debug('Form has no validation errors, submitting');
              module.set.success();
              return jQuery.proxy(settings.onSuccess, this)(event);
            }
            else {
              module.debug('Form has errors');
              module.set.error();
              if(!settings.inline) {
                module.add.errors(formErrors);
              }
              // prevent ajax submit
              if(jQuerymodule.data('moduleApi') !== undefined) {
                event.stopImmediatePropagation();
              }
              return jQuery.proxy(settings.onFailure, this)(formErrors);
            }
          },

          // takes a validation object and returns whether field passes validation
          field: function(field) {
            var
              jQueryfield      = module.get.field(field.identifier),
              fieldValid  = true,
              fieldErrors = []
            ;
            if(field.rules !== undefined) {
              jQuery.each(field.rules, function(index, rule) {
                if( module.has.field(field.identifier) && !( module.validate.rule(field, rule) ) ) {
                  module.debug('Field is invalid', field.identifier, rule.type);
                  fieldErrors.push(rule.prompt);
                  fieldValid = false;
                }
              });
            }
            if(fieldValid) {
              module.remove.prompt(field, fieldErrors);
              jQuery.proxy(settings.onValid, jQueryfield)();
            }
            else {
              formErrors = formErrors.concat(fieldErrors);
              module.add.prompt(field.identifier, fieldErrors);
              jQuery.proxy(settings.onInvalid, jQueryfield)(fieldErrors);
              return false;
            }
            return true;
          },

          // takes validation rule and returns whether field passes rule
          rule: function(field, validation) {
            var
              jQueryfield        = module.get.field(field.identifier),
              type          = validation.type,
              value         = jQuery.trim(jQueryfield.val() + ''),

              bracketRegExp = /\[(.*)\]/i,
              bracket       = bracketRegExp.exec(type),
              isValid       = true,
              ancillary,
              functionType
            ;
            // if bracket notation is used, pass in extra parameters
            if(bracket !== undefined && bracket !== null) {
              ancillary    = '' + bracket[1];
              functionType = type.replace(bracket[0], '');
              isValid      = jQuery.proxy(settings.rules[functionType], jQuerymodule)(value, ancillary);
            }
            // normal notation
            else {
              isValid = jQuery.proxy(settings.rules[type], jQueryfield)(value);
            }
            return isValid;
          }
        },

        setting: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            jQuery.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if(jQueryallModules.size() > 1) {
              title += ' ' + '(' + jQueryallModules.size() + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                jQuery.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            jQuery.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( jQuery.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if(jQuery.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };
      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }

    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

jQuery.fn.form.settings = {

  name              : 'Form',
  namespace         : 'form',

  debug             : false,
  verbose           : true,
  performance       : true,


  keyboardShortcuts : true,
  on                : 'submit',
  inline            : false,

  delay             : 200,
  revalidate        : true,

  transition        : 'scale',
  duration          : 150,


  onValid           : function() {},
  onInvalid         : function() {},
  onSuccess         : function() { return true; },
  onFailure         : function() { return false; },

  metadata : {
    validate: 'validate'
  },

  selector : {
    message : '.error.message',
    field   : 'input, textarea, select',
    group   : '.field',
    checkbox: 'input[type="checkbox"], input[type="radio"]',
    input   : 'input',
    prompt  : '.prompt',
    submit  : '.submit'
  },

  className : {
    error   : 'error',
    success : 'success',
    down    : 'down',
    label   : 'ui label prompt'
  },

  // errors
  error: {
    method   : 'The method you called is not defined.'
  },


  templates: {
    error: function(errors) {
      var
        html = '<ul class="list">'
      ;
      jQuery.each(errors, function(index, value) {
        html += '<li>' + value + '</li>';
      });
      html += '</ul>';
      return jQuery(html);
    },
    prompt: function(errors) {
      return jQuery('<div/>')
        .addClass('ui red pointing prompt label')
        .html(errors[0])
      ;
    }
  },

  rules: {
    checked: function() {
      return (jQuery(this).filter(':checked').size() > 0);
    },
    empty: function(value) {
      return !(value === undefined || '' === value);
    },
    email: function(value){
      var
        emailRegExp = new RegExp("[a-z0-9!#jQuery%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#jQuery%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?", "i")
      ;
      return emailRegExp.test(value);
    },
    length: function(value, requiredLength) {
      return (value !== undefined)
        ? (value.length >= requiredLength)
        : false
      ;
    },
    not: function(value, notValue) {
      return (value != notValue);
    },
    contains: function(value, text) {
      text = text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\jQuery\|]/g, "\\jQuery&");
      return (value.search(text) !== -1);
    },
    is: function(value, text) {
      return (value == text);
    },
    maxLength: function(value, maxLength) {
      return (value !== undefined)
        ? (value.length <= maxLength)
        : false
      ;
    },
    match: function(value, fieldIdentifier) {
      // use either id or name of field
      var
        jQueryform = jQuery(this),
        matchingValue
      ;
      if(jQueryform.find('#' + fieldIdentifier).size() > 0) {
        matchingValue = jQueryform.find('#' + fieldIdentifier).val();
      }
      else if(jQueryform.find('[name="' + fieldIdentifier +'"]').size() > 0) {
        matchingValue = jQueryform.find('[name="' + fieldIdentifier + '"]').val();
      }
      else if( jQueryform.find('[data-validate="'+ fieldIdentifier +'"]').size() > 0 ) {
        matchingValue = jQueryform.find('[data-validate="'+ fieldIdentifier +'"]').val();
      }
      return (matchingValue !== undefined)
        ? ( value.toString() == matchingValue.toString() )
        : false
      ;
    },
    url: function(value) {
      var
        urlRegExp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
      ;
      return urlRegExp.test(value);
    },
    integer: function(value, range) {
      var
        intRegExp = /^\-?\d+jQuery/,
        min,
        max,
        parts
      ;
      if (range === undefined || range === '' || range === '..') {
        // do nothing
      }
      else if (range.indexOf('..') == -1) {
        if (intRegExp.test(range)) {
          min = max = range - 0;
        }
      }
      else {
        parts = range.split('..', 2);
        if (intRegExp.test(parts[0])) {
          min = parts[0] - 0;
        }
        if (intRegExp.test(parts[1])) {
          max = parts[1] - 0;
        }
      }
      return (
        intRegExp.test(value) &&
        (min === undefined || value >= min) &&
        (max === undefined || value <= max)
      );
    }
  }

};

})( jQuery, window , document );

/*
 * # Semantic - Modal
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( jQuery, window, document, undefined ) {

"use strict";

jQuery.fn.modal = function(parameters) {
  var
    jQueryallModules    = jQuery(this),
    jQuerywindow        = jQuery(window),
    jQuerydocument      = jQuery(document),
    jQuerybody          = jQuery('body'),

    moduleSelector = jQueryallModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    returnedValue
  ;

  jQueryallModules
    .each(function() {
      var
        settings    = ( jQuery.isPlainObject(parameters) )
          ? jQuery.extend(true, {}, jQuery.fn.modal.settings, parameters)
          : jQuery.extend({}, jQuery.fn.modal.settings),

        selector        = settings.selector,
        className       = settings.className,
        namespace       = settings.namespace,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        jQuerymodule      = jQuery(this),
        jQuerycontext     = jQuery(settings.context),
        jQueryclose       = jQuerymodule.find(selector.close),

        jQueryallModals,
        jQueryotherModals,
        jQueryfocusedElement,
        jQuerydimmable,
        jQuerydimmer,

        element      = this,
        instance     = jQuerymodule.data(moduleNamespace),
        observer,
        module
      ;
      module  = {

        initialize: function() {
          module.verbose('Initializing dimmer', jQuerycontext);

          if(jQuery.fn.dimmer === undefined) {
            module.error(error.dimmer);
            return;
          }

          jQuerydimmable = jQuerycontext
            .dimmer({
              debug      : settings.debug,
              dimmerName : 'modals',
              closable   : false,
              useCSS     : true,
              duration   : {
                show     : settings.duration * 0.9,
                hide     : settings.duration * 1.1
              }
            })
          ;
          if(settings.detachable) {
            jQuerydimmable.dimmer('add content', jQuerymodule);
          }

          jQuerydimmer = jQuerydimmable.dimmer('get dimmer');
          jQueryotherModals = jQuerymodule.siblings(selector.modal);
          jQueryallModals   = jQueryotherModals.add(jQuerymodule);

          module.verbose('Attaching close events', jQueryclose);
          module.bind.events();
          module.observeChanges();

          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of modal');
          instance = module;
          jQuerymodule
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous modal');
          jQuerymodule
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
          jQueryclose.off(eventNamespace);
          jQuerycontext.dimmer('destroy');
        },

        observeChanges: function() {
          if('MutationObserver' in window) {
            observer = new MutationObserver(function(mutations) {
              module.debug('DOM tree modified, refreshing');
              module.refresh();
            });
            observer.observe(element, {
              childList : true,
              subtree   : true
            });
            module.debug('Setting up mutation observer', observer);
          }
        },

        refresh: function() {
          module.remove.scrolling();
          module.cacheSizes();
          module.set.screenHeight();
          module.set.type();
          module.set.position();
        },

        attachEvents: function(selector, event) {
          var
            jQuerytoggle = jQuery(selector)
          ;
          event = jQuery.isFunction(module[event])
            ? module[event]
            : module.toggle
          ;
          if(jQuerytoggle.size() > 0) {
            module.debug('Attaching modal events to element', selector, event);
            jQuerytoggle
              .off(eventNamespace)
              .on('click' + eventNamespace, event)
            ;
          }
          else {
            module.error(error.notFound, selector);
          }
        },

        bind: {
          events: function() {
            jQueryclose
              .on('click' + eventNamespace, module.event.close)
            ;
            jQuerywindow
              .on('resize' + eventNamespace, module.event.resize)
            ;
          }
        },

        event: {
          close: function() {
            module.verbose('Closing element pressed');
            if( jQuery(this).is(selector.approve) ) {
              if(jQuery.proxy(settings.onApprove, element)() !== false) {
                module.hide();
              }
              else {
                module.verbose('Approve callback returned false cancelling hide');
              }
            }
            else if( jQuery(this).is(selector.deny) ) {
              if(jQuery.proxy(settings.onDeny, element)() !== false) {
                module.hide();
              }
              else {
                module.verbose('Deny callback returned false cancelling hide');
              }
            }
            else {
              module.hide();
            }
          },
          click: function(event) {
            if( jQuery(event.target).closest(selector.modal).size() === 0 ) {
              module.debug('Dimmer clicked, hiding all modals');
              if(settings.allowMultiple) {
                module.hide();
              }
              else {
                module.hideAll();
              }
              event.stopImmediatePropagation();
            }
          },
          debounce: function(method, delay) {
            clearTimeout(module.timer);
            module.timer = setTimeout(method, delay);
          },
          keyboard: function(event) {
            var
              keyCode   = event.which,
              escapeKey = 27
            ;
            if(keyCode == escapeKey) {
              if(settings.closable) {
                module.debug('Escape key pressed hiding modal');
                module.hide();
              }
              else {
                module.debug('Escape key pressed, but closable is set to false');
              }
              event.preventDefault();
            }
          },
          resize: function() {
            if( jQuerydimmable.dimmer('is active') ) {
              requestAnimationFrame(module.refresh);
            }
          }
        },

        toggle: function() {
          if( module.is.active() || module.is.animating() ) {
            module.hide();
          }
          else {
            module.show();
          }
        },

        show: function(callback) {
          callback = jQuery.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.showDimmer();
          module.showModal(callback);
        },

        showModal: function(callback) {
          callback = jQuery.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( !module.is.active() ) {

            if( jQueryotherModals.filter(':visible').size() > 0 && !settings.allowMultiple) {
              module.debug('Other modals visible, queueing show animation');
              module.hideOthers(module.showModal);
            }
            else {
              jQuery.proxy(settings.onShow, element)();
              if(settings.transition && jQuery.fn.transition !== undefined && jQuerymodule.transition('is supported')) {
                module.debug('Showing modal with css animations');
                module.cacheSizes();
                module.set.position();
                module.set.screenHeight();
                module.set.type();
                jQuerymodule
                  .transition({
                    debug     : settings.debug,
                    animation : settings.transition + ' in',
                    queue     : false,
                    duration  : settings.duration,
                    onStart   : function() {
                      module.set.clickaway();
                    },
                    onComplete : function() {
                      jQuery.proxy(settings.onVisible, element)();
                      module.add.keyboardShortcuts();
                      module.save.focus();
                      module.set.active();
                      module.set.autofocus();
                      callback();
                    }
                  })
                ;
              }
              else {
                module.debug('Showing modal with javascript');
                jQuerymodule
                  .fadeIn(settings.duration, settings.easing, function() {
                    jQuery.proxy(settings.onVisible, element)();
                    module.add.keyboardShortcuts();
                    module.save.focus();
                    module.set.active();
                    callback();
                  })
                ;
              }
            }
          }
          else {
            module.debug('Modal is already visible');
          }
        },

        showDimmer: function() {
          if( !jQuerydimmable.dimmer('is active') ) {
            module.debug('Showing dimmer');
            jQuerydimmable.dimmer('show');
          }
          else {
            module.debug('Dimmer already visible');
          }
        },

        hide: function(callback) {
          callback = jQuery.isFunction(callback)
            ? callback
            : function(){}
          ;
          if(jQueryallModals.filter(':visible').size() <= 1) {
            module.hideDimmer();
          }
          module.hideModal(callback);
        },

        hideDimmer: function() {
          if( !(jQuerydimmable.dimmer('is active') || jQuerydimmable.dimmer('is animating')) ) {
            module.debug('Dimmer is not visible cannot hide');
            return;
          }
          module.debug('Hiding dimmer');
          module.remove.clickaway();
          jQuerydimmable.dimmer('hide', function() {
            if(settings.transition && jQuery.fn.transition !== undefined && jQuerymodule.transition('is supported')) {
              module.remove.screenHeight();
            }
            module.remove.active();
          });
        },

        hideModal: function(callback) {
          callback = jQuery.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.debug('Hiding modal');
          jQuery.proxy(settings.onHide, element)();
          if(settings.transition && jQuery.fn.transition !== undefined && jQuerymodule.transition('is supported')) {
            jQuerymodule
              .transition({
                debug      : settings.debug,
                animation  : settings.transition + ' out',
                queue      : false,
                duration   : settings.duration,
                onStart    : function() {
                  module.remove.keyboardShortcuts();
                },
                onComplete : function() {
                  jQuery.proxy(settings.onHidden, element)();
                  module.remove.active();
                  module.restore.focus();
                  callback();
                }
              })
            ;
          }
          else {
            module.remove.keyboardShortcuts();
            jQuerymodule
              .fadeOut(settings.duration, settings.easing, function() {
                jQuery.proxy(settings.onHidden, element)();
                module.remove.active();
                module.restore.focus();
                callback();
              })
            ;
          }
        },

        hideAll: function(callback) {
          callback = jQuery.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( jQueryallModals.is(':visible') ) {
            module.debug('Hiding all visible modals');
            module.hideDimmer();
            jQueryallModals
              .filter(':visible')
                .modal('hide modal', callback)
            ;
          }
        },

        hideOthers: function(callback) {
          callback = jQuery.isFunction(callback)
            ? callback
            : function(){}
          ;
          if( jQueryotherModals.is(':visible') ) {
            module.debug('Hiding other modals', jQueryotherModals);
            jQueryotherModals
              .filter(':visible')
                .modal('hide modal', callback)
            ;
          }
        },

        add: {
          keyboardShortcuts: function() {
            module.verbose('Adding keyboard shortcuts');
            jQuerydocument
              .on('keyup' + eventNamespace, module.event.keyboard)
            ;
          }
        },

        save: {
          focus: function() {
            jQueryfocusedElement = jQuery(document.activeElement).blur();
          }
        },

        restore: {
          focus: function() {
            if(jQueryfocusedElement && jQueryfocusedElement.size() > 0) {
              jQueryfocusedElement.focus();
            }
          }
        },

        remove: {
          active: function() {
            jQuerymodule.removeClass(className.active);
          },
          clickaway: function() {
            if(settings.closable) {
              jQuerydimmer
                .off('click' + eventNamespace)
              ;
            }
          },
          screenHeight: function() {
            if(module.cache.height > module.cache.pageHeight) {
              module.debug('Removing page height');
              jQuerybody
                .css('height', '')
              ;
            }
          },
          keyboardShortcuts: function() {
            module.verbose('Removing keyboard shortcuts');
            jQuerydocument
              .off('keyup' + eventNamespace)
            ;
          },
          scrolling: function() {
            jQuerydimmable.removeClass(className.scrolling);
            jQuerymodule.removeClass(className.scrolling);
          }
        },

        cacheSizes: function() {
          var
            modalHeight = jQuerymodule.outerHeight()
          ;
          if(module.cache === undefined || modalHeight !== 0) {
            module.cache = {
              pageHeight    : jQuery(document).outerHeight(),
              height        : modalHeight + settings.offset,
              contextHeight : (settings.context == 'body')
                ? jQuery(window).height()
                : jQuerydimmable.height()
            };
          }
          module.debug('Caching modal and container sizes', module.cache);
        },

        can: {
          fit: function() {
            return (module.cache.height < module.cache.contextHeight);
          }
        },

        is: {
          active: function() {
            return jQuerymodule.hasClass(className.active);
          },
          animating: function() {
            return jQuerymodule.transition('is supported')
              ? jQuerymodule.transition('is animating')
              : jQuerymodule.is(':visible')
            ;
          },
          modernBrowser: function() {
            // appName for IE11 reports 'Netscape' can no longer use
            return !(window.ActiveXObject || "ActiveXObject" in window);
          }
        },

        set: {
          autofocus: function() {
            if(settings.autofocus) {
              var
                jQueryinputs    = jQuerymodule.find(':input:visible'),
                jQueryautofocus = jQueryinputs.filter('[autofocus]'),
                jQueryinput     = (jQueryautofocus.size() > 0)
                  ? jQueryautofocus
                  : jQueryinputs
              ;
              jQueryinput.first().focus();
            }
          },
          clickaway: function() {
            if(settings.closable) {
              jQuerydimmer
                .off('click' + eventNamespace)
                .on('click' + eventNamespace, module.event.click)
              ;
            }
          },
          screenHeight: function() {
            if(module.cache.height > module.cache.pageHeight) {
              module.debug('Modal is taller than page content, resizing page height');
              jQuerybody
                .css('height', module.cache.height + settings.padding)
              ;
            }
            else {
              jQuerybody.css('height', '');
            }
          },
          active: function() {
            jQuerymodule.addClass(className.active);
          },
          scrolling: function() {
            jQuerydimmable.addClass(className.scrolling);
            jQuerymodule.addClass(className.scrolling);
          },
          type: function() {
            if(module.can.fit()) {
              module.verbose('Modal fits on screen');
              module.remove.scrolling();
            }
            else {
              module.verbose('Modal cannot fit on screen setting to scrolling');
              module.set.scrolling();
            }
          },
          position: function() {
            module.verbose('Centering modal on page', module.cache);
            if(module.can.fit()) {
              jQuerymodule
                .css({
                  top: '',
                  marginTop: -(module.cache.height / 2)
                })
              ;
            }
            else {
              jQuerymodule
                .css({
                  marginTop : '',
                  top       : jQuerydocument.scrollTop()
                })
              ;
            }
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            jQuery.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                jQuery.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            jQuery.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( jQuery.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if(jQuery.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

jQuery.fn.modal.settings = {

  name          : 'Modal',
  namespace     : 'modal',

  debug         : false,
  verbose       : true,
  performance   : true,

  allowMultiple : false,
  detachable    : true,
  closable      : true,
  autofocus     : true,

  context       : 'body',

  duration      : 500,
  easing        : 'easeOutExpo',
  offset        : 0,
  transition    : 'scale',

  padding       : 30,

  onShow        : function(){},
  onHide        : function(){},

  onVisible     : function(){},
  onHidden      : function(){},

  onApprove     : function(){ return true; },
  onDeny        : function(){ return true; },

  selector    : {
    close    : '.close, .actions .button',
    approve  : '.actions .positive, .actions .approve, .actions .ok',
    deny     : '.actions .negative, .actions .deny, .actions .cancel',
    modal    : '.ui.modal'
  },
  error : {
    dimmer    : 'UI Dimmer, a required component is not included in this page',
    method    : 'The method you called is not defined.',
    notFound  : 'The element you specified could not be found'
  },
  className : {
    active    : 'active',
    scrolling : 'scrolling'
  }
};


})( jQuery, window , document );

/*
 * # Semantic - Nag
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function (jQuery, window, document, undefined) {

"use strict";

jQuery.fn.nag = function(parameters) {
  var
    jQueryallModules    = jQuery(this),
    moduleSelector = jQueryallModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),
    returnedValue
  ;
  jQueryallModules
    .each(function() {
      var
        settings          = ( jQuery.isPlainObject(parameters) )
          ? jQuery.extend(true, {}, jQuery.fn.nag.settings, parameters)
          : jQuery.extend({}, jQuery.fn.nag.settings),

        className       = settings.className,
        selector        = settings.selector,
        error           = settings.error,
        namespace       = settings.namespace,

        eventNamespace  = '.' + namespace,
        moduleNamespace = namespace + '-module',

        jQuerymodule         = jQuery(this),

        jQueryclose          = jQuerymodule.find(selector.close),
        jQuerycontext        = (settings.context)
          ? jQuery(settings.context)
          : jQuery('body'),

        element         = this,
        instance        = jQuerymodule.data(moduleNamespace),

        moduleOffset,
        moduleHeight,

        contextWidth,
        contextHeight,
        contextOffset,

        yOffset,
        yPosition,

        timer,
        module,

        requestAnimationFrame = window.requestAnimationFrame
          || window.mozRequestAnimationFrame
          || window.webkitRequestAnimationFrame
          || window.msRequestAnimationFrame
          || function(callback) { setTimeout(callback, 0); }
      ;
      module = {

        initialize: function() {
          module.verbose('Initializing element');

          jQuerymodule
            .data(moduleNamespace, module)
          ;
          jQueryclose
            .on('click' + eventNamespace, module.dismiss)
          ;

          if(settings.detachable && jQuerymodule.parent()[0] !== jQuerycontext[0]) {
            jQuerymodule
              .detach()
              .prependTo(jQuerycontext)
            ;
          }

          if(settings.displayTime > 0) {
            setTimeout(module.hide, settings.displayTime);
          }
          module.show();
        },

        destroy: function() {
          module.verbose('Destroying instance');
          jQuerymodule
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
        },

        show: function() {
          if( module.should.show() && !jQuerymodule.is(':visible') ) {
            module.debug('Showing nag', settings.animation.show);
            if(settings.animation.show == 'fade') {
              jQuerymodule
                .fadeIn(settings.duration, settings.easing)
              ;
            }
            else {
              jQuerymodule
                .slideDown(settings.duration, settings.easing)
              ;
            }
          }
        },

        hide: function() {
          module.debug('Showing nag', settings.animation.hide);
          if(settings.animation.show == 'fade') {
            jQuerymodule
              .fadeIn(settings.duration, settings.easing)
            ;
          }
          else {
            jQuerymodule
              .slideUp(settings.duration, settings.easing)
            ;
          }
        },

        onHide: function() {
          module.debug('Removing nag', settings.animation.hide);
          jQuerymodule.remove();
          if (settings.onHide) {
            settings.onHide();
          }
        },

        dismiss: function(event) {
          if(settings.storageMethod) {
            module.storage.set(settings.key, settings.value);
          }
          module.hide();
          event.stopImmediatePropagation();
          event.preventDefault();
        },

        should: {
          show: function() {
            if(settings.persist) {
              module.debug('Persistent nag is set, can show nag');
              return true;
            }
            if( module.storage.get(settings.key) != settings.value.toString() ) {
              module.debug('Stored value is not set, can show nag', module.storage.get(settings.key));
              return true;
            }
            module.debug('Stored value is set, cannot show nag', module.storage.get(settings.key));
            return false;
          }
        },

        get: {
          storageOptions: function() {
            var
              options = {}
            ;
            if(settings.expires) {
              options.expires = settings.expires;
            }
            if(settings.domain) {
              options.domain = settings.domain;
            }
            if(settings.path) {
              options.path = settings.path;
            }
            return options;
          }
        },

        clear: function() {
          module.storage.remove(settings.key);
        },

        storage: {
          set: function(key, value) {
            var
              options = module.get.storageOptions()
            ;
            if(settings.storageMethod == 'localstorage' && window.localStorage !== undefined) {
              window.localStorage.setItem(key, value);
              module.debug('Value stored using local storage', key, value);
            }
            else if(jQuery.cookie !== undefined) {
              jQuery.cookie(key, value, options);
              module.debug('Value stored using cookie', key, value, options);
            }
            else {
              module.error(error.noCookieStorage);
              return;
            }
          },
          get: function(key, value) {
            var
              storedValue
            ;
            if(settings.storageMethod == 'localstorage' && window.localStorage !== undefined) {
              storedValue = window.localStorage.getItem(key);
            }
            // get by cookie
            else if(jQuery.cookie !== undefined) {
              storedValue = jQuery.cookie(key);
            }
            else {
              module.error(error.noCookieStorage);
            }
            if(storedValue == 'undefined' || storedValue == 'null' || storedValue === undefined || storedValue === null) {
              storedValue = undefined;
            }
            return storedValue;
          },
          remove: function(key) {
            var
              options = module.get.storageOptions()
            ;
            if(settings.storageMethod == 'local' && window.store !== undefined) {
              window.localStorage.removeItem(key);
            }
            // store by cookie
            else if(jQuery.cookie !== undefined) {
              jQuery.removeCookie(key, options);
            }
            else {
              module.error(error.noStorage);
            }
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            jQuery.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                jQuery.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            jQuery.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ( jQuery.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if(jQuery.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

jQuery.fn.nag.settings = {

  name        : 'Nag',

  debug       : false,
  verbose     : true,
  performance : true,

  namespace   : 'Nag',

  // allows cookie to be overriden
  persist     : false,

  // set to zero to require manually dismissal, otherwise hides on its own
  displayTime : 0,

  animation   : {
    show : 'slide',
    hide : 'slide'
  },

  context       : false,
  detachable    : false,

  expires       : 30,
  domain        : false,
  path          : '/',

  // type of storage to use
  storageMethod : 'cookie',

  // value to store in dismissed localstorage/cookie
  key           : 'nag',
  value         : 'dismiss',

  error: {
    noStorage : 'Neither jQuery.cookie or store is defined. A storage solution is required for storing state',
    method    : 'The method you called is not defined.'
  },

  className     : {
    bottom : 'bottom',
    fixed  : 'fixed'
  },

  selector      : {
    close : '.close.icon'
  },

  speed         : 500,
  easing        : 'easeOutQuad',

  onHide: function() {}

};

})( jQuery, window , document );

/*! jquery.cookie v1.4.1 | MIT */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?a(require("jquery")):a(jQuery)}(function(a){function b(a){return h.raw?a:encodeURIComponent(a)}function c(a){return h.raw?a:decodeURIComponent(a)}function d(a){return b(h.json?JSON.stringify(a):String(a))}function e(a){0===a.indexOf('"')&&(a=a.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,"\\"));try{return a=decodeURIComponent(a.replace(g," ")),h.json?JSON.parse(a):a}catch(b){}}function f(b,c){var d=h.raw?b:e(b);return a.isFunction(c)?c(d):d}var g=/\+/g,h=a.cookie=function(e,g,i){if(void 0!==g&&!a.isFunction(g)){if(i=a.extend({},h.defaults,i),"number"==typeof i.expires){var j=i.expires,k=i.expires=new Date;k.setTime(+k+864e5*j)}return document.cookie=[b(e),"=",d(g),i.expires?"; expires="+i.expires.toUTCString():"",i.path?"; path="+i.path:"",i.domain?"; domain="+i.domain:"",i.secure?"; secure":""].join("")}for(var l=e?void 0:{},m=document.cookie?document.cookie.split("; "):[],n=0,o=m.length;o>n;n++){var p=m[n].split("="),q=c(p.shift()),r=p.join("=");if(e&&e===q){l=f(r,g);break}e||void 0===(r=f(r))||(l[q]=r)}return l};h.defaults={},a.removeCookie=function(b,c){return void 0===a.cookie(b)?!1:(a.cookie(b,"",a.extend({},c,{expires:-1})),!a.cookie(b))}});
/*
 * # Semantic - Popup
 * http://github.com/jlukic/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function (jQuery, window, document, undefined) {

"use strict";

jQuery.fn.popup = function(parameters) {
  var
    jQueryallModules    = jQuery(this),
    jQuerydocument      = jQuery(document),

    moduleSelector = jQueryallModules.selector || '',

    hasTouch       = ('ontouchstart' in document.documentElement),
    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),

    returnedValue
  ;
  jQueryallModules
    .each(function() {
      var
        settings        = ( jQuery.isPlainObject(parameters) )
          ? jQuery.extend(true, {}, jQuery.fn.popup.settings, parameters)
          : jQuery.extend({}, jQuery.fn.popup.settings),

        selector        = settings.selector,
        className       = settings.className,
        error           = settings.error,
        metadata        = settings.metadata,
        namespace       = settings.namespace,

        eventNamespace  = '.' + settings.namespace,
        moduleNamespace = 'module-' + namespace,

        jQuerymodule         = jQuery(this),
        jQuerycontext        = jQuery(settings.context),
        jQuerytarget         = (settings.target)
          ? jQuery(settings.target)
          : jQuerymodule,

        jQuerywindow         = jQuery(window),
        jQuerybody           = jQuery('body'),
        jQuerypopup,
        jQueryoffsetParent,

        searchDepth     = 0,

        element         = this,
        instance        = jQuerymodule.data(moduleNamespace),
        module
      ;

      module = {

        // binds events
        initialize: function() {
          module.debug('Initializing module', jQuerymodule);
          module.refresh();
          if(settings.on == 'click') {
            jQuerymodule
              .on('click' + eventNamespace, module.toggle)
            ;
          }
          else if( module.get.startEvent() ) {
            jQuerymodule
              .on(module.get.startEvent() + eventNamespace, module.event.start)
              .on(module.get.endEvent() + eventNamespace, module.event.end)
            ;
          }
          if(settings.target) {
            module.debug('Target set to element', jQuerytarget);
          }
          jQuerywindow
            .on('resize' + eventNamespace, module.event.resize)
          ;
          if( !module.exists() ) {
            module.create();
          }
          else if(settings.hoverable) {
            module.bind.popup();
          }
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          jQuerymodule
            .data(moduleNamespace, instance)
          ;
        },

        refresh: function() {
          if(settings.popup) {
            jQuerypopup = jQuery(settings.popup);
          }
          else {
            if(settings.inline) {
              jQuerypopup = jQuerytarget.next(settings.selector.popup);
            }
          }
          if(settings.popup) {
            jQuerypopup.addClass(className.loading);
            jQueryoffsetParent = jQuerypopup.offsetParent();
            jQuerypopup.removeClass(className.loading);
          }
          else {
            jQueryoffsetParent = (settings.inline)
                ? jQuerytarget.offsetParent()
                : jQuerybody
            ;
          }
          if( jQueryoffsetParent.is('html') ) {
            module.debug('Page is popups offset parent');
            jQueryoffsetParent = jQuerybody;
          }
        },

        reposition: function() {
          module.refresh();
          module.set.position();
        },

        destroy: function() {
          module.debug('Destroying previous module');
          if(jQuerypopup && !settings.preserve) {
            module.removePopup();
          }
          jQuerymodule
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        event: {
          start:  function(event) {
            var
              delay = (jQuery.isPlainObject(settings.delay))
                ? settings.delay.show
                : settings.delay
            ;
            clearTimeout(module.hideTimer);
            module.showTimer = setTimeout(function() {
              if( module.is.hidden() && !( module.is.active() && module.is.dropdown()) ) {
                module.show();
              }
            }, delay);
          },
          end:  function() {
            var
              delay = (jQuery.isPlainObject(settings.delay))
                ? settings.delay.hide
                : settings.delay
            ;
            clearTimeout(module.showTimer);
            module.hideTimer = setTimeout(function() {
              if( module.is.visible() ) {
                module.hide();
              }
            }, delay);
          },
          resize: function() {
            if( module.is.visible() ) {
              module.set.position();
            }
          }
        },

        // generates popup html from metadata
        create: function() {
          var
            html      = jQuerymodule.data(metadata.html)      || settings.html,
            variation = jQuerymodule.data(metadata.variation) || settings.variation,
            title     = jQuerymodule.data(metadata.title)     || settings.title,
            content   = jQuerymodule.data(metadata.content)   || jQuerymodule.attr('title') || settings.content
          ;
          if(html || content || title) {
            module.debug('Creating pop-up html');
            if(!html) {
              html = settings.templates.popup({
                title   : title,
                content : content
              });
            }
            jQuerypopup = jQuery('<div/>')
              .addClass(className.popup)
              .addClass(variation)
              .html(html)
            ;
            if(variation) {
              jQuerypopup
                .addClass(variation)
              ;
            }
            if(settings.inline) {
              module.verbose('Inserting popup element inline', jQuerypopup);
              jQuerypopup
                .insertAfter(jQuerymodule)
              ;
            }
            else {
              module.verbose('Appending popup element to body', jQuerypopup);
              jQuerypopup
                .appendTo( jQuerycontext )
              ;
            }
            if(settings.hoverable) {
              module.bind.popup();
            }
            jQuery.proxy(settings.onCreate, jQuerypopup)(element);
          }
          else if(jQuerytarget.next(settings.selector.popup).size() !== 0) {
            module.verbose('Pre-existing popup found, reverting to inline');
            settings.inline = true;
            module.refresh();
            if(settings.hoverable) {
              module.bind.popup();
            }
          }
          else {
            module.debug('No content specified skipping display', element);
          }
        },

        // determines popup state
        toggle: function() {
          module.debug('Toggling pop-up');
          if( module.is.hidden() ) {
            module.debug('Popup is hidden, showing pop-up');
            module.unbind.close();
            module.hideAll();
            module.show();
          }
          else {
            module.debug('Popup is visible, hiding pop-up');
            module.hide();
          }
        },

        show: function(callback) {
          callback = jQuery.isFunction(callback) ? callback : function(){};
          module.debug('Showing pop-up', settings.transition);
          if(!settings.preserve && !settings.popup) {
            module.refresh();
          }
          if( !module.exists() ) {
            module.create();
          }
          if( jQuerypopup && module.set.position() ) {
            module.save.conditions();
            module.animate.show(callback);
          }
        },


        hide: function(callback) {
          callback = jQuery.isFunction(callback) ? callback : function(){};
          module.remove.visible();
          module.unbind.close();
          if( module.is.visible() ) {
            module.restore.conditions();
            module.animate.hide(callback);
          }
        },

        hideAll: function() {
          jQuery(selector.popup)
            .filter(':visible')
              .popup('hide')
          ;
        },

        hideGracefully: function(event) {
          // don't close on clicks inside popup
          if(event && jQuery(event.target).closest(selector.popup).size() === 0) {
            module.debug('Click occurred outside popup hiding popup');
            module.hide();
          }
          else {
            module.debug('Click was inside popup, keeping popup open');
          }
        },

        exists: function() {
          if(!jQuerypopup) {
            return false;
          }
          if(settings.inline || settings.popup) {
            return ( jQuerypopup.size() !== 0 );
          }
          else {
            return ( jQuerypopup.closest(jQuerycontext).size() );
          }
        },

        removePopup: function() {
          module.debug('Removing popup');
          jQuery.proxy(settings.onRemove, jQuerypopup)(element);
          jQuerypopup
            .removePopup()
          ;
        },

        save: {
          conditions: function() {
            module.cache = {
              title: jQuerymodule.attr('title')
            };
            if (module.cache.title) {
              jQuerymodule.removeAttr('title');
            }
            module.verbose('Saving original attributes', module.cache.title);
          }
        },
        restore: {
          conditions: function() {
            element.blur();
            if(module.cache && module.cache.title) {
              jQuerymodule.attr('title', module.cache.title);
              module.verbose('Restoring original attributes', module.cache.title);
            }
            return true;
          }
        },
        animate: {
          show: function(callback) {
            callback = jQuery.isFunction(callback) ? callback : function(){};
            if(settings.transition && jQuery.fn.transition !== undefined && jQuerymodule.transition('is supported')) {
              module.set.visible();
              jQuerypopup
                .transition({
                  animation  : settings.transition + ' in',
                  queue      : false,
                  debug      : settings.debug,
                  verbose    : settings.verbose,
                  duration   : settings.duration,
                  onComplete : function() {
                    module.bind.close();
                    jQuery.proxy(callback, jQuerypopup)(element);
                    jQuery.proxy(settings.onVisible, jQuerypopup)(element);
                  }
                })
              ;
            }
            else {
              module.set.visible();
              jQuerypopup
                .stop()
                .fadeIn(settings.duration, settings.easing, function() {
                  module.bind.close();
                  jQuery.proxy(callback, element)();
                })
              ;
            }
            jQuery.proxy(settings.onShow, jQuerypopup)(element);
          },
          hide: function(callback) {
            callback = jQuery.isFunction(callback) ? callback : function(){};
            module.debug('Hiding pop-up');
            if(settings.transition && jQuery.fn.transition !== undefined && jQuerymodule.transition('is supported')) {
              jQuerypopup
                .transition({
                  animation  : settings.transition + ' out',
                  queue      : false,
                  duration   : settings.duration,
                  debug      : settings.debug,
                  verbose    : settings.verbose,
                  onComplete : function() {
                    module.reset();
                    jQuery.proxy(callback, jQuerypopup)(element);
                    jQuery.proxy(settings.onHidden, jQuerypopup)(element);
                  }
                })
              ;
            }
            else {
              jQuerypopup
                .stop()
                .fadeOut(settings.duration, settings.easing, function() {
                  module.reset();
                  callback();
                })
              ;
            }
            jQuery.proxy(settings.onHide, jQuerypopup)(element);
          }
        },

        get: {
          startEvent: function() {
            if(settings.on == 'hover') {
              return 'mouseenter';
            }
            else if(settings.on == 'focus') {
              return 'focus';
            }
            return false;
          },
          endEvent: function() {
            if(settings.on == 'hover') {
              return 'mouseleave';
            }
            else if(settings.on == 'focus') {
              return 'blur';
            }
            return false;
          },
          offstagePosition: function(position) {
            var
              position = position || false,
              boundary  = {
                top    : jQuery(window).scrollTop(),
                bottom : jQuery(window).scrollTop() + jQuery(window).height(),
                left   : 0,
                right  : jQuery(window).width()
              },
              popup     = {
                width  : jQuerypopup.width(),
                height : jQuerypopup.height(),
                offset : jQuerypopup.offset()
              },
              offstage  = {},
              offstagePositions = []
            ;
            if(popup.offset && position) {
              module.verbose('Checking if outside viewable area', popup.offset);
              offstage = {
                top    : (popup.offset.top < boundary.top),
                bottom : (popup.offset.top + popup.height > boundary.bottom),
                right  : (popup.offset.left + popup.width > boundary.right),
                left   : false
              };
            }
            // return only boundaries that have been surpassed
            jQuery.each(offstage, function(direction, isOffstage) {
              if(isOffstage) {
                offstagePositions.push(direction);
              }
            });
            return (offstagePositions.length > 0)
              ? offstagePositions.join(' ')
              : false
            ;
          },
          nextPosition: function(position) {
            switch(position) {
              case 'top left':
                position = 'bottom left';
              break;
              case 'bottom left':
                position = 'top right';
              break;
              case 'top right':
                position = 'bottom right';
              break;
              case 'bottom right':
                position = 'top center';
              break;
              case 'top center':
                position = 'bottom center';
              break;
              case 'bottom center':
                position = 'right center';
              break;
              case 'right center':
                position = 'left center';
              break;
              case 'left center':
                position = 'top center';
              break;
            }
            return position;
          }
        },

        set: {
          position: function(position, arrowOffset) {
            var
              windowWidth   = jQuery(window).width(),
              windowHeight  = jQuery(window).height(),

              targetWidth   = jQuerytarget.outerWidth(),
              targetHeight  = jQuerytarget.outerHeight(),

              popupWidth    = jQuerypopup.outerWidth(),
              popupHeight   = jQuerypopup.outerHeight(),

              parentWidth   = jQueryoffsetParent.outerWidth(),
              parentHeight  = jQueryoffsetParent.outerHeight(),

              distanceAway  = settings.distanceAway,

              targetElement = jQuerytarget[0],

              marginTop     = (settings.inline)
                ? parseInt( window.getComputedStyle(targetElement).getPropertyValue('margin-top'), 10)
                : 0,
              marginLeft    = (settings.inline)
                ? parseInt( window.getComputedStyle(targetElement).getPropertyValue('margin-left'), 10)
                : 0,

              target        = (settings.inline || settings.popup)
                ? jQuerytarget.position()
                : jQuerytarget.offset(),

              positioning,
              offstagePosition
            ;
            position    = position    || jQuerymodule.data(metadata.position)    || settings.position;
            arrowOffset = arrowOffset || jQuerymodule.data(metadata.offset)      || settings.offset;
            if(settings.inline) {
              module.debug('Adding targets margin to calculation');
              if(position == 'left center' || position == 'right center') {
                arrowOffset  += marginTop;
                distanceAway += -marginLeft;
              }
              else if (position == 'top left' || position == 'top center' || position == 'top right') {
                arrowOffset  += marginLeft;
                distanceAway -= marginTop;
              }
              else {
                arrowOffset  += marginLeft;
                distanceAway += marginTop;
              }
            }
            module.debug('Calculating popup positioning', position);
            switch(position) {
              case 'top left':
                positioning = {
                  top    : 'auto',
                  bottom : parentHeight - target.top + distanceAway,
                  left   : target.left + arrowOffset,
                  right  : 'auto'
                };
              break;
              case 'top center':
                positioning = {
                  bottom : parentHeight - target.top + distanceAway,
                  left   : target.left + (targetWidth / 2) - (popupWidth / 2) + arrowOffset,
                  top    : 'auto',
                  right  : 'auto'
                };
              break;
              case 'top right':
                positioning = {
                  bottom :  parentHeight - target.top + distanceAway,
                  right  :  parentWidth - target.left - targetWidth - arrowOffset,
                  top    : 'auto',
                  left   : 'auto'
                };
              break;
              case 'left center':
                positioning = {
                  top    : target.top + (targetHeight / 2) - (popupHeight / 2) + arrowOffset,
                  right  : parentWidth - target.left + distanceAway,
                  left   : 'auto',
                  bottom : 'auto'
                };
              break;
              case 'right center':
                positioning = {
                  top    : target.top + (targetHeight / 2) - (popupHeight / 2) + arrowOffset,
                  left   : target.left + targetWidth + distanceAway,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom left':
                positioning = {
                  top    : target.top + targetHeight + distanceAway,
                  left   : target.left + arrowOffset,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom center':
                positioning = {
                  top    : target.top + targetHeight + distanceAway,
                  left   : target.left + (targetWidth / 2) - (popupWidth / 2) + arrowOffset,
                  bottom : 'auto',
                  right  : 'auto'
                };
              break;
              case 'bottom right':
                positioning = {
                  top    : target.top + targetHeight + distanceAway,
                  right  : parentWidth - target.left  - targetWidth - arrowOffset,
                  left   : 'auto',
                  bottom : 'auto'
                };
              break;
            }
            if(positioning === undefined) {
              module.error(error.invalidPosition);
            }
            // tentatively place on stage
            jQuerypopup
              .css(positioning)
              .removeClass(className.position)
              .addClass(position)
              .addClass(className.loading)
            ;
            // check if is offstage
            offstagePosition = module.get.offstagePosition(position);

            // recursively find new positioning
            if(offstagePosition) {
              module.debug('Element is outside boundaries', offstagePosition);
              if(searchDepth < settings.maxSearchDepth) {
                position = module.get.nextPosition(position);
                searchDepth++;
                module.debug('Trying new position', position);
                return (jQuerypopup)
                  ? module.set.position(position)
                  : false
                ;
              }
              else {
                module.debug('Popup could not find a position onstage', jQuerypopup);
                searchDepth = 0;
                module.reset();
                jQuerypopup.removeClass(className.loading);
                return false;
              }
            }
            else {
              module.debug('Position is on stage', position);
              searchDepth = 0;
              if( settings.setFluidWidth && jQuerypopup.hasClass(className.fluid) ) {
                jQuerypopup.css('width', jQueryoffsetParent.width());
              }
              jQuerypopup.removeClass(className.loading);
              return true;
            }
          },

          visible: function() {
            jQuerymodule.addClass(className.visible);
          }
        },

        remove: {
          visible: function() {
            jQuerymodule.removeClass(className.visible);
          }
        },

        bind: {
          popup: function() {
            module.verbose('Allowing hover events on popup to prevent closing');
            if(jQuerypopup && jQuerypopup.size() > 0) {
              jQuerypopup
                .on('mouseenter' + eventNamespace, module.event.start)
                .on('mouseleave' + eventNamespace, module.event.end)
              ;
            }
          },
          close:function() {
            if(settings.hideOnScroll === true || settings.hideOnScroll == 'auto' && settings.on != 'click') {
              jQuerydocument
                .one('touchmove' + eventNamespace, module.hideGracefully)
                .one('scroll' + eventNamespace, module.hideGracefully)
              ;
              jQuerycontext
                .one('touchmove' + eventNamespace, module.hideGracefully)
                .one('scroll' + eventNamespace, module.hideGracefully)
              ;
            }
            if(settings.on == 'click' && settings.closable) {
              module.verbose('Binding popup close event to document');
              jQuerydocument
                .on('click' + eventNamespace, function(event) {
                  module.verbose('Pop-up clickaway intent detected');
                  jQuery.proxy(module.hideGracefully, element)(event);
                })
              ;
            }
          }
        },

        unbind: {
          close: function() {
            if(settings.hideOnScroll === true || settings.hideOnScroll == 'auto' && settings.on != 'click') {
              jQuerydocument
                .off('scroll' + eventNamespace, module.hide)
              ;
              jQuerycontext
                .off('scroll' + eventNamespace, module.hide)
              ;
            }
            if(settings.on == 'click' && settings.closable) {
              module.verbose('Removing close event from document');
              jQuerydocument
                .off('click' + eventNamespace)
              ;
            }
          }
        },

        is: {
          active: function() {
            return jQuerymodule.hasClass(className.active);
          },
          animating: function() {
            return ( jQuerypopup && jQuerypopup.is(':animated') || jQuerypopup.hasClass(className.animating) );
          },
          visible: function() {
            return jQuerypopup && jQuerypopup.is(':visible');
          },
          dropdown: function() {
            return jQuerymodule.hasClass(className.dropdown);
          },
          hidden: function() {
            return !module.is.visible();
          }
        },

        reset: function() {
          module.remove.visible();
          if(settings.preserve || settings.popup) {
            if(jQuery.fn.transition !== undefined) {
              jQuerypopup
                .transition('remove transition')
              ;
            }
          }
          else {
            module.removePopup();
          }
        },

        setting: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            jQuery.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                jQuery.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            jQuery.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( jQuery.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if(jQuery.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

jQuery.fn.popup.settings = {

  name           : 'Popup',

  debug          : false,
  verbose        : true,
  performance    : true,
  namespace      : 'popup',

  onCreate       : function(){},
  onRemove       : function(){},

  onShow         : function(){},
  onVisible      : function(){},
  onHide         : function(){},
  onHidden       : function(){},

  variation      : '',
  content        : false,
  html           : false,
  title          : false,

  on             : 'hover',
  closable       : true,
  hideOnScroll   : 'auto',

  context        : 'body',
  position       : 'top left',
  delay          : {
    show : 30,
    hide : 0
  },

  setFluidWidth  : true,

  target         : false,
  popup          : false,
  inline         : false,
  preserve       : true,
  hoverable      : false,

  duration       : 200,
  easing         : 'easeOutQuint',
  transition     : 'scale',

  distanceAway   : 0,
  offset         : 0,
  maxSearchDepth : 10,

  error: {
    invalidPosition : 'The position you specified is not a valid position',
    method          : 'The method you called is not defined.'
  },

  metadata: {
    content   : 'content',
    html      : 'html',
    offset    : 'offset',
    position  : 'position',
    title     : 'title',
    variation : 'variation'
  },

  className   : {
    active    : 'active',
    animating : 'animating',
    dropdown  : 'dropdown',
    fluid     : 'fluid',
    loading   : 'loading',
    popup     : 'ui popup',
    position  : 'top left center bottom right',
    visible   : 'visible'
  },

  selector    : {
    popup    : '.ui.popup'
  },

  templates: {
    escape: function(string) {
      var
        badChars     = /[&<>"'`]/g,
        shouldEscape = /[&<>"'`]/,
        escape       = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#x27;",
          "`": "&#x60;"
        },
        escapedChar  = function(chr) {
          return escape[chr];
        }
      ;
      if(shouldEscape.test(string)) {
        return string.replace(badChars, escapedChar);
      }
      return string;
    },
    popup: function(text) {
      var
        html   = '',
        escape = jQuery.fn.popup.settings.templates.escape
      ;
      if(typeof text !== undefined) {
        if(typeof text.title !== undefined && text.title) {
          text.title = escape(text.title);
          html += '<div class="header">' + text.title + '</div>';
        }
        if(typeof text.content !== undefined && text.content) {
          text.content = escape(text.content);
          html += '<div class="content">' + text.content + '</div>';
        }
      }
      return html;
    }
  }

};

// Adds easing
jQuery.extend( jQuery.easing, {
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  }
});


})( jQuery, window , document );

/*
 * # Semantic - Progress
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( jQuery, window, document, undefined ) {

"use strict";

jQuery.fn.progress = function(parameters) {
  var
    jQueryallModules    = jQuery(this),

    moduleSelector = jQueryallModules.selector || '',

    hasTouch       = ('ontouchstart' in document.documentElement),
    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),
    returnedValue
  ;

  jQueryallModules
    .each(function() {
      var
        settings          = ( jQuery.isPlainObject(parameters) )
          ? jQuery.extend(true, {}, jQuery.fn.progress.settings, parameters)
          : jQuery.extend({}, jQuery.fn.progress.settings),

        className       = settings.className,
        metadata        = settings.metadata,
        namespace       = settings.namespace,
        selector        = settings.selector,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        jQuerymodule         = jQuery(this),
        jQuerybar            = jQuery(this).find(selector.bar),
        jQueryprogress       = jQuery(this).find(selector.progress),
        jQuerylabel          = jQuery(this).find(selector.label),

        element         = this,
        instance        = jQuerymodule.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing progress', settings);
          module.read.metadata();
          module.set.initials();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of progress', module);
          instance = module;
          jQuerymodule
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous dropdown for', jQuerymodule);
          jQuerymodule
            .removeData(moduleNamespace)
          ;
          instance = undefined;
        },

        reset: function() {
          module.set.percent(0);
        },

        complete: function() {
          if(module.percent === undefined || module.percent < 100) {
            module.set.percent(100);
          }
        },

        read: {
          metadata: function() {
            if( jQuerymodule.data(metadata.percent) ) {
              module.verbose('Current percent value set from metadata');
              module.percent = jQuerymodule.data(metadata.percent);
            }
            if( jQuerymodule.data(metadata.total) ) {
              module.verbose('Total value set from metadata');
              module.total = jQuerymodule.data(metadata.total);
            }
            if( jQuerymodule.data(metadata.value) ) {
              module.verbose('Current value set from metadata');
              module.value = jQuerymodule.data(metadata.value);
            }
          },
          currentValue: function() {
            return (module.value !== undefined)
              ? module.value
              : false
            ;
          }
        },

        increment: function(incrementValue) {
          var
            total          = module.total || false,
            edgeValue,
            startValue,
            newValue
          ;
          if(total) {
            startValue     = module.value || 0;
            incrementValue = incrementValue || 1;
            newValue       = startValue + incrementValue;
            edgeValue      = module.total;
            module.debug('Incrementing value by', incrementValue, startValue, edgeValue);
            if(newValue > edgeValue ) {
              module.debug('Value cannot increment above total', edgeValue);
              newValue = edgeValue;
            }
            module.set.progress(newValue);
          }
          else {
            startValue     = module.percent || 0;
            incrementValue = incrementValue || module.get.randomValue();
            newValue       = startValue + incrementValue;
            edgeValue      = 100;
            module.debug('Incrementing percentage by', incrementValue, startValue);
            if(newValue > edgeValue ) {
              module.debug('Value cannot increment above 100 percent');
              newValue = edgeValue;
            }
            module.set.progress(newValue);
          }
        },
        decrement: function(decrementValue) {
          var
            total     = module.total || false,
            edgeValue = 0,
            startValue,
            newValue
          ;
          if(total) {
            startValue     =  module.value   || 0;
            decrementValue =  decrementValue || 1;
            newValue       =  startValue - decrementValue;
            module.debug('Decrementing value by', decrementValue, startValue);
          }
          else {
            startValue     =  module.percent || 0;
            decrementValue =  decrementValue || module.get.randomValue();
            newValue       =  startValue - decrementValue;
            module.debug('Decrementing percentage by', decrementValue, startValue);
          }

          if(newValue < edgeValue) {
            module.debug('Value cannot decrement below 0');
            newValue = 0;
          }
          module.set.progress(newValue);
        },

        get: {
          text: function(templateText) {
            var
              value   = module.value || 0,
              total   = module.total || 0,
              percent = module.percent || 0
            ;
            templateText = templateText || '';
            templateText = templateText
              .replace('{value}', value)
              .replace('{total}', total)
              .replace('{percent}', percent)
            ;
            module.debug('Adding variables to progress bar text', templateText);
            return templateText;
          },
          randomValue: function() {
            module.debug('Generating random increment percentage');
            return Math.floor((Math.random() * settings.random.max) + settings.random.min);
          },
          percent: function() {
            return module.percent || 0;
          },
          value: function() {
            return module.value || false;
          },
          total: function() {
            return module.total || false;
          }
        },

        is: {
          success: function() {
            return jQuerymodule.hasClass(className.success);
          },
          warning: function() {
            return jQuerymodule.hasClass(className.warning);
          },
          error: function() {
            return jQuerymodule.hasClass(className.error);
          }
        },

        remove: {
          active: function() {
            module.verbose('Removing active state');
            jQuerymodule.removeClass(className.active);
          },
          success: function() {
            module.verbose('Removing success state');
            jQuerymodule.removeClass(className.success);
          },
          warning: function() {
            module.verbose('Removing warning state');
            jQuerymodule.removeClass(className.warning);
          },
          error: function() {
            module.verbose('Removing error state');
            jQuerymodule.removeClass(className.error);
          }
        },

        set: {
          barWidth: function(value) {
            if(value > 100) {
              module.error(error.tooHigh, value);
            }
            jQuerybar
              .css('width', value + '%')
            ;
          },
          initials: function() {
            if(settings.value) {
              module.verbose('Current value set in settings', settings.value);
              module.value = settings.value;
            }
            if(settings.total) {
              module.verbose('Current total set in settings', settings.total);
              module.total = settings.total;
            }
            if(settings.percent) {
              module.verbose('Current percent set in settings', settings.percent);
              module.percent = settings.percent;
            }
            if(module.percent) {
              module.set.percent(module.percent);
            }
            else if(module.value) {
              module.set.progress(module.value);
            }
          },
          percent: function(percent) {
            percent = (typeof percent == 'string')
              ? +(percent.replace('%', ''))
              : percent
            ;
            if(percent > 0 && percent < 1) {
              module.verbose('Module percentage passed as decimal, converting');
              percent = percent * 100;
            }
            // round percentage
            if(settings.precision === 0) {
              percent = Math.round(percent);
            }
            else {
              percent = Math.round(percent * (10 * settings.precision) / (10 * settings.precision) );
            }
            module.percent = percent;
            if(module.total) {
              module.value = Math.round( (percent / 100) * module.total);
            }
            module.set.barWidth(percent);
            module.set.barLabel();
            if(percent === 100) {
              if(settings.autoSuccess && !(module.is.warning() || module.is.error())) {
                module.set.success();
                module.debug('Automatically triggering success at 100%');
              }
              else {
                module.remove.active();
              }
            }
            else {
              module.set.active();
            }
            jQuery.proxy(settings.onChange, element)(percent, module.value, module.total);
          },
          label: function(text) {
            text = text || '';
            if(text) {
              text = module.get.text(text);
              module.debug('Setting label to text', text);
              jQuerylabel.text(text);
            }
          },
          barLabel: function(text) {
            if(text !== undefined) {
              jQueryprogress.text( module.get.text(text) );
            }
            else if(settings.label == 'ratio' && module.total) {
              module.debug('Adding ratio to bar label');
              jQueryprogress.text( module.get.text(settings.text.ratio) );
            }
            else if(settings.label == 'percent') {
              module.debug('Adding percentage to bar label');
              jQueryprogress.text( module.get.text(settings.text.percent) );
            }
          },
          active: function(text) {
            text = text || settings.text.active;
            module.debug('Setting active state');
            if(settings.showActivity) {
              jQuerymodule.addClass(className.active);
            }
            module.remove.warning();
            module.remove.error();
            module.remove.success();
            if(text) {
              module.set.label(text);
            }
            jQuery.proxy(settings.onActive, element)(module.value, module.total);
          },
          success : function(text) {
            text = text || settings.text.success;
            module.debug('Setting success state');
            jQuerymodule.addClass(className.success);
            module.remove.active();
            module.remove.warning();
            module.remove.error();
            module.complete();
            if(text) {
              module.set.label(text);
            }
            jQuery.proxy(settings.onSuccess, element)(module.total);
          },
          warning : function(text) {
            text = text || settings.text.warning;
            module.debug('Setting warning state');
            jQuerymodule.addClass(className.warning);
            module.remove.active();
            module.remove.success();
            module.remove.error();
            module.complete();
            if(text) {
              module.set.label(text);
            }
            jQuery.proxy(settings.onWarning, element)(module.value, module.total);
          },
          error : function(text) {
            text = text || settings.text.error;
            module.debug('Setting error state');
            jQuerymodule.addClass(className.error);
            module.remove.active();
            module.remove.success();
            module.remove.warning();
            module.complete();
            if(text) {
              module.set.label(text);
            }
            jQuery.proxy(settings.onError, element)(module.value, module.total);
          },
          total: function(totalValue) {
            module.total = totalValue;
          },
          progress: function(value) {
            var
              numericValue = (typeof value === 'string')
                ? (value.replace(/[^\d.]/g, '') !== '')
                  ? +(value.replace(/[^\d.]/g, ''))
                  : false
                : value,
              percentComplete
            ;
            if(!numericValue) {
              module.error(error.nonNumeric);
            }
            if(module.total) {
              module.value    = numericValue;
              percentComplete = (numericValue / module.total) * 100;
              module.debug('Calculating percent complete from total', percentComplete);
              module.set.percent( percentComplete );
            }
            else {
              percentComplete = numericValue;
              module.debug('Setting value to exact percentage value', percentComplete);
              module.set.percent( percentComplete );
            }
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            jQuery.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                jQuery.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            jQuery.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ( jQuery.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if(jQuery.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

jQuery.fn.progress.settings = {

  name         : 'Progress',
  namespace    : 'progress',

  debug        : false,
  verbose      : true,
  performance  : true,

  random       : {
    min : 2,
    max : 5
  },

  autoSuccess  : true,
  showActivity : true,

  label        : 'percent',
  precision    : 1,

  percent      : false,
  total        : false,
  value        : false,

  onChange     : function(percent, value, total){},
  onSuccess    : function(total){},
  onActive     : function(value, total){},
  onError      : function(value, total){},
  onWarning    : function(value, total){},

  error    : {
    method     : 'The method you called is not defined.',
    nonNumeric : 'Progress value is non numeric'
  },

  regExp: {
    variable: /\{\jQuery*[A-z0-9]+\}/g
  },

  metadata: {
    percent : 'percent',
    total   : 'total',
    value   : 'value'
  },

  selector : {
    bar      : '> .bar',
    label    : '> .label',
    progress : '.bar > .progress'
  },

  text : {
    active  : false,
    error   : false,
    success : false,
    warning : false,
    percent : '{percent}%',
    ratio   : '{value} of {total}'
  },

  className : {
    active  : 'active',
    error   : 'error',
    success : 'success',
    warning : 'warning'
  }

};


})( jQuery, window , document );
/*
 * # Semantic - Rating
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function (jQuery, window, document, undefined) {

"use strict";

jQuery.fn.rating = function(parameters) {
  var
    jQueryallModules     = jQuery(this),
    moduleSelector  = jQueryallModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    returnedValue
  ;
  jQueryallModules
    .each(function() {
      var
        settings        = ( jQuery.isPlainObject(parameters) )
          ? jQuery.extend(true, {}, jQuery.fn.rating.settings, parameters)
          : jQuery.extend({}, jQuery.fn.rating.settings),

        namespace       = settings.namespace,
        className       = settings.className,
        metadata        = settings.metadata,
        selector        = settings.selector,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        element         = this,
        instance        = jQuery(this).data(moduleNamespace),

        jQuerymodule         = jQuery(this),
        jQueryicon           = jQuerymodule.find(selector.icon),

        module
      ;

      module = {

        initialize: function() {
          module.verbose('Initializing rating module', settings);

          if(jQueryicon.size() === 0) {
            module.setup.layout();
          }

          if(settings.interactive) {
            module.enable();
          }
          else {
            module.disable();
          }
          if(settings.initialRating) {
            module.debug('Setting initial rating');
            module.setRating(settings.initialRating);
          }
          if( jQuerymodule.data(metadata.rating) ) {
            module.debug('Rating found in metadata');
            module.setRating( jQuerymodule.data(metadata.rating) );
          }
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Instantiating module', settings);
          instance = module;
          jQuerymodule
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous instance', instance);
          jQuerymodule
            .removeData(moduleNamespace)
          ;
          jQueryicon
            .off(eventNamespace)
          ;
        },

        refresh: function() {
          jQueryicon   = jQuerymodule.find(selector.icon);
        },

        setup: {
          layout: function() {
            var
              maxRating = jQuerymodule.data(metadata.maxRating) || settings.maxRating
            ;
            module.debug('Generating icon html dynamically');
            jQuerymodule
              .html(jQuery.fn.rating.settings.templates.icon(maxRating))
            ;
            module.refresh();
          }
        },

        event: {
          mouseenter: function() {
            var
              jQueryactiveIcon = jQuery(this)
            ;
            jQueryactiveIcon
              .nextAll()
                .removeClass(className.selected)
            ;
            jQuerymodule
              .addClass(className.selected)
            ;
            jQueryactiveIcon
              .addClass(className.selected)
                .prevAll()
                .addClass(className.selected)
            ;
          },
          mouseleave: function() {
            jQuerymodule
              .removeClass(className.selected)
            ;
            jQueryicon
              .removeClass(className.selected)
            ;
          },
          click: function() {
            var
              jQueryactiveIcon   = jQuery(this),
              currentRating = module.getRating(),
              rating        = jQueryicon.index(jQueryactiveIcon) + 1,
              canClear      = (settings.clearable == 'auto')
               ? (jQueryicon.size() === 1)
               : settings.clearable
            ;
            if(canClear && currentRating == rating) {
              module.clearRating();
            }
            else {
              module.setRating( rating );
            }
          }
        },

        clearRating: function() {
          module.debug('Clearing current rating');
          module.setRating(0);
        },

        getRating: function() {
          var
            currentRating = jQueryicon.filter('.' + className.active).size()
          ;
          module.verbose('Current rating retrieved', currentRating);
          return currentRating;
        },

        enable: function() {
          module.debug('Setting rating to interactive mode');
          jQueryicon
            .on('mouseenter' + eventNamespace, module.event.mouseenter)
            .on('mouseleave' + eventNamespace, module.event.mouseleave)
            .on('click' + eventNamespace, module.event.click)
          ;
          jQuerymodule
            .removeClass(className.disabled)
          ;
        },

        disable: function() {
          module.debug('Setting rating to read-only mode');
          jQueryicon
            .off(eventNamespace)
          ;
          jQuerymodule
            .addClass(className.disabled)
          ;
        },

        setRating: function(rating) {
          var
            ratingIndex = (rating - 1 >= 0)
              ? (rating - 1)
              : 0,
            jQueryactiveIcon = jQueryicon.eq(ratingIndex)
          ;
          jQuerymodule
            .removeClass(className.selected)
          ;
          jQueryicon
            .removeClass(className.selected)
            .removeClass(className.active)
          ;
          if(rating > 0) {
            module.verbose('Setting current rating to', rating);
            jQueryactiveIcon
              .prevAll()
              .andSelf()
                .addClass(className.active)
            ;
          }
          jQuery.proxy(settings.onRate, element)(rating);
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            jQuery.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if(jQueryallModules.size() > 1) {
              title += ' ' + '(' + jQueryallModules.size() + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                jQuery.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            jQuery.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( jQuery.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if(jQuery.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };
      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

jQuery.fn.rating.settings = {

  name          : 'Rating',
  namespace     : 'rating',

  debug         : false,
  verbose       : true,
  performance   : true,

  initialRating : 0,
  interactive   : true,
  maxRating     : 4,
  clearable     : 'auto',

  onRate        : function(rating){},

  error         : {
    method    : 'The method you called is not defined',
    noMaximum : 'No maximum rating specified. Cannot generate HTML automatically'
  },


  metadata: {
    rating    : 'rating',
    maxRating : 'maxRating'
  },

  className : {
    active   : 'active',
    disabled : 'disabled',
    selected : 'selected',
    loading  : 'loading'
  },

  selector  : {
    icon : '.icon'
  },

  templates: {
    icon: function(maxRating) {
      var
        icon = 1,
        html = ''
      ;
      while(icon <= maxRating) {
        html += '<i class="icon"></i>';
        icon++;
      }
      return html;
    }
  }

};

})( jQuery, window , document );

/*
 * # Semantic - Search
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function (jQuery, window, document, undefined) {

"use strict";

jQuery.fn.search = function(parameters) {
  var
    jQueryallModules     = jQuery(this),
    moduleSelector  = jQueryallModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    returnedValue
  ;
  jQuery(this)
    .each(function() {
      var
        settings        = jQuery.extend(true, {}, jQuery.fn.search.settings, parameters),

        className       = settings.className,
        selector        = settings.selector,
        error           = settings.error,
        namespace       = settings.namespace,

        eventNamespace  = '.' + namespace,
        moduleNamespace = namespace + '-module',

        jQuerymodule         = jQuery(this),
        jQueryprompt         = jQuerymodule.find(selector.prompt),
        jQuerysearchButton   = jQuerymodule.find(selector.searchButton),
        jQueryresults        = jQuerymodule.find(selector.results),
        jQueryresult         = jQuerymodule.find(selector.result),
        jQuerycategory       = jQuerymodule.find(selector.category),

        element         = this,
        instance        = jQuerymodule.data(moduleNamespace),

        module
      ;
      module = {

        initialize: function() {
          module.verbose('Initializing module');
          var
            prompt = jQueryprompt[0],
            inputEvent   = (prompt !== undefined && prompt.oninput !== undefined)
              ? 'input'
              : (prompt !== undefined && prompt.onpropertychange !== undefined)
                ? 'propertychange'
                : 'keyup'
          ;
          if(settings.automatic) {
            jQueryprompt
              .on(inputEvent + eventNamespace, module.search.throttle)
            ;
          }
          jQueryprompt
            .on('focus' + eventNamespace, module.event.focus)
            .on('blur' + eventNamespace, module.event.blur)
            .on('keydown' + eventNamespace, module.handleKeyboard)
          ;
          jQuerysearchButton
            .on('click' + eventNamespace, module.search.query)
          ;
          jQueryresults
            .on('mousedown' + eventNamespace, module.event.mousedown)
            .on('mouseup' + eventNamespace, module.event.mouseup)
            .on('click' + eventNamespace, selector.result, module.results.select)
          ;
          module.instantiate();
        },
        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          jQuerymodule
            .data(moduleNamespace, module)
          ;
        },
        destroy: function() {
          module.verbose('Destroying instance');
          jQuerymodule
            .removeData(moduleNamespace)
          ;
          jQueryprompt
            .off(eventNamespace)
          ;
          jQuerysearchButton
            .off(eventNamespace)
          ;
          jQueryresults
            .off(eventNamespace)
          ;
        },
        event: {
          focus: function() {
            jQuerymodule
              .addClass(className.focus)
            ;
            clearTimeout(module.timer);
            module.search.throttle();
            if(module.has.minimum())  {
              module.results.show();
            }
          },
          mousedown: function() {
            module.resultsClicked = true;
          },
          mouseup: function() {
            module.resultsClicked = false;
          },
          blur: function(event) {
            module.search.cancel();
            jQuerymodule
              .removeClass(className.focus)
            ;
            if(!module.resultsClicked) {
              module.timer = setTimeout(module.results.hide, settings.hideDelay);
            }
          }
        },
        handleKeyboard: function(event) {
          var
            // force latest jq dom
            jQueryresult       = jQuerymodule.find(selector.result),
            jQuerycategory     = jQuerymodule.find(selector.category),
            keyCode       = event.which,
            keys          = {
              backspace : 8,
              enter     : 13,
              escape    : 27,
              upArrow   : 38,
              downArrow : 40
            },
            activeClass  = className.active,
            currentIndex = jQueryresult.index( jQueryresult.filter('.' + activeClass) ),
            resultSize   = jQueryresult.size(),
            newIndex
          ;
          // search shortcuts
          if(keyCode == keys.escape) {
            module.verbose('Escape key pressed, blurring search field');
            jQueryprompt
              .trigger('blur')
            ;
          }
          // result shortcuts
          if(jQueryresults.filter(':visible').size() > 0) {
            if(keyCode == keys.enter) {
              module.verbose('Enter key pressed, selecting active result');
              if( jQueryresult.filter('.' + activeClass).size() > 0 ) {
                jQuery.proxy(module.results.select, jQueryresult.filter('.' + activeClass) )(event);
                event.preventDefault();
                return false;
              }
            }
            else if(keyCode == keys.upArrow) {
              module.verbose('Up key pressed, changing active result');
              newIndex = (currentIndex - 1 < 0)
                ? currentIndex
                : currentIndex - 1
              ;
              jQuerycategory
                .removeClass(activeClass)
              ;
              jQueryresult
                .removeClass(activeClass)
                .eq(newIndex)
                  .addClass(activeClass)
                  .closest(jQuerycategory)
                    .addClass(activeClass)
              ;
              event.preventDefault();
            }
            else if(keyCode == keys.downArrow) {
              module.verbose('Down key pressed, changing active result');
              newIndex = (currentIndex + 1 >= resultSize)
                ? currentIndex
                : currentIndex + 1
              ;
              jQuerycategory
                .removeClass(activeClass)
              ;
              jQueryresult
                .removeClass(activeClass)
                .eq(newIndex)
                  .addClass(activeClass)
                  .closest(jQuerycategory)
                    .addClass(activeClass)
              ;
              event.preventDefault();
            }
          }
          else {
            // query shortcuts
            if(keyCode == keys.enter) {
              module.verbose('Enter key pressed, executing query');
              module.search.query();
              jQuerysearchButton
                .addClass(className.down)
              ;
              jQueryprompt
                .one('keyup', function(){
                  jQuerysearchButton
                    .removeClass(className.down)
                  ;
                })
              ;
            }
          }
        },
        has: {
          minimum: function() {
            var
              searchTerm    = jQueryprompt.val(),
              numCharacters = searchTerm.length
            ;
            return (numCharacters >= settings.minCharacters);
          }
        },
        search: {
          cancel: function() {
            var
              xhr = jQuerymodule.data('xhr') || false
            ;
            if( xhr && xhr.state() != 'resolved') {
              module.debug('Cancelling last search');
              xhr.abort();
            }
          },
          throttle: function() {
            clearTimeout(module.timer);
            if(module.has.minimum())  {
              module.timer = setTimeout(module.search.query, settings.searchDelay);
            }
            else {
              module.results.hide();
            }
          },
          query: function() {
            var
              searchTerm = jQueryprompt.val(),
              cachedHTML = module.search.cache.read(searchTerm)
            ;
            if(cachedHTML) {
              module.debug("Reading result for '" + searchTerm + "' from cache");
              module.results.add(cachedHTML);
            }
            else {
              module.debug("Querying for '" + searchTerm + "'");
              if(jQuery.isPlainObject(settings.source) || jQuery.isArray(settings.source)) {
                module.search.local(searchTerm);
              }
              else if(settings.apiSettings) {
                module.search.remote(searchTerm);
              }
              else if(jQuery.fn.api !== undefined && jQuery.api.settings.api.search !== undefined) {
                module.debug('Searching with default search API endpoint');
                settings.apiSettings = {
                  action: 'search'
                };
                module.search.remote(searchTerm);
              }
              else {
                module.error(error.source);
              }
              jQuery.proxy(settings.onSearchQuery, jQuerymodule)(searchTerm);
            }
          },
          local: function(searchTerm) {
            var
              results   = [],
              fullTextResults = [],
              searchFields    = jQuery.isArray(settings.searchFields)
                ? settings.searchFields
                : [settings.searchFields],
              searchRegExp   = new RegExp('(?:\s|^)' + searchTerm, 'i'),
              fullTextRegExp = new RegExp(searchTerm, 'i'),
              searchHTML
            ;
            jQuerymodule
              .addClass(className.loading)
            ;
            // iterate through search fields in array order
            jQuery.each(searchFields, function(index, field) {
              jQuery.each(settings.source, function(label, content) {
                var
                  fieldExists = (typeof content[field] == 'string'),
                  notAlreadyResult = (jQuery.inArray(content, results) == -1 && jQuery.inArray(content, fullTextResults) == -1)
                ;
                if(fieldExists && notAlreadyResult) {
                  if( searchRegExp.test( content[field] ) ) {
                    results.push(content);
                  }
                  else if( settings.searchFullText && fullTextRegExp.test( content[field] ) ) {
                    fullTextResults.push(content);
                  }
                }
              });
            });
            searchHTML = module.results.generate({
              results: jQuery.merge(results, fullTextResults)
            });
            jQuerymodule
              .removeClass(className.loading)
            ;
            module.search.cache.write(searchTerm, searchHTML);
            module.results.add(searchHTML);
          },
          remote: function(searchTerm) {
            var
              apiSettings = {
                stateContext : jQuerymodule,
                urlData      : {
                  query: searchTerm
                },
                onSuccess : function(response) {
                  searchHTML = module.results.generate(response);
                  module.search.cache.write(searchTerm, searchHTML);
                  module.results.add(searchHTML);
                },
                onFailure : module.error
              },
              searchHTML
            ;
            module.search.cancel();
            module.debug('Executing search');
            jQuery.extend(true, apiSettings, settings.apiSettings);
            jQuery.api(apiSettings);
          },

          cache: {
            read: function(name) {
              var
                cache = jQuerymodule.data('cache')
              ;
              return (settings.cache && (typeof cache == 'object') && (cache[name] !== undefined) )
                ? cache[name]
                : false
              ;
            },
            write: function(name, value) {
              var
                cache = (jQuerymodule.data('cache') !== undefined)
                  ? jQuerymodule.data('cache')
                  : {}
              ;
              cache[name] = value;
              jQuerymodule
                .data('cache', cache)
              ;
            }
          }
        },

        results: {
          generate: function(response) {
            module.debug('Generating html from response', response);
            var
              template = settings.templates[settings.type],
              html     = ''
            ;
            if((jQuery.isPlainObject(response.results) && !jQuery.isEmptyObject(response.results)) || (jQuery.isArray(response.results) && response.results.length > 0) ) {
              if(settings.maxResults > 0) {
                response.results = jQuery.isArray(response.results)
                  ? response.results.slice(0, settings.maxResults)
                  : response.results
                ;
              }
              if(jQuery.isFunction(template)) {
                html = template(response);
              }
              else {
                module.error(error.noTemplate, false);
              }
            }
            else {
              html = module.message(error.noResults, 'empty');
            }
            jQuery.proxy(settings.onResults, jQuerymodule)(response);
            return html;
          },
          add: function(html) {
            if(settings.onResultsAdd == 'default' || jQuery.proxy(settings.onResultsAdd, jQueryresults)(html) == 'default') {
              jQueryresults
                .html(html)
              ;
            }
            module.results.show();
          },
          show: function() {
            if( (jQueryresults.filter(':visible').size() === 0) && (jQueryprompt.filter(':focus').size() > 0) && jQueryresults.html() !== '') {
              if(settings.transition && jQuery.fn.transition !== undefined && jQuerymodule.transition('is supported') && !jQueryresults.transition('is inward')) {
                module.debug('Showing results with css animations');
                jQueryresults
                  .transition({
                    animation  : settings.transition + ' in',
                    duration   : settings.duration,
                    queue      : true
                  })
                ;
              }
              else {
                module.debug('Showing results with javascript');
                jQueryresults
                  .stop()
                  .fadeIn(settings.duration, settings.easing)
                ;
              }
              jQuery.proxy(settings.onResultsOpen, jQueryresults)();
            }
          },
          hide: function() {
            if(jQueryresults.filter(':visible').size() > 0) {
              if(settings.transition && jQuery.fn.transition !== undefined && jQuerymodule.transition('is supported') && !jQueryresults.transition('is outward')) {
                module.debug('Hiding results with css animations');
                jQueryresults
                  .transition({
                    animation  : settings.transition + ' out',
                    duration   : settings.duration,
                    queue      : true
                  })
                ;
              }
              else {
                module.debug('Hiding results with javascript');
                jQueryresults
                  .stop()
                  .fadeIn(settings.duration, settings.easing)
                ;
              }
              jQuery.proxy(settings.onResultsClose, jQueryresults)();
            }
          },
          select: function(event) {
            module.debug('Search result selected');
            var
              jQueryresult = jQuery(this),
              jQuerytitle  = jQueryresult.find('.title'),
              title   = jQuerytitle.html()
            ;
            if(settings.onSelect == 'default' || jQuery.proxy(settings.onSelect, this)(event) == 'default') {
              var
                jQuerylink  = jQueryresult.find('a[href]').eq(0),
                jQuerytitle = jQueryresult.find(selector.title).eq(0),
                href   = jQuerylink.attr('href') || false,
                target = jQuerylink.attr('target') || false,
                name   = (jQuerytitle.size() > 0)
                  ? jQuerytitle.text()
                  : false
              ;
              module.results.hide();
              if(name) {
                jQueryprompt.val(name);
              }
              if(href) {
                if(target == '_blank' || event.ctrlKey) {
                  window.open(href);
                }
                else {
                  window.location.href = (href);
                }
              }
            }
          }
        },

        // displays mesage visibly in search results
        message: function(text, type) {
          type = type || 'standard';
          module.results.add( settings.templates.message(text, type) );
          return settings.templates.message(text, type);
        },

        setting: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            jQuery.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if(jQueryallModules.size() > 1) {
              title += ' ' + '(' + jQueryallModules.size() + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                jQuery.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            jQuery.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( jQuery.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if(jQuery.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };
      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }

    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

jQuery.fn.search.settings = {

  name           : 'Search Module',
  namespace      : 'search',

  debug          : false,
  verbose        : true,
  performance    : true,

  // api config
  apiSettings    : false,
  type           : 'standard',
  minCharacters  : 1,

  source         : false,
  searchFields   : [
    'title',
    'description'
  ],
  searchFullText : true,

  automatic      : 'true',
  hideDelay      : 0,
  searchDelay    : 300,
  maxResults     : 7,
  cache          : true,

  transition     : 'scale',
  duration       : 300,
  easing         : 'easeOutExpo',

  // onSelect default action is defined in module
  onSelect       : 'default',
  onResultsAdd   : 'default',

  onSearchQuery  : function(){},
  onResults      : function(response){},

  onResultsOpen  : function(){},
  onResultsClose : function(){},

  className: {
    active  : 'active',
    down    : 'down',
    focus   : 'focus',
    empty   : 'empty',
    loading : 'loading'
  },

  error : {
    source      : 'Cannot search. No source used, and Semantic API module was not included',
    noResults   : 'Your search returned no results',
    logging     : 'Error in debug logging, exiting.',
    noTemplate  : 'A valid template name was not specified.',
    serverError : 'There was an issue with querying the server.',
    method      : 'The method you called is not defined.'
  },

  selector : {
    prompt       : '.prompt',
    searchButton : '.search.button',
    results      : '.results',
    category     : '.category',
    result       : '.result',
    title        : '.title, .name'
  },

  templates: {
    escape: function(string) {
      var
        badChars     = /[&<>"'`]/g,
        shouldEscape = /[&<>"'`]/,
        escape       = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#x27;",
          "`": "&#x60;"
        },
        escapedChar  = function(chr) {
          return escape[chr];
        }
      ;
      if(shouldEscape.test(string)) {
        return string.replace(badChars, escapedChar);
      }
      return string;
    },
    message: function(message, type) {
      var
        html = ''
      ;
      if(message !== undefined && type !== undefined) {
        html +=  ''
          + '<div class="message ' + type + '">'
        ;
        // message type
        if(type == 'empty') {
          html += ''
            + '<div class="header">No Results</div class="header">'
            + '<div class="description">' + message + '</div class="description">'
          ;
        }
        else {
          html += ' <div class="description">' + message + '</div>';
        }
        html += '</div>';
      }
      return html;
    },
    category: function(response) {
      var
        html = '',
        escape = jQuery.fn.search.settings.templates.escape
      ;
      if(response.results !== undefined) {
        // each category
        jQuery.each(response.results, function(index, category) {
          if(category.results !== undefined && category.results.length > 0) {
            html  += ''
              + '<div class="category">'
              + '<div class="name">' + category.name + '</div>'
            ;
            // each item inside category
            jQuery.each(category.results, function(index, result) {
              html  += '<div class="result">';
              if(result.url) {
                html  += '<a href="' + result.url + '"></a>';
              }
              if(result.image !== undefined) {
                result.image = escape(result.image);
                html += ''
                  + '<div class="image">'
                  + ' <img src="' + result.image + '" alt="">'
                  + '</div>'
                ;
              }
              html += '<div class="content">';
              if(result.price !== undefined) {
                result.price = escape(result.price);
                html += '<div class="price">' + result.price + '</div>';
              }
              if(result.title !== undefined) {
                result.title = escape(result.title);
                html += '<div class="title">' + result.title + '</div>';
              }
              if(result.description !== undefined) {
                html += '<div class="description">' + result.description + '</div>';
              }
              html  += ''
                + '</div>'
                + '</div>'
              ;
            });
            html  += ''
              + '</div>'
            ;
          }
        });
        if(response.action) {
          html += ''
          + '<a href="' + response.action.url + '" class="action">'
          +   response.action.text
          + '</a>';
        }
        return html;
      }
      return false;
    },
    standard: function(response) {
      var
        html = ''
      ;
      if(response.results !== undefined) {

        // each result
        jQuery.each(response.results, function(index, result) {
          if(result.url) {
            html  += '<a class="result" href="' + result.url + '">';
          }
          else {
            html  += '<a class="result">';
          }
          if(result.image !== undefined) {
            html += ''
              + '<div class="image">'
              + ' <img src="' + result.image + '">'
              + '</div>'
            ;
          }
          html += '<div class="content">';
          if(result.price !== undefined) {
            html += '<div class="price">' + result.price + '</div>';
          }
          if(result.title !== undefined) {
            html += '<div class="title">' + result.title + '</div>';
          }
          if(result.description !== undefined) {
            html += '<div class="description">' + result.description + '</div>';
          }
          html  += ''
            + '</div>'
          ;
          html += '</a>';
        });

        if(response.action) {
          html += ''
          + '<a href="' + response.action.url + '" class="action">'
          +   response.action.text
          + '</a>';
        }
        return html;
      }
      return false;
    }
  }
};

})( jQuery, window , document );

/*
 * # Semantic - Shape
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( jQuery, window, document, undefined ) {

"use strict";

jQuery.fn.shape = function(parameters) {
  var
    jQueryallModules     = jQuery(this),
    jQuerybody           = jQuery('body'),

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    returnedValue
  ;

  jQueryallModules
    .each(function() {
      var
        moduleSelector  = jQueryallModules.selector || '',
        settings        = jQuery.extend(true, {}, jQuery.fn.shape.settings, parameters),

        // internal aliases
        namespace     = settings.namespace,
        selector      = settings.selector,
        error         = settings.error,
        className     = settings.className,

        // define namespaces for modules
        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        // selector cache
        jQuerymodule       = jQuery(this),
        jQuerysides        = jQuerymodule.find(selector.sides),
        jQueryside         = jQuerymodule.find(selector.side),

        // private variables
        nextIndex = false,
        jQueryactiveSide,
        jQuerynextSide,

        // standard module
        element       = this,
        instance      = jQuerymodule.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          module.verbose('Initializing module for', element);
          module.set.defaultSide();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          jQuerymodule
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module for', element);
          jQuerymodule
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing selector cache for', element);
          jQuerymodule = jQuery(element);
          jQuerysides  = jQuery(this).find(selector.shape);
          jQueryside   = jQuery(this).find(selector.side);
        },

        repaint: function() {
          module.verbose('Forcing repaint event');
          var
            shape          = jQuerysides.get(0) || document.createElement('div'),
            fakeAssignment = shape.offsetWidth
          ;
        },

        animate: function(propertyObject, callback) {
          module.verbose('Animating box with properties', propertyObject);
          callback = callback || function(event) {
            module.verbose('Executing animation callback');
            if(event !== undefined) {
              event.stopPropagation();
            }
            module.reset();
            module.set.active();
          };
          jQuery.proxy(settings.beforeChange, jQuerynextSide[0])();
          if(module.get.transitionEvent()) {
            module.verbose('Starting CSS animation');
            jQuerymodule
              .addClass(className.animating)
            ;
            jQuerysides
              .css(propertyObject)
              .one(module.get.transitionEvent(), callback)
            ;
            module.set.duration(settings.duration);
            requestAnimationFrame(function() {
              jQuerymodule
                .addClass(className.animating)
              ;
              jQueryactiveSide
                .addClass(className.hidden)
              ;
            });
          }
          else {
            callback();
          }
        },

        queue: function(method) {
          module.debug('Queueing animation of', method);
          jQuerysides
            .one(module.get.transitionEvent(), function() {
              module.debug('Executing queued animation');
              setTimeout(function(){
                jQuerymodule.shape(method);
              }, 0);
            })
          ;
        },

        reset: function() {
          module.verbose('Animating states reset');
          jQuerymodule
            .removeClass(className.animating)
            .attr('style', '')
            .removeAttr('style')
          ;
          // removeAttr style does not consistently work in safari
          jQuerysides
            .attr('style', '')
            .removeAttr('style')
          ;
          jQueryside
            .attr('style', '')
            .removeAttr('style')
            .removeClass(className.hidden)
          ;
          jQuerynextSide
            .removeClass(className.animating)
            .attr('style', '')
            .removeAttr('style')
          ;
        },

        is: {
          complete: function() {
            return (jQueryside.filter('.' + className.active)[0] == jQuerynextSide[0]);
          },
          animating: function() {
            return jQuerymodule.hasClass(className.animating);
          }
        },

        set: {

          defaultSide: function() {
            jQueryactiveSide = jQuerymodule.find('.' + settings.className.active);
            jQuerynextSide   = ( jQueryactiveSide.next(selector.side).size() > 0 )
              ? jQueryactiveSide.next(selector.side)
              : jQuerymodule.find(selector.side).first()
            ;
            nextIndex = false;
            module.verbose('Active side set to', jQueryactiveSide);
            module.verbose('Next side set to', jQuerynextSide);
          },

          duration: function(duration) {
            duration = duration || settings.duration;
            duration = (typeof duration == 'number')
              ? duration + 'ms'
              : duration
            ;
            module.verbose('Setting animation duration', duration);
            jQuerysides.add(jQueryside)
              .css({
                '-webkit-transition-duration': duration,
                '-moz-transition-duration': duration,
                '-ms-transition-duration': duration,
                '-o-transition-duration': duration,
                'transition-duration': duration
              })
            ;
          },

          stageSize: function() {
            var
              jQueryclone      = jQuerymodule.clone().addClass(className.loading),
              jQueryactiveSide = jQueryclone.find('.' + settings.className.active),
              jQuerynextSide   = (nextIndex)
                ? jQueryclone.find(selector.side).eq(nextIndex)
                : ( jQueryactiveSide.next(selector.side).size() > 0 )
                  ? jQueryactiveSide.next(selector.side)
                  : jQueryclone.find(selector.side).first(),
              newSize = {}
            ;
            jQueryactiveSide.removeClass(className.active);
            jQuerynextSide.addClass(className.active);
            jQueryclone.insertAfter(jQuerymodule);
            newSize = {
              width  : jQuerynextSide.outerWidth(),
              height : jQuerynextSide.outerHeight()
            };
            jQueryclone.remove();
            jQuerymodule
              .css(newSize)
            ;
            module.verbose('Resizing stage to fit new content', newSize);
          },

          nextSide: function(selector) {
            nextIndex = selector;
            jQuerynextSide = jQueryside.filter(selector);
            nextIndex = jQueryside.index(jQuerynextSide);
            if(jQuerynextSide.size() === 0) {
              module.set.defaultSide();
              module.error(error.side);
            }
            module.verbose('Next side manually set to', jQuerynextSide);
          },

          active: function() {
            module.verbose('Setting new side to active', jQuerynextSide);
            jQueryside
              .removeClass(className.active)
            ;
            jQuerynextSide
              .addClass(className.active)
            ;
            jQuery.proxy(settings.onChange, jQuerynextSide[0])();
            module.set.defaultSide();
          }
        },

        flip: {

          up: function() {
            if(module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
              module.debug('Side already visible', jQuerynextSide);
              return;
            }
            if( !module.is.animating()) {
              module.debug('Flipping up', jQuerynextSide);
              module.set.stageSize();
              module.stage.above();
              module.animate( module.get.transform.up() );
            }
            else {
              module.queue('flip up');
            }
          },

          down: function() {
            if(module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
              module.debug('Side already visible', jQuerynextSide);
              return;
            }
            if( !module.is.animating()) {
              module.debug('Flipping down', jQuerynextSide);
              module.set.stageSize();
              module.stage.below();
              module.animate( module.get.transform.down() );
            }
            else {
              module.queue('flip down');
            }
          },

          left: function() {
            if(module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
              module.debug('Side already visible', jQuerynextSide);
              return;
            }
            if( !module.is.animating()) {
              module.debug('Flipping left', jQuerynextSide);
              module.set.stageSize();
              module.stage.left();
              module.animate(module.get.transform.left() );
            }
            else {
              module.queue('flip left');
            }
          },

          right: function() {
            if(module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
              module.debug('Side already visible', jQuerynextSide);
              return;
            }
            if( !module.is.animating()) {
              module.debug('Flipping right', jQuerynextSide);
              module.set.stageSize();
              module.stage.right();
              module.animate(module.get.transform.right() );
            }
            else {
              module.queue('flip right');
            }
          },

          over: function() {
            if(module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
              module.debug('Side already visible', jQuerynextSide);
              return;
            }
            if( !module.is.animating()) {
              module.debug('Flipping over', jQuerynextSide);
              module.set.stageSize();
              module.stage.behind();
              module.animate(module.get.transform.over() );
            }
            else {
              module.queue('flip over');
            }
          },

          back: function() {
            if(module.is.complete() && !module.is.animating() && !settings.allowRepeats) {
              module.debug('Side already visible', jQuerynextSide);
              return;
            }
            if( !module.is.animating()) {
              module.debug('Flipping back', jQuerynextSide);
              module.set.stageSize();
              module.stage.behind();
              module.animate(module.get.transform.back() );
            }
            else {
              module.queue('flip back');
            }
          }

        },

        get: {

          transform: {
            up: function() {
              var
                translate = {
                  y: -((jQueryactiveSide.outerHeight() - jQuerynextSide.outerHeight()) / 2),
                  z: -(jQueryactiveSide.outerHeight() / 2)
                }
              ;
              return {
                transform: 'translateY(' + translate.y + 'px) translateZ('+ translate.z + 'px) rotateX(-90deg)'
              };
            },

            down: function() {
              var
                translate = {
                  y: -((jQueryactiveSide.outerHeight() - jQuerynextSide.outerHeight()) / 2),
                  z: -(jQueryactiveSide.outerHeight() / 2)
                }
              ;
              return {
                transform: 'translateY(' + translate.y + 'px) translateZ('+ translate.z + 'px) rotateX(90deg)'
              };
            },

            left: function() {
              var
                translate = {
                  x : -((jQueryactiveSide.outerWidth() - jQuerynextSide.outerWidth()) / 2),
                  z : -(jQueryactiveSide.outerWidth() / 2)
                }
              ;
              return {
                transform: 'translateX(' + translate.x + 'px) translateZ(' + translate.z + 'px) rotateY(90deg)'
              };
            },

            right: function() {
              var
                translate = {
                  x : -((jQueryactiveSide.outerWidth() - jQuerynextSide.outerWidth()) / 2),
                  z : -(jQueryactiveSide.outerWidth() / 2)
                }
              ;
              return {
                transform: 'translateX(' + translate.x + 'px) translateZ(' + translate.z + 'px) rotateY(-90deg)'
              };
            },

            over: function() {
              var
                translate = {
                  x : -((jQueryactiveSide.outerWidth() - jQuerynextSide.outerWidth()) / 2)
                }
              ;
              return {
                transform: 'translateX(' + translate.x + 'px) rotateY(180deg)'
              };
            },

            back: function() {
              var
                translate = {
                  x : -((jQueryactiveSide.outerWidth() - jQuerynextSide.outerWidth()) / 2)
                }
              ;
              return {
                transform: 'translateX(' + translate.x + 'px) rotateY(-180deg)'
              };
            }
          },

          transitionEvent: function() {
            var
              element     = document.createElement('element'),
              transitions = {
                'transition'       :'transitionend',
                'OTransition'      :'oTransitionEnd',
                'MozTransition'    :'transitionend',
                'WebkitTransition' :'webkitTransitionEnd'
              },
              transition
            ;
            for(transition in transitions){
              if( element.style[transition] !== undefined ){
                return transitions[transition];
              }
            }
          },

          nextSide: function() {
            return ( jQueryactiveSide.next(selector.side).size() > 0 )
              ? jQueryactiveSide.next(selector.side)
              : jQuerymodule.find(selector.side).first()
            ;
          }

        },

        stage: {

          above: function() {
            var
              box = {
                origin : ((jQueryactiveSide.outerHeight() - jQuerynextSide.outerHeight()) / 2),
                depth  : {
                  active : (jQuerynextSide.outerHeight() / 2),
                  next   : (jQueryactiveSide.outerHeight() / 2)
                }
              }
            ;
            module.verbose('Setting the initial animation position as above', jQuerynextSide, box);
            jQueryactiveSide
              .css({
                'transform' : 'rotateY(0deg) translateZ(' + box.depth.active + 'px)'
              })
            ;
            jQuerynextSide
              .addClass(className.animating)
              .css({
                'display'   : 'block',
                'top'       : box.origin + 'px',
                'transform' : 'rotateX(90deg) translateZ(' + box.depth.next + 'px)'
              })
            ;
          },

          below: function() {
            var
              box = {
                origin : ((jQueryactiveSide.outerHeight() - jQuerynextSide.outerHeight()) / 2),
                depth  : {
                  active : (jQuerynextSide.outerHeight() / 2),
                  next   : (jQueryactiveSide.outerHeight() / 2)
                }
              }
            ;
            module.verbose('Setting the initial animation position as below', jQuerynextSide, box);
            jQueryactiveSide
              .css({
                'transform' : 'rotateY(0deg) translateZ(' + box.depth.active + 'px)'
              })
            ;
            jQuerynextSide
              .addClass(className.animating)
              .css({
                'display'   : 'block',
                'top'       : box.origin + 'px',
                'transform' : 'rotateX(-90deg) translateZ(' + box.depth.next + 'px)'
              })
            ;
          },

          left: function() {
            var
              box = {
                origin : ( ( jQueryactiveSide.outerWidth() - jQuerynextSide.outerWidth() ) / 2),
                depth  : {
                  active : (jQuerynextSide.outerWidth() / 2),
                  next   : (jQueryactiveSide.outerWidth() / 2)
                }
              }
            ;
            module.verbose('Setting the initial animation position as left', jQuerynextSide, box);
            jQueryactiveSide
              .css({
                'transform' : 'rotateY(0deg) translateZ(' + box.depth.active + 'px)'
              })
            ;
            jQuerynextSide
              .addClass(className.animating)
              .css({
                'display'   : 'block',
                'left'      : box.origin + 'px',
                'transform' : 'rotateY(-90deg) translateZ(' + box.depth.next + 'px)'
              })
            ;
          },

          right: function() {
            var
              box = {
                origin : ( ( jQueryactiveSide.outerWidth() - jQuerynextSide.outerWidth() ) / 2),
                depth  : {
                  active : (jQuerynextSide.outerWidth() / 2),
                  next   : (jQueryactiveSide.outerWidth() / 2)
                }
              }
            ;
            module.verbose('Setting the initial animation position as left', jQuerynextSide, box);
            jQueryactiveSide
              .css({
                'transform' : 'rotateY(0deg) translateZ(' + box.depth.active + 'px)'
              })
            ;
            jQuerynextSide
              .addClass(className.animating)
              .css({
                'display'   : 'block',
                'left'      : box.origin + 'px',
                'transform' : 'rotateY(90deg) translateZ(' + box.depth.next + 'px)'
              })
            ;
          },

          behind: function() {
            var
              box = {
                origin : ( ( jQueryactiveSide.outerWidth() - jQuerynextSide.outerWidth() ) / 2),
                depth  : {
                  active : (jQuerynextSide.outerWidth() / 2),
                  next   : (jQueryactiveSide.outerWidth() / 2)
                }
              }
            ;
            module.verbose('Setting the initial animation position as behind', jQuerynextSide, box);
            jQueryactiveSide
              .css({
                'transform' : 'rotateY(0deg)'
              })
            ;
            jQuerynextSide
              .addClass(className.animating)
              .css({
                'display'   : 'block',
                'left'      : box.origin + 'px',
                'transform' : 'rotateY(-180deg)'
              })
            ;
          }
        },
        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            jQuery.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if(jQueryallModules.size() > 1) {
              title += ' ' + '(' + jQueryallModules.size() + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                jQuery.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            jQuery.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( jQuery.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if(jQuery.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

jQuery.fn.shape.settings = {

  // module info
  name : 'Shape',

  // debug content outputted to console
  debug      : false,

  // verbose debug output
  verbose    : true,

  // performance data output
  performance: true,

  // event namespace
  namespace  : 'shape',

  // callback occurs on side change
  beforeChange : function() {},
  onChange     : function() {},

  // allow animation to same side
  allowRepeats: false,

  // animation duration
  duration   : 700,

  // possible errors
  error: {
    side   : 'You tried to switch to a side that does not exist.',
    method : 'The method you called is not defined'
  },

  // classnames used
  className   : {
    animating : 'animating',
    hidden    : 'hidden',
    loading   : 'loading',
    active    : 'active'
  },

  // selectors used
  selector    : {
    sides : '.sides',
    side  : '.side'
  }

};


})( jQuery, window , document );
/*
 * # Semantic - Sidebar
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( jQuery, window, document, undefined ) {

"use strict";

jQuery.fn.sidebar = function(parameters) {
  var
    jQueryallModules    = jQuery(this),
    jQueryhead          = jQuery('head'),

    moduleSelector = jQueryallModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    returnedValue
  ;

  jQueryallModules
    .each(function() {
      var
        settings        = ( jQuery.isPlainObject(parameters) )
          ? jQuery.extend(true, {}, jQuery.fn.sidebar.settings, parameters)
          : jQuery.extend({}, jQuery.fn.sidebar.settings),

        selector        = settings.selector,
        className       = settings.className,
        namespace       = settings.namespace,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        jQuerymodule         = jQuery(this),
        jQuerycontext        = jQuery(settings.context),

        jQuerysidebars       = jQuerymodule.children(selector.sidebar),
        jQuerypusher         = jQuerycontext.children(selector.pusher),
        jQuerystyle,

        element         = this,
        instance        = jQuerymodule.data(moduleNamespace),

        currentScroll,
        transitionEvent,

        module
      ;

      module      = {

        initialize: function() {
          module.debug('Initializing sidebar', parameters);

          transitionEvent = module.get.transitionEvent();

          // cache on initialize
          if( module.is.legacy() || settings.legacy) {
            settings.transition = 'overlay';
            settings.useLegacy = true;
          }

          // avoid locking rendering if included in onReady
          requestAnimationFrame(module.setup.layout);

          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          jQuerymodule
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module for', jQuerymodule);
          module.remove.direction();
          jQuerymodule
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        event: {
          clickaway: function(event) {
            if( jQuery(event.target).closest(selector.sidebar).size() === 0 ) {
              module.verbose('User clicked on dimmed page');
              module.hide();
            }
          },
          touch: function(event) {
            //event.stopPropagation();
          },
          containScroll: function(event) {
            if(element.scrollTop <= 0)  {
              element.scrollTop = 1;
            }
            if((element.scrollTop + element.offsetHeight) >= element.scrollHeight) {
              element.scrollTop = element.scrollHeight - element.offsetHeight - 1;
            }
          },
          scroll: function(event) {
            if( jQuery(event.target).closest(selector.sidebar).size() === 0 ) {
              event.preventDefault();
            }
          }
        },

        bind: {
          clickaway: function() {
            if(settings.scrollLock) {
              jQuery(window)
                .on('DOMMouseScroll' + eventNamespace, module.event.scroll)
              ;
            }
            jQuery(document)
              .on('touchmove' + eventNamespace, module.event.touch)
            ;
            jQuerymodule
              .on('scroll' + eventNamespace, module.event.containScroll)
            ;
            if(settings.closable) {
              jQuerycontext
                .on('click' + eventNamespace, module.event.clickaway)
                .on('touchend' + eventNamespace, module.event.clickaway)
              ;
            }
          }
        },
        unbind: {
          clickaway: function() {
            jQuerycontext.off(eventNamespace);
            jQuerypusher.off(eventNamespace);
            jQuery(document).off(eventNamespace);
            jQuery(window).off(eventNamespace);
          }
        },

        add: {
          bodyCSS: function(direction, distance) {
            var
              width  = jQuerymodule.outerWidth(),
              height = jQuerymodule.outerHeight(),
              style
            ;
            style  = ''
              + '<style title="' + namespace + '">'
              + ' .ui.visible.left.sidebar ~ .fixed,'
              + ' .ui.visible.left.sidebar ~ .pusher {'
              + '   -webkit-transform: translate3d('+ width + 'px, 0, 0);'
              + '           transform: translate3d('+ width + 'px, 0, 0);'
              + ' }'
              + ' .ui.visible.right.sidebar ~ .fixed,'
              + ' .ui.visible.right.sidebar ~ .pusher {'
              + '   -webkit-transform: translate3d(-'+ width + 'px, 0, 0);'
              + '           transform: translate3d(-'+ width + 'px, 0, 0);'
              + ' }'
              + ' .ui.visible.left.sidebar ~ .ui.visible.right.sidebar ~ .fixed,'
              + ' .ui.visible.left.sidebar ~ .ui.visible.right.sidebar ~ .pusher,'
              + ' .ui.visible.right.sidebar ~ .ui.visible.left.sidebar ~ .fixed,'
              + ' .ui.visible.right.sidebar ~ .ui.visible.left.sidebar ~ .pusher {'
              + '   -webkit-transform: translate3d(0px, 0, 0);'
              + '           transform: translate3d(0px, 0, 0);'
              + ' }'
              + ' .ui.visible.top.sidebar ~ .fixed,'
              + ' .ui.visible.top.sidebar ~ .pusher {'
              + '   -webkit-transform: translate3d(0, ' + height + 'px, 0);'
              + '           transform: translate3d(0, ' + height + 'px, 0);'
              + ' }'
              + ' .ui.visible.bottom.sidebar ~ .fixed,'
              + ' .ui.visible.bottom.sidebar ~ .pusher {'
              + '   -webkit-transform: translate3d(0, -' + height + 'px, 0);'
              + '           transform: translate3d(0, -' + height + 'px, 0);'
              + ' }'
            ;

            /* IE is only browser not to create context with transforms */
            /* https://www.w3.org/Bugs/Public/show_bug.cgi?id=16328 */
            if( module.is.ie() ) {
              style += ''
                + ' .ui.visible.left.sidebar ~ .pusher:after {'
                + '   -webkit-transform: translate3d('+ width + 'px, 0, 0);'
                + '           transform: translate3d('+ width + 'px, 0, 0);'
                + ' }'
                + ' .ui.visible.right.sidebar ~ .pusher:after {'
                + '   -webkit-transform: translate3d(-'+ width + 'px, 0, 0);'
                + '           transform: translate3d(-'+ width + 'px, 0, 0);'
                + ' }'
                + ' .ui.visible.left.sidebar ~ .ui.visible.right.sidebar ~ .pusher:after,'
                + ' .ui.visible.right.sidebar ~ .ui.visible.left.sidebar ~ .pusher:after {'
                + '   -webkit-transform: translate3d(0px, 0, 0);'
                + '           transform: translate3d(0px, 0, 0);'
                + ' }'
                + ' .ui.visible.top.sidebar ~ .pusher:after {'
                + '   -webkit-transform: translate3d(0, ' + height + 'px, 0);'
                + '           transform: translate3d(0, ' + height + 'px, 0);'
                + ' }'
                + ' .ui.visible.bottom.sidebar ~ .pusher:after {'
                + '   -webkit-transform: translate3d(0, -' + height + 'px, 0);'
                + '           transform: translate3d(0, -' + height + 'px, 0);'
                + ' }'
              ;
            }

           style += '</style>';

            jQueryhead.append(style);
            jQuerystyle = jQuery('style[title=' + namespace + ']');
            module.debug('Adding sizing css to head', jQuerystyle);
          }
        },

        refresh: function() {
          module.verbose('Refreshing selector cache');
          jQuerycontext  = jQuery(settings.context);
          jQuerysidebars = jQuerycontext.children(selector.sidebar);
          jQuerypusher   = jQuerycontext.children(selector.pusher);
        },

        repaint: function() {
          module.verbose('Forcing repaint event');
          element.style.display='none';
          element.offsetHeight;
          element.scrollTop = element.scrollTop;
          element.style.display='';
        },

        setup: {
          layout: function() {
            if( jQuerycontext.children(selector.pusher).size() === 0 ) {
              module.debug('Adding wrapper element for sidebar');
              module.error(error.pusher);
              jQuerypusher = jQuery('<div class="pusher" />');
              jQuerycontext
                .children()
                  .not(selector.omitted)
                  .not(jQuerysidebars)
                  .wrapAll(jQuerypusher)
              ;
              module.refresh();
            }
            if(jQuerymodule.nextAll(selector.pusher).size() == 0 || jQuerymodule.nextAll(selector.pusher)[0] !== jQuerypusher[0]) {
              module.debug('Moved sidebar to correct parent element');
              module.error(error.movedSidebar, element);
              jQuerymodule.detach().prependTo(jQuerycontext);
              module.refresh();
            }
            module.set.pushable();
            module.set.direction();
          }
        },

        attachEvents: function(selector, event) {
          var
            jQuerytoggle = jQuery(selector)
          ;
          event = jQuery.isFunction(module[event])
            ? module[event]
            : module.toggle
          ;
          if(jQuerytoggle.size() > 0) {
            module.debug('Attaching sidebar events to element', selector, event);
            jQuerytoggle
              .on('click' + eventNamespace, event)
            ;
          }
          else {
            module.error(error.notFound, selector);
          }
        },

        show: function(callback) {
          var
            animateMethod = (settings.useLegacy)
              ? module.legacyPushPage
              : module.pushPage
          ;
          callback = jQuery.isFunction(callback)
            ? callback
            : function(){}
          ;
          if(module.is.closed()) {
            if(settings.overlay)  {
              module.error(error.overlay);
              settings.transition = 'overlay';
            }
            module.refresh();
            if(module.othersVisible() && module.get.transition() != 'overlay') {
              module.debug('Other sidebars currently open');
              if(settings.exclusive) {
                module.hideOthers();
              }
            }
            animateMethod(function() {
              jQuery.proxy(callback, element)();
              jQuery.proxy(settings.onShow, element)();
            });
            jQuery.proxy(settings.onChange, element)();
            jQuery.proxy(settings.onVisible, element)();
          }
          else {
            module.debug('Sidebar is already visible');
          }
        },

        hide: function(callback) {
          var
            animateMethod = (settings.useLegacy)
              ? module.legacyPullPage
              : module.pullPage
          ;
          callback = jQuery.isFunction(callback)
            ? callback
            : function(){}
          ;
          if(module.is.visible() || module.is.animating()) {
            module.debug('Hiding sidebar', callback);
            animateMethod(function() {
              jQuery.proxy(callback, element)();
              jQuery.proxy(settings.onHidden, element)();
            });
            jQuery.proxy(settings.onChange, element)();
            jQuery.proxy(settings.onHide, element)();
          }
        },

        othersVisible: function() {
          return (jQuerysidebars.not(jQuerymodule).filter('.' + className.visible).size() > 0);
        },
        othersActive: function() {
          return (jQuerysidebars.not(jQuerymodule).filter('.' + className.active).size() > 0);
        },

        hideOthers: function(callback) {
          var
            jQueryotherSidebars = jQuerysidebars.not(jQuerymodule).filter('.' + className.visible),
            callback       = callback || function(){},
            sidebarCount   = jQueryotherSidebars.size(),
            callbackCount  = 0
          ;
          jQueryotherSidebars
            .sidebar('hide', function() {
              callbackCount++;
              if(callbackCount == sidebarCount) {
                callback();
              }
            })
          ;
        },

        toggle: function() {
          module.verbose('Determining toggled direction');
          if(module.is.closed()) {
            module.show();
          }
          else {
            module.hide();
          }
        },

        pushPage: function(callback) {
          var
            transition = module.get.transition(),
            jQuerytransition = (transition == 'safe')
              ? jQuerycontext
              : (transition == 'overlay' || module.othersActive())
                ? jQuerymodule
                : jQuerypusher,
            animate,
            transitionEnd
          ;
          callback = jQuery.isFunction(callback)
            ? callback
            : function(){}
          ;
          if(settings.transition == 'scale down' || (module.is.mobile() && transition !== 'overlay')) {
            module.scrollToTop();
          }
          module.set.transition();
          module.repaint();
          animate = function() {
            module.add.bodyCSS();
            module.set.animating();
            module.set.visible();
            if(!module.othersActive()) {
              if(settings.dimPage) {
                jQuerypusher.addClass(className.dimmed);
              }
            }
          };
          transitionEnd = function(event) {
            if( event.target == jQuerytransition[0] ) {
              jQuerytransition.off(transitionEvent + eventNamespace, transitionEnd);
              module.remove.animating();
              module.bind.clickaway();
              jQuery.proxy(callback, element)();
            }
          };
          jQuerytransition.on(transitionEvent + eventNamespace, transitionEnd);
          requestAnimationFrame(animate);
        },

        pullPage: function(callback) {
          var
            transition = module.get.transition(),
            jQuerytransition = (transition == 'safe')
              ? jQuerycontext
              : (transition == 'overlay' || module.othersActive())
                ? jQuerymodule
                : jQuerypusher,
            animate,
            transitionEnd
          ;
          callback = jQuery.isFunction(callback)
            ? callback
            : function(){}
          ;
          module.verbose('Removing context push state', module.get.direction());
          if(!module.othersActive()) {
            module.unbind.clickaway();
          }
          animate = function() {
            module.set.animating();
            module.remove.visible();
            if(settings.dimPage && !module.othersActive()) {
              jQuerypusher.removeClass(className.dimmed);
            }
          };
          transitionEnd = function(event) {
            if( event.target == jQuerytransition[0] ) {
              jQuerytransition.off(transitionEvent + eventNamespace, transitionEnd);
              module.remove.animating();
              module.remove.transition();
              module.remove.bodyCSS();
              if(transition == 'scale down' || (settings.returnScroll && module.is.mobile()) ) {
                module.scrollBack();
              }
              jQuery.proxy(callback, element)();
            }
          };
          jQuerytransition.on(transitionEvent + eventNamespace, transitionEnd);
          requestAnimationFrame(animate);
        },

        legacyPushPage: function(callback) {
          var
            distance   = jQuerymodule.width(),
            direction  = module.get.direction(),
            properties = {}
          ;
          distance  = distance || jQuerymodule.width();
          callback  = jQuery.isFunction(callback)
            ? callback
            : function(){}
          ;
          properties[direction] = distance;
          module.debug('Using javascript to push context', properties);
          module.set.visible();
          module.set.transition();
          module.set.animating();
          if(settings.dimPage) {
            jQuerypusher.addClass(className.dimmed);
          }
          jQuerycontext
            .css('position', 'relative')
            .animate(properties, settings.duration, settings.easing, function() {
              module.remove.animating();
              module.bind.clickaway();
              jQuery.proxy(callback, module)();
            })
          ;
        },
        legacyPullPage: function(callback) {
          var
            distance   = 0,
            direction  = module.get.direction(),
            properties = {}
          ;
          distance  = distance || jQuerymodule.width();
          callback  = jQuery.isFunction(callback)
            ? callback
            : function(){}
          ;
          properties[direction] = '0px';
          module.debug('Using javascript to pull context', properties);
          module.unbind.clickaway();
          module.set.animating();
          module.remove.visible();
          if(settings.dimPage && !module.othersVisible()) {
            jQuerypusher.removeClass(className.dimmed);
          }
          jQuerycontext
            .css('position', 'relative')
            .animate(properties, settings.duration, settings.easing, function() {
              module.remove.animating();
              jQuery.proxy(callback, module)();
            })
          ;
        },

        scrollToTop: function() {
          module.verbose('Scrolling to top of page to avoid animation issues');
          currentScroll = jQuery(window).scrollTop();
          jQuerymodule.scrollTop(0);
          window.scrollTo(0, 0);
        },

        scrollBack: function() {
          module.verbose('Scrolling back to original page position');
          window.scrollTo(0, currentScroll);
        },

        set: {
          // container
          pushed: function() {
            jQuerycontext.addClass(className.pushed);
          },
          pushable: function() {
            jQuerycontext.addClass(className.pushable);
          },

          // sidebar
          active: function() {
            jQuerymodule.addClass(className.active);
          },
          animating: function() {
            jQuerymodule.addClass(className.animating);
          },
          transition: function(transition) {
            transition = transition || module.get.transition();
            jQuerymodule.addClass(transition);
          },
          direction: function(direction) {
            direction = direction || module.get.direction();
            jQuerymodule.addClass(className[direction]);
          },
          visible: function() {
            jQuerymodule.addClass(className.visible);
          },
          overlay: function() {
            jQuerymodule.addClass(className.overlay);
          }
        },
        remove: {

          bodyCSS: function() {
            module.debug('Removing body css styles', jQuerystyle);
            if(jQuerystyle.size() > 0) {
              jQuerystyle.remove();
            }
          },

          // context
          pushed: function() {
            jQuerycontext.removeClass(className.pushed);
          },
          pushable: function() {
            jQuerycontext.removeClass(className.pushable);
          },

          // sidebar
          active: function() {
            jQuerymodule.removeClass(className.active);
          },
          animating: function() {
            jQuerymodule.removeClass(className.animating);
          },
          transition: function(transition) {
            transition = transition || module.get.transition();
            jQuerymodule.removeClass(transition);
          },
          direction: function(direction) {
            direction = direction || module.get.direction();
            jQuerymodule.removeClass(className[direction]);
          },
          visible: function() {
            jQuerymodule.removeClass(className.visible);
          },
          overlay: function() {
            jQuerymodule.removeClass(className.overlay);
          }
        },

        get: {
          direction: function() {
            if(jQuerymodule.hasClass(className.top)) {
              return className.top;
            }
            else if(jQuerymodule.hasClass(className.right)) {
              return className.right;
            }
            else if(jQuerymodule.hasClass(className.bottom)) {
              return className.bottom;
            }
            return className.left;
          },
          transition: function() {
            var
              direction = module.get.direction(),
              transition
            ;
            return ( module.is.mobile() )
              ? (settings.mobileTransition == 'auto')
                ? settings.defaultTransition.mobile[direction]
                : settings.mobileTransition
              : (settings.transition == 'auto')
                ? settings.defaultTransition.computer[direction]
                : settings.transition
            ;
          },
          transitionEvent: function() {
            var
              element     = document.createElement('element'),
              transitions = {
                'transition'       :'transitionend',
                'OTransition'      :'oTransitionEnd',
                'MozTransition'    :'transitionend',
                'WebkitTransition' :'webkitTransitionEnd'
              },
              transition
            ;
            for(transition in transitions){
              if( element.style[transition] !== undefined ){
                return transitions[transition];
              }
            }
          }
        },

        is: {

          ie: function() {
            var
              isIE11 = (!(window.ActiveXObject) && 'ActiveXObject' in window),
              isIE   = ('ActiveXObject' in window)
            ;
            return (isIE11 || isIE);
          },

          legacy: function() {
            var
              element    = document.createElement('div'),
              transforms = {
                'webkitTransform' :'-webkit-transform',
                'OTransform'      :'-o-transform',
                'msTransform'     :'-ms-transform',
                'MozTransform'    :'-moz-transform',
                'transform'       :'transform'
              },
              has3D
            ;

            // Add it to the body to get the computed style.
            document.body.insertBefore(element, null);
            for (var transform in transforms) {
              if (element.style[transform] !== undefined) {
                element.style[transform] = "translate3d(1px,1px,1px)";
                has3D = window.getComputedStyle(element).getPropertyValue(transforms[transform]);
              }
            }
            document.body.removeChild(element);
            return !(has3D !== undefined && has3D.length > 0 && has3D !== 'none');
          },
          mobile: function() {
            var
              userAgent    = navigator.userAgent,
              mobileRegExp = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/,
              isMobile     = mobileRegExp.test(userAgent)
            ;
            if(isMobile) {
              module.verbose('Browser was found to be mobile', userAgent);
              return true;
            }
            else {
              module.verbose('Browser is not mobile, using regular transition', userAgent);
              return false;
            }
          },
          closed: function() {
            return !module.is.visible();
          },
          visible: function() {
            return jQuerymodule.hasClass(className.visible);
          },
          vertical: function() {
            return jQuerymodule.hasClass(className.top);
          },
          animating: function() {
            return jQuerycontext.hasClass(className.animating);
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            jQuery.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                jQuery.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            jQuery.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ( jQuery.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if(jQuery.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      }
    ;

    if(methodInvoked) {
      if(instance === undefined) {
        module.initialize();
      }
      module.invoke(query);
    }
    else {
      if(instance !== undefined) {
        module.invoke('destroy');
      }
      module.initialize();
    }
  });

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

jQuery.fn.sidebar.settings = {

  name              : 'Sidebar',
  namespace         : 'sidebar',

  debug             : false,
  verbose           : true,
  performance       : true,

  transition        : 'auto',
  mobileTransition  : 'auto',

  defaultTransition : {
    computer: {
      left   : 'uncover',
      right  : 'uncover',
      top    : 'overlay',
      bottom : 'overlay'
    },
    mobile: {
      left   : 'uncover',
      right  : 'uncover',
      top    : 'overlay',
      bottom : 'overlay'
    }
  },

  context           : 'body',
  exclusive         : false,
  closable          : true,
  dimPage           : true,
  scrollLock        : false,
  returnScroll      : false,

  useLegacy         : false,
  duration          : 500,
  easing            : 'easeInOutQuint',

  onChange          : function(){},
  onShow            : function(){},
  onHide            : function(){},

  onHidden          : function(){},
  onVisible         : function(){},

  className         : {
    active    : 'active',
    animating : 'animating',
    dimmed    : 'dimmed',
    pushable  : 'pushable',
    pushed    : 'pushed',
    right     : 'right',
    top       : 'top',
    left      : 'left',
    bottom    : 'bottom',
    visible   : 'visible'
  },

  selector: {
    fixed   : '.fixed',
    omitted : 'script, link, style, .ui.modal, .ui.dimmer, .ui.nag, .ui.fixed',
    pusher  : '.pusher',
    sidebar : '.ui.sidebar'
  },

  error   : {
    method       : 'The method you called is not defined.',
    pusher       : 'Had to add pusher element. For optimal performance make sure body content is inside a pusher element',
    movedSidebar : 'Had to move sidebar. For optimal performance make sure sidebar and pusher are direct children of your body tag',
    overlay      : 'The overlay setting is no longer supported, use animation: overlay',
    notFound     : 'There were no elements that matched the specified selector'
  }

};

// Adds easing
jQuery.extend( jQuery.easing, {
  easeInOutQuint: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  }
});


})( jQuery, window , document );

/*
 * # Semantic - Site
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
;(function ( jQuery, window, document, undefined ) {

jQuery.site = jQuery.fn.site = function(parameters) {
  var
    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),

    settings        = ( jQuery.isPlainObject(parameters) )
      ? jQuery.extend(true, {}, jQuery.site.settings, parameters)
      : jQuery.extend({}, jQuery.site.settings),

    namespace       = settings.namespace,
    error           = settings.error,

    eventNamespace  = '.' + namespace,
    moduleNamespace = 'module-' + namespace,

    jQuerydocument       = jQuery(document),
    jQuerymodule         = jQuerydocument,
    element         = this,
    instance        = jQuerymodule.data(moduleNamespace),

    module,
    returnedValue
  ;
  module = {

    initialize: function() {
      module.instantiate();
    },

    instantiate: function() {
      module.verbose('Storing instance of site', module);
      instance = module;
      jQuerymodule
        .data(moduleNamespace, module)
      ;
    },

    normalize: function() {
      module.fix.console();
      module.fix.requestAnimationFrame();
    },

    fix: {
      console: function() {
        module.debug('Normalizing window.console');
        if (console === undefined || console.log === undefined) {
          module.verbose('Console not available, normalizing events');
          module.disable.console();
        }
        if (typeof console.group == 'undefined' || typeof console.groupEnd == 'undefined' || typeof console.groupCollapsed == 'undefined') {
          module.verbose('Console group not available, normalizing events');
          window.console.group = function() {};
          window.console.groupEnd = function() {};
          window.console.groupCollapsed = function() {};
        }
        if (typeof console.markTimeline == 'undefined') {
          module.verbose('Mark timeline not available, normalizing events');
          window.console.markTimeline = function() {};
        }
      },
      consoleClear: function() {
        module.debug('Disabling programmatic console clearing');
        window.console.clear = function() {};
      },
      requestAnimationFrame: function() {
        module.debug('Normalizing requestAnimationFrame');
        if(window.requestAnimationFrame === undefined) {
          module.debug('RequestAnimationFrame not available, normailizing event');
          window.requestAnimationFrame = window.requestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.msRequestAnimationFrame
            || function(callback) { setTimeout(callback, 0); }
          ;
        }
      }
    },

    moduleExists: function(name) {
      return (jQuery.fn[name] !== undefined && jQuery.fn[name].settings !== undefined);
    },

    enabled: {
      modules: function(modules) {
        var
          enabledModules = []
        ;
        modules = modules || settings.modules;
        jQuery.each(modules, function(index, name) {
          if(module.moduleExists(name)) {
            enabledModules.push(name);
          }
        });
        return enabledModules;
      }
    },

    disabled: {
      modules: function(modules) {
        var
          disabledModules = []
        ;
        modules = modules || settings.modules;
        jQuery.each(modules, function(index, name) {
          if(!module.moduleExists(name)) {
            disabledModules.push(name);
          }
        });
        return disabledModules;
      }
    },

    change: {
      setting: function(setting, value, modules, modifyExisting) {
        modules = (typeof modules === 'string')
          ? (modules === 'all')
            ? settings.modules
            : [modules]
          : modules || settings.modules
        ;
        modifyExisting = (modifyExisting !== undefined)
          ? modifyExisting
          : true
        ;
        jQuery.each(modules, function(index, name) {
          var
            namespace = (module.moduleExists(name))
              ? jQuery.fn[name].settings.namespace || false
              : true,
            jQueryexistingModules
          ;
          if(module.moduleExists(name)) {
            module.verbose('Changing default setting', setting, value, name);
            jQuery.fn[name].settings[setting] = value;
            if(modifyExisting && namespace) {
              jQueryexistingModules = jQuery(':data(module-' + namespace + ')');
              if(jQueryexistingModules.size() > 0) {
                module.verbose('Modifying existing settings', jQueryexistingModules);
                jQueryexistingModules[name]('setting', setting, value);
              }
            }
          }
        });
      },
      settings: function(newSettings, modules, modifyExisting) {
        modules = (typeof modules === 'string')
          ? [modules]
          : modules || settings.modules
        ;
        modifyExisting = (modifyExisting !== undefined)
          ? modifyExisting
          : true
        ;
        jQuery.each(modules, function(index, name) {
          var
            jQueryexistingModules
          ;
          if(module.moduleExists(name)) {
            module.verbose('Changing default setting', newSettings, name);
            jQuery.extend(true, jQuery.fn[name].settings, newSettings);
            if(modifyExisting && namespace) {
              jQueryexistingModules = jQuery(':data(module-' + namespace + ')');
              if(jQueryexistingModules.size() > 0) {
                module.verbose('Modifying existing settings', jQueryexistingModules);
                jQueryexistingModules[name]('setting', newSettings);
              }
            }
          }
        });
      }
    },

    enable: {
      console: function() {
        module.console(true);
      },
      debug: function(modules, modifyExisting) {
        modules = modules || settings.modules;
        module.debug('Enabling debug for modules', modules);
        module.change.setting('debug', true, modules, modifyExisting);
      },
      verbose: function(modules, modifyExisting) {
        modules = modules || settings.modules;
        module.debug('Enabling verbose debug for modules', modules);
        module.change.setting('verbose', true, modules, modifyExisting);
      }
    },
    disable: {
      console: function() {
        module.console(false);
      },
      debug: function(modules, modifyExisting) {
        modules = modules || settings.modules;
        module.debug('Disabling debug for modules', modules);
        module.change.setting('debug', false, modules, modifyExisting);
      },
      verbose: function(modules, modifyExisting) {
        modules = modules || settings.modules;
        module.debug('Disabling verbose debug for modules', modules);
        module.change.setting('verbose', false, modules, modifyExisting);
      }
    },

    console: function(enable) {
      if(enable) {
        if(instance.cache.console === undefined) {
          module.error(error.console);
          return;
        }
        module.debug('Restoring console function');
        window.console = instance.cache.console;
      }
      else {
        module.debug('Disabling console function');
        instance.cache.console = window.console;
        window.console = {
          clear          : function(){},
          error          : function(){},
          group          : function(){},
          groupCollapsed : function(){},
          groupEnd       : function(){},
          info           : function(){},
          log            : function(){},
          markTimeline   : function(){},
          warn           : function(){}
        };
      }
    },

    destroy: function() {
      module.verbose('Destroying previous site for', jQuerymodule);
      jQuerymodule
        .removeData(moduleNamespace)
      ;
    },

    cache: {},

    setting: function(name, value) {
      if( jQuery.isPlainObject(name) ) {
        jQuery.extend(true, settings, name);
      }
      else if(value !== undefined) {
        settings[name] = value;
      }
      else {
        return settings[name];
      }
    },
    internal: function(name, value) {
      if( jQuery.isPlainObject(name) ) {
        jQuery.extend(true, module, name);
      }
      else if(value !== undefined) {
        module[name] = value;
      }
      else {
        return module[name];
      }
    },
    debug: function() {
      if(settings.debug) {
        if(settings.performance) {
          module.performance.log(arguments);
        }
        else {
          module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
          module.debug.apply(console, arguments);
        }
      }
    },
    verbose: function() {
      if(settings.verbose && settings.debug) {
        if(settings.performance) {
          module.performance.log(arguments);
        }
        else {
          module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
          module.verbose.apply(console, arguments);
        }
      }
    },
    error: function() {
      module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
      module.error.apply(console, arguments);
    },
    performance: {
      log: function(message) {
        var
          currentTime,
          executionTime,
          previousTime
        ;
        if(settings.performance) {
          currentTime   = new Date().getTime();
          previousTime  = time || currentTime;
          executionTime = currentTime - previousTime;
          time          = currentTime;
          performance.push({
            'Element'        : element,
            'Name'           : message[0],
            'Arguments'      : [].slice.call(message, 1) || '',
            'Execution Time' : executionTime
          });
        }
        clearTimeout(module.performance.timer);
        module.performance.timer = setTimeout(module.performance.display, 100);
      },
      display: function() {
        var
          title = settings.name + ':',
          totalTime = 0
        ;
        time = false;
        clearTimeout(module.performance.timer);
        jQuery.each(performance, function(index, data) {
          totalTime += data['Execution Time'];
        });
        title += ' ' + totalTime + 'ms';
        if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
          console.groupCollapsed(title);
          if(console.table) {
            console.table(performance);
          }
          else {
            jQuery.each(performance, function(index, data) {
              console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
            });
          }
          console.groupEnd();
        }
        performance = [];
      }
    },
    invoke: function(query, passedArguments, context) {
      var
        object = instance,
        maxDepth,
        found,
        response
      ;
      passedArguments = passedArguments || queryArguments;
      context         = element         || context;
      if(typeof query == 'string' && object !== undefined) {
        query    = query.split(/[\. ]/);
        maxDepth = query.length - 1;
        jQuery.each(query, function(depth, value) {
          var camelCaseValue = (depth != maxDepth)
            ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
            : query
          ;
          if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
            object = object[camelCaseValue];
          }
          else if( object[camelCaseValue] !== undefined ) {
            found = object[camelCaseValue];
            return false;
          }
          else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
            object = object[value];
          }
          else if( object[value] !== undefined ) {
            found = object[value];
            return false;
          }
          else {
            module.error(error.method, query);
            return false;
          }
        });
      }
      if ( jQuery.isFunction( found ) ) {
        response = found.apply(context, passedArguments);
      }
      else if(found !== undefined) {
        response = found;
      }
      if(jQuery.isArray(returnedValue)) {
        returnedValue.push(response);
      }
      else if(returnedValue !== undefined) {
        returnedValue = [returnedValue, response];
      }
      else if(response !== undefined) {
        returnedValue = response;
      }
      return found;
    }
  };

  if(methodInvoked) {
    if(instance === undefined) {
      module.initialize();
    }
    module.invoke(query);
  }
  else {
    if(instance !== undefined) {
      module.destroy();
    }
    module.initialize();
  }
  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

jQuery.site.settings = {

  name        : 'Site',
  namespace   : 'site',

  error : {
    console : 'Console cannot be restored, most likely it was overwritten outside of module',
    method : 'The method you called is not defined.'
  },

  debug       : false,
  verbose     : true,
  performance : true,

  modules: [
    'accordion',
    'api',
    'checkbox',
    'dimmer',
    'dropdown',
    'form',
    'modal',
    'nag',
    'popup',
    'rating',
    'shape',
    'sidebar',
    'state',
    'sticky',
    'tab',
    'transition',
    'video',
    'visit',
    'visibility'
  ],

  siteNamespace   : 'site',
  namespaceStub   : {
    cache     : {},
    config    : {},
    sections  : {},
    section   : {},
    utilities : {}
  }

};

// allows for selection of elements with data attributes
jQuery.extend(jQuery.expr[ ":" ], {
  data: (jQuery.expr.createPseudo)
    ? jQuery.expr.createPseudo(function(dataName) {
        return function(elem) {
          return !!jQuery.data(elem, dataName);
        };
      })
    : function(elem, i, match) {
      // support: jQuery < 1.8
      return !!jQuery.data(elem, match[ 3 ]);
    }
});


})( jQuery, window , document );
/*
 * # Semantic - State
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( jQuery, window, document, undefined ) {

jQuery.fn.state = function(parameters) {
  var
    jQueryallModules     = jQuery(this),

    moduleSelector  = jQueryallModules.selector || '',

    hasTouch        = ('ontouchstart' in document.documentElement),
    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    returnedValue
  ;
  jQueryallModules
    .each(function() {
      var
        settings          = ( jQuery.isPlainObject(parameters) )
          ? jQuery.extend(true, {}, jQuery.fn.state.settings, parameters)
          : jQuery.extend({}, jQuery.fn.state.settings),

        error           = settings.error,
        metadata        = settings.metadata,
        className       = settings.className,
        namespace       = settings.namespace,
        states          = settings.states,
        text            = settings.text,

        eventNamespace  = '.' + namespace,
        moduleNamespace = namespace + '-module',

        jQuerymodule         = jQuery(this),

        element         = this,
        instance        = jQuerymodule.data(moduleNamespace),

        module
      ;
      module = {

        initialize: function() {
          module.verbose('Initializing module');

          // allow module to guess desired state based on element
          if(settings.automatic) {
            module.add.defaults();
          }

          // bind events with delegated events
          if(settings.context && moduleSelector !== '') {
            jQuery(settings.context)
              .on(moduleSelector, 'mouseenter' + eventNamespace, module.change.text)
              .on(moduleSelector, 'mouseleave' + eventNamespace, module.reset.text)
              .on(moduleSelector, 'click'      + eventNamespace, module.toggle.state)
            ;
          }
          else {
            jQuerymodule
              .on('mouseenter' + eventNamespace, module.change.text)
              .on('mouseleave' + eventNamespace, module.reset.text)
              .on('click'      + eventNamespace, module.toggle.state)
            ;
          }
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          jQuerymodule
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module', instance);
          jQuerymodule
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing selector cache');
          jQuerymodule = jQuery(element);
        },

        add: {
          defaults: function() {
            var
              userStates = parameters && jQuery.isPlainObject(parameters.states)
                ? parameters.states
                : {}
            ;
            jQuery.each(settings.defaults, function(type, typeStates) {
              if( module.is[type] !== undefined && module.is[type]() ) {
                module.verbose('Adding default states', type, element);
                jQuery.extend(settings.states, typeStates, userStates);
              }
            });
          }
        },

        is: {

          active: function() {
            return jQuerymodule.hasClass(className.active);
          },
          loading: function() {
            return jQuerymodule.hasClass(className.loading);
          },
          inactive: function() {
            return !( jQuerymodule.hasClass(className.active) );
          },
          state: function(state) {
            if(className[state] === undefined) {
              return false;
            }
            return jQuerymodule.hasClass( className[state] );
          },

          enabled: function() {
            return !( jQuerymodule.is(settings.filter.active) );
          },
          disabled: function() {
            return ( jQuerymodule.is(settings.filter.active) );
          },
          textEnabled: function() {
            return !( jQuerymodule.is(settings.filter.text) );
          },

          // definitions for automatic type detection
          button: function() {
            return jQuerymodule.is('.button:not(a, .submit)');
          },
          input: function() {
            return jQuerymodule.is('input');
          },
          progress: function() {
            return jQuerymodule.is('.ui.progress');
          }
        },

        allow: function(state) {
          module.debug('Now allowing state', state);
          states[state] = true;
        },
        disallow: function(state) {
          module.debug('No longer allowing', state);
          states[state] = false;
        },

        allows: function(state) {
          return states[state] || false;
        },

        enable: function() {
          jQuerymodule.removeClass(className.disabled);
        },

        disable: function() {
          jQuerymodule.addClass(className.disabled);
        },

        setState: function(state) {
          if(module.allows(state)) {
            jQuerymodule.addClass( className[state] );
          }
        },

        removeState: function(state) {
          if(module.allows(state)) {
            jQuerymodule.removeClass( className[state] );
          }
        },

        toggle: {
          state: function() {
            var
              apiRequest
            ;
            if( module.allows('active') && module.is.enabled() ) {
              module.refresh();
              if(jQuery.fn.api !== undefined) {
                apiRequest = jQuerymodule.api('get request');
                if(apiRequest) {
                  module.listenTo(apiRequest);
                  return;
                }
              }
              module.change.state();
            }
          }
        },

        listenTo: function(apiRequest) {
          module.debug('API request detected, waiting for state signal', apiRequest);
          if(apiRequest) {
            if(text.loading) {
              module.update.text(text.loading);
            }
            jQuery.when(apiRequest)
              .then(function() {
                if(apiRequest.state() == 'resolved') {
                  module.debug('API request succeeded');
                  settings.activateTest   = function(){ return true; };
                  settings.deactivateTest = function(){ return true; };
                }
                else {
                  module.debug('API request failed');
                  settings.activateTest   = function(){ return false; };
                  settings.deactivateTest = function(){ return false; };
                }
                module.change.state();
              })
            ;
          }
          // xhr exists but set to false, beforeSend killed the xhr
          else {
            settings.activateTest   = function(){ return false; };
            settings.deactivateTest = function(){ return false; };
          }
        },

        // checks whether active/inactive state can be given
        change: {

          state: function() {
            module.debug('Determining state change direction');
            // inactive to active change
            if( module.is.inactive() ) {
              module.activate();
            }
            else {
              module.deactivate();
            }
            if(settings.sync) {
              module.sync();
            }
            jQuery.proxy(settings.onChange, element)();
          },

          text: function() {
            if( module.is.textEnabled() ) {
              if(module.is.disabled() ) {
                module.verbose('Changing text to disabled text', text.hover);
                module.update.text(text.disabled);
              }
              else if( module.is.active() ) {
                if(text.hover) {
                  module.verbose('Changing text to hover text', text.hover);
                  module.update.text(text.hover);
                }
                else if(text.deactivate) {
                  module.verbose('Changing text to deactivating text', text.deactivate);
                  module.update.text(text.deactivate);
                }
              }
              else {
                if(text.hover) {
                  module.verbose('Changing text to hover text', text.hover);
                  module.update.text(text.hover);
                }
                else if(text.activate){
                  module.verbose('Changing text to activating text', text.activate);
                  module.update.text(text.activate);
                }
              }
            }
          }

        },

        activate: function() {
          if( jQuery.proxy(settings.activateTest, element)() ) {
            module.debug('Setting state to active');
            jQuerymodule
              .addClass(className.active)
            ;
            module.update.text(text.active);
            jQuery.proxy(settings.onActivate, element)();
          }
        },

        deactivate: function() {
          if(jQuery.proxy(settings.deactivateTest, element)() ) {
            module.debug('Setting state to inactive');
            jQuerymodule
              .removeClass(className.active)
            ;
            module.update.text(text.inactive);
            jQuery.proxy(settings.onDeactivate, element)();
          }
        },

        sync: function() {
          module.verbose('Syncing other buttons to current state');
          if( module.is.active() ) {
            jQueryallModules
              .not(jQuerymodule)
                .state('activate');
          }
          else {
            jQueryallModules
              .not(jQuerymodule)
                .state('deactivate')
            ;
          }
        },

        get: {
          text: function() {
            return (settings.selector.text)
              ? jQuerymodule.find(settings.selector.text).text()
              : jQuerymodule.html()
            ;
          },
          textFor: function(state) {
            return text[state] || false;
          }
        },

        flash: {
          text: function(text, duration, callback) {
            var
              previousText = module.get.text()
            ;
            module.debug('Flashing text message', text, duration);
            text     = text     || settings.text.flash;
            duration = duration || settings.flashDuration;
            callback = callback || function() {};
            module.update.text(text);
            setTimeout(function(){
              module.update.text(previousText);
              jQuery.proxy(callback, element)();
            }, duration);
          }
        },

        reset: {
          // on mouseout sets text to previous value
          text: function() {
            var
              activeText   = text.active   || jQuerymodule.data(metadata.storedText),
              inactiveText = text.inactive || jQuerymodule.data(metadata.storedText)
            ;
            if( module.is.textEnabled() ) {
              if( module.is.active() && activeText) {
                module.verbose('Resetting active text', activeText);
                module.update.text(activeText);
              }
              else if(inactiveText) {
                module.verbose('Resetting inactive text', activeText);
                module.update.text(inactiveText);
              }
            }
          }
        },

        update: {
          text: function(text) {
            var
              currentText = module.get.text()
            ;
            if(text && text !== currentText) {
              module.debug('Updating text', text);
              if(settings.selector.text) {
                jQuerymodule
                  .data(metadata.storedText, text)
                  .find(settings.selector.text)
                    .text(text)
                ;
              }
              else {
                jQuerymodule
                  .data(metadata.storedText, text)
                  .html(text)
                ;
              }
            }
            else {
              module.debug('Text is already sane, ignoring update', text);
            }
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            jQuery.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                jQuery.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            jQuery.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ( jQuery.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if(jQuery.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

jQuery.fn.state.settings = {

  // module info
  name : 'State',

  // debug output
  debug      : false,

  // verbose debug output
  verbose    : true,

  // namespace for events
  namespace  : 'state',

  // debug data includes performance
  performance: true,

  // callback occurs on state change
  onActivate   : function() {},
  onDeactivate : function() {},
  onChange     : function() {},

  // state test functions
  activateTest   : function() { return true; },
  deactivateTest : function() { return true; },

  // whether to automatically map default states
  automatic     : true,

  // activate / deactivate changes all elements instantiated at same time
  sync          : false,

  // default flash text duration, used for temporarily changing text of an element
  flashDuration : 1000,

  // selector filter
  filter     : {
    text   : '.loading, .disabled',
    active : '.disabled'
  },

  context    : false,

  // error
  error: {
    method : 'The method you called is not defined.'
  },

  // metadata
  metadata: {
    promise    : 'promise',
    storedText : 'stored-text'
  },

  // change class on state
  className: {
    active   : 'active',
    disabled : 'disabled',
    error    : 'error',
    loading  : 'loading',
    success  : 'success',
    warning  : 'warning'
  },

  selector: {
    // selector for text node
    text: false
  },

  defaults : {
    input: {
      disabled : true,
      loading  : true,
      active   : true
    },
    button: {
      disabled : true,
      loading  : true,
      active   : true,
    },
    progress: {
      active   : true,
      success  : true,
      warning  : true,
      error    : true
    }
  },

  states     : {
    active   : true,
    disabled : true,
    error    : true,
    loading  : true,
    success  : true,
    warning  : true
  },

  text     : {
    disabled   : false,
    flash      : false,
    hover      : false,
    active     : false,
    inactive   : false,
    activate   : false,
    deactivate : false
  }

};



})( jQuery, window , document );

 /*
 * # Semantic - Sticky
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( jQuery, window, document, undefined ) {

"use strict";

jQuery.fn.sticky = function(parameters) {
  var
    jQueryallModules    = jQuery(this),
    moduleSelector = jQueryallModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),
    returnedValue
  ;

  jQueryallModules
    .each(function() {
      var
        settings              = jQuery.extend(true, {}, jQuery.fn.sticky.settings, parameters),

        className             = settings.className,
        namespace             = settings.namespace,
        error                 = settings.error,

        eventNamespace        = '.' + namespace,
        moduleNamespace       = 'module-' + namespace,

        jQuerymodule               = jQuery(this),
        jQuerywindow               = jQuery(window),
        jQuerycontainer            = jQuerymodule.offsetParent(),
        jQueryscroll               = jQuery(settings.scrollContext),
        jQuerycontext,

        selector              = jQuerymodule.selector || '',
        instance              = jQuerymodule.data(moduleNamespace),

        requestAnimationFrame = window.requestAnimationFrame
          || window.mozRequestAnimationFrame
          || window.webkitRequestAnimationFrame
          || window.msRequestAnimationFrame
          || function(callback) { setTimeout(callback, 0); },

        element         = this,
        observer,
        module
      ;

      module      = {

        initialize: function() {
          if(settings.context) {
            jQuerycontext = jQuery(settings.context);
          }
          else {
            jQuerycontext = jQuerycontainer;
          }
          if(jQuerycontext.size() === 0) {
            module.error(error.invalidContext, settings.context, jQuerymodule);
            return;
          }
          module.verbose('Initializing sticky', settings, jQuerycontainer);
          module.save.positions();

          // error conditions
          if( module.is.hidden() ) {
            module.error(error.visible, jQuerymodule);
          }
          if(module.cache.element.height > module.cache.context.height) {
            module.reset();
            module.error(error.elementSize, jQuerymodule);
            return;
          }

          jQuerywindow
            .on('resize' + eventNamespace, module.event.resize)
          ;
          jQueryscroll
            .on('scroll' + eventNamespace, module.event.scroll)
          ;

          module.observeChanges();
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          jQuerymodule
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module');
          module.reset();
          jQuerywindow
            .off('resize' + eventNamespace, module.event.resize)
          ;
          jQueryscroll
            .off('scroll' + eventNamespace, module.event.scroll)
          ;
          jQuerymodule
            .removeData(moduleNamespace)
          ;
        },

        observeChanges: function() {
          var
            context = jQuerycontext[0]
          ;
          if('MutationObserver' in window) {
            observer = new MutationObserver(function(mutations) {
              clearTimeout(module.timer);
              module.timer = setTimeout(function() {
                module.verbose('DOM tree modified, updating sticky menu');
                module.refresh();
              }, 200);
            });
            observer.observe(element, {
              childList : true,
              subtree   : true
            });
            observer.observe(context, {
              childList : true,
              subtree   : true
            });
            module.debug('Setting up mutation observer', observer);
          }
        },

        event: {
          resize: function() {
            requestAnimationFrame(function() {
              module.refresh();
              module.stick();
            });
          },
          scroll: function() {
            requestAnimationFrame(function() {
              module.stick();
              jQuery.proxy(settings.onScroll, element)();
            });
          }
        },

        refresh: function(hardRefresh) {
          module.reset();
          if(hardRefresh) {
            jQuerycontainer = jQuerymodule.offsetParent();
          }
          module.save.positions();
          module.stick();
          jQuery.proxy(settings.onReposition, element)();
        },

        supports: {
          sticky: function() {
            var
              jQueryelement = jQuery('<div/>'),
              element = jQueryelement.get()
            ;
            jQueryelement
              .addClass(className.supported)
            ;
            return(jQueryelement.css('position').match('sticky'));
          }
        },

        save: {
          scroll: function(scroll) {
            module.lastScroll = scroll;
          },
          positions: function() {
            var
              window = {
                height: jQuerywindow.height()
              },
              element = {
                margin: {
                  top    : parseInt(jQuerymodule.css('margin-top'), 10),
                  bottom : parseInt(jQuerymodule.css('margin-bottom'), 10),
                },
                offset : jQuerymodule.offset(),
                width  : jQuerymodule.outerWidth(),
                height : jQuerymodule.outerHeight()
              },
              context = {
                offset: jQuerycontext.offset(),
                height: jQuerycontext.outerHeight()
              }
            ;
            module.cache = {
              fits : ( element.height < window.height ),
              window: {
                height: window.height
              },
              element: {
                margin : element.margin,
                top    : element.offset.top - element.margin.top,
                left   : element.offset.left,
                width  : element.width,
                height : element.height,
                bottom : element.offset.top + element.height
              },
              context: {
                top    : context.offset.top,
                height : context.height,
                bottom : context.offset.top + context.height
              }
            };
            module.set.containerSize();
            module.set.size();
            module.stick();
            module.debug('Caching element positions', module.cache);
          }
        },

        get: {
          direction: function(scroll) {
            var
              direction = 'down'
            ;
            scroll = scroll || jQueryscroll.scrollTop();
            if(module.lastScroll !== undefined) {
              if(module.lastScroll < scroll) {
                direction = 'down';
              }
              else if(module.lastScroll > scroll) {
                direction = 'up';
              }
            }
            return direction;
          },
          scrollChange: function(scroll) {
            scroll = scroll || jQueryscroll.scrollTop();
            return (module.lastScroll)
              ? (scroll - module.lastScroll)
              : 0
            ;
          },
          currentElementScroll: function() {
            return ( module.is.top() )
              ? Math.abs(parseInt(jQuerymodule.css('top'), 10))    || 0
              : Math.abs(parseInt(jQuerymodule.css('bottom'), 10)) || 0
            ;
          },
          elementScroll: function(scroll) {
            scroll = scroll || jQueryscroll.scrollTop();
            var
              element        = module.cache.element,
              window         = module.cache.window,
              delta          = module.get.scrollChange(scroll),
              maxScroll      = (element.height - window.height + settings.offset),
              currentScroll  = module.get.currentElementScroll(),
              possibleScroll = (currentScroll + delta),
              elementScroll
            ;
            if(module.cache.fits || possibleScroll < 0) {
              elementScroll = 0;
            }
            else if (possibleScroll > maxScroll ) {
              elementScroll = maxScroll;
            }
            else {
              elementScroll = possibleScroll;
            }
            return elementScroll;
          }
        },

        remove: {
          offset: function() {
            jQuerymodule.css('margin-top', '');
          }
        },

        set: {
          offset: function() {
            module.verbose('Setting offset on element', settings.offset);
            jQuerymodule.css('margin-top', settings.offset);
          },
          containerSize: function() {
            var
              tagName = jQuerycontainer.get(0).tagName
            ;
            if(tagName === 'HTML' || tagName == 'body') {
              // this can trigger for too many reasons
              //module.error(error.container, tagName, jQuerymodule);
              jQuerycontainer = jQuerymodule.offsetParent();
            }
            else {
              module.debug('Settings container size', module.cache.context.height);
              jQuerycontainer.height(module.cache.context.height);
            }
          },
          scroll: function(scroll) {
            module.debug('Setting scroll on element', scroll);
            if( module.is.top() ) {
              jQuerymodule
                .css('bottom', '')
                .css('top', -scroll)
              ;
            }
            if( module.is.bottom() ) {
              jQuerymodule
                .css('top', '')
                .css('bottom', scroll)
              ;
            }
          },
          size: function() {
            if(module.cache.element.height !== 0 && module.cache.element.width !== 0) {
              jQuerymodule
                .css({
                  width  : module.cache.element.width,
                  height : module.cache.element.height
                })
              ;
            }
          }
        },

        is: {
          top: function() {
            return jQuerymodule.hasClass(className.top);
          },
          bottom: function() {
            return jQuerymodule.hasClass(className.bottom);
          },
          initialPosition: function() {
            return (!module.is.fixed() && !module.is.bound());
          },
          hidden: function() {
            return (!jQuerymodule.is(':visible'));
          },
          bound: function() {
            return jQuerymodule.hasClass(className.bound);
          },
          fixed: function() {
            return jQuerymodule.hasClass(className.fixed);
          }
        },

        stick: function() {
          var
            cache          = module.cache,
            fits           = cache.fits,
            element        = cache.element,
            window         = cache.window,
            context        = cache.context,
            offset         = (module.is.bottom() && settings.pushing)
              ? settings.bottomOffset
              : settings.offset,
            scroll         = {
              top    : jQueryscroll.scrollTop() + offset,
              bottom : jQueryscroll.scrollTop() + offset + window.height
            },
            direction      = module.get.direction(scroll.top),
            elementScroll  = module.get.elementScroll(scroll.top),

            // shorthand
            doesntFit      = !fits,
            elementVisible = (element.height !== 0)
          ;

          // save current scroll for next run
          module.save.scroll(scroll.top);

          if(elementVisible) {

            if( module.is.initialPosition() ) {
              if(scroll.top >= element.top) {
                module.debug('Element passed, fixing element to page');
                module.fixTop();
              }
            }
            else if( module.is.fixed() ) {

              // currently fixed top
              if( module.is.top() ) {
                if( scroll.top < element.top ) {
                  module.debug('Fixed element reached top of container');
                  module.setInitialPosition();
                }
                else if( (element.height + scroll.top - elementScroll) > context.bottom ) {
                  module.debug('Fixed element reached bottom of container');
                  module.bindBottom();
                }
                // scroll element if larger than screen
                else if(doesntFit) {
                  module.set.scroll(elementScroll);
                }
              }

              // currently fixed bottom
              else if(module.is.bottom() ) {

                // top edge
                if( (scroll.bottom - element.height) < element.top) {
                  module.debug('Bottom fixed rail has reached top of container');
                  module.setInitialPosition();
                }
                // bottom edge
                else if(scroll.bottom > context.bottom) {
                  module.debug('Bottom fixed rail has reached bottom of container');
                  module.bindBottom();
                }
                // scroll element if larger than screen
                else if(doesntFit) {
                  module.set.scroll(elementScroll);
                }

              }
            }
            else if( module.is.bottom() ) {
              if(settings.pushing) {
                if(module.is.bound() && scroll.bottom < context.bottom ) {
                  module.debug('Fixing bottom attached element to bottom of browser.');
                  module.fixBottom();
                }
              }
              else {
                if(module.is.bound() && (scroll.top < context.bottom - element.height) ) {
                  module.debug('Fixing bottom attached element to top of browser.');
                  module.fixTop();
                }
              }
            }
          }
        },

        bindTop: function() {
          module.debug('Binding element to top of parent container');
          module.remove.offset();
          jQuerymodule
            .css('left' , '')
            .css('top' , '')
            .css('bottom' , '')
            .removeClass(className.fixed)
            .removeClass(className.bottom)
            .addClass(className.bound)
            .addClass(className.top)
          ;
          jQuery.proxy(settings.onTop, element)();
          jQuery.proxy(settings.onUnstick, element)();
        },
        bindBottom: function() {
          module.debug('Binding element to bottom of parent container');
          module.remove.offset();
          jQuerymodule
            .css('left' , '')
            .css('top' , '')
            .css('bottom' , '')
            .removeClass(className.fixed)
            .removeClass(className.top)
            .addClass(className.bound)
            .addClass(className.bottom)
          ;
          jQuery.proxy(settings.onBottom, element)();
          jQuery.proxy(settings.onUnstick, element)();
        },

        setInitialPosition: function() {
          module.unfix();
          module.unbind();
        },


        fixTop: function() {
          module.debug('Fixing element to top of page');
          module.set.offset();
          jQuerymodule
            .css('left', module.cache.element.left)
            .removeClass(className.bound)
            .removeClass(className.bottom)
            .addClass(className.fixed)
            .addClass(className.top)
          ;
          jQuery.proxy(settings.onStick, element)();
        },

        fixBottom: function() {
          module.debug('Sticking element to bottom of page');
          module.set.offset();
          jQuerymodule
            .css('left', module.cache.element.left)
            .removeClass(className.bound)
            .removeClass(className.top)
            .addClass(className.fixed)
            .addClass(className.bottom)
          ;
          jQuery.proxy(settings.onStick, element)();
        },

        unbind: function() {
          module.debug('Removing absolute position on element');
          module.remove.offset();
          jQuerymodule
            .removeClass(className.bound)
            .removeClass(className.top)
            .removeClass(className.bottom)
          ;
        },

        unfix: function() {
          module.debug('Removing fixed position on element');
          module.remove.offset();
          jQuerymodule
            .removeClass(className.fixed)
            .removeClass(className.top)
            .removeClass(className.bottom)
          ;
          jQuery.proxy(settings.onUnstick, this)();
        },

        reset: function() {
          module.debug('Reseting elements position');
          module.unbind();
          module.unfix();
          module.resetCSS();
        },

        resetCSS: function() {
          jQuerymodule
            .css({
              top    : '',
              bottom : '',
              width  : '',
              height : ''
            })
          ;
          jQuerycontainer
            .css({
              height: ''
            })
          ;
        },

        setting: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 0);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            jQuery.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                jQuery.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            jQuery.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( jQuery.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if(jQuery.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

jQuery.fn.sticky.settings = {

  name          : 'Sticky',
  namespace     : 'sticky',

  debug         : false,
  verbose       : false,
  performance   : false,

  pushing       : false,
  context       : false,
  scrollContext : window,
  offset        : 0,
  bottomOffset  : 0,

  onReposition  : function(){},
  onScroll      : function(){},
  onStick       : function(){},
  onUnstick     : function(){},
  onTop         : function(){},
  onBottom      : function(){},

  error         : {
    container      : 'Sticky element must be inside a relative container',
    visible        : 'Element is hidden, you must call refresh after element becomes visible',
    method         : 'The method you called is not defined.',
    invalidContext : 'Context specified does not exist',
    elementSize    : 'Sticky element is larger than its container, cannot create sticky.'
  },

  className : {
    bound     : 'bound',
    fixed     : 'fixed',
    supported : 'native',
    top       : 'top',
    bottom    : 'bottom'
  }

};

})( jQuery, window , document );

 /*
 * # Semantic - Tab
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function (jQuery, window, document, undefined) {

"use strict";

jQuery.tab = jQuery.fn.tab = function(parameters) {

  var
    // use window context if none specified
    jQueryallModules     = jQuery.isFunction(this)
        ? jQuery(window)
        : jQuery(this),

    settings        = ( jQuery.isPlainObject(parameters) )
      ? jQuery.extend(true, {}, jQuery.fn.tab.settings, parameters)
      : jQuery.extend({}, jQuery.fn.tab.settings),

    moduleSelector  = jQueryallModules.selector || '',
    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    module,
    returnedValue
  ;


  jQueryallModules
    .each(function() {
      var

        className          = settings.className,
        metadata           = settings.metadata,
        selector           = settings.selector,
        error              = settings.error,

        eventNamespace     = '.' + settings.namespace,
        moduleNamespace    = 'module-' + settings.namespace,

        jQuerymodule            = jQuery(this),

        cache              = {},
        firstLoad          = true,
        recursionDepth     = 0,

        jQuerycontext,
        jQuerytabs,
        activeTabPath,
        parameterArray,
        historyEvent,

        element         = this,
        instance        = jQuerymodule.data(moduleNamespace)
      ;

      module = {

        initialize: function() {
          module.debug('Initializing tab menu item', jQuerymodule);

          module.determineTabs();
          module.debug('Determining tabs', settings.context, jQuerytabs);

          // set up automatic routing
          if(settings.auto) {
            module.verbose('Setting up automatic tab retrieval from server');
            settings.apiSettings = {
              url: settings.path + '/{jQuerytab}'
            };
          }

          // attach events if navigation wasn't set to window
          if( !jQuery.isWindow( element ) ) {
            module.debug('Attaching tab activation events to element', jQuerymodule);
            jQuerymodule
              .on('click' + eventNamespace, module.event.click)
            ;
          }
          module.instantiate();
        },

        determineTabs: function() {
          var
            jQueryreference
          ;

          // determine tab context
          if(settings.context === 'parent') {
            if(jQuerymodule.closest(selector.ui).size() > 0) {
              jQueryreference = jQuerymodule.closest(selector.ui);
              module.verbose('Using closest UI element for determining parent', jQueryreference);
            }
            else {
              jQueryreference = jQuerymodule;
            }
            jQuerycontext = jQueryreference.parent();
            module.verbose('Determined parent element for creating context', jQuerycontext);
          }
          else if(settings.context) {
            jQuerycontext = jQuery(settings.context);
            module.verbose('Using selector for tab context', settings.context, jQuerycontext);
          }
          else {
            jQuerycontext = jQuery('body');
          }

          // find tabs
          if(settings.childrenOnly) {
            jQuerytabs = jQuerycontext.children(selector.tabs);
            module.debug('Searching tab context children for tabs', jQuerycontext, jQuerytabs);
          }
          else {
            jQuerytabs = jQuerycontext.find(selector.tabs);
            module.debug('Searching tab context for tabs', jQuerycontext, jQuerytabs);
          }
        },

        initializeHistory: function() {
          if(settings.history) {
            module.debug('Initializing page state');
            if( jQuery.address === undefined ) {
              module.error(error.state);
              return false;
            }
            else {
              if(settings.historyType == 'state') {
                module.debug('Using HTML5 to manage state');
                if(settings.path !== false) {
                  jQuery.address
                    .history(true)
                    .state(settings.path)
                  ;
                }
                else {
                  module.error(error.path);
                  return false;
                }
              }
              jQuery.address
                .bind('change', module.event.history.change)
              ;
            }
          }
        },

        instantiate: function () {
          module.verbose('Storing instance of module', module);
          jQuerymodule
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.debug('Destroying tabs', jQuerymodule);
          jQuerymodule
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
        },

        event: {
          click: function(event) {
            var
              tabPath = jQuery(this).data(metadata.tab)
            ;
            if(tabPath !== undefined) {
              if(settings.history) {
                module.verbose('Updating page state', event);
                jQuery.address.value(tabPath);
              }
              else {
                module.verbose('Changing tab', event);
                module.changeTab(tabPath);
              }
              event.preventDefault();
            }
            else {
              module.debug('No tab specified');
            }
          },
          history: {
            change: function(event) {
              var
                tabPath   = event.pathNames.join('/') || module.get.initialPath(),
                pageTitle = settings.templates.determineTitle(tabPath) || false
              ;
              module.performance.display();
              module.debug('History change event', tabPath, event);
              historyEvent = event;
              if(tabPath !== undefined) {
                module.changeTab(tabPath);
              }
              if(pageTitle) {
                jQuery.address.title(pageTitle);
              }
            }
          }
        },

        refresh: function() {
          if(activeTabPath) {
            module.debug('Refreshing tab', activeTabPath);
            module.changeTab(activeTabPath);
          }
        },

        cache: {

          read: function(cacheKey) {
            return (cacheKey !== undefined)
              ? cache[cacheKey]
              : false
            ;
          },
          add: function(cacheKey, content) {
            cacheKey = cacheKey || activeTabPath;
            module.debug('Adding cached content for', cacheKey);
            cache[cacheKey] = content;
          },
          remove: function(cacheKey) {
            cacheKey = cacheKey || activeTabPath;
            module.debug('Removing cached content for', cacheKey);
            delete cache[cacheKey];
          }
        },

        set: {
          state: function(state) {
            jQuery.address.value(state);
          }
        },

        changeTab: function(tabPath) {
          var
            pushStateAvailable = (window.history && window.history.pushState),
            shouldIgnoreLoad   = (pushStateAvailable && settings.ignoreFirstLoad && firstLoad),
            remoteContent      = (settings.auto || jQuery.isPlainObject(settings.apiSettings) ),
            // only get default path if not remote content
            pathArray = (remoteContent && !shouldIgnoreLoad)
              ? module.utilities.pathToArray(tabPath)
              : module.get.defaultPathArray(tabPath)
          ;
          tabPath = module.utilities.arrayToPath(pathArray);
          jQuery.each(pathArray, function(index, tab) {
            var
              currentPathArray   = pathArray.slice(0, index + 1),
              currentPath        = module.utilities.arrayToPath(currentPathArray),

              isTab              = module.is.tab(currentPath),
              isLastIndex        = (index + 1 == pathArray.length),

              jQuerytab               = module.get.tabElement(currentPath),
              jQueryanchor,
              nextPathArray,
              nextPath,
              isLastTab
            ;
            module.verbose('Looking for tab', tab);
            if(isTab) {
              module.verbose('Tab was found', tab);

              // scope up
              activeTabPath = currentPath;
              parameterArray = module.utilities.filterArray(pathArray, currentPathArray);

              if(isLastIndex) {
                isLastTab = true;
              }
              else {
                nextPathArray = pathArray.slice(0, index + 2);
                nextPath      = module.utilities.arrayToPath(nextPathArray);
                isLastTab     = ( !module.is.tab(nextPath) );
                if(isLastTab) {
                  module.verbose('Tab parameters found', nextPathArray);
                }
              }
              if(isLastTab && remoteContent) {
                if(!shouldIgnoreLoad) {
                  module.activate.navigation(currentPath);
                  module.content.fetch(currentPath, tabPath);
                }
                else {
                  module.debug('Ignoring remote content on first tab load', currentPath);
                  firstLoad = false;
                  module.cache.add(tabPath, jQuerytab.html());
                  module.activate.all(currentPath);
                  jQuery.proxy(settings.onTabInit, jQuerytab)(currentPath, parameterArray, historyEvent);
                  jQuery.proxy(settings.onTabLoad, jQuerytab)(currentPath, parameterArray, historyEvent);
                }
                return false;
              }
              else {
                module.debug('Opened local tab', currentPath);
                module.activate.all(currentPath);
                if( !module.cache.read(currentPath) ) {
                  module.cache.add(currentPath, true);
                  module.debug('First time tab loaded calling tab init');
                  jQuery.proxy(settings.onTabInit, jQuerytab)(currentPath, parameterArray, historyEvent);
                }
                jQuery.proxy(settings.onTabLoad, jQuerytab)(currentPath, parameterArray, historyEvent);
              }
            }
            else if(tabPath.search('/') == -1) {
              // look for in page anchor
              jQueryanchor     = jQuery('#' + tabPath + ', a[name="' + tabPath + '"]'),
              currentPath = jQueryanchor.closest('[data-tab]').data('tab');
              jQuerytab        = module.get.tabElement(currentPath);
              // if anchor exists use parent tab
              if(jQueryanchor && jQueryanchor.size() > 0 && currentPath) {
                module.debug('No tab found, but deep anchor link present, opening parent tab');
                module.activate.all(currentPath);
                if( !module.cache.read(currentPath) ) {
                  module.cache.add(currentPath, true);
                  module.debug('First time tab loaded calling tab init');
                  jQuery.proxy(settings.onTabInit, jQuerytab)(currentPath, parameterArray, historyEvent);
                }
                return false;
              }
            }
            else {
              module.error(error.missingTab, jQuerymodule, jQuerycontext, currentPath);
              return false;
            }
          });
        },

        content: {

          fetch: function(tabPath, fullTabPath) {
            var
              jQuerytab             = module.get.tabElement(tabPath),
              apiSettings      = {
                dataType     : 'html',
                stateContext : jQuerytab,
                onSuccess      : function(response) {
                  module.cache.add(fullTabPath, response);
                  module.content.update(tabPath, response);
                  if(tabPath == activeTabPath) {
                    module.debug('Content loaded', tabPath);
                    module.activate.tab(tabPath);
                  }
                  else {
                    module.debug('Content loaded in background', tabPath);
                  }
                  jQuery.proxy(settings.onTabInit, jQuerytab)(tabPath, parameterArray, historyEvent);
                  jQuery.proxy(settings.onTabLoad, jQuerytab)(tabPath, parameterArray, historyEvent);
                },
                urlData: { tab: fullTabPath }
              },
              request         = jQuerytab.data(metadata.promise) || false,
              existingRequest = ( request && request.state() === 'pending' ),
              requestSettings,
              cachedContent
            ;

            fullTabPath   = fullTabPath || tabPath;
            cachedContent = module.cache.read(fullTabPath);

            if(settings.cache && cachedContent) {
              module.debug('Showing existing content', fullTabPath);
              module.content.update(tabPath, cachedContent);
              module.activate.tab(tabPath);
              jQuery.proxy(settings.onTabLoad, jQuerytab)(tabPath, parameterArray, historyEvent);
            }
            else if(existingRequest) {
              module.debug('Content is already loading', fullTabPath);
              jQuerytab
                .addClass(className.loading)
              ;
            }
            else if(jQuery.api !== undefined) {
              requestSettings = jQuery.extend(true, { headers: { 'X-Remote': true } }, settings.apiSettings, apiSettings);
              module.debug('Retrieving remote content', fullTabPath, requestSettings);
              jQuery.api( requestSettings );
            }
            else {
              module.error(error.api);
            }
          },

          update: function(tabPath, html) {
            module.debug('Updating html for', tabPath);
            var
              jQuerytab = module.get.tabElement(tabPath)
            ;
            jQuerytab
              .html(html)
            ;
          }
        },

        activate: {
          all: function(tabPath) {
            module.activate.tab(tabPath);
            module.activate.navigation(tabPath);
          },
          tab: function(tabPath) {
            var
              jQuerytab = module.get.tabElement(tabPath)
            ;
            module.verbose('Showing tab content for', jQuerytab);
            jQuerytab
              .addClass(className.active)
              .siblings(jQuerytabs)
                .removeClass(className.active + ' ' + className.loading)
            ;
          },
          navigation: function(tabPath) {
            var
              jQuerynavigation = module.get.navElement(tabPath)
            ;
            module.verbose('Activating tab navigation for', jQuerynavigation, tabPath);
            jQuerynavigation
              .addClass(className.active)
              .siblings(jQueryallModules)
                .removeClass(className.active + ' ' + className.loading)
            ;
          }
        },

        deactivate: {
          all: function() {
            module.deactivate.navigation();
            module.deactivate.tabs();
          },
          navigation: function() {
            jQueryallModules
              .removeClass(className.active)
            ;
          },
          tabs: function() {
            jQuerytabs
              .removeClass(className.active + ' ' + className.loading)
            ;
          }
        },

        is: {
          tab: function(tabName) {
            return (tabName !== undefined)
              ? ( module.get.tabElement(tabName).size() > 0 )
              : false
            ;
          }
        },

        get: {
          initialPath: function() {
            return jQueryallModules.eq(0).data(metadata.tab) || jQuerytabs.eq(0).data(metadata.tab);
          },
          path: function() {
            return jQuery.address.value();
          },
          // adds default tabs to tab path
          defaultPathArray: function(tabPath) {
            return module.utilities.pathToArray( module.get.defaultPath(tabPath) );
          },
          defaultPath: function(tabPath) {
            var
              jQuerydefaultNav = jQueryallModules.filter('[data-' + metadata.tab + '^="' + tabPath + '/"]').eq(0),
              defaultTab  = jQuerydefaultNav.data(metadata.tab) || false
            ;
            if( defaultTab ) {
              module.debug('Found default tab', defaultTab);
              if(recursionDepth < settings.maxDepth) {
                recursionDepth++;
                return module.get.defaultPath(defaultTab);
              }
              module.error(error.recursion);
            }
            else {
              module.debug('No default tabs found for', tabPath, jQuerytabs);
            }
            recursionDepth = 0;
            return tabPath;
          },
          navElement: function(tabPath) {
            tabPath = tabPath || activeTabPath;
            return jQueryallModules.filter('[data-' + metadata.tab + '="' + tabPath + '"]');
          },
          tabElement: function(tabPath) {
            var
              jQueryfullPathTab,
              jQuerysimplePathTab,
              tabPathArray,
              lastTab
            ;
            tabPath        = tabPath || activeTabPath;
            tabPathArray   = module.utilities.pathToArray(tabPath);
            lastTab        = module.utilities.last(tabPathArray);
            jQueryfullPathTab   = jQuerytabs.filter('[data-' + metadata.tab + '="' + lastTab + '"]');
            jQuerysimplePathTab = jQuerytabs.filter('[data-' + metadata.tab + '="' + tabPath + '"]');
            return (jQueryfullPathTab.size() > 0)
              ? jQueryfullPathTab
              : jQuerysimplePathTab
            ;
          },
          tab: function() {
            return activeTabPath;
          }
        },

        utilities: {
          filterArray: function(keepArray, removeArray) {
            return jQuery.grep(keepArray, function(keepValue) {
              return ( jQuery.inArray(keepValue, removeArray) == -1);
            });
          },
          last: function(array) {
            return jQuery.isArray(array)
              ? array[ array.length - 1]
              : false
            ;
          },
          pathToArray: function(pathName) {
            if(pathName === undefined) {
              pathName = activeTabPath;
            }
            return typeof pathName == 'string'
              ? pathName.split('/')
              : [pathName]
            ;
          },
          arrayToPath: function(pathArray) {
            return jQuery.isArray(pathArray)
              ? pathArray.join('/')
              : false
            ;
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            jQuery.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                jQuery.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            jQuery.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                module.error(error.method, query);
                return false;
              }
            });
          }
          if ( jQuery.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if(jQuery.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;
  if(module && !methodInvoked) {
    module.initializeHistory();
  }
  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;

};

// shortcut for tabbed content with no defined navigation
jQuery.tab = function(settings) {
  jQuery(window).tab(settings);
};

jQuery.fn.tab.settings = {

  name         : 'Tab',
  namespace    : 'tab',

  debug        : false,
  verbose      : true,
  performance  : true,

  // uses pjax style endpoints fetching content from same url with remote-content headers
  auto         : false,
  history      : false,
  historyType  : 'hash',
  path         : false,

  context      : false,
  childrenOnly : false,

  // max depth a tab can be nested
  maxDepth        : 25,

  // dont load content on first load
  ignoreFirstLoad : false,

  // load tab content new every tab click
  alwaysRefresh   : false,

  // cache the content requests to pull locally
  cache           : true,

  // settings for api call
  apiSettings     : false,

  // only called first time a tab's content is loaded (when remote source)
  onTabInit    : function(tabPath, parameterArray, historyEvent) {},

  // called on every load
  onTabLoad    : function(tabPath, parameterArray, historyEvent) {},

  templates    : {
    determineTitle: function(tabArray) {}
  },

  error: {
    api        : 'You attempted to load content without API module',
    method     : 'The method you called is not defined',
    missingTab : 'Activated tab cannot be found for this context.',
    noContent  : 'The tab you specified is missing a content url.',
    path       : 'History enabled, but no path was specified',
    recursion  : 'Max recursive depth reached',
    state      : 'History requires Asual\'s Address library <https://github.com/asual/jquery-address>'
  },

  metadata : {
    tab    : 'tab',
    loaded : 'loaded',
    promise: 'promise'
  },

  className   : {
    loading : 'loading',
    active  : 'active'
  },

  selector    : {
    tabs : '.ui.tab',
    ui   : '.ui'
  }

};

})( jQuery, window , document );
/*
 * # Semantic - Transition
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( jQuery, window, document, undefined ) {

"use strict";

jQuery.fn.transition = function() {
  var
    jQueryallModules     = jQuery(this),
    moduleSelector  = jQueryallModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    moduleArguments = arguments,
    query           = moduleArguments[0],
    queryArguments  = [].slice.call(arguments, 1),
    methodInvoked   = (typeof query === 'string'),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    returnedValue
  ;
  jQueryallModules
    .each(function() {
      var
        jQuerymodule  = jQuery(this),
        element  = this,

        // set at run time
        settings,
        instance,

        error,
        className,
        metadata,
        animationEnd,
        animationName,

        namespace,
        moduleNamespace,
        eventNamespace,
        module
      ;

      module = {

        initialize: function() {

          // get full settings
          moduleNamespace = 'module-' + namespace;
          settings        = module.get.settings.apply(element, moduleArguments);
          className       = settings.className;
          metadata        = settings.metadata;

          animationEnd    = module.get.animationEvent();
          animationName   = module.get.animationName();
          error           = settings.error;
          namespace       = settings.namespace;
          eventNamespace  = '.' + settings.namespace;
          instance        = jQuerymodule.data(moduleNamespace) || module;

          if(methodInvoked) {
            methodInvoked = module.invoke(query);
          }
          // no internal method was found matching query or query not made
          if(methodInvoked === false) {
            module.verbose('Converted arguments into settings object', settings);
            module.animate();
            module.instantiate();
          }
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          jQuerymodule
            .data(moduleNamespace, instance)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module for', element);
          jQuerymodule
            .removeData(moduleNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing display type on next animation');
          delete module.displayType;
        },

        forceRepaint: function() {
          module.verbose('Forcing element repaint');
          var
            jQueryparentElement = jQuerymodule.parent(),
            jQuerynextElement = jQuerymodule.next()
          ;
          if(jQuerynextElement.size() === 0) {
            jQuerymodule.detach().appendTo(jQueryparentElement);
          }
          else {
            jQuerymodule.detach().insertBefore(jQuerynextElement);
          }
        },

        repaint: function() {
          module.verbose('Repainting element');
          var
            fakeAssignment = element.offsetWidth
          ;
        },

        animate: function(overrideSettings) {
          settings = overrideSettings || settings;
          if(!module.is.supported()) {
            module.error(error.support);
            return false;
          }
          module.debug('Preparing animation', settings.animation);
          if(module.is.animating()) {
            if(settings.queue) {
              if(!settings.allowRepeats && module.has.direction() && module.is.occuring() && module.queuing !== true) {
                module.error(error.repeated, settings.animation, jQuerymodule);
              }
              else {
                module.queue(settings.animation);
              }
              return false;
            }
            else {

            }
          }
          if(module.can.animate) {
            module.set.animating(settings.animation);
          }
          else {
            module.error(error.noAnimation, settings.animation);
          }
        },

        reset: function() {
          module.debug('Resetting animation to beginning conditions');
          module.remove.animationEndCallback();
          module.restore.conditions();
          module.remove.animating();
        },

        queue: function(animation) {
          module.debug('Queueing animation of', animation);
          module.queuing = true;
          jQuerymodule
            .one(animationEnd + eventNamespace, function() {
              module.queuing = false;
              module.repaint();
              module.animate.apply(this, settings);
            })
          ;
        },

        complete: function () {
          module.verbose('CSS animation complete', settings.animation);
          if(!module.is.looping()) {
            if( module.is.outward() ) {
              module.verbose('Animation is outward, hiding element');
              module.restore.conditions();
              module.hide();
              jQuery.proxy(settings.onHide, this)();
            }
            else if( module.is.inward() ) {
              module.verbose('Animation is outward, showing element');
              module.restore.conditions();
              module.show();
              module.set.display();
              jQuery.proxy(settings.onShow, this)();
            }
            else {
              module.restore.conditions();
            }
            module.remove.animation();
            module.remove.animating();
          }
          jQuery.proxy(settings.onComplete, this)();
        },

        has: {
          direction: function(animation) {
            animation = animation || settings.animation;
            if( animation.search(className.inward) !== -1 || animation.search(className.outward) !== -1) {
              module.debug('Direction already set in animation');
              return true;
            }
            return false;
          }
        },

        set: {
          animating: function(animation) {
            animation = animation || settings.animation;
            if(!module.is.animating()) {
              module.save.conditions();
            }
            module.remove.direction();
            module.remove.animationEndCallback();
            if(module.can.transition() && !module.has.direction()) {
              module.set.direction();
            }
            module.remove.hidden();
            module.set.display();
            jQuerymodule
              .addClass(className.animating)
              .addClass(className.transition)
              .addClass(animation)
              .one(animationEnd + '.complete' + eventNamespace, module.complete)
            ;
            module.set.duration(settings.duration);
            jQuery.proxy(settings.onStart, this)();
            module.debug('Starting tween', animation, jQuerymodule.attr('class'));
          },
          duration: function(animationName, duration) {
            duration = duration || settings.duration;
            duration = (typeof duration == 'number')
              ? duration + 'ms'
              : duration
            ;
            module.verbose('Setting animation duration', duration);
            jQuerymodule
              .css({
                '-webkit-animation-duration': duration,
                '-moz-animation-duration': duration,
                '-ms-animation-duration': duration,
                '-o-animation-duration': duration,
                'animation-duration':  duration
              })
            ;
          },
          display: function() {
            var
              style              = module.get.style(),
              displayType        = module.get.displayType(),
              overrideStyle      = style + 'display: ' + displayType + ' !important;'
            ;
            module.refresh();
            if( jQuerymodule.css('display') !== displayType ) {
              module.verbose('Setting inline visibility to', displayType);
              jQuerymodule
                .attr('style', overrideStyle)
              ;
            }
          },
          direction: function() {
            if(jQuerymodule.is(':visible') && !module.is.hidden()) {
              module.debug('Automatically determining the direction of animation', 'Outward');
              jQuerymodule
                .removeClass(className.inward)
                .addClass(className.outward)
              ;
            }
            else {
              module.debug('Automatically determining the direction of animation', 'Inward');
              jQuerymodule
                .removeClass(className.outward)
                .addClass(className.inward)
              ;
            }
          },
          looping: function() {
            module.debug('Transition set to loop');
            jQuerymodule
              .addClass(className.looping)
            ;
          },
          hidden: function() {
            if(!module.is.hidden()) {
              jQuerymodule
                .addClass(className.transition)
                .addClass(className.hidden)
              ;
              if(jQuerymodule.css('display') !== 'none') {
                module.verbose('Overriding default display to hide element');
                jQuerymodule
                  .css('display', 'none')
                ;
              }
            }
          },
          visible: function() {
            jQuerymodule
              .addClass(className.transition)
              .addClass(className.visible)
            ;
          }
        },

        save: {
          displayType: function(displayType) {
            jQuerymodule.data(metadata.displayType, displayType);
          },
          transitionExists: function(animation, exists) {
            jQuery.fn.transition.exists[animation] = exists;
            module.verbose('Saving existence of transition', animation, exists);
          },
          conditions: function() {
            var
              clasName = jQuerymodule.attr('class') || false,
              style = jQuerymodule.attr('style') || ''
            ;
            jQuerymodule.removeClass(settings.animation);
            module.remove.direction();
            module.cache = {
              className : jQuerymodule.attr('class'),
              style     : module.get.style()
            };
            module.verbose('Saving original attributes', module.cache);
          }
        },

        restore: {
          conditions: function() {
            if(module.cache === undefined) {
              return false;
            }
            if(module.cache.className) {
              jQuerymodule.attr('class', module.cache.className);
            }
            else {
              jQuerymodule.removeAttr('class');
            }
            if(module.cache.style) {
              module.verbose('Restoring original style attribute', module.cache.style);
              jQuerymodule.attr('style', module.cache.style);
            }
            if(module.is.looping()) {
              module.remove.looping();
            }
            module.verbose('Restoring original attributes', module.cache);
          }
        },

        remove: {
          animating: function() {
            jQuerymodule.removeClass(className.animating);
          },
          animation: function() {
            jQuerymodule
              .css({
                '-webkit-animation' : '',
                '-moz-animation'    : '',
                '-ms-animation'     : '',
                '-o-animation'      : '',
                'animation'         : ''
              })
            ;
          },
          animationEndCallback: function() {
            jQuerymodule.off('.complete');
          },
          display: function() {
            jQuerymodule.css('display', '');
          },
          direction: function() {
            jQuerymodule
              .removeClass(className.inward)
              .removeClass(className.outward)
            ;
          },
          hidden: function() {
            jQuerymodule.removeClass(className.hidden);
          },
          visible: function() {
            jQuerymodule.removeClass(className.visible);
          },
          looping: function() {
            module.debug('Transitions are no longer looping');
            jQuerymodule
              .removeClass(className.looping)
            ;
            module.forceRepaint();
          },
          transition: function() {
            jQuerymodule
              .removeClass(className.visible)
              .removeClass(className.hidden)
            ;
          }
        },
        get: {
          settings: function(animation, duration, onComplete) {
            // single settings object
            if(typeof animation == 'object') {
              return jQuery.extend(true, {}, jQuery.fn.transition.settings, animation);
            }
            // all arguments provided
            else if(typeof onComplete == 'function') {
              return jQuery.extend({}, jQuery.fn.transition.settings, {
                animation  : animation,
                onComplete : onComplete,
                duration   : duration
              });
            }
            // only duration provided
            else if(typeof duration == 'string' || typeof duration == 'number') {
              return jQuery.extend({}, jQuery.fn.transition.settings, {
                animation : animation,
                duration  : duration
              });
            }
            // duration is actually settings object
            else if(typeof duration == 'object') {
              return jQuery.extend({}, jQuery.fn.transition.settings, duration, {
                animation : animation
              });
            }
            // duration is actually callback
            else if(typeof duration == 'function') {
              return jQuery.extend({}, jQuery.fn.transition.settings, {
                animation  : animation,
                onComplete : duration
              });
            }
            // only animation provided
            else {
              return jQuery.extend({}, jQuery.fn.transition.settings, {
                animation : animation
              });
            }
            return jQuery.fn.transition.settings;
          },
          displayType: function() {
            if(settings.displayType) {
              return settings.displayType;
            }
            if(jQuerymodule.data(metadata.displayType) === undefined) {
              // create fake element to determine display state
              module.can.transition(true);
            }
            return jQuerymodule.data(metadata.displayType);
          },
          style: function() {
            var
               style = jQuerymodule.attr('style') || ''
            ;
            return style.replace(/display.*?;/, '');
          },
          transitionExists: function(animation) {
            return jQuery.fn.transition.exists[animation];
          },
          animationName: function() {
            var
              element     = document.createElement('div'),
              animations  = {
                'animation'       :'animationName',
                'OAnimation'      :'oAnimationName',
                'MozAnimation'    :'mozAnimationName',
                'WebkitAnimation' :'webkitAnimationName'
              },
              animation
            ;
            for(animation in animations){
              if( element.style[animation] !== undefined ){
                return animations[animation];
              }
            }
            return false;
          },
          animationEvent: function() {
            var
              element     = document.createElement('div'),
              animations  = {
                'animation'       :'animationend',
                'OAnimation'      :'oAnimationEnd',
                'MozAnimation'    :'mozAnimationEnd',
                'WebkitAnimation' :'webkitAnimationEnd'
              },
              animation
            ;
            for(animation in animations){
              if( element.style[animation] !== undefined ){
                return animations[animation];
              }
            }
            return false;
          }

        },

        can: {
          animate: function() {
            if(jQuerymodule.css(settings.animation) !== 'none') {
              module.debug('CSS definition found',  jQuerymodule.css(settings.animation));
              return true;
            }
            else {
              module.debug('Unable to find css definition', jQuerymodule.attr('class'));
              return false;
            }
          },
          transition: function(forced) {
            var
              elementClass      = jQuerymodule.attr('class'),
              tagName           = jQuerymodule.prop('tagName'),
              animation         = settings.animation,
              transitionExists  = module.get.transitionExists(settings.animation),
              jQueryclone,
              currentAnimation,
              inAnimation,
              animationExists,
              displayType
            ;
            if( transitionExists === undefined || forced) {
              module.verbose('Determining whether animation exists');
              jQueryclone = jQuery('<' + tagName + ' />').addClass( elementClass ).insertAfter(jQuerymodule);
              currentAnimation = jQueryclone
                .addClass(animation)
                .removeClass(className.inward)
                .removeClass(className.outward)
                .addClass(className.animating)
                .addClass(className.transition)
                .css(animationName)
              ;
              inAnimation = jQueryclone
                .addClass(className.inward)
                .css(animationName)
              ;
              displayType = jQueryclone
                .attr('class', elementClass)
                .removeAttr('style')
                .removeClass(className.hidden)
                .removeClass(className.visible)
                .show()
                .css('display')
              ;
              module.verbose('Determining final display state', displayType);
              if(currentAnimation != inAnimation) {
                module.debug('Transition exists for animation', animation);
                animationExists = true;
              }
              else {
                module.debug('Static animation found', animation, displayType);
                animationExists = false;
              }
              jQueryclone.remove();
              module.save.displayType(displayType);
              if(transitionExists === undefined) {
                module.save.transitionExists(animation, animationExists);
              }
            }
            return transitionExists || animationExists;
          }
        },

        is: {
          animating: function() {
            return jQuerymodule.hasClass(className.animating);
          },
          inward: function() {
            return jQuerymodule.hasClass(className.inward);
          },
          outward: function() {
            return jQuerymodule.hasClass(className.outward);
          },
          looping: function() {
            return jQuerymodule.hasClass(className.looping);
          },
          occuring: function(animation) {
            animation = animation || settings.animation;
            animation = animation.replace(' ', '.');
            return ( jQuerymodule.filter(animation).size() > 0 );
          },
          visible: function() {
            return jQuerymodule.is(':visible');
          },
          hidden: function() {
            return jQuerymodule.css('visibility') === 'hidden';
          },
          supported: function() {
            return(animationName !== false && animationEnd !== false);
          }
        },

        hide: function() {
          module.verbose('Hiding element');
          if( module.is.animating() ) {
            module.reset();
          }
          module.remove.display();
          module.remove.visible();
          module.set.hidden();
          module.repaint();
        },

        show: function(display) {
          module.verbose('Showing element', display);
          module.remove.hidden();
          module.set.visible();
          module.repaint();
        },

        start: function() {
          module.verbose('Starting animation');
          jQuerymodule.removeClass(className.disabled);
        },

        stop: function() {
          module.debug('Stopping animation');
          jQuerymodule.addClass(className.disabled);
        },

        toggle: function() {
          module.debug('Toggling play status');
          jQuerymodule.toggleClass(className.disabled);
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 600);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            jQuery.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if(jQueryallModules.size() > 1) {
              title += ' ' + '(' + jQueryallModules.size() + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                jQuery.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        // modified for transition to return invoke success
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            jQuery.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( jQuery.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }

          if(jQuery.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return (found !== undefined)
            ? found
            : false
          ;
        }
      };
      module.initialize();
    })
  ;
  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

// Records if CSS transition is available
jQuery.fn.transition.exists = {};

jQuery.fn.transition.settings = {

  // module info
  name        : 'Transition',

  // debug content outputted to console
  debug       : false,

  // verbose debug output
  verbose     : true,

  // performance data output
  performance : true,

  // event namespace
  namespace   : 'transition',

  // animation complete event
  onStart     : function() {},
  onComplete  : function() {},
  onShow      : function() {},
  onHide      : function() {},

  // whether EXACT animation can occur twice in a row
  allowRepeats : false,

  // Override final display type on visible
  displayType : false,

  // animation duration
  animation  : 'fade',
  duration   : '500ms',

  // new animations will occur after previous ones
  queue       : true,

  metadata : {
    displayType: 'display'
  },

  className   : {
    animating  : 'animating',
    disabled   : 'disabled',
    hidden     : 'hidden',
    inward     : 'in',
    loading    : 'loading',
    looping    : 'looping',
    outward    : 'out',
    transition : 'transition',
    visible    : 'visible'
  },

  // possible errors
  error: {
    noAnimation : 'There is no css animation matching the one you specified.',
    repeated    : 'That animation is already occurring, cancelling repeated animation',
    method      : 'The method you called is not defined',
    support     : 'This browser does not support CSS animations'
  }

};


})( jQuery, window , document );

 /*
 * # Semantic - Video
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function (jQuery, window, document, undefined) {

"use strict";

jQuery.fn.video = function(parameters) {

  var
    jQueryallModules     = jQuery(this),

    moduleSelector  = jQueryallModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),

    requestAnimationFrame = window.requestAnimationFrame
      || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame
      || window.msRequestAnimationFrame
      || function(callback) { setTimeout(callback, 0); },

    returnedValue
  ;

  jQueryallModules
    .each(function() {
      var
        settings        = ( jQuery.isPlainObject(parameters) )
          ? jQuery.extend(true, {}, jQuery.fn.video.settings, parameters)
          : jQuery.extend({}, jQuery.fn.video.settings),

        selector        = settings.selector,
        className       = settings.className,
        error           = settings.error,
        metadata        = settings.metadata,
        namespace       = settings.namespace,
        templates       = settings.templates,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        jQuerywindow         = jQuery(window),
        jQuerymodule         = jQuery(this),
        jQueryplaceholder    = jQuerymodule.find(selector.placeholder),
        jQueryplayButton     = jQuerymodule.find(selector.playButton),
        jQueryembed          = jQuerymodule.find(selector.embed),

        element         = this,
        instance        = jQuerymodule.data(moduleNamespace),
        module
      ;

      module = {

        initialize: function() {
          module.debug('Initializing video');
          module.create();
          jQueryplaceholder
            .on('click' + eventNamespace, module.play)
          ;
          jQueryplayButton
            .on('click' + eventNamespace, module.play)
          ;
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          jQuerymodule
            .data(moduleNamespace, module)
          ;
        },

        create: function() {
          var
            image = jQuerymodule.data(metadata.image),
            html = templates.video(image)
          ;
          jQuerymodule.html(html);
          module.refresh();
          if(!image) {
            module.play();
          }
          module.debug('Creating html for video element', html);
        },

        destroy: function() {
          module.verbose('Destroying previous instance of video');
          module.reset();
          jQuerymodule
            .removeData(moduleNamespace)
            .off(eventNamespace)
          ;
          jQueryplaceholder
            .off(eventNamespace)
          ;
          jQueryplayButton
            .off(eventNamespace)
          ;
        },

        refresh: function() {
          module.verbose('Refreshing selector cache');
          jQueryplaceholder    = jQuerymodule.find(selector.placeholder);
          jQueryplayButton     = jQuerymodule.find(selector.playButton);
          jQueryembed          = jQuerymodule.find(selector.embed);
        },

        // sets new video
        change: function(source, id, url) {
          module.debug('Changing video to ', source, id, url);
          jQuerymodule
            .data(metadata.source, source)
            .data(metadata.id, id)
            .data(metadata.url, url)
          ;
          settings.onChange();
        },

        // clears video embed
        reset: function() {
          module.debug('Clearing video embed and showing placeholder');
          jQuerymodule
            .removeClass(className.active)
          ;
          jQueryembed
            .html(' ')
          ;
          jQueryplaceholder
            .show()
          ;
          settings.onReset();
        },

        // plays current video
        play: function() {
          module.debug('Playing video');
          var
            source = jQuerymodule.data(metadata.source) || false,
            url    = jQuerymodule.data(metadata.url)    || false,
            id     = jQuerymodule.data(metadata.id)     || false
          ;
          jQueryembed
            .html( module.generate.html(source, id, url) )
          ;
          jQuerymodule
            .addClass(className.active)
          ;
          settings.onPlay();
        },

        get: {
          source: function(url) {
            if(typeof url !== 'string') {
              return false;
            }
            if(url.search('youtube.com') !== -1) {
              return 'youtube';
            }
            else if(url.search('vimeo.com') !== -1) {
              return 'vimeo';
            }
            return false;
          },
          id: function(url) {
            if(settings.regExp.youtube.test(url)) {
              return url.match(settings.regExp.youtube)[1];
            }
            else if(settings.regExp.vimeo.test(url)) {
              return url.match(settings.regExp.vimeo)[2];
            }
            return false;
          }
        },

        generate: {
          // generates iframe html
          html: function(source, id, url) {
            module.debug('Generating embed html');
            var
              html
            ;
            // allow override of settings
            source = source || settings.source;
            id     = id     || settings.id;
            if((source && id) || url) {
              if(!source || !id) {
                source = module.get.source(url);
                id     = module.get.id(url);
              }
              if(source == 'vimeo') {
                html = ''
                  + '<iframe src="http://player.vimeo.com/video/' + id + '?=' + module.generate.url(source) + '"'
                  + ' width="100%" height="100%"'
                  + ' frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'
                ;
              }
              else if(source == 'youtube') {
                html = ''
                  + '<iframe src="http://www.youtube.com/embed/' + id + '?=' + module.generate.url(source) + '"'
                  + ' width="100%" height="100%"'
                  + ' frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'
                ;
              }
            }
            else {
              module.error(error.noVideo);
            }
            return html;
          },

          // generate url parameters
          url: function(source) {
            var
              api      = (settings.api)
                ? 1
                : 0,
              autoplay = (settings.autoplay === 'auto')
                ? (jQuerymodule.data('image') !== undefined)
                : settings.autoplay,
              hd       = (settings.hd)
                ? 1
                : 0,
              showUI   = (settings.showUI)
                ? 1
                : 0,
              // opposite used for some params
              hideUI   = !(settings.showUI)
                ? 1
                : 0,
              url = ''
            ;
            if(source == 'vimeo') {
              url = ''
                +      'api='      + api
                + '&amp;title='    + showUI
                + '&amp;byline='   + showUI
                + '&amp;portrait=' + showUI
                + '&amp;autoplay=' + autoplay
              ;
              if(settings.color) {
                url += '&amp;color=' + settings.color;
              }
            }
            if(source == 'ustream') {
              url = ''
                + 'autoplay=' + autoplay
              ;
              if(settings.color) {
                url += '&amp;color=' + settings.color;
              }
            }
            else if(source == 'youtube') {
              url = ''
                + 'enablejsapi='      + api
                + '&amp;autoplay='    + autoplay
                + '&amp;autohide='    + hideUI
                + '&amp;hq='          + hd
                + '&amp;modestbranding=1'
              ;
              if(settings.color) {
                url += '&amp;color=' + settings.color;
              }
            }
            return url;
          }
        },

        setting: function(name, value) {
          module.debug('Changing setting', name, value);
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            jQuery.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if(jQueryallModules.size() > 1) {
              title += ' ' + '(' + jQueryallModules.size() + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                jQuery.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            jQuery.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( jQuery.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if(jQuery.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;
  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

jQuery.fn.video.settings = {

  name        : 'Video',
  namespace   : 'video',

  debug       : false,
  verbose     : true,
  performance : true,

  metadata    : {
    id     : 'id',
    image  : 'image',
    source : 'source',
    url    : 'url'
  },

  source      : false,
  url         : false,
  id          : false,

  aspectRatio : (16/9),

  onPlay   : function(){},
  onReset  : function(){},
  onChange : function(){},

  // callbacks not coded yet (needs to use jsapi)
  onPause  : function() {},
  onStop   : function() {},

  width    : 'auto',
  height   : 'auto',

  autoplay : 'auto',
  color    : '#442359',
  hd       : true,
  showUI   : false,
  api      : true,

  regExp : {
    youtube : /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?jQuery/,
    vimeo   : /http:\/\/(www\.)?vimeo.com\/(\d+)(jQuery|\/)/
  },

  error      : {
    noVideo     : 'No video specified',
    method      : 'The method you called is not defined'
  },

  className   : {
    active      : 'active'
  },

  selector    : {
    embed       : '.embed',
    placeholder : '.placeholder',
    playButton  : '.play'
  }
};

jQuery.fn.video.settings.templates = {
  video: function(image) {
    var
      html = ''
    ;
    if(image) {
      html += ''
        + '<i class="video play icon"></i>'
        + '<img class="placeholder" src="' + image + '">'
      ;
    }
    html += '<div class="embed"></div>';
    return html;
  }
};


})( jQuery, window , document );

/*
 * # Semantic - Visibility
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( jQuery, window, document, undefined ) {

jQuery.fn.visibility = function(parameters) {
  var
    jQueryallModules    = jQuery(this),
    moduleSelector = jQueryallModules.selector || '',

    time           = new Date().getTime(),
    performance    = [],

    query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1),
    returnedValue
  ;

  jQueryallModules
    .each(function() {
      var
        settings        = jQuery.extend(true, {}, jQuery.fn.visibility.settings, parameters),

        className       = settings.className,
        namespace       = settings.namespace,
        error           = settings.error,

        eventNamespace  = '.' + namespace,
        moduleNamespace = 'module-' + namespace,

        jQuerywindow         = jQuery(window),
        jQuerymodule         = jQuery(this),
        jQuerycontext        = jQuery(settings.context),
        jQuerycontainer      = jQuerymodule.offsetParent(),

        selector        = jQuerymodule.selector || '',
        instance        = jQuerymodule.data(moduleNamespace),

        requestAnimationFrame = window.requestAnimationFrame
          || window.mozRequestAnimationFrame
          || window.webkitRequestAnimationFrame
          || window.msRequestAnimationFrame
          || function(callback) { setTimeout(callback, 0); },

        element         = this,
        module
      ;

      module      = {

        initialize: function() {
          module.verbose('Initializing visibility', settings);

          module.setup.cache();
          module.save.position();
          module.bindEvents();
          module.instantiate();

          if(settings.type == 'image') {
            module.setup.image();
          }
          if(settings.type == 'fixed') {
            module.setup.fixed();
          }

          requestAnimationFrame(module.checkVisibility);
        },

        instantiate: function() {
          module.verbose('Storing instance of module', module);
          instance = module;
          jQuerymodule
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying previous module');
          jQuerymodule
            .off(eventNamespace)
            .removeData(moduleNamespace)
          ;
        },

        bindEvents: function() {
          module.verbose('Binding visibility events to scroll and resize');
          jQuerywindow
            .on('resize' + eventNamespace, module.event.refresh)
          ;
          jQuerycontext
            .on('scroll' + eventNamespace, module.event.scroll)
          ;
        },

        event: {
          refresh: function() {
            requestAnimationFrame(module.refresh);
          },
          scroll: function() {
            module.verbose('Scroll position changed');
            if(settings.throttle) {
              clearTimeout(module.timer);
              module.timer = setTimeout(module.checkVisibility, settings.throttle);
            }
            else {
              requestAnimationFrame(module.checkVisibility);
            }
          }
        },

        precache: function(images, callback) {
          if (!(images instanceof Array)) {
            images = [images];
          }
          var
            imagesLength  = images.length,
            loadedCounter = 0,
            cache         = [],
            cacheImage    = document.createElement('img'),
            handleLoad    = function() {
              loadedCounter++;
              if (loadedCounter >= images.length) {
                if (jQuery.isFunction(callback)) {
                  callback();
                }
              }
            }
          ;
          while (imagesLength--) {
            cacheImage         = document.createElement('img');
            cacheImage.onload  = handleLoad;
            cacheImage.onerror = handleLoad;
            cacheImage.src     = images[imagesLength];
            cache.push(cacheImage);
          }
        },

        setup: {
          cache: function() {
            module.cache = {
              occurred : {},
              screen   : {},
              element  : {},
            };
          },
          image: function() {
            var
              src = jQuerymodule.data('src')
            ;
            if(src) {
              module.verbose('Lazy loading image', src);
              // show when top visible
              module.topVisible(function() {
                module.precache(src, function() {
                  module.set.image(src);
                  settings.onTopVisible = false;
                });
              });
            }
          },
          fixed: function() {
            module.verbose('Setting up fixed on element pass');
            jQuerymodule
              .visibility({
                once: false,
                continuous: false,
                onTopPassed: function() {
                  jQuerymodule
                    .addClass(className.fixed)
                    .css({
                      position: 'fixed',
                      top: settings.offset + 'px'
                    })
                  ;
                  if(settings.animation && jQuery.fn.transition !== undefined) {
                    jQuerymodule.transition(settings.transition, settings.duration);
                  }
                },
                onTopPassedReverse: function() {
                  jQuerymodule
                    .removeClass(className.fixed)
                    .css({
                      position: '',
                      top: ''
                    })
                  ;
                }
              })
            ;
          }
        },

        set: {
          image: function(src) {
            var
              offScreen = (module.cache.screen.bottom < module.cache.element.top)
            ;
            jQuerymodule
              .attr('src', src)
            ;
            if(offScreen) {
              module.verbose('Image outside browser, avoiding animation')
              jQuerymodule.show();
            }
            else {
              if(settings.transition && jQuery.fn.transition !== undefined) {
                jQuerymodule.transition(settings.transition, settings.duration);
              }
              else {
                jQuerymodule.fadeIn(settings.duration);
              }
            }
          }
        },

        refresh: function() {
          module.debug('Refreshing constants (element width/height)');
          module.reset();
          module.save.position();
          module.checkVisibility();
          jQuery.proxy(settings.onRefresh, element)();
        },

        reset: function() {
          module.verbose('Reseting all cached values');
          if( jQuery.isPlainObject(module.cache) ) {
            module.cache.screen = {};
            module.cache.element = {};
          }
        },

        checkVisibility: function() {
          module.verbose('Checking visibility of element', module.cache.element);
          module.save.scroll();
          module.save.direction();
          module.save.screenCalculations();
          module.save.elementCalculations();

          // percentage
          module.passed();

          // reverse (must be first)
          module.passingReverse();
          module.topVisibleReverse();
          module.bottomVisibleReverse();
          module.topPassedReverse();
          module.bottomPassedReverse();

          // one time
          module.passing();
          module.topVisible();
          module.bottomVisible();
          module.topPassed();
          module.bottomPassed();
        },

        passed: function(amount, newCallback) {
          var
            calculations   = module.get.elementCalculations(),
            amountInPixels
          ;
          // assign callback
          if(amount !== undefined && newCallback !== undefined) {
            settings.onPassed[amount] = newCallback;
          }
          else if(amount !== undefined) {
            return (module.get.pixelsPassed(amount) > calculations.pixelsPassed);
          }
          else if(calculations.passing) {
            jQuery.each(settings.onPassed, function(amount, callback) {
              if(calculations.bottomVisible || calculations.pixelsPassed > module.get.pixelsPassed(amount)) {
                module.execute(callback, amount);
              }
              else if(!settings.once) {
                module.remove.occurred(callback);
              }
            });
          }
        },

        passing: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onPassing,
            callbackName = 'passing'
          ;
          if(newCallback) {
            module.debug('Adding callback for passing', newCallback);
            settings.onPassing = newCallback;
          }
          if(calculations.passing) {
            module.execute(callback, callbackName);
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback !== undefined) {
            return calculations.passing;
          }
        },


        topVisible: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onTopVisible,
            callbackName = 'topVisible'
          ;
          if(newCallback) {
            module.debug('Adding callback for top visible', newCallback);
            settings.onTopVisible = newCallback;
          }
          if(calculations.topVisible) {
            module.execute(callback, callbackName);
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return calculations.topVisible;
          }
        },

        bottomVisible: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onBottomVisible,
            callbackName = 'bottomVisible'
          ;
          if(newCallback) {
            module.debug('Adding callback for bottom visible', newCallback);
            settings.onBottomVisible = newCallback;
          }
          if(calculations.bottomVisible) {
            module.execute(callback, callbackName);
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return calculations.bottomVisible;
          }
        },

        topPassed: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onTopPassed,
            callbackName = 'topPassed'
          ;
          if(newCallback) {
            module.debug('Adding callback for top passed', newCallback);
            settings.onTopPassed = newCallback;
          }
          if(calculations.topPassed) {
            module.execute(callback, callbackName);
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return calculations.onTopPassed;
          }
        },

        bottomPassed: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onBottomPassed,
            callbackName = 'bottomPassed'
          ;
          if(newCallback) {
            module.debug('Adding callback for bottom passed', newCallback);
            settings.onBottomPassed = newCallback;
          }
          if(calculations.bottomPassed) {
            module.execute(callback, callbackName);
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return calculations.bottomPassed;
          }
        },

        passingReverse: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onPassingReverse,
            callbackName = 'passingReverse'
          ;
          if(newCallback) {
            module.debug('Adding callback for passing reverse', newCallback);
            settings.onPassingReverse = newCallback;
          }
          if(!calculations.passing) {
            if(module.get.occurred('passing')) {
              module.execute(callback, callbackName);
            }
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback !== undefined) {
            return !calculations.passing;
          }
        },


        topVisibleReverse: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onTopVisibleReverse,
            callbackName = 'topVisibleReverse'
          ;
          if(newCallback) {
            module.debug('Adding callback for top visible reverse', newCallback);
            settings.onTopVisibleReverse = newCallback;
          }
          if(!calculations.topVisible) {
            if(module.get.occurred('topVisible')) {
              module.execute(callback, callbackName);
            }
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return !calculations.topVisible;
          }
        },

        bottomVisibleReverse: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onBottomVisibleReverse,
            callbackName = 'bottomVisibleReverse'
          ;
          if(newCallback) {
            module.debug('Adding callback for bottom visible reverse', newCallback);
            settings.onBottomVisibleReverse = newCallback;
          }
          if(!calculations.bottomVisible) {
            if(module.get.occurred('bottomVisible')) {
              module.execute(callback, callbackName);
            }
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return !calculations.bottomVisible;
          }
        },

        topPassedReverse: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onTopPassedReverse,
            callbackName = 'topPassedReverse'
          ;
          if(newCallback) {
            module.debug('Adding callback for top passed reverse', newCallback);
            settings.onTopPassedReverse = newCallback;
          }
          if(!calculations.topPassed) {
            if(module.get.occurred('topPassed')) {
              module.execute(callback, callbackName);
            }
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return !calculations.onTopPassed;
          }
        },

        bottomPassedReverse: function(newCallback) {
          var
            calculations = module.get.elementCalculations(),
            callback     = newCallback || settings.onBottomPassedReverse,
            callbackName = 'bottomPassedReverse'
          ;
          if(newCallback) {
            module.debug('Adding callback for bottom passed reverse', newCallback);
            settings.onBottomPassedReverse = newCallback;
          }
          if(!calculations.bottomPassed) {
            if(module.get.occurred('bottomPassed')) {
              module.execute(callback, callbackName);
            }
          }
          else if(!settings.once) {
            module.remove.occurred(callbackName);
          }
          if(newCallback === undefined) {
            return !calculations.bottomPassed;
          }
        },

        execute: function(callback, callbackName) {
          var
            calculations = module.get.elementCalculations(),
            screen       = module.get.screenCalculations()
          ;
          callback     = callback || false;
          if(callback) {
            if(settings.continuous) {
              module.debug('Callback being called continuously', callbackName, calculations);
              jQuery.proxy(callback, element)(calculations, screen);
            }
            else if(!module.get.occurred(callbackName)) {
              module.debug('Conditions met', callbackName, calculations);
              jQuery.proxy(callback, element)(calculations, screen);
            }
          }
          module.save.occurred(callbackName);
        },

        remove: {
          occurred: function(callback) {
            if(callback) {
              if(module.cache.occurred[callback] !== undefined && module.cache.occurred[callback] === true) {
                module.debug('Callback can now be called again', callback);
                module.cache.occurred[callback] = false;
              }
            }
            else {
              module.cache.occurred = {};
            }
          }
        },

        save: {
          occurred: function(callback) {
            if(callback) {
              if(module.cache.occurred[callback] === undefined || (module.cache.occurred[callback] !== true)) {
                module.verbose('Saving callback occurred', callback);
                module.cache.occurred[callback] = true;
              }
            }
          },
          scroll: function() {
            module.cache.scroll = jQuerycontext.scrollTop() + settings.offset;
          },
          direction: function() {
            var
              scroll     = module.get.scroll(),
              lastScroll = module.get.lastScroll(),
              direction
            ;
            if(scroll > lastScroll && lastScroll) {
              direction = 'down';
            }
            else if(scroll < lastScroll && lastScroll) {
              direction = 'up';
            }
            else {
              direction = 'static';
            }
            module.cache.direction = direction;
            return module.cache.direction;
          },
          elementPosition: function() {
            var
              screen = module.get.screenSize()
            ;
            module.verbose('Saving element position');
            jQuery.extend(module.cache.element, {
              margin : {
                top    : parseInt(jQuerymodule.css('margin-top'), 10),
                bottom : parseInt(jQuerymodule.css('margin-bottom'), 10)
              },
              fits   : (element.height < screen.height),
              offset : jQuerymodule.offset(),
              width  : jQuerymodule.outerWidth(),
              height : jQuerymodule.outerHeight()
            });
            return module.cache.element;
          },
          elementCalculations: function() {
            var
              screen  = module.get.screenCalculations(),
              element = module.get.elementPosition()
            ;
            // offset
            if(settings.includeMargin) {
              jQuery.extend(module.cache.element, {
                top    : element.offset.top - element.margin.top,
                bottom : element.offset.top + element.height + element.margin.bottom
              });
            }
            else {
              jQuery.extend(module.cache.element, {
                top    : element.offset.top,
                bottom : element.offset.top + element.height
              });
            }
            // visibility
            jQuery.extend(module.cache.element, {
              topVisible       : (screen.bottom >= element.top),
              topPassed        : (screen.top >= element.top),
              bottomVisible    : (screen.bottom >= element.bottom),
              bottomPassed     : (screen.top >= element.bottom),
              pixelsPassed     : 0,
              percentagePassed : 0
            });
            // meta calculations
            jQuery.extend(module.cache.element, {
              visible : (module.cache.element.topVisible || module.cache.element.bottomVisible),
              passing : (module.cache.element.topPassed && !module.cache.element.bottomPassed),
              hidden  : (!module.cache.element.topVisible && !module.cache.element.bottomVisible)
            });
            if(module.cache.element.passing) {
              module.cache.element.pixelsPassed = (screen.top - element.top);
              module.cache.element.percentagePassed = (screen.top - element.top) / element.height;
            }
            module.verbose('Updated element calculations', module.cache.element);
          },
          screenCalculations: function() {
            var
              scroll = jQuerycontext.scrollTop() + settings.offset
            ;
            if(module.cache.scroll === undefined) {
              module.cache.scroll = jQuerycontext.scrollTop() + settings.offset;
            }
            module.save.direction();
            jQuery.extend(module.cache.screen, {
              top    : scroll,
              bottom : scroll + module.cache.screen.height
            });
            return module.cache.screen;
          },
          screenSize: function() {
            module.verbose('Saving window position');
            module.cache.screen = {
              height: jQuerycontext.height()
            };
          },
          position: function() {
            module.save.screenSize();
            module.save.elementPosition();
          }
        },

        get: {
          pixelsPassed: function(amount) {
            var
              element = module.get.elementCalculations()
            ;
            if(amount.search('%') > -1) {
              return ( element.height * (parseInt(amount, 10) / 100) );
            }
            return parseInt(amount, 10);
          },
          occurred: function(callback) {
            return (module.cache.occurred !== undefined)
              ? module.cache.occurred[callback] || false
              : false
            ;
          },
          direction: function() {
            if(module.cache.direction === undefined) {
              module.save.direction();
            }
            return module.cache.direction;
          },
          elementPosition: function() {
            if(module.cache.element === undefined) {
              module.save.elementPosition();
            }
            return module.cache.element;
          },
          elementCalculations: function() {
            if(module.cache.element === undefined) {
              module.save.elementCalculations();
            }
            return module.cache.element;
          },
          screenCalculations: function() {
            if(module.cache.screen === undefined) {
              module.save.screenCalculations();
            }
            return module.cache.screen;
          },
          screenSize: function() {
            if(module.cache.screen === undefined) {
              module.save.screenSize();
            }
            return module.cache.screen;
          },
          scroll: function() {
            if(module.cache.scroll === undefined) {
              module.save.scroll();
            }
            return module.cache.scroll;
          },
          lastScroll: function() {
            if(module.cache.screen === undefined) {
              module.debug('First scroll event, no last scroll could be found');
              return false;
            }
            return module.cache.screen.top;
          }
        },

        setting: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, module, name);
          }
          else if(value !== undefined) {
            module[name] = value;
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            jQuery.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                jQuery.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            jQuery.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( jQuery.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if(jQuery.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };

      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }
    })
  ;

  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

jQuery.fn.visibility.settings = {

  name                   : 'Visibility',
  namespace              : 'visibility',

  className: {
    fixed: 'fixed'
  },

  debug                  : false,
  verbose                : false,
  performance            : true,

  offset                 : 0,
  includeMargin          : false,

  context                : window,

  // visibility check delay in ms (defaults to animationFrame)
  throttle               : false,

  // special visibility type (image, fixed)
  type                   : false,

  // image only settings
  transition             : false,
  duration               : 500,

  // array of callbacks for percentage
  onPassed               : {},

  // standard callbacks
  onPassing              : false,
  onTopVisible           : false,
  onBottomVisible        : false,
  onTopPassed            : false,
  onBottomPassed         : false,

  // reverse callbacks
  onPassingReverse       : false,
  onTopVisibleReverse    : false,
  onBottomVisibleReverse : false,
  onTopPassedReverse     : false,
  onBottomPassedReverse  : false,

  once                   : true,
  continuous             : false,

  // utility callbacks
  onRefresh              : function(){},
  onScroll               : function(){},

  error : {
    method   : 'The method you called is not defined.'
  }

};

})( jQuery, window , document );

/*
 * # Semantic - Visit
 * http://github.com/semantic-org/semantic-ui/
 *
 *
 * Copyright 2014 Contributor
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function (jQuery, window, document, undefined) {

jQuery.visit = jQuery.fn.visit = function(parameters) {
  var
    jQueryallModules     = jQuery.isFunction(this)
        ? jQuery(window)
        : jQuery(this),
    moduleSelector  = jQueryallModules.selector || '',

    time            = new Date().getTime(),
    performance     = [],

    query           = arguments[0],
    methodInvoked   = (typeof query == 'string'),
    queryArguments  = [].slice.call(arguments, 1),
    returnedValue
  ;
  jQueryallModules
    .each(function() {
      var
        settings        = jQuery.extend(true, {}, jQuery.fn.visit.settings, parameters),

        error           = settings.error,
        namespace       = settings.namespace,

        eventNamespace  = '.' + namespace,
        moduleNamespace = namespace + '-module',

        jQuerymodule         = jQuery(this),
        jQuerydisplays       = jQuery(),

        element         = this,
        instance        = jQuerymodule.data(moduleNamespace),
        module
      ;
      module = {

        initialize: function() {
          if(settings.count) {
            module.store(settings.key.count, settings.count);
          }
          else if(settings.id) {
            module.add.id(settings.id);
          }
          else if(settings.increment && methodInvoked !== 'increment') {
            module.increment();
          }
          module.add.display(jQuerymodule);
          module.instantiate();
        },

        instantiate: function() {
          module.verbose('Storing instance of visit module', module);
          instance = module;
          jQuerymodule
            .data(moduleNamespace, module)
          ;
        },

        destroy: function() {
          module.verbose('Destroying instance');
          jQuerymodule
            .removeData(moduleNamespace)
          ;
        },

        increment: function(id) {
          var
            currentValue = module.get.count(),
            newValue     = +(currentValue) + 1
          ;
          if(id) {
            module.add.id(id);
          }
          else {
            if(newValue > settings.limit && !settings.surpass) {
              newValue = settings.limit;
            }
            module.debug('Incrementing visits', newValue);
            module.store(settings.key.count, newValue);
          }
        },

        decrement: function(id) {
          var
            currentValue = module.get.count(),
            newValue     = +(currentValue) - 1
          ;
          if(id) {
            module.remove.id(id);
          }
          else {
            module.debug('Removing visit');
            module.store(settings.key.count, newValue);
          }
        },

        get: {
          count: function() {
            return +(module.retrieve(settings.key.count)) || 0;
          },
          idCount: function(ids) {
            ids = ids || module.get.ids();
            return ids.length;
          },
          ids: function(delimitedIDs) {
            var
              idArray = []
            ;
            delimitedIDs = delimitedIDs || module.retrieve(settings.key.ids);
            if(typeof delimitedIDs === 'string') {
              idArray = delimitedIDs.split(settings.delimiter);
            }
            module.verbose('Found visited ID list', idArray);
            return idArray;
          },
          storageOptions: function(data) {
            var
              options = {}
            ;
            if(settings.expires) {
              options.expires = settings.expires;
            }
            if(settings.domain) {
              options.domain = settings.domain;
            }
            if(settings.path) {
              options.path = settings.path;
            }
            return options;
          }
        },

        has: {
          visited: function(id, ids) {
            var
              visited = false
            ;
            ids = ids || module.get.ids();
            if(id !== undefined && ids) {
              jQuery.each(ids, function(index, value){
                if(value == id) {
                  visited = true;
                }
              });
            }
            return visited;
          }
        },

        set: {
          count: function(value) {
            module.store(settings.key.count, value);
          },
          ids: function(value) {
            module.store(settings.key.ids, value);
          }
        },

        reset: function() {
          module.store(settings.key.count, 0);
          module.store(settings.key.ids, null);
        },

        add: {
          id: function(id) {
            var
              currentIDs = module.retrieve(settings.key.ids),
              newIDs = (currentIDs === undefined || currentIDs === '')
                ? id
                : currentIDs + settings.delimiter + id
            ;
            if( module.has.visited(id) ) {
              module.debug('Unique content already visited, not adding visit', id, currentIDs);
            }
            else if(id === undefined) {
              module.debug('ID is not defined');
            }
            else {
              module.debug('Adding visit to unique content', id);
              module.store(settings.key.ids, newIDs);
            }
            module.set.count( module.get.idCount() );
          },
          display: function(selector) {
            var
              jQueryelement = jQuery(selector)
            ;
            if(jQueryelement.size() > 0 && !jQuery.isWindow(jQueryelement[0])) {
              module.debug('Updating visit count for element', jQueryelement);
              jQuerydisplays = (jQuerydisplays.size() > 0)
                ? jQuerydisplays.add(jQueryelement)
                : jQueryelement
              ;
            }
          }
        },

        remove: {
          id: function(id) {
            var
              currentIDs = module.get.ids(),
              newIDs     = []
            ;
            if(id !== undefined && currentIDs !== undefined) {
              module.debug('Removing visit to unique content', id, currentIDs);
              jQuery.each(currentIDs, function(index, value){
                if(value !== id) {
                  newIDs.push(value);
                }
              });
              newIDs = newIDs.join(settings.delimiter);
              module.store(settings.key.ids, newIDs );
            }
            module.set.count( module.get.idCount() );
          }
        },

        check: {
          limit: function(value) {
            value = value || module.get.count();
            if(settings.limit) {
              if(value >= settings.limit) {
                module.debug('Pages viewed exceeded limit, firing callback', value, settings.limit);
                jQuery.proxy(settings.onLimit, this)(value);
              }
              module.debug('Limit not reached', value, settings.limit);
              jQuery.proxy(settings.onChange, this)(value);
            }
            module.update.display(value);
          }
        },

        update: {
          display: function(value) {
            value = value || module.get.count();
            if(jQuerydisplays.size() > 0) {
              module.debug('Updating displayed view count', jQuerydisplays);
              jQuerydisplays.html(value);
            }
          }
        },

        store: function(key, value) {
          var
            options = module.get.storageOptions(value)
          ;
          if(settings.storageMethod == 'localstorage' && window.localStorage !== undefined) {
            window.localStorage.setItem(key, value);
            module.debug('Value stored using local storage', key, value);
          }
          else if(jQuery.cookie !== undefined) {
            jQuery.cookie(key, value, options);
            module.debug('Value stored using cookie', key, value, options);
          }
          else {
            module.error(error.noCookieStorage);
            return;
          }
          if(key == settings.key.count) {
            module.check.limit(value);
          }
        },
        retrieve: function(key, value) {
          var
            storedValue
          ;
          if(settings.storageMethod == 'localstorage' && window.localStorage !== undefined) {
            storedValue = window.localStorage.getItem(key);
          }
          // get by cookie
          else if(jQuery.cookie !== undefined) {
            storedValue = jQuery.cookie(key);
          }
          else {
            module.error(error.noCookieStorage);
          }
          if(storedValue == 'undefined' || storedValue == 'null' || storedValue === undefined || storedValue === null) {
            storedValue = undefined;
          }
          return storedValue;
        },

        setting: function(name, value) {
          if( jQuery.isPlainObject(name) ) {
            jQuery.extend(true, settings, name);
          }
          else if(value !== undefined) {
            settings[name] = value;
          }
          else {
            return settings[name];
          }
        },
        internal: function(name, value) {
          module.debug('Changing internal', name, value);
          if(value !== undefined) {
            if( jQuery.isPlainObject(name) ) {
              jQuery.extend(true, module, name);
            }
            else {
              module[name] = value;
            }
          }
          else {
            return module[name];
          }
        },
        debug: function() {
          if(settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.debug = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.debug.apply(console, arguments);
            }
          }
        },
        verbose: function() {
          if(settings.verbose && settings.debug) {
            if(settings.performance) {
              module.performance.log(arguments);
            }
            else {
              module.verbose = Function.prototype.bind.call(console.info, console, settings.name + ':');
              module.verbose.apply(console, arguments);
            }
          }
        },
        error: function() {
          module.error = Function.prototype.bind.call(console.error, console, settings.name + ':');
          module.error.apply(console, arguments);
        },
        performance: {
          log: function(message) {
            var
              currentTime,
              executionTime,
              previousTime
            ;
            if(settings.performance) {
              currentTime   = new Date().getTime();
              previousTime  = time || currentTime;
              executionTime = currentTime - previousTime;
              time          = currentTime;
              performance.push({
                'Name'           : message[0],
                'Arguments'      : [].slice.call(message, 1) || '',
                'Element'        : element,
                'Execution Time' : executionTime
              });
            }
            clearTimeout(module.performance.timer);
            module.performance.timer = setTimeout(module.performance.display, 100);
          },
          display: function() {
            var
              title = settings.name + ':',
              totalTime = 0
            ;
            time = false;
            clearTimeout(module.performance.timer);
            jQuery.each(performance, function(index, data) {
              totalTime += data['Execution Time'];
            });
            title += ' ' + totalTime + 'ms';
            if(moduleSelector) {
              title += ' \'' + moduleSelector + '\'';
            }
            if(jQueryallModules.size() > 1) {
              title += ' ' + '(' + jQueryallModules.size() + ')';
            }
            if( (console.group !== undefined || console.table !== undefined) && performance.length > 0) {
              console.groupCollapsed(title);
              if(console.table) {
                console.table(performance);
              }
              else {
                jQuery.each(performance, function(index, data) {
                  console.log(data['Name'] + ': ' + data['Execution Time']+'ms');
                });
              }
              console.groupEnd();
            }
            performance = [];
          }
        },
        invoke: function(query, passedArguments, context) {
          var
            object = instance,
            maxDepth,
            found,
            response
          ;
          passedArguments = passedArguments || queryArguments;
          context         = element         || context;
          if(typeof query == 'string' && object !== undefined) {
            query    = query.split(/[\. ]/);
            maxDepth = query.length - 1;
            jQuery.each(query, function(depth, value) {
              var camelCaseValue = (depth != maxDepth)
                ? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
                : query
              ;
              if( jQuery.isPlainObject( object[camelCaseValue] ) && (depth != maxDepth) ) {
                object = object[camelCaseValue];
              }
              else if( object[camelCaseValue] !== undefined ) {
                found = object[camelCaseValue];
                return false;
              }
              else if( jQuery.isPlainObject( object[value] ) && (depth != maxDepth) ) {
                object = object[value];
              }
              else if( object[value] !== undefined ) {
                found = object[value];
                return false;
              }
              else {
                return false;
              }
            });
          }
          if ( jQuery.isFunction( found ) ) {
            response = found.apply(context, passedArguments);
          }
          else if(found !== undefined) {
            response = found;
          }
          if(jQuery.isArray(returnedValue)) {
            returnedValue.push(response);
          }
          else if(returnedValue !== undefined) {
            returnedValue = [returnedValue, response];
          }
          else if(response !== undefined) {
            returnedValue = response;
          }
          return found;
        }
      };
      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        if(instance !== undefined) {
          module.destroy();
        }
        module.initialize();
      }

    })
  ;
  return (returnedValue !== undefined)
    ? returnedValue
    : this
  ;
};

jQuery.fn.visit.settings = {

  name          : 'Visit',

  debug         : false,
  verbose       : true,
  performance   : true,

  namespace     : 'visit',

  increment     : false,
  surpass       : false,
  count         : false,
  limit         : false,

  delimiter     : '&',
  storageMethod : 'localstorage',

  key           : {
    count : 'visit-count',
    ids   : 'visit-ids'
  },

  expires       : 30,
  domain        : false,
  path          : '/',

  onLimit       : function() {},
  onChange      : function() {},

  error         : {
    method          : 'The method you called is not defined',
    missingPersist  : 'Using the persist setting requires the inclusion of PersistJS',
    noCookieStorage : 'The default storage cookie requires jQuery.cookie to be included.'
  }

};

})( jQuery, window , document );

/*! jquery.cookie v1.4.1 | MIT */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?a(require("jquery")):a(jQuery)}(function(a){function b(a){return h.raw?a:encodeURIComponent(a)}function c(a){return h.raw?a:decodeURIComponent(a)}function d(a){return b(h.json?JSON.stringify(a):String(a))}function e(a){0===a.indexOf('"')&&(a=a.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,"\\"));try{return a=decodeURIComponent(a.replace(g," ")),h.json?JSON.parse(a):a}catch(b){}}function f(b,c){var d=h.raw?b:e(b);return a.isFunction(c)?c(d):d}var g=/\+/g,h=a.cookie=function(e,g,i){if(void 0!==g&&!a.isFunction(g)){if(i=a.extend({},h.defaults,i),"number"==typeof i.expires){var j=i.expires,k=i.expires=new Date;k.setTime(+k+864e5*j)}return document.cookie=[b(e),"=",d(g),i.expires?"; expires="+i.expires.toUTCString():"",i.path?"; path="+i.path:"",i.domain?"; domain="+i.domain:"",i.secure?"; secure":""].join("")}for(var l=e?void 0:{},m=document.cookie?document.cookie.split("; "):[],n=0,o=m.length;o>n;n++){var p=m[n].split("="),q=c(p.shift()),r=p.join("=");if(e&&e===q){l=f(r,g);break}e||void 0===(r=f(r))||(l[q]=r)}return l};h.defaults={},a.removeCookie=function(b,c){return void 0===a.cookie(b)?!1:(a.cookie(b,"",a.extend({},c,{expires:-1})),!a.cookie(b))}});