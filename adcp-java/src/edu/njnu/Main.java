package edu.njnu;

import java.io.*;
import java.nio.charset.StandardCharsets;

public class Main {

    public static void main(String[] args) throws IOException {
        System.loadLibrary("NativeDemo");
        JNITest jniTest = new JNITest();
        System.out.println(jniTest.sum(1, 2));
    }



}
