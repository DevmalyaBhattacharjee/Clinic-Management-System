package com.clinic.management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class ClinicManagementSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(ClinicManagementSystemApplication.class, args);
	}
}