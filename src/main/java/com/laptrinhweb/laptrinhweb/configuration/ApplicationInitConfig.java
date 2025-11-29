package com.laptrinhweb.laptrinhweb.configuration;

import com.laptrinhweb.laptrinhweb.entity.Role;
import com.laptrinhweb.laptrinhweb.entity.UserEntity;
import com.laptrinhweb.laptrinhweb.repository.RoleRepository;
import com.laptrinhweb.laptrinhweb.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import java.util.HashSet;

@Configuration
@EnableWebMvc
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;

    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository) {
        log.info("Initializing application.....");
        return args -> {
            if (userRepository.findByUserName("admin").isEmpty()) {
                Role userRole = roleRepository.save(Role.builder()
                        .name("USER")
                        .description("User role")
                        .build());

                Role adminRole = roleRepository.save(Role.builder()
                        .name("ADMIN")
                        .description("Admin role")
                        .build());

                var roles = new HashSet<Role>();
                roles.add(userRole);
                roles.add(adminRole);

                UserEntity user = UserEntity.builder()
                        .userName("admin")
                        .password(passwordEncoder.encode("admin"))
                        .email("admin@example.com")
                        .fullName("admin")
                        .roles(roles)
                        .build();

                userRepository.save(user);
                log.warn("admin user has been created with default password: admin, please change it");
            }
            log.info("Application initialization completed .....");
        };
    }
}

