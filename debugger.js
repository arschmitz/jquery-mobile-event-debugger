(function( $, undefined ) {
	$.ajaxSetup({ cache: true });
	function elementString( ele, omitData ) {
		var element = "<";
		//console.log( ele[ 0 ] );
		if( ele[ 0 ] !== undefined ) {
			element += ele[ 0 ].tagName.toLowerCase();
		}

		if( ele.attr( "id" ) !== undefined ) {
			element += " id=\"" + ele.attr( "id" ) + "\"";
		}
		if( ele.attr( "id" ) !== undefined ) {
			element += " class=\"" + ele.attr( "class" ) + "\"";
		}
		if( ele[ 0 ] !== undefined ) {
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
							"deprecated" : $( this ).is( "[deprecated]" )
						};
					});
				});
				$( docs ).find( "[type='event']" ).each( function() {
					var name = $( this ).attr( "name" )
					if ( page.test( name ) ) {
						addEvent( "page", this );
					} else if( vmouse.test( name ) ) {
						addEvent( "vmouse", this );
					} else if( touch.test( name ) ) {
						addEvent( "touch", this );
					} else if( layout.test( name ) ) {
						addEvent( "layout", this );
					} else if( navigation.test( name ) ) {
						addEvent( "navigation", this );
					} else {
						addEvent( "other", this );
					}
					function addEvent( type, event ) {
						if( typeof events[ type ] === "undefined" ) {
							events[ type ] = {}
						}
						events[ type ][ $( event ).attr( "name" ) ] = {
							"name" : $( event ).attr( "name" ),
							"description" : $( event ).find( "desc" ).text(),
							"deprecated" : $( event ).is( "[deprecated]" )
						};
					}
				});
				jsonDocs = {
					events: events,
					widgets: widgets
				};
				console.log( jsonDocs );
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
		}
		getDocs( options.location );

		$.extend( options, userOptions );
		$.each( options.events, function( name, add ) {
			if( add ) {
				$.each( jsonDocs.events[ name ], function( key, value ) {
					if( options.deprecated || !value.deprecated ) {
						boundEvents[ value.name ] = value.description;
					}
				});
			}
		});
		$.each( options.widgets, function( name, add ) {
			if( add ) {
				$.each( jsonDocs.widgets[ name ], function( key, value ) {
					if( options.deprecated || !value.deprecated ) {
						boundEvents[ name + value.name ] = value.description;
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
				data = $.extend( "", ui );
			if ( ui ) {
				if( ui.toPage !== undefined ) {
					if( ui.toPage.jquery !== undefined ) {
						data.toPage = elementString( ui.toPage );
					} else {
						data.toPage = ui.toPage;
					}
				}
				if( ui.prevPage !== undefined ) {
					if( ui.prevPage !== undefined && ui.prevPage.jquery
						!== undefined && ui.prevPage.length > 0 ) {
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
				description: boundEvents[ event.type ],
				ui : data
			}
			console.log({
				eventName: event.type,
				description: boundEvents[ event.type ],
				event: event,
				ui: ui
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
})( jQuery );
