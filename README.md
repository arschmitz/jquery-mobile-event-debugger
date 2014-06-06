jquery-mobile-event-debugger
============================

A debugging tool for jQuery Mobile Events which ties into the API docs

## Usage

Call the debugger. This should be done immediately after mobile library is loaded or in mobileinit handler.

`$.mobile.eventLogger([options]);`

## Options

### Deprecated ( Default: false ):

Show Deprecated events
### Events ( Type: Object )

An object containing the following properties:

#### Page ( Default: false ):

Show page events ( these are events prefixed with "page" that are not triggered by the page widget )

#### Touch ( Default: false ):

Show touch events

#### Vmouse ( Default: false ):

Show vmouse events

#### layout ( Default: false ):

Show layout events ( updatelayout, orientationchange, throttledresize )

#### navigation ( Default: false ):

Show navigation events ( navigate, hashchange )

### showAlert ( Default: false ):

Show alerts of the events and associated information

This is useful if you want to pause execution to to inspect the current state of the page or if you
are on a mobile device without the ability to view the console log.

### Widgets ( Default: empty object )

An object containing which widgets to log events for. Add a widget name as the prop and
set it to true to show events associated with this widget.
