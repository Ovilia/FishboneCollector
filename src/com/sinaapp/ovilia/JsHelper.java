package com.sinaapp.ovilia;

public class JsHelper {
	private MainActivity activity;
	
	public JsHelper(MainActivity act) {
		activity = act;
	}
	
	public void goToHtml(String url) {
		activity.loadUrl("file:///android_asset/www/" + url);
	}
}
