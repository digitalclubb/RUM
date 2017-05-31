# RUM

A User Timing polyfill that will enable tracking in Google Analytics of custom timing events.

## Usage

* Include Google Analytics (enable Beacon mode)
* Include RUM JS on the page.
* Include RUM marks where applicable


```html
<script>
	RUM.mark( 'css_load_tmgchannels' );
</script>
```

#### Notes

* Marks to be named: `css_load_tmgchannels` -> category_variable_label
* `getClientId()` currently reads an Omniture cookie. This can be updated to generate random client ID.
* Supports marks and measures. Sends Marks to Google Analytics with `beforeunload` event.