package com.heritage.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class HeritagePlatformApplication {
    public static void main(String[] args) {
        SpringApplication.run(HeritagePlatformApplication.class, args);
    }
}
