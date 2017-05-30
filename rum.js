var RUM = (function ( w, d ) {
	'use strict';

	var marks = [];
	var measures = [];

	var startLabel = 'RUM_start';

	// Check for window.performance
	var performance = w.performance || {};

	// Navgiation Start to work out perceived load time
	var navigationStart = Date.now ? Date.now() : +( new Date() );
	if ( performance && performance.timing && performance.timing.navigationStart ) {
		navigationStart = performance.timing.navigationStart;
	}

	// Setup window.performance.now
	function now() {

	    if ( performance ) {
            if ( performance.now ) {
                return performance.now();
            } else {
                if ( performance.webkitNow ) {
                    return performance.now();
                } else {
                    if ( performance.msNow ) {
                        return performance.now();
                    } else {
                        if ( performance.mozNow ) {
                            return performance.now();
                        }
                    }
                }
            }
        }

        // If performance.now is not supported, return current time
        var time = Date.now ? Date.now() : +(new Date());
        return time - navigationStart;

	}

	// Setup window.performance.mark
	function mark( label ) {

		if ( performance ) {
	        if ( performance.mark ) {
	            return performance.mark( label );
	        } else {
	            if ( performance.webkitMark ) {
	                return performance.webkitMark( label );
	            }
	        }
	    }

	    // Push data to marks array for fallback
	    marks.push({
	        name: label,
	        entryType: 'mark',
	        startTime: now(),
	        duration: 0
	    });

	    return;
	}

	// Setup window.performance.measure (setup timestamp between two marks)
	function measure( label, startMark, endMark ) {

		if ( typeof( startMark ) === 'undefined' && findMark( startLabel ) ) {
            startMark = startLabel;
        }

        // If performance interface exists with measure then use that
        if ( performance ) {
            if ( performance.measure ) {
                if ( startMark ) {
                    if ( endMark ) {
                        return performance.measure( label, startMark, endMark );
                    } else {
                        return performance.measure( label, startMark );
                    }
                } else {
                    return performance.measure( label );
                }
            } else {
                if ( performance.webkitMeasure ) {
                    return performance.webkitMeasure( label, startMark, endMark );
                }
            }
        }

        // If measure isn't supported then work it out manually from startMark and endMark
        var startTiming = 0;
        var now = now();

        // Grabbing startMark timing for calculation
        if ( startMark ) {
            var sMark = findMark( startMark );
            if ( sMark ) {
                startTiming = sMark.startTime;
            } else {
                if ( performance && performance.timing && performance.timing[ startMark ] ) {
                    startTiming = performance.timing[ startMark ] - performance.timing.navigationStart;
                } else {
                    return;
                }
            }
        }

        // Grabbing endMark timing for calculation
		if ( endMark ) {
            var eMark = findMark( endMark );
            if ( eMark ) {
                now = eMark.startTime;
            } else {
                if ( performance && performance.timing && performance.timing[ endMark ]) {
                    now = performance.timing[ endMark ] - performance.timing.navigationStart;
                } else {
                    return;
                }
            }
        }

        // Push data to measures array for fallback
	    measures.push({
	        name: label,
	        entryType: 'measure',
	        startTime: startTiming,
	        duration: ( now - startTiming )
        });

        return;

	}

	// Search for a particular mark
	function findMark( label ) {

        return getMark( label, listMarks() );

    }

    // Return single mark entry by name
    function getMark( label, markArr ) {

    	for ( var i = markArr.length - 1; i >= 0; i-- ) {
            var n = markArr[i];
            if ( label === n.name ) {
                return n;
            }
        }
        return undefined;

    }

    // Uses getEntriesByType to return a list of performance marks
    function listMarks() {

    	if ( performance ) {
            if ( performance.getEntriesByType ) {
                return performance.getEntriesByType( 'mark' );
            } else {
                if ( performance.webkitGetEntriesByType ) {
                    return performance.webkitGetEntriesByType( 'mark' );
                }
            }
        }
        return marks;

    }

	// Get Omniture client ID to link user browser data to RUM metrics
	function getClientId() {

		var aID = d.cookie.match( '(^|;)\\s*AMCV_2C7336C753C676BA0A490D4B%40AdobeOrg\\s*=\\s*([^;]+)' );
		return aID ? decodeURIComponent(aID.pop()).split('|')[4] : '';

	}

	// Return Marks in format for analyitcs tools
	function sendMarks() {

		var aID = getClientId(),
			markArr = listMarks();

		// If no Client ID or Analytics return
		if ( !aID || !( 'ga' in w ) ) {
			return;
		}

		// Marks to be named: 'css_load_tmgchannels' -> category_variable_label
		for ( var i = markArr.length - 1; i >= 0; i-- ) {
			var m = markArr[i]
			s = m.name.split('_'),
				c = s[0],
				v = s[1],
				l = s[2],
				t = Math.round(m.startTime);

			if ( c && v && l && t ) {
				ga( 'send', {
					hitType: 'timing',
					timingCategory: c,
					timingVar: v,
					timingValue: t,
					timingLabel: l
				} );
			}
		}

	}

	// Send marks on beforeunload
	w.addEventListener( 'beforeunload', sendMarks );

    // Make methods accessible externally
    return {
    	now: now,
	    mark: mark,
	    measure: measure,
	    marks: marks,
	    measures: measures
    };

}( window, document ));
