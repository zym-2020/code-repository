package nnu.edu.dynamicdatasources.common.config;

import org.mybatis.spring.SqlSessionFactoryBean;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.sqlite.JDBC;

import javax.sql.DataSource;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 *
 * @Author: Yiming
 * @Date: 2023/05/05/20:16
 * @Description:
 */
@Configuration
@EnableTransactionManagement
public class DataSourceConfig {
    /**
     * 默认基础数据源
     *
     * @return
     */
    @Bean("defaultSource")
    @ConfigurationProperties("spring.datasource")
    public DataSource defaultSource() {
        return DataSourceBuilder.create().build();
    }

    /**
     * 自定义动态数据源
     *
     * @return
     */
    @Bean("dynamicDataSource")
    public DataSource dynamicDataSource() {
        DynamicDataSource dynamicDataSource = new DynamicDataSource();
        Map<Object, Object> dataSourceMap = new HashMap<>();
        dataSourceMap.put("default", defaultSource());
//        DataSourceBuilder dataSourceBuilder = DataSourceBuilder.create();
//        dataSourceBuilder.url("jdbc:sqlite:D:/zhuomian/test1.db");
//        dataSourceBuilder.driverClassName(JDBC.class.getName());
//        DataSource source = dataSourceBuilder.build();
//        dataSourceMap.put("123", source);
        // 默认数据源
        dynamicDataSource.setDefaultDataSource(defaultSource());
        // 动态数据源
        dynamicDataSource.setDataSources(dataSourceMap);
        return dynamicDataSource;
    }

    @Bean
    public SqlSessionFactoryBean sqlSessionFactoryBean() throws IOException {
        SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
        // 配置自定义动态数据源
        sessionFactory.setDataSource(dynamicDataSource());
        // 开启驼峰转下划线设置
        org.apache.ibatis.session.Configuration configuration = new org.apache.ibatis.session.Configuration();
        configuration.setMapUnderscoreToCamelCase(true);
        sessionFactory.setConfiguration(configuration);
        // 实体、Mapper类映射
//        sessionFactory.setTypeAliasesPackage(typeAliasesPackage);
        sessionFactory.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:mapper/*/*.xml"));
        return sessionFactory;
    }



    /**
     * 开启动态数据源@Transactional注解事务管理的支持
     *
     * @return
     */
    @Bean
    public PlatformTransactionManager transactionManager() {
        return new DataSourceTransactionManager(dynamicDataSource());
    }


}
