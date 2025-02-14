package com.hexa.muinus.common.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.oned.Code128Writer;
import com.google.zxing.qrcode.QRCodeWriter;

import javax.imageio.ImageIO;
import javax.imageio.stream.ImageOutputStream;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

public class QRGenerator {

    /**
     * 주어진 데이터를 QR 이미지로 생성하고 Base64 인코딩된 문자열을 반환.
     *
     * @param data 바코드에 포함될 데이터
     * @param width 이미지의 너비
     * @param height 이미지의 높이
     * @return Base64 인코딩된 바코드 이미지 문자열
     * @throws WriterException QR 생성 중 발생한 예외
     * @throws IOException 이미지 변환 중 발생한 예외
     */
    public static String generateQRImage(String data, int width, int height) throws IOException, WriterException {
        BitMatrix bitMatrix = new MultiFormatWriter().encode(data, BarcodeFormat.QR_CODE, width, height);

        //BitMatrix를 BufferedImage로 변환
        BufferedImage QRImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

        //BufferedImage를 바이트 배열로 변환
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(QRImage, "PNG", baos);
        byte[] imageBytes = baos.toByteArray();

        // 바이트 배열을 Base64 문자열로 인코딩
        return Base64.getEncoder().encodeToString(imageBytes);
    }
}
