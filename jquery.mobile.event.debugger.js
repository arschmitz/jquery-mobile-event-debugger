/*!
 * jQuery Mobile Event Debugger
 * http://uglymongrel.com.com
 *
 * Copyright 2014 Alexander Schmitz and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.uglymongrel.com.com/jquery-mobile-event-debugger/
 */
//>>excludeStart("jqmBuildExclude", pragmas.jqmBuildExclude);
//>>description: Utility for debugging events in jQuery Mobile.
//>>label: Event Debugger
//>>group: Utilities
//>>excludeEnd("jqmBuildExclude");
(function( factory ) {
	if ( typeof define === "function" && define.amd ) {

	// AMD. Register as an anonymous module.
	define([
		"jquery",
	], factory );
  } else {

	// Browser globals
	factory( jQuery );
  }
}(function( $ ) {
	$.ajaxSetup({ cache: true });
	function elementString( ele, omitData ) {
		var element = "<";
		//console.log( ele[ 0 ] );
		if ( ele[ 0 ] !== undefined ) {
			element += ele[ 0 ].tagName.toLowerCase();
		}

		if ( ele.attr( "id" ) !== undefined ) {
			element += " id=\"" + ele.attr( "id" ) + "\"";
		}
		if ( ele.attr( "id" ) !== undefined ) {
			element += " class=\"" + ele.attr( "class" ) + "\"";
		}
		if ( ele[ 0 ] !== undefined ) {
			$.each( ele[ 0 ].dataset, function( key, value ) {
				element += " data-" + key + "=\"" + value + "=\"";
			});
		}
		element += ">";
		return element;
	}
	var widgets = {},
		events = {},
		jsonDocs = {},
		vmouse = /^v/,
		touch = /^scroll|^swipe|^tap/,
		layout = /^throttled|^update|^orientation/,
		page = /^page/,
		navigation = /^hashchange|^navigate/;
	function getDocs( location ) {
		$.ajax( location, {
			success: function( data ) {
				docs = $.parseXML( data );
				$( docs ).find( "[type='widget']").each( function() {
					var title = $( this ).attr( "event-prefix" );
					widgets[ title ] = {};
					$( this ).find( "event" ).each( function() {
						widgets[ title ][ $( this ).attr( "name" ) ] = {
							"name": $( this ).attr( "name" ),
							"description": $( this ).find( "desc" ).text(),
							"deprecated" : $( this ).attr( "deprecated" ),
							"warning" : $( event ).find( ".warning" ).text()
						};
						if ( $( event ).is( "[deprecated]" ) ) {
							widgets[ title ][ $( this ).attr( "name" ) ][ "deprecated" ] = $( this ).attr( "deprecated" );
						}
					});
				});
				$( docs ).find( "[type='event']" ).each( function(){
					var name = $( this ).attr( "name" );
					if ( page.test( name ) ) {
						addEvent( "page", this );
					} else if ( vmouse.test( name ) ) {
						addEvent( "vmouse", this );
					} else if ( touch.test( name ) ) {
						addEvent( "touch", this );
					} else if ( layout.test( name ) ) {
						addEvent( "layout", this );
					} else if ( navigation.test( name ) ) {
						addEvent( "navigation", this );
					} else {
						addEvent( "other", this );
					}
					function addEvent( type, event ) {
						if ( typeof events[ type ] === "undefined" ){
							events[ type ] = {};
						}
						events[ type ][ $( event ).attr( "name" ) ] = {
							"name" : $( event ).attr( "name" ),
							"description" : $( event ).find( "desc" ).text(),
							"deprecated" : $( event ).attr( "deprecated" ),
							"warning" : $( event ).find( ".warning" ).html()
						};
						if ( $( event ).is( "[deprecated]" ) ) {
							events[ type ][ $( event ).attr( "name" ) ][ "deprecated" ] = $( event ).attr( "deprecated" );
						}
					}
				});
				jsonDocs = {
					events: events,
					widgets: widgets
				};
			},
			async: false,
			cache: true,
			headers: {
				'Cache-Control': 'max-age=360000'
			}
		});
	}
	$.mobile.eventLogger = function( userOptions ) {
		var options,
			eventString = "",
			boundEvents = {},
			vmouse = /^v/,
			touch = /^scroll|^swipe|^tap/,
			layout = /^throttled|^update|^orientation/,
			page = /^page/,
			navigation = /^hashchange|^navigate/;


		options = {
			deprecated: false,
			location: "docs.php",
			showAlert: false,
			widgets: {},
			events: {
				vmouse: false,
				touch: false,
				page: false,
				layout: false,
				navigation: false
			}
		};
		getDocs( options.location );

		$.extend( options, userOptions );
		$.each( options.events, function( name, add ) {
			if ( add ) {
				$.each( jsonDocs.events[ name ], function( key, value ) {
					if ( options.deprecated || !value.deprecated ) {
						boundEvents[ value.name ] = {
							description: value.description,
							deprecated: value.deprecated,
							warning: value.warning
						};
					}
				});
			}
		});
		$.each( options.widgets, function( name, add ) {
			if ( add ) {
				$.each( jsonDocs.widgets[ name ], function( key, value ) {
					if ( options.deprecated || !value.deprecated ) {
						boundEvents[ name + value.name ] = {
							description: value.description,
							deprecated: value.deprecated,
							warning: value.warning
						};
					}
				});
			}
		});
		$.each( boundEvents, function( name, value ) {
			eventString += " " + name;
		});
		$( document ).on( eventString , function( event, ui ) {
			var message,
				toPage = "",
				data = $.extend( {}, ui ),
				logData = $.extend( {}, ui );
			if ( ui ) {
				if ( ui.toPage !== undefined ) {
					if ( ui.toPage.jquery !== undefined ) {
						data.toPage = elementString( ui.toPage );
					} else {
						data.toPage = ui.toPage;
					}
				}
				if ( ui.prevPage !== undefined ) {
					if ( ui.prevPage !== undefined && ui.prevPage.jquery !== undefined &&
					ui.prevPage.length > 0 ) {
						data.prevPage = elementString( ui.prevPage );
					} else {
						data.prevPage = ui.prevPage;
					}
				}
			}
			message = {
				event : {
					target : elementString( $( event.target ), true ),
					type : event.type
				},
				description: boundEvents[ event.type ].description,
				deprecated: boundEvents[ event.type ].deprecated,
				warnings: boundEvents[ event.type ].warning,
				ui : data
			};
			console.log({
				eventName: event.type,
				description: boundEvents[ event.type ].description,
				deprecated: boundEvents[ event.type ].deprecated,
				warnings: boundEvents[ event.type ].warning,
				event: event,
				ui: logData
			});
			if ( options.showAlert ) {
				alert(
					JSON.stringify( message, null, 2 )
						.replace( /\\t/g, "    " )
						.replace( /\\n/g, "\n" )
						.replace( /\\\"/g,"\"" )
				);
			}
		});
	};

return $.mobile.eventLogger;

}));
