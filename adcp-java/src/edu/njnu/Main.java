package edu.njnu;

import java.io.*;
import java.nio.charset.StandardCharsets;

public class Main {

    public static void main(String[] args) throws IOException {
        String path = "D:\\zhuomian\\ADCP测试0423\\BMS1_D_002.PD0";
        InputStream inputStream = new FileInputStream(path);
        byte[] bytes = new byte[1024];
        inputStream.read(bytes);
        System.out.println(bytes.length);
    }

    public static byte[] hexStringToBytes(String hex) {
        byte[] bytes = new byte[hex.length() / 2];
        for (int i = 0; i < bytes.length; i++) {
            bytes[i] = (byte) Integer.parseInt(hex.substring(i * 2, i * 2 + 2), 16);
        }
        return bytes;
    }

}
