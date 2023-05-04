package nnu.edu.dynamicdatasources;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class DynamicDataSourcesApplication {

    public static void main(String[] args) {
        SpringApplication.run(DynamicDataSourcesApplication.class, args);
    }

}
