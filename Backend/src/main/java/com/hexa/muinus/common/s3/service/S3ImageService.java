package com.hexa.muinus.common.s3.service;

import com.hexa.muinus.common.exception.MuinusException;
import com.hexa.muinus.common.exception.S3ErrorCode;
import com.hexa.muinus.common.s3.Base64DecodedMultipartFile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLDecoder;
import java.util.*;

@Slf4j
@RequiredArgsConstructor
@Component
public class S3ImageService {

    private final S3Client s3Client;

    @Value("${spring.cloud.aws.s3.bucketName}")
    private String bucketName;

    public String upload(MultipartFile image) {
        if (image.isEmpty() || Objects.isNull(image.getOriginalFilename())) {
            throw new MuinusException(S3ErrorCode.EMPTY_FILE_EXCEPTION);
        }
        return this.uploadImage(image);
    }

    private String uploadImage(MultipartFile image) {
        this.validateImageFileExtention(image.getOriginalFilename());
        try {
            return this.uploadImageToS3(image);
        } catch (IOException e) {
            throw new MuinusException(S3ErrorCode.IO_EXCEPTION_ON_IMAGE_UPLOAD);
        }
    }

    private void validateImageFileExtention(String filename) {
        int lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex == -1) {
            throw new MuinusException(S3ErrorCode.EMPTY_FILE_EXCEPTION);
        }

        String extension = filename.substring(lastDotIndex + 1).toLowerCase();
        List<String> allowedExtensionList = Arrays.asList("jpg", "jpeg", "png", "gif");

        if (!allowedExtensionList.contains(extension)) {
            throw new MuinusException(S3ErrorCode.INVALID_FILE_EXTENTION);
        }
    }

    private String uploadImageToS3(MultipartFile image) throws IOException {
        String originalFilename = image.getOriginalFilename(); // 원본 파일 명
        String extension = originalFilename.substring(originalFilename.lastIndexOf(".")); // 확장자 명

        String s3FileName = UUID.randomUUID().toString().substring(0, 10) + originalFilename; // 변경된 파일 명

        byte[] bytes = image.getBytes();

        try (ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(bytes)) {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3FileName)
//                    .acl("public-read")
                    .contentType("image/" + extension)
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(bytes)); // S3에 이미지 업로드
        } catch (Exception e) {
            throw new MuinusException(S3ErrorCode.PUT_OBJECT_EXCEPTION);
        }

        return s3Client.utilities().getUrl(builder -> builder.bucket(bucketName).key(s3FileName)).toExternalForm();
    }

    public void deleteImageFromS3(String imageAddress) {
        String key = getKeyFromImageAddress(imageAddress);
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();
            s3Client.deleteObject(deleteObjectRequest);
        } catch (Exception e) {
            throw new MuinusException(S3ErrorCode.IO_EXCEPTION_ON_IMAGE_DELETE);
        }
    }

    private String getKeyFromImageAddress(String imageAddress) {
        try {
            URL url = new URL(imageAddress);
            String decodingKey = URLDecoder.decode(url.getPath(), "UTF-8");
            return decodingKey.substring(1); // 맨 앞의 '/' 제거
        } catch (MalformedURLException | UnsupportedEncodingException e) {
            throw new MuinusException(S3ErrorCode.IO_EXCEPTION_ON_IMAGE_DELETE);
        }
    }


    public String Base64toImageUrl(String image) {
        String imageUrl = image;
        if(!image.equals("")) {
            String[] parts = image.split(",");
            String base64Data = parts.length > 1 ? parts[1] : parts[0];

            // Base64 문자열을 바이트 배열로 변환
            byte[] imageBytes = Base64.getDecoder().decode(base64Data);

            MultipartFile multipartFile = new Base64DecodedMultipartFile(
                    imageBytes,
                    UUID.randomUUID().toString() + ".jpg",
                    "image/png"
            );

            imageUrl = upload(multipartFile);
        }
        return imageUrl;
    }
}
