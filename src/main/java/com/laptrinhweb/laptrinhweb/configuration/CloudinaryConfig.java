package com.laptrinhweb.laptrinhweb.configuration;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {
    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dafrwywgo",
                "api_key", "899367673858997",
                "api_secret", "pQonPFbYHR00k6HywVhFSX3TcCk"
        ));
    }
}

