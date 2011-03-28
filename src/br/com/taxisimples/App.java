package br.com.taxisimples;

import com.phonegap.DroidGap;

import android.app.Activity;
import android.os.Bundle;

public class App extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.loadUrl("http://192.168.0.190:8080/client/");
    }
}