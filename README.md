# RUM

h2. Usage

Include Google Analytics (enable Beacon mode)
Include RUM JS on the page.


```<script>
	RUM.mark( 'css_load_tmgchannels' );
</script>```

h4. Notes

* Marks to be named: `css_load_tmgchannels` -> category_variable_label
* getClientId() currently reads an Omniture cookie. This can be updated to generate random client ID.
* Supports marks and measures. Sends Marks to Google Analytics.